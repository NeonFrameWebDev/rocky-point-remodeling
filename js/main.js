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

    form.querySelectorAll('input, textarea, select, button[type="submit"]').forEach(el => {
      el.disabled = true;
    });
    success.classList.add('visible');
    success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}
