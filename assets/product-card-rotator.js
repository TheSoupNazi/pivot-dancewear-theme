(function () {
  'use strict';

  const INTERVAL_MS = 3000;
  const FADE_MS = 300;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initRotator(mediaEl) {
    if (mediaEl._rotatorInitialized) return;
    mediaEl._rotatorInitialized = true;

    let images;
    try {
      images = JSON.parse(mediaEl.dataset.images);
    } catch (e) { return; }

    if (!images || images.length < 2) return;

    const img = mediaEl.querySelector('img');
    if (!img) return;

    // Take over from srcset so we can control the src freely
    img.removeAttribute('srcset');
    img.removeAttribute('sizes');

    // Start at a random image
    let idx = Math.floor(Math.random() * images.length);
    img.src = images[idx];

    if (prefersReducedMotion) {
      setInterval(function () {
        idx = (idx + 1) % images.length;
        img.src = images[idx];
      }, INTERVAL_MS);
      return;
    }

    img.style.transition = 'opacity ' + FADE_MS + 'ms ease-in-out';

    setInterval(function () {
      img.style.opacity = '0';
      setTimeout(function () {
        idx = (idx + 1) % images.length;
        img.src = images[idx];
        img.style.opacity = '1';
      }, FADE_MS);
    }, INTERVAL_MS);
  }

  function initAll() {
    document.querySelectorAll('[data-images]').forEach(initRotator);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  // Re-init when Shopify's section rendering injects new cards (theme editor)
  document.addEventListener('shopify:section:load', initAll);
})();
