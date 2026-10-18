/* ===== Kandhan Groups – site logic ===== */
const CONFIG = {
  primaryEmail: 'kandhangroups1964@gmail.com',
  ccEmail: 'nishanthsatya0851@gmail.com',
  whatsappOffice: '916363902388',
  whatsappDirector: '917795833418',
};

// Preloader
window.addEventListener('load', () => setTimeout(() => document.getElementById('preloader').classList.add('done'), 400));
document.getElementById('year').textContent = new Date().getFullYear();

// Navbar scroll + timeline progress
const nav = document.getElementById('navbar');
const timeline = document.getElementById('timeline');
const progress = document.getElementById('timeline-progress');
const onScroll = () => {
  nav.classList.toggle('scrolled', scrollY > 40);
  const r = timeline.getBoundingClientRect();
  const p = Math.min(1, Math.max(0, (innerHeight * 0.75 - r.top) / r.height));
  progress.style.width = p * 100 + '%';
};
addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Mobile menu
const burger = document.getElementById('burger-btn');
const links = document.getElementById('nav-links');
burger.addEventListener('click', () => { burger.classList.toggle('open'); links.classList.toggle('open'); });
links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { burger.classList.remove('open'); links.classList.remove('open'); }));

// Reveal on scroll (staggered)
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const siblings = [...e.target.parentElement.children].filter(c => c.classList.contains('reveal'));
    e.target.style.transitionDelay = Math.max(0, siblings.indexOf(e.target)) * 90 + 'ms';
    e.target.classList.add('in');
    io.unobserve(e.target);
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Counters
const cio = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, end = +el.dataset.count, suf = el.dataset.suffix || '';
    const t0 = performance.now(), dur = 1800;
    const tick = t => {
      const k = Math.min(1, (t - t0) / dur), v = Math.floor(end * (1 - Math.pow(1 - k, 3)));
      el.textContent = v + suf;
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    cio.unobserve(el);
  });
}, { threshold: 0.6 });
document.querySelectorAll('[data-count]').forEach(el => cio.observe(el));

// 3D tilt on service cards
document.querySelectorAll('.tilt').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    card.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-6px)`;
  });
  card.addEventListener('mouseleave', () => (card.style.transform = ''));
});

// Project filters
document.querySelectorAll('.filter').forEach(btn => btn.addEventListener('click', () => {
  document.querySelectorAll('.filter').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const f = btn.dataset.filter;
  document.querySelectorAll('.project').forEach(p => {
    const cats = p.dataset.cat.split(' ');
    p.classList.toggle('hide', !(f === 'all' || cats.includes(f)));
  });
}));

// Testimonials slider
const track = document.getElementById('t-track');
const dotsWrap = document.getElementById('t-dots');
const slides = track.children.length;
let idx = 0;
for (let i = 0; i < slides; i++) {
  const d = document.createElement('button');
  d.setAttribute('aria-label', 'Slide ' + (i + 1));
  d.id = 't-dot-' + i;
  d.onclick = () => go(i);
  dotsWrap.appendChild(d);
}
const go = i => {
  idx = i;
  track.style.transform = `translateX(-${i * 100}%)`;
  [...dotsWrap.children].forEach((d, j) => d.classList.toggle('active', j === i));
};
go(0);
setInterval(() => go((idx + 1) % slides), 5500);

// Select label float
document.querySelectorAll('.field select').forEach(s => {
  const upd = () => s.classList.toggle('filled', !!s.value);
  s.addEventListener('change', upd); upd();
});

// ===== Enquiry form =====
const form = document.getElementById('enquiry-form');
const submitBtn = document.getElementById('submit-enquiry-btn');
const modal = document.getElementById('success-modal');

function buildMessage(d) {
  return [
    '*New Enquiry – Kandhan Groups Website*',
    '',
    `*Name:* ${d.name}`,
    `*Phone:* ${d.phone}`,
    d.email && `*Email:* ${d.email}`,
    `*Location:* ${d.location}`,
    `*Service:* ${d.service}`,
    d.budget && `*Budget:* ${d.budget}`,
    d.size && `*Size:* ${d.size}`,
    d.start && `*Start:* ${d.start}`,
    d.message && `*Message:* ${d.message}`,
  ].filter(Boolean).join('\n');
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  let ok = true;
  form.querySelectorAll('[required]').forEach(inp => {
    const bad = !inp.value.trim() || (inp.pattern && !new RegExp('^' + inp.pattern + '$').test(inp.value.trim()));
    inp.closest('.field').classList.toggle('error', bad);
    if (bad) ok = false;
  });
  if (!ok) { form.querySelector('.error input, .error select')?.focus(); return; }

  const data = Object.fromEntries(new FormData(form).entries());
  const text = buildMessage(data);
  const waText = encodeURIComponent(text);
  document.getElementById('wa-send-1').href = `https://wa.me/${CONFIG.whatsappOffice}?text=${waText}`;
  document.getElementById('wa-send-2').href = `https://wa.me/${CONFIG.whatsappDirector}?text=${waText}`;

  submitBtn.classList.add('loading');
  submitBtn.disabled = true;
  let emailed = false;
  try {
    // FormSubmit – emails primary address and CCs the second address
    const res = await fetch(`https://formsubmit.co/ajax/${CONFIG.primaryEmail}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        _subject: `New Enquiry: ${data.service} – ${data.name}`,
        _cc: CONFIG.ccEmail,
        _template: 'table',
        _captcha: 'false',
        ...data,
      }),
    });
    emailed = res.ok;
  } catch (err) { emailed = false; }

  submitBtn.classList.remove('loading');
  submitBtn.disabled = false;
  document.getElementById('modal-msg').textContent = emailed
    ? 'Your enquiry has been emailed to our team. To get a faster reply, send it on WhatsApp too:'
    : 'Please send your enquiry to us on WhatsApp using one of the buttons below:';
  modal.classList.add('open');
  form.reset();
  form.querySelectorAll('select').forEach(s => s.classList.remove('filled'));
});

form.querySelectorAll('input,select').forEach(i => i.addEventListener('input', () => i.closest('.field').classList.remove('error')));
document.getElementById('modal-close-btn').onclick = () => modal.classList.remove('open');
modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('open'); });
