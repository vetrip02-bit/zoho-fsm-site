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

  var ALTS = ['Create work order: Zylker Inc, microwave repair, technician David Miller, with a live work order preview.','Create invoice auto-filled from the work order: microwave repair and bulb, total $88.50, with a live invoice preview.','Record payment of $88.50 by credit card against invoice INV-000008, with a payment receipt preview.','Create service report with completed checklist, customer rating and signature, with a service report preview.'];
  // Slide 3 ("Record payment") is real, editable HTML text rather than a picture.
  var CHECK = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 10.5l3.6 3.6 7.4-8"/></svg>';
  var CHEV = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 8l5 5 5-5"/></svg>';
  var CAL = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4.5" width="14" height="12.5" rx="2"/><path d="M3 8.5h14M7 3v3M13 3v3"/></svg>';
  var CARD = '<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" aria-hidden="true"><rect x="3.5" y="6.5" width="21" height="15" rx="2.5"/><path d="M3.5 12h21M8 17h5"/></svg>';
  var MAIL = '<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="6.5" width="20" height="15" rx="2.5"/><path d="M4.8 8.5L14 15.5l9.2-7"/></svg>';
  var PLANE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 3L10 14M21 3l-7 18-4-7-7-4 18-7z"/></svg>';
  var SHARE = '<svg viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 17V5M9.5 9.5L14 5l4.5 4.5M6 14v8h16v-8"/></svg>';
  var CALG = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4.5" width="14" height="12.5" rx="2"/><path d="M3 8.5h14M7 3v3M13 3v3"/></svg>';
  var CLOCK = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="10" cy="10" r="7.2"/><path d="M10 6v4.2l2.8 1.6"/></svg>';
  var PRIO = '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="color:#e8603a"><path d="M5 9l5-5 5 5M5 15l5-5 5 5"/></svg>';
  function lead(svg, text) { return '<span class="lead">' + svg + '</span>' + text; }
  // A form field placed on the 785 x 708 form card (x, y, width, optional variant class).
  function payField(label, value, icon, x, y, w, cls) {
    return '<div class="eo-pay__f' + (cls ? ' ' + cls : '') + (w === 708 ? ' eo-pay__f--wide' : '') + '" style="left:calc(' + x + '*var(--u));top:calc(' + y + '*var(--u))' + (w && w !== 708 ? ';width:calc(' + w + '*var(--u))' : '') + '"><label>' + label + '</label><div><span>' + value + '</span>' + (icon || '') + '</div></div>';
  }
  function steps(active) {
    var names = ['Work order', 'Invoice', 'Payment', 'Report'], h = '<ol class="eo-pay__steps">';
    names.forEach(function (n, i) {
      var cls = i === active ? ' class="is-on"' : (i > active ? ' class="is-todo"' : '');
      h += '<li' + cls + '><i>' + (i < active ? CHECK : (i + 1)) + '</i>' + n + '</li>' + (i < 3 ? '<hr' + (i >= active ? ' class="is-todo"' : '') + '>' : '');
    });
    return h + '</ol>';
  }
  function buttons(primary, icon) {
    return '<div class="eo-pay__btns"><span class="eo-pay__btn eo-pay__btn--p">' + icon + primary + '</span><span class="eo-pay__btn eo-pay__btn--s">' + (primary === 'Record payment' ? 'Cancel' : 'Save draft') + '</span></div>';
  }
  // Shared shell: photo + toast, step bar, form card, receipt panel, "next" toast.
  function shell(c) {
    return '<div class="eo-pay' + (c.cls ? ' ' + c.cls : '') + '" role="img" aria-label="' + c.alt + '"><div class="eo-pay__in">' +
      '<div class="eo-pay__photo"><img src="assets/eo-pay-photo.webp" width="418" height="753" alt="" loading="lazy">' +
        '<div class="eo-pay__toast"><span class="eo-pay__tick">' + CHECK + '</span><span><b>' + c.toast[0] + '</b><span>' + c.toast[1] + '</span></span></div></div>' +
      steps(c.step) +
      '<div class="eo-pay__form"><h3>' + c.title + '</h3><span class="eo-pay__chip">' + CHECK + c.chip + '</span>' + c.form + '</div>' +
      '<div class="eo-pay__rcpt"><p>' + c.sideLabel + '</p>' + c.side + '</div>' +
      '<div class="eo-pay__next" style="left:calc(' + c.next[0] + '*var(--u));top:calc(' + c.next[1] + '*var(--u));width:calc(' + c.next[2] + '*var(--u));height:calc(' + c.next[3] + '*var(--u))"><span class="eo-pay__mail">' + c.next[4] + '</span><span><b>' + c.next[5] + '</b><span>' + c.next[6] + '</span></span></div>' +
    '</div></div>';
  }
  function tick(small) { return '<span class="eo-pay__tick2">' + CHECK + '</span>'; }

  function paySlide() {
    return shell({
      alt: ALTS[2], step: 2, toast: ['Invoice sent', 'Customer ready to make payment'],
      title: 'Record payment', chip: 'Invoice INV-000008',
      form:
        payField('Customer', 'Zylker Inc', CHEV, 40, 106, 340) + payField('Amount received', '$88.50', '', 413, 106, 335) +
        payField('Payment date', '12 Jul 2023', CAL, 40, 196, 340) + payField('Payment method', 'Credit card', CHEV, 413, 196, 335) +
        payField('Reference number', 'PAY-000042', '', 40, 285, 340) + payField('Deposit to', 'Undeposited funds', CHEV, 413, 285, 335) +
        payField('Notes', 'Full payment received on site', '', 40, 375, 708) +
        '<div class="eo-pay__sum"><div><span>Invoice amount</span><b>$88.50</b></div><div><span>Amount applied</span><b>$88.50</b></div><div><span>Balance due</span><b class="is-green">$0.00</b></div></div>' +
        buttons('Record payment', CARD),
      sideLabel: 'Payment receipt',
      side: '<div class="eo-pay__card"><h4>Zylker Inc</h4><div class="eo-pay__no">RECEIPT<b>PAY-000042</b></div><span class="eo-pay__chip">' + CHECK + 'Paid</span>' +
        '<dl><div><dt>Invoice</dt><dd>INV-000008</dd></div><div><dt>Payment method</dt><dd>Credit card</dd></div><div><dt>Payment date</dt><dd>12 Jul 2023</dd></div><div><dt>Amount received</dt><dd>$88.50</dd></div><div><dt>Balance</dt><dd class="is-green">$0.00</dd></div></dl>' +
        '<div class="eo-pay__tot"><span>Total</span><b>$88.50</b></div><div class="eo-pay__bar"></div></div>',
      next: [1216, 731, 430, 83, MAIL, 'Send receipt next', 'Email confirmation to the customer']
    });
  }

  var HTML_SLIDES = [
    // 1. Work order
    function () {
      return shell({
        alt: ALTS[0], step: 0, toast: ['New service request', 'Ready to create a work order'],
        title: 'Create work order', chip: 'Request details captured',
        form:
          payField('Customer', 'Zylker Inc', CHEV, 40, 100, 340) + payField('Contact', 'Charles Stone', CHEV, 413, 100, 335) +
          payField('Service', 'Microwave repair', CHEV, 40, 177, 340) + payField('Priority', lead(PRIO, 'High'), CHEV, 413, 177, 335) +
          payField('Preferred date', lead(CALG, '12 Jul 2023'), CHEV, 40, 254, 340) + payField('Time slot', lead(CLOCK, '11:00 AM – 12:00 PM'), CHEV, 413, 254, 335) +
          payField('Technician', 'David Miller', CHEV, 40, 331, 708) +
          payField('Notes', 'Inspect heating issue and replace bulb if required.', '', 40, 408, 708, 'eo-pay__f--tall') +
          '<div class="eo-pay__tbl" style="top:calc(512*var(--u))"><div class="row head" style="grid-template-columns:301fr 200fr 207fr"><span>Service line</span><span class="c">Qty</span><span class="r">Estimated cost</span></div>' +
          '<div class="row line" style="grid-template-columns:301fr 200fr 207fr;height:calc(44*var(--u))"><span class="item">Microwave repair</span><span class="c">1.00</span><span class="r">$78.00</span></div></div>' +
          buttons('Create work order', CHECK),
        sideLabel: 'Work order preview',
        side: '<div class="eo-pay__card"><div class="eo-pay__flow"><div class="eo-pay__hd"><h4>Zylker Inc</h4><div class="eo-pay__no">WORK ORDER<b>WO-000124</b></div></div>' +
          '<span class="eo-pay__chip" style="margin-top:calc(12*var(--u))">' + CALG + 'Scheduled</span>' +
          '<dl class="eo-pay__kv"><div><dt>Customer</dt><dd>Charles Stone</dd></div><div><dt>Service</dt><dd>Microwave repair</dd></div><div><dt>Scheduled time</dt><dd>12 Jul 2023,<br>11:00 AM – 12:00 PM</dd></div><div><dt>Assigned technician</dt><dd>David Miller</dd></div></dl></div>' +
          '<div class="eo-pay__est"><span>Total estimate</span><b>$78.00</b></div><div class="eo-pay__bar"></div></div>',
        next: [1204, 722, 372, 74, CALG, 'Schedule appointment next', 'Assign date, time, and technician']
      });
    },
    // 2. Invoice
    function () {
      return shell({
        alt: ALTS[1], step: 1, toast: ['Job complete on site', 'Invoice ready before they leave'],
        title: 'Create invoice', chip: 'Auto-filled from work order',
        form:
          payField('Customer', 'Zylker Inc', CHEV, 40, 108, 340, 'eo-pay__f--lg') + payField('Invoice number', 'INV-000008', '<span class="tag">Auto</span>', 400, 108, 348, 'eo-pay__f--lg') +
          '<div class="eo-pay__tbl" style="top:calc(200*var(--u))"><div class="row head" style="grid-template-columns:336fr 125fr 130fr 117fr;height:calc(46*var(--u))"><span>Item &amp; description</span><span class="c">Qty</span><span class="c">Rate</span><span class="r">Amount</span></div>' +
          '<div class="row line" style="grid-template-columns:336fr 125fr 130fr 117fr;height:calc(79*var(--u))"><span class="item">Microwave repair<small>Labour · 1 hr</small></span><span class="c item">1.00</span><span class="c item">70.00</span><span class="r b item">70.00</span></div>' +
          '<div class="row line" style="grid-template-columns:336fr 125fr 130fr 117fr;height:calc(79*var(--u))"><span class="item">Microwave bulb<small>Part · replacement</small></span><span class="c item">1.00</span><span class="c item">8.00</span><span class="r b item">8.00</span></div></div>' +
          '<div class="eo-pay__tot2"><div><span>Subtotal</span><b>$78.00</b></div><div><span>Tax (13.46%)</span><b>$10.50</b></div></div>' +
          '<div class="eo-pay__due"><span>Total due</span><b>$88.50</b></div>' +
          buttons('Send invoice', PLANE),
        sideLabel: 'Live preview',
        side: '<div class="eo-pay__card eo-pay__card--tilt"><div class="eo-pay__flow"><div class="eo-pay__hd"><h4>Zylker Inc</h4><div class="eo-pay__no">INVOICE<b>INV-000008</b></div></div>' +
          '<dl class="eo-pay__kv eo-pay__kv--r" style="margin-top:calc(26*var(--u))"><div><dt style="font-size:calc(14*var(--u))">Billed to</dt></div><div style="min-height:calc(24*var(--u))"><dt style="color:#161b18;font-weight:600;font-size:calc(17*var(--u))">Zylker Inc</dt></div></dl>' +
          '<dl class="eo-pay__kv eo-pay__kv--r" style="margin-top:calc(26*var(--u))"><div style="min-height:calc(40*var(--u))"><dt style="font-size:calc(18*var(--u))">Microwave repair</dt><dd>$70.00</dd></div><div style="min-height:calc(40*var(--u))"><dt style="font-size:calc(18*var(--u))">Microwave bulb</dt><dd>$8.00</dd></div><div style="min-height:calc(40*var(--u))"><dt style="color:#8a918d">Tax (13.46%)</dt><dd style="font-weight:400;color:#8a918d">$10.50</dd></div></dl></div>' +
          '<div class="eo-pay__est" style="top:calc(362*var(--u))"><span>Total</span><b>$88.50</b></div><div class="eo-pay__bar"></div></div>',
        next: [1131, 726, 275, 66, CARD, 'Collect payment next', 'Card, link or on the spot']
      });
    },
    function () { return paySlide(); },
    // 4. Report
    function () {
      return shell({
        alt: ALTS[3], step: 3, cls: 'eo-pay--c', toast: ['Payment received', 'Ready to document the completed service'],
        title: 'Create service report', chip: 'Pre-filled from appointment',
        form:
          payField('Service appointment', 'AP-10', '', 36, 100, 195, 'eo-pay__f--sm') + payField('Customer', 'Zylker Inc', CHEV, 257, 100, 243, 'eo-pay__f--sm') + payField('Technician', 'David Miller', CHEV, 527, 100, 221, 'eo-pay__f--sm') +
          '<span style="position:absolute;left:calc(36*var(--u));top:calc(190*var(--u));font-size:calc(15*var(--u));letter-spacing:calc(.6*var(--u));color:#5d6561">SERVICE SUMMARY</span>' +
          payField('', 'Microwave heating issue resolved and bulb replaced.', '', 34, 205, 714, 'eo-pay__f--sum') +
          '<div style="position:absolute;left:calc(36*var(--u));top:calc(296*var(--u));width:calc(600*var(--u))"><div class="eo-pay__chk">' + tick() + 'Diagnosed heating issue</div><div class="eo-pay__chk">' + tick() + 'Replaced microwave bulb</div><div class="eo-pay__chk">' + tick() + 'Tested appliance operation</div></div>' +
          payField('Duration', '1 hr', '', 36, 430, 122, 'eo-pay__f--sm') + payField('Parts used', 'Microwave bulb · 1', '', 183, 430, 195, 'eo-pay__f--sm') + payField('Technician comments', 'Unit tested and operating normally.', '', 400, 430, 348, 'eo-pay__f--sm') +
          '<div style="position:absolute;left:calc(36*var(--u));top:calc(520*var(--u));font-size:calc(17*var(--u));color:#5d6561">Customer feedback<div style="margin-top:calc(14*var(--u));display:flex;align-items:center;gap:calc(26*var(--u));font-size:calc(21*var(--u));color:#2a302c"><span class="eo-pay__stars" style="font-size:calc(34*var(--u))">★★★★★</span>Excellent service</div></div>' +
          '<div class="eo-pay__f" style="left:calc(423*var(--u));top:calc(520*var(--u));width:calc(325*var(--u))"><label>Customer signature</label><div class="eo-pay__sig" style="height:calc(60*var(--u));font-size:calc(40*var(--u));padding-left:calc(30*var(--u))"><span>Charles Stone</span></div></div>' +
          '<div class="eo-pay__btns" style="top:calc(618*var(--u))"><span class="eo-pay__btn eo-pay__btn--p" style="width:calc(208*var(--u))">' + PLANE + 'Create report</span><span class="eo-pay__btn eo-pay__btn--s">Save draft</span></div>',
        sideLabel: 'Service report preview',
        side: '<div class="eo-pay__card"><div class="eo-pay__flow"><div class="eo-pay__hd"><h4>Zylker Inc</h4><div class="eo-pay__no">SERVICE REPORT<b>SR-000031</b><span class="eo-pay__chip" style="margin-top:calc(6*var(--u));height:calc(28*var(--u));padding:0 calc(14*var(--u));font-size:calc(16*var(--u))">' + CHECK + 'Completed</span></div></div>' +
          '<dl class="eo-pay__kv eo-pay__kv--r" style="margin-top:calc(10*var(--u))"><div><dt>Appointment</dt><dd>AP-10</dd></div><div><dt>Technician</dt><dd>David Miller</dd></div><div><dt>Service</dt><dd>Microwave repair</dd></div><div><dt>Date</dt><dd>12 Jul 2023</dd></div><div><dt>Duration</dt><dd>1 hr</dd></div></dl>' +
          '<div style="margin-top:calc(14*var(--u))"><div class="eo-pay__chk eo-pay__chk--s">' + tick() + 'Diagnosed heating issue</div><div class="eo-pay__chk eo-pay__chk--s">' + tick() + 'Replaced microwave bulb</div><div class="eo-pay__chk eo-pay__chk--s">' + tick() + 'Tested appliance operation</div></div>' +
          '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:calc(14*var(--u));font-size:calc(17*var(--u));color:#5d6561">Customer rating<span style="color:#161b18;font-weight:600">5.0 <span class="eo-pay__stars" style="font-size:calc(22*var(--u))">★★★★★</span></span></div>' +
          '<div style="margin-top:calc(16*var(--u));font-size:calc(16*var(--u));color:#5d6561">Customer signature<div class="eo-pay__sig" style="font-size:calc(40*var(--u));padding-left:calc(24*var(--u));line-height:calc(48*var(--u))">Charles Stone</div></div></div><div class="eo-pay__bar"></div></div>',
        next: [1165, 755, 372, 68, SHARE, 'Share report', 'Email or download the completed PDF']
      });
    }
  ];
  stage.innerHTML = SLIDES.map(function (s, i) {
    return '<div class="eo-slide" id="eo-slide-' + s.id + '" role="group" aria-roledescription="slide" aria-label="' + (i + 1) + ' of ' + len + ': ' + s.label + '">' +
      HTML_SLIDES[i]() + '</div>';
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

// Keep the slide / section artwork scaled to its container (CSS cqw is the fallback).
(function () {
  if (!window.ResizeObserver) return;
  function track(sel, inner, base) {
    var ro = new ResizeObserver(function (entries) {
      entries.forEach(function (e) {
        var el = e.target.querySelector(inner);
        if (el && e.contentRect.width) el.style.setProperty('--u', (e.contentRect.width / base) + 'px');
      });
    });
    document.querySelectorAll(sel).forEach(function (n) { ro.observe(n); });
  }
  track('.eo-pay', '.eo-pay__in', 1792);
  track('.s2e__art', '.s2e__in', 1672);
})();
