// Fit the 1440px-wide design to the window width (no empty side margins on wide screens).
// The carousel stage is authored at 724x606; scale it to the width its column gives it.
// Engaged Employees product visual is authored at 548x600; scale it to its column (swipe row on mobile).
function fitEngaged() {
  var fit = document.querySelector('.ee-fit'), st = fit && fit.querySelector('.ee-stage');
  if (!st) return;
  if (window.matchMedia('(max-width:720px)').matches) {
    st.style.removeProperty('--ee-s'); fit.style.height = '';
    var m = st.querySelector('.ee-phone--main');
    if (!fit.dataset.centered && m) { fit.scrollLeft = m.offsetLeft - (fit.clientWidth - m.offsetWidth) / 2; fit.dataset.centered = '1'; }
    return;
  }
  delete fit.dataset.centered;
  var s = Math.min(window.matchMedia('(min-width:1025px)').matches ? 0.84 : 1, fit.offsetWidth / 548);
  st.style.setProperty('--ee-s', String(s));
  fit.style.height = Math.round(600 * s) + 'px';
}
function fitStages() {
  fitEngaged();
  document.querySelectorAll('.effective .stage').forEach(function (st) {
    st.style.setProperty('--s', String(st.offsetWidth / 724));
  });
}
(function () {
  function fit() {
    var w = document.documentElement.clientWidth, z = w / 1440;
    document.body.style.zoom = String(z);
    // The hero is truly responsive: on tablet/mobile cancel the page zoom so it lays out at real pixel widths.
    var hero = document.querySelector('.hero');
    if (hero) hero.style.zoom = w <= 1024 ? String(1 / z) : '';
    // Effective Servicing is responsive too: cancel the page zoom on tablet/mobile.
    var eff = document.querySelector('.effective');
    if (eff) eff.style.zoom = w <= 1024 ? String(1 / z) : '';
    // Efficient Operations is responsive too: cancel the page zoom on tablet/mobile.
    var eo = document.querySelector('.efficient');
    if (eo) eo.style.zoom = w <= 1024 ? String(1 / z) : '';
    // Engaged Employees is responsive too: cancel the page zoom on tablet/mobile.
    var ee = document.querySelector('.engaged');
    if (ee) ee.style.zoom = w <= 1024 ? String(1 / z) : '';
    // Customer stories is responsive too: cancel the page zoom on tablet/mobile.
    var cs = document.querySelector('.stories');
    if (cs) cs.style.zoom = w <= 1024 ? String(1 / z) : '';
    fitStages();
  }
  fit(); window.addEventListener('resize', fit);
})();

// Carousels: arrows and dots switch slides (loops last → first and first → last).
document.querySelectorAll('[data-carousel]').forEach(function (root) {
  var dots = Array.prototype.slice.call(root.querySelectorAll('.dot-hit'));
  var slides = Array.prototype.slice.call(root.querySelectorAll('.slide'));
  var i = 0;
  function go(n) {
    i = (n + dots.length) % dots.length;
    dots.forEach(function (d, k) { d.classList.toggle('active', k === i); d.setAttribute('aria-selected', k === i); });
    slides.forEach(function (sl, k) { sl.classList.toggle('active', k === i); sl.setAttribute('aria-hidden', String(k !== i)); });
  }
  dots.forEach(function (d, k) { d.addEventListener('click', function () { go(k); }); });
  var prev = root.querySelector('[data-prev]'), next = root.querySelector('[data-next]');
  if (prev) prev.addEventListener('click', function () { go(i - 1); });
  if (next) next.addEventListener('click', function () { go(i + 1); });
  go(0);
  // Auto-advance every 2 seconds; pauses while hovered/focused, and restarts after any manual change.
  var timer = null, paused = false;
  function start() { clearInterval(timer); timer = setInterval(function () { if (!paused && !document.hidden) go(i + 1); }, 2000); }
  root.addEventListener('mouseenter', function () { paused = true; });
  root.addEventListener('mouseleave', function () { paused = false; start(); });
  root.addEventListener('focusin', function () { paused = true; });
  root.addEventListener('focusout', function () { paused = false; start(); });
  root.addEventListener('click', start);
  start();
});

// Scroll-driven bits, recalculated on every scroll and resize.
(function () {
    var bar = document.querySelector('.zbar'), wrap = document.querySelector('.pnav-wrap'), cta = document.querySelector('.pnav-cta');
  var launcher = document.querySelector('.launcher'), lbtn = launcher && launcher.querySelector('.l-btn');
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  function update() {
    // 1. Get Started moves from the Zoho bar into the product nav once the Zoho bar has scrolled away.
    if (bar && wrap && cta) {
      var stuck = bar.getBoundingClientRect().bottom <= 0;
      if (stuck !== wrap.classList.contains('stuck')) {
        wrap.classList.toggle('stuck', stuck);
        cta.setAttribute('aria-hidden', String(!stuck));
        cta.tabIndex = stuck ? 0 : -1;
      }
    }
    // 2. Contact sales launcher: light style while it sits over a dark or green section.
    if (lbtn) {
      var r = lbtn.getBoundingClientRect(), y = r.top + r.height / 2, dark = false;
      document.querySelectorAll('[data-surface="dark"]').forEach(function (s) {
        var b = s.getBoundingClientRect(); if (y >= b.top && y <= b.bottom) dark = true;
      });
      launcher.classList.toggle('on-dark', dark);
    }
    // 3. Testimonial cards: fade in + rise 24px when scrolled into view.
    var vh = window.innerHeight || document.documentElement.clientHeight;
    reveals.forEach(function (el) { if (!el.classList.contains('in') && el.getBoundingClientRect().top < vh * 0.85) el.classList.add('in'); });
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

// Engaged Employees workflow gallery: tabs switch between the four step screens.
(function () {
  var root = document.querySelector('[data-ee-flow]'); if (!root) return;
  var tabs = root.querySelectorAll('.ee-tab'), imgs = root.querySelectorAll('.ee-flow__img');
  function go(i) {
    tabs.forEach(function (t, k) { t.classList.toggle('is-on', k === i); t.setAttribute('aria-selected', k === i ? 'true' : 'false'); });
    imgs.forEach(function (m, k) { m.classList.toggle('is-on', k === i); });
  }
  tabs.forEach(function (t, i) { t.addEventListener('click', function () { go(i); }); });
  var n = 0; var timer = setInterval(function () { n = (n + 1) % tabs.length; go(n); }, 5000);
  root.addEventListener('click', function () { clearInterval(timer); });
})();
