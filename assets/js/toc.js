/* Contents list beside long pages: the sections of the language being read, with the current one marked.
   Built only when a page has three or more sections; style.css shows it on wide screens only. */
(function () {
  'use strict';

  var article = document.querySelector('main article.post');
  if (!article) return;
  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var toc = null, items = [], ticking = false;

  function isShown(el) { return el.getClientRects().length > 0; }

  // Markdown pages use h2 for sections; the Questions page uses h3. Hidden-language copies are skipped.
  function sections() {
    var h2 = Array.prototype.filter.call(article.querySelectorAll('h2'), isShown);
    var list = h2.length ? h2 : Array.prototype.filter.call(article.querySelectorAll('h3'), isShown);
    return list.filter(function (h) { return !h.hasAttribute('data-toc-skip'); });
  }

  function update() {
    ticking = false;
    if (!items.length) return;
    var line = Math.min(160, window.innerHeight * 0.25);
    var active = 0;
    for (var i = 0; i < items.length; i++) {
      if (items[i].heading.getBoundingClientRect().top <= line) active = i;
    }
    // At the bottom of the page the last section is the one being read, even if its heading never reaches the line
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) active = items.length - 1;
    items.forEach(function (it, i) {
      if (i === active) it.link.setAttribute('aria-current', 'true');
      else it.link.removeAttribute('aria-current');
    });
  }

  function build() {
    if (toc) { toc.remove(); toc = null; }
    items = [];
    var heads = sections();
    if (heads.length < 3) return;
    var zh = root.getAttribute('data-lang') === 'zh';
    toc = document.createElement('nav');
    toc.className = 'toc';
    toc.lang = zh ? 'zh' : 'en';
    toc.setAttribute('aria-label', zh ? '目录' : 'Contents');
    var title = document.createElement('p');
    title.className = 'toc-title';
    title.textContent = zh ? '目录' : 'Contents';
    var list = document.createElement('ol');
    heads.forEach(function (h, i) {
      if (!h.id) h.id = (zh ? 'zh' : 'en') + '-section-' + (i + 1);
      var link = document.createElement('a');
      link.href = '#' + h.id;
      link.textContent = h.innerText.trim();
      link.addEventListener('click', function (e) {
        e.preventDefault();
        h.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        h.setAttribute('tabindex', '-1');
        h.focus({ preventScroll: true });
        try { history.replaceState(history.state, '', '#' + h.id); } catch (err) {}
      });
      var li = document.createElement('li');
      li.appendChild(link);
      list.appendChild(li);
      items.push({ heading: h, link: link });
    });
    toc.appendChild(title);
    toc.appendChild(list);
    // Rebuilt while the timeline is open (its language button): stay out of reach behind it
    if (document.body.classList.contains('tl-open')) toc.inert = true;
    document.body.appendChild(toc);
    update();
  }

  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  window.addEventListener('resize', update);
  // The visible headings change with the language
  new MutationObserver(build).observe(root, { attributes: true, attributeFilter: ['data-lang'] });
  build();
})();
