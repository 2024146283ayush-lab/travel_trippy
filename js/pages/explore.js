/* ========================================
   TRAVEL TRIPPY - Hidden Gems Explorer
   ======================================== */

window.TT = window.TT || {};

(function() {
  let activeFilters = {
    search: '',
    state: 'All States',
    difficulty: 'All',
    category: 'All',
    season: 'All',
    sortBy: 'rating'
  };

  let viewMode = 'list'; // 'list' or 'split'
  let leafletMap = null;
  let markersGroup = [];

  TT.renderExplore = function() {
    const appEl = document.getElementById('app');
    if (!appEl) return;

    // Read initial filters from URL query params
    parseQueryParams();

    const statesHtml = TT.states.map(state => `
      <option value="${state}" ${activeFilters.state === state ? 'selected' : ''}>${state}</option>
    `).join('');

    const categoriesHtml = ['All', ...TT.categories.map(c => c.id)].map(catId => {
      const label = catId === 'All' ? 'All Categories' : (TT.categories.find(c => c.id === catId)?.label || catId);
      return `<option value="${catId}" ${activeFilters.category === catId ? 'selected' : ''}>${label}</option>`;
    }).join('');

    const filterPanelHtml = `
      <section class="explore-filters" style="background: var(--bg-card); border-bottom: 1px solid var(--border-color); padding: var(--space-4) 0; position: sticky; top: var(--nav-height); z-index: var(--z-sticky); backdrop-filter: blur(12px);">
        <div class="container flex flex--between flex--wrap gap-3">
          <!-- Left: Filters -->
          <div class="flex flex--wrap gap-2" style="flex: 1; min-width: 300px;">
            <div class="search-bar search-bar--page" style="width: 250px; margin: 0;">
              <div class="search-bar__input-wrap" style="padding: 4px var(--space-3); border-radius: var(--radius-full);">
                <i data-lucide="search" class="search-bar__icon" style="font-size: 0.9rem; padding: 0 4px 0 0;"></i>
                <input type="text" class="search-bar__input" id="explore-search" placeholder="Search gems..." value="${activeFilters.search}" style="font-size: var(--fs-sm); padding: var(--space-1) 0;">
              </div>
            </div>
            
            <select class="filter-select" id="explore-filter-state">
              ${statesHtml}
            </select>
            
            <select class="filter-select" id="explore-filter-category">
              ${categoriesHtml}
            </select>
            
            <select class="filter-select" id="explore-filter-difficulty">
              <option value="All" ${activeFilters.difficulty === 'All' ? 'selected' : ''}>All Difficulties</option>
              <option value="Easy" ${activeFilters.difficulty === 'Easy' ? 'selected' : ''}>Easy</option>
              <option value="Moderate" ${activeFilters.difficulty === 'Moderate' ? 'selected' : ''}>Moderate</option>
              <option value="Hard" ${activeFilters.difficulty === 'Hard' ? 'selected' : ''}>Hard</option>
            </select>

            <select class="filter-select" id="explore-sort">
              <option value="rating" ${activeFilters.sortBy === 'rating' ? 'selected' : ''}>Sort by Rating</option>
              <option value="popularity" ${activeFilters.sortBy === 'popularity' ? 'selected' : ''}>Sort by Popularity</option>
              <option value="budget-low" ${activeFilters.sortBy === 'budget-low' ? 'selected' : ''}>Budget: Low to High</option>
              <option value="budget-high" ${activeFilters.sortBy === 'budget-high' ? 'selected' : ''}>Budget: High to Low</option>
            </select>
          </div>

          <!-- Right: View Mode Toggle -->
          <div class="flex gap-2">
            <button class="view-toggle-btn ${viewMode === 'list' ? 'active' : ''}" id="toggle-list-view" title="Grid View">
              <i data-lucide="grid"></i>
            </button>
            <button class="view-toggle-btn ${viewMode === 'split' ? 'active' : ''}" id="toggle-split-view" title="Map & List Split View">
              <i data-lucide="map-pin"></i> Map View
            </button>
          </div>
        </div>
      </section>
    `;

    const mainLayoutHtml = `
      <div class="explore-layout ${viewMode === 'split' ? 'explore-layout--split' : ''}">
        <!-- List Container -->
        <div class="explore-list-panel">
          <div class="container section" style="padding-top: var(--space-6);">
            <div class="flex flex--between" style="margin-bottom: var(--space-4);">
              <span id="results-count" style="font-size: var(--fs-sm); color: var(--text-tertiary); font-weight: 500;">Finding gems...</span>
              <button class="btn btn--outline" id="clear-filters-btn" style="font-size: var(--fs-xs); padding: var(--space-1) var(--space-3); border-radius: var(--radius-full); display: none;">Clear All Filters</button>
            </div>
            
            <div class="card-grid" id="explore-card-grid">
              <!-- Rendered Dynamically -->
            </div>
          </div>
        </div>

        <!-- Map Container (Hidden in 'list' mode) -->
        <div class="explore-map-panel" id="explore-map-container" style="display: ${viewMode === 'split' ? 'block' : 'none'};">
          <div id="explore-leaflet-map" style="width: 100%; height: 100%;"></div>
        </div>
      </div>
    `;

    appEl.innerHTML = filterPanelHtml + mainLayoutHtml;

    // Apply styles
    injectExploreStyles();

    // Lucide Icons
    lucide.createIcons({ attrs: { class: 'lucide-icon' } });

    // Attach Event Listeners
    document.getElementById('explore-search').addEventListener('input', (e) => {
      activeFilters.search = e.target.value.trim();
      updateFilteredResults();
    });

    document.getElementById('explore-filter-state').addEventListener('change', (e) => {
      activeFilters.state = e.target.value;
      updateFilteredResults();
    });

    document.getElementById('explore-filter-category').addEventListener('change', (e) => {
      activeFilters.category = e.target.value;
      updateFilteredResults();
    });

    document.getElementById('explore-filter-difficulty').addEventListener('change', (e) => {
      activeFilters.difficulty = e.target.value;
      updateFilteredResults();
    });

    document.getElementById('explore-sort').addEventListener('change', (e) => {
      activeFilters.sortBy = e.target.value;
      updateFilteredResults();
    });

    document.getElementById('clear-filters-btn').addEventListener('click', () => {
      activeFilters = {
        search: '',
        state: 'All States',
        difficulty: 'All',
        category: 'All',
        season: 'All',
        sortBy: 'rating'
      };
      document.getElementById('explore-search').value = '';
      document.getElementById('explore-filter-state').value = 'All States';
      document.getElementById('explore-filter-category').value = 'All';
      document.getElementById('explore-filter-difficulty').value = 'All';
      document.getElementById('explore-sort').value = 'rating';
      updateFilteredResults();
    });

    // View toggles
    document.getElementById('toggle-list-view').addEventListener('click', () => {
      if (viewMode !== 'list') {
        viewMode = 'list';
        TT.renderExplore();
      }
    });

    document.getElementById('toggle-split-view').addEventListener('click', () => {
      if (viewMode !== 'split') {
        viewMode = 'split';
        TT.renderExplore();
      }
    });

    // Trigger initial filter & map rendering
    updateFilteredResults();
  };

  function parseQueryParams() {
    const hash = window.location.hash;
    if (hash.includes('?')) {
      const queryStr = hash.split('?')[1];
      const params = new URLSearchParams(queryStr);
      if (params.has('category')) activeFilters.category = params.get('category');
      if (params.has('state')) activeFilters.state = params.get('state');
      if (params.has('search')) activeFilters.search = params.get('search');
    }
  }

  function updateFilteredResults() {
    // 1. Filter Destinations
    let filtered = TT.destinations.filter(dest => {
      // Search text
      if (activeFilters.search) {
        const q = activeFilters.search.toLowerCase();
        const matchSearch = dest.name.toLowerCase().includes(q) ||
                            dest.state.toLowerCase().includes(q) ||
                            dest.tagline.toLowerCase().includes(q) ||
                            dest.description.toLowerCase().includes(q) ||
                            dest.foods.some(f => f.toLowerCase().includes(q)) ||
                            dest.activities.some(a => a.toLowerCase().includes(q));
        if (!matchSearch) return false;
      }

      // State Filter
      if (activeFilters.state !== 'All States') {
        if (dest.state !== activeFilters.state) return false;
      }

      // Category Filter
      if (activeFilters.category !== 'All') {
        if (!dest.categories.includes(activeFilters.category)) return false;
      }

      // Difficulty Filter
      if (activeFilters.difficulty !== 'All') {
        if (dest.difficulty !== activeFilters.difficulty) return false;
      }

      return true;
    });

    // 2. Sort Destinations
    if (activeFilters.sortBy === 'rating') {
      // Sort by Safety Rating then Photography score
      filtered.sort((a, b) => b.safetyRating - a.safetyRating || b.photoScore - a.photoScore);
    } else if (activeFilters.sortBy === 'popularity') {
      const popWeight = { 'High': 3, 'Medium': 2, 'Low': 1 };
      filtered.sort((a, b) => popWeight[b.popularity] - popWeight[a.popularity]);
    } else if (activeFilters.sortBy === 'budget-low') {
      filtered.sort((a, b) => a.budget.min - b.budget.min);
    } else if (activeFilters.sortBy === 'budget-high') {
      filtered.sort((a, b) => b.budget.min - a.budget.min);
    }

    // Update Counter & Clear Filter Button Visibility
    const countEl = document.getElementById('results-count');
    const clearBtn = document.getElementById('clear-filters-btn');
    if (countEl) {
      countEl.textContent = `Found ${filtered.length} Hidden Gem${filtered.length === 1 ? '' : 's'}`;
    }

    const isFiltered = activeFilters.search || activeFilters.state !== 'All States' || activeFilters.category !== 'All' || activeFilters.difficulty !== 'All';
    if (clearBtn) {
      clearBtn.style.display = isFiltered ? 'inline-block' : 'none';
    }

    // 3. Render Card Grid
    const cardGrid = document.getElementById('explore-card-grid');
    if (!cardGrid) return;

    if (filtered.length === 0) {
      cardGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px var(--space-6); background: var(--bg-card); border-radius: var(--radius-xl); border: 1px dashed var(--border-color);">
          <div style="font-size: 3rem; margin-bottom: var(--space-4);">🔍</div>
          <h3 style="font-family: var(--font-heading); margin-bottom: var(--space-2);">No Secret Places Found</h3>
          <p style="color: var(--text-tertiary); max-width: 400px; margin: 0 auto;">No offbeat gems match your exact filters. Try broadening your state search or category selections.</p>
        </div>
      `;
      // Clear markers if split map
      clearMapMarkers();
      return;
    }

    cardGrid.innerHTML = filtered.map(dest => `
      <div class="dest-card explore-dest-card" data-dest-id="${dest.id}" onclick="window.location.hash = '#/destination/${dest.id}'">
        <div class="dest-card__image">
          <div class="dest-card__gradient-bg" style="background: ${dest.gradient || 'var(--bg-hero)'}">
            ${dest.emoji || '🏕️'}
          </div>
          <div class="dest-card__badge">${dest.state}</div>
          <button class="dest-card__fav-btn ${TT.state.isFavorite(dest.id) ? 'active' : ''}" data-dest-id="${dest.id}" onclick="event.stopPropagation(); toggleFav('${dest.id}', this)">
            <i data-lucide="heart"></i>
          </button>
        </div>
        <div class="dest-card__content">
          <h3 class="dest-card__title">${dest.name}</h3>
          <p class="dest-card__tagline">"${dest.tagline}"</p>
          <div class="flex flex--wrap gap-1" style="margin-top: var(--space-3);">
            ${dest.categories.slice(0, 3).map(catId => {
              const cat = TT.categories.find(c => c.id === catId);
              return `<span class="badge badge--secondary" style="font-size: 0.65rem; padding: 2px 8px;">${cat ? cat.label : catId}</span>`;
            }).join('')}
          </div>
          <div class="flex flex--between" style="margin-top: var(--space-4); border-top: 1px solid var(--border-color); padding-top: var(--space-3); font-size: var(--fs-xs); color: var(--text-tertiary);">
            <span><i data-lucide="wallet" class="card-icon"></i> Min ₹${dest.budget.min}</span>
            <span><i data-lucide="trending-up" class="card-icon"></i> ${dest.difficulty}</span>
          </div>
        </div>
      </div>
    `).join('');

    // Re-trigger lucide icons inside cards
    lucide.createIcons({ attrs: { class: 'lucide-icon' } });

    // 4. Update Map (if split mode)
    if (viewMode === 'split') {
      renderMap(filtered);
    }
  }

  function clearMapMarkers() {
    markersGroup.forEach(marker => marker.remove());
    markersGroup = [];
  }

  function renderMap(destinations) {
    const mapContainer = document.getElementById('explore-leaflet-map');
    if (!mapContainer) return;

    // Initialize map if not yet done
    if (!leafletMap) {
      leafletMap = L.map('explore-leaflet-map').setView([22.9734, 78.6569], 5); // Center of India
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(leafletMap);
    }

    clearMapMarkers();

    // Map bounds to adjust zoom dynamically
    const bounds = [];

    destinations.forEach(dest => {
      if (dest.coordinates && dest.coordinates.lat && dest.coordinates.lng) {
        const marker = L.marker([dest.coordinates.lat, dest.coordinates.lng])
          .addTo(leafletMap)
          .bindPopup(`
            <div class="map-popup-card">
              <div style="font-weight: 700; font-family: var(--font-heading); font-size: var(--fs-base); margin-bottom: 2px;">${dest.emoji || '📍'} ${dest.name}</div>
              <div style="font-size: var(--fs-xs); color: var(--color-primary); font-weight: 600; margin-bottom: 6px;">${dest.state}</div>
              <div style="font-size: var(--fs-xs); color: var(--text-tertiary); line-height: 1.4; margin-bottom: 8px;">"${dest.tagline}"</div>
              <a href="#/destination/${dest.id}" class="btn btn--primary" style="display: block; text-align: center; font-size: 0.75rem; padding: var(--space-2) var(--space-4); border-radius: var(--radius-md); color: white;">Explore Gem</a>
            </div>
          `);

        // Highlight card on marker click
        marker.on('click', () => {
          // Highlight card in panel
          const cards = document.querySelectorAll('.explore-dest-card');
          cards.forEach(c => c.style.borderColor = 'var(--border-color)');
          const card = document.querySelector(`.explore-dest-card[data-dest-id="${dest.id}"]`);
          if (card) {
            card.style.borderColor = 'var(--color-primary)';
            card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        });

        markersGroup.push(marker);
        bounds.push([dest.coordinates.lat, dest.coordinates.lng]);
      }
    });

    // Fit map bounds to show all markers beautifully
    if (bounds.length > 0) {
      leafletMap.fitBounds(bounds, { padding: [40, 40] });
    }
  }

  function injectExploreStyles() {
    if (document.getElementById('tt-explore-styles')) return;
    const s = document.createElement('style');
    s.id = 'tt-explore-styles';
    s.textContent = `
      .filter-select {
        padding: var(--space-2) var(--space-4);
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-full);
        font-size: var(--fs-sm);
        color: var(--text-secondary);
        outline: none;
        cursor: pointer;
        transition: all var(--transition-fast);
      }
      .filter-select:hover {
        border-color: var(--color-primary);
        background: var(--bg-primary);
      }
      
      .view-toggle-btn {
        width: 40px;
        height: 40px;
        border-radius: var(--radius-full);
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        color: var(--text-secondary);
        cursor: pointer;
        transition: all var(--transition-fast);
        font-size: var(--fs-sm);
        gap: var(--space-2);
      }
      .view-toggle-btn:hover {
        border-color: var(--color-primary);
        color: var(--color-primary);
      }
      .view-toggle-btn.active {
        background: var(--color-primary);
        border-color: var(--color-primary);
        color: white;
      }
      #toggle-split-view {
        width: auto;
        padding: 0 var(--space-4);
      }

      /* Explore Layout Modes */
      .explore-layout {
        display: flex;
        flex-direction: column;
        min-height: calc(100vh - var(--nav-height) - 72px);
      }
      
      .explore-layout--split {
        flex-direction: row;
        height: calc(100vh - var(--nav-height) - 72px);
        overflow: hidden;
      }
      
      .explore-layout--split .explore-list-panel {
        flex: 0 0 50%;
        overflow-y: auto;
        height: 100%;
        border-right: 1px solid var(--border-color);
      }
      
      .explore-layout--split .explore-map-panel {
        flex: 0 0 50%;
        height: 100%;
      }
      
      .explore-layout--split .card-grid {
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      }

      .map-popup-card {
        min-width: 180px;
      }
      .leaflet-popup-content-wrapper {
        background: var(--glass-bg);
        backdrop-filter: blur(8px);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-lg);
        color: var(--text-primary);
        box-shadow: var(--shadow-lg);
      }
      .leaflet-popup-tip {
        background: var(--glass-bg);
      }
      
      @media (max-width: 992px) {
        .explore-layout--split {
          flex-direction: column-reverse;
          height: auto;
          overflow: visible;
        }
        .explore-layout--split .explore-list-panel {
          flex: none;
          height: auto;
          overflow: visible;
          border-right: none;
        }
        .explore-layout--split .explore-map-panel {
          flex: none;
          height: 350px;
        }
      }
    `;
    document.head.appendChild(s);
  }
})();
