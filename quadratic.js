(function(){
  const els = {
    a: document.getElementById('a'),
    b: document.getElementById('b'),
    c: document.getElementById('c'),
    validation: document.getElementById('validation'),
    disc: document.getElementById('disc'),
    roots: document.getElementById('roots'),
    vertex: document.getElementById('vertex'),
    steps: document.getElementById('steps'),
    plot: document.getElementById('plot')
  };

  function fmt(v){
    if (!Number.isFinite(v)) return '–';
    if (Math.abs(v) < 1e-6 || Math.abs(v) >= 1e6) return v.toExponential(6);
    return v.toFixed(6);
  }

  function recalc(){
    const a = Number(els.a.value);
    const b = Number(els.b.value);
    const c = Number(els.c.value);
    if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(c)){
      els.validation.textContent = 'Enter valid numeric coefficients a, b, c.';
      return;
    }
    if (a === 0){
      els.validation.textContent = 'a must not be 0 for a quadratic.';
      return;
    }
    els.validation.textContent = '';

    const D = b*b - 4*a*c;
    els.disc.textContent = fmt(D);

    const vx = -b/(2*a);
    const vy = a*vx*vx + b*vx + c;
    els.vertex.textContent = `(${fmt(vx)}, ${fmt(vy)})`;

    const items = [];
    items.push(`Δ = b^2 - 4ac = ${fmt(b*b)} - 4·${fmt(a)}·${fmt(c)} = ${fmt(D)}`);
    items.push(`Vertex x = -b/(2a) = ${fmt(-b)}/${fmt(2*a)} = ${fmt(vx)}`);
    items.push(`Vertex y = f(${fmt(vx)}) = ${fmt(vy)}`);

    if (D > 0){
      const r1 = (-b - Math.sqrt(D))/(2*a);
      const r2 = (-b + Math.sqrt(D))/(2*a);
      els.roots.textContent = `${fmt(r1)}, ${fmt(r2)}`;
      items.push(`Two real roots: x = (-b ± √Δ) / (2a)`);
    } else if (D === 0){
      const r = -b/(2*a);
      els.roots.textContent = `${fmt(r)} (double)`;
      items.push('One real double root: x = -b/(2a)');
    } else {
      const real = -b/(2*a);
      const imag = Math.sqrt(-D)/(2*a);
      els.roots.textContent = `${fmt(real)} ± ${fmt(imag)}i`;
      items.push('Complex conjugate roots: x = -b/(2a) ± i·√(-Δ)/(2a)');
    }

    els.steps.innerHTML = '';
    for (const t of items){
      const div = document.createElement('div');
      div.textContent = '• ' + t;
      els.steps.appendChild(div);
    }

    renderPlot(a,b,c,vx,vy);
  }

  // --- Interactive Plot ---
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

  function genSeries(a,b,c,xmin,xmax,n=400){
    const xs = [], ys = [];
    const step = (xmax - xmin)/(n-1);
    for (let i=0;i<n;i++){
      const x = xmin + step*i;
      xs.push(x);
      ys.push(a*x*x + b*x + c);
    }
    return {x:xs,y:ys};
  }

  function pickRange(a,b,c,vx){
    const span = Math.max(5, Math.abs(vx) + 5);
    return { xmin: vx - span, xmax: vx + span };
  }

  function renderPlot(a,b,c,vx,vy){
    if (!els.plot) return;
    const { xmin, xmax } = pickRange(a,b,c,vx);
    const series = genSeries(a,b,c,xmin,xmax);
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
      { x: series.x, y: series.y, type: 'scatter', mode:'lines', name:'y = ax^2+bx+c', hovertemplate:'x=%{x:.6f}<br>f(x)=%{y:.6f}<extra></extra>' },
      { x: [vx], y:[vy], type:'scatter', mode:'markers', name:'vertex', marker:{size:9}, hovertemplate:'vertex<br>x=%{x:.6f}<br>y=%{y:.6f}<extra></extra>'}
    ];
    try { els.plot.textContent = 'Rendering…'; } catch {}
    let usedFallback = true; // show fallback immediately for instant feedback
    renderPlotLite(series, vx, vy, xmin, xmax);
    ensurePlotly(() => {
      try {
        usedFallback = false;
        Plotly.newPlot(els.plot, traces, layout, { displayModeBar:false, responsive:true, scrollZoom:true });
      } catch (e) {
        if (!usedFallback) renderPlotLite(series, vx, vy, xmin, xmax);
        if (els.validation) els.validation.textContent = 'Plot error: ' + (e && e.message ? e.message : String(e));
      }
    });
  }

  function renderPlotLite(series, vx, vy, xmin, xmax){
    const W = Math.max(els.plot.clientWidth || 600, 300);
    const H = Math.max(els.plot.clientHeight || 400, 300);
    const pad = { l: 50, r: 10, t: 10, b: 40 };
    const iw = W - pad.l - pad.r;
    const ih = H - pad.t - pad.b;
    const css = getComputedStyle(document.documentElement);
    const ink = (css.getPropertyValue('--ink').trim() || '#e6edf3');
    const grid = (css.getPropertyValue('--grid').trim() || 'rgba(0,0,0,0.1)');
    const yVals = series.y.slice(); yVals.push(vy);
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
    const svg = [`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="quadratic plot">`,
      `<rect x="0" y="0" width="${W}" height="${H}" fill="transparent" stroke="${grid}"/>`,
      `<line x1="${pad.l}" y1="${sy(0)}" x2="${W-pad.r}" y2="${sy(0)}" stroke="${grid}"/>`,
      `<line x1="${sx(0)}" y1="${pad.t}" x2="${sx(0)}" y2="${H-pad.b}" stroke="${grid}"/>`,
      `<text x="${W/2}" y="${H-8}" text-anchor="middle" fill="${ink}" font-family="Inter" font-size="12">x</text>`,
      `<text x="12" y="${pad.t+12}" fill="${ink}" font-family="Inter" font-size="12">y</text>`,
      `<path d="${path}" fill="none" stroke="#7c93ff" stroke-width="2"/>`,
      `<circle cx="${sx(vx)}" cy="${sy(vy)}" r="4" fill="#4ade80"/>`,
    `</svg>`];
    els.plot.innerHTML = svg.join('\n');
  }

  els.a.addEventListener('input', recalc);
  els.b.addEventListener('input', recalc);
  els.c.addEventListener('input', recalc);
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', recalc);
  } else { recalc(); }
})();
