(function () {
  'use strict';
  var CFG = window.KL_CONFIG || {};
  var EMAIL = 'care.karunalifecare@gmail.com';
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.dataLayer = window.dataLayer || [];
  function track(event, p) { var o = { event: event }; for (var k in (p || {})) o[k] = p[k]; window.dataLayer.push(o); }
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  /* ---------- menus ---------- */
  function closeMenus() { $$('.panel.open').forEach(function (p) { p.classList.remove('open'); if (p.previousElementSibling) p.previousElementSibling.setAttribute('aria-expanded', 'false'); }); }
  function setDrawer(open) {
    var d = $('#drawer'), b = $('#burger'); if (!d || !b) return;
    d.classList.toggle('open', open); b.setAttribute('aria-expanded', String(open));
    b.setAttribute('aria-label', open ? 'Close menu' : 'Open menu'); document.body.style.overflow = open ? 'hidden' : '';
  }
  document.addEventListener('click', function (e) {
    var t = e.target;
    var dd = t.closest('.dd > button');
    if (dd) { var p = dd.nextElementSibling, o = !p.classList.contains('open'); closeMenus(); if (o) { p.classList.add('open'); dd.setAttribute('aria-expanded', 'true'); } return; }
    if (!t.closest('.panel')) closeMenus();
    var bg = t.closest('#burger'); if (bg) { setDrawer(!$('#drawer').classList.contains('open')); return; }
    if (t.closest('#drawer a')) setDrawer(false);
    var tr = t.closest('[data-track]'); if (tr) track('cta_click', { cta: tr.getAttribute('data-track') });
    var ck = t.closest('[data-ck]'); if (ck) cookieChoice(ck.getAttribute('data-ck'));
    var fb = t.closest('[data-filter]');
    if (fb) {
      $$('[data-filter]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === fb)); });
      var f = fb.getAttribute('data-filter');
      $$('.prod').forEach(function (c) { c.hidden = !!f && c.getAttribute('data-cat') !== f; });
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeMenus(); var d = $('#drawer'); if (d && d.classList.contains('open')) { setDrawer(false); $('#burger').focus(); } }
  });

  /* ---------- cookies / analytics (consent-gated) ---------- */
  function loadAnalytics() {
    if (!CFG.analyticsId || window.__ga) return; window.__ga = 1;
    var s = document.createElement('script'); s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(CFG.analyticsId);
    document.head.appendChild(s);
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date()); window.gtag('config', CFG.analyticsId, { anonymize_ip: true });
  }
  function cookieChoice(c) {
    var el = $('#cookie'); if (!el) return;
    if (c === 'open') { el.classList.add('show'); return; }
    store('kl_cookie', c); el.classList.remove('show'); if (c === 'all') loadAnalytics();
  }
  (function () { var c = store('kl_cookie'); if (c === 'all') loadAnalytics(); if (!c) setTimeout(function () { var el = $('#cookie'); if (el) el.classList.add('show'); }, 1200); })();

  /* ---------- social links (only when real accounts are set) ---------- */
  (function () {
    var slot = $('#social-slot'), s = CFG.social || {}, items = [];
    ['instagram', 'facebook', 'linkedin', 'youtube'].forEach(function (k) { if (s[k] && /^https:\/\//.test(s[k])) items.push('<li><a href="' + s[k].replace(/"/g, '&quot;') + '" rel="noopener" target="_blank">' + k.charAt(0).toUpperCase() + k.slice(1) + '</a></li>'); });
    if (slot && items.length) slot.innerHTML = '<h4>Follow</h4><ul>' + items.join('') + '</ul>';
  })();

  /* ---------- forms -> master Google Sheet ---------- */
  var PHONE_RE = /^\+?[\d][\d\s-]{7,16}$/, EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var TICK = '<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 10.5l4 4 8-9" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  $$('input[data-mindate="today"]').forEach(function (i) { var d = new Date(); i.min = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); });
  $$('form[data-form]').forEach(function (f) { f.setAttribute('data-ts', String(Date.now())); });

  function errBox(el) { return document.getElementById(el.id + '_e'); }
  function setErr(el, msg) { var b = errBox(el); if (b) b.textContent = msg || ''; if (el.type !== 'radio') el.setAttribute('aria-invalid', msg ? 'true' : 'false'); }
  function labelOf(form, el) { var l = form.querySelector('label[for="' + el.id + '"]'); return l ? l.textContent.replace('(optional)', '').trim() : el.name; }

  function mailFallback(type, data, form) {
    var lines = Object.keys(data).filter(function (k) { return data[k]; }).map(function (k) { var el = form.elements[k]; var lab = el && el.id ? labelOf(form, el) : k; return lab + ': ' + data[k]; });
    return 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('Karuna Lifecare ' + type + ' request') + '&body=' + encodeURIComponent(lines.join('\n'));
  }
  function showDone(wrap, form, title, text, extra) {
    var okMsg = form.getAttribute('data-ok');
    wrap.innerHTML = '<div class="ok" role="status" tabindex="-1"><div class="tick">' + TICK + '</div><h2>' + title + '</h2><p class="lead">' + (text || okMsg) + '</p>' + (extra || '') + '<p class="sub-note">For medical emergencies, please contact your local emergency medical service or visit the nearest emergency department immediately.</p></div>';
    var ok = wrap.querySelector('.ok'); ok.focus(); wrap.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
  }

  document.addEventListener('submit', function (e) {
    var form = e.target.closest('form[data-form]'); if (!form) return;
    e.preventDefault();
    var type = form.getAttribute('data-form'), first = null, data = {};
    $$('input, select, textarea', form).forEach(function (el) {
      if (!el.name || el.name === 'website' || el.name === 'consent' || el.type === 'radio') return;
      var v = (el.value || '').trim(), msg = '';
      if (el.required && !v) msg = el.tagName === 'SELECT' ? 'Please choose an option.' : 'This field is required.';
      else if (v && el.type === 'tel' && !PHONE_RE.test(v)) msg = 'Enter a valid phone number.';
      else if (v && el.type === 'email' && !EMAIL_RE.test(v)) msg = 'Enter a valid email address.';
      else if (v && el.type === 'number' && (isNaN(v) || +v < 0 || +v > 120)) msg = 'Enter a valid age.';
      else if (v && el.type === 'date' && el.min && v < el.min) msg = 'Choose today or a later date.';
      setErr(el, msg); if (msg && !first) first = el; data[el.name] = v;
    });
    $$('input[type=radio]:checked', form).forEach(function (r) { data[r.name] = r.value; });
    var cons = form.elements.consent;
    var cm = cons && !cons.checked ? 'Please confirm your consent so we can contact you.' : '';
    if (cons) { setErr(cons, cm); if (cm && !first) first = cons; }
    if (first) { first.focus(); return; }

    var wrap = form.closest('[data-wrap]'), btn = form.querySelector('button[type=submit]');
    var bot = (form.elements.website && form.elements.website.value) || (Date.now() - Number(form.getAttribute('data-ts'))) < 2500;
    if (bot) { showDone(wrap, form, 'Request received'); return; }

    var old = form.querySelector('.formerr'); if (old) old.remove();
    var endpoint = CFG.leadEndpoint;
    if (!endpoint) {
      /* Not connected yet: never lose the enquiry, hand it to the visitor's email app. */
      track('form_submit', { form_type: type, delivered: false, fallback: 'mailto' });
      var href = mailFallback(type, data, form);
      showDone(wrap, form, 'One last step', 'Please press the button below to send your request by email. It is pre-filled with your details.', '<div class="cta-row"><a class="btn btn-primary" href="' + href.replace(/"/g, '&quot;') + '">Send by email</a></div>');
      return;
    }
    btn.disabled = true; var label = btn.textContent; btn.textContent = 'Sending';
    var payload = { type: type, page: location.pathname, website: '', data: data };
    fetch(endpoint, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload) })
      .then(function () { track('form_submit', { form_type: type, delivered: true }); showDone(wrap, form, 'Request received'); })
      .catch(function () {
        btn.disabled = false; btn.textContent = label;
        var d = document.createElement('div'); d.className = 'formerr'; d.setAttribute('role', 'alert');
        d.innerHTML = 'We could not send that just now. Please check your connection and try again, or <a href="' + mailFallback(type, data, form).replace(/"/g, '&quot;') + '">email your request to us</a>.';
        form.appendChild(d);
      });
  });

  /* ---------- Health Store (products come from config.js) ---------- */
  (function () {
    var root = document.getElementById('store-root'), list = CFG.products;
    if (!root || !Array.isArray(list) || !list.length) return;
    function money(n) { try { return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n); } catch (e) { return '\u20B9' + n; } }
    function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
    var cats = []; list.forEach(function (p) { if (p.cat && cats.indexOf(p.cat) < 0) cats.push(p.cat); });
    root.textContent = '';
    var fl = el('div', 'filters'); fl.setAttribute('role', 'group'); fl.setAttribute('aria-label', 'Filter by category');
    [''].concat(cats).forEach(function (c, i) { var b = el('button', '', c || 'All'); b.type = 'button'; b.setAttribute('data-filter', c); b.setAttribute('aria-pressed', i === 0 ? 'true' : 'false'); fl.appendChild(b); });
    root.appendChild(fl);
    var grid = el('div', 'pgrid');
    list.forEach(function (p) {
      var card = el('article', 'prod'); card.setAttribute('data-cat', p.cat || '');
      var pic = el('div', 'pic');
      if (p.img && /^(\/|https:\/\/|data:image\/)/.test(p.img)) { var im = document.createElement('img'); im.src = p.img; im.alt = p.name || ''; im.loading = 'lazy'; pic.appendChild(im); } else pic.textContent = (p.name || '?').charAt(0);
      var body = el('div', 'body'); body.appendChild(el('span', 'cat', p.cat || '')); body.appendChild(el('h3', '', p.name || ''));
      if (p.desc) { var d = el('p', 'small muted', p.desc); d.style.margin = '0'; body.appendChild(d); }
      var pr = el('div', 'price', p.price ? money(p.price) : ''); if (p.mrp && p.mrp > p.price) pr.appendChild(el('span', 'mrp', money(p.mrp))); body.appendChild(pr);
      var a = document.createElement('a'); a.className = 'btn'; 
      if (p.pay && /^https:\/\//.test(p.pay)) { a.className += ' btn-primary'; a.href = p.pay; a.target = '_blank'; a.rel = 'noopener'; a.textContent = 'Buy now'; a.setAttribute('data-track', 'Buy ' + (p.name || '')); }
      else { a.className += ' btn-line'; a.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('Enquiry: ' + (p.name || 'product')); a.textContent = 'Enquire to buy'; }
      body.appendChild(a); card.appendChild(pic); card.appendChild(body); grid.appendChild(card);
    });
    root.appendChild(grid);
  })();
})();
