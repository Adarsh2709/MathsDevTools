(function(){
  const els = {
    a: document.getElementById('a'),
    b: document.getElementById('b'),
    n: document.getElementById('n'),
    validation: document.getElementById('validation'),
    pow: document.getElementById('pow'),
    root: document.getElementById('root'),
    growth: document.getElementById('growth'),
    steps: document.getElementById('steps')
  };

  function fmt(v){
    if (!Number.isFinite(v)) return '–';
    if (Math.abs(v) < 1e-6 || Math.abs(v) >= 1e6) return v.toExponential(6);
    return v.toFixed(6);
  }

  function nthRoot(a, n){
    // Real nth root when valid; for even n and negative a, return NaN
    if (!Number.isFinite(a) || !Number.isFinite(n)) return NaN;
    if (n === 0) return NaN;
    if (Number.isInteger(n) && n % 2 === 0 && a < 0) return NaN;
    return Math.sign(a) * Math.pow(Math.abs(a), 1/n);
  }

  function recalc(){
    const a = Number(els.a.value);
    const b = Number(els.b.value);
    const n = Number(els.n.value);
    if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(n)){
      els.validation.textContent = 'Enter valid numbers for a, b, n.';
      return;
    }
    els.validation.textContent = '';

    const p = Math.pow(a, b);
    els.pow.textContent = fmt(p);

    const r = nthRoot(a, n);
    els.root.textContent = Number.isFinite(r) ? fmt(r) : 'Not a real number';

    const rRate = 0.05;
    const growth = a * Math.pow(1 + rRate, b);
    els.growth.textContent = fmt(growth);

    const items = [];
    items.push(`Power: a^b = ${fmt(a)}^${fmt(b)} = ${fmt(p)}`);
    items.push(`nth root: a^(1/n) with a=${fmt(a)}, n=${fmt(n)} → ${Number.isFinite(r) ? fmt(r) : 'not real for even n and negative a'}`);
    items.push(`Growth example: a*(1+r)^b with r=5% → ${fmt(growth)}`);

    els.steps.innerHTML = '';
    for (const t of items){
      const div = document.createElement('div');
      div.textContent = '• ' + t;
      els.steps.appendChild(div);
    }
  }

  els.a.addEventListener('input', recalc);
  els.b.addEventListener('input', recalc);
  els.n.addEventListener('input', recalc);
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', recalc);
  } else { recalc(); }
})();
