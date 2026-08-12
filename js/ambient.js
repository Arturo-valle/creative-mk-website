/* ============================================
   The acts become audible — opt-in ambient sound (audit gap 10).

   No files, no streaming: three synthesized drones, one per act, crossfaded
   by the same scroll geometry the field uses. Night hums low, daylight sits
   a fifth up and quieter, the close settles between them. Everything is
   sine waves at whisper gain with a slow breathing LFO — it should read as
   room tone, not music.

   Strictly opt-in: the toggle in the header is off by default, the
   AudioContext is created only on the visitor's own click (autoplay policy
   compliant by construction), and the choice persists in localStorage — a
   returning visitor's sound arms on their first gesture instead of asking
   again.
   ============================================ */

function initAmbient() {
  var toggle = document.getElementById('sound-toggle');
  if (!toggle || typeof window.AudioContext === 'undefined') return;

  var STORE = 'creativeMkSound';
  var ctx = null;
  var master = null;
  var acts = [];
  var raf = null;
  var act1End = 0.25;
  var act2End = 0.8;

  // Root frequencies per act: A2 for the night, D3 for daylight, F2 to close.
  var CHORDS = [
    [110.0, 164.81, 220.0],
    [146.83, 220.0, 293.66],
    [87.31, 130.81, 174.61]
  ];

  function measureActs() {
    var total = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    var reel = document.getElementById('showreel');
    var news = document.getElementById('news');
    if (reel) act1End = Math.min((reel.offsetTop + reel.offsetHeight - window.innerHeight * 0.4) / total, 0.95);
    if (news) act2End = Math.min(Math.max((news.offsetTop - window.innerHeight * 0.6) / total, act1End + 0.05), 0.98);
  }

  function smoothstep(a, b, x) {
    var t = Math.min(Math.max((x - a) / (b - a), 0), 1);
    return t * t * (3 - 2 * t);
  }

  function build() {
    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    acts = CHORDS.map(function (chord) {
      var gain = ctx.createGain();
      gain.gain.value = 0;
      gain.connect(master);
      chord.forEach(function (freq, i) {
        var osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        osc.detune.value = (i - 1) * 4; // a breath of detune so it shimmers
        var partial = ctx.createGain();
        partial.gain.value = i === 0 ? 0.5 : 0.25;
        osc.connect(partial);
        partial.connect(gain);
        osc.start();
      });
      return gain;
    });

    // The breathing: a slow LFO easing the master in and out.
    var lfo = ctx.createOscillator();
    lfo.frequency.value = 0.05;
    var depth = ctx.createGain();
    depth.gain.value = 0.012;
    lfo.connect(depth);
    depth.connect(master.gain);
    lfo.start();

    measureActs();
    window.addEventListener('resize', measureActs);
    document.addEventListener('mk:i18n', measureActs);
  }

  function frame() {
    raf = requestAnimationFrame(frame);
    var total = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    var scroll = Math.min((window.scrollY || 0) / total, 1);
    var day = smoothstep(act1End - 0.06, act1End + 0.06, scroll);
    var close = smoothstep(act2End - 0.06, act2End + 0.06, scroll);
    var levels = [(1 - day) * (1 - close), day * (1 - close) * 0.6, close];
    for (var i = 0; i < acts.length; i++) {
      acts[i].gain.setTargetAtTime(levels[i], ctx.currentTime, 0.4);
    }
  }

  function on() {
    if (!ctx) build();
    ctx.resume();
    master.gain.setTargetAtTime(0.035, ctx.currentTime, 0.8);
    if (raf === null) raf = requestAnimationFrame(frame);
    toggle.setAttribute('aria-pressed', 'true');
    toggle.classList.add('is-on');
    try { localStorage.setItem(STORE, '1'); } catch (e) {}
  }

  function off() {
    if (master) master.gain.setTargetAtTime(0, ctx.currentTime, 0.3);
    if (raf !== null) { cancelAnimationFrame(raf); raf = null; }
    toggle.setAttribute('aria-pressed', 'false');
    toggle.classList.remove('is-on');
    try { localStorage.setItem(STORE, '0'); } catch (e) {}
  }

  toggle.addEventListener('click', function () {
    if (toggle.getAttribute('aria-pressed') === 'true') off();
    else on();
  });

  /* A returning visitor who opted in: arm on their first gesture instead of
     asking again — the gesture satisfies the autoplay policy. */
  var stored = null;
  try { stored = localStorage.getItem(STORE); } catch (e) {}
  if (stored === '1') {
    var arm = function () { on(); };
    window.addEventListener('pointerdown', arm, { once: true });
  }
}

document.addEventListener('DOMContentLoaded', initAmbient);
