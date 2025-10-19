(function() {
  let plotState = null;
  const els = {
    base: document.getElementById('base'),
    number: document.getElementById('number'),
    validation: document.getElementById('validation'),
    logbx: document.getElementById('logbx'),
    lnx: document.getElementById('lnx'),
    log10x: document.getElementById('log10x'),
    relations: document.getElementById('relations-math'),
    steps: document.getElementById('steps'),
    plot: document.getElementById('plot'),
    toggleLn: document.getElementById('toggle-ln'),
    toggleLog10: document.getElementById('toggle-log10'),
    toggleLogb: document.getElementById('toggle-logb'),
    togglePlotly: document.getElementById('toggle-plotly'),
    autoX: document.getElementById('auto-x'),
    xMin: document.getElementById('x-min'),
    xMax: document.getElementById('x-max'),
    autoY: document.getElementById('auto-y'),
    yMin: document.getElementById('y-min'),
    yMax: document.getElementById('y-max'),
    btnReset: document.getElementById('btn-reset'),
    btnFit: document.getElementById('btn-fit')
  };

  const STORE_KEY = 'log_calc_settings_v1';

  function saveSettings(){
    try {
      const data = {
        base: els.base.value,
        number: els.number.value,
        toggleLn: !!(els.toggleLn && els.toggleLn.checked),
        toggleLog10: !!(els.toggleLog10 && els.toggleLog10.checked),
        toggleLogb: !!(els.toggleLogb && els.toggleLogb.checked),
        togglePlotly: !!(els.togglePlotly && els.togglePlotly.checked),
        autoX: !!(els.autoX && els.autoX.checked),
        xMin: els.xMin ? els.xMin.value : '',
        xMax: els.xMax ? els.xMax.value : '',
        autoY: !!(els.autoY && els.autoY.checked),
        yMin: els.yMin ? els.yMin.value : '',
        yMax: els.yMax ? els.yMax.value : ''
      };
      localStorage.setItem(STORE_KEY, JSON.stringify(data));
    } catch {}
  }

  function loadSettings(){
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return;
      const s = JSON.parse(raw);
      if (s.base != null) els.base.value = s.base;
      if (s.number != null) els.number.value = s.number;
      if (els.toggleLn && typeof s.toggleLn === 'boolean') els.toggleLn.checked = s.toggleLn;
      if (els.toggleLog10 && typeof s.toggleLog10 === 'boolean') els.toggleLog10.checked = s.toggleLog10;
      if (els.toggleLogb && typeof s.toggleLogb === 'boolean') els.toggleLogb.checked = s.toggleLogb;
      if (els.togglePlotly && typeof s.togglePlotly === 'boolean') els.togglePlotly.checked = s.togglePlotly;
      if (els.autoX && typeof s.autoX === 'boolean') els.autoX.checked = s.autoX;
      if (els.xMin && s.xMin != null) els.xMin.value = s.xMin;
      if (els.xMax && s.xMax != null) els.xMax.value = s.xMax;
      if (els.autoY && typeof s.autoY === 'boolean') els.autoY.checked = s.autoY;
      if (els.yMin && s.yMin != null) els.yMin.value = s.yMin;
      if (els.yMax && s.yMax != null) els.yMax.value = s.yMax;
    } catch {}
  }

  function parseInputs() {
    const rawB = (els.base.value || '').trim();
    const rawX = (els.number.value || '').trim();
    const b = rawB === '' ? NaN : Number(rawB);
    const x = rawX === '' ? NaN : Number(rawX);
    return { b, x };
  }

  function validate(b, x) {
    let msg = [];
    if (!isFinite(b)) msg.push('Base b must be a finite number.');
    if (!isFinite(x)) msg.push('Number x must be a finite number.');
    if (b <= 0) msg.push('Base b must be > 0.');
    if (b === 1) msg.push('Base b must not equal 1.');
    if (x <= 0) msg.push('Number x must be > 0.');
    els.validation.textContent = msg.join(' ');
    return msg.length === 0;
  }

  function fmt(v) {
    if (!isFinite(v)) return '–';
    if (Math.abs(v) < 1e-6 || Math.abs(v) >= 1e6) return v.toExponential(6);
    return v.toFixed(6);
  }

  function safeLog10(y) {
    if (typeof Math.log10 === 'function') return Math.log10(y);
    return Math.log(y) / Math.LN10;
  }

  function updateValues(b, x) {
    const lnX = Math.log(x);
    const log10X = safeLog10(x);
    const logbX = lnX / Math.log(b);

    els.lnx.textContent = fmt(lnX);
    els.log10x.textContent = fmt(log10X);
    els.logbx.textContent = fmt(logbX);

    return { lnX, log10X, logbX };
  }

  function typeset() {
    if (window.MathJax && typeof MathJax.typesetPromise === 'function') {
      MathJax.typesetPromise();
    }
  }

  function updateRelations(b, x, vals) {
    const { logbX } = vals;
    const content = `\\[\\begin{aligned}
      &\\textbf{Change of base:}\\\\
      &\\quad \\log_b(x) = \\frac{\\ln(x)}{\\ln(b)} = \\frac{\\log_{10}(x)}{\\log_{10}(b)} \\\\
      &\\textbf{Inverse exponential:}\\\\
      &\\quad b^{\\log_b(x)} = x, \quad \\log_b(b^y) = y \\\\
      &\\textbf{Product/Quotient/Power:}\\\\
      &\\quad \\log_b(xy) = \\log_b(x) + \\log_b(y) \\\\
      &\\quad \\log_b\\!\\left(\\frac{x}{y}\\right) = \\log_b(x) - \\log_b(y) \\\\
      &\\quad \\log_b(x^k) = k\\,\\log_b(x) \\\\
      &\\textbf{For inputs:}\\\\
      &\\quad b = ${fmt(b)}, \quad x = ${fmt(x)}, \quad \\log_b(x) = ${fmt(logbX)}
    \\end{aligned}\\]`;
    els.relations.innerHTML = content;
    typeset();
  }

  function primeFactors(n) {
    const res = [];
    let x = Math.abs(n);
    if (!Number.isFinite(x) || x < 2 || Math.floor(x) !== x) return [];
    while (x % 2 === 0) { res.push(2); x /= 2; }
    let f = 3;
    while (f * f <= x) {
      while (x % f === 0) { res.push(f); x /= f; }
      f += 2;
    }
    if (x > 1) res.push(x);
    return res;
  }

  function multiplicativePath(b, x) {
    // Try to express x approximately as b^k, or decompose nearby power
    const k = Math.log(x) / Math.log(b);
    const kRound = Math.round(k);
    const bPow = Math.pow(b, kRound);
    return { k, kRound, bPow };
  }

  function updateSteps(b, x, vals) {
    const { logbX } = vals;
    const items = [];

    // If integers, show prime factorization
    if (Number.isInteger(b) && Number.isInteger(x) && b > 1 && x > 1) {
      const bf = primeFactors(b);
      const xf = primeFactors(x);
      if (bf.length || xf.length) {
        items.push(`Prime factors: b = ${b} = ${bf.length ? bf.join(' · ') : 'prime'}, x = ${x} = ${xf.length ? xf.join(' · ') : 'prime'}`);
      }
      // Check if x is a power of b
      const k = Math.log(x) / Math.log(b);
      const kInt = Math.round(k);
      if (Math.abs(k - kInt) < 1e-10) {
        items.push(`Exact power: x = b^${kInt} = ${b}^${kInt} = ${Math.pow(b, kInt)}`);
      }
    }

    // General multiplicative intuition
    const { k, kRound, bPow } = multiplicativePath(b, x);
    items.push(`Change of base: log_b(x) = ln(x)/ln(b) = ${fmt(logbX)}`);
    items.push(`Exponential relation: x = b^{log_b(x)} ⇒ ${fmt(x)} = ${fmt(b)}^{${fmt(logbX)}}`);
    items.push(`Nearest integer power: k ≈ ${fmt(k)} ⇒ round(k) = ${kRound}, b^{round(k)} = ${fmt(bPow)}`);
    if (bPow !== 0) {
      const ratio = x / bPow;
      if (isFinite(ratio)) {
        items.push(`Refinement: x = b^{${kRound}} · ${fmt(ratio)}`);
      }
    }

    els.steps.innerHTML = '';
    for (const t of items) {
      const div = document.createElement('div');
      div.textContent = '• ' + t;
      els.steps.appendChild(div);
    }
  }

  function defaultXRange(x){
    // Base default: span several decades around x for clear curvature
    const lg = Math.log10(x);
    const xmin = Math.pow(10, Math.floor(lg) - 2);
    const xmax = Math.pow(10, Math.ceil(lg) + 2);
    return { xmin, xmax };
  }

  function computeDomain(b, x) {
    // Manual X range
    if (els.autoX && !els.autoX.checked) {
      const xmin = Number(els.xMin.value);
      const xmax = Number(els.xMax.value);
      if (isFinite(xmin) && isFinite(xmax) && xmin > 0 && xmax > xmin) {
        return { xmin, xmax };
      }
    }
    // Auto X range
    return defaultXRange(x);
  }

  function computeYRange(series, vals){
    // Manual Y range
    if (els.autoY && !els.autoY.checked) {
      const ymin = Number(els.yMin.value);
      const ymax = Number(els.yMax.value);
      if (isFinite(ymin) && isFinite(ymax) && ymax > ymin) {
        return { ymin, ymax };
      }
    }
    // Auto from visible data
    const collect = (s) => s.y.filter(v => v!=null && isFinite(v));
    let ys = [];
    if (els.toggleLn.checked) ys = ys.concat(collect(series.ln));
    if (els.toggleLog10.checked) ys = ys.concat(collect(series.log10));
    if (els.toggleLogb.checked) ys = ys.concat(collect(series.logb));
    ys.push(vals.lnX, vals.log10X, vals.logbX);
    let ymin = Math.min(...ys);
    let ymax = Math.max(...ys);
    if (!isFinite(ymin) || !isFinite(ymax) || ymin === ymax){ ymin = -4; ymax = 4; }
    const pad = 0.15 * (ymax - ymin || 1);
    return { ymin: ymin - pad, ymax: ymax + pad };
  }

  function enableRangeInputs() {
    const manualX = els.autoX && !els.autoX.checked;
    const manualY = els.autoY && !els.autoY.checked;
    if (els.xMin) els.xMin.disabled = !manualX;
    if (els.xMax) els.xMax.disabled = !manualX;
    if (els.yMin) els.yMin.disabled = !manualY;
    if (els.yMax) els.yMax.disabled = !manualY;
  }

  function fitRangesToData(b, x, vals){
    const { xmin, xmax } = defaultXRange(x);
    const lnSeries = genSeries((t) => Math.log(t), xmin, xmax);
    const log10Series = genSeries((t) => safeLog10(t), xmin, xmax);
    const logbSeries = genSeries((t) => Math.log(t) / Math.log(b), xmin, xmax);
    const yRange = computeYRange({ ln: lnSeries, log10: log10Series, logb: logbSeries }, vals);
    return { xmin, xmax, ymin: yRange.ymin, ymax: yRange.ymax };
  }

  function genSeries(fn, xmin, xmax, n = 400) {
    const xs = [];
    const ys = [];
    const step = (Math.log(xmax) - Math.log(xmin)) / (n - 1);
    for (let i = 0; i < n; i++) {
      const x = Math.exp(Math.log(xmin) + step * i);
      let y = fn(x);
      if (!isFinite(y)) y = null;
      xs.push(x);
      ys.push(y);
    }
    return { x: xs, y: ys };
  }

  function ensurePlotly(then) {
    if (window.Plotly && typeof Plotly.newPlot === 'function') {
      then();
      return;
    }
    els.plot.textContent = 'Loading Plotly…';
    const sources = [
      'https://cdn.plot.ly/plotly-latest.min.js',
      'https://cdn.jsdelivr.net/npm/plotly.js-dist-min@2.35.2/plotly.min.js',
      'https://unpkg.com/plotly.js-dist-min@2.35.2/plotly.min.js'
    ];
    let idx = -1;
    const tryNext = () => {
      if (window.Plotly && typeof Plotly.newPlot === 'function') return then();
      idx += 1;
      if (idx >= sources.length) {
        els.validation.textContent = 'Could not load Plotly from any CDN. Use a local server or check network settings.';
        return;
      }
      const url = sources[idx];
      // If a matching script already exists, wait for it instead of adding a duplicate
      const existing = Array.from(document.scripts).find(sc => (sc.src || '').includes(url));
      if (existing) return waitForLoaded();
      const s = document.createElement('script');
      s.src = url;
      s.async = true;
      s.onload = () => then();
      s.onerror = () => setTimeout(tryNext, 0);
      document.head.appendChild(s);
    };
    const waitForLoaded = () => {
      const start = Date.now();
      const check = () => {
        if (window.Plotly && typeof Plotly.newPlot === 'function') return then();
        if (Date.now() - start > 8000) return tryNext();
        setTimeout(check, 250);
      };
      check();
    };
    tryNext();
  }

  function renderPlot(b, x, vals) {
    const { xmin, xmax } = computeDomain(b, x);

    const lnSeries = genSeries((t) => Math.log(t), xmin, xmax);
    const log10Series = genSeries((t) => safeLog10(t), xmin, xmax);
    const logbSeries = genSeries((t) => Math.log(t) / Math.log(b), xmin, xmax);
    const yRange = computeYRange({ ln: lnSeries, log10: log10Series, logb: logbSeries }, vals);

    const css = getComputedStyle(document.documentElement);
    const ink = css.getPropertyValue('--ink').trim() || '#e6edf3';
    const grid = css.getPropertyValue('--grid').trim() || 'rgba(255,255,255,0.05)';

    const ptLn = { x: [x], y: [vals.lnX], type: 'scatter', mode: 'markers', name: 'Point ln(x)', marker: { color: '#2b6cb0', size: 9 }, visible: els.toggleLn.checked ? true : 'legendonly', hovertemplate: 'x=%{x:.6f}<br>ln(x)=%{y:.6f}<extra></extra>' };
    const ptLog10 = { x: [x], y: [vals.log10X], type: 'scatter', mode: 'markers', name: 'Point log10(x)', marker: { color: '#b0652b', size: 9 }, visible: els.toggleLog10.checked ? true : 'legendonly', hovertemplate: 'x=%{x:.6f}<br>log10(x)=%{y:.6f}<extra></extra>' };
    const ptLogb = { x: [x], y: [vals.logbX], type: 'scatter', mode: 'markers', name: 'Point log_b(x)', marker: { color: '#2b8a3e', size: 9 }, visible: els.toggleLogb.checked ? true : 'legendonly', hovertemplate: 'x=%{x:.6f}<br>log_b(x)=%{y:.6f}<extra></extra>' };

    const traces = [
      { x: lnSeries.x, y: lnSeries.y, type: 'scatter', mode: 'lines', name: 'y = ln(x)', line: { color: '#2b6cb0' }, visible: els.toggleLn.checked ? true : 'legendonly', hovertemplate: 'x=%{x:.6f}<br>ln(x)=%{y:.6f}<extra></extra>' },
      { x: log10Series.x, y: log10Series.y, type: 'scatter', mode: 'lines', name: 'y = log10(x)', line: { color: '#b0652b' }, visible: els.toggleLog10.checked ? true : 'legendonly', hovertemplate: 'x=%{x:.6f}<br>log10(x)=%{y:.6f}<extra></extra>' },
      { x: logbSeries.x, y: logbSeries.y, type: 'scatter', mode: 'lines', name: 'y = log_b(x)', line: { color: '#2b8a3e' }, visible: els.toggleLogb.checked ? true : 'legendonly', hovertemplate: 'x=%{x:.6f}<br>log_b(x)=%{y:.6f}<extra></extra>' },
      ptLn, ptLog10, ptLogb,
      // Vertical guide at x
      { x: [x, x], y: [yRange.ymin, yRange.ymax], type: 'scatter', mode: 'lines', name: 'x', line: { color: '#888', dash: 'dot' }, hoverinfo: 'skip', showlegend: false }
    ];

    const layout = {
      paper_bgcolor: 'rgba(0,0,0,0)',
      plot_bgcolor: 'rgba(0,0,0,0)',
      margin: { l: 50, r: 10, t: 10, b: 40 },
      xaxis: {
        type: 'log',
        title: 'x',
        gridcolor: grid,
        zeroline: false,
        range: [Math.log10(xmin), Math.log10(xmax)]
      },
      yaxis: {
        title: 'y',
        gridcolor: grid,
        zeroline: true,
        zerolinecolor: grid,
        range: [yRange.ymin, yRange.ymax]
      },
      font: { color: ink },
      hovermode: 'x unified',
      hoverdistance: -1,
      spikedistance: -1,
      hoverlabel: { bgcolor: 'rgba(0,0,0,0.8)', font: { family: 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace', color: '#fff' } },
      xaxis_spikemode: 'toaxis+across',
      xaxis_spikesnap: 'cursor',
      xaxis_spikedash: 'dot',
      xaxis_spikecolor: '#888',
      xaxis_spikethickness: 1,
      yaxis_spikemode: 'toaxis+across',
      yaxis_spikesnap: 'cursor',
      yaxis_spikedash: 'dot',
      yaxis_spikecolor: '#888',
      yaxis_spikethickness: 1,
      legend: { orientation: 'h' }
    };

    // If interactive Plotly is disabled, draw lightweight plot immediately
    if (els.togglePlotly && !els.togglePlotly.checked) {
      renderPlotLite({ b, x, vals, lnSeries, log10Series, logbSeries, xmin, xmax });
      return;
    }

    // Try Plotly; if it doesn't load fast, fallback to lightweight SVG
    let usedFallback = false;
    const fallbackTimer = setTimeout(() => {
      // Render lightweight plot now; if Plotly later loads, it will overwrite on next recalc
      usedFallback = true;
      renderPlotLite({ b, x, vals, lnSeries, log10Series, logbSeries, xmin, xmax });
    }, 500);

    ensurePlotly(() => {
      if (usedFallback) {
        // Overwrite lite plot with Plotly for better interactivity
        // but only if user hasn't changed inputs in between; we just render directly
      }
      clearTimeout(fallbackTimer);
      Plotly.newPlot(els.plot, traces, layout, { displayModeBar: false, responsive: true, scrollZoom: true }).then(() => {
        setupPlotlyInteractivity();
      });
    });
  }

  // Lightweight SVG fallback plot
  function renderPlotLite(ctx){
    const { b, x, vals, lnSeries, log10Series, logbSeries, xmin, xmax } = ctx;
    const W = Math.max(els.plot.clientWidth || 600, 300);
    const H = Math.max(els.plot.clientHeight || 400, 300);
    const pad = { l: 50, r: 10, t: 10, b: 40 };
    const iw = W - pad.l - pad.r;
    const ih = H - pad.t - pad.b;

    // Determine y-range consistent with auto/manual selection
    const yRange = computeYRange({ ln: lnSeries, log10: log10Series, logb: logbSeries }, vals);
    let yMin = yRange.ymin;
    let yMax = yRange.ymax;

    const logMin = Math.log(xmin), logMax = Math.log(xmax);
    const sx = (v) => pad.l + (Math.log(v) - logMin) / (logMax - logMin) * iw;
    const sy = (v) => pad.t + (1 - (v - yMin) / (yMax - yMin)) * ih;

    const css = getComputedStyle(document.documentElement);
    const ink = (css.getPropertyValue('--ink').trim() || '#e6edf3');
    const grid = (css.getPropertyValue('--grid').trim() || 'rgba(255,255,255,0.05)');

    function pathFrom(series){
      let d = '';
      for (let i=0;i<series.x.length;i++){
        const xv = series.x[i]; const yv = series.y[i];
        if (yv==null || !isFinite(yv)) { d += ' M'; continue; }
        const X = sx(xv), Y = sy(yv);
        d += (d && d[d.length-1] !== 'M' ? ' L ' : ' M ') + X.toFixed(2) + ' ' + Y.toFixed(2);
      }
      return d.trim();
    }

    // Gridlines
    const gridY = [];
    const stepsY = 8;
    for (let i=0;i<=stepsY;i++) gridY.push(yMin + (i*(yMax-yMin)/stepsY));

    // X grid at decades around domain
    const gridX = [];
    const decadeMin = Math.floor(Math.log10(xmin));
    const decadeMax = Math.ceil(Math.log10(xmax));
    for (let k=decadeMin; k<=decadeMax; k++){
      gridX.push(Math.pow(10, k));
    }

    const showLn = els.toggleLn.checked;
    const showLog10 = els.toggleLog10.checked;
    const showLogb = els.toggleLogb.checked;

    const lnPath = pathFrom(lnSeries);
    const log10Path = pathFrom(log10Series);
    const logbPath = pathFrom(logbSeries);

    const pt = {
      ln: { x: x, y: vals.lnX },
      log10: { x: x, y: vals.log10X },
      logb: { x: x, y: vals.logbX }
    };

    const svg = [`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="log plots">`,
      `<rect x="0" y="0" width="${W}" height="${H}" fill="transparent" stroke="${grid}"/>`,
      // grid Y
      ...gridY.map(g => `<line x1="${pad.l}" y1="${sy(g)}" x2="${W-pad.r}" y2="${sy(g)}" stroke="${grid}" stroke-width="1"/>`),
      // grid X
      ...gridX.filter(v=>v>=xmin && v<=xmax).map(v => `<line x1="${sx(v)}" y1="${pad.t}" x2="${sx(v)}" y2="${H-pad.b}" stroke="${grid}" stroke-width="1"/>`),
      // axes
      `<line x1="${pad.l}" y1="${sy(0)}" x2="${W-pad.r}" y2="${sy(0)}" stroke="${grid}"/>`,
      // labels
      `<text x="${W/2}" y="${H-8}" text-anchor="middle" fill="${ink}" font-family="Inter" font-size="12">x (log scale)</text>`,
      `<text x="12" y="${pad.t+12}" fill="${ink}" font-family="Inter" font-size="12">y</text>`,
      // curves
      showLn ? `<path d="${lnPath}" fill="none" stroke="#2b6cb0" stroke-width="2"/>` : '',
      showLog10 ? `<path d="${log10Path}" fill="none" stroke="#b0652b" stroke-width="2"/>` : '',
      showLogb ? `<path d="${logbPath}" fill="none" stroke="#2b8a3e" stroke-width="2"/>` : '',
      // vertical guide at x
      `<line x1="${sx(x)}" y1="${pad.t}" x2="${sx(x)}" y2="${H-pad.b}" stroke="#888" stroke-dasharray="3,3"/>`,
      // points
      showLn ? `<circle cx="${sx(pt.ln.x)}" cy="${sy(pt.ln.y)}" r="4" fill="#2b6cb0"/>` : '',
      showLog10 ? `<circle cx="${sx(pt.log10.x)}" cy="${sy(pt.log10.y)}" r="4" fill="#b0652b"/>` : '',
      showLogb ? `<circle cx="${sx(pt.logb.x)}" cy="${sy(pt.logb.y)}" r="4" fill="#2b8a3e"/>` : '',
      `</svg>`];

    els.plot.innerHTML = svg.join('\n');

    plotState = {
      b, xmin, xmax, yMin, yMax, pad, iw, ih,
      showLn, showLog10, showLogb
    };
    setupLiteInteractivity();
  }

  function setupLiteInteractivity(){
    if (!plotState) return;
    const container = els.plot;
    let tooltip = container.querySelector('.plot-tip');
    let vline = container.querySelector('.plot-vline');
    let hline = container.querySelector('.plot-hline');
    if (!tooltip){
      tooltip = document.createElement('div');
      tooltip.className = 'plot-tip';
      tooltip.style.position = 'absolute';
      tooltip.style.pointerEvents = 'none';
      tooltip.style.font = '12px ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace';
      tooltip.style.background = 'rgba(0,0,0,0.75)';
      tooltip.style.color = '#fff';
      tooltip.style.padding = '6px 8px';
      tooltip.style.borderRadius = '8px';
      tooltip.style.boxShadow = '0 6px 18px rgba(0,0,0,0.3)';
      tooltip.style.zIndex = '10';
      tooltip.style.display = 'none';
      container.appendChild(tooltip);
    }
    if (!vline){
      vline = document.createElement('div');
      vline.className = 'plot-vline';
      Object.assign(vline.style, { position:'absolute', top:'10px', bottom:'40px', width:'1px', background:'rgba(136,136,136,0.8)', display:'none' });
      container.appendChild(vline);
    }
    if (!hline){
      hline = document.createElement('div');
      hline.className = 'plot-hline';
      Object.assign(hline.style, { position:'absolute', left:'50px', right:'10px', height:'1px', background:'rgba(136,136,136,0.6)', display:'none' });
      container.appendChild(hline);
    }

    const svgEl = container.querySelector('svg');
    if (!svgEl) return;
    const bounds = () => container.getBoundingClientRect();
    const sx = (v) => plotState.pad.l + (Math.log(v) - Math.log(plotState.xmin)) / (Math.log(plotState.xmax) - Math.log(plotState.xmin)) * plotState.iw;
    const sy = (v) => plotState.pad.t + (1 - (v - plotState.yMin) / (plotState.yMax - plotState.yMin)) * plotState.ih;
    const invsx = (px) => {
      const t = (px - plotState.pad.l) / plotState.iw;
      const ln = Math.log(plotState.xmin) + t * (Math.log(plotState.xmax) - Math.log(plotState.xmin));
      return Math.exp(ln);
    };
    const invsy = (py) => {
      const t = 1 - (py - plotState.pad.t) / plotState.ih;
      return plotState.yMin + t * (plotState.yMax - plotState.yMin);
    };

    function fmt(v){
      if (!Number.isFinite(v)) return '–';
      if (Math.abs(v) < 1e-6 || Math.abs(v) >= 1e6) return v.toExponential(6);
      return v.toFixed(6);
    }

    function onMove(e){
      const r = bounds();
      const px = e.clientX - r.left;
      const py = e.clientY - r.top;
      const gx = Math.max(plotState.pad.l, Math.min(r.width - plotState.pad.r, px));
      const gy = Math.max(plotState.pad.t, Math.min(r.height - plotState.pad.b, py));
      const x = invsx(gx);
      if (!(x > 0)) return;
      const lnX = Math.log(x);
      const log10X = (typeof Math.log10==='function'? Math.log10(x): Math.log(x)/Math.LN10);
      const logbX = lnX / Math.log(plotState.b);

      vline.style.left = `${gx}px`;
      vline.style.display = '';
      hline.style.top = `${gy}px`;
      hline.style.display = '';

      const parts = [ `x=${fmt(x)}` ];
      if (plotState.showLn) parts.push(`ln=${fmt(lnX)}`);
      if (plotState.showLog10) parts.push(`log10=${fmt(log10X)}`);
      if (plotState.showLogb) parts.push(`log_b=${fmt(logbX)}`);
      tooltip.textContent = parts.join('  |  ');
      tooltip.style.display = '';
      let tx = gx + 12;
      let ty = gy - 12 - 26;
      if (tx + 200 > r.width) tx = gx - 12 - 200;
      if (ty < 0) ty = gy + 12;
      tooltip.style.transform = `translate(${tx}px, ${ty}px)`;
    }

    function onLeave(){
      tooltip.style.display = 'none';
      vline.style.display = 'none';
      hline.style.display = 'none';
    }

    svgEl.addEventListener('mousemove', onMove);
    svgEl.addEventListener('mouseleave', onLeave);
  }

  function setupPlotlyInteractivity(){
    if (!(window.Plotly && els.plot)) return;
    let readout = els.plot.querySelector('.plot-readout');
    if (!readout){
      readout = document.createElement('div');
      readout.className = 'plot-readout';
      Object.assign(readout.style, {
        position:'absolute', left:'12px', bottom:'12px', padding:'6px 8px',
        background:'rgba(0,0,0,0.7)', color:'#fff', borderRadius:'8px',
        font:'12px ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace',
        pointerEvents:'none', display:'none', zIndex:'9'
      });
      els.plot.appendChild(readout);
    }

    function show(data){
      // Plotly hover gives multiple points (one per visible trace)
      const pts = data.points || [];
      // Build unified text: x plus each y label
      let xVal = null;
      const lines = [];
      for (const p of pts){
        if (xVal === null && typeof p.x === 'number') xVal = p.x;
        const name = p.data && p.data.name ? p.data.name.replace('y = ','') : '';
        if (typeof p.y === 'number') lines.push(`${name}=${p.y.toFixed(6)}`);
      }
      if (xVal !== null) lines.unshift(`x=${xVal.toFixed(6)}`);
      readout.textContent = lines.join('  |  ');
      readout.style.display = '';
    }
    function hide(){ readout.style.display = 'none'; }

    els.plot.removeAllListeners && els.plot.removeAllListeners('plotly_hover');
    els.plot.removeAllListeners && els.plot.removeAllListeners('plotly_unhover');
    els.plot.on && els.plot.on('plotly_hover', show);
    els.plot.on && els.plot.on('plotly_unhover', hide);
  }

  function recalc() {
    try {
      const { b, x } = parseInputs();
      if (!validate(b, x)) return;
      const vals = updateValues(b, x);
      updateRelations(b, x, vals);
      updateSteps(b, x, vals);
      renderPlot(b, x, vals);
    } catch (err) {
      console.error(err);
      els.validation.textContent = 'Unexpected error: ' + (err && err.message ? err.message : String(err));
    }
  }

  // Events
  els.base.addEventListener('input', recalc);
  els.number.addEventListener('input', recalc);
  els.toggleLn.addEventListener('change', recalc);
  els.toggleLog10.addEventListener('change', recalc);
  els.toggleLogb.addEventListener('change', recalc);
  if (els.togglePlotly) els.togglePlotly.addEventListener('change', recalc);
  if (els.autoX) els.autoX.addEventListener('change', () => { enableRangeInputs(); recalc(); saveSettings(); });
  if (els.autoY) els.autoY.addEventListener('change', () => { enableRangeInputs(); recalc(); saveSettings(); });
  if (els.xMin) els.xMin.addEventListener('input', () => { recalc(); saveSettings(); });
  if (els.xMax) els.xMax.addEventListener('input', () => { recalc(); saveSettings(); });
  if (els.yMin) els.yMin.addEventListener('input', () => { recalc(); saveSettings(); });
  if (els.yMax) els.yMax.addEventListener('input', () => { recalc(); saveSettings(); });
  if (els.btnReset) els.btnReset.addEventListener('click', () => {
    if (els.autoX) { els.autoX.checked = true; }
    if (els.autoY) { els.autoY.checked = true; }
    if (els.xMin) els.xMin.value = '';
    if (els.xMax) els.xMax.value = '';
    if (els.yMin) els.yMin.value = '';
    if (els.yMax) els.yMax.value = '';
    enableRangeInputs();
    recalc();
    saveSettings();
  });
  if (els.btnFit) els.btnFit.addEventListener('click', () => {
    const { b, x } = parseInputs();
    if (!validate(b, x)) return;
    const vals = updateValues(b, x);
    const r = fitRangesToData(b, x, vals);
    if (els.autoX) els.autoX.checked = false;
    if (els.xMin) els.xMin.value = String(r.xmin);
    if (els.xMax) els.xMax.value = String(r.xmax);
    if (els.autoY) els.autoY.checked = false;
    if (els.yMin) els.yMin.value = String(r.ymin);
    if (els.yMax) els.yMax.value = String(r.ymax);
    enableRangeInputs();
    recalc();
    saveSettings();
  });

  // Initial
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { loadSettings(); enableRangeInputs(); recalc(); });
  } else {
    loadSettings();
    enableRangeInputs();
    recalc();
  }
  window.addEventListener('load', recalc);

  // Persist core control changes
  els.base.addEventListener('input', saveSettings);
  els.number.addEventListener('input', saveSettings);
  els.toggleLn.addEventListener('change', saveSettings);
  els.toggleLog10.addEventListener('change', saveSettings);
  els.toggleLogb.addEventListener('change', saveSettings);
  if (els.togglePlotly) els.togglePlotly.addEventListener('change', saveSettings);
})();
