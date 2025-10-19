(function(){
  const els = {
    n: document.getElementById('n'),
    validation: document.getElementById('validation'),
    isprime: document.getElementById('isprime'),
    smallest: document.getElementById('smallest'),
    neighbors: document.getElementById('neighbors'),
    factors: document.getElementById('factors')
  };

  function toBigIntSafe(v){
    try { return BigInt(v); } catch { return null; }
  }

  function isPrimeBig(n){
    if (n < 2n) return { prime:false, smallest: null };
    if (n % 2n === 0n) return { prime: n === 2n, smallest: 2n };
    let d = 3n;
    while (d*d <= n){
      if (n % d === 0n) return { prime:false, smallest:d };
      d += 2n;
    }
    return { prime:true, smallest:null };
  }

  function nextPrime(n){
    if (n < 2n) return 2n;
    let m = n + 1n;
    if (m % 2n === 0n) m += 1n;
    while(true){
      if (isPrimeBig(m).prime) return m;
      m += 2n;
    }
  }

  function prevPrime(n){
    if (n <= 2n) return null;
    let m = n - 1n;
    if (m % 2n === 0n) m -= 1n;
    while(m >= 2n){
      if (isPrimeBig(m).prime) return m;
      m -= 2n;
    }
    return null;
  }

  function factorBig(n){
    const res = [];
    if (n < 2n) return res;
    while (n % 2n === 0n){ res.push(2n); n /= 2n; }
    let f = 3n;
    while (f*f <= n){
      while (n % f === 0n){ res.push(f); n /= f; }
      f += 2n;
    }
    if (n > 1n) res.push(n);
    return res;
  }

  function fmtBig(n){ return n === null ? '–' : n.toString(); }

  function recalc(){
    const Nbig = toBigIntSafe(els.n.value);
    if (Nbig === null){
      els.validation.textContent = 'Enter a valid integer.';
      return;
    }
    els.validation.textContent = '';
    const pr = isPrimeBig(Nbig);
    els.isprime.textContent = pr.prime ? 'Yes' : 'No';
    els.smallest.textContent = pr.smallest ? pr.smallest.toString() : (pr.prime ? '–' : '1');
    const prev = prevPrime(Nbig);
    const next = nextPrime(Nbig);
    els.neighbors.textContent = `${fmtBig(prev)} / ${fmtBig(next)}`;
    const facs = factorBig(Nbig);
    els.factors.innerHTML = '';
    if (facs.length === 0){
      const div = document.createElement('div');
      div.textContent = 'No prime factors (n < 2).';
      els.factors.appendChild(div);
    } else {
      const div = document.createElement('div');
      div.textContent = 'Prime factors: ' + facs.map(String).join(' · ');
      els.factors.appendChild(div);
    }
  }

  els.n.addEventListener('input', recalc);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', recalc);
  } else {
    recalc();
  }
})();
