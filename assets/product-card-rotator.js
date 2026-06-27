(function () {
  'use strict';

  const INTERVAL_MS = 4000;
  const FADE_MS = 400;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initRotator(mediaEl, staggerDelay) {
    if (mediaEl._rotatorInitialized) return;
    mediaEl._rotatorInitialized = true;

    let images;
    try {
      images = JSON.parse(mediaEl.dataset.images);
    } catch (e) { return; }

    if (!images || images.length < 2) return;

    const img = mediaEl.querySelector('img');
    if (!img) return;

    img.removeAttribute('srcset');
    img.removeAttribute('sizes');

    let idx = Math.floor(Math.random() * images.length);
    img.src = images[idx];

    if (!prefersReducedMotion) {
      img.style.transition = 'opacity ' + FADE_MS + 'ms ease-in-out';
    }

    function advance() {
      idx = (idx + 1) % images.length;

      // Preload the next image first — this is what prevents the flash.
      // The swap only happens once the browser has the image ready.
      var preload = new Image();
      preload.onload = function () {
        if (prefersReducedMotion) {
          img.src = preload.src;
          return;
        }
        img.style.opacity = '0';
        setTimeout(function () {
          img.src = preload.src;
          img.offsetHeight; // force reflow before fade-in
          img.style.opacity = '1';
        }, FADE_MS);
      };
      preload.src = images[idx];
    }

    // Stagger: delay each card's start so they don't all change together
    setTimeout(function () {
      setInterval(advance, INTERVAL_MS);
    }, staggerDelay);
  }

  function initAll() {
    var cards = Array.from(document.querySelectorAll('[data-images]'));
    cards.forEach(function (el, i) {
      var stagger = cards.length > 1
        ? Math.round((INTERVAL_MS / cards.length) * i)
        : 0;
      initRotator(el, stagger);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  document.addEventListener('shopify:section:load', initAll);
})();
