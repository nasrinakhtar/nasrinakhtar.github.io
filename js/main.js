/* ============================================================
   main.js — theme, motion and page behaviour. No dependencies.
   ============================================================ */
(function () {
  'use strict';

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var easeOut = function (t) { return 1 - Math.pow(1 - t, 3); };

  /* ============================================================
     1 — THEME
     ============================================================ */
  (function theme () {
    var btn = $('#themeBtn'), root = document.documentElement;
    var moon = $('.i-moon', btn), sun = $('.i-sun', btn);
    function set (t) {
      root.setAttribute('data-theme', t);
      try { localStorage.setItem('theme', t); } catch (e) {}
      var meta = $('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', t === 'dark' ? '#0a0e17' : '#F9F8F6');
      if (moon && sun) {
        moon.classList.toggle('hidden', t === 'dark');
        sun.classList.toggle('hidden', t !== 'dark');
      }
      if (btn) btn.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    }
    set(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
    if (btn) btn.addEventListener('click', function () {
      set(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
  })();

  /* ============================================================
     2 — SCROLL REVEAL (staggered, and it stays smooth)
     ============================================================ */
  (function reveal () {
    var els = $$('[data-reveal]');
    if (!els.length) return;
    if (!('IntersectionObserver' in window) || REDUCED) {
      els.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var d = parseInt(en.target.dataset.delay || '0', 10);
        setTimeout(function () { en.target.classList.add('in'); }, d);
        io.unobserve(en.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { io.observe(el); });
  })();

  /* ============================================================
     3 — NAV: shadow on scroll, scroll-spy, mobile menu
     ============================================================ */
  (function nav () {
    var header = $('#nav'), menu = $('#mobileMenu'), burger = $('#burger');
    var anchors = $$('#navLinks a');
    var sections = anchors.map(function (a) { return $(a.getAttribute('href')); }).filter(Boolean);

    function onScroll () {
      var st = window.scrollY;
      if (header) header.classList.toggle('shadow-md', st > 20);
      var mid = st + window.innerHeight * 0.32, cur = -1;
      sections.forEach(function (sec, i) { if (sec && sec.offsetTop <= mid) cur = i; });
      anchors.forEach(function (a, i) {
        a.classList.toggle('text-citiBlue', i === cur);
        a.classList.toggle('font-bold', i === cur);
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();

    if (burger && menu) {
      burger.addEventListener('click', function () {
        var open = menu.classList.toggle('hidden') === false;
        burger.setAttribute('aria-expanded', String(open));
      });
      menu.addEventListener('click', function (e) {
        if (e.target.tagName === 'A') {
          menu.classList.add('hidden');
          burger.setAttribute('aria-expanded', 'false');
        }
      });
    }
  })();

  /* ============================================================
     4 — COUNTERS
     ============================================================ */
  (function counters () {
    var els = $$('[data-count]');
    if (!els.length) return;
    function run (el) {
      var end = parseFloat(el.dataset.count);
      if (REDUCED) { el.textContent = end; return; }
      var t0 = null, dur = 1600;
      requestAnimationFrame(function step (ts) {
        if (t0 === null) t0 = ts;
        var p = clamp((ts - t0) / dur, 0, 1);
        el.textContent = Math.round(end * easeOut(p));
        if (p < 1) requestAnimationFrame(step);
      });
    }
    if (!('IntersectionObserver' in window)) { els.forEach(run); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.5 });
    els.forEach(function (el) { io.observe(el); });
  })();

  /* ============================================================
     5 — TOOLKIT (an editorial index, not a dashboard: name, a
         dotted leader line, a plain-English level — plus a
         flowing masthead line for everything else)
     ============================================================ */
  var LANG_SKILLS = [
    { n: 'Python',                v: 92 },
    { n: 'SQL',                   v: 90 },
    { n: 'PySpark',               v: 70 },
    { n: 'FastAPI / Deployment',  v: 72 }
  ];
  var ML_SKILLS = [
    { n: 'Machine Learning',            v: 88 },
    { n: 'Credit Risk & Scorecards',    v: 88 },
    { n: 'Statistical Inference',       v: 85 },
    { n: 'Optimisation / OR',           v: 82 }
  ];
  var TOOL_WORDS = [
    'PyTorch', 'TensorFlow', 'XGBoost', 'LightGBM', 'Optuna', 'RAG',
    'Transformers', 'Hugging Face', 'Databricks', 'AWS', 'Tableau', 'Power BI'
  ];
  function tierOf (v) { return v >= 88 ? 'Expert' : v >= 80 ? 'Advanced' : 'Proficient'; }

  (function toolkit () {
    var langHost = $('#toolkitLang'), mlHost = $('#toolkitML'), toolHost = $('#toolkitTools');
    if (!langHost || !mlHost || !toolHost) return;
    var section = langHost.closest('.mt-16') || langHost.parentElement.parentElement;

    function row (s, i) {
      return '<div class="group flex items-baseline gap-2 py-2.5 border-b border-charcoal/10 hover:border-citiBlue/50 transition-colors" data-reveal data-delay="' + (i * 45) + '">' +
        '<span class="relative pl-3 text-base md:text-lg font-serif font-bold text-charcoal whitespace-nowrap">' +
          '<span class="absolute left-0 top-1/2 -translate-y-1/2 w-0 group-hover:w-1.5 h-1.5 rounded-full bg-citiBlue transition-all duration-200 overflow-hidden"></span>' +
          s.n +
        '</span>' +
        '<span class="flex-1 border-b border-dotted border-charcoal/25 group-hover:border-citiBlue/40 transition-colors translate-y-[-5px]"></span>' +
        '<span class="text-[10px] font-mono uppercase tracking-widest text-charcoal/40 group-hover:text-citiBlue transition-colors whitespace-nowrap">' + tierOf(s.v) + '</span>' +
      '</div>';
    }
    langHost.innerHTML = LANG_SKILLS.map(row).join('');
    mlHost.innerHTML = ML_SKILLS.map(row).join('');

    toolHost.innerHTML = TOOL_WORDS.map(function (t, i) {
      var weight = i % 3 === 0 ? 'font-bold' : 'font-normal';
      var sep = i < TOOL_WORDS.length - 1 ? '<span class="text-charcoal/25 mx-1.5">·</span>' : '';
      return '<span class="' + weight + ' hover:text-citiBlue transition-colors cursor-default" data-reveal data-delay="' + (i * 25) + '">' + t + '</span>' + sep;
    }).join('');

    // this content is injected after the page's own reveal pass, so observe it now
    if ('IntersectionObserver' in window && !REDUCED) {
      var rio = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          var d = parseInt(e.target.dataset.delay || '0', 10);
          setTimeout(function () { e.target.classList.add('in'); }, d);
          rio.unobserve(e.target);
        });
      }, { threshold: 0.1 });
      $$('[data-reveal]', section).forEach(function (el) { rio.observe(el); });
    } else {
      $$('[data-reveal]', section).forEach(function (el) { el.classList.add('in'); });
    }
  })();

  /* ============================================================
     6 — PRINCIPLES SPOTLIGHT (hover a tab, swap the detail panel;
         on hover-capable devices the panel only shows while hovering)
     ============================================================ */
  (function principles () {
    var tabs = $$('#principleTabs .principle-tab');
    if (!tabs.length) return;
    var counter = $('#principleCounter');
    var host = $('#principlePanelHost');
    var CAN_HOVER = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    // the desktop panel is the single source of truth for each principle's
    // content — mirror it into the matching mobile accordion drawer once
    tabs.forEach(function (tab) {
      var n = tab.getAttribute('data-panel');
      var src = document.getElementById(n);
      var dest = document.getElementById('accordion-' + n.split('-')[1]);
      if (src && dest) dest.innerHTML = src.innerHTML;
    });

    function activate (tab) {
      var n = tab.getAttribute('data-panel');
      var panel = document.getElementById(n);
      var accordion = document.getElementById('accordion-' + n.split('-')[1]);
      if (!panel || !host) return;

      tabs.forEach(function (t) {
        var active = t === tab;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-selected', active ? 'true' : 'false');
        var acc = document.getElementById('accordion-' + t.getAttribute('data-panel').split('-')[1]);
        if (acc) acc.hidden = !active;
      });

      $$('.principle-panel', host).forEach(function (p) {
        var show = p === panel;
        p.hidden = !show;
      });
      if (!REDUCED) {
        [panel, accordion].forEach(function (el) {
          if (!el) return;
          el.style.animation = 'none';
          void el.offsetWidth; /* restart the fade-in */
          el.style.animation = '';
        });
      }

      if (counter) counter.textContent = '0' + (tabs.indexOf(tab) + 1) + ' / 05';
    }

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () { activate(tab); });
      if (CAN_HOVER) tab.addEventListener('mouseenter', function () { activate(tab); });
    });

    activate(tabs[0]); /* the first principle is always expanded by default; hovering
                           (or tapping, on touch) another just moves that focus — the
                           last one visited stays put once you look away */
  })();

  /* ============================================================
     7 — TIMELINE PLACE PREVIEW (hover an entry on desktop and the
         image follows the cursor; on touch, tap an entry instead —
         same photo, same box, just a different way to trigger it)
     ============================================================ */
  (function timelinePreview () {
    var entries = $$('.place-hover[data-preview-img]');
    var box = $('#placePreview');
    if (!entries.length || !box) return;

    var img = $('#placePreviewImg', box);
    var label = $('#placePreviewLabel', box);
    var W = 144, H = 192, PAD = 24;
    var CAN_HOVER = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    var activeEntry = null;

    function fill (entry) {
      img.src = entry.getAttribute('data-preview-img');
      img.alt = entry.getAttribute('data-preview-label') || '';
      label.textContent = entry.getAttribute('data-preview-label') || '';
    }
    function show () {
      box.classList.remove('opacity-0', 'scale-95');
      box.classList.add('opacity-100', 'scale-100');
    }
    function hide () {
      activeEntry = null;
      box.classList.add('opacity-0', 'scale-95');
      box.classList.remove('opacity-100', 'scale-100');
    }
    function moveToCursor (e) {
      var x = clamp(e.clientX + PAD, 8, window.innerWidth - W - 8);
      var y = clamp(e.clientY - H / 2, 8, window.innerHeight - H - 8);
      box.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    }
    function moveNearEntry (entry) {
      var rect = entry.getBoundingClientRect();
      var x = clamp(rect.left + rect.width / 2 - W / 2, 8, window.innerWidth - W - 8);
      var y = rect.top - H - 14;
      if (y < 8) y = Math.min(rect.bottom + 14, window.innerHeight - H - 8);
      box.style.transform = 'translate(' + x + 'px,' + y + 'px)';
    }

    entries.forEach(function (entry) {
      if (CAN_HOVER) {
        entry.addEventListener('mouseenter', function (e) { fill(entry); show(); moveToCursor(e); });
        entry.addEventListener('mousemove', moveToCursor);
        entry.addEventListener('mouseleave', hide);
      } else {
        entry.addEventListener('click', function (e) {
          e.stopPropagation();
          if (activeEntry === entry) { hide(); return; }
          activeEntry = entry;
          fill(entry); show(); moveNearEntry(entry);
        });
      }
    });

    if (!CAN_HOVER) {
      document.addEventListener('click', function () { if (activeEntry) hide(); });
    }
  })();

  /* ============================================================
     8 — GRADIENT DESCENT (playable: drag to orbit a real loss
         surface in 3D, drag the learning-rate slider and watch the
         descent path recompute and re-walk itself downhill)
     ============================================================ */
  (function gradientDescent () {
    var canvas = $('#gdCanvas'); if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var readout = $('#gdReadout');
    var lrInput = $('#gdLR'), lrVal = $('#gdLRVal');
    var stageEls = $$('.gd-stage-dot');

    var DPR = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, scale = 0, cx = 0, cy = 0;

    function resize () {
      var rect = canvas.getBoundingClientRect();
      W = rect.width; H = rect.height;
      if (!W || !H) return;
      canvas.width = W * DPR; canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      scale = Math.min(W, H) * 0.155;
      cx = W / 2 - W * 0.04; cy = H / 2 + H * 0.06;
    }
    resize();
    window.addEventListener('resize', resize);

    /* -- the loss surface: an inverted 2D Gaussian, i.e. the negative-log
       of a bivariate normal — one smooth bowl, zero at its true mean -- */
    var DOM = 3, N = 22, HEIGHT_SCALE = 0.6;
    var MU_X = 0.4, MU_Y = -0.3, SIGMA = 1.6, PEAK = 3.2;
    function lossF (x, y) {
      var r2 = (x - MU_X) * (x - MU_X) + (y - MU_Y) * (y - MU_Y);
      return PEAK * (1 - Math.exp(-r2 / (2 * SIGMA * SIGMA)));
    }
    var grid = [], maxLossVal = 0, FLOOR = 0;
    for (var gi = 0; gi <= N; gi++) {
      var row = [];
      for (var gj = 0; gj <= N; gj++) {
        var gx = -DOM + (2 * DOM * gi) / N, gy = -DOM + (2 * DOM * gj) / N;
        var gz = lossF(gx, gy);
        row.push({ x: gx, y: gy, z: gz });
        if (gz > maxLossVal) maxLossVal = gz;
      }
      grid.push(row);
    }

    function project (wx, wy, wz, rotX, rotY) {
      var cosY = Math.cos(rotY), sinY = Math.sin(rotY);
      var x1 = wx * cosY - wy * sinY;
      var z1 = wx * sinY + wy * cosY;
      var cosX = Math.cos(rotX), sinX = Math.sin(rotX);
      var ele = wz * HEIGHT_SCALE;
      var y2 = ele * cosX - z1 * sinX;
      return { sx: cx + x1 * scale, sy: cy - y2 * scale };
    }

    /* -- theme-aware canvas colours, refreshed on toggle -- */
    var COL_LINE = '17,17,17', COL_BLUE = '0,70,190';
    function refreshColors () {
      var cs = getComputedStyle(document.documentElement);
      COL_LINE = cs.getPropertyValue('--c-charcoal').trim().split(/\s+/).join(',');
      COL_BLUE = cs.getPropertyValue('--c-blue').trim().split(/\s+/).join(',');
    }
    refreshColors();
    var themeBtn = $('#themeBtn');
    if (themeBtn) themeBtn.addEventListener('click', function () { setTimeout(refreshColors, 0); });

    /* -- gradient descent: real numerical gradient, real steps -- */
    function gradAt (x, y) {
      var eps = 0.01;
      return [
        (lossF(x + eps, y) - lossF(x - eps, y)) / (2 * eps),
        (lossF(x, y + eps) - lossF(x, y - eps)) / (2 * eps)
      ];
    }
    function computePath (lr) {
      var path = [], x = -2.3, y = 2.1;
      path.push({ x: x, y: y, z: lossF(x, y) });
      for (var s = 0; s < 28; s++) {
        var g = gradAt(x, y);
        x = clamp(x - lr * g[0], -DOM, DOM);
        y = clamp(y - lr * g[1], -DOM, DOM);
        path.push({ x: x, y: y, z: lossF(x, y) });
      }
      return path;
    }

    var path = computePath(parseInt(lrInput.value, 10) / 100);
    var stepIdx = 0, lastStepTime = performance.now();
    var STEP_MS = 480;

    function updateReadout () {
      var p = path[stepIdx];
      if (readout) {
        readout.innerHTML = 'x: ' + p.x.toFixed(2) + '&nbsp;&nbsp;y: ' + p.y.toFixed(2) +
          '&nbsp;&nbsp;loss: ' + Math.max(p.z, 0).toFixed(3);
      }
      var stage = stepIdx === 0 ? 'start' : stepIdx === path.length - 1 ? 'min' : 'iterate';
      stageEls.forEach(function (el) { el.classList.toggle('is-active', el.dataset.stage === stage); });
    }
    updateReadout();

    if (lrInput) {
      lrInput.addEventListener('input', function () {
        var lr = parseInt(lrInput.value, 10) / 100;
        if (lrVal) lrVal.textContent = lr.toFixed(2);
        path = computePath(lr);
        stepIdx = 0; lastStepTime = performance.now();
        updateReadout();
      });
    }

    /* -- the three axes drawn as real edges of the 3D scene (they rotate
       with everything else) — Loss vertical, x and y along the base -- */
    function drawAxes (rotX, rotY) {
      function seg (a, b) {
        var p1 = project(a[0], a[1], a[2], rotX, rotY), p2 = project(b[0], b[1], b[2], rotX, rotY);
        ctx.beginPath(); ctx.moveTo(p1.sx, p1.sy); ctx.lineTo(p2.sx, p2.sy); ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(' + COL_LINE + ',.3)';
      ctx.fillStyle = 'rgba(' + COL_LINE + ',.5)';
      ctx.lineWidth = 1;

      seg([-DOM, DOM, FLOOR], [DOM, DOM, FLOOR]);
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      [-DOM, 0, DOM].forEach(function (v) {
        var p = project(v, DOM, FLOOR, rotX, rotY);
        ctx.fillText(String(v), p.sx, p.sy + 8);
      });
      var xl = project(0, DOM, FLOOR, rotX, rotY);
      ctx.font = '600 11px "JetBrains Mono", monospace';
      ctx.fillText('x', xl.sx, xl.sy + 22);

      seg([-DOM, -DOM, FLOOR], [-DOM, DOM, FLOOR]);
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      [-DOM, 0, DOM].forEach(function (v) {
        var p = project(-DOM, v, FLOOR, rotX, rotY);
        ctx.fillText(String(v), p.sx - 6, p.sy);
      });
      var yl = project(-DOM, 0, FLOOR, rotX, rotY);
      ctx.font = '600 11px "JetBrains Mono", monospace';
      ctx.fillText('y', yl.sx - 22, yl.sy);

      seg([-DOM, DOM, FLOOR], [-DOM, DOM, maxLossVal]);
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      for (var v = 0; v <= maxLossVal + 0.3; v++) {
        var p = project(-DOM, DOM, v, rotX, rotY);
        ctx.fillText(String(v), p.sx - 6, p.sy);
      }
      var ll = project(-DOM, DOM, maxLossVal, rotX, rotY);
      ctx.font = '600 11px "JetBrains Mono", monospace';
      ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
      ctx.fillText('Loss', ll.sx - 8, ll.sy - 6);
    }

    /* -- draw: axes, mesh wireframe, the descent path so far, the current step -- */
    function draw (rotX, rotY) {
      ctx.clearRect(0, 0, W, H);
      drawAxes(rotX, rotY);

      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(' + COL_LINE + ',.14)';
      var i, j, p;
      for (i = 0; i <= N; i++) {
        ctx.beginPath();
        for (j = 0; j <= N; j++) {
          p = project(grid[i][j].x, grid[i][j].y, grid[i][j].z, rotX, rotY);
          if (j === 0) ctx.moveTo(p.sx, p.sy); else ctx.lineTo(p.sx, p.sy);
        }
        ctx.stroke();
      }
      for (j = 0; j <= N; j++) {
        ctx.beginPath();
        for (i = 0; i <= N; i++) {
          p = project(grid[i][j].x, grid[i][j].y, grid[i][j].z, rotX, rotY);
          if (i === 0) ctx.moveTo(p.sx, p.sy); else ctx.lineTo(p.sx, p.sy);
        }
        ctx.stroke();
      }

      ctx.beginPath();
      path.forEach(function (pt, k) {
        var pp = project(pt.x, pt.y, pt.z, rotX, rotY);
        if (k === 0) ctx.moveTo(pp.sx, pp.sy); else ctx.lineTo(pp.sx, pp.sy);
      });
      ctx.strokeStyle = 'rgba(' + COL_BLUE + ',.35)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      for (var k = 0; k <= stepIdx; k++) {
        var pt = path[k], pp = project(pt.x, pt.y, pt.z, rotX, rotY), isCur = k === stepIdx;
        if (isCur) {
          ctx.beginPath(); ctx.arc(pp.sx, pp.sy, 8, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(' + COL_BLUE + ',.15)'; ctx.fill();
        }
        ctx.beginPath(); ctx.arc(pp.sx, pp.sy, isCur ? 5 : 3, 0, Math.PI * 2);
        ctx.fillStyle = isCur ? 'rgb(' + COL_BLUE + ')' : 'rgba(' + COL_BLUE + ',.5)';
        ctx.fill();
      }
    }

    /* -- orbit: drag (mouse/touch/pen) to rotate, gentle drift when idle -- */
    var rotX = 0.62, rotY = 0.55, velX = 0, velY = 0, dragging = false, lastX = 0, lastY = 0;

    canvas.addEventListener('pointerdown', function (e) {
      dragging = true; velX = 0; velY = 0;
      lastX = e.clientX; lastY = e.clientY;
      canvas.classList.add('is-dragging');
      canvas.setPointerCapture && canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dx = e.clientX - lastX, dy = e.clientY - lastY;
      lastX = e.clientX; lastY = e.clientY;
      velX = dx * 0.006; velY = dy * 0.006;
      rotY += velX; rotX = clamp(rotX - velY, 0.12, 1.3);
      e.preventDefault();
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (evt) {
      canvas.addEventListener(evt, function () {
        dragging = false;
        canvas.classList.remove('is-dragging');
      });
    });

    function frame (now) {
      if (!dragging) {
        if (Math.abs(velX) > 0.0002 || Math.abs(velY) > 0.0002) {
          rotY += velX; rotX = clamp(rotX - velY, 0.12, 1.3);
          velX *= 0.94; velY *= 0.94;
        } else if (!REDUCED) {
          rotY += 0.0016;
        }
      }
      // walk downhill one step at a time; once it reaches the minimum it
      // stays pinned there — no looping back to Start on its own. Only a
      // learning-rate change (see below) recomputes the path and restarts it.
      if (!REDUCED && stepIdx < path.length - 1 && now - lastStepTime > STEP_MS) {
        lastStepTime = now;
        stepIdx += 1;
        updateReadout();
      }
      draw(rotX, rotY);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  })();




  /* ============================================================
     9 — CONTACT FORM (no backend — hands off to the mail client)
     ============================================================ */
  (function form () {
    var f = $('#contactForm'); if (!f) return;
    var note = $('#formNote');
    var rules = {
      fName:  function (v) { return v.trim().length >= 2 || 'Please enter your name.'; },
      fEmail: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'That email does not look right.'; },
      fMsg:   function (v) { return v.trim().length >= 12 || 'A little more detail, please.'; }
    };
    function check (id) {
      var el = $('#' + id), out = $('[data-err="' + id + '"]');
      var r = rules[id](el.value);
      out.textContent = r === true ? '' : r;
      el.setAttribute('aria-invalid', r === true ? 'false' : 'true');
      return r === true;
    }
    Object.keys(rules).forEach(function (id) {
      var el = $('#' + id);
      el.addEventListener('blur', function () { check(id); });
      el.addEventListener('input', function () { if ($('[data-err="' + id + '"]').textContent) check(id); });
    });
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!Object.keys(rules).map(check).every(Boolean)) {
        note.className = 'text-xs font-mono text-red-600 min-h-[1.4em]';
        note.textContent = 'Please fix the fields above.';
        return;
      }
      var subject = encodeURIComponent('Portfolio enquiry from ' + $('#fName').value.trim());
      var body = encodeURIComponent($('#fMsg').value.trim() + '\n\n— ' + $('#fName').value.trim() + ' (' + $('#fEmail').value.trim() + ')');
      note.className = 'text-xs font-mono text-emerald-700 min-h-[1.4em]';
      note.textContent = 'Opening your mail client…';
      window.location.href = 'mailto:nasrinakhtar075@gmail.com?subject=' + subject + '&body=' + body;
      setTimeout(function () { note.textContent = 'If nothing opened, email nasrinakhtar075@gmail.com'; }, 1800);
    });
  })();

  var y = $('#year'); if (y) y.textContent = new Date().getFullYear();
})();
