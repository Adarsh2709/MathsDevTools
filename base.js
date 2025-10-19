(function(){
  const els = {
    val: document.getElementById('val'),
    from: document.getElementById('from'),
    to: document.getElementById('to'),
    validation: document.getElementById('validation'),
    converted: document.getElementById('converted'),
    asdec: document.getElementById('asdec'),
    roundtrip: document.getElementById('roundtrip'),
    steps: document.getElementById('steps'),
    presetBin: document.getElementById('preset-bin'),
    presetOct: document.getElementById('preset-oct'),
    presetHex: document.getElementById('preset-hex')
  };

  const DIGITS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  function charToVal(ch){
    const u = ch.toUpperCase();
    const idx = DIGITS.indexOf(u);
    return idx;
  }

  function parseInBase(str, base){
    // Supports optional leading sign and one decimal point.
    const s = (str || '').trim();
    if (!s) return NaN;
    let sign = 1;
    let i = 0;
    if (s[0] === '+') i = 1; else if (s[0] === '-') { sign = -1; i = 1; }
    let intPart = 0; let fracPart = 0; let fracPow = 1;
    let seenDot = false; let anyDigit = false;
    for (; i < s.length; i++){
      const c = s[i];
      if (c === '.'){
        if (seenDot) return NaN; // multiple dots
        seenDot = true; continue;
      }
      const v = charToVal(c);
      if (v < 0 || v >= base) return NaN;
      anyDigit = true;
      if (!seenDot){
        intPart = intPart * base + v;
      } else {
        fracPow *= base;
        fracPart = fracPart * base + v;
      }
    }
    if (!anyDigit) return NaN;
    const val = intPart + (fracPart / fracPow);
    return sign * val;
  }

  function toBaseString(num, base, fracDigits=16){
    if (!Number.isFinite(num)) return 'NaN';
    if (num === 0) return '0';
    const sign = num < 0 ? '-' : '';
    let x = Math.abs(num);
    const int = Math.floor(x);
    let frac = x - int;
    // integer part
    let ibuf = [];
    let n = int;
    while (n > 0){
      const d = n % base;
      ibuf.push(DIGITS[d]);
      n = Math.floor(n / base);
    }
    const iStr = ibuf.reverse().join('') || '0';
    if (frac === 0) return sign + iStr;
    // fractional part
    let fbuf = [];
    let f = frac;
    for (let k=0;k<fracDigits;k++){
      f *= base;
      const d = Math.floor(f);
      fbuf.push(DIGITS[d]);
      f -= d;
      if (f === 0) break;
    }
    return sign + iStr + '.' + fbuf.join('');
  }

  function recalc(){
    const from = Number(els.from.value);
    const to = Number(els.to.value);
    const s = els.val.value;
    if (!(from >=2 && from <=36 && to >=2 && to <=36)){
      els.validation.textContent = 'Bases must be between 2 and 36.';
      return;
    }
    const dec = parseInBase(s, from);
    if (!Number.isFinite(dec)){
      els.validation.textContent = 'Value is not valid for the chosen from-base.';
      els.converted.textContent = '–';
      els.asdec.textContent = '–';
      els.roundtrip.textContent = '–';
      els.steps.innerHTML = '';
      return;
    }
    els.validation.textContent = '';
    const out = toBaseString(dec, to, 16);
    els.converted.textContent = out;
    els.asdec.textContent = String(dec);

    // Round-trip: convert back
    const back = toBaseString(parseInBase(out, to), from, 16);
    els.roundtrip.textContent = back;

    // Steps
    const steps = [];
    steps.push(`Interpret '${s}' in base ${from}.`);
    steps.push(`Decimal value = ${dec}.`);
    steps.push(`Convert decimal to base ${to} → ${out}.`);
    els.steps.innerHTML = '';
    for (const t of steps){
      const div = document.createElement('div');
      div.textContent = '• ' + t;
      els.steps.appendChild(div);
    }
  }

  els.val.addEventListener('input', recalc);
  els.from.addEventListener('input', recalc);
  els.to.addEventListener('input', recalc);

  els.presetBin.addEventListener('click', () => {
    els.from.value = '2';
    els.to.value = '10';
    recalc();
  });
  els.presetOct.addEventListener('click', () => {
    els.from.value = '8';
    els.to.value = '10';
    recalc();
  });
  els.presetHex.addEventListener('click', () => {
    els.from.value = '16';
    els.to.value = '10';
    recalc();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', recalc);
  } else {
    recalc();
  }
})();
