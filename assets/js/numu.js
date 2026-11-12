(function () {
var d = document, w = window, root = d.documentElement;
var reduce = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;
var finePointer = w.matchMedia && w.matchMedia('(hover: hover) and (pointer: fine)').matches;
var each = function (sel, fn, ctx) { Array.prototype.forEach.call((ctx || d).querySelectorAll(sel), fn); };
var hasIO = 'IntersectionObserver' in w;
var toggle = d.querySelector('.menu-toggle'), nav = d.getElementById('site-nav'), navY = null;
if (toggle && nav) {
var navClose = function () { nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); };
toggle.addEventListener('click', function () {
var open = nav.classList.toggle('is-open');
toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
navY = open ? (w.scrollY || w.pageYOffset) : null;
});
nav.addEventListener('click', function (e) { if (e.target.closest('a')) navClose(); });
d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('is-open')) { navClose(); toggle.focus(); } });
w.addEventListener('scroll', function () {
if (!nav.classList.contains('is-open')) { navY = null; return; }
var y = w.scrollY || w.pageYOffset;
if (navY === null) { navY = y; return; }
if (y - navY > 24) { navClose(); navY = null; }
else if (y < navY) navY = y;
}, { passive: true });
}
var header = d.querySelector('.site-header');
var rp = d.querySelector('.read-progress'), article = d.querySelector('.prose');
var flows = d.querySelectorAll('.flow');
var arts = d.querySelectorAll('[data-art]');
var ticking = false;
function onScroll() {
var y = w.scrollY || w.pageYOffset, vh = w.innerHeight;
if (header) header.classList.toggle('is-scrolled', y > 8);
if (rp && article) {
var r = article.getBoundingClientRect();
var p = Math.min(1, Math.max(0, (vh * 0.3 - r.top) / Math.max(1, r.height - vh * 0.4)));
rp.style.setProperty('--rp', p.toFixed(3));
}
if (!reduce) {
Array.prototype.forEach.call(flows, function (f) {
var r = f.getBoundingClientRect();
var p = Math.min(1, Math.max(0, (vh * 0.65 - r.top) / Math.max(1, r.height)));
f.style.setProperty('--p', p.toFixed(3));
each('li', function (li) { li.classList.toggle('on', li.getBoundingClientRect().top < vh * 0.65); }, f);
});
Array.prototype.forEach.call(arts, function (a) {
var r = a.getBoundingClientRect();
if (r.bottom < 0 || r.top > vh) return;
var c = (r.top + r.height / 2 - vh / 2) / vh;  // -1..1 تقريباً
a.style.setProperty('--sy', c.toFixed(3));
});
}
ticking = false;
}
w.addEventListener('scroll', function () { if (!ticking) { ticking = true; w.requestAnimationFrame(onScroll); } }, { passive: true });
onScroll();
if (reduce) each('.flow', function (f) { f.style.setProperty('--p', '1'); each('li', function (li) { li.classList.add('on'); }, f); });
function live(a) { a.classList.add('is-live'); }
if (hasIO && !reduce) {
var aio = new IntersectionObserver(function (es) {
es.forEach(function (e) { if (e.isIntersecting) { live(e.target); aio.unobserve(e.target); } });
}, { threshold: 0.2 });
Array.prototype.forEach.call(arts, function (a) { aio.observe(a); });
// إيقاف الحركة المستمرة للوحات خارج الشاشة لتوفير البطارية
var pio = new IntersectionObserver(function (es) {
es.forEach(function (e) { e.target.classList.toggle('is-paused', !e.isIntersecting); });
});
Array.prototype.forEach.call(arts, function (a) { pio.observe(a); });
} else {
Array.prototype.forEach.call(arts, live);
}
if (finePointer && !reduce) {
Array.prototype.forEach.call(arts, function (a) {
var host = a.closest('section') || a;
host.addEventListener('pointermove', function (e) {
var r = a.getBoundingClientRect();
a.style.setProperty('--mx', (((e.clientX - r.left) / r.width) - 0.5).toFixed(3));
a.style.setProperty('--my', (((e.clientY - r.top) / r.height) - 0.5).toFixed(3));
});
host.addEventListener('pointerleave', function () { a.style.setProperty('--mx', 0); a.style.setProperty('--my', 0); });
});
}
function countUp(el) {
var target = parseFloat(el.getAttribute('data-count')), suffix = el.getAttribute('data-suffix') || '', prefix = el.getAttribute('data-prefix') || '';
if (reduce || !w.requestAnimationFrame) { el.textContent = prefix + target + suffix; return; }
var start = null, dur = 1400;
function step(t) {
if (!start) start = t;
var p = Math.min(1, (t - start) / dur), e = 1 - Math.pow(1 - p, 3);
el.textContent = prefix + Math.round(target * e) + suffix;
if (p < 1) w.requestAnimationFrame(step);
}
w.requestAnimationFrame(step);
}
var counters = d.querySelectorAll('[data-count]');
if (hasIO) {
var cio = new IntersectionObserver(function (es) {
es.forEach(function (e) { if (e.isIntersecting) { countUp(e.target); cio.unobserve(e.target); } });
}, { threshold: 0.6 });
Array.prototype.forEach.call(counters, function (c) { cio.observe(c); });
}
if (hasIO && !reduce) {
root.classList.add('io');
var rio = new IntersectionObserver(function (es) {
es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
}, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });
var groups = [['.svc-grid', '.svc'], ['.why-grid', '.why'], ['.cat-grid', '.cat'], ['.post-grid', '.pcard'], ['.values', 'li'], ['.plat-list', 'li'], ['.scope-grid', '.scope'], ['.sub-list', 'li'], ['.stats', '.stat'], ['.def-list', 'div']];
groups.forEach(function (g) {
each(g[0], function (parent) {
Array.prototype.forEach.call(parent.querySelectorAll(g[1]), function (k, i) {
if (k.parentNode !== parent) return;
k.classList.add('reveal'); k.style.setProperty('--d', (Math.min(i, 6) * 0.07) + 's'); rio.observe(k);
});
});
});
each('.section-head, .block, .not-found, .contact-inner, .note-box, .plat-group > div:first-child', function (el) {
if (el.classList.contains('reveal')) return; el.classList.add('reveal'); rio.observe(el);
});
each('.steps, .check-list, .steps-light', function (list) {
Array.prototype.forEach.call(list.children, function (li, i) { li.style.setProperty('--d', (0.15 + i * 0.2) + 's'); });
rio.observe(list);
});
}
var input = d.getElementById('sector-search');
if (input) {
var norm = function (s) {
return (s || '').replace(/[ً-ْٰـ]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ى/g, 'ي')
.replace(/ة/g, 'ه').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي').toLowerCase().replace(/\s+/g, ' ').trim();
};
var gs = d.querySelectorAll('[data-group]'), status = d.getElementById('result-status');
var none = d.getElementById('no-results'), noneTerm = d.getElementById('nr-term'), notListed = d.getElementById('not-listed');
var run = function () {
var raw = input.value.trim(), q = norm(raw), words = q ? q.split(' ') : [], total = 0;
Array.prototype.forEach.call(gs, function (g) {
var gt = norm(g.getAttribute('data-terms')), gm = words.length && words.every(function (x) { return gt.indexOf(x) > -1; }), shown = 0;
each('[data-item]', function (li) {
var t = norm(li.getAttribute('data-terms'));
var m = !words.length || gm || words.every(function (x) { return t.indexOf(x) > -1; });
li.hidden = !m; if (m) shown++;
}, g);
g.hidden = shown === 0; total += shown;
});
if (!words.length) { status.textContent = ''; none.hidden = true; notListed.hidden = false; }
else if (!total) { status.textContent = 'لا توجد نتائج.'; noneTerm.textContent = raw; none.hidden = false; notListed.hidden = true; }
else { status.textContent = total === 1 ? 'نتيجة واحدة.' : total === 2 ? 'نتيجتان.' : total <= 10 ? total + ' نتائج.' : total + ' نتيجة.'; none.hidden = true; notListed.hidden = false; }
};
var t; input.addEventListener('input', function () { clearTimeout(t); t = setTimeout(run, 120); });
}
var filter = d.querySelector('[data-blog-filter]');
if (filter) {
each('button', function (b) {
b.addEventListener('click', function () {
var c = b.getAttribute('data-cat');
each('button', function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }, filter);
each('[data-post-cat]', function (p) { p.hidden = !!c && p.getAttribute('data-post-cat') !== c; });
});
}, filter);
}
var toc = d.querySelectorAll('.toc a');
if (toc.length && hasIO) {
var map = {};
Array.prototype.forEach.call(toc, function (a) { map[a.getAttribute('href').slice(1)] = a; });
var tio = new IntersectionObserver(function (es) {
es.forEach(function (e) {
if (e.isIntersecting) { Array.prototype.forEach.call(toc, function (a) { a.classList.remove('on'); }); if (map[e.target.id]) map[e.target.id].classList.add('on'); }
});
}, { rootMargin: '-20% 0px -70% 0px' });
each('.prose h2[id]', function (h) { tio.observe(h); });
}
each('[data-ill]', function (fig) {
var scenes = fig.querySelectorAll('.scene'), caps = fig.querySelectorAll('.cap'), dots = fig.querySelectorAll('.dot');
var pauseBtn = fig.querySelector('[data-pause]'), i = 0, timer = null, paused = reduce, hover = false;
function show(n) {
i = (n + scenes.length) % scenes.length;
for (var k = 0; k < scenes.length; k++) {
var on = k === i;
scenes[k].classList.toggle('is-active', on); caps[k].classList.toggle('is-active', on); dots[k].setAttribute('aria-pressed', on ? 'true' : 'false');
}
}
function stop() { clearInterval(timer); timer = null; }
function start() { stop(); if (!paused && !hover) timer = setInterval(function () { show(i + 1); }, 5000); }
function setPaused(p) {
paused = p; fig.classList.toggle('is-paused', p);
pauseBtn.setAttribute('aria-pressed', p ? 'true' : 'false');
pauseBtn.querySelector('.sr').textContent = p ? 'تشغيل الحركة' : 'إيقاف الحركة';
start();
}
Array.prototype.forEach.call(dots, function (dt) { dt.addEventListener('click', function () { show(+dt.getAttribute('data-go')); start(); }); });
pauseBtn.addEventListener('click', function () { setPaused(!paused); });
fig.addEventListener('mouseenter', function () { hover = true; stop(); });
fig.addEventListener('mouseleave', function () { hover = false; start(); });
d.addEventListener('visibilitychange', function () { if (d.hidden) stop(); else start(); });
if (reduce) setPaused(true); else start();
});
var WA_NUM = '963951451275', NOTE_KEY = 'numu_note';
function getNote() { try { return sessionStorage.getItem(NOTE_KEY) || ''; } catch (e) { return ''; } }
function setNote(v) { try { sessionStorage.setItem(NOTE_KEY, v); } catch (e) {} }
function waLink(msg, note) {
note = (note || '').trim();
return 'https://wa.me/' + WA_NUM + '?text=' + encodeURIComponent(msg + (note ? '\n' + 'تفاصيل: ' + note : ''));
}
each('textarea[data-note]', function (t) {
if (!t.value) t.value = getNote();
t.addEventListener('input', function () { setNote(t.value); });
});
each('[data-wa-msg]', function (a) {
a.addEventListener('click', function () {
var box = a.closest('[data-request]') || d;
var t = box.querySelector('textarea[data-note]');
a.href = waLink(a.getAttribute('data-wa-msg'), t ? t.value : getNote());
});
});
var aBtn = d.getElementById('assist-btn'), aPanel = d.getElementById('assist-panel'), aData = d.getElementById('assist-data');
if (aBtn && aPanel && aData) {
var services = []; try { services = JSON.parse(aData.textContent); } catch (e) {}
var body = aPanel.querySelector('.assist-body');
var escH = function (x) { return String(x).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
var noteHTML = function () {
return '<div class="note-field"><label for="assist-note">اشرح احتياجك باختصار (اختياري)</label>' +
'<textarea id="assist-note" data-note maxlength="300" placeholder="مثلاً: عيادة أسنان في حمص، نريد طلبات حجز أكثر"></textarea>' +
'<p class="caption">لا تكتب معلومات صحية أو شخصية حساسة أو كلمات مرور.</p></div>';
};
var home = function () {
body.innerHTML = '<p class="assist-q" id="assist-q">ما الذي تريد تحسينه؟</p><div class="assist-opts" role="group" aria-labelledby="assist-q">' +
services.map(function (s, i) { return '<button type="button" data-i="' + i + '">' + escH(s.pick) + '</button>'; }).join('') +
'<button type="button" data-other>شيء آخر</button></div>' +
(d.getElementById('numu-quiz') ? '<button type="button" class="assist-quiz" data-quiz>لست متأكداً؟ <b>حلّل احتياجك في دقيقة</b></button>' : '');
var first = body.querySelector('button'); if (first) first.focus();
};
var show = function (s) {
var avail = s.status === 'available';
body.innerHTML = '<button type="button" class="assist-back" data-back>رجوع إلى الخيارات</button>' +
'<div class="assist-card"><span class="status ' + s.status + '">' + escH(s.statusLabel) + '</span><h3>' + escH(s.name) + '</h3><p>' + escH(s.short) + '</p>' +
'<p><b>يشمل مثلاً:</b></p><ul>' + s.includes.map(function (x) { return '<li>' + escH(x) + '</li>'; }).join('') + '</ul>' +
'<p><b>لا يشمل:</b> ' + escH(s.exclude) + '</p>' +
(avail ? '' : '<p>لم نؤكد توفر هذه الخدمة بعد. راسلنا ونخبرك بصراحة إن كانت متاحة لك.</p>') + '</div>' +
noteHTML() +
'<div class="assist-actions"><a class="btn btn-primary" target="_blank" rel="noopener" href="#" data-assist-wa>اطلب الخدمة عبر واتساب</a>' +
'<a class="btn btn-quiet" href="' + s.url + '">افتح صفحة الخدمة</a></div>';
wire('مرحباً، أودّ طلب خدمة «' + s.name + '».');
};
var other = function () {
body.innerHTML = '<button type="button" class="assist-back" data-back>رجوع إلى الخيارات</button>' +
'<div class="assist-card"><h3>شيء آخر</h3><p>أخبرنا بما تحتاجه. إن لم يكن ضمن ما نقدّمه، نخبرك بذلك بصراحة.</p></div>' + noteHTML() +
'<div class="assist-actions"><a class="btn btn-primary" target="_blank" rel="noopener" href="#" data-assist-wa>راسلنا على واتساب</a></div>';
wire('مرحباً، لدي استفسار عن خدمات نُمُو.');
};
var wire = function (msg) {
var t = body.querySelector('textarea'); t.value = getNote();
t.addEventListener('input', function () { setNote(t.value); });
var w = body.querySelector('[data-assist-wa]');
var upd = function () { w.href = waLink(msg, t.value); }; upd();
t.addEventListener('input', upd);
var h = body.querySelector('h3'); if (h) { h.setAttribute('tabindex', '-1'); h.focus(); }
};
body.addEventListener('click', function (e) {
var b = e.target.closest('button'); if (!b) return;
if (b.hasAttribute('data-i')) show(services[+b.getAttribute('data-i')]);
else if (b.hasAttribute('data-other')) other();
else if (b.hasAttribute('data-back')) home();
});
var open = function () { aPanel.hidden = false; aBtn.setAttribute('aria-expanded', 'true'); home(); };
var close = function () { aPanel.hidden = true; aBtn.setAttribute('aria-expanded', 'false'); aBtn.focus(); };
aBtn.addEventListener('click', function () { if (aPanel.hidden) open(); else close(); });
aPanel.querySelector('.assist-close').addEventListener('click', close);
d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !aPanel.hidden) close(); });
}
var qDlg = d.getElementById('numu-quiz'), qData = d.getElementById('quiz-data');
if (qDlg && qData && typeof qDlg.showModal === 'function') {
var Q = {}; try { Q = JSON.parse(qData.textContent); } catch (e) {}
var qBody = qDlg.querySelector('.quiz-body'), qBar = qDlg.querySelector('.quiz-prog i');
var qEsc = function (x) { return String(x).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
var steps = [
{ k: 'sector', q: 'ما نوع نشاطك؟', o: Q.sectors },
{ k: 'goal', q: 'ما أكثر ما يزعجك الآن؟', o: (Q.goals || []).map(function (g) { return [g[0], g[1]]; }) },
{ k: 'have', q: 'ما الموجود لديك حالياً؟', hint: 'اختر كل ما ينطبق، ثم اضغط «التالي».', multi: true, o: Q.have },
{ k: 'who', q: 'من ينشر على حساباتك اليوم؟', o: Q.who },
{ k: 'start', q: 'كيف تفضّل أن تبدأ؟', o: Q.start }
];
var ans, cur, lastFocus;
var label = function (k, v) { var st = steps.filter(function (s) { return s.k === k; })[0]; var o = st.o.filter(function (x) { return x[0] === v; })[0]; return o ? o[1] : v; };
var focusFirst = function () { var h = qBody.querySelector('[tabindex="-1"], button, a'); if (h) h.focus(); };
var renderStep = function () {
var s = steps[cur], sel = ans[s.k];
qBar.style.width = (cur / steps.length * 100) + '%';
var opts = s.o.map(function (o) {
var on = s.multi ? (sel || []).indexOf(o[0]) > -1 : sel === o[0];
return '<button type="button" class="quiz-opt' + (on ? ' on' : '') + '" data-v="' + qEsc(o[0]) + '"' + (s.multi ? ' aria-pressed="' + on + '"' : '') + '>' + qEsc(o[1]) + '</button>';
}).join('');
qBody.innerHTML = '<p class="quiz-step">السؤال ' + (cur + 1) + ' من ' + steps.length + '</p>' +
'<h2 class="quiz-q" id="quiz-q" tabindex="-1">' + s.q + '</h2>' + (s.hint ? '<p class="quiz-hint">' + s.hint + '</p>' : '') +
'<div class="quiz-opts' + (s.multi ? ' multi' : '') + '" role="group" aria-labelledby="quiz-q">' + opts + '</div>' +
'<div class="quiz-nav">' + (cur ? '<button type="button" class="quiz-back" data-qback>رجوع</button>' : '<span></span>') +
(s.multi ? '<button type="button" class="btn btn-primary btn-small" data-qnext' + ((sel || []).length ? '' : ' disabled') + '>التالي</button>' : '') + '</div>';
qBody.querySelector('#quiz-q').focus();
};
var analyse = function () {
var sc = {}, add = function (k, n) { if (Q.svc[k]) sc[k] = (sc[k] || 0) + n; };
var has = function (x) { return ans.have.indexOf(x) > -1; };
var g = ans.goal, notes = [];
({
find: function () { add('seo', 3); add('ai-search', 2); if (has('site')) { add('seo', 1); notes.push('has_site_find'); } else add('website', 3); },
convert: function () { add('whatsapp-telegram', 3); add('content-creation', 2); add('digital-presence-audit', 2); add('analytics-reporting', 1); },
look: function () { add('brand-identity', has('brand') ? 2 : 5); add('photography', 2); add('content-creation', 1); },
reach: function () { add('paid-ads', 5); add('content-strategy', 1); if (has('ads')) { add('analytics-reporting', 2); notes.push('has_ads'); } },
content: function () { if (ans.who === 'team') { add('content-strategy', 4); add('content-creation', 2); } else { add('account-management', 4); add('content-strategy', 2); } },
media: function () { add('photography', 4); add('video', 3); },
sell: function () { add('ecommerce-marketing', 4); if (!has('site')) add('website', 3); add('whatsapp-telegram', 2); },
lost: function () { add('digital-presence-audit', 5); add('marketing-consulting', 3); }
}[g] || function () {})();
if (ans.who === 'nobody') add('account-management', 2);
if (ans.who === 'me') add('account-management', 1);
if (has('none')) { add('brand-identity', 1); notes.push('none'); }
if (ans.start === 'plan') { add('digital-presence-audit', 2); notes.push('plan'); }
if (ans.start === 'unsure') add('marketing-consulting', 1);
if (ans.start === 'small') notes.push('small');
if (ans.sector === 'students') add('digital-presence-audit', -3);   // المراجعة الكاملة أثقل مما يحتاجه فرد
if (has('brand') && g !== 'look') delete sc['brand-identity'];
Object.keys(sc).forEach(function (k) { if (sc[k] <= 0) delete sc[k]; });
var top = Object.keys(sc).sort(function (a, b) { return sc[b] - sc[a]; }).slice(0, 3);
if (top.indexOf('website') > -1 && !has('brand')) {   // الهوية إلزامية قبل الموقع إلا لمن لديه هوية جاهزة
// لا موقع ولا هوية: الهوية أولاً ثم الموقع، ثم ما يُبنى عليهما
top = ['brand-identity', 'website'].concat(top.filter(function (k) { return k !== 'brand-identity' && k !== 'website'; }));
while (top.length > 3) { for (var j = top.length - 1; j >= 0; j--) if (top[j] !== 'website' && top[j] !== 'brand-identity') { top.splice(j, 1); break; } }
notes.push('no_brand_site');
}
return { top: top, notes: notes };
};
var renderResult = function () {
qBar.style.width = '100%';
var r = analyse(), goal = (Q.goals || []).filter(function (x) { return x[0] === ans.goal; })[0] || ['', '', ''];
var small = ans.start === 'small';
var cards = r.top.map(function (k, i) {
var s = Q.svc[k], p = (k === 'website' && ans.goal === 'sell' && Q.store) || (small && s.pkgSmall) || s.pkg;
return '<li class="quiz-rec"><span class="quiz-n">' + (i + 1) + '</span><div><h3><a href="' + s.url + '">' + qEsc(s.name) + '</a></h3><p>' + qEsc(s.why) + '</p>' +
(p ? '<a class="quiz-pkg" href="' + p.url + '" data-pkg="' + qEsc(p.name) + '">' + qEsc(p.name) + ' · <b>' + qEsc(p.price) + '</b></a>' : '') + '</div></li>';
}).join('');
var chips = [label('sector', ans.sector), goal[1]].concat(ans.have.map(function (h) { return label('have', h); }))
.map(function (c) { return '<span>' + qEsc(c) + '</span>'; }).join('');
var sec = ans.sector !== 'other' ? '<a href="/sectors/' + ans.sector + '/">ما نقترحه لقطاع ' + qEsc(label('sector', ans.sector)) + '</a>' : '';
qBody.innerHTML = '<p class="quiz-step">النتيجة</p><h2 class="quiz-q" tabindex="-1">تحليل مبدئي لوضعك</h2>' +
'<div class="quiz-chips">' + chips + '</div>' +
'<h3 class="quiz-sub">ما فهمناه</h3><p>' + qEsc(goal[2]) + '</p>' +
r.notes.map(function (n) { return Q.notes[n] ? '<p class="quiz-note">' + qEsc(Q.notes[n]) + '</p>' : ''; }).join('') +
'<h3 class="quiz-sub">من أين تبدأ؟ بالترتيب</h3><ol class="quiz-recs">' + cards + '</ol>' +
'<p class="caption">هذا اقتراح أولي. نحدد معك النطاق والتكلفة كتابةً بعد أن نفهم مشروعك، وقد نقترح أقل مما يظهر هنا.</p>' +
'<div class="note-field"><label for="quiz-note">اسم نشاطك ومدينتك (اختياري)</label><input id="quiz-note" maxlength="120" placeholder="مثلاً: مطعم في اللاذقية"></div>' +
'<div class="quiz-actions"><a class="btn btn-primary" target="_blank" rel="noopener" href="#" data-quiz-wa>' +
'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z"/></svg>أرسل التحليل لنا على واتساب</a>' +
'<a class="btn btn-quiet" href="/services/">استعرض كل الخدمات</a></div>' +
'<div class="quiz-more">' + sec + '<button type="button" data-quiz-close>تصفّح الموقع</button><button type="button" data-qagain>أعد الاختبار</button></div>';
var inp = qBody.querySelector('#quiz-note'), wa = qBody.querySelector('[data-quiz-wa]');
var msg = function () {
var n = inp.value.trim();
return 'مرحباً، أجريت اختبار «حلّل احتياجك» في موقع نُمُو:\n' +
'- النشاط: ' + label('sector', ans.sector) + (n ? ' (' + n + ')' : '') + '\n' +
'- المشكلة: ' + goal[1] + '\n' +
'- الموجود حالياً: ' + ans.have.map(function (h) { return label('have', h); }).join('، ') + '\n' +
'- النشر: ' + label('who', ans.who) + '\n' +
'- البداية: ' + label('start', ans.start) + '\n' +
'الخدمات المقترحة: ' + r.top.map(function (k) { return Q.svc[k].name; }).join('، ') + '\n' +
'أودّ مناقشة الخطوة الأولى.';
};
var upd = function () { wa.href = 'https://wa.me/' + WA_NUM + '?text=' + encodeURIComponent(msg()); }; upd();
inp.addEventListener('input', upd);
wa.addEventListener('click', function () { track('quiz_whatsapp', { goal: ans.goal, sector: ans.sector }); });
track('quiz_complete', { goal: ans.goal, sector: ans.sector, first_service: r.top[0] || '' });
qBody.querySelector('.quiz-q').focus();
};
var next = function () { cur++; if (cur < steps.length) renderStep(); else renderResult(); qBody.scrollTop = 0; };
var renderWelcome = function () {
qBar.style.width = '0';
qBody.innerHTML = '<p class="quiz-step">أهلاً بك في نُمُو</p>' +
'<h2 class="quiz-q" tabindex="-1">قبل أن تتصفح: ما الذي يحتاجه نشاطك فعلاً؟</h2>' +
'<p>أجب عن خمسة أسئلة سريعة، ونعطيك تحليلاً مبدئياً لوضعك: ما الذي ينقصك غالباً، ومن أين تبدأ بالترتيب، ولماذا.</p>' +
'<div class="quiz-sample" aria-label="مثال توضيحي لشكل التحليل"><span class="quiz-sample-tag">مثال توضيحي</span>' +
'<p class="quiz-sample-h">ما فهمناه</p><p class="quiz-sample-t">الناس لا يجدونك حين يبحثون، لأن معلوماتك غير مرتبة على الويب…</p>' +
'<p class="quiz-sample-h">من أين تبدأ؟ بالترتيب</p><ol><li><span>1</span>الهوية البصرية</li><li><span>2</span>إنشاء الموقع</li><li><span>3</span>تحسين محركات البحث</li></ol></div>' +
'<ul class="quiz-points"><li>دقيقة واحدة تقريباً</li><li>بلا اسم ولا رقم هاتف</li><li>ترسل النتيجة لنا على واتساب فقط إن أردت</li></ul>' +
'<div class="quiz-actions quiz-sticky"><button type="button" class="btn btn-primary" data-qstart>ابدأ التحليل</button>' +
'<button type="button" class="btn btn-quiet" data-quiz-close data-skip>تخطَّ وتصفّح الموقع</button></div>';
qBody.querySelector('.quiz-q').focus();
};
var qOpen = function (src) {
lastFocus = d.activeElement; ans = { have: [] }; cur = 0;
if (aPanel && !aPanel.hidden) { aPanel.hidden = true; aBtn.setAttribute('aria-expanded', 'false'); }
markSeen();
qDlg.showModal(); d.documentElement.classList.add('quiz-lock');
if (src === 'welcome') renderWelcome(); else renderStep();
track('quiz_open', { page_path: location.pathname, source: src || 'button' });
};
var qClose = function () { if (qDlg.open) qDlg.close(); };
qDlg.addEventListener('close', function () { d.documentElement.classList.remove('quiz-lock'); if (lastFocus && lastFocus.focus) lastFocus.focus(); });
qDlg.addEventListener('click', function (e) {
if (e.target === qDlg) return qClose();   // النقر خارج الصندوق
var b = e.target.closest('button'); if (!b) return;
if (b.hasAttribute('data-skip')) track('quiz_skip', { page_path: location.pathname });
if (b.hasAttribute('data-quiz-close')) return qClose();
if (b.hasAttribute('data-qstart')) { track('quiz_start', { page_path: location.pathname }); return renderStep(); }
if (b.hasAttribute('data-qback')) { cur--; return renderStep(); }
if (b.hasAttribute('data-qagain')) { ans = { have: [] }; cur = 0; return renderStep(); }
if (b.hasAttribute('data-qnext')) return next();
if (b.hasAttribute('data-v')) {
var s = steps[cur], v = b.getAttribute('data-v');
if (!s.multi) { ans[s.k] = v; b.classList.add('on'); return setTimeout(next, 140); }
var arr = ans[s.k] || [];
if (v === 'none') arr = arr.indexOf('none') > -1 ? [] : ['none'];
else { arr = arr.filter(function (x) { return x !== 'none'; }); var i = arr.indexOf(v); if (i > -1) arr.splice(i, 1); else arr.push(v); }
ans[s.k] = arr;
each('.quiz-opt', function (o) { var on = arr.indexOf(o.getAttribute('data-v')) > -1; o.classList.toggle('on', on); o.setAttribute('aria-pressed', on); });
qBody.querySelector('[data-qnext]').disabled = !arr.length;
}
});
d.addEventListener('click', function (e) {
var t = e.target.closest('[data-quiz]'); if (!t) return;
e.preventDefault(); qOpen(t.closest('#numu-assist') ? 'assistant' : 'button');
});
// شاشة الترحيب تظهر تلقائياً مرة واحدة لكل زائر، بعد تحميل الصفحة بقليل، ويمكن تخطيها
var SEEN = 'numu_quiz_welcome';
var seen = function () { try { return localStorage.getItem(SEEN); } catch (e) { return '1'; } };
var markSeen = function () { try { localStorage.setItem(SEEN, '1'); } catch (e) {} };
if (!seen() && !d.querySelector('main > .nf') && !/[?&]noquiz/.test(location.search)) {
var auto = function () { setTimeout(function () { if (!qDlg.open && !seen() && (!aPanel || aPanel.hidden)) qOpen('welcome'); }, 1200); };
if (d.readyState === 'complete') auto(); else w.addEventListener('load', auto);
}
}
var track = function (name, params) { if (typeof w.gtag === 'function') w.gtag('event', name, params || {}); };
var where = function (el) {
var s = el.closest('[id]');
var zone = el.closest('header') ? 'header' : el.closest('footer') ? 'footer' : el.closest('#numu-assist') ? 'assistant'
: el.closest('.request-box') ? 'request_box' : el.closest('.cta-final') ? 'contact_section' : el.closest('.hero2, .page-head, .svc-head') ? 'hero' : (s ? s.id : 'body');
return zone;
};
d.addEventListener('click', function (e) {
var a = e.target.closest('a');
if (!a) return;
var href = a.getAttribute('href') || '', p = { link_location: where(a), page_path: location.pathname };
if (/wa\.me\//.test(href)) {
var svc = a.closest('[data-request]') && d.querySelector('.svc-head h1');
if (svc) p.service = svc.textContent.trim().slice(0, 60);
if (a.closest('.bizra-band, .soon')) p.topic = 'bizra';
if (a.hasAttribute('data-pkg')) p.package = a.getAttribute('data-pkg');
track('whatsapp_click', p);
} else if (href.indexOf('tel:') === 0) track('call_click', p);
else if (href.indexOf('mailto:') === 0) track('email_click', p);
else if (a.hasAttribute('data-pkg')) track('package_click', { package: a.getAttribute('data-pkg'), page_path: location.pathname });
else if (/instagram\.com/.test(href)) track('instagram_click', p);
else if (/facebook\.com|youtube\.com|t\.me\/|(^|\/\/)x\.com/.test(href)) track('social_click', { network: (href.split('/')[2] || ''), link_location: p.link_location, page_path: location.pathname });
else if (a.closest('.chooser')) track('service_pick', { service_path: href, page_path: location.pathname });
else if (a.closest('.bizra-band') || href === '/bizra/') track('bizra_interest', p);
else if (href === '/pricing/') track('pricing_click', p);
else if (/^https?:\/\//.test(href) && href.indexOf(location.host) === -1) track('outbound_click', { link_domain: (href.split('/')[2] || ''), page_path: location.pathname });
}, true);
var ab = d.getElementById('assist-btn');
if (ab) ab.addEventListener('click', function () { if (ab.getAttribute('aria-expanded') === 'true') track('assistant_open', { page_path: location.pathname }); });
each('[data-qb]', function (box) {
var tools = box.querySelector('.qb-tools'); if (!tools) return;
tools.hidden = false;
var qIn = box.querySelector('[data-qb-q]'), spIn = box.querySelector('[data-qb-sp]'), govIn = box.querySelector('[data-qb-gov]');
var count = box.querySelector('[data-qb-count]'), empty = box.querySelector('[data-qb-empty]');
var specs = box.querySelectorAll('.qb-spec'), t = null;
var norm = function (x) { return (x || '').replace(/[\u064B-\u0652\u0640]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').toLowerCase(); };
function run() {
var q = norm(qIn.value.trim()), sp = spIn.value, gov = govIn.value, active = !!(q || sp || gov), shown = 0;
Array.prototype.forEach.call(specs, function (s) {
var okSp = !sp || s.getAttribute('data-sp') === sp, n = 0;
Array.prototype.forEach.call(s.querySelectorAll('.qb-q'), function (it) {
var g = it.getAttribute('data-gov');
var ok = okSp && (!gov || g === '*' || g === gov) && (!q || norm(it.querySelector('summary').textContent).indexOf(q) > -1);
it.hidden = !ok; if (ok) n++;
});
Array.prototype.forEach.call(s.querySelectorAll('.qb-gov'), function (gb) { gb.hidden = !gb.querySelector('.qb-q:not([hidden])'); });
var loc = s.querySelector('.qb-local'); if (loc) loc.hidden = !loc.querySelector('.qb-q:not([hidden])');
s.hidden = n === 0; shown += n;
if (active && n) s.open = true; else if (!active) s.open = false;
});
count.textContent = active ? (shown + ' سؤالاً مطابقاً') : '';
empty.hidden = shown !== 0;
}
var later = function () { clearTimeout(t); t = setTimeout(run, 160); };
qIn.addEventListener('input', later); spIn.addEventListener('change', run); govIn.addEventListener('change', run);
});
each('[data-gallery-filter]', function (bar) {
bar.addEventListener('click', function (e) {
var b = e.target.closest('button[data-cat]');
if (!b) return;
each('button', function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }, bar);
each('.g-item', function (it) { it.hidden = !!b.dataset.cat && it.dataset.gcat !== b.dataset.cat; });
});
});
w.addEventListener('scroll', function () {
if (w.innerHeight + w.scrollY >= d.body.scrollHeight - 4) {
each('.reveal:not(.in), .steps:not(.in), .check-list:not(.in), .steps-light:not(.in)', function (el) { el.classList.add('in'); });
Array.prototype.forEach.call(arts, live);
}
}, { passive: true });
root.classList.add('ready');
})();