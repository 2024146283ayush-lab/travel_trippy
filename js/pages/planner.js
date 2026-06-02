/* ========================================
   TRAVEL TRIPPY - AI Smart Trip Planner
   ======================================== */

window.TT = window.TT || {};

(function() {
  let isPlanning = false;
  let plannedTrip = null;
  let plannerMap = null;
  let prefillDest = null;

  TT.renderPlanner = function() {
    const appEl = document.getElementById('app');
    if (!appEl) return;

    // Check pre-fill parameter (if arriving from a destination page)
    parsePrefillParam();

    renderPlannerLayout(appEl);
  };

  function parsePrefillParam() {
    const hash = window.location.hash;
    prefillDest = null;
    if (hash.includes('?')) {
      const params = new URLSearchParams(hash.split('?')[1]);
      const destId = params.get('destination');
      if (destId) {
        prefillDest = TT.destinations.find(d => d.id === destId);
      }
    }
  }

  function renderPlannerLayout(appEl) {
    injectPlannerStyles();

    const startingCities = ['Mumbai', 'Delhi', 'Bangalore', 'Kolkata', 'Chennai', 'Pune', 'Hyderabad', 'Ahmedabad', 'Guwahati', 'Dehradun', 'Shimla'];
    const startingCitiesOptions = startingCities.map(c => `
      <option value="${c}" ${TT.state.getProfile().startingCity === c ? 'selected' : ''}>${c}</option>
    `).join('');

    const formHtml = `
      <div class="planner-form-container">
        <h2 style="font-size: var(--fs-3xl); font-family: var(--font-heading); font-weight: 800; margin-bottom: var(--space-2); text-align: center;">AI Trip Planner</h2>
        <p style="color: var(--text-tertiary); text-align: center; margin-bottom: var(--space-8); font-size: var(--fs-md);">Answer 5 quick questions and our Travel Scouting AI will draft a customized offbeat itinerary.</p>
        
        ${prefillDest ? `
          <div class="prefill-banner flex flex--between">
            <div>
              <span style="font-size: var(--fs-xs); text-transform: uppercase; font-weight: 700; color: var(--color-primary);">Target Destination Locked</span>
              <h4 style="font-size: var(--fs-base); font-family: var(--font-heading); margin-top: 2px;">📍 ${prefillDest.name} (${prefillDest.state})</h4>
            </div>
            <button class="btn btn--outline" id="clear-prefill-btn" style="padding: var(--space-1) var(--space-3); font-size: var(--fs-xs); border-radius: var(--radius-full);">Change</button>
          </div>
        ` : ''}

        <form id="ai-planner-form" class="grid grid--2" style="gap: var(--space-5);">
          <div>
            <label class="form-label">Starting City</label>
            <select class="form-input" id="plan-start" required>
              ${startingCitiesOptions}
            </select>
          </div>

          <div>
            <label class="form-label">Number of Days</label>
            <select class="form-input" id="plan-days" required>
              <option value="2">2 Days (Weekend Getaway)</option>
              <option value="3" selected>3 Days (Perfect Explorer)</option>
              <option value="5">5 Days (Deep Immersion)</option>
            </select>
          </div>

          <div>
            <label class="form-label">Scouting Budget</label>
            <select class="form-input" id="plan-budget" required>
              <option value="low">Budget (Backpacker, Homestays)</option>
              <option value="mid" selected>Mid-Range (Boutique, Comfort)</option>
              <option value="high">Luxury (Elite Camps, Premium Resorts)</option>
            </select>
          </div>

          <div>
            <label class="form-label">Travel Style / Theme</label>
            <select class="form-input" id="plan-style" required>
              <option value="adventure">🧗 Adventure & Active Trekking</option>
              <option value="peaceful" selected>🧘 Peaceful Isolation & Nature</option>
              <option value="cultural">🏛️ Ancient Heritage & Temples</option>
              <option value="food">🍛 Regional Culinary Crawls</option>
              <option value="photography">📸 Instagram & Photography Focus</option>
            </select>
          </div>

          <div style="grid-column: 1 / -1;">
            <label class="form-label">Traveling With</label>
            <select class="form-input" id="plan-companions" required>
              <option value="solo" selected>🙋 Solo Traveler</option>
              <option value="couple">💑 Couple Getaway</option>
              <option value="family">👨‍👩‍👧‍👦 Family with Kids/Seniors</option>
              <option value="friends">👥 Friend Group Adventure</option>
            </select>
          </div>

          <button type="submit" class="btn btn--primary" style="grid-column: 1 / -1; padding: var(--space-4) 0; border-radius: var(--radius-xl); font-size: var(--fs-md); font-weight: 700; margin-top: var(--space-4); box-shadow: 0 4px 15px rgba(14, 165, 233, 0.3);">
            Generate Custom Itinerary <i data-lucide="sparkles" class="btn-icon"></i>
          </button>
        </form>
      </div>
    `;

    const loadingHtml = `
      <div class="planner-loading-container" id="planner-loading-card" style="display: none;">
        <div class="spinner"></div>
        <h3 id="planner-loading-status" style="font-size: var(--fs-lg); font-family: var(--font-heading); margin-top: var(--space-4); font-weight: 700;">Analyzing route databases...</h3>
        <p id="planner-loading-quote" style="color: var(--text-tertiary); font-style: italic; margin-top: var(--space-2); max-width: 400px; text-align: center; font-size: var(--fs-sm);">"The gladdest moment in human life, methinks, is a departure into unknown lands." – Sir Richard Burton</p>
      </div>
    `;

    const resultsHtml = `
      <div id="planner-results-area" style="display: none;">
        <!-- Filled dynamically -->
      </div>
    `;

    appEl.innerHTML = `
      <section class="section" style="padding-top: var(--space-12);">
        <div class="container container--narrow">
          ${formHtml}
          ${loadingHtml}
        </div>
        <div class="container" style="max-width: 1100px;">
          ${resultsHtml}
        </div>
      </section>
    `;

    // Lucide Icons
    lucide.createIcons({ attrs: { class: 'lucide-icon' } });

    // Preferences bind
    if (prefillDest) {
      document.getElementById('clear-prefill-btn').addEventListener('click', () => {
        prefillDest = null;
        window.location.hash = '#/planner'; // Strip query param
      });
    }

    // Form submit bind
    document.getElementById('ai-planner-form').addEventListener('submit', (e) => {
      e.preventDefault();
      runAIEngine();
    });
  }

  function runAIEngine() {
    const formCard = document.querySelector('.planner-form-container');
    const loadingCard = document.getElementById('planner-loading-card');

    formCard.style.display = 'none';
    loadingCard.style.display = 'flex';

    const statusUpdates = [
      "Mapping local grid coordinates...",
      "Cross-referencing tribal food menus...",
      "Simulating high-altitude weather checks...",
      "Optimizing transit routes and timing...",
      "Drafting safety protocols..."
    ];

    let updateIndex = 0;
    const interval = setInterval(() => {
      if (updateIndex < statusUpdates.length) {
        document.getElementById('planner-loading-status').textContent = statusUpdates[updateIndex];
        updateIndex++;
      }
    }, 600);

    setTimeout(() => {
      clearInterval(interval);
      generateItineraryData();
      loadingCard.style.display = 'none';
      renderItineraryResults();
    }, 3200);
  }

  function generateItineraryData() {
    const start = document.getElementById('plan-start').value;
    const days = parseInt(document.getElementById('plan-days').value);
    const budget = document.getElementById('plan-budget').value;
    const style = document.getElementById('plan-style').value;
    const companions = document.getElementById('plan-companions').value;

    // Pick target destination
    let target = prefillDest;
    if (!target) {
      // Find a destination matching filters
      let pool = TT.destinations;
      
      // Filter by travel style mapping
      const styleCategoryMapping = {
        'adventure': ['adventure', 'mountains'],
        'peaceful': ['lakes', 'forests', 'villages'],
        'cultural': ['heritage', 'temples', 'forts'],
        'food': ['photography'], // Fallback
        'photography': ['photography']
      };

      let categoryPool = styleCategoryMapping[style] || [];
      let matches = pool.filter(d => d.categories.some(c => categoryPool.includes(c)));
      
      if (matches.length === 0) matches = pool;
      
      // Select random from matches
      target = matches[Math.floor(Math.random() * matches.length)];
    }

    // Simulate day itinerary details
    const dayBreakdowns = [];
    const activitiesPool = {
      'adventure': ['Trekking to highest viewpoint', 'Kayaking in the river', 'Rock climbing with scouts', 'Camping under clear stars', 'Early dawn wildlife run'],
      'peaceful': ['Meditation session in ancient monastery', 'Slow walks through pine groves', 'Sunrise tea watching peaks', 'Interacting with local weavers', 'Stargazing at night'],
      'cultural': ['Exploring 16th century fort ruins', 'Guided tour of stone temple complexes', 'Watching local mask-makers craft', 'Attending evening sound & light show', 'Exploring ancient stepwells'],
      'food': ['Tasting bamboo chicken or local thali', 'Sip fresh estate-brewed coffee', 'Culinary session with local host', 'Breakfast trail of local kachoris', 'Apple cider sampling'],
      'photography': ['Golden hour shooting run', 'Milky way astrophotography trek', 'Capturing sunrise cloud roll over valleys', 'Drone view of crater curves', 'Portrait shoot with tribal elders']
    };

    const styleActs = activitiesPool[style] || activitiesPool['peaceful'];

    for (let d = 1; d <= days; d++) {
      if (d === 1) {
        dayBreakdowns.push({
          day: 1,
          title: `Scouting Arrival & Set Up`,
          description: `Depart early morning from ${start}. Reach the outskirts of ${target.name} around noon. Check into your local homestay, meet your local scout hosts. Take a relaxed evening stroll in the village.`,
          food: target.foods[0] || 'Local Rice Plate',
          activity: styleActs[0]
        });
      } else if (d === days) {
        dayBreakdowns.push({
          day: d,
          title: `Golden Hour Scouting & Return`,
          description: `Wake up early to catch a gorgeous sunrise over the horizon. Have a slow, hot local breakfast. Purchase regional spices, coffee or handmade souvenirs to support the local tribal community. Return back to ${start}.`,
          food: target.foods[2] || target.foods[0] || 'Filter Coffee',
          activity: styleActs[1]
        });
      } else {
        dayBreakdowns.push({
          day: d,
          title: `Deep Exploration & Scout Challenge`,
          description: `Spend the entire day exploring the deep terrain. Scout the hidden viewpoints and participate in local workshops. Trek along the valley ridges and enjoy a picnic lunch prepared by your hosts.`,
          food: target.foods[1] || 'Signature Local Thali',
          activity: styleActs[2] || styleActs[0]
        });
      }
    }

    // Budget math
    const budgetWeights = { 'low': 1000, 'mid': 2500, 'high': 6000 };
    const baseCost = budgetWeights[budget];
    const transportCost = Math.round(target.nearestCity.distance * 10);
    const lodgingCost = baseCost * days;
    const foodCost = 600 * days;
    const experienceCost = 500 * days;
    const totalCost = transportCost + lodgingCost + foodCost + experienceCost;

    plannedTrip = {
      destination: target,
      start,
      days,
      budgetType: budget,
      style,
      companions,
      totalCost,
      costs: { transport: transportCost, lodging: lodgingCost, food: foodCost, experience: experienceCost },
      itinerary: dayBreakdowns
    };
  }

  function renderItineraryResults() {
    const resultsArea = document.getElementById('planner-results-area');
    if (!resultsArea || !plannedTrip) return;

    resultsArea.style.display = 'block';

    const dest = plannedTrip.destination;

    const daysHtml = plannedTrip.itinerary.map(day => `
      <div class="trip-day-card flex" style="gap: var(--space-5);">
        <div class="trip-day-card__badge-wrap">
          <div class="trip-day-card__badge">D${day.day}</div>
          <div class="trip-day-card__line"></div>
        </div>
        <div class="trip-day-card__body">
          <h4 style="font-size: var(--fs-md); font-family: var(--font-heading); margin-bottom: var(--space-2); font-weight: 700;">${day.title}</h4>
          <p style="font-size: var(--fs-sm); color: var(--text-secondary); line-height: 1.6; margin-bottom: var(--space-4);">${day.description}</p>
          
          <div class="grid grid--2" style="gap: var(--space-3); border-top: 1px dashed var(--border-color); padding-top: var(--space-3);">
            <div class="flex gap-2" style="align-items: center;">
              <span style="font-size: 1.1rem;">🏃</span>
              <div>
                <div style="font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Core Experience</div>
                <div style="font-size: var(--fs-xs); font-weight: 600;">${day.activity}</div>
              </div>
            </div>
            
            <div class="flex gap-2" style="align-items: center;">
              <span style="font-size: 1.1rem;">🍲</span>
              <div>
                <div style="font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Scout Food Pick</div>
                <div style="font-size: var(--fs-xs); font-weight: 600; color: var(--color-primary-dark);">${day.food}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    resultsArea.innerHTML = `
      <div class="results-header flex flex--between flex--wrap gap-4" style="margin-bottom: var(--space-8);">
        <div>
          <h2 style="font-size: var(--fs-3xl); font-family: var(--font-heading); font-weight: 900;">Your Custom Scout Route Locked</h2>
          <p style="color: var(--text-tertiary);">AI itinerary generated for: 📍 **${dest.name}** (${dest.state}) from **${plannedTrip.start}**</p>
        </div>
        <div class="flex gap-2">
          <button class="btn btn--outline" id="save-itinerary-btn"><i data-lucide="bookmark" class="btn-icon" style="margin-left:0; margin-right: 4px;"></i> Save to Dashboard</button>
          <button class="btn btn--primary" onclick="window.print()"><i data-lucide="printer" class="btn-icon" style="margin-left:0; margin-right: 4px;"></i> Export PDF</button>
        </div>
      </div>

      <div class="grid" style="grid-template-columns: 2fr 1fr; gap: var(--space-8);">
        <!-- Itinerary List -->
        <div>
          <h3 style="font-size: var(--fs-lg); font-family: var(--font-heading); margin-bottom: var(--space-6); font-weight: 800;">Day-by-Day Expedition</h3>
          <div class="trip-days-timeline">
            ${daysHtml}
          </div>

          <!-- Pack & Prepare Guide -->
          <div class="pack-prepare-card" style="margin-top: var(--space-8);">
            <h3 style="font-size: var(--fs-md); font-family: var(--font-heading); font-weight: 700; margin-bottom: var(--space-4); border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 8px;"><i data-lucide="shield-check" style="width:16px; height:16px; display:inline-block; vertical-align:middle; margin-right:4px;"></i> Scout Pack & Prepare Guide</h3>
            <ul style="font-size: var(--fs-sm); line-height: 2; color: rgba(255,255,255,0.85); list-style-type: none; padding-left: 0;">
              <li>📋 **Permits Needed:** Check if Inner Line Permits (ILP) are required for ${dest.state} (essential for borders).</li>
              <li>🥾 **Footwear:** Solid hiking shoes/sandals needed for traversing ${dest.difficulty} terrain.</li>
              <li>🔌 **Power Backup:** Carry robust power banks; off-beat grid reliability is low.</li>
              <li>🧣 **Layering:** Pack light thermal/windbreaker layers; high altitude shifts temp rapidly.</li>
              <li>💵 **Lokal Cash:** Carry physical paper currency; ATMs are extremely sparse in hidden villages.</li>
            </ul>
          </div>
        </div>

        <!-- Sidebar: Cost and Map -->
        <div>
          <!-- Budget Breakdown Card -->
          <div class="sidebar-budget-card" style="margin-bottom: var(--space-6);">
            <h3 style="font-size: var(--fs-md); font-family: var(--font-heading); margin-bottom: var(--space-4); border-bottom: 1px solid var(--border-color); padding-bottom: var(--space-2);">Scouting Cost Estimate</h3>
            <div class="cost-item flex flex--between">
              <span> Lodging & Homestay</span>
              <strong>₹${plannedTrip.costs.lodging}</strong>
            </div>
            <div class="cost-item flex flex--between">
              <span> Transport/Fuel</span>
              <strong>₹${plannedTrip.costs.transport}</strong>
            </div>
            <div class="cost-item flex flex--between">
              <span> Local Foods</span>
              <strong>₹${plannedTrip.costs.food}</strong>
            </div>
            <div class="cost-item flex flex--between">
              <span> Experiences/Guides</span>
              <strong>₹${plannedTrip.costs.experience}</strong>
            </div>
            <div class="cost-item total flex flex--between" style="border-top: 2px solid var(--border-color); font-weight: 800; font-size: var(--fs-lg); margin-top: var(--space-3); padding-top: var(--space-3);">
              <span> Total Estimated cost</span>
              <strong style="color: var(--color-primary-dark);">₹${plannedTrip.totalCost}</strong>
            </div>
            <p style="font-size: 0.65rem; color: var(--text-muted); text-align: center; margin-top: var(--space-3);">* Estimates based on a ${plannedTrip.companions} style run during best season.</p>
          </div>

          <!-- Map route visualization -->
          <div class="sidebar-budget-card">
            <h3 style="font-size: var(--fs-md); font-family: var(--font-heading); margin-bottom: var(--space-4); border-bottom: 1px solid var(--border-color); padding-bottom: var(--space-2);">Route Visualization</h3>
            <div style="height: 250px; border-radius: var(--radius-md); overflow: hidden; border: 1px solid var(--border-color);">
              <div id="planner-route-map" style="width: 100%; height: 100%;"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Lucide Icons
    lucide.createIcons({ attrs: { class: 'lucide-icon' } });

    // Save trip binding
    document.getElementById('save-itinerary-btn').addEventListener('click', (e) => {
      const btn = e.currentTarget;
      TT.state.saveTrip(plannedTrip);
      btn.innerHTML = `<i data-lucide="check" class="btn-icon" style="margin-left:0; margin-right: 4px;"></i> Saved!`;
      btn.disabled = true;
      btn.style.borderColor = 'var(--color-success)';
      btn.style.color = 'var(--color-success)';
      lucide.createIcons({ attrs: { class: 'lucide-icon' } });
    });

    // Render Route Map
    setTimeout(() => {
      if (!document.getElementById('planner-route-map')) return;

      // Base coordinates from starting city (simulated roughly)
      const startingCitiesCoordinates = {
        'Mumbai': [19.0760, 72.8777],
        'Delhi': [28.7041, 77.1025],
        'Bangalore': [12.9716, 77.5946],
        'Kolkata': [22.5726, 88.3639],
        'Chennai': [13.0827, 80.2707],
        'Pune': [18.5204, 73.8567],
        'Hyderabad': [17.3850, 78.4867],
        'Ahmedabad': [23.0225, 72.5714],
        'Guwahati': [26.1445, 91.7362],
        'Dehradun': [30.3165, 78.0322],
        'Shimla': [31.1048, 77.1734]
      };

      const startCoord = startingCitiesCoordinates[plannedTrip.start] || [22.9734, 78.6569];
      const endCoord = [dest.coordinates.lat, dest.coordinates.lng];

      plannerMap = L.map('planner-route-map').setView(endCoord, 6);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(plannerMap);

      // Add Start Marker
      L.marker(startCoord)
        .addTo(plannerMap)
        .bindPopup(`<b>Starting Point:</b> ${plannedTrip.start}`)
        .openPopup();

      // Add Destination Marker
      L.marker(endCoord)
        .addTo(plannerMap)
        .bindPopup(`<b>Expedition Gem:</b> ${dest.name}`)
        .openPopup();

      // Draw polyline connecting them
      const polyline = L.polyline([startCoord, endCoord], { color: 'var(--color-primary)', dashArray: '5, 8' }).addTo(plannerMap);
      
      // Fit bounds to show route fully
      plannerMap.fitBounds([startCoord, endCoord], { padding: [30, 30] });

    }, 100);
  }

  function injectPlannerStyles() {
    if (document.getElementById('tt-planner-styles')) return;
    const s = document.createElement('style');
    s.id = 'tt-planner-styles';
    s.textContent = `
      .planner-form-container {
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-2xl);
        padding: var(--space-8) var(--space-10);
        box-shadow: var(--shadow-xl);
      }
      .prefill-banner {
        background: rgba(14, 165, 233, 0.08);
        border: 1px solid var(--color-primary-light);
        padding: var(--space-4) var(--space-5);
        border-radius: var(--radius-lg);
        margin-bottom: var(--space-6);
      }
      .form-label {
        display: block;
        font-size: var(--fs-sm);
        font-weight: 600;
        color: var(--text-secondary);
        margin-bottom: var(--space-2);
      }
      .form-input {
        width: 100%;
        padding: var(--space-3) var(--space-4);
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-md);
        font-size: var(--fs-sm);
        color: var(--text-primary);
        outline: none;
        transition: all var(--transition-fast);
        cursor: pointer;
      }
      .form-input:focus {
        border-color: var(--color-primary);
        background: var(--bg-primary);
        box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.15);
      }

      /* Loading indicator */
      .planner-loading-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 80px 24px;
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-2xl);
        box-shadow: var(--shadow-xl);
      }
      .spinner {
        width: 50px;
        height: 50px;
        border: 4px solid var(--border-color);
        border-top-color: var(--color-primary);
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }

      /* Itinerary Days Timeline */
      .trip-days-timeline {
        display: flex;
        flex-direction: column;
        gap: var(--space-6);
        position: relative;
      }
      .trip-day-card {
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-xl);
        box-shadow: var(--shadow-sm);
        padding: var(--space-6);
        position: relative;
      }
      .trip-day-card__badge-wrap {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex-shrink: 0;
      }
      .trip-day-card__badge {
        width: 46px;
        height: 46px;
        border-radius: 50%;
        background: var(--color-primary);
        color: white;
        font-weight: 800;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: var(--fs-md);
        box-shadow: var(--shadow-md);
      }
      .trip-day-card__line {
        flex: 1;
        width: 2px;
        background: var(--border-color);
        margin-top: var(--space-3);
      }
      .trip-day-card:last-child .trip-day-card__line {
        display: none;
      }
      .trip-day-card__body {
        flex: 1;
      }

      .pack-prepare-card {
        background: linear-gradient(135deg, #065F46 0%, #047857 100%);
        border-radius: var(--radius-xl);
        padding: var(--space-6) var(--space-8);
        color: white;
        box-shadow: var(--shadow-md);
      }

      .sidebar-budget-card {
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-xl);
        padding: var(--space-5);
        box-shadow: var(--shadow-sm);
      }
      .cost-item {
        margin-bottom: var(--space-2);
        font-size: var(--fs-sm);
        color: var(--text-secondary);
      }

      @media (max-width: 480px) {
        .planner-form-container {
          padding: var(--space-6) var(--space-4);
        }
      }
    `;
    document.head.appendChild(s);
  }
})();
