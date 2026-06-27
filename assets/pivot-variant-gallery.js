(function () {
  function patchMediaGallery() {
    const MediaGalleryClass = customElements.get('media-gallery');
    if (!MediaGalleryClass || MediaGalleryClass.prototype._pivotPatched) return;
    MediaGalleryClass.prototype._pivotPatched = true;

    const original = MediaGalleryClass.prototype.setActiveMedia;

    MediaGalleryClass.prototype.setActiveMedia = function (mediaId, prepend) {
      original.call(this, mediaId, prepend);
      if (!prepend) return;

      const mapEl = document.getElementById('PivotVariantColorMap');
      if (!mapEl) return;

      let data;
      try { data = JSON.parse(mapEl.textContent); } catch (e) { return; }

      const variantInput = this.closest('product-component')
        ?.querySelector('input.product-variant-id');
      if (!variantInput) return;

      const colorName = data.variantColors[variantInput.value];
      if (!colorName) return;

      // Reorder viewer items: color images first, then everything else
      const allItems = Array.from(this.elements.viewer.querySelectorAll('li[data-media-id]'));
      const list = allItems[0]?.parentElement;
      if (!list) return;

      const colorNameLower = colorName.toLowerCase();
      const colorItems = allItems.filter(
        (li) => (li.querySelector('img')?.alt || '').toLowerCase().includes(colorNameLower)
      );
      const otherItems = allItems.filter((li) => !colorItems.includes(li));
      [...colorItems, ...otherItems].forEach((li) => list.appendChild(li));

      // Mirror the same order in the thumbnail strip
      if (this.elements.thumbnails) {
        const colorMediaIds = new Set(colorItems.map((li) => li.dataset.mediaId));
        const thumbs = Array.from(
          this.elements.thumbnails.querySelectorAll('li[data-target]')
        );
        const thumbList = thumbs[0]?.parentElement;
        if (thumbList) {
          const colorThumbs = thumbs.filter((t) => colorMediaIds.has(t.dataset.target));
          const otherThumbs = thumbs.filter((t) => !colorMediaIds.has(t.dataset.target));
          [...colorThumbs, ...otherThumbs].forEach((t) => thumbList.appendChild(t));
        }
      }
    };
  }

  customElements.whenDefined('media-gallery').then(patchMediaGallery);
})();
