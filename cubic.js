(function(){
  const els = {
    a: document.getElementById('a'),
    b: document.getElementById('b'),
    c: document.getElementById('c'),
    d: document.getElementById('d'),
    validation: document.getElementById('validation'),
    disc: document.getElementById('disc'),
    roots: document.getElementById('roots'),
    steps: document.getElementById('steps'),
    plot: document.getElementById('plot')
  };

  function fmt(v){
    if (!Number.isFinite(v)) return '–';
    if (Math.abs(v) < 1e-6 || Math.abs(v) >= 1e6) return v.toExponential(6);
    return v.toFixed(6);
  }

  // Solve ax^3 + bx^2 + cx + d = 0 (real roots only)
  function cubicRealRoots(a,b,c,d){
    // Convert to depressed cubic t^3 + pt + q = 0 via x = t - b/(3a)
    const inva = 1/a;
    const bb = b*b;
    const p = (3*a*c - bb) / (3*a*a);
    const q = (2*bb*b - 9*a*b*c + 27*a*a*d) / (27*a*a*a);
    const shift = -b / (3*a);

    const disc = (q*q/4) + (p*p*p/27); // discriminant of depressed cubic
    let roots = [];
    if (disc > 0){
      const sqrtDisc = Math.sqrt(disc);
      const u = Math.cbrt(-q/2 + sqrtDisc);
      const v = Math.cbrt(-q/2 - sqrtDisc);
      const t1 = u + v;
      roots = [ t1 + shift ];
    } else if (Math.abs(disc) < 1e-14){
      const u = Math.cbrt(-q/2);
      const t1 = 2*u;
      const t2 = -u;
      roots = [ t1 + shift, t2 + shift ]; // t2 is double root
    } else {
      // Three real roots: use trigonometric solution
      const r = Math.sqrt(-p*p*p/27);
      const phi = Math.acos((-q/2) / r);
      const m = 2 * Math.sqrt(-p/3);
      const t1 = m * Math.cos(phi/3);
      const t2 = m * Math.cos((phi + 2*Math.PI)/3);
      const t3 = m * Math.cos((phi + 4*Math.PI)/3);
      roots = [ t1 + shift, t2 + shift, t3 + shift ];
    }
    return { disc, roots: roots.sort((x,y)=>x-y) };
  }

  // --- Interactive Plot helpers ---
  function ensurePlotly(cb){
    if (window.Plotly && typeof Plotly.newPlot === 'function') return cb();
    const urls = [
      'https://cdn.plot.ly/plotly-latest.min.js',
      'https://cdn.jsdelivr.net/npm/plotly.js-dist-min@2.35.2/plotly.min.js',
      'https://unpkg.com/plotly.js-dist-min@2.35.2/plotly.min.js'
    ];
    let i = 0;
    const tryLoad = () => {
      if (i >= urls.length) return;
      const s = document.createElement('script');
      s.src = urls[i++]; s.async = true;
      s.onload = () => cb();
      s.onerror = () => tryLoad();
      document.head.appendChild(s);
    };
    tryLoad();
  }

  function pickRange(a,b,c,d, roots){
    let center = 0;
    if (roots && roots.length){
      center = roots.reduce((s,v)=>s+v, 0)/roots.length;
    }
    const span = Math.max(5, Math.abs(center) + 5);
    return { xmin: center - span, xmax: center + span };
  }

  function genSeries(a,b,c,d,xmin,xmax,n=500){
    const xs=[], ys=[];
    const step = (xmax - xmin)/(n-1);
    for (let i=0;i<n;i++){
      const x = xmin + step*i;
      xs.push(x);
      ys.push(((a*x + b)*x + c)*x + d);
    }
    return {x:xs,y:ys};
  }

  function renderPlot(a,b,c,d, roots){
    if (!els.plot) return;
    const { xmin, xmax } = pickRange(a,b,c,d, roots);
    const series = genSeries(a,b,c,d,xmin,xmax);
    const layout = {
      paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor:'rgba(0,0,0,0)',
      margin: { l: 50, r: 10, t: 10, b: 40 },
      xaxis: { gridcolor: 'rgba(0,0,0,0.15)' },
      yaxis: { gridcolor: 'rgba(0,0,0,0.15)' },
      hovermode: 'x unified', hoverdistance: -1, spikedistance: -1,
      xaxis_spikemode:'toaxis+across', xaxis_spikesnap:'cursor', xaxis_spikecolor:'#888', xaxis_spikethickness:1,
      yaxis_spikemode:'toaxis+across', yaxis_spikesnap:'cursor', yaxis_spikecolor:'#888', yaxis_spikethickness:1,
      legend: { orientation:'h' }
    };
    const traces = [
      { x: series.x, y: series.y, type: 'scatter', mode:'lines', name:'y = ax^3+bx^2+cx+d', hovertemplate:'x=%{x:.6f}<br>f(x)=%{y:.6f}<extra></extra>' }
    ];
    if (roots && roots.length){
      traces.push({ x: roots, y: roots.map(r=>0), type:'scatter', mode:'markers', name:'real roots', marker:{size:9}, hovertemplate:'x=%{x:.6f}<br>f(x)=0<extra></extra>' });
    }
    try { els.plot.textContent = 'Rendering…'; } catch {}
    let usedFallback = true; // show fallback immediately for instant feedback
    renderPlotLite(series, roots, xmin, xmax);
    ensurePlotly(() => {
      try {
        usedFallback = false;
        Plotly.newPlot(els.plot, traces, layout, { displayModeBar:false, responsive:true, scrollZoom:true });
      } catch (e) {
        if (!usedFallback) renderPlotLite(series, roots, xmin, xmax);
        if (els.validation) els.validation.textContent = 'Plot error: ' + (e && e.message ? e.message : String(e));
      }
    });
  }

  function renderPlotLite(series, roots, xmin, xmax){
    const W = Math.max(els.plot.clientWidth || 600, 300);
    const H = Math.max(els.plot.clientHeight || 400, 300);
    const pad = { l: 50, r: 10, t: 10, b: 40 };
    const iw = W - pad.l - pad.r;
    const ih = H - pad.t - pad.b;
    const css = getComputedStyle(document.documentElement);
    const ink = (css.getPropertyValue('--ink').trim() || '#e6edf3');
    const grid = (css.getPropertyValue('--grid').trim() || 'rgba(0,0,0,0.1)');
    const yVals = series.y.slice(); yVals.push(0);
    let ymin = Math.min(...yVals), ymax = Math.max(...yVals);
    if (!isFinite(ymin) || !isFinite(ymax) || ymin===ymax){ ymin=-10; ymax=10; }
    const padY = 0.1*(ymax-ymin||1); ymin-=padY; ymax+=padY;
    const sx = (x)=> pad.l + (x - xmin)/(xmax - xmin) * iw;
    const sy = (y)=> pad.t + (1 - (y - ymin)/(ymax - ymin)) * ih;
    let path='';
    for (let i=0;i<series.x.length;i++){
      const X = sx(series.x[i]), Y = sy(series.y[i]);
      path += (i? ' L ':' M ') + X.toFixed(2)+' '+Y.toFixed(2);
    }
    els.plot.innerHTML = '';
    const svg = [`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="cubic plot">`,
      `<rect x="0" y="0" width="${W}" height="${H}" fill="transparent" stroke="${grid}"/>`,
      `<line x1="${pad.l}" y1="${sy(0)}" x2="${W-pad.r}" y2="${sy(0)}" stroke="${grid}"/>`,
      `<line x1="${sx(0)}" y1="${pad.t}" x2="${sx(0)}" y2="${H-pad.b}" stroke="${grid}"/>`,
      `<text x="${W/2}" y="${H-8}" text-anchor="middle" fill="${ink}" font-family="Inter" font-size="12">x</text>`,
      `<text x="12" y="${pad.t+12}" fill="${ink}" font-family="Inter" font-size="12">y</text>`,
      `<path d="${path}" fill="none" stroke="#7c93ff" stroke-width="2"/>`,
      roots && roots.length ? roots.map(r=>`<circle cx="${sx(r)}" cy="${sy(0)}" r="4" fill="#4ade80"/>`).join('') : ''
    ,`</svg>`];
    els.plot.innerHTML = svg.join('\n');
  }

  function recalc(){
    const a = Number(els.a.value);
    const b = Number(els.b.value);
    const c = Number(els.c.value);
    const d = Number(els.d.value);
    if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(c) || !Number.isFinite(d)){
      els.validation.textContent = 'Enter valid numeric coefficients a, b, c, d.';
      return;
    }
    if (a === 0){
      els.validation.textContent = 'a must not be 0 for a cubic.';
      return;
    }
    els.validation.textContent = '';

    const { disc, roots } = cubicRealRoots(a,b,c,d);
    els.disc.textContent = fmt(disc);
    els.roots.textContent = roots.map(fmt).join(', ');

    const items = [];
    items.push('Use depressed cubic via x = t - b/(3a).');
    items.push('Solve t^3 + pt + q = 0 using Cardano/trigonometric method depending on discriminant.');
    if (disc > 0) items.push('One real root (two complex).');
    else if (Math.abs(disc) < 1e-14) items.push('Multiple real roots (at least a double root).');
    else items.push('Three distinct real roots.');

    els.steps.innerHTML = '';
    for (const t of items){
      const div = document.createElement('div');
      div.textContent = '• ' + t;
      els.steps.appendChild(div);
    }

    renderPlot(a,b,c,d, roots);
  }

  els.a.addEventListener('input', recalc);
  els.b.addEventListener('input', recalc);
  els.c.addEventListener('input', recalc);
  els.d.addEventListener('input', recalc);
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', recalc);
  } else { recalc(); }
})();
