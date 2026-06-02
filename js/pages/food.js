/* ========================================
   TRAVEL TRIPPY - Regional Food Discovery
   ======================================== */

window.TT = window.TT || {};

(function() {
  let activeFoodCategory = 'All';
  let foodSearchQuery = '';

  TT.renderFood = function() {
    const appEl = document.getElementById('app');
    if (!appEl) return;

    injectFoodStyles();

    const categories = ['All', 'Thali', 'Main Course', 'Snack', 'Breakfast', 'Dessert'];
    const tabsHtml = categories.map(cat => `
      <button class="food-tab-btn ${activeFoodCategory === cat ? 'active' : ''}" data-cat="${cat}">
        ${cat}s
      </button>
    `).join('');

    appEl.innerHTML = `
      <section class="section" style="padding-top: var(--space-12);">
        <div class="container">
          <div class="section-header">
            <div class="section-header__label">Culinary Scouting</div>
            <h2 class="section-header__title">Regional Food Guide</h2>
            <p class="section-header__desc">India's true flavors lie in traditional, charcoal-fired wood stoves. Scout signature culinary masterworks from all corners.</p>
          </div>

          <!-- Filters Strip -->
          <div class="flex flex--between flex--wrap gap-4" style="margin-bottom: var(--space-8); background: var(--bg-card); border: 1px solid var(--border-color); padding: var(--space-4) var(--space-6); border-radius: var(--radius-xl);">
            <div class="food-tabs">
              ${tabsHtml}
            </div>
            
            <div class="search-bar search-bar--page" style="width: 250px; margin: 0;">
              <div class="search-bar__input-wrap" style="padding: 4px var(--space-3); border-radius: var(--radius-full);">
                <i data-lucide="search" class="search-bar__icon" style="font-size: 0.9rem; padding: 0 4px 0 0;"></i>
                <input type="text" class="food-search-input" id="food-search-field" placeholder="Search dishes, regions..." value="${foodSearchQuery}" style="font-size: var(--fs-sm); padding: var(--space-1) 0; border:none; outline:none; background:none;">
              </div>
            </div>
          </div>

          <div class="card-grid" id="food-cards-grid">
            <!-- Rendered Dynamically -->
          </div>
        </div>
      </section>
    `;

    // Lucide Icons
    lucide.createIcons({ attrs: { class: 'lucide-icon' } });

    // Category bind
    document.querySelectorAll('.food-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.food-tab-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        activeFoodCategory = e.target.getAttribute('data-cat');
        renderFoodCards();
      });
    });

    // Search bind
    document.getElementById('food-search-field').addEventListener('input', (e) => {
      foodSearchQuery = e.target.value.trim().toLowerCase();
      renderFoodCards();
    });

    renderFoodCards();
  };

  function renderFoodCards() {
    const grid = document.getElementById('food-cards-grid');
    if (!grid) return;

    let filtered = TT.foods.filter(food => {
      // Category filter
      if (activeFoodCategory !== 'All' && food.type !== activeFoodCategory) {
        return false;
      }

      // Search query
      if (foodSearchQuery) {
        const matchesQuery = food.name.toLowerCase().includes(foodSearchQuery) ||
                             food.region.toLowerCase().includes(foodSearchQuery) ||
                             food.description.toLowerCase().includes(foodSearchQuery);
        if (!matchesQuery) return false;
      }

      return true;
    });

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-muted);">
          No scout-verified regional dishes match your filters.
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(food => {
      // Find destinations recommending this food
      const matchedDests = TT.destinations.filter(d => d.foods.includes(food.name));
      const destLinksHtml = matchedDests.length > 0 ? `
        <div class="food-scout-recs">
          <span>Highly recommended at:</span>
          <div class="flex flex--wrap gap-1" style="margin-top: 4px;">
            ${matchedDests.map(d => `<a href="#/destination/${d.id}" class="food-dest-link">${d.emoji || '📍'} ${d.name}</a>`).join('')}
          </div>
        </div>
      ` : '';

      return `
        <div class="food-card ${food.mustTry ? 'food-card--must-try' : ''}">
          <div class="food-card__header flex flex--between">
            <span class="food-card__emoji-title">${food.emoji} ${food.name}</span>
            ${food.mustTry ? '<span class="badge badge--primary">Must Try</span>' : ''}
          </div>
          <div style="font-size: var(--fs-xs); color: var(--text-muted); margin-bottom: var(--space-2);">${food.type} • Region: ${food.region}</div>
          <p style="font-size: var(--fs-sm); color: var(--text-secondary); line-height: 1.5; margin-bottom: var(--space-4);">${food.description}</p>
          <div class="flex flex--between" style="font-size: var(--fs-xs); font-weight:600; color:var(--text-tertiary); margin-bottom: var(--space-4);">
            <span>Est. Cost: <strong style="color:var(--text-primary);">${food.priceRange}</strong></span>
          </div>
          ${destLinksHtml}
        </div>
      `;
    }).join('');
  }

  function injectFoodStyles() {
    if (document.getElementById('tt-food-styles')) return;
    const s = document.createElement('style');
    s.id = 'tt-food-styles';
    s.textContent = `
      .food-tabs {
        display: flex;
        gap: var(--space-2);
        overflow-x: auto;
      }
      .food-tab-btn {
        padding: var(--space-2) var(--space-4);
        background: none;
        border: 1px solid transparent;
        color: var(--text-secondary);
        font-size: var(--fs-sm);
        font-weight: 600;
        cursor: pointer;
        border-radius: var(--radius-full);
        white-space: nowrap;
        transition: all var(--transition-fast);
      }
      .food-tab-btn:hover {
        color: var(--color-primary);
      }
      .food-tab-btn.active {
        border-color: var(--color-primary);
        color: var(--color-primary);
        background: rgba(14, 165, 233, 0.05);
      }

      .food-card {
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-xl);
        padding: var(--space-5) var(--space-6);
        box-shadow: var(--shadow-sm);
        transition: all var(--transition-base);
        display: flex;
        flex-direction: column;
      }
      .food-card:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-md);
      }
      .food-card--must-try {
        border-color: var(--color-primary-light);
        box-shadow: 0 4px 20px rgba(14, 165, 233, 0.06);
      }
      .food-card__emoji-title {
        font-family: var(--font-heading);
        font-weight: 800;
        font-size: var(--fs-md);
      }

      .food-scout-recs {
        margin-top: auto;
        border-top: 1px dashed var(--border-color);
        padding-top: var(--space-3);
        font-size: var(--fs-xs);
        color: var(--text-tertiary);
      }
      .food-dest-link {
        display: inline-block;
        padding: 2px var(--space-3);
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-full);
        color: var(--color-primary-dark);
        font-weight: 600;
        transition: all var(--transition-fast);
      }
      .food-dest-link:hover {
        background: var(--color-primary);
        color: white;
        border-color: var(--color-primary);
      }
    `;
    document.head.appendChild(s);
  }
})();
