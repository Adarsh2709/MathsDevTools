(function(){
  const els = {
    start: document.getElementById('start'),
    end: document.getElementById('end'),
    validation: document.getElementById('validation'),
    count: document.getElementById('count'),
    firstlast: document.getElementById('firstlast'),
    list: document.getElementById('list')
  };

  function toInt(v){
    const n = Number(v);
    return Number.isFinite(n) ? Math.trunc(n) : NaN;
  }

  function simpleSieve(limit){
    const N = Math.max(0, limit+1);
    const isPrime = new Uint8Array(N);
    isPrime.fill(1);
    if (N>0) isPrime[0]=0; if (N>1) isPrime[1]=0;
    for (let p=2; p*p<=limit; p++){
      if (isPrime[p]){
        for (let m=p*p; m<=limit; m+=p) isPrime[m]=0;
      }
    }
    const primes=[];
    for (let i=2;i<=limit;i++) if (isPrime[i]) primes.push(i);
    return primes;
  }

  function segmentedSieve(lo, hi){
    if (hi < 2 || hi < lo) return [];
    lo = Math.max(lo, 2);
    const root = Math.floor(Math.sqrt(hi));
    const base = simpleSieve(root);
    const size = hi - lo + 1;
    const block = new Uint8Array(size);
    block.fill(1);
    for (const p of base){
      const start = Math.max(p*p, Math.ceil(lo/p)*p);
      for (let m=start; m<=hi; m+=p){ block[m-lo]=0; }
    }
    const res=[];
    for (let i=0;i<size;i++) if (block[i]) res.push(lo+i);
    return res;
  }

  function computePrimesInRange(a, b){
    const lo = Math.min(a,b);
    const hi = Math.max(a,b);
    const span = hi - lo;
    if (hi <= 2_000_000){
      const primes = simpleSieve(hi);
      return primes.filter(p => p>=lo);
    }
    if (span <= 2_000_000){
      return segmentedSieve(lo, hi);
    }
    // Large span: segment in chunks
    const CHUNK = 2_000_000;
    const out = [];
    let s = lo;
    while (s <= hi){
      const e = Math.min(hi, s + CHUNK - 1);
      out.push(...segmentedSieve(s, e));
      s = e + 1;
    }
    return out;
  }

  function recalc(){
    const a = toInt(els.start.value);
    const b = toInt(els.end.value);
    if (!Number.isFinite(a) || !Number.isFinite(b)){
      els.validation.textContent = 'Enter valid integers for start and end.';
      return;
    }
    els.validation.textContent='';
    const primes = computePrimesInRange(a,b);
    els.count.textContent = String(primes.length);
    let first = '–', last = '–';
    if (primes.length>0){ first = String(primes[0]); last = String(primes[primes.length-1]); }
    els.firstlast.textContent = `${first} / ${last}`;
    // Render list
    els.list.innerHTML = '';
    if (primes.length === 0){
      const div = document.createElement('div');
      div.textContent = 'No primes in range.';
      els.list.appendChild(div);
    } else {
      const chunk = document.createElement('div');
      chunk.style.whiteSpace = 'pre-wrap';
      chunk.textContent = primes.join(', ');
      els.list.appendChild(chunk);
    }
  }

  els.start.addEventListener('input', recalc);
  els.end.addEventListener('input', recalc);
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', recalc);
  } else {
    recalc();
  }
})();
