'use strict';

// Copyright year
document.querySelector('.copyright-year').textContent = new Date().getFullYear();

// Nav scroll class
const nav = document.getElementById('site-nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// Hamburger + drawer
const hamburger = document.querySelector('.nav-hamburger');
const drawer    = document.getElementById('nav-drawer');

hamburger.addEventListener('click', () => {
  const open = !drawer.classList.contains('open');
  drawer.classList.toggle('open', open);
  hamburger.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
});

// Close drawer on drawer link click
drawer.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    drawer.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  });
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 70;
    const top  = target.getBoundingClientRect().top + window.scrollY - navH;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// Reveal on scroll
const revealObserver = new IntersectionObserver(
  entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  }),
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = `${(i % 4) * 0.07}s`;
  revealObserver.observe(el);
});

// Contact form submit (client-side only for spec site)
const form    = document.getElementById('contact-form');
const success = document.getElementById('form-success');

form.addEventListener('submit', e => {
  e.preventDefault();
  const name  = form.querySelector('#name').value.trim();
  const email = form.querySelector('#email').value.trim();
  if (!name || !email) {
    form.querySelector('#name').focus();
    return;
  }
  form.querySelectorAll('input, textarea, select, button[type="submit"]').forEach(el => {
    el.disabled = true;
  });
  success.removeAttribute('hidden');
  success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});
