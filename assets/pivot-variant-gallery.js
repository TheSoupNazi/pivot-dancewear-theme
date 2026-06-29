(function () {
  function getColorData(gallery) {
    const mapEl = document.getElementById('PivotVariantColorMap');
    if (!mapEl) return null;
    let data;
    try { data = JSON.parse(mapEl.textContent); } catch (e) { return null; }
    const variantInput = gallery.closest('product-component')
      ?.querySelector('input.product-variant-id');
    if (!variantInput) return null;
    return data.variantColors[variantInput.value] || null;
  }

  function surfaceColorImages(gallery, colorName) {
    const colorNameLower = colorName.toLowerCase();
    const allItems = Array.from(gallery.elements.viewer.querySelectorAll('li[data-media-id]'));
    const list = allItems[0]?.parentElement;
    if (!list) return;

    const colorItems = allItems.filter(
      (li) => (li.querySelector('img')?.alt || '').toLowerCase().includes(colorNameLower)
    );
    const otherItems = allItems.filter((li) => !colorItems.includes(li));
    [...colorItems, ...otherItems].forEach((li) => list.appendChild(li));

    if (gallery.elements.thumbnails) {
      const colorMediaIds = new Set(colorItems.map((li) => li.dataset.mediaId));
      const thumbs = Array.from(
        gallery.elements.thumbnails.querySelectorAll('li[data-target]')
      );
      const thumbList = thumbs[0]?.parentElement;
      if (thumbList) {
        const colorThumbs = thumbs.filter((t) => colorMediaIds.has(t.dataset.target));
        const otherThumbs = thumbs.filter((t) => !colorMediaIds.has(t.dataset.target));
        [...colorThumbs, ...otherThumbs].forEach((t) => thumbList.appendChild(t));
      }
    }
  }

  function patchMediaGallery() {
    const MediaGalleryClass = customElements.get('media-gallery');
    if (!MediaGalleryClass || MediaGalleryClass.prototype._pivotPatched) return;
    MediaGalleryClass.prototype._pivotPatched = true;

    const original = MediaGalleryClass.prototype.setActiveMedia;

    MediaGalleryClass.prototype.setActiveMedia = function (mediaId, prepend) {
      original.call(this, mediaId, prepend);
      if (!prepend) return;
      const colorName = getColorData(this);
      if (colorName) surfaceColorImages(this, colorName);
    };

    // Trigger surfacing on initial page load for the default variant
    requestAnimationFrame(() => requestAnimationFrame(() => {
      document.querySelectorAll('media-gallery').forEach((gallery) => {
        const colorName = getColorData(gallery);
        if (colorName) surfaceColorImages(gallery, colorName);
      });
    }));
  }

  customElements.whenDefined('media-gallery').then(patchMediaGallery);
})();
