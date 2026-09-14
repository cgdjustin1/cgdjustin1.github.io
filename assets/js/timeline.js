/* Timeline view: maps posts, questions, projects and life events onto one axis.
   Opened from the nav button; the data comes from _includes/timeline-data.html. */
(function () {
  'use strict';

  var dataEl = document.getElementById('timeline-data');
  var opener = document.querySelector('.tl-open');
  if (!dataEl || !opener) return;
  var data;
  try { data = JSON.parse(dataEl.textContent); } catch (e) { return; }

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var touch = window.matchMedia('(hover: none)').matches;
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var KINDS = [
    { id: 'post', en: 'Writing', zh: '文章' },
    { id: 'question', en: 'Questions', zh: '问题' },
    { id: 'project', en: 'Projects', zh: '项目' },
    { id: 'life', en: 'Life', zh: '经历' }
  ];

  function both(en, zh) {
    return '<span data-i18n="en" lang="en">' + en + '</span><span data-i18n="zh" lang="zh">' + zh + '</span>';
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function kindOf(id) {
    for (var i = 0; i < KINDS.length; i++) if (KINDS[i].id === id) return KINDS[i];
    return KINDS[0];
  }

  // Dates are "2023", "2026-01" or "2026-09-13"; a coarse date sits mid-year or mid-month
  function parseDate(s) {
    var p = String(s).split('-').map(Number);
    if (!p[1]) return { time: Date.UTC(p[0], 6, 1), precision: 'year', y: p[0] };
    if (!p[2]) return { time: Date.UTC(p[0], p[1] - 1, 15), precision: 'month', y: p[0], m: p[1] };
    return { time: Date.UTC(p[0], p[1] - 1, p[2]), precision: 'day', y: p[0], m: p[1], d: p[2] };
  }
  function shortDate(d) {
    if (d.precision === 'year') return String(d.y);
    if (d.precision === 'month') return d.y + '.' + pad(d.m);
    return d.y + '.' + pad(d.m) + '.' + pad(d.d);
  }
  function longDate(d, l) {
    if (l === 'zh') {
      if (d.precision === 'year') return d.y + '年';
      if (d.precision === 'month') return d.y + '年' + d.m + '月';
      return d.y + '年' + d.m + '月' + d.d + '日';
    }
    if (d.precision === 'year') return String(d.y);
    if (d.precision === 'month') return MONTHS[d.m - 1] + ' ' + d.y;
    return MONTHS[d.m - 1] + ' ' + d.d + ', ' + d.y;
  }

  // ---- events ----
  var tracks = [{ id: 'writing', kind: 'post', en: 'Writing', zh: '文章', url: '/blog/', events: data.posts || [] }]
    .concat(data.tracks || []);
  var events = [];
  tracks.forEach(function (t, i) {
    t.index = i;
    t.items = [];
    (t.events || []).forEach(function (e) {
      if (!e || !e.date) return;
      var ev = {
        track: t,
        kind: t.kind,
        date: parseDate(e.date),
        en: e.en || e.zh || '',
        zh: e.zh || e.en || '',
        url: e.url || t.url || '',
        descEn: e.desc_en || e.desc || '',
        descZh: e.desc_zh || e.desc || '',
        planned: !!e.planned
      };
      ev.time = ev.date.time;
      t.items.push(ev);
      events.push(ev);
    });
    t.items.sort(function (a, b) { return a.time - b.time; });
  });
  events.sort(function (a, b) { return a.time - b.time; });
  if (!events.length) return;

  var now = Date.now();
  var nowYear = new Date(now).getUTCFullYear();
  var horizonData = data.horizon || null;
  var futureYears = Number(data.future_years) || 3;
  var openTracks = tracks.filter(function (t) { return t.open && t.items.length; });
  var yearStart = new Date(events[0].time).getUTCFullYear();
  var lastYear = Math.max(nowYear, new Date(events[events.length - 1].time).getUTCFullYear());
  // With a horizon the axis runs on into the future and ends at the invitation; otherwise just past the last event
  var yearEnd = horizonData ? nowYear + futureYears + 1 : lastYear + 1;
  var t0 = Date.UTC(yearStart, 0, 1);
  var t1 = Date.UTC(yearEnd, 0, 1);
  var years = [];
  for (var y = yearStart; y <= yearEnd; y++) {
    if (horizonData && y === yearEnd) break;
    years.push({ year: y, time: Date.UTC(y, 0, 1), future: y > nowYear });
  }

  // The axis is half calendar time, half event order, so a crowded year gets more room than an empty one
  var ranks = [[t0, 0]];
  events.forEach(function (ev, i) {
    var f = (i + 1) / (events.length + 1);
    if (ranks[ranks.length - 1][0] === ev.time) ranks[ranks.length - 1][1] = f;
    else ranks.push([ev.time, f]);
  });
  ranks.push([t1, 1]);
  function rankOf(t) {
    if (t <= t0) return 0;
    if (t >= t1) return 1;
    for (var i = 1; i < ranks.length; i++) {
      if (t <= ranks[i][0]) {
        var a = ranks[i - 1], b = ranks[i];
        return a[1] + (b[1] - a[1]) * (t - a[0]) / ((b[0] - a[0]) || 1);
      }
    }
    return 1;
  }

  // ---- state ----
  var overlay, stage, canvas, nodesBox, axis, nowMark, card, hot, sub, modeBtn, closeBtn;
  var sky, starsCanvas, cursor, readout, futureAxis, beams, horizonEl, horizonEv, nowPanel, nowLine;
  var built = false, isOpen = false, mode = 'axis', scrollable = false, panning = null;
  var W = 0, H = 0, padL = 48, padR = 48, axisY = 0;
  var enabled = {};
  KINDS.forEach(function (k) { enabled[k.id] = true; });
  var lastFocus = null, cardFor = null;

  function xOf(time) {
    var u = 0.5 * (time - t0) / (t1 - t0) + 0.5 * rankOf(time);
    return padL + u * (W - padL - padR);
  }
  // Inverse of xOf, by bisection (xOf is monotonic)
  function timeAt(x) {
    var lo = t0, hi = t1;
    for (var i = 0; i < 40; i++) {
      var mid = (lo + hi) / 2;
      if (xOf(mid) < x) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
  }

  // ---- starfield ----
  var stars = [], starsRaf = 0;
  function drawStars(ctx, w, h, advance) {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#d6e4ff';
    for (var i = 0; i < stars.length; i++) {
      var st = stars[i];
      if (advance) {
        st.y -= st.s;
        st.x += st.s * 0.35;
        st.p += 0.025;
        if (st.y < -2) { st.y = h + 2; st.x = Math.random() * w; }
        if (st.x > w + 2) st.x = -2;
      }
      ctx.globalAlpha = 0.15 + 0.6 * st.a * (0.5 + 0.5 * Math.sin(st.p));
      ctx.beginPath();
      ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  function startStars() {
    cancelAnimationFrame(starsRaf);
    var w = overlay.clientWidth, h = overlay.clientHeight;
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    starsCanvas.width = Math.round(w * dpr);
    starsCanvas.height = Math.round(h * dpr);
    var ctx = starsCanvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var n = w < 640 ? 45 : 120;
    stars = [];
    for (var i = 0; i < n; i++) {
      stars.push({ x: Math.random() * w, y: Math.random() * h, r: 0.5 + Math.random() * 1.2, a: 0.3 + Math.random() * 0.7, s: 0.03 + Math.random() * 0.07, p: Math.random() * Math.PI * 2 });
    }
    if (reduceMotion) { drawStars(ctx, w, h, false); return; }
    var last = 0;
    function frame(t) {
      if (!isOpen) return;
      starsRaf = requestAnimationFrame(frame);
      if (t - last < 33) return;
      last = t;
      drawStars(ctx, w, h, true);
    }
    starsRaf = requestAnimationFrame(frame);
  }

  function build() {
    overlay = el('div', 'tl-overlay');
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Timeline / 时间线');
    overlay.hidden = true;
    overlay.innerHTML =
      '<div class="tl-sky"><i class="tl-aurora a1"></i><i class="tl-aurora a2"></i><i class="tl-aurora a3"></i></div>' +
      '<canvas class="tl-stars" aria-hidden="true"></canvas>' +
      '<div class="tl-floor"></div><div class="tl-scan"></div>' +
      '<header class="tl-bar">' +
        '<div class="tl-title"><span class="tl-name">' + both('Timeline', '时间线') + '</span><span class="tl-sub"></span></div>' +
        '<div class="tl-chips"></div>' +
        '<div class="tl-actions">' +
          '<button class="tl-lang" type="button" aria-label="Switch language / 切换语言">' + both('中文', 'EN') + '</button>' +
          '<button class="tl-mode" type="button" aria-pressed="false">' + both('Tracks', '分轨') + '</button>' +
          '<button class="tl-close" type="button" aria-label="Close / 关闭"><span class="tl-close-x" aria-hidden="true">\u2715</span><span class="tl-close-text">' + both('Close', '关闭') + '</span> <kbd>esc</kbd></button>' +
        '</div>' +
      '</header>' +
      '<div class="tl-stage-wrap">' +
        '<i class="tl-corner tl-corner-tl"></i><i class="tl-corner tl-corner-tr"></i><i class="tl-corner tl-corner-bl"></i><i class="tl-corner tl-corner-br"></i>' +
        '<div class="tl-stage"><div class="tl-canvas">' +
          '<div class="tl-rows"></div><div class="tl-ticks"></div>' +
          '<div class="tl-axis"><i></i><b></b></div>' +
          '<div class="tl-now"><span>' + both('now', '现在') + '</span></div>' +
          '<div class="tl-axis-future"></div><svg class="tl-beams" aria-hidden="true"></svg>' +
          '<div class="tl-now-line"></div><div class="tl-now-panel"></div>' +
          '<div class="tl-hot"></div><div class="tl-cursor"><span class="tl-readout"></span></div><div class="tl-nodes"></div>' +
        '</div></div>' +
      '</div>' +
      '<div class="tl-drag-hint">' + both('\u2190 drag \u2192', '\u2190 左右拖动 \u2192') + '</div>' +
      '<div class="tl-card" hidden></div>';
    document.body.appendChild(overlay);

    stage = overlay.querySelector('.tl-stage');
    canvas = overlay.querySelector('.tl-canvas');
    sky = overlay.querySelector('.tl-sky');
    starsCanvas = overlay.querySelector('.tl-stars');
    cursor = overlay.querySelector('.tl-cursor');
    readout = overlay.querySelector('.tl-readout');
    futureAxis = overlay.querySelector('.tl-axis-future');
    beams = overlay.querySelector('.tl-beams');
    nowLine = overlay.querySelector('.tl-now-line');
    nowPanel = overlay.querySelector('.tl-now-panel');
    nodesBox = overlay.querySelector('.tl-nodes');
    axis = overlay.querySelector('.tl-axis');
    nowMark = overlay.querySelector('.tl-now');
    card = overlay.querySelector('.tl-card');
    hot = overlay.querySelector('.tl-hot');
    sub = overlay.querySelector('.tl-sub');
    modeBtn = overlay.querySelector('.tl-mode');
    closeBtn = overlay.querySelector('.tl-close');

    var chips = overlay.querySelector('.tl-chips');
    KINDS.forEach(function (k) {
      var b = el('button', 'tl-chip', '<i></i>' + both(k.en, k.zh));
      b.type = 'button';
      b.dataset.kind = k.id;
      b.setAttribute('aria-pressed', 'true');
      b.addEventListener('click', function () {
        enabled[k.id] = !enabled[k.id];
        b.setAttribute('aria-pressed', String(enabled[k.id]));
        hideCard();
        apply(false);
      });
      chips.appendChild(b);
    });

    var ticks = overlay.querySelector('.tl-ticks');
    years.forEach(function (yr, i) {
      yr.line = el('div', 'tl-vline', '<i></i>');
      yr.tick = el('div', 'tl-tick' + (i === 0 ? ' is-first' : i === years.length - 1 && !horizonData ? ' is-last' : '') + (yr.future ? ' is-future' : ''), '<span>' + yr.year + '</span>');
      ticks.appendChild(yr.line);
      ticks.appendChild(yr.tick);
    });

    var rows = overlay.querySelector('.tl-rows');
    tracks.forEach(function (t) {
      t.row = el('div', 'tl-row', '<span class="tl-row-name">' + both(esc(t.en), esc(t.zh)) + '</span><i class="tl-row-line"></i>');
      t.row.dataset.kind = t.kind;
      t.rowName = t.row.firstChild;
      t.rowLine = t.row.lastChild;
      rows.appendChild(t.row);
    });

    // Open questions carry on past today as beams; the horizon is where they lead
    openTracks.forEach(function (t) {
      t.beam = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      t.beam.setAttribute('data-kind', t.kind);
      t.beam.classList.add('is-flowing');
      beams.appendChild(t.beam);
    });
    if (horizonData) {
      horizonEv = { horizon: true, kind: 'horizon', track: null, en: horizonData.en || '', zh: horizonData.zh || horizonData.en || '', descEn: horizonData.desc_en || '', descZh: horizonData.desc_zh || '', url: horizonData.url || '', x: 0, y: 0 };
      horizonEl = el('a', 'tl-horizon', '<i class="tl-horizon-star"></i><span class="tl-horizon-label">' + both(esc(horizonEv.en), esc(horizonEv.zh)) + ' \u2192</span>');
      horizonEl.dataset.kind = 'horizon';
      if (horizonEv.url) horizonEl.href = horizonEv.url;
      if (touch) {
        horizonEl.addEventListener('click', function (e) {
          if (cardFor !== horizonEv) { e.preventDefault(); showCard(horizonEv); }
        });
      } else {
        horizonEl.addEventListener('mouseenter', function () { showCard(horizonEv); });
        horizonEl.addEventListener('mouseleave', hideCard);
      }
      horizonEl.addEventListener('focus', function () { showCard(horizonEv); });
      horizonEl.addEventListener('blur', hideCard);
      canvas.appendChild(horizonEl);
    }

    events.forEach(function (ev) {
      ev.node = el(ev.url ? 'a' : 'div', 'tl-node', '<i class="tl-dot" style="--bd:' + (Math.random() * 3).toFixed(2) + 's"></i>');
      ev.leader = el('i', 'tl-leader');
      ev.label = el(ev.url ? 'a' : 'div', 'tl-label',
        '<span class="tl-label-in"><span class="tl-date">' + shortDate(ev.date) + '</span>' + both(esc(ev.en), esc(ev.zh)) + '</span>');
      ev.leader.dataset.kind = ev.kind;
      if (ev.planned) ev.node.classList.add('is-planned');
      [ev.node, ev.label].forEach(function (a) {
        a.dataset.kind = ev.kind;
        if (ev.url) a.href = ev.url;
        if (touch) {
          // First tap shows the card, the second one follows the link
          a.addEventListener('click', function (e) {
            if (cardFor !== ev) { e.preventDefault(); showCard(ev); }
          });
        } else {
          a.addEventListener('mouseenter', function () { showCard(ev); });
          a.addEventListener('mouseleave', hideCard);
        }
        a.addEventListener('focus', function () { showCard(ev); });
        a.addEventListener('blur', hideCard);
      });
      if (!ev.url) {
        // Nothing to link to (e.g. a life milestone): still reachable by keyboard and screen readers
        ev.node.tabIndex = 0;
        ev.node.setAttribute('role', 'button');
        ev.node.setAttribute('aria-label', ev.en);
        ev.node.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showCard(ev); }
        });
        ev.label.setAttribute('aria-hidden', 'true');
      }
      nodesBox.appendChild(ev.leader);
      nodesBox.appendChild(ev.label);
      nodesBox.appendChild(ev.node);
    });

    var nowItems = data.now_items || [];
    if (nowItems.length) {
      nowPanel.innerHTML = '<div class="tl-now-panel-head">' + both("Problems I'm solving", '在解决的问题') + '</div><ul>' +
        nowItems.map(function (it) {
          var body = both(esc(it.en), esc(it.zh));
          return '<li>' + (it.url ? '<a href="' + it.url + '">' + body + '</a>' : body) + '</li>';
        }).join('') + '</ul>';
    } else {
      nowPanel.hidden = true;
      nowLine.hidden = true;
    }

    modeBtn.addEventListener('click', function () {
      mode = mode === 'axis' ? 'tracks' : 'axis';
      modeBtn.setAttribute('aria-pressed', String(mode === 'tracks'));
      stage.classList.toggle('is-tracks', mode === 'tracks');
      hideCard();
      layout(false);
    });
    closeBtn.addEventListener('click', close);
    // The nav's language toggle is behind the overlay, so the overlay gets its own
    overlay.querySelector('.tl-lang').addEventListener('click', function () {
      var navToggle = document.querySelector('.lang-toggle');
      if (navToggle) { navToggle.click(); return; }
      var next = root.getAttribute('data-lang') === 'zh' ? 'en' : 'zh';
      root.setAttribute('data-lang', next);
      try { localStorage.setItem('lang', next); } catch (e) {}
    });
    stage.addEventListener('click', function (e) {
      if (e.target === stage || e.target === canvas || e.target.parentNode === canvas) hideCard();
    });
    // Focusing a chip can trigger the browser's own scroll-into-view on the overlay itself,
    // sliding the header out of view; snap it back since the overlay is never meant to scroll.
    overlay.addEventListener('focusin', function () {
      if (overlay.scrollLeft) overlay.scrollLeft = 0;
    });
    if (!touch) {
      // A hairline follows the pointer and reads out the date under it
      stage.addEventListener('mousemove', function (e) {
        var sr = stage.getBoundingClientRect();
        var x = e.clientX - sr.left + stage.scrollLeft;
        if (x < padL || x > W - padR) { cursor.classList.remove('is-on'); return; }
        var d = new Date(timeAt(x));
        readout.textContent = d.getUTCFullYear() + '.' + pad(d.getUTCMonth() + 1);
        readout.style.transform = x > W - 90 ? 'translateX(calc(-100% - 8px))' : 'translateX(8px)';
        cursor.style.transform = 'translateX(' + x + 'px)';
        cursor.classList.add('is-on');
      });
      stage.addEventListener('mouseleave', function () { cursor.classList.remove('is-on'); });
      // The sky drifts a little against the pointer, for depth
      overlay.addEventListener('mousemove', function (e) {
        var mx = e.clientX / window.innerWidth - 0.5, my = e.clientY / window.innerHeight - 0.5;
        sky.style.transform = 'translate(' + (-mx * 26).toFixed(1) + 'px,' + (-my * 16).toFixed(1) + 'px)';
      });
    }
    // A touch or wheel takes over from the opening pan and retires the drag hint
    ['touchstart', 'wheel', 'pointerdown'].forEach(function (type) {
      stage.addEventListener(type, function () {
        panning = null;
        overlay.classList.add('has-scrolled');
      }, { passive: true });
    });
  }

  function apply(instant) {
    events.forEach(function (ev) {
      var off = !enabled[ev.kind];
      ev.node.classList.toggle('is-off', off);
      ev.label.classList.toggle('is-off', off);
      ev.leader.classList.toggle('is-off', off);
    });
    tracks.forEach(function (t) { t.row.classList.toggle('is-off', !enabled[t.kind]); });
    setSub(events.filter(function (ev) { return enabled[ev.kind]; }).length);
    layout(instant);
  }

  function setSub(n) {
    var end = horizonData ? both('future', '未来') : String(lastYear);
    sub.innerHTML = both(n + ' events · ' + yearStart + ' → ', n + ' 个节点 · ' + yearStart + ' → ') + end;
  }
  function countUp(n) {
    var started = performance.now();
    function step(t) {
      var p = Math.min(1, (t - started) / 1100);
      setSub(Math.round(n * (1 - Math.pow(1 - p, 3))));
      if (p < 1 && isOpen) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function layout(instant) {
    if (!built || !isOpen) return;
    if (instant) overlay.classList.add('no-anim');
    var vw = stage.clientWidth;
    H = stage.clientHeight;
    var mobile = vw < 640;
    // On a narrow screen the axis gets a wide canvas that scrolls sideways instead of squeezing everything in
    W = mobile ? Math.max(vw, (years.length - 1) * 190 + 48) : vw;
    scrollable = W > vw + 1;
    canvas.style.width = W + 'px';
    overlay.classList.toggle('is-scrollable', scrollable);
    padL = mobile ? 24 : 48;
    padR = mobile ? 24 : 48;
    var axisMode = mode === 'axis';
    var visible = events.filter(function (ev) { return enabled[ev.kind]; });

    axisY = axisMode ? Math.round(H * 0.5) : 30;
    var xNow = xOf(now), xEnd = W - padR;
    // The beam is solid up to today and dashed beyond it
    axis.style.left = padL + 'px';
    axis.style.width = (Math.min(xNow, xEnd) - padL) + 'px';
    axis.style.transform = 'translateY(' + axisY + 'px)';
    futureAxis.style.left = xNow + 'px';
    futureAxis.style.width = Math.max(0, xEnd - xNow) + 'px';
    futureAxis.style.transform = 'translateY(' + axisY + 'px)';
    if (!nowPanel.hidden) {
      var pw = nowPanel.offsetWidth || 190, ph = nowPanel.offsetHeight || 70;
      var npY = mobile ? 40 : 56;
      var npX = clamp(xNow + 24, padL, W - padR - pw);
      nowPanel.style.transform = 'translate(' + npX + 'px,' + npY + 'px)';
      nowLine.style.left = (npX + 14) + 'px';
      nowLine.style.top = (npY + ph) + 'px';
      nowLine.style.height = Math.max(0, axisY - (npY + ph)) + 'px';
      nowPanel.classList.toggle('is-hidden', !axisMode);
      nowLine.classList.toggle('is-hidden', !axisMode);
    }
    var lastTickX = -Infinity;
    years.forEach(function (yr) {
      yr.x = xOf(yr.time);
      yr.line.style.transform = 'translateX(' + yr.x + 'px)';
      yr.tick.style.transform = 'translate(' + yr.x + 'px,' + axisY + 'px)';
      // Year labels that would run into each other on a narrow screen are dropped; the line stays
      var crowded = yr.x - lastTickX < 48;
      yr.tick.classList.toggle('is-crowded', crowded);
      if (!crowded) lastTickX = yr.x;
    });
    nowMark.style.transform = 'translateX(' + xOf(now) + 'px)';
    nowMark.style.setProperty('--ay', axisY + 'px');

    // Tracks mode: one row per track under the axis
    var rowTop = axisY + 50;
    var rowH = clamp((H - rowTop - 20) / tracks.length, 44, 80);
    tracks.forEach(function (t, i) {
      t.y = rowTop + i * rowH + rowH * 0.55;
      t.row.style.transform = 'translateY(' + (axisMode ? axisY : t.y) + 'px)';
      var x1 = t.items.length ? xOf(t.items[0].time) : padL;
      var x2 = t.ongoing ? xOf(now) : (t.items.length ? xOf(t.items[t.items.length - 1].time) : padL);
      t.rowLine.style.left = x1 + 'px';
      t.rowLine.style.width = Math.max(0, x2 - x1) + 'px';
    });

    // Beams from today to the horizon: a spindle of curves in axis mode, a straight run along each row in tracks mode
    beams.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    beams.setAttribute('width', W);
    beams.setAttribute('height', H);
    openTracks.forEach(function (t, i) {
      var d;
      if (axisMode) {
        var spread = (i - (openTracks.length - 1) / 2) * 30;
        var x2 = xEnd - 10, dx = x2 - xNow;
        d = 'M' + xNow + ',' + axisY +
          ' C' + (xNow + dx * 0.4) + ',' + (axisY + spread * 1.8) + ' ' + (x2 - dx * 0.4) + ',' + (axisY + spread * 1.8) + ' ' + x2 + ',' + axisY;
      } else {
        d = 'M' + xNow + ',' + t.y + ' L' + xEnd + ',' + t.y;
      }
      t.beam.setAttribute('d', d);
      t.beam.classList.toggle('is-off', !enabled[t.kind]);
    });
    var limits = {};
    if (horizonEl) {
      horizonEv.x = xEnd;
      horizonEv.y = axisY;
      horizonEl.style.transform = 'translate(' + xEnd + 'px,' + axisY + 'px)';
      // Its label hangs below the axis at the far right, so event labels on that level stop short of it,
      // and year labels under it are dropped
      var hw = horizonEl.lastChild.offsetWidth;
      if (axisMode) {
        limits['axis:down0'] = xEnd - hw - 16;
        years.forEach(function (yr) { if (yr.x > xEnd - hw - 12) yr.tick.classList.add('is-crowded'); });
      }
    }

    // Labels go into levels above and below the line, nearest level first; a label that fits nowhere is hidden.
    // In tracks mode the rows are close together, so a label sits on the line to the right of its dot, or just above it.
    var order = [];
    var levels = axisMode ? (mobile ? 3 : 4) : 0;
    for (var k = 0; k < levels; k++) order.push(['up', k], ['down', k]);
    if (!axisMode) order.push(['right', 0], ['up', 0]);
    var occupied = {};
    if (!axisMode) tracks.forEach(function (t) { occupied[t.id + ':up0'] = padL + t.rowName.offsetWidth + 8; });
    var labelH = 24, gap = 30, edgeUp = 20, edgeDown = axisMode ? 36 : 20;
    var prevX = null, run = 0;
    visible.forEach(function (ev) {
      var x = xOf(ev.time);
      run = prevX !== null && x - prevX < 8 ? run + 1 : 0;
      prevX = x;
      var baseY = axisMode ? axisY : ev.track.y;
      // Events on the same day fan out a little so every dot stays visible
      var y = baseY + (axisMode && run ? (run % 2 ? -1 : 1) * Math.ceil(run / 2) * 12 : 0);
      ev.x = x;
      ev.y = y;
      ev.node.style.transform = 'translate(' + x + 'px,' + y + 'px)';

      var w = ev.label.offsetWidth || 100;
      var rowKey = axisMode ? 'axis' : ev.track.id;
      var slot = null, lx;
      var next = ev.track.items[ev.track.items.indexOf(ev) + 1];
      var nextX = next && enabled[next.kind] ? xOf(next.time) : Infinity;
      for (var j = 0; j < order.length; j++) {
        var key = rowKey + ':' + order[j][0] + order[j][1];
        lx = order[j][0] === 'right' ? x + 12 : clamp(x - w / 2, 4, W - w - 4);
        if (lx + w > W - 4) continue;
        if (limits[key] != null && lx + w > limits[key]) continue;
        // A label on the line must end before the row's next dot
        if (order[j][0] === 'right' && lx + w + 10 > nextX) continue;
        if (occupied[key] == null || occupied[key] + 8 <= lx) {
          slot = order[j];
          occupied[key] = lx + w;
          break;
        }
      }
      ev.label.classList.toggle('is-hidden', !slot);
      ev.leader.classList.toggle('is-hidden', !slot || slot[0] === 'right');
      if (!slot) return;
      var ly, top, h;
      if (slot[0] === 'right') {
        ly = y - labelH / 2;
        top = y;
        h = 0;
      } else if (slot[0] === 'up') {
        ly = baseY - edgeUp - slot[1] * gap - labelH;
        top = ly + labelH;
        h = y - top;
      } else {
        ly = baseY + edgeDown + slot[1] * gap;
        top = y;
        h = ly - y;
      }
      ev.label.style.transform = 'translate(' + lx + 'px,' + ly + 'px)';
      ev.leader.style.transform = 'translate(' + x + 'px,' + top + 'px)';
      ev.leader.style.height = Math.max(0, h) + 'px';
    });

    if (instant) {
      void overlay.offsetWidth;
      requestAnimationFrame(function () { overlay.classList.remove('no-anim'); });
    }
  }

  // The page element an event flies out of, when it is on the current page
  function sourceOf(ev) {
    if (!ev.url) return null;
    var u;
    try { u = new URL(ev.url, location.href); } catch (e) { return null; }
    if (u.pathname === location.pathname) {
      if (u.hash) return document.getElementById(u.hash.slice(1));
      return document.querySelector('main h1, main h2');
    }
    var links = document.querySelectorAll('main a[href]');
    for (var i = 0; i < links.length; i++) {
      if (links[i].pathname === u.pathname && links[i].hash === u.hash) return links[i];
    }
    return null;
  }

  // Opening animation: the axis draws itself, then each item lifts off the page and lands on it
  function panTo(target, duration) {
    var from = stage.scrollLeft, started = performance.now();
    var token = panning = {};
    function step(t) {
      if (panning !== token) return;
      var p = Math.min(1, (t - started) / duration);
      stage.scrollLeft = from + (target - from) * (1 - Math.pow(1 - p, 3));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function enter() {
    var sr = stage.getBoundingClientRect();
    var total = 900;
    overlay.classList.add('is-entering');
    if (scrollable) {
      // Start at the far left and drift to today while the dots light up in order
      stage.scrollLeft = 0;
      setTimeout(function () { if (isOpen) panTo(W - stage.clientWidth, 2200); }, 500);
    }
    years.forEach(function (yr) {
      var d = (150 + (yr.x / Math.max(W, 1)) * 500) + 'ms';
      yr.line.firstChild.style.animationDelay = d;
      yr.tick.firstChild.style.animationDelay = d;
    });
    countUp(events.filter(function (ev) { return enabled[ev.kind]; }).length);
    events.forEach(function (ev) {
      if (!enabled[ev.kind]) return;
      var u = ev.x / Math.max(W, 1);
      // Matches the sweep line on a wide screen, or the pan's easing on a scrolling one
      var delay = scrollable ? 500 + 2200 * (1 - Math.pow(1 - u, 1 / 3)) : 300 + u * 1500;
      var src = scrollable ? null : sourceOf(ev);
      var r = src && src.getBoundingClientRect();
      var land = delay;
      if (r && r.width > 0 && r.bottom > 0 && r.top < window.innerHeight) {
        var text = (src.innerText || src.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 48);
        var ghost = el('div', 'tl-ghost', esc(text));
        ghost.dataset.kind = ev.kind;
        var gw = Math.min(r.width, 320), gh = 28;
        ghost.style.width = gw + 'px';
        overlay.appendChild(ghost);
        var tx = sr.left + ev.x - gw / 2, ty = sr.top + ev.y - gh / 2;
        var a = ghost.animate([
          { transform: 'translate(' + r.left + 'px,' + r.top + 'px) scale(1)', opacity: 0 },
          { transform: 'translate(' + r.left + 'px,' + (r.top - 8) + 'px) scale(1.03)', opacity: 1, offset: 0.18 },
          { transform: 'translate(' + tx + 'px,' + ty + 'px) scale(0.1)', opacity: 0.5 }
        ], { duration: 950, delay: delay, easing: 'cubic-bezier(.35,.6,.1,1)', fill: 'both' });
        a.onfinish = function () { ghost.remove(); };
        land = delay + 850;
      }
      ev.node.firstChild.animate([
        { transform: 'scale(0)', opacity: 0 },
        { transform: 'scale(1.9)', opacity: 1, offset: 0.55 },
        { transform: 'scale(1)', opacity: 1 }
      ], { duration: 550, delay: land, easing: 'ease-out', fill: 'backwards' });
      ev.label.firstChild.animate([
        { opacity: 0, transform: 'translateY(6px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], { duration: 420, delay: land + 150, easing: 'ease-out', fill: 'backwards' });
      ev.leader.animate([{ opacity: 0 }, { opacity: 0.4 }], { duration: 400, delay: land + 100, fill: 'backwards' });
      total = Math.max(total, land + 650);
    });
    var beamStart = scrollable ? 2900 : 1900;
    openTracks.forEach(function (t, i) {
      if (!enabled[t.kind]) return;
      var len = t.beam.getTotalLength();
      t.beam.classList.remove('is-flowing');
      t.beam.style.strokeDasharray = len;
      var a = t.beam.animate([
        { strokeDashoffset: len, opacity: 0.2 },
        { strokeDashoffset: 0, opacity: 1 }
      ], { duration: 1100, delay: beamStart + i * 120, easing: 'ease-out', fill: 'backwards' });
      a.onfinish = function () {
        t.beam.style.strokeDasharray = '';
        t.beam.classList.add('is-flowing');
      };
      total = Math.max(total, beamStart + i * 120 + 1100);
    });
    if (horizonEl) {
      horizonEl.firstChild.animate([
        { transform: 'scale(0)', opacity: 0 },
        { transform: 'scale(1.8)', opacity: 1, offset: 0.6 },
        { transform: 'scale(1)', opacity: 1 }
      ], { duration: 700, delay: beamStart + 900, easing: 'ease-out', fill: 'backwards' });
      horizonEl.lastChild.animate([
        { opacity: 0, transform: 'translateY(6px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], { duration: 500, delay: beamStart + 1150, easing: 'ease-out', fill: 'backwards' });
      total = Math.max(total, beamStart + 1700);
    }
    setTimeout(function () {
      overlay.classList.remove('is-entering');
      overlay.querySelectorAll('.tl-ghost').forEach(function (g) { g.remove(); });
    }, total + 100);
  }

  function showCard(ev) {
    cardFor = ev;
    card.dataset.kind = ev.kind;
    var t = ev.track, k = kindOf(ev.kind);
    var kindLine, dateLine, openLine;
    if (ev.horizon) {
      kindLine = both('Future', '未来');
      dateLine = both('From today on', '从现在起');
      openLine = both('Write to me →', '写邮件给我 →');
      overlay.classList.add('is-horizon-hot');
    } else {
      kindLine = both(k.en, k.zh) + ((t.kind === 'question' || t.kind === 'project') ? ' · ' + both(esc(t.en), esc(t.zh)) : '');
      dateLine = both(longDate(ev.date, 'en'), longDate(ev.date, 'zh')) + (ev.planned ? both(' · planned', ' · 计划中') : '');
      openLine = both('Open →', '打开 →');
    }
    card.innerHTML =
      '<div class="tl-card-kind" data-kind="' + ev.kind + '"><i></i>' + kindLine + '</div>' +
      '<div class="tl-card-date">' + dateLine + '</div>' +
      '<div class="tl-card-title">' + both(esc(ev.en), esc(ev.zh)) + '</div>' +
      (ev.descEn || ev.descZh ? '<div class="tl-card-desc">' + both(esc(ev.descEn), esc(ev.descZh)) + '</div>' : '') +
      (ev.url ? '<div class="tl-card-open">' + openLine + '</div>' : '');
    card.hidden = false;
    var sr = stage.getBoundingClientRect();
    var cw = card.offsetWidth, ch = card.offsetHeight;
    var left = clamp(sr.left + ev.x - stage.scrollLeft - cw / 2, 8, window.innerWidth - cw - 8);
    var top = sr.top + ev.y + 20;
    if (top + ch > window.innerHeight - 8) top = sr.top + ev.y - ch - 20;
    card.style.transform = 'translate(' + Math.round(left) + 'px,' + Math.round(top) + 'px)';
    if (!t) return;
    t.items.forEach(function (o) { o.node.classList.add('is-hot'); });
    t.row.classList.add('is-hot');
    if (t.beam) t.beam.classList.add('is-hot');
    if (mode === 'axis' && (t.items.length > 1 || t.ongoing)) {
      var x1 = t.items[0].x, x2 = t.ongoing ? xOf(now) : t.items[t.items.length - 1].x;
      hot.dataset.kind = ev.kind;
      hot.style.left = x1 + 'px';
      hot.style.width = Math.max(0, x2 - x1) + 'px';
      hot.style.transform = 'translateY(' + axisY + 'px)';
      hot.classList.add('is-on');
    }
  }

  function hideCard() {
    if (!cardFor) return;
    var t = cardFor.track;
    if (t) {
      t.items.forEach(function (o) { o.node.classList.remove('is-hot'); });
      t.row.classList.remove('is-hot');
      if (t.beam) t.beam.classList.remove('is-hot');
    }
    overlay.classList.remove('is-horizon-hot');
    hot.classList.remove('is-on');
    card.hidden = true;
    cardFor = null;
  }

  function setInert(on) {
    var kids = document.body.children;
    for (var i = 0; i < kids.length; i++) if (kids[i] !== overlay) kids[i].inert = on;
  }

  function open(fromHistory) {
    if (!built) { build(); built = true; }
    if (isOpen) return;
    isOpen = true;
    // Opening adds a history entry, so the back button or swipe closes the timeline instead of leaving the page
    if (!fromHistory) { try { history.pushState({ tl: true }, '', location.href); } catch (e) {} }
    lastFocus = document.activeElement;
    overlay.hidden = false;
    stage.classList.toggle('is-tracks', mode === 'tracks');
    apply(true);
    setInert(true);
    document.body.classList.add('tl-open');
    void overlay.offsetWidth;
    overlay.classList.add('is-open');
    startStars();
    if (!reduceMotion) enter();
    closeBtn.focus({ preventScroll: true });
  }

  function close() {
    if (!isOpen) return;
    if (history.state && history.state.tl) { history.back(); return; }
    finishClose();
  }

  function finishClose() {
    if (!isOpen) return;
    isOpen = false;
    panning = null;
    cancelAnimationFrame(starsRaf);
    hideCard();
    overlay.classList.remove('is-open', 'is-entering');
    overlay.querySelectorAll('.tl-ghost').forEach(function (g) { g.remove(); });
    document.body.classList.remove('tl-open');
    setInert(false);
    setTimeout(function () { if (!isOpen) overlay.hidden = true; }, 260);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  opener.addEventListener('click', function () { open(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && isOpen) close(); });
  window.addEventListener('popstate', function () {
    if (isOpen) finishClose();
    else if (history.state && history.state.tl) open(true);
  });
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { if (isOpen) { hideCard(); layout(true); startStars(); } }, 120);
  });
  // Label widths change with the language, so lay the labels out again after a switch
  new MutationObserver(function () {
    if (isOpen) { layout(true); if (cardFor) showCard(cardFor); }
  }).observe(root, { attributes: true, attributeFilter: ['data-lang'] });
  if (location.hash === '#timeline' || (history.state && history.state.tl)) open(location.hash !== '#timeline');
})();
