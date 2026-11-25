// Efficient Operations carousel: slide data + rendering + behaviour.
(function () {
  var root = document.querySelector('[data-eo]');
  if (!root) return;

  var WORKFLOW = ['Work order', 'Invoice', 'Payment', 'Report'];
  var NAV = [
    { id: 'overview', label: 'Overview', icon: 'home' },
    { id: 'invoices', label: 'Invoices', icon: 'file' },
    { id: 'payments', label: 'Payments', icon: 'card' },
    { id: 'reports', label: 'Reports', icon: 'chart' }
  ];

  // One entry per slide. `step` is the active workflow step (0-3).
  var SLIDES = [
    {
      id: 'invoicing', label: 'Built-in invoicing', icon: 'file', nav: 'invoices', step: 1, view: 'invoice',
      title: 'Create invoice', badge: 'From completed work order',
      customer: 'Zylker Inc', number: 'INV-000008',
      items: [
        { name: 'Microwave repair', qty: '1.00', rate: '70.00', amount: '70.00' },
        { name: 'Microwave Bulb', qty: '1.00', rate: '8.00', amount: '8.00' }
      ],
      subtotal: '$78.00', taxLabel: 'Tax (13.46%)', tax: '$10.50', total: '$88.50'
    },
    {
      id: 'payments', label: 'Global payments', icon: 'coins', nav: 'payments', step: 2, view: 'payment',
      title: 'Payment received', badge: 'Paid',
      details: [['Invoice number', 'INV-000008'], ['Customer', 'Zylker Inc'], ['Amount', '$88.50'], ['Payment method', 'Online payment']],
      summary: [['Payment received', '$88.50']], total: '$88.50',
      currencies: [['GBP', '£72.71'], ['EUR', '€83.41'], ['JPY', '¥12,077.59']],
      taxNote: 'Regional tax applied'
    },
    {
      id: 'pdf', label: 'Branded PDFs', icon: 'download', nav: 'invoices', step: 1, view: 'pdf',
      title: 'PDF template builder',
      controls: [['image', 'Brand logo'], ['drop', 'Colors'], ['fields', 'Fields'], ['layout', 'Layout']],
      company: 'Zylker Inc', docTitle: 'Service invoice', number: 'INV-000008', date: 'Mar 08, 2025',
      total: '$88.50', template: 'Standard invoice'
    },
    {
      id: 'reports', label: 'Custom reports', icon: 'chart', nav: 'reports', step: 3, view: 'report',
      title: 'Operations dashboard',
      stats: [['Revenue', '$48.2K'], ['Paid invoices', '126'], ['Outstanding', '$4.8K']],
      trend: { months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], values: [12, 20, 28, 38, 46, 54], max: 60 },
      rows: [['Microwave repair', 84, 78, '92.9%'], ['Microwave Bulb', 56, 52, '92.9%']],
      controls: [['Metric', 'Revenue'], ['Date range', 'Last 6 months'], ['Group by', 'Service']],
      action: 'Create report'
    }
  ];

  function ico(name) { return '<svg aria-hidden="true"><use href="#eo-i-' + name + '"/></svg>'; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

  function sideNav(active) {
    return '<ul class="eo-side">' + NAV.map(function (n) {
      return '<li class="eo-side__item' + (n.id === active ? ' is-on' : '') + '">' + ico(n.icon) + '<span>' + n.label + '</span></li>';
    }).join('') + '</ul>';
  }
  function select(label, value) {
    return '<div class="eo-field"><span class="eo-field__label">' + esc(label) + '</span><span class="eo-select"><span>' + esc(value) + '</span>' + ico('down') + '</span></div>';
  }
  function head(s) {
    return '<div class="eo-card-head"><h3 class="eo-h3">' + esc(s.title) + '</h3>' +
      (s.badge ? '<span class="eo-chip">' + ico('check') + esc(s.badge) + '</span>' : '') + '</div>';
  }
  function lines(n) { return '<span class="eo-lines" aria-hidden="true">' + new Array(n + 1).join('<i></i>') + '</span>'; }

  var VIEWS = {
    invoice: function (s) {
      return '<div class="eo-panel eo-grid eo-grid--invoice">' +
        '<div class="eo-panel__main">' + head(s) +
        '<div class="eo-cols-2">' + select('Customer', s.customer) +
        '<div class="eo-field"><span class="eo-field__label">Invoice number</span><span class="eo-input">' + esc(s.number) + '</span></div></div>' +
        '<table class="eo-table"><thead><tr><th scope="col">Item &amp; Description</th><th scope="col" class="n">Qty</th><th scope="col" class="n">Rate</th><th scope="col" class="n">Amount</th></tr></thead><tbody>' +
        s.items.map(function (r) { return '<tr><td>' + esc(r.name) + '</td><td class="n">' + r.qty + '</td><td class="n">' + r.rate + '</td><td class="n">' + r.amount + '</td></tr>'; }).join('') +
        '</tbody></table>' +
        '<dl class="eo-totals"><div><dt>Subtotal</dt><dd>' + s.subtotal + '</dd></div><div><dt>' + esc(s.taxLabel) + '</dt><dd>' + s.tax + '</dd></div><div class="is-total"><dt>Total</dt><dd>' + s.total + '</dd></div></dl>' +
        '</div>' +
        '<figure class="eo-preview" aria-label="Branded invoice PDF preview"><div class="eo-paper"><div class="eo-paper__top"><strong>' + esc(s.customer) + '</strong><span><b>INVOICE</b><small>' + esc(s.number) + '</small></span></div>' +
        lines(2) + '<span class="eo-skel" aria-hidden="true"><i></i><i></i></span><span class="eo-paper__total"><span>Total</span><b>' + s.total + '</b></span><span class="eo-paper__band" aria-hidden="true"></span></div></figure>' +
        '</div>';
    },
    payment: function (s) {
      return '<div class="eo-panel eo-grid eo-grid--payment">' +
        '<div class="eo-panel__main">' + head(s) +
        '<dl class="eo-details">' + s.details.map(function (d) { return '<div><dt>' + esc(d[0]) + '</dt><dd>' + esc(d[1]) + '</dd></div>'; }).join('') + '</dl>' +
        '<h4 class="eo-h4">Transaction summary</h4>' +
        '<dl class="eo-totals eo-totals--flush">' + s.summary.map(function (d) { return '<div><dt>' + esc(d[0]) + '</dt><dd>' + esc(d[1]) + '</dd></div>'; }).join('') +
        '<div class="is-total"><dt>Total</dt><dd>' + s.total + '</dd></div></dl></div>' +
        '<div class="eo-side-stack">' +
        '<section class="eo-panel__main eo-mini"><h4 class="eo-h4">Multiple currencies</h4><ul class="eo-cur">' +
        s.currencies.map(function (c) { return '<li><span class="eo-code">' + c[0] + '</span><b>' + esc(c[1]) + '</b></li>'; }).join('') + '</ul></section>' +
        '<section class="eo-panel__main eo-mini"><h4 class="eo-h4">Regional taxes</h4><span class="eo-select eo-select--block"><span>' + esc(s.taxNote) + '</span>' + ico('down') + '</span></section>' +
        '</div></div>';
    },
    pdf: function (s) {
      return '<div class="eo-panel eo-grid eo-grid--pdf">' +
        '<div class="eo-pdf-top"><h3 class="eo-h3">' + esc(s.title) + '</h3><div class="eo-actions"><span class="eo-btn eo-btn--ghost">' + ico('eye') + 'Preview</span><span class="eo-btn">' + ico('download') + 'Generate PDF</span></div></div>' +
        '<ul class="eo-config">' + s.controls.map(function (c) { return '<li>' + ico(c[0]) + '<span>' + c[1] + '</span>' + ico('right') + '</li>'; }).join('') + '</ul>' +
        '<figure class="eo-doc" aria-label="Live service invoice preview"><div class="eo-doc__band"><strong>' + esc(s.company) + '</strong></div>' +
        '<div class="eo-doc__body"><div class="eo-doc__row"><strong class="eo-doc__title">' + esc(s.docTitle) + '</strong><span class="eo-doc__meta"><small>Invoice number</small><b>' + esc(s.number) + '</b></span><span class="eo-doc__meta"><small>Date</small><b>' + esc(s.date) + '</b></span></div>' +
        lines(2) + '<div class="eo-doc__thead" aria-hidden="true"><span>Item &amp; Description</span><span>Qty</span><span>Rate</span><span>Amount</span></div><span class="eo-skel eo-skel--rows" aria-hidden="true"><i></i><i></i></span>' +
        '<p class="eo-doc__total"><span>Total</span><b>' + s.total + '</b></p></div></figure>' +
        '<div class="eo-tpl"><span class="eo-field__label">Template</span><span class="eo-select eo-select--block"><span>' + esc(s.template) + '</span>' + ico('down') + '</span>' +
        '<span class="eo-thumb" aria-hidden="true"><i></i><i></i><i></i><i></i></span></div></div>';
    },
    report: function (s) {
      var t = s.trend, W = 520, H = 150, L = 38, R = 12, T = 10, B = 24, iw = W - L - R, ih = H - T - B;
      var pts = t.values.map(function (v, i) { return [L + iw * i / (t.values.length - 1), T + ih * (1 - v / t.max)]; });
      var line = pts.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' ');
      var area = L + ',' + (T + ih) + ' ' + line + ' ' + (L + iw) + ',' + (T + ih);
      var grid = [0, 10, 20, 30, 40, 50, 60].map(function (g) {
        var y = T + ih * (1 - g / t.max);
        return '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y.toFixed(1) + '" y2="' + y.toFixed(1) + '" class="g"/><text x="' + (L - 8) + '" y="' + (y + 4).toFixed(1) + '" text-anchor="end">' + (g ? g + 'K' : '0') + '</text>';
      }).join('');
      var labels = t.months.map(function (m, i) { return '<text x="' + pts[i][0].toFixed(1) + '" y="' + (H - 6) + '" text-anchor="middle">' + m + '</text>'; }).join('');
      var dots = pts.map(function (p) { return '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="3.5"/>'; }).join('');
      return '<div class="eo-panel eo-grid eo-grid--report">' +
        '<div class="eo-report-main"><h3 class="eo-h3">' + esc(s.title) + '</h3>' +
        '<dl class="eo-stats">' + s.stats.map(function (d) { return '<div><dt>' + esc(d[0]) + '</dt><dd>' + esc(d[1]) + '</dd></div>'; }).join('') + '</dl>' +
        '<figure class="eo-chart"><figcaption class="eo-h4">Revenue trend</figcaption><svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Revenue trend, January to June, rising steadily from about 12K to 54K"><g aria-hidden="true">' + grid + labels +
        '<polygon points="' + area + '" class="a"/><polyline points="' + line + '" class="l"/>' + dots + '</g></svg></figure>' +
        '<h4 class="eo-h4">Service performance</h4>' +
        '<table class="eo-table eo-table--tight"><thead><tr><th scope="col">Service</th><th scope="col" class="n">Work orders</th><th scope="col" class="n">Completed</th><th scope="col" class="n">Completion rate</th></tr></thead><tbody>' +
        s.rows.map(function (r) { return '<tr><td>' + esc(r[0]) + '</td><td class="n">' + r[1] + '</td><td class="n">' + r[2] + '</td><td class="n">' + r[3] + '</td></tr>'; }).join('') + '</tbody></table></div>' +
        '<div class="eo-report-side"><h3 class="eo-h3 eo-h3--sm">Custom report</h3>' + s.controls.map(function (c) { return select(c[0], c[1]); }).join('') +
        '<span class="eo-btn eo-btn--block">' + esc(s.action) + '</span></div></div>';
    }
  };

  var flowEl = root.querySelector('[data-eo-flow]');
  var stage = root.querySelector('[data-eo-stage]');
  var capsEl = root.querySelector('[data-eo-caps]');
  var dotsEl = root.querySelector('[data-eo-dots]');
  var live = root.querySelector('[data-eo-live]');
  var len = SLIDES.length, cur = 0;

  stage.innerHTML = SLIDES.map(function (s, i) {
    return '<div class="eo-slide" id="eo-slide-' + s.id + '" role="group" aria-roledescription="slide" aria-label="' + (i + 1) + ' of ' + len + ': ' + s.label + '">' +
      '<div class="eo-work">' + sideNav(s.nav) + VIEWS[s.view](s) + '</div></div>';
  }).join('');
  var panels = Array.prototype.slice.call(stage.children);

  flowEl.innerHTML = WORKFLOW.map(function (w, i) {
    return '<li class="eo-step"><span class="eo-step__dot">' + ico('check') + '</span><span class="eo-step__label">' + w + '</span></li>' +
      (i < WORKFLOW.length - 1 ? '<li class="eo-flow__arrow" aria-hidden="true">&rarr;</li>' : '');
  }).join('');
  var steps = Array.prototype.slice.call(flowEl.querySelectorAll('.eo-step'));

  capsEl.innerHTML = SLIDES.map(function (s, i) {
    return '<button type="button" class="eo-cap" data-i="' + i + '" aria-controls="eo-slide-' + s.id + '" aria-label="Show ' + s.label + ' (slide ' + (i + 1) + ' of ' + len + ')">' + ico(s.icon) + '<span>' + s.label + '</span></button>';
  }).join('');
  var caps = Array.prototype.slice.call(capsEl.children);

  dotsEl.innerHTML = SLIDES.map(function (s, i) {
    return '<button type="button" class="eo-dot" data-i="' + i + '" aria-controls="eo-slide-' + s.id + '" aria-label="Go to slide ' + (i + 1) + ': ' + s.label + '"><span></span></button>';
  }).join('');
  var dots = Array.prototype.slice.call(dotsEl.children);

  function paint(announce) {
    var s = SLIDES[cur];
    steps.forEach(function (el, i) {
      el.classList.toggle('is-done', i < s.step);
      el.classList.toggle('is-active', i === s.step);
      el.setAttribute('aria-current', i === s.step ? 'step' : 'false');
      if (i !== s.step) el.removeAttribute('aria-current');
    });
    flowEl.classList.toggle('is-final', s.step === WORKFLOW.length - 1);
    [caps, dots].forEach(function (group) {
      group.forEach(function (b, i) {
        if (i === cur) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
      });
    });
    var activeStep = steps[s.step];
    if (flowEl.scrollWidth > flowEl.clientWidth) flowEl.scrollLeft = Math.max(0, activeStep.offsetLeft - (flowEl.clientWidth - activeStep.offsetWidth) / 2);
    var activeCap = caps[cur];
    if (capsEl.scrollWidth > capsEl.clientWidth) capsEl.scrollLeft = activeCap.offsetLeft - (capsEl.clientWidth - activeCap.offsetWidth) / 2;
    if (announce) live.textContent = 'Slide ' + (cur + 1) + ' of ' + len + ': ' + s.label;
  }

  function go(n, dir) {
    var next = (n + len) % len;
    if (next === cur) return;
    dir = dir || (next > cur ? 1 : -1);
    var out = panels[cur], inn = panels[next];
    inn.classList.remove('is-active', 'is-before', 'is-after');
    inn.classList.add(dir > 0 ? 'is-after' : 'is-before');
    void inn.offsetWidth; // commit the start position before animating in
    out.classList.remove('is-active');
    out.classList.add(dir > 0 ? 'is-before' : 'is-after');
    inn.classList.remove('is-before', 'is-after');
    inn.classList.add('is-active');
    cur = next;
    panels.forEach(function (p, i) { p.setAttribute('aria-hidden', i === cur ? 'false' : 'true'); if (i === cur) p.removeAttribute('inert'); else p.setAttribute('inert', ''); });
    paint(true);
  }

  panels.forEach(function (p, i) {
    p.classList.add(i === 0 ? 'is-active' : 'is-after');
    p.setAttribute('aria-hidden', i === 0 ? 'false' : 'true');
    if (i !== 0) p.setAttribute('inert', '');
  });
  paint(false);

  root.querySelector('[data-eo-prev]').addEventListener('click', function () { go(cur - 1, -1); });
  root.querySelector('[data-eo-next]').addEventListener('click', function () { go(cur + 1, 1); });
  [caps, dots].forEach(function (group) {
    group.forEach(function (b) { b.addEventListener('click', function () { go(Number(b.dataset.i)); }); });
  });

  // Auto-advance every 2 seconds; pauses while hovered/focused, restarts after any manual change.
  var timer = null, paused = false;
  function start() { clearInterval(timer); timer = setInterval(function () { if (!paused && !document.hidden) go(cur + 1, 1); }, 2000); }
  root.addEventListener('mouseenter', function () { paused = true; });
  root.addEventListener('mouseleave', function () { paused = false; start(); });
  root.addEventListener('focusin', function () { paused = true; });
  root.addEventListener('focusout', function () { paused = false; start(); });
  root.addEventListener('click', start);
  start();

  // Keyboard: left / right arrows while focus is inside the carousel.
  root.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    var step = e.key === 'ArrowRight' ? 1 : -1, btn = document.activeElement && document.activeElement.closest('.eo-cap,.eo-dot');
    go(cur + step, step);
    if (btn) { var group = btn.classList.contains('eo-cap') ? caps : dots; group[cur].focus(); }
  });

  // Touch swipe on the product frame.
  var sx = null, sy = null;
  stage.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  stage.addEventListener('touchend', function (e) {
    if (sx === null) return;
    var dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy;
    sx = sy = null;
    if (Math.abs(dx) > 48 && Math.abs(dx) > Math.abs(dy) * 1.5) go(cur + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
  }, { passive: true });
})();
