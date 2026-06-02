/* ========================================
   TRAVEL TRIPPY - Map-centric Nearby Explorer
   ======================================== */

window.TT = window.TT || {};

(function() {
  let activeCoord = [12.9716, 77.5946]; // Default to Bangalore
  let activeName = "Bangalore Center";
  let nearbyMap = null;
  let mapMarkers = [];
  let selectedCategory = 'all';

  // Haversine distance formula in km
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return Math.round(d);
  }

  TT.renderNearby = function() {
    const appEl = document.getElementById('app');
    if (!appEl) return;

    injectNearbyStyles();

    const categoryFilterOptions = [
      { id: 'all', label: 'All Places', icon: '📍' },
      ...TT.categories.slice(0, 7) // Show primary categories
    ].map(cat => `
      <button class="nearby-cat-btn ${selectedCategory === cat.id ? 'active' : ''}" data-cat-id="${cat.id}">
        ${cat.icon} ${cat.label}
      </button>
    `).join('');

    appEl.innerHTML = `
      <div class="nearby-layout">
        <!-- Sidebar Results Panel -->
        <div class="nearby-sidebar">
          <div style="padding: var(--space-5); border-bottom: 1px solid var(--border-color); background: var(--bg-card);">
            <span style="font-size: var(--fs-xs); font-weight:700; color:var(--color-primary); text-transform:uppercase; letter-spacing:0.08em; display:block; margin-bottom:2px;">Scout Radius Search</span>
            <h2 style="font-family: var(--font-heading); font-size: var(--fs-xl); font-weight:800; margin-bottom: var(--space-2);">Nearby Discoveries</h2>
            <p style="font-size: var(--fs-xs); color: var(--text-tertiary); line-height: 1.4; margin-bottom: var(--space-4);">Click anywhere on the map or click GPS to trigger proximity search. Currently showing distances relative to: <br><strong style="color:var(--text-primary);" id="nearby-active-center-label">${activeName}</strong></p>
            
            <button class="btn btn--primary flex flex--center" id="nearby-gps-btn" style="width: 100%; border-radius: var(--radius-full); padding: var(--space-2) 0; font-size: var(--fs-sm);">
              <i data-lucide="locate" class="btn-icon" style="margin-left:0; margin-right:4px;"></i> Detect My Location
            </button>
          </div>

          <div class="nearby-sidebar__categories flex gap-1">
            ${categoryFilterOptions}
          </div>

          <div class="nearby-results-list" id="nearby-list-container">
            <!-- Rendered Dynamically -->
          </div>
        </div>

        <!-- Full Map Panel -->
        <div class="nearby-map-panel">
          <div id="nearby-leaflet-map" style="width: 100%; height: 100%;"></div>
        </div>
      </div>
    `;

    // Lucide Icons
    lucide.createIcons({ attrs: { class: 'lucide-icon' } });

    // Category bind
    document.querySelectorAll('.nearby-cat-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.nearby-cat-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        selectedCategory = e.target.getAttribute('data-cat-id');
        updateNearbyResults();
      });
    });

    // GPS click
    document.getElementById('nearby-gps-btn').addEventListener('click', (e) => {
      const btn = e.currentTarget;
      btn.disabled = true;
      btn.innerHTML = `<span class="spinner" style="width: 16px; height: 16px; border-width: 2px; display:inline-block; vertical-align:middle; margin-right:4px;"></span> Detecting...`;

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            activeCoord = [pos.coords.latitude, pos.coords.longitude];
            activeName = `Detected Location (${activeCoord[0].toFixed(4)}°, ${activeCoord[1].toFixed(4)}°)`;
            document.getElementById('nearby-active-center-label').textContent = activeName;
            
            btn.disabled = false;
            btn.innerHTML = `<i data-lucide="locate" class="btn-icon" style="margin-left:0; margin-right:4px;"></i> Detect My Location`;
            lucide.createIcons({ attrs: { class: 'lucide-icon' } });
            
            initNearbyMap();
          },
          (err) => {
            console.warn('Geolocation error fallback:', err);
            alert("Could not detect GPS location. Falling back to default (Bangalore).");
            btn.disabled = false;
            btn.innerHTML = `<i data-lucide="locate" class="btn-icon" style="margin-left:0; margin-right:4px;"></i> Detect My Location`;
            lucide.createIcons({ attrs: { class: 'lucide-icon' } });
          }
        );
      } else {
        alert("GPS geolocation is not supported by your browser.");
        btn.disabled = false;
        btn.innerHTML = `<i data-lucide="locate" class="btn-icon" style="margin-left:0; margin-right:4px;"></i> Detect My Location`;
        lucide.createIcons({ attrs: { class: 'lucide-icon' } });
      }
    });

    // Load Map
    setTimeout(initNearbyMap, 100);
  };

  function initNearbyMap() {
    const mapContainer = document.getElementById('nearby-leaflet-map');
    if (!mapContainer) return;

    // Reset if map already existed
    if (nearbyMap) {
      nearbyMap.remove();
      nearbyMap = null;
    }

    nearbyMap = L.map('nearby-leaflet-map').setView(activeCoord, 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(nearbyMap);

    // Active Center Marker (represented in red/blue)
    L.circle(activeCoord, {
      color: 'var(--color-primary)',
      fillColor: 'var(--color-primary-light)',
      fillOpacity: 0.15,
      radius: 300000 // 300 km radius representation
    }).addTo(nearbyMap);

    L.marker(activeCoord, {
      icon: L.divIcon({
        className: 'gps-div-marker',
        html: `<div style="background:var(--color-primary); width:16px; height:16px; border:3px solid white; border-radius:50%; box-shadow:0 0 10px rgba(14,165,233,0.6);"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      })
    }).addTo(nearbyMap)
      .bindPopup("<b>Active scouting center</b>")
      .openPopup();

    // Bind map click to move center
    nearbyMap.on('click', (e) => {
      activeCoord = [e.latlng.lat, e.latlng.lng];
      activeName = `Clicked Coordinates (${activeCoord[0].toFixed(4)}°, ${activeCoord[1].toFixed(4)}°)`;
      document.getElementById('nearby-active-center-label').textContent = activeName;
      
      initNearbyMap();
    });

    updateNearbyResults();
  }

  function updateNearbyResults() {
    const listEl = document.getElementById('nearby-list-container');
    if (!listEl || !nearbyMap) return;

    // Remove old markers
    mapMarkers.forEach(m => m.remove());
    mapMarkers = [];

    // 1. Calculate distances and filter
    let pool = TT.destinations.map(dest => {
      const distance = calculateDistance(
        activeCoord[0], activeCoord[1],
        dest.coordinates.lat, dest.coordinates.lng
      );
      return { ...dest, distance };
    });

    // Filter by category
    if (selectedCategory !== 'all') {
      pool = pool.filter(d => d.categories.includes(selectedCategory));
    }

    // Sort by proximity distance
    pool.sort((a, b) => a.distance - b.distance);

    if (pool.length === 0) {
      listEl.innerHTML = `
        <div style="padding: 40px var(--space-4); text-align: center; color: var(--text-tertiary);">
          No secret places found in this category.
        </div>
      `;
      return;
    }

    // Render list
    listEl.innerHTML = pool.map(dest => `
      <div class="nearby-list-item flex gap-3" data-dest-id="${dest.id}" onclick="window.location.hash = '#/destination/${dest.id}'">
        <div class="nearby-list-item__visual" style="background: ${dest.gradient || 'var(--bg-hero)'}">
          <span>${dest.emoji || '🏕️'}</span>
        </div>
        <div class="nearby-list-item__body flex--1">
          <div class="flex flex--between" style="align-items: flex-start;">
            <h4 style="font-family: var(--font-heading); font-size: var(--fs-sm); font-weight: 700; margin-bottom: 2px;">${dest.name}</h4>
            <span class="nearby-distance-tag">${dest.distance} km</span>
          </div>
          <div style="font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">${dest.state}</div>
          <p style="font-size: var(--fs-xs); color: var(--text-tertiary); line-height: 1.4; margin-top: 4px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">"${dest.tagline}"</p>
        </div>
      </div>
    `).join('');

    // Highlight map matching hover
    document.querySelectorAll('.nearby-list-item').forEach(item => {
      item.addEventListener('mouseenter', () => {
        const destId = item.getAttribute('data-dest-id');
        const marker = mapMarkers.find(m => m.destId === destId);
        if (marker) {
          marker.openPopup();
        }
      });
    });

    // 2. Add destination markers to map
    pool.forEach(dest => {
      const marker = L.marker([dest.coordinates.lat, dest.coordinates.lng])
        .addTo(nearbyMap)
        .bindPopup(`
          <div style="min-width: 150px;">
            <h4 style="font-family: var(--font-heading); font-weight: 700; margin-bottom: 2px;">${dest.emoji || '📍'} ${dest.name}</h4>
            <div style="font-size: 0.65rem; color: var(--color-primary); font-weight: 600; margin-bottom: 4px;">${dest.state}</div>
            <div style="font-size: 0.7rem; font-weight: 700; margin-bottom: 6px;">Distance: ${dest.distance} km</div>
            <a href="#/destination/${dest.id}" class="btn btn--primary" style="display: block; font-size: 0.65rem; padding: 4px; text-align: center; color: white; border-radius:4px;">Scout Details</a>
          </div>
        `);

      marker.destId = dest.id;
      mapMarkers.push(marker);
    });
  }

  function injectNearbyStyles() {
    if (document.getElementById('tt-nearby-styles')) return;
    const s = document.createElement('style');
    s.id = 'tt-nearby-styles';
    s.textContent = `
      .nearby-layout {
        display: flex;
        height: calc(100vh - var(--nav-height));
        overflow: hidden;
      }
      
      .nearby-sidebar {
        flex: 0 0 350px;
        background: var(--bg-primary);
        border-right: 1px solid var(--border-color);
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
        z-index: 10;
        box-shadow: var(--shadow-lg);
      }
      
      .nearby-sidebar__categories {
        padding: var(--space-3) var(--space-4);
        border-bottom: 1px solid var(--border-color);
        overflow-x: auto;
        white-space: nowrap;
        background: var(--bg-secondary);
        scrollbar-width: none;
      }
      .nearby-sidebar__categories::-webkit-scrollbar {
        display: none;
      }
      .nearby-cat-btn {
        padding: var(--space-1) var(--space-3);
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-full);
        font-size: var(--fs-xs);
        font-weight: 600;
        color: var(--text-secondary);
        cursor: pointer;
        transition: all var(--transition-fast);
      }
      .nearby-cat-btn:hover {
        border-color: var(--color-primary);
        color: var(--color-primary);
      }
      .nearby-cat-btn.active {
        background: var(--color-primary);
        color: white;
        border-color: var(--color-primary);
      }

      .nearby-results-list {
        flex: 1;
        overflow-y: auto;
        padding: var(--space-4);
        display: flex;
        flex-direction: column;
        gap: var(--space-3);
      }
      
      .nearby-list-item {
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-lg);
        padding: var(--space-3);
        cursor: pointer;
        box-shadow: var(--shadow-sm);
        transition: all var(--transition-fast);
      }
      .nearby-list-item:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-md);
        border-color: var(--color-primary-light);
      }
      
      .nearby-list-item__visual {
        width: 50px;
        height: 50px;
        border-radius: var(--radius-md);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 1.5rem;
        flex-shrink: 0;
      }
      
      .nearby-distance-tag {
        font-size: 0.65rem;
        font-weight: 700;
        background: rgba(14, 165, 233, 0.1);
        color: var(--color-primary-dark);
        padding: 2px 6px;
        border-radius: var(--radius-full);
        white-space: nowrap;
      }

      .nearby-map-panel {
        flex: 1;
        height: 100%;
      }

      @media (max-width: 768px) {
        .nearby-layout {
          flex-direction: column-reverse;
          height: auto;
          overflow: visible;
        }
        .nearby-sidebar {
          flex: none;
          height: 450px;
          width: 100%;
          border-right: none;
          border-top: 1px solid var(--border-color);
        }
        .nearby-map-panel {
          flex: none;
          height: 350px;
          width: 100%;
        }
      }
    `;
    document.head.appendChild(s);
  }
})();
