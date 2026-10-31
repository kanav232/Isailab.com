/* ---- Paste the Google Apps Script web-app URL here (see form-backend/SETUP.md). ---- */
const FORM_ENDPOINT = 'https://script.google.com/a/macros/isailab.com/s/AKfycbz2qwphGwwlUfXH0JX4XMnW39Dm4q9DjoIyJM2hiEMg-tlxJQEjGG_nzVft2d53o8cw_w/exec';

(function () {
  // Nav
  const nav = document.getElementById('nav');
  const btn = document.getElementById('menuBtn');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 10);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  if (btn) btn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
  });
  document.querySelectorAll('#navLinks a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open'); btn.setAttribute('aria-expanded', 'false');
  }));

  // Schedule tabs
  const tabs = [...document.querySelectorAll('.tab')];
  const select = (t, focus) => {
    tabs.forEach(x => {
      const on = x === t;
      x.setAttribute('aria-selected', on);
      x.tabIndex = on ? 0 : -1;
      document.getElementById(x.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) t.focus();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t));
    t.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') select(tabs[(i + 1) % tabs.length], true);
      if (e.key === 'ArrowLeft') select(tabs[(i - 1 + tabs.length) % tabs.length], true);
    });
  });
  if (tabs.length) select(tabs[0]);

  // Reveal on scroll
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const els = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => io.observe(el));
  } else {
    els.forEach(el => el.classList.add('in'));
  }


  // ---------- Application form ----------
  const form = document.getElementById('appForm');
  if (form) {
    const states = ['Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh',
      'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa', 'Gujarat', 'Haryana',
      'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep',
      'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry',
      'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand',
      'West Bengal'];
    const sel = document.getElementById('f-state');
    states.forEach(n => { const o = document.createElement('option'); o.textContent = n; sel.appendChild(o); });

    const words = v => (v.trim().match(/\S+/g) || []).length;
    form.querySelectorAll('.counter').forEach(c => {
      const ta = document.getElementById(c.dataset.for);
      const max = +ta.dataset.maxWords;
      const upd = () => {
        const n = words(ta.value);
        c.textContent = n + (max ? ' / ' + max : '') + ' words';
        c.classList.toggle('over', max && n > max);
      };
      ta.addEventListener('input', upd); upd();
    });

    // Conditional fields: <div class="field" data-show-if="name=value" hidden>
    const conds = [...form.querySelectorAll('[data-show-if]')];
    const syncConds = () => conds.forEach(f => {
      const [name, val] = f.dataset.showIf.split('=');
      const picked = form.querySelector('input[name="' + name + '"]:checked');
      const show = !!picked && picked.value === val;
      f.hidden = !show;
      f.querySelectorAll('input, select, textarea').forEach(el => { el.disabled = !show; });
      if (!show) { f.classList.remove('invalid'); const e = f.querySelector('.err'); if (e) e.textContent = ''; }
    });
    form.addEventListener('change', syncConds);
    syncConds();

    const msgFor = el => {
      if (el.validity.valueMissing) {
        if (el.type === 'radio') return 'Please choose one.';
        if (el.tagName === 'SELECT') return 'Please select an option.';
        return 'This field is required.';
      }
      if (el.validity.typeMismatch && el.type === 'email') return 'Please enter a valid email address.';
      if (el.validity.patternMismatch) return el.dataset.msg || 'Please enter a valid 10-digit Indian mobile number.';
      if (el.tagName === 'TEXTAREA') {
        const n = words(el.value), min = +el.dataset.minWords, max = +el.dataset.maxWords;
        if (min && el.value.trim() && n < min) return 'Please write at least ' + min + ' words (' + n + ' so far).';
        if (max && n > max) return 'Please keep it within ' + max + ' words (' + n + ' now).';
      }
      return '';
    };

    const checkField = el => {
      const field = el.closest('.field');
      if (!field) return true;
      let m;
      if (el.type === 'radio') {
        const group = form.querySelectorAll('input[name="' + el.name + '"]');
        m = [...group].some(r => r.checked) ? '' : 'Please choose one.';
      } else m = msgFor(el);
      field.classList.toggle('invalid', !!m);
      const errEl = field.querySelector('.err');
      if (errEl) errEl.textContent = m;
      return !m;
    };

    const checkBoxes = () => {
      const boxes = [...form.querySelectorAll('.check input')];
      boxes.forEach(b => b.closest('.check').classList.toggle('invalid', !b.checked));
      const ok = boxes.every(b => b.checked);
      document.getElementById('checksErr').textContent = ok ? '' : 'Please confirm all four statements.';
      return ok;
    };

    form.addEventListener('blur', e => {
      if (e.target.matches('input:not([type=checkbox]):not([type=radio]), select, textarea') && e.target.value)
        checkField(e.target);
    }, true);
    form.addEventListener('change', e => {
      if (e.target.type === 'radio' || e.target.tagName === 'SELECT') checkField(e.target);
      if (e.target.type === 'checkbox' && document.getElementById('checksErr').textContent) checkBoxes();
    });

    const status = document.getElementById('formStatus');
    const btn = document.getElementById('submitBtn');
    form.addEventListener('input', () => {
      if (status.classList.contains('bad')) { status.textContent = ''; status.classList.remove('bad'); }
    });

    form.addEventListener('submit', async e => {
      e.preventDefault();
      status.textContent = ''; status.classList.remove('bad');
      let firstBad = null;
      form.querySelectorAll('.field input, .field select, .field textarea').forEach(el => {
        if (el.disabled || el.closest('[hidden]')) return;
        if (el.type === 'radio' && el !== form.querySelector('input[name="' + el.name + '"]')) return;
        if (!checkField(el) && !firstBad) firstBad = el;
      });
      const boxesOk = checkBoxes();
      if (!boxesOk && !firstBad) firstBad = form.querySelector('.check.invalid input');
      if (firstBad) {
        firstBad.focus({ preventScroll: true });
        firstBad.closest('.field, .check').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
        status.textContent = 'Please fix the highlighted fields.'; status.classList.add('bad');
        return;
      }
      if (form.website.value) return; // spam trap

      if (!FORM_ENDPOINT) {
        status.textContent = 'Applications are not open yet. Please check back soon or write to contact@isailab.com.';
        status.classList.add('bad');
        return;
      }

      const data = new URLSearchParams(new FormData(form));
      data.delete('website');
      data.append('submitted_from', location.href);
      btn.disabled = true; status.textContent = 'Submitting…';
      try {
        await fetch(FORM_ENDPOINT, { method: 'POST', mode: 'no-cors', body: data });
        form.hidden = true;
        const done = document.getElementById('formDone');
        done.hidden = false; done.focus();
        done.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
      } catch (err) {
        btn.disabled = false;
        status.textContent = 'Something went wrong. Please check your connection and try again.';
        status.classList.add('bad');
      }
    });
  }

  // Typing prompt (like the post covers)
  const typed = document.getElementById('typed');
  let lines = [];
  try { lines = JSON.parse(typed && typed.dataset.lines || '[]'); } catch (e) { }
  if (typed && lines.length > 1 && !reduce) {
    let li = 0, ci = lines[0].length, del = true;
    const tick = () => {
      const s = lines[li];
      if (del) {
        ci--; typed.textContent = s.slice(0, ci);
        if (ci <= 0) { del = false; li = (li + 1) % lines.length; }
        setTimeout(tick, 28);
      } else {
        const t = lines[li]; ci++; typed.textContent = t.slice(0, ci);
        if (ci >= t.length) { del = true; setTimeout(tick, 2400); } else setTimeout(tick, 55);
      }
    };
    setTimeout(tick, 2600);
  }
})();

// Countdown to program start (program pages)
(function () {
  const n = document.getElementById('countN'), t = document.getElementById('countT');
  if (!n || !t) return;
  const start = new Date('2026-12-26T09:00:00+05:30'), end = new Date('2026-12-31T20:00:00+05:30');
  const now = new Date();
  if (now < start) {
    const days = Math.ceil((start - now) / 86400000);
    n.textContent = days;
    t.textContent = days === 1 ? 'Day to go' : 'Days to go';
  } else if (now <= end) {
    n.textContent = 'Live';
    t.textContent = 'Happening now';
  }
})();
