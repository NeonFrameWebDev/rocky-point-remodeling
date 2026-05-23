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

// Contact form (spec site: client-side only)
const form    = document.getElementById('contact-form');
const success = document.getElementById('form-success');

if (form && success) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const name  = form.querySelector('#name')?.value.trim();
    const email = form.querySelector('#email')?.value.trim();
    if (!name || !email) return;
    form.querySelectorAll('input, textarea, select, button[type="submit"]').forEach(el => {
      el.disabled = true;
    });
    success.removeAttribute('hidden');
    success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
}
