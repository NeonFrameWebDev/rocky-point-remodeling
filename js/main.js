'use strict';

// Copyright year
document.querySelectorAll('.copyright-year').forEach(el => {
  el.textContent = new Date().getFullYear();
});

// Nav scroll class
const nav = document.getElementById('site-nav');
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 20);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();
if (document.querySelector('.subpage-hero')) nav.classList.add('scrolled');

// Hamburger + drawer
const hamburger = document.querySelector('.nav-hamburger');
const drawer    = document.getElementById('nav-drawer');

if (hamburger && drawer) {
  hamburger.addEventListener('click', () => {
    const open = !drawer.classList.contains('open');
    drawer.classList.toggle('open', open);
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  drawer.querySelectorAll('a:not(.lang-toggle)').forEach(link => {
    link.addEventListener('click', () => {
      drawer.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
}

// Reveal on scroll
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -32px 0px' });

document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = `${(i % 5) * 0.06}s`;
  revealObserver.observe(el);
});

// Contact form
const form    = document.getElementById('contact-form');
const success = document.getElementById('form-success');

function showFieldError(field, msg) {
  field.classList.add('input-error');
  const prev = field.parentElement.querySelector('.field-error');
  if (prev) prev.remove();
  const p = document.createElement('p');
  p.className = 'field-error';
  p.setAttribute('role', 'alert');
  p.textContent = msg;
  field.parentElement.appendChild(p);
}

function clearFieldError(field) {
  field.classList.remove('input-error');
  const err = field.parentElement.querySelector('.field-error');
  if (err) err.remove();
}

if (form && success) {
  form.querySelectorAll('input, textarea').forEach(field => {
    field.addEventListener('input', () => clearFieldError(field));
  });

  form.addEventListener('submit', e => {
    e.preventDefault();

    const nameField  = form.querySelector('#name');
    const emailField = form.querySelector('#email');
    let ok = true;

    if (!nameField?.value.trim()) {
      showFieldError(nameField, 'Please enter your name.');
      ok = false;
    }

    if (!emailField?.value.trim()) {
      showFieldError(emailField, 'Please enter your email address.');
      ok = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value.trim())) {
      showFieldError(emailField, 'Please enter a valid email address.');
      ok = false;
    }

    if (!ok) {
      form.querySelector('.input-error')?.focus();
      return;
    }

    const controls = form.querySelectorAll('input, textarea, select, button[type="submit"]');
    // Set _replyto dynamically to the visitor's email so the owner can hit Reply and reach them.
    let replyto = form.querySelector('input[name="_replyto"]');
    if (!replyto) {
      replyto = document.createElement('input');
      replyto.type = 'hidden';
      replyto.name = '_replyto';
      form.appendChild(replyto);
    }
    replyto.value = emailField.value.trim();
    const payload = new FormData(form); // capture BEFORE disabling (disabled fields are excluded from FormData)
    controls.forEach(el => { el.disabled = true; });

    const showError = msg => {
      controls.forEach(el => { el.disabled = false; });
      let box = form.querySelector('.form-error');
      if (!box) {
        box = document.createElement('div');
        box.className = 'form-error';
        box.setAttribute('role', 'alert');
        form.querySelector('button[type="submit"]').insertAdjacentElement('afterend', box);
      }
      box.textContent = msg;
    };

    // FormSubmit returns JSON like { success: "true" } on success, { success: "false", message: "..." } otherwise.
    // We also accept r.ok === true (in case the response isn't JSON) for resilience.
    fetch(form.action, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: payload,
    })
      .then(r => r.json().then(j => ({ ok: r.ok, body: j })).catch(() => ({ ok: r.ok, body: null })))
      .then(({ ok, body }) => {
        const success_flag = body && (body.success === 'true' || body.success === true || body.ok === true);
        if (ok && success_flag) {
          form.querySelector('.form-error')?.remove();
          success.classList.add('visible');
          success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
          const msg = (body && (body.message || body.error)) || 'Something went wrong. Please call (602) 312-0400.';
          showError(msg);
        }
      })
      .catch(() => showError('Could not reach the server. Please call (602) 312-0400 or try again.'));
  });
}

// Lightbox
const lbOverlay = document.getElementById('lb-overlay');
const lbImg     = document.getElementById('lb-img');
const lbClose   = document.getElementById('lb-close');

if (lbOverlay && lbImg) {
  document.querySelectorAll('.gallery-tile[data-src]').forEach(tile => {
    tile.addEventListener('click', () => {
      lbImg.src = tile.dataset.src;
      lbImg.alt = tile.dataset.alt || '';
      lbOverlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  const closeLb = () => {
    lbOverlay.classList.remove('open');
    lbImg.src = '';
    document.body.style.overflow = '';
  };

  lbClose?.addEventListener('click', closeLb);
  lbOverlay.addEventListener('click', e => { if (e.target === lbOverlay) closeLb(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLb(); });
}

// Before / After slider
const baSlider = document.getElementById('baSlider');
if (baSlider) {
  const pane   = document.getElementById('baBeforePane');
  const handle = document.getElementById('baHandle');
  let dragging = false;

  const setPos = pct => {
    const v = Math.max(0, Math.min(100, pct));
    pane.style.width = v + '%';
    handle.style.left = v + '%';
    handle.setAttribute('aria-valuenow', String(Math.round(v)));
  };

  const posFromEvent = clientX => {
    const rect = baSlider.getBoundingClientRect();
    return ((clientX - rect.left) / rect.width) * 100;
  };

  const startDrag = e => {
    dragging = true;
    baSlider.classList.add('dragging');
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    setPos(posFromEvent(x));
  };
  const moveDrag = e => {
    if (!dragging) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    setPos(posFromEvent(x));
  };
  const endDrag = () => { dragging = false; baSlider.classList.remove('dragging'); };

  baSlider.addEventListener('mousedown', startDrag);
  window.addEventListener('mousemove', moveDrag);
  window.addEventListener('mouseup', endDrag);

  baSlider.addEventListener('touchstart', startDrag, { passive: true });
  window.addEventListener('touchmove', moveDrag, { passive: true });
  window.addEventListener('touchend', endDrag);

  handle.addEventListener('keydown', e => {
    const now = parseInt(handle.getAttribute('aria-valuenow'), 10) || 50;
    if (e.key === 'ArrowLeft')  { setPos(now - 5); e.preventDefault(); }
    if (e.key === 'ArrowRight') { setPos(now + 5); e.preventDefault(); }
    if (e.key === 'Home')       { setPos(0);  e.preventDefault(); }
    if (e.key === 'End')        { setPos(100); e.preventDefault(); }
  });
}
