/* ========================================
   TRAVEL TRIPPY - Destination Detail Page
   ======================================== */

window.TT = window.TT || {};

(function() {
  let activeTab = 'about'; // 'about', 'food', 'activities', 'map'
  let currentDest = null;
  let detailMap = null;

  TT.renderDestination = function(params) {
    const appEl = document.getElementById('app');
    if (!appEl) return;

    const destId = params.id;
    const dest = TT.destinations.find(d => d.id === destId);

    if (!dest) {
      appEl.innerHTML = `
        <div class="container section text-center" style="padding: 100px 24px;">
          <h2 style="font-size: 2rem; margin-bottom: var(--space-4); font-family: var(--font-heading);">Secret Gem Not Found</h2>
          <p style="color: var(--text-tertiary);">This hidden place is either so secret it hasn't been mapped yet, or the ID is incorrect.</p>
          <a href="#/explore" class="btn btn--primary" style="display: inline-block; margin-top: var(--space-6);">Explore Other Places</a>
        </div>
      `;
      return;
    }

    currentDest = dest;

    // Add to recently viewed list
    TT.state.addRecentlyViewed(dest.id);

    // Retrieve local reviews for this destination (combining sample reviews + local user submitted reviews)
    const allReviews = [
      ...TT.sampleReviews.filter(r => r.destId === dest.id),
      ...(TT.state.getProfile().customReviews || []).filter(r => r.destId === dest.id)
    ];

    // Determine category labels
    const categoryBadges = dest.categories.map(catId => {
      const cat = TT.categories.find(c => c.id === catId);
      return `<span class="badge badge--primary">${cat ? cat.label : catId}</span>`;
    }).join(' ');

    // Detail page html
    appEl.innerHTML = `
      <!-- Premium Hero Header -->
      <section class="dest-hero" style="background: ${dest.gradient || 'var(--bg-hero)'};">
        <div class="dest-hero__overlay"></div>
        <div class="container dest-hero__content">
          <div style="margin-bottom: var(--space-3);">${categoryBadges}</div>
          <h1 class="dest-hero__title" style="font-family: var(--font-heading);">${dest.name}</h1>
          <p class="dest-hero__tagline">"${dest.tagline}"</p>
          
          <div class="flex flex--wrap gap-4" style="margin-top: var(--space-6);">
            <button class="btn btn--primary ${TT.state.isFavorite(dest.id) ? 'btn--fav-active' : ''}" id="dest-fav-btn" style="border-radius: var(--radius-full); padding: var(--space-3) var(--space-6); background: white; color: var(--text-primary); border: 1px solid var(--border-color);">
              <i data-lucide="heart" class="btn-icon" style="margin-left:0; margin-right: var(--space-2); fill: ${TT.state.isFavorite(dest.id) ? 'var(--color-danger)' : 'none'}; color: ${TT.state.isFavorite(dest.id) ? 'var(--color-danger)' : 'currentColor'};"></i>
              ${TT.state.isFavorite(dest.id) ? 'Saved to Favorites' : 'Add to Favorites'}
            </button>
            <a href="#/planner?destination=${dest.id}" class="btn btn--primary" style="background: white; color: var(--color-primary); border-radius: var(--radius-full); padding: var(--space-3) var(--space-6);">
              <i data-lucide="calendar" class="btn-icon" style="margin-left:0; margin-right: var(--space-2);"></i> Plan Trip Here
            </a>
          </div>
        </div>
        <div class="dest-hero__emoji">${dest.emoji || '🏕️'}</div>
      </section>

      <!-- Stat Cards Strip -->
      <section style="background: var(--bg-secondary); border-bottom: 1px solid var(--border-color); padding: var(--space-6) 0;">
        <div class="container grid grid--4" style="gap: var(--space-4);">
          <div class="stat-badge-card">
            <div class="stat-badge-card__icon"><i data-lucide="map-pin"></i></div>
            <div>
              <div class="stat-badge-card__label">Region / State</div>
              <div class="stat-badge-card__val">${dest.state}</div>
            </div>
          </div>
          <div class="stat-badge-card">
            <div class="stat-badge-card__icon"><i data-lucide="compass"></i></div>
            <div>
              <div class="stat-badge-card__label">Difficulty Rating</div>
              <div class="stat-badge-card__val">${dest.difficulty}</div>
            </div>
          </div>
          <div class="stat-badge-card">
            <div class="stat-badge-card__icon"><i data-lucide="calendar"></i></div>
            <div>
              <div class="stat-badge-card__label">Best Season</div>
              <div class="stat-badge-card__val">${dest.bestSeason}</div>
            </div>
          </div>
          <div class="stat-badge-card">
            <div class="stat-badge-card__icon"><i data-lucide="wallet"></i></div>
            <div>
              <div class="stat-badge-card__label">Est. Budget</div>
              <div class="stat-badge-card__val">₹${dest.budget.min} - ₹${dest.budget.max}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Main Columns Section -->
      <section class="section">
        <div class="container grid" style="grid-template-columns: 2fr 1fr; gap: var(--space-8);">
          <!-- Left Column: Details & Tabs -->
          <div>
            <div class="tab-header">
              <button class="tab-btn ${activeTab === 'about' ? 'active' : ''}" data-tab="about">Scout Insights</button>
              <button class="tab-btn ${activeTab === 'food' ? 'active' : ''}" data-tab="food">Regional Food</button>
              <button class="tab-btn ${activeTab === 'activities' ? 'active' : ''}" data-tab="activities">Activities</button>
              <button class="tab-btn ${activeTab === 'map' ? 'active' : ''}" data-tab="map">Scout Map</button>
            </div>

            <div class="tab-content" id="dest-tab-content">
              <!-- Rendered Dynamically -->
            </div>

            <!-- Reviews & Comments System -->
            <div style="margin-top: var(--space-12); border-top: 1px solid var(--border-color); padding-top: var(--space-8);">
              <h3 style="font-size: var(--fs-xl); font-family: var(--font-heading); margin-bottom: var(--space-6);">Scout Reports (${allReviews.length})</h3>
              
              <!-- Review Submission Form -->
              <form class="review-form" id="dest-review-form" style="margin-bottom: var(--space-8);">
                <h4 style="font-size: var(--fs-md); margin-bottom: var(--space-4);">File an Explorer Report</h4>
                <div class="flex gap-2" style="margin-bottom: var(--space-4);">
                  <span style="font-size: var(--fs-sm); color: var(--text-secondary);">Your Rating:</span>
                  <div class="rating-input" id="review-rating-stars">
                    <span data-star="1">★</span>
                    <span data-star="2">★</span>
                    <span data-star="3">★</span>
                    <span data-star="4">★</span>
                    <span data-star="5" class="active">★</span>
                  </div>
                </div>
                <div style="margin-bottom: var(--space-4);">
                  <input type="text" id="review-author" placeholder="Scout Name" required style="width: 100%; padding: var(--space-3) var(--space-4); border: 1px solid var(--border-color); border-radius: var(--radius-md); background: var(--bg-secondary); outline: none;">
                </div>
                <div style="margin-bottom: var(--space-4);">
                  <textarea id="review-text" rows="4" placeholder="Share local tips, road conditions, safety updates, or lodging recommendations..." required style="width: 100%; padding: var(--space-3) var(--space-4); border: 1px solid var(--border-color); border-radius: var(--radius-md); background: var(--bg-secondary); outline: none; font-family: inherit; resize: none;"></textarea>
                </div>
                <button type="submit" class="btn btn--primary">Submit Report <i data-lucide="send" class="btn-icon"></i></button>
              </form>

              <!-- Reviews Render List -->
              <div class="reviews-list" id="dest-reviews-list">
                ${allReviews.map(rev => `
                  <div class="review-item">
                    <div class="flex flex--between" style="margin-bottom: var(--space-2);">
                      <div>
                        <span style="font-weight:600; font-size:var(--fs-sm);">${rev.author}</span>
                        <span style="font-size:var(--fs-xs); color:var(--text-muted); margin-left:var(--space-2);">${rev.date}</span>
                      </div>
                      <div style="color: var(--color-accent); font-size: var(--fs-xs);">
                        ${'★'.repeat(rev.rating)}${'☆'.repeat(5 - rev.rating)}
                      </div>
                    </div>
                    <p style="font-size: var(--fs-sm); color: var(--text-secondary); line-height: 1.6;">${rev.text}</p>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Right Column: Sidebar Stats -->
          <div>
            <div class="detail-sidebar-card" style="margin-bottom: var(--space-6);">
              <h3 style="font-size: var(--fs-md); font-family: var(--font-heading); margin-bottom: var(--space-4); border-bottom: 1px solid var(--border-color); padding-bottom: var(--space-2);">Scouting Coordinates</h3>
              <div class="sidebar-item">
                <div class="sidebar-item__label">Nearest Major City</div>
                <div class="sidebar-item__val">${dest.nearestCity.name} (${dest.nearestCity.distance} km)</div>
              </div>
              <div class="sidebar-item">
                <div class="sidebar-item__label">Travel Time from City</div>
                <div class="sidebar-item__val">🚗 ${dest.nearestCity.travelTime}</div>
              </div>
              <div class="sidebar-item">
                <div class="sidebar-item__label">Lokal Coordinates</div>
                <div class="sidebar-item__val">📍 ${dest.coordinates.lat.toFixed(4)}° N, ${dest.coordinates.lng.toFixed(4)}° E</div>
              </div>
            </div>

            <div class="detail-sidebar-card">
              <h3 style="font-size: var(--fs-md); font-family: var(--font-heading); margin-bottom: var(--space-4); border-bottom: 1px solid var(--border-color); padding-bottom: var(--space-2);">Safety & Photo Scores</h3>
              <div class="sidebar-item">
                <div class="sidebar-item__label">Travel Safety Score</div>
                <div class="sidebar-item__val">
                  <span style="color: var(--color-success); font-weight: 700;">${'★'.repeat(dest.safetyRating)}${'☆'.repeat(5 - dest.safetyRating)}</span> (${dest.safetyRating}/5)
                </div>
              </div>
              <div class="sidebar-item">
                <div class="sidebar-item__label">Instagram/Photo Score</div>
                <div class="sidebar-item__val">
                  <span style="color: var(--color-primary); font-weight: 700;">${'★'.repeat(dest.photoScore)}${'☆'.repeat(5 - dest.photoScore)}</span> (${dest.photoScore}/5)
                </div>
              </div>
              <div class="sidebar-item">
                <div class="sidebar-item__label">Suitable Age Groups</div>
                <div class="sidebar-item__val">${dest.ageGroups.map(ag => ag.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')).join(', ')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Similar Offbeat Gems -->
      <section class="section" style="background: var(--bg-secondary); border-top: 1px solid var(--border-color);">
        <div class="container">
          <h3 style="font-size: var(--fs-xl); font-family: var(--font-heading); margin-bottom: var(--space-6);">Explore Similar Gems</h3>
          <div class="card-grid">
            ${TT.destinations
              .filter(d => d.id !== dest.id && (d.state === dest.state || d.categories.some(c => dest.categories.includes(c))))
              .slice(0, 3)
              .map(similar => `
                <div class="dest-card" onclick="window.location.hash = '#/destination/${similar.id}'">
                  <div class="dest-card__image">
                    <div class="dest-card__gradient-bg" style="background: ${similar.gradient || 'var(--bg-hero)'}">
                      ${similar.emoji || '🏕️'}
                    </div>
                    <div class="dest-card__badge">${similar.state}</div>
                  </div>
                  <div class="dest-card__content">
                    <h4 style="font-weight: 700; font-family: var(--font-heading); font-size: var(--fs-base); margin-bottom: var(--space-1);">${similar.name}</h4>
                    <p style="font-size: var(--fs-xs); color: var(--text-tertiary); line-height: 1.4; height: 35px; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">"${similar.tagline}"</p>
                  </div>
                </div>
              `).join('')}
          </div>
        </div>
      </section>
    `;

    // Inject styles
    injectDestStyles();

    // Render Tab Content initially
    renderTabContent();

    // Lucide Icons
    lucide.createIcons({ attrs: { class: 'lucide-icon' } });

    // Favorites click
    document.getElementById('dest-fav-btn').addEventListener('click', (e) => {
      const btn = e.currentTarget;
      const isFav = TT.state.toggleFavorite(dest.id);
      if (isFav) {
        btn.classList.add('btn--fav-active');
        btn.innerHTML = `<i data-lucide="heart" class="btn-icon" style="margin-left:0; margin-right: var(--space-2); fill: var(--color-danger); color: var(--color-danger);"></i> Saved to Favorites`;
      } else {
        btn.classList.remove('btn--fav-active');
        btn.innerHTML = `<i data-lucide="heart" class="btn-icon" style="margin-left:0; margin-right: var(--space-2); fill: none; color: currentColor;"></i> Add to Favorites`;
      }
      lucide.createIcons({ attrs: { class: 'lucide-icon' } });
    });

    // Tab bindings
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        activeTab = e.target.getAttribute('data-tab');
        renderTabContent();
      });
    });

    // Rating star selector binding
    const starContainer = document.getElementById('review-rating-stars');
    let selectedRating = 5;
    starContainer.addEventListener('click', (e) => {
      const star = e.target.closest('[data-star]');
      if (!star) return;
      selectedRating = parseInt(star.getAttribute('data-star'));
      
      // Update visual stars
      starContainer.querySelectorAll('[data-star]').forEach(s => {
        const val = parseInt(s.getAttribute('data-star'));
        if (val <= selectedRating) {
          s.classList.add('active');
        } else {
          s.classList.remove('active');
        }
      });
    });

    // Review form submit binding
    const rForm = document.getElementById('dest-review-form');
    rForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const author = document.getElementById('review-author').value.trim();
      const text = document.getElementById('review-text').value.trim();

      const newReport = {
        destId: dest.id,
        author,
        text,
        rating: selectedRating,
        date: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short' })
      };

      // Retrieve profile and update customReviews
      const prof = TT.state.getProfile();
      const customReviews = prof.customReviews || [];
      customReviews.unshift(newReport);
      TT.state.updateProfile({ customReviews });

      // Reset form
      document.getElementById('review-author').value = '';
      document.getElementById('review-text').value = '';
      selectedRating = 5;
      starContainer.querySelectorAll('[data-star]').forEach(s => s.classList.add('active'));

      // Re-render reviews
      TT.renderDestination(params);
    });
  };

  function renderTabContent() {
    const tabEl = document.getElementById('dest-tab-content');
    if (!tabEl || !currentDest) return;

    if (activeTab === 'about') {
      tabEl.innerHTML = `
        <div style="line-height: 1.8; color: var(--text-secondary); font-size: var(--fs-md);">
          <h3 style="font-size: var(--fs-lg); font-family: var(--font-heading); color: var(--text-primary); margin-bottom: var(--space-4);">General Description</h3>
          <p style="margin-bottom: var(--space-6);">${currentDest.description}</p>
          
          <div style="background: rgba(14, 165, 233, 0.05); border-left: 4px solid var(--color-primary); padding: var(--space-5); border-radius: var(--radius-md);">
            <h4 style="font-weight: 700; color: var(--color-primary-dark); font-family: var(--font-heading); margin-bottom: var(--space-2);"><i data-lucide="shield-alert" style="width:16px; height:16px; display:inline-block; vertical-align:middle; margin-right:4px;"></i> Scout Local Insight</h4>
            <p style="font-style: italic;">"${currentDest.localInsight}"</p>
          </div>
        </div>
      `;
    } else if (activeTab === 'food') {
      // Find food details from regional list
      const matchingFoods = TT.foods.filter(f => currentDest.foods.includes(f.name));

      const foodItemsHtml = matchingFoods.length > 0 ? matchingFoods.map(food => `
        <div class="dest-food-card">
          <div class="dest-food-card__header flex flex--between">
            <span style="font-weight: 700; font-size: var(--fs-md); font-family: var(--font-heading);">${food.emoji} ${food.name}</span>
            <span class="badge ${food.mustTry ? 'badge--primary' : 'badge--secondary'}">${food.mustTry ? 'Scout Must Try' : 'Local Snack'}</span>
          </div>
          <div style="font-size: var(--fs-xs); color: var(--text-muted); margin-bottom: var(--space-2);">${food.type} • Est. price: ${food.priceRange}</div>
          <p style="font-size: var(--fs-sm); color: var(--text-secondary); line-height: 1.5;">${food.description}</p>
        </div>
      `).join('') : currentDest.foods.map(fname => `
        <div class="dest-food-card">
          <div class="dest-food-card__header flex flex--between">
            <span style="font-weight: 700; font-size: var(--fs-md); font-family: var(--font-heading);">🍲 ${fname}</span>
            <span class="badge badge--secondary">Local Favorite</span>
          </div>
          <p style="font-size: var(--fs-sm); color: var(--text-secondary); line-height: 1.5; margin-top: var(--space-2);">Authentic regional dish highly recommended in this village. Ask local hosts/dhabas to slow-cook this specialty!</p>
        </div>
      `).join('');

      tabEl.innerHTML = `
        <div>
          <h3 style="font-size: var(--fs-lg); font-family: var(--font-heading); margin-bottom: var(--space-4);">Signature Cuisines & Must Try Dishes</h3>
          <p style="color: var(--text-secondary); margin-bottom: var(--space-6); line-height: 1.6;">Offbeat regions are home to culinary wonders cooked slow over woodfires. Do not miss these signatures:</p>
          <div class="grid grid--2" style="gap: var(--space-4);">
            ${foodItemsHtml}
          </div>
        </div>
      `;
    } else if (activeTab === 'activities') {
      tabEl.innerHTML = `
        <div>
          <h3 style="font-size: var(--fs-lg); font-family: var(--font-heading); margin-bottom: var(--space-4);">Top Local Experiences</h3>
          <p style="color: var(--text-secondary); margin-bottom: var(--space-6); line-height: 1.6;">Things to do that aren't advertised in tourism brochures:</p>
          <ul class="activities-list">
            ${currentDest.activities.map(act => `
              <li class="activity-item">
                <span class="activity-item__dot"></span>
                <div>
                  <h4 style="font-weight: 600; color: var(--text-primary); margin-bottom: 2px;">${act}</h4>
                  <p style="font-size: var(--fs-sm); color: var(--text-tertiary); line-height: 1.5;">Scout-verified local activity. Inquire with homestay hosts for specialized guides or safety gear.</p>
                </div>
              </li>
            `).join('')}
          </ul>
        </div>
      `;
    } else if (activeTab === 'map') {
      tabEl.innerHTML = `
        <div>
          <h3 style="font-size: var(--fs-lg); font-family: var(--font-heading); margin-bottom: var(--space-4);">Lokal Scout Coordinates</h3>
          <p style="color: var(--text-secondary); margin-bottom: var(--space-4); line-height: 1.6;">Precise positioning. The map markers indicate the optimal camping, viewpoint or village center coordinates.</p>
          
          <div class="dest-detail-map-wrap" style="height: 380px; border-radius: var(--radius-lg); overflow: hidden; border: 1px solid var(--border-color); box-shadow: var(--shadow-md);">
            <div id="dest-leaflet-map" style="width: 100%; height: 100%;"></div>
          </div>
        </div>
      `;

      // Render Map asynchronously to ensure DOM exists
      setTimeout(() => {
        if (!document.getElementById('dest-leaflet-map')) return;
        detailMap = L.map('dest-leaflet-map').setView([currentDest.coordinates.lat, currentDest.coordinates.lng], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(detailMap);

        // Marker Popup
        L.marker([currentDest.coordinates.lat, currentDest.coordinates.lng])
          .addTo(detailMap)
          .bindPopup(`
            <div style="font-weight: 700; font-family: var(--font-heading); font-size: var(--fs-sm);">${currentDest.emoji || '🏕️'} ${currentDest.name}</div>
            <div style="font-size: 0.65rem; color: var(--text-muted);">${currentDest.state}</div>
          `).openPopup();
      }, 100);
    }

    lucide.createIcons({ attrs: { class: 'lucide-icon' } });
  }

  function injectDestStyles() {
    if (document.getElementById('tt-destination-styles')) return;
    const s = document.createElement('style');
    s.id = 'tt-destination-styles';
    s.textContent = `
      .dest-hero {
        position: relative;
        height: 350px;
        display: flex;
        align-items: flex-end;
        overflow: hidden;
        color: white;
        padding-bottom: var(--space-8);
      }
      .dest-hero__overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(to top, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.4) 60%, rgba(15, 23, 42, 0.1) 100%);
        z-index: 1;
      }
      .dest-hero__content {
        position: relative;
        z-index: 2;
      }
      .dest-hero__title {
        font-size: clamp(2rem, 5vw, 3rem);
        font-weight: 900;
        letter-spacing: -0.02em;
        text-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      }
      .dest-hero__tagline {
        font-size: clamp(1rem, 2.2vw, 1.25rem);
        color: rgba(255, 255, 255, 0.85);
        font-style: italic;
        margin-top: var(--space-1);
      }
      .dest-hero__emoji {
        position: absolute;
        right: var(--space-12);
        bottom: var(--space-4);
        font-size: 10rem;
        opacity: 0.18;
        transform: rotate(15deg);
        z-index: 2;
        user-select: none;
      }

      .btn--fav-active {
        border-color: var(--color-danger) !important;
        color: var(--color-danger) !important;
        background: rgba(239, 68, 68, 0.05) !important;
      }

      .stat-badge-card {
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        padding: var(--space-4) var(--space-5);
        border-radius: var(--radius-xl);
        display: flex;
        align-items: center;
        gap: var(--space-4);
        box-shadow: var(--shadow-sm);
      }
      .stat-badge-card__icon {
        width: 42px;
        height: 42px;
        border-radius: var(--radius-md);
        background: rgba(14, 165, 233, 0.1);
        color: var(--color-primary);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .stat-badge-card__label {
        font-size: 0.7rem;
        text-transform: uppercase;
        color: var(--text-tertiary);
        letter-spacing: 0.05em;
        font-weight: 600;
      }
      .stat-badge-card__val {
        font-size: var(--fs-base);
        font-weight: 700;
        color: var(--text-primary);
      }

      /* Detail Tab styles */
      .tab-header {
        display: flex;
        border-bottom: 2px solid var(--border-color);
        margin-bottom: var(--space-6);
        gap: var(--space-4);
        overflow-x: auto;
      }
      .tab-btn {
        padding: var(--space-3) var(--space-2);
        color: var(--text-secondary);
        font-weight: 600;
        font-size: var(--fs-md);
        border: none;
        background: none;
        cursor: pointer;
        position: relative;
        white-space: nowrap;
      }
      .tab-btn:hover {
        color: var(--color-primary);
      }
      .tab-btn.active {
        color: var(--color-primary);
      }
      .tab-btn.active::after {
        content: '';
        position: absolute;
        bottom: -2px;
        left: 0;
        right: 0;
        height: 2px;
        background: var(--color-primary);
      }

      .dest-food-card {
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        padding: var(--space-4) var(--space-5);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-sm);
        transition: transform var(--transition-fast);
      }
      .dest-food-card:hover {
        transform: translateY(-2px);
      }
      
      .activities-list {
        display: flex;
        flex-direction: column;
        gap: var(--space-5);
      }
      .activity-item {
        display: flex;
        gap: var(--space-4);
      }
      .activity-item__dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: var(--color-primary);
        box-shadow: 0 0 6px var(--color-primary);
        margin-top: 8px;
        flex-shrink: 0;
      }

      /* Review Form & Reports */
      .review-form {
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-xl);
        padding: var(--space-6);
      }
      .rating-input span {
        font-size: 1.5rem;
        cursor: pointer;
        color: var(--text-muted);
        transition: color var(--transition-fast);
      }
      .rating-input span.active {
        color: var(--color-accent);
      }

      .review-item {
        border-bottom: 1px solid var(--border-color);
        padding: var(--space-5) 0;
      }
      .review-item:last-child {
        border-bottom: none;
      }

      .detail-sidebar-card {
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-xl);
        padding: var(--space-5);
        box-shadow: var(--shadow-sm);
      }
      .sidebar-item {
        margin-bottom: var(--space-4);
      }
      .sidebar-item:last-child {
        margin-bottom: 0;
      }
      .sidebar-item__label {
        font-size: 0.75rem;
        color: var(--text-tertiary);
        margin-bottom: 2px;
      }
      .sidebar-item__val {
        font-size: var(--fs-sm);
        font-weight: 600;
        color: var(--text-primary);
      }

      @media (max-width: 768px) {
        .stat-badge-card {
          flex: 0 0 100%;
        }
      }
    `;
    document.head.appendChild(s);
  }
})();
