(function () {
  'use strict';
  var root = document.documentElement;
  var assetBase = new URL('.', document.currentScript.src);
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var bands = Array.prototype.slice.call(document.querySelectorAll('.band'));
  var layers = Array.prototype.slice.call(document.querySelectorAll('#backdrop .layer'));
  var canopy = Array.prototype.slice.call(document.querySelectorAll('#canopy .layer'));
  /* looked up here, not beside the petal code: the first paintScroll() runs
     long before that section and tints this canvas */
  var cv = document.getElementById('petals');

  /* ---------- the guest's name, carried in the link's #ending ---------- */
  function prettify(slug) {
    return slug.replace(/-+/g, ' ').trim().replace(/\s+/g, ' ')
      .replace(/(^|\s|\.)([a-z])/g, function (m, pre, ch) { return pre + ch.toUpperCase(); });
  }
  function currentGuest() {
    var h = (window.location.hash || '').replace(/^#/, '');
    return /^[A-Za-z0-9-]{1,60}$/.test(h) ? prettify(h) : null;
  }
  function paintGuest(override) {
    var name = override != null ? override : currentGuest();
    var slots = document.querySelectorAll('[data-guest]');
    for (var i = 0; i < slots.length; i++) {
      slots[i].textContent = name || slots[i].getAttribute('data-default');
    }
    document.getElementById('openerWelcome').hidden = !!name;
    document.getElementById('openerGuestLabel').hidden = !name;
    document.getElementById('openerGuest').hidden = !name;
  }
  paintGuest();
  window.addEventListener('hashchange', function () { paintGuest(); });

  /* Each invitation supplies its own event time and completed message. */
  var TARGET = Date.parse(document.body.getAttribute('data-countdown-at'));
  var countdownComplete = document.body.getAttribute('data-countdown-complete');
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  var cd = { d: document.getElementById('cd-d'), h: document.getElementById('cd-h'),
             m: document.getElementById('cd-m'), s: document.getElementById('cd-s') };
  var cdNote = document.getElementById('cdNote');
  function tick() {
    var left = TARGET - Date.now();
    if (left <= 0) {
      cd.d.textContent = '00'; cd.h.textContent = '00';
      cd.m.textContent = '00'; cd.s.textContent = '00';
      cdNote.textContent = countdownComplete;
      clearInterval(timerId);
      return;
    }
    var sec = Math.floor(left / 1000);
    cd.d.textContent = Math.floor(sec / 86400);
    cd.h.textContent = pad(Math.floor(sec / 3600) % 24);
    cd.m.textContent = pad(Math.floor(sec / 60) % 60);
    cd.s.textContent = pad(sec % 60);
  }
  var timerId = setInterval(tick, 1000);
  tick();

  /* ---------- dots ---------- */
  var dots = document.getElementById('dots'), dotBtns = [];
  bands.forEach(function (sec) {
    var b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', sec.getAttribute('data-label'));
    b.setAttribute('aria-current', 'false');
    b.addEventListener('click', function () { sec.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }); });
    dots.appendChild(b); dotBtns.push(b);
  });

  /* ---------- the scenery dissolves from one passage into the next ----------
     p is a continuous position along the bands. It holds steady at band i
     while you read it, then crosses to i+1 over the band's last third, so the
     palette changes between passages rather than drifting the whole way. */
  var tops = [], hs = [], ticking = false, shownDot = -1;
  function measure() {
    tops = []; hs = [];
    for (var i = 0; i < bands.length; i++) {
      var r = bands[i].getBoundingClientRect();
      tops.push(r.top + window.pageYOffset);
      hs.push(r.height);
    }
  }
  function position() {
    var y = window.pageYOffset, vh = window.innerHeight, last = bands.length - 1;
    if (!tops.length) return 0;
    /* The band filling the screen is the last one whose top has passed the
       viewport's upper edge. The handover to the next palette then runs as
       that band slides off, finishing only once its words are gone - driving
       this from the viewport CENTRE used to land pale text on a pale sky. */
    var i = 0;
    for (var k = 0; k < bands.length; k++) if (tops[k] <= y + vh * 0.15) i = k;
    if (i >= last) return last;
    var edge = tops[i + 1] - y;
    var t = (vh * 0.95 - edge) / (vh * 0.93);
    if (t < 0) t = 0; else if (t > 1) t = 1;
    return i + t * t * (3 - 2 * t);
  }
  function paintScroll() {
    ticking = false;
    var p = position(), k = Math.floor(p), t = p - k;
    if (k >= layers.length - 1) { k = layers.length - 1; t = 0; }
    for (var i = 0; i < layers.length; i++) {
      var o = i === k ? 1 : (i === k + 1 ? t : 0);
      layers[i].style.opacity = o;
      if (canopy[i]) canopy[i].style.opacity = o;
    }
    var cur = Math.min(bands.length - 1, Math.max(0, Math.round(p)));
    if (cur !== shownDot) {
      shownDot = cur;
      for (var d = 0; d < dotBtns.length; d++) {
        dotBtns[d].setAttribute('aria-current', d === cur ? 'true' : 'false');
      }
      tintPetals(bands[cur]);
    }
  }
  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(paintScroll); }
  }
  measure(); paintScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { measure(); paintScroll(); });

  /* ---------- each passage writes itself in as it arrives ---------- */
  var startReveal = null;
  (function () {
    var groups = [];
    bands.forEach(function (sec) {
      var kids = [], n = 0;
      for (var j = 0; j < sec.children.length; j++) {
        var c = sec.children[j], cl = c.classList;
        if (cl.contains('gap-s') || cl.contains('gap-m') || cl.contains('gap-l')) continue;
        if (cl.contains('count') || cl.contains('calls')) {
          for (var m = 0; m < c.children.length; m++) kids.push(c.children[m]);
        } else { kids.push(c); }
      }
      if (!reduce) {
        for (var k = 0; k < kids.length; k++) {
          kids[k].classList.add('will-reveal');
          kids[k].style.setProperty('--d', (0.06 + n++ * 0.07).toFixed(3) + 's');
        }
      }
      groups.push(kids);
    });
    function show(i) {
      var kids = groups[i];
      for (var k = 0; k < kids.length; k++) kids[k].classList.add('shown');
    }
    if (!('IntersectionObserver' in window)) {
      startReveal = function () { for (var i = 0; i < groups.length; i++) show(i); };
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (!entries[i].isIntersecting) continue;
        show(bands.indexOf(entries[i].target));
        io.unobserve(entries[i].target);
      }
    }, { rootMargin: '0px 0px -16% 0px', threshold: 0 });
    startReveal = function () {
      for (var i = 0; i < bands.length; i++) io.observe(bands[i]);
      startReveal = null;
    };
  })();

  /* ---------- petals, tinted by the passage you are in ---------- */
  var rose = new Image();
  var roseReady = false;
  rose.decoding = 'async';
  rose.onload = function () { roseReady = true; };
  rose.src = new URL('rose.webp', assetBase).href;
  /* the drifting roses take the same tint as the corner sprays */
  function tintPetals(sec) {
    if (!sec) return;
    var cs = getComputedStyle(sec);
    if (cv) cv.style.filter = cs.getPropertyValue('--bloomTint').trim() || 'none';

  }
  if (!reduce && cv.getContext) {
    var g = cv.getContext('2d'), petals = [], W = 0, H = 0;
    function size() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function seed() {
      petals = [];
      var n = Math.round(Math.min(9, Math.max(4, W / 70)));
      for (var i = 0; i < n; i++) {
        petals.push({
          x: Math.random() * W, y: Math.random() * H,
          r: 5 + Math.random() * 8, vy: 0.08 + Math.random() * 0.22,
          sway: 0.3 + Math.random() * 0.9, phase: Math.random() * Math.PI * 2,
          spin: (Math.random() - 0.5) * 0.008, rot: Math.random() * Math.PI,
          a: 0.13 + Math.random() * 0.2
        });
      }
    }
    function draw() {
      g.clearRect(0, 0, W, H);
      g.fillStyle = '#E8B9BE';
      for (var i = 0; i < petals.length; i++) {
        var p = petals[i];
        p.y += p.vy; p.rot += p.spin; p.phase += 0.006;
        p.x += Math.sin(p.phase) * p.sway * 0.35;
        if (p.y - p.r > H) { p.y = -p.r * 2; p.x = Math.random() * W; }
        g.save();
        g.translate(p.x, p.y); g.rotate(p.rot);
        g.globalAlpha = p.a;
        if (roseReady) {
          g.drawImage(rose, -p.r, -p.r * 0.98, p.r * 2, p.r * 1.96);
        } else {
          g.beginPath(); g.ellipse(0, 0, p.r * 0.52, p.r, 0, 0, Math.PI * 2); g.fill();
        }
        g.restore();
      }
      requestAnimationFrame(draw);
    }
    size(); seed(); requestAnimationFrame(draw);
    window.addEventListener('resize', function () { size(); seed(); });
  }

  /* ---------- the song ----------
     Two things matter here. The element is built as soon as the page loads, so
     it is already buffering while the reader is still looking at the seal. And
     the pill follows the `playing` event, not the play() promise: with a file
     this size that promise can sit unsettled long after sound has started, and
     the volume used to be raised only in its callback - so the track played at
     volume 0 and the invitation seemed silent. */
  var btn = document.getElementById('sound');
  var label = document.getElementById('soundLabel');
  var audio = null, fader = null, playing = false, pending = false;
  var userMuted = false, armed = false, wanted = false;

  function setBtn(on) {
    if (on) btn.classList.remove('needs-tap');
    btn.classList.toggle('on', on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    label.textContent = on ? 'Sound on' : 'Sound off';
  }
  function onPlaying() {
    if (playing) return;
    pending = false;
    playing = true;
    if (audio) audio.muted = false;
    setBtn(true);
    fadeTo(0.6, 900);
  }
  function refused() {
    if (playing) return;
    pending = false;
    setBtn(false);
    /* playback was refused. Say so in words a guest can act on, and start on
       their very next tap or key press. */
    if (!userMuted) {
      label.textContent = 'Tap for sound';
      btn.classList.add('needs-tap');
      armAutoplay();
    }
  }
  function makeAudio() {
    if (audio) return audio;
    audio = new Audio();
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = 0;
    audio.setAttribute('playsinline', '');
    audio.addEventListener('playing', onPlaying);
    /* if the first attempt came before the file was ready, try again the
       moment it is - as long as the reader has not muted it on purpose */
    audio.addEventListener('canplay', function () {
      if (!playing && !userMuted && wanted) startAudio();
    });
    audio.src = new URL('tumpremho.mp3', assetBase).href;
    return audio;
  }
  function fadeTo(target, ms) {
    if (fader) { clearInterval(fader); fader = null; }
    var a = audio;
    if (!a) return;
    var from = a.volume, steps = Math.max(1, Math.round(ms / 50)), i = 0;
    fader = setInterval(function () {
      i++;
      var v = from + (target - from) * (i / steps);
      a.volume = Math.min(1, Math.max(0, v));
      if (i >= steps) {
        clearInterval(fader); fader = null;
        if (target === 0) { try { a.pause(); } catch (e) {} }
      }
    }, 50);
  }
  function startAudio() {
    wanted = true;
    if (playing || pending) return;
    var a = makeAudio();
    pending = true;
    /* Start MUTED. A muted track is always allowed to play, whatever the
       embedding page's autoplay policy says, so this gets the element
       running; the unmute then happens inside the same gesture and sticks. */
    a.muted = true;
    var promise;
    try { promise = a.play(); } catch (e) { promise = null; }
    var running = function () { a.muted = false; onPlaying(); };
    if (promise && promise.then) promise.then(running, refused);
    else running();
    /* if neither the promise nor the event lands but the element is in fact
       running, unmute anyway rather than play silently */
    setTimeout(function () {
      if (pending && audio && !audio.paused) running();
    }, 1500);
  }
  function armAutoplay() {
    if (armed) return;
    armed = true;
    var go = function () {
      document.removeEventListener('pointerdown', go, true);
      document.removeEventListener('touchend', go, true);
      document.removeEventListener('keydown', go, true);
      armed = false;
      if (!userMuted) startAudio();
    };
    document.addEventListener('pointerdown', go, true);
    document.addEventListener('touchend', go, true);
    document.addEventListener('keydown', go, true);
  }
  function stopAudio() {
    if (!playing) return;
    playing = false;
    setBtn(false);
    fadeTo(0, 700);
  }
  makeAudio();   /* buffer now, while the seal is still on screen */
  btn.addEventListener('click', function () {
    if (playing) { userMuted = true; wanted = false; stopAudio(); }
    else { userMuted = false; startAudio(); }
  });

  /* ---------- breaking the seal ---------- */
  var opener = document.getElementById('opener');
  function openCard() {
    if (root.classList.contains('opened')) return;
    root.classList.add('opened');
    /* However it was opened, the invitation begins at its title passage.
       Letting a scroll carry through meant the gesture that broke the seal
       also carried the reader past the first passage entirely. */
    window.scrollTo(0, 0);
    dropOpenGestures();
    measure();
    if (startReveal) startReveal();
    paintScroll();
    setTimeout(function () { opener.setAttribute('aria-hidden', 'true'); measure(); paintScroll(); }, reduce ? 50 : 1400);
    startAudio();   /* a seal tap is a real gesture, so this plays at once */
  }
  opener.addEventListener('click', function () { openCard(); });

  /* Scrolling, swiping or paging down opens it just as the seal does. The
     wheel and touch listeners are deliberately NOT passive: the gesture that
     breaks the seal is swallowed, so it opens the invitation without also
     scrolling it, and the reader lands on the title passage. */
  function openByGesture(e) {
    if (e && e.cancelable) e.preventDefault();
    openCard();
  }
  function openByScrollbar() { if (window.pageYOffset > 6) openCard(); }
  function openByKey(e) {
    var k = e.key;
    if (k === 'ArrowDown' || k === 'PageDown' || k === 'End' || k === ' ' || k === 'Spacebar') {
      if (e.cancelable) e.preventDefault();
      openCard();
    }
  }
  /* A trackpad flick is not one wheel event, it is a burst of them over a
     second or more. Swallowing only the first let the rest of the momentum
     scroll straight past the title passage, so the tail is eaten too - until
     the events stop for a moment, and never longer than it takes to settle. */
  var tailTimer = null, tailGuard = null;
  function swallowTail(e) {
    if (e && e.cancelable) e.preventDefault();
    clearTimeout(tailTimer);
    tailTimer = setTimeout(releaseTail, 260);
  }
  function releaseTail() {
    clearTimeout(tailTimer); clearTimeout(tailGuard);
    tailTimer = tailGuard = null;
    window.removeEventListener('wheel', swallowTail, { passive: false });
    window.removeEventListener('touchmove', swallowTail, { passive: false });
  }
  function dropOpenGestures() {
    window.removeEventListener('wheel', openByGesture, { passive: false });
    window.removeEventListener('touchmove', openByGesture, { passive: false });
    window.removeEventListener('scroll', openByScrollbar);
    window.removeEventListener('keydown', openByKey);
    window.addEventListener('wheel', swallowTail, { passive: false });
    window.addEventListener('touchmove', swallowTail, { passive: false });
    tailTimer = setTimeout(releaseTail, 260);
    tailGuard = setTimeout(releaseTail, 2000);   /* never hold the page hostage */
  }
  window.addEventListener('wheel', openByGesture, { passive: false });
  window.addEventListener('touchmove', openByGesture, { passive: false });
  window.addEventListener('keydown', openByKey);
  /* armed late so a scroll position restored on reload does not trip it */
  setTimeout(function () {
    if (!root.classList.contains('opened')) {
      window.addEventListener('scroll', openByScrollbar, { passive: true });
    }
  }, 400);

  /* ---------- copying ---------- */
  function flash(el, word) {
    /* remember the pristine label once, and cancel any flash still pending,
       so clicking twice quickly cannot leave "Copied" stuck on the button */
    if (!el.getAttribute('data-label')) el.setAttribute('data-label', el.textContent);
    if (el.flashTimer) clearTimeout(el.flashTimer);
    el.textContent = word;
    el.flashTimer = setTimeout(function () {
      el.textContent = el.getAttribute('data-label');
      el.flashTimer = null;
    }, 1600);
  }
  function copyText(text, el, okWord) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { flash(el, okWord); })
        .catch(function () { flash(el, 'Select it'); });
    } else { flash(el, 'Select it'); }
  }
  /* the number stays put and the line beneath it reports back, so the digits
     are never replaced by the word "Copied" under the reader's thumb */
  var callNo = document.getElementById('callNo');
  var phoneHint = document.getElementById('phoneHint');
  if (callNo && phoneHint) {
    callNo.addEventListener('click', function () {
      copyText(callNo.textContent.replace(/\s+/g, ''), phoneHint, 'Number copied');
    });
  }

})();
