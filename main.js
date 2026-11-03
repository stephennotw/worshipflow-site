// WorshipFlow site: the projected slide, the stage behind each section, the chord demo, entrances.
document.documentElement.classList.add('js');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---- The projected slide: verses advance like a leader tapping through them; script modes as in the app.
const slide = document.getElementById('slide');
const verses = [...slide.querySelectorAll('.verse')];
let verse = 0;
// With reduced motion the slide stays on its first verse.
if (reduced) verses.slice(1).forEach(v => v.remove());
else setInterval(() => {
  verses[verse].classList.remove('is-on');
  verse = (verse + 1) % verses.length;
  verses[verse].classList.add('is-on');
}, 7000);
slide.querySelectorAll('.script-toggle button').forEach(b => b.addEventListener('click', () => {
  slide.classList.remove('mode-native', 'mode-latin', 'mode-both');
  slide.classList.add('mode-' + b.dataset.mode);
  slide.querySelectorAll('.script-toggle button').forEach(o => o.setAttribute('aria-pressed', String(o === b)));
}));

// ---- The stage changes with the section beside it.
const layers = [...document.querySelectorAll('.stage .layer')];
// On a phone the stage is not pinned beside the text, so it always shows the projected slide.
const phone = matchMedia('(max-width: 760px)');
const show = name => {
  const shown = phone.matches ? 'slide' : name;
  layers.forEach(l => l.classList.toggle('is-on', l.dataset.layer === shown));
};
const stageObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) show(e.target.dataset.stage); });
}, { rootMargin: '-45% 0px -45% 0px' });
document.querySelectorAll('[data-stage]').forEach(s => stageObs.observe(s));

// ---- Entrances, once per section.
const inObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); inObs.unobserve(e.target); } });
}, { rootMargin: '0px 0px -12% 0px' });
document.querySelectorAll('[data-in]').forEach(el => inObs.observe(el));

// ---- Chords: the app's rules (ChordTransposer.kt): sharps, slash chords transposed on both sides.
const SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT = { Db: 'C#', Eb: 'D#', Gb: 'F#', Ab: 'G#', Bb: 'A#' };
const CHORD = /^[A-G][#b]?(m|maj|min|dim|aug|sus|add|M)?[0-9]*(sus[24]?|add[0-9]+|[#b][0-9]+)*(\/[A-G][#b]?)?$/;
const noteIndex = n => SHARPS.indexOf(FLAT[n] || n);
function transposeOne(c, s) {
  const len = c.length > 1 && '#b'.includes(c[1]) ? 2 : 1;
  const i = noteIndex(c.slice(0, len));
  return i < 0 ? c : SHARPS[((i + s) % 12 + 12) % 12] + c.slice(len);
}
const transpose = (c, s) => c.split('/').map(p => transposeOne(p, s)).join('/');

const input = document.getElementById('chordpro');
const out = document.getElementById('rendered');
const keysRow = document.getElementById('keys');
let target = null;   // the key picked; null shows the song in its own key
let shift = 0;

function originalKey() {
  const m = input.value.match(/\[([A-G][#b]?)[^\]]*\]/);
  return m ? noteIndex(m[1]) : 4;
}

function render(flash) {
  shift = target === null ? 0 : target - originalKey();
  out.textContent = '';
  input.value.split('\n').forEach(line => {
    const row = document.createElement('div');
    row.className = 'r-line';
    const parts = line.split(/(\[[^\]]*\])/);
    let chord = '';
    const push = (c, t) => {
      const seg = document.createElement('span'); seg.className = 'r-seg';
      const ch = document.createElement('span'); ch.className = 'r-chord' + (flash && c ? ' flash' : ''); ch.textContent = c;
      const tx = document.createElement('span'); tx.className = 'r-text'; tx.textContent = t || (c ? ' ' : '');
      seg.append(ch, tx); row.append(seg);
    };
    parts.forEach(p => {
      if (/^\[.*\]$/.test(p)) {
        if (chord) push(chord, '');
        const c = p.slice(1, -1).trim();
        chord = CHORD.test(c) ? transpose(c, shift) : c;
      } else if (p) {
        // Split the text after a chord so it wraps word by word, the chord staying on its syllable.
        const words = p.split(/(?<= )/);
        push(chord, words[0]); chord = '';
        words.slice(1).forEach(w => push('', w));
      }
    });
    if (chord) push(chord, '');
    if (!row.children.length) push('', ' ');
    out.append(row);
  });
  const now = ((originalKey() + shift) % 12 + 12) % 12;
  keysRow.querySelectorAll('button').forEach((b, i) => b.setAttribute('aria-pressed', String(i === now)));
}

SHARPS.forEach((k, i) => {
  const b = document.createElement('button');
  b.type = 'button'; b.textContent = k; b.setAttribute('aria-label', 'Key of ' + k.replace('#', ' sharp'));
  b.addEventListener('click', () => { target = i; render(true); });
  keysRow.append(b);
});
input.addEventListener('input', () => render(false));
render(false);
