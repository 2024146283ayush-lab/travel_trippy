/* ========================================
   TRAVEL TRIPPY - User Scouting Dashboard
   ======================================== */

window.TT = window.TT || {};

(function() {
  TT.renderDashboard = function() {
    const appEl = document.getElementById('app');
    if (!appEl) return;

    injectDashboardStyles();

    const favorites = TT.state.getFavorites();
    const savedTrips = TT.state.getSavedTrips();
    const profile = TT.state.getProfile();
    const customReviews = profile.customReviews || [];

    // Travel Stats
    const totalGemsSaved = favorites.length;
    const totalTripsPlanned = savedTrips.length;
    const totalReviewsFiled = customReviews.length;

    // 1. Render Saved Places HTML
    let favoritesHtml = '';
    if (favorites.length === 0) {
      favoritesHtml = `
        <div class="empty-dashboard-state">
          <div style="font-size: 2.5rem; margin-bottom: var(--space-2);">❤️</div>
          <h4 style="font-family: var(--font-heading); margin-bottom: var(--space-1);">No Favorites Locked Yet</h4>
          <p style="color:var(--text-tertiary); font-size:var(--fs-sm); max-width: 300px; margin: 0 auto var(--space-4);">Click the heart icon on any hidden gem to lock it in your scouting records.</p>
          <a href="#/explore" class="btn btn--primary btn--sm" style="display:inline-block; font-size:var(--fs-xs); padding: 6px 16px; border-radius:var(--radius-full);">Browse Gems</a>
        </div>
      `;
    } else {
      const favDests = TT.destinations.filter(d => favorites.includes(d.id));
      favoritesHtml = `
        <div class="card-grid" style="grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));">
          ${favDests.map(dest => `
            <div class="dest-card" onclick="window.location.hash = '#/destination/${dest.id}'">
              <div class="dest-card__image" style="height: 160px;">
                <div class="dest-card__gradient-bg" style="background: ${dest.gradient || 'var(--bg-hero)'}">
                  ${dest.emoji || '🏕️'}
                </div>
                <div class="dest-card__badge" style="font-size: 0.65rem; padding: 2px 8px;">${dest.state}</div>
                <button class="dest-card__fav-btn active" data-dest-id="${dest.id}" onclick="event.stopPropagation(); toggleDashboardFav('${dest.id}', this)">
                  <i data-lucide="heart"></i>
                </button>
              </div>
              <div class="dest-card__content" style="padding: var(--space-4);">
                <h4 style="font-weight: 700; font-family: var(--font-heading); font-size: var(--fs-base); margin-bottom: 2px;">${dest.name}</h4>
                <p style="font-size: var(--fs-xs); color: var(--text-tertiary); line-height: 1.4;">"${dest.tagline}"</p>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    // 2. Render Saved Itineraries HTML
    let tripsHtml = '';
    if (savedTrips.length === 0) {
      tripsHtml = `
        <div class="empty-dashboard-state">
          <div style="font-size: 2.5rem; margin-bottom: var(--space-2);">🗺️</div>
          <h4 style="font-family: var(--font-heading); margin-bottom: var(--space-1);">No Itineraries Saved</h4>
          <p style="color:var(--text-tertiary); font-size:var(--fs-sm); max-width: 300px; margin: 0 auto var(--space-4);">Use our AI Smart Planner to generate a custom day-by-day expedition route.</p>
          <a href="#/planner" class="btn btn--primary btn--sm" style="display:inline-block; font-size:var(--fs-xs); padding: 6px 16px; border-radius:var(--radius-full);">Launch Planner</a>
        </div>
      `;
    } else {
      tripsHtml = `
        <div class="saved-trips-list flex flex--col" style="gap: var(--space-4);">
          ${savedTrips.map(trip => `
            <div class="saved-trip-item flex flex--between flex--wrap gap-3">
              <div>
                <span class="trip-date-badge">${trip.date}</span>
                <h4 style="font-family: var(--font-heading); font-size: var(--fs-md); font-weight: 700; margin-top: 4px;">📍 Route to ${trip.destination.name}</h4>
                <div style="font-size: var(--fs-xs); color: var(--text-tertiary); margin-top: 2px;">
                  Starting: <strong>${trip.start}</strong> • Theme: <strong>${trip.style.toUpperCase()}</strong> • Duration: <strong>${trip.days} Days</strong>
                </div>
              </div>
              <div class="flex gap-2">
                <button class="btn btn--outline" onclick="viewTripDetails('${trip.id}')" style="font-size:var(--fs-xs); padding: var(--space-2) var(--space-4); border-radius:var(--radius-full);"><i data-lucide="eye" class="btn-icon" style="margin-left:0; margin-right:4px;"></i> View Itinerary</button>
                <button class="btn btn--danger" onclick="deleteTrip('${trip.id}')" style="font-size:var(--fs-xs); padding: var(--space-2) var(--space-4); border-radius:var(--radius-full); border:1px solid var(--color-danger); color:var(--color-danger); background:none;" title="Delete Trip"><i data-lucide="trash-2"></i></button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    appEl.innerHTML = `
      <section class="section" style="padding-top: var(--space-12);">
        <div class="container">
          <!-- Dashboard Greeting -->
          <div class="dashboard-banner flex flex--between flex--wrap gap-4" style="margin-bottom: var(--space-8);">
            <div>
              <h1 style="font-family: var(--font-heading); font-size: var(--fs-3xl); font-weight: 800;">Welcome back, ${profile.name}!</h1>
              <p style="color: rgba(255,255,255,0.85); margin-top: 2px;">Active Travel Scouting Status: **Certified Pathfinder** 🎒</p>
            </div>
            <a href="#/profile" class="btn btn--primary" style="background: white; color: var(--color-primary-dark); font-size: var(--fs-xs); padding: var(--space-3) var(--space-6); border-radius: var(--radius-full); font-weight: 700;">Edit Profile Preferences</a>
          </div>

          <!-- Stats Strip -->
          <div class="grid grid--3" style="gap: var(--space-6); margin-bottom: var(--space-10);">
            <div class="dashboard-stat-card">
              <div class="dashboard-stat-card__icon"><i data-lucide="heart" style="color:var(--color-danger); fill:var(--color-danger);"></i></div>
              <div>
                <div class="dashboard-stat-card__val">${totalGemsSaved}</div>
                <div class="dashboard-stat-card__label">Locked Gems</div>
              </div>
            </div>
            <div class="dashboard-stat-card">
              <div class="dashboard-stat-card__icon"><i data-lucide="map" style="color:var(--color-primary);"></i></div>
              <div>
                <div class="dashboard-stat-card__val">${totalTripsPlanned}</div>
                <div class="dashboard-stat-card__label">Saved Expeditions</div>
              </div>
            </div>
            <div class="dashboard-stat-card">
              <div class="dashboard-stat-card__icon"><i data-lucide="file-text" style="color:var(--color-secondary);"></i></div>
              <div>
                <div class="dashboard-stat-card__val">${totalReviewsFiled}</div>
                <div class="dashboard-stat-card__label">Scout Reports Filed</div>
              </div>
            </div>
          </div>

          <!-- Main Layout Column splits -->
          <div class="grid" style="grid-template-columns: 2fr 1.2fr; gap: var(--space-8);">
            <!-- Left Column: Itineraries & Favorites -->
            <div>
              <div style="margin-bottom: var(--space-10);">
                <h3 style="font-size: var(--fs-lg); font-family: var(--font-heading); margin-bottom: var(--space-4); border-bottom: 2px solid var(--border-color); padding-bottom: 8px;">Saved Expeditions</h3>
                ${tripsHtml}
              </div>

              <div>
                <h3 style="font-size: var(--fs-lg); font-family: var(--font-heading); margin-bottom: var(--space-4); border-bottom: 2px solid var(--border-color); padding-bottom: 8px;">Locked Offbeat Gems</h3>
                ${favoritesHtml}
              </div>
            </div>

            <!-- Right Column: Tailored recommendations -->
            <div>
              <div class="dashboard-sidebar-card">
                <h3 style="font-size: var(--fs-md); font-family: var(--font-heading); margin-bottom: var(--space-4); border-bottom: 1px solid var(--border-color); padding-bottom: var(--space-2);">Recommended Next Missions</h3>
                <p style="font-size: var(--fs-xs); color: var(--text-tertiary); margin-bottom: var(--space-4); line-height: 1.4;">Based on your travel interest profile: <br>🎒 <strong>${profile.travelStyle.toUpperCase()} style explorer</strong> looking for <strong>${profile.interests.join(', ')}</strong>.</p>
                
                <div class="flex flex--col" style="gap: var(--space-4);">
                  ${TT.destinations
                    .filter(d => !favorites.includes(d.id) && d.categories.some(c => profile.interests.includes(c)))
                    .slice(0, 3)
                    .map(dest => `
                      <div class="nearby-list-item flex gap-3" onclick="window.location.hash = '#/destination/${dest.id}'" style="padding:var(--space-2); margin:0;">
                        <div class="nearby-list-item__visual" style="background: ${dest.gradient || 'var(--bg-hero)'}; width:40px; height:40px; font-size:1.2rem;">
                          <span>${dest.emoji || '🏕️'}</span>
                        </div>
                        <div class="flex--1">
                          <h4 style="font-family: var(--font-heading); font-size: var(--fs-xs); font-weight: 700;">${dest.name}</h4>
                          <span style="font-size:0.6rem; color:var(--text-muted); text-transform:uppercase; font-weight:700;">${dest.state}</span>
                        </div>
                      </div>
                    `).join('')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Modal overlay for Detailed Saved Itinerary View -->
      <div class="modal" id="itinerary-detail-modal">
        <div class="modal__backdrop" id="modal-backdrop-el"></div>
        <div class="modal__content">
          <button class="modal__close" id="modal-close-btn">&times;</button>
          <div id="modal-body-content">
            <!-- Rendered Dynamically -->
          </div>
        </div>
      </div>
    `;

    // Lucide Icons
    lucide.createIcons({ attrs: { class: 'lucide-icon' } });

    // Modal Close
    document.getElementById('modal-close-btn').addEventListener('click', closeItineraryModal);
    document.getElementById('modal-backdrop-el').addEventListener('click', closeItineraryModal);
  };

  // Favoriting within dashboard requires updating active view
  window.toggleDashboardFav = function(destId, btnEl) {
    TT.state.toggleFavorite(destId);
    TT.renderDashboard(); // Re-render instantly to remove or update listing!
  };

  window.deleteTrip = function(tripId) {
    if (confirm("Are you sure you want to delete this saved expedition?")) {
      TT.state.deleteTrip(tripId);
      TT.renderDashboard();
    }
  };

  window.viewTripDetails = function(tripId) {
    const trip = TT.state.getSavedTrips().find(t => t.id === tripId);
    if (!trip) return;

    const modal = document.getElementById('itinerary-detail-modal');
    const body = document.getElementById('modal-body-content');

    const dest = trip.destination;

    const daysHtml = trip.itinerary.map(day => `
      <div style="border-bottom:1px solid var(--border-color); padding: var(--space-4) 0;">
        <h4 style="font-family:var(--font-heading); font-size:var(--fs-sm); font-weight:700; margin-bottom:2px;">Day ${day.day}: ${day.title}</h4>
        <p style="font-size:var(--fs-xs); color:var(--text-secondary); line-height:1.5;">${day.description}</p>
        <div class="flex gap-4" style="margin-top:var(--space-2); font-size:0.65rem; color:var(--text-tertiary);">
          <span>🏃 Experience: <strong>${day.activity}</strong></span>
          <span>🍲 Food Pick: <strong style="color:var(--color-primary-dark);">${day.food}</strong></span>
        </div>
      </div>
    `).join('');

    body.innerHTML = `
      <div style="padding: var(--space-2);">
        <h2 style="font-family: var(--font-heading); font-size: var(--fs-xl); font-weight: 800; margin-bottom:2px;">Scout Route details</h2>
        <span style="font-size: var(--fs-xs); color: var(--color-primary); font-weight:700; text-transform:uppercase;">📍 Destination: ${dest.name} (${dest.state})</span>
        
        <div class="grid grid--2" style="gap:var(--space-4); background:var(--bg-secondary); border:1px solid var(--border-color); padding:var(--space-3); border-radius:var(--radius-md); margin-top:var(--space-4);">
          <div style="font-size:var(--fs-xs);">
            Starting City: <strong>${trip.start}</strong><br>
            Duration: <strong>${trip.days} Days</strong>
          </div>
          <div style="font-size:var(--fs-xs);">
            Budget Cost: <strong>₹${trip.totalCost}</strong><br>
            Travel Companions: <strong>${trip.companions} Style</strong>
          </div>
        </div>

        <div style="margin-top:var(--space-6); max-height: 280px; overflow-y:auto; padding-right:4px;">
          ${daysHtml}
        </div>

        <div class="flex gap-2" style="margin-top:var(--space-6); justify-content: flex-end;">
          <button class="btn btn--outline" onclick="closeItineraryModal()" style="font-size:var(--fs-xs); padding:6px 16px; border-radius:var(--radius-full);">Close</button>
          <button class="btn btn--primary" onclick="window.print()" style="font-size:var(--fs-xs); padding:6px 16px; border-radius:var(--radius-full);">Print Guide</button>
        </div>
      </div>
    `;

    modal.classList.add('active');
  };

  window.closeItineraryModal = function() {
    const modal = document.getElementById('itinerary-detail-modal');
    if (modal) modal.classList.remove('active');
  };

  function injectDashboardStyles() {
    if (document.getElementById('tt-dashboard-styles')) return;
    const s = document.createElement('style');
    s.id = 'tt-dashboard-styles';
    s.textContent = `
      .dashboard-banner {
        background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
        border-radius: var(--radius-xl);
        padding: var(--space-6) var(--space-8);
        color: white;
        box-shadow: var(--shadow-md);
      }
      
      .dashboard-stat-card {
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-xl);
        padding: var(--space-4) var(--space-5);
        display: flex;
        align-items: center;
        gap: var(--space-4);
        box-shadow: var(--shadow-sm);
      }
      .dashboard-stat-card__icon {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: var(--bg-secondary);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
        box-shadow: var(--shadow-sm);
      }
      .dashboard-stat-card__val {
        font-size: var(--fs-xl);
        font-weight: 800;
        font-family: var(--font-heading);
      }
      .dashboard-stat-card__label {
        font-size: var(--fs-xs);
        color: var(--text-tertiary);
        font-weight: 500;
      }
      
      .saved-trip-item {
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-xl);
        padding: var(--space-4) var(--space-5);
        box-shadow: var(--shadow-sm);
        transition: transform var(--transition-fast);
      }
      .saved-trip-item:hover {
        transform: translateY(-2px);
      }
      .trip-date-badge {
        font-size: 0.6rem;
        background: var(--bg-tertiary);
        color: var(--text-secondary);
        padding: 2px 8px;
        border-radius: var(--radius-full);
        font-weight: 700;
      }
      
      .empty-dashboard-state {
        text-align: center;
        padding: var(--space-10) var(--space-6);
        background: var(--bg-secondary);
        border: 1px dashed var(--border-color);
        border-radius: var(--radius-xl);
      }

      .dashboard-sidebar-card {
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-xl);
        padding: var(--space-5);
        box-shadow: var(--shadow-sm);
      }

      /* Modal styling */
      .modal {
        position: fixed;
        inset: 0;
        z-index: var(--z-modal);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        pointer-events: none;
        transition: opacity var(--transition-base);
      }
      .modal.active {
        opacity: 1;
        pointer-events: all;
      }
      .modal__backdrop {
        position: absolute;
        inset: 0;
        background: rgba(15,23,42,0.6);
        backdrop-filter: blur(4px);
      }
      .modal__content {
        position: relative;
        background: var(--bg-primary);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-2xl);
        padding: var(--space-6) var(--space-8);
        max-width: 500px;
        width: calc(100% - 32px);
        box-shadow: var(--shadow-2xl);
        z-index: 10;
        animation: fadeInUp 0.4s var(--ease-out);
      }
      .modal__close {
        position: absolute;
        top: var(--space-4);
        right: var(--space-4);
        font-size: 1.5rem;
        color: var(--text-tertiary);
        cursor: pointer;
      }
      .modal__close:hover {
        color: var(--text-primary);
      }
    `;
    document.head.appendChild(s);
  }
})();
