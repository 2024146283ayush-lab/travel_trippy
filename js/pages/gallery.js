/* ========================================
   TRAVEL TRIPPY - Place Image Gallery View
   ======================================== */

window.TT = window.TT || {};

(function() {
  let activeCategory = 'all';

  TT.renderGallery = function() {
    const appEl = document.getElementById('app');
    if (!appEl) return;

    injectGalleryStyles();

    const categoryTabsHtml = TT.galleryCategories.map(cat => `
      <button class="gallery-tab-btn ${activeCategory === cat.id ? 'active' : ''}" data-cat-id="${cat.id}">
        ${cat.label}
      </button>
    `).join('');

    appEl.innerHTML = `
      <section class="section" style="padding-top: var(--space-12);">
        <div class="container">
          <div class="section-header">
            <div class="section-header__label">Visual Scouting</div>
            <h2 class="section-header__title">Gems Gallery</h2>
            <p class="section-header__desc">A visual log of India's most dramatic landscapes, ancient structures, and secluded villages captured by scouting squads.</p>
          </div>

          <div class="gallery-tabs">
            ${categoryTabsHtml}
          </div>

          <div class="gallery-grid" id="gallery-masonry-grid">
            <!-- Rendered Dynamically -->
          </div>
        </div>
      </section>

      <!-- Lightbox Modal Container -->
      <div class="lightbox" id="gallery-lightbox">
        <span class="lightbox__close" id="lightbox-close-btn">&times;</span>
        <div class="lightbox__content">
          <div class="lightbox__visual" id="lightbox-visual"></div>
          <div class="lightbox__caption" id="lightbox-caption"></div>
        </div>
      </div>
    `;

    // Lucide Icons
    lucide.createIcons({ attrs: { class: 'lucide-icon' } });

    // Category bind
    document.querySelectorAll('.gallery-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.gallery-tab-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        activeCategory = e.target.getAttribute('data-cat-id');
        renderGalleryGrid();
      });
    });

    // Close lightbox
    document.getElementById('lightbox-close-btn').addEventListener('click', () => {
      document.getElementById('gallery-lightbox').classList.remove('active');
    });

    document.getElementById('gallery-lightbox').addEventListener('click', (e) => {
      if (e.target.id === 'gallery-lightbox') {
        document.getElementById('gallery-lightbox').classList.remove('active');
      }
    });

    renderGalleryGrid();
  };

  function renderGalleryGrid() {
    const grid = document.getElementById('gallery-masonry-grid');
    if (!grid) return;

    // Filter destinations by category
    const items = TT.destinations.filter(d => {
      if (activeCategory === 'all') return true;
      return d.categories.includes(activeCategory);
    });

    if (items.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
          No scout images uploaded in this category yet.
        </div>
      `;
      return;
    }

    grid.innerHTML = items.map(item => `
      <div class="gallery-card" data-dest-id="${item.id}">
        <div class="gallery-card__visual" style="background: ${item.gradient || 'var(--bg-hero)'}">
          <span style="font-size: 5rem;">${item.emoji || '🏕️'}</span>
        </div>
        <div class="gallery-card__overlay">
          <div class="gallery-card__info">
            <h4 style="font-family: var(--font-heading); color: white; font-weight: 700;">${item.name}</h4>
            <p style="font-size: var(--fs-xs); color: rgba(255,255,255,0.85);">${item.state}</p>
          </div>
          <button class="gallery-card__zoom" aria-label="Zoom Image"><i data-lucide="maximize-2"></i></button>
        </div>
      </div>
    `).join('');

    lucide.createIcons({ attrs: { class: 'lucide-icon' } });

    // Grid click zoom binding
    grid.querySelectorAll('.gallery-card').forEach(card => {
      card.addEventListener('click', () => {
        const destId = card.getAttribute('data-dest-id');
        const dest = TT.destinations.find(d => d.id === destId);
        if (dest) {
          openLightbox(dest);
        }
      });
    });
  }

  function openLightbox(dest) {
    const lightbox = document.getElementById('gallery-lightbox');
    const visual = document.getElementById('lightbox-visual');
    const caption = document.getElementById('lightbox-caption');

    visual.style.background = dest.gradient || 'var(--bg-hero)';
    visual.innerHTML = `<span style="font-size: 12rem;">${dest.emoji || '🏕️'}</span>`;
    
    caption.innerHTML = `
      <h3 style="font-family: var(--font-heading); font-size: var(--fs-xl); color: white; margin-bottom: var(--space-2);">${dest.name}</h3>
      <p style="color: rgba(255,255,255,0.85); font-size: var(--fs-sm); margin-bottom: var(--space-4);">"${dest.tagline}"</p>
      <a href="#/destination/${dest.id}" class="btn btn--primary" style="display: inline-block; padding: var(--space-2) var(--space-6); border-radius: var(--radius-full); font-size: var(--fs-xs);">Explore Insights</a>
    `;

    lightbox.classList.add('active');
  }

  function injectGalleryStyles() {
    if (document.getElementById('tt-gallery-styles')) return;
    const s = document.createElement('style');
    s.id = 'tt-gallery-styles';
    s.textContent = `
      .gallery-tabs {
        display: flex;
        justify-content: center;
        gap: var(--space-2);
        margin-bottom: var(--space-8);
        overflow-x: auto;
        padding-bottom: var(--space-2);
      }
      .gallery-tab-btn {
        padding: var(--space-2) var(--space-5);
        border: 1px solid var(--border-color);
        background: var(--bg-card);
        color: var(--text-secondary);
        border-radius: var(--radius-full);
        font-size: var(--fs-sm);
        font-weight: 600;
        cursor: pointer;
        white-space: nowrap;
        transition: all var(--transition-fast);
      }
      .gallery-tab-btn:hover {
        border-color: var(--color-primary);
        color: var(--color-primary);
      }
      .gallery-tab-btn.active {
        background: var(--color-primary);
        border-color: var(--color-primary);
        color: white;
      }

      /* Gallery Masonry Grid */
      .gallery-grid {
        columns: 3 300px;
        column-gap: var(--space-6);
      }
      
      .gallery-card {
        break-inside: avoid;
        margin-bottom: var(--space-6);
        position: relative;
        border-radius: var(--radius-xl);
        overflow: hidden;
        box-shadow: var(--shadow-md);
        cursor: pointer;
        transition: transform var(--transition-base);
      }
      .gallery-card:hover {
        transform: scale(1.03);
      }
      .gallery-card__visual {
        width: 100%;
        min-height: 250px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
      }
      /* Randomize card heights for masonry effect */
      .gallery-card:nth-child(2n) .gallery-card__visual { min-height: 320px; }
      .gallery-card:nth-child(3n) .gallery-card__visual { min-height: 200px; }
      .gallery-card:nth-child(5n) .gallery-card__visual { min-height: 380px; }

      .gallery-card__overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(to top, rgba(15, 23, 42, 0.8) 0%, rgba(15, 23, 42, 0.1) 60%);
        opacity: 0;
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        padding: var(--space-4);
        transition: opacity var(--transition-base);
        z-index: 2;
      }
      .gallery-card:hover .gallery-card__overlay {
        opacity: 1;
      }
      .gallery-card__zoom {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: rgba(255,255,255,0.2);
        color: white;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }
      .gallery-card__zoom:hover {
        background: var(--color-primary);
      }

      /* Lightbox Modal */
      .lightbox {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.95);
        backdrop-filter: blur(12px);
        z-index: var(--z-modal);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        pointer-events: none;
        transition: opacity var(--transition-base);
      }
      .lightbox.active {
        opacity: 1;
        pointer-events: all;
      }
      .lightbox__close {
        position: absolute;
        top: var(--space-8);
        right: var(--space-8);
        color: rgba(255,255,255,0.7);
        font-size: 3rem;
        cursor: pointer;
        user-select: none;
        transition: color var(--transition-fast);
      }
      .lightbox__close:hover {
        color: white;
      }
      .lightbox__content {
        max-width: 600px;
        width: 100%;
        padding: var(--space-6);
        text-align: center;
      }
      .lightbox__visual {
        width: 100%;
        height: 380px;
        border-radius: var(--radius-2xl);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        box-shadow: var(--shadow-2xl);
        margin-bottom: var(--space-6);
      }
      .lightbox__caption {
        padding: var(--space-2) 0;
      }
    `;
    document.head.appendChild(s);
  }
})();
