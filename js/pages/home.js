/* ========================================
   TRAVEL TRIPPY - Home Page View Renderer
   ======================================== */

window.TT = window.TT || {};

(function() {
  TT.renderHome = function() {
    const appEl = document.getElementById('app');
    if (!appEl) return;

    // Retrieve active age group for personalized recommendation
    const profile = TT.state.getProfile();
    const activeAgeGroup = profile.ageGroup || 'young-professionals';

    // 1. Get featured/trending destinations (randomized or slice)
    const featured = TT.destinations.slice(0, 4);
    const trending = TT.destinations.slice(4, 10);

    const categoriesHtml = TT.categories.map(cat => `
      <a href="#/explore?category=${cat.id}" class="category-pill">
        <span class="category-pill__icon">${cat.icon}</span>
        <span class="category-pill__label">${cat.label}</span>
      </a>
    `).join('');

    const heroHtml = `
      <section class="hero">
        <div class="hero__bg-shapes">
          <div class="hero__shape hero__shape--1"></div>
          <div class="hero__shape hero__shape--2"></div>
          <div class="hero__shape hero__shape--3"></div>
        </div>
        <div class="hero__content">
          <div class="hero__badge">
            <span>✨ Discover India's Best Kept Secrets</span>
          </div>
          <h1 class="hero__title">
            Travel Offbeat.<br>
            <span>Explore Like a Local.</span>
          </h1>
          <p class="hero__subtitle">
            Uncover ancient cliff monasteries, hidden turquoise canyons, pristine floating lakes, and fiery regional foods that are never advertised.
          </p>
          
          <!-- Smart Search Bar -->
          <div class="search-bar hero__search">
            <div class="search-bar__input-wrap">
              <i data-lucide="search" class="search-bar__icon"></i>
              <input type="text" class="search-bar__input" id="hero-search-input" placeholder="Search offbeat towns, states, foods or categories..." autocomplete="off">
              <button class="search-bar__btn" id="hero-search-btn">Discover</button>
            </div>
            <div class="search-bar__suggestions" id="hero-search-suggestions"></div>
          </div>

          <div class="hero__stats">
            <div class="hero__stat">
              <div class="hero__stat-number">50+</div>
              <div class="hero__stat-label">Hidden Gems</div>
            </div>
            <div class="hero__stat">
              <div class="hero__stat-number">19</div>
              <div class="hero__stat-label">States covered</div>
            </div>
            <div class="hero__stat">
              <div class="hero__stat-number">100%</div>
              <div class="hero__stat-label">Local insights</div>
            </div>
          </div>
        </div>
      </section>
    `;

    const categoriesSection = `
      <section class="section section--sm" style="background: var(--bg-secondary);">
        <div class="container text-center">
          <h3 style="font-size: var(--fs-md); font-family: var(--font-heading); color: var(--text-tertiary); margin-bottom: var(--space-6); text-transform: uppercase; letter-spacing: 0.05em;">Browse by Adventure Style</h3>
          <div class="flex flex--center flex--wrap gap-3" style="max-width: 900px; margin: 0 auto;">
            ${categoriesHtml}
          </div>
        </div>
      </section>
    `;

    // Personalized Section based on profile age-group
    const ageGroupData = TT.ageGroups[activeAgeGroup];
    const ageGroupPicks = TT.destinations.filter(d => d.ageGroups.includes(activeAgeGroup)).slice(0, 3);
    
    const personalizedPicksHtml = ageGroupPicks.map(dest => `
      <div class="dest-card" onclick="window.location.hash = '#/destination/${dest.id}'">
        <div class="dest-card__image">
          <div class="dest-card__gradient-bg" style="background: ${dest.gradient || 'var(--bg-hero)'}">
            ${dest.emoji || '🏝️'}
          </div>
          <div class="dest-card__badge">${dest.state}</div>
          <button class="dest-card__fav-btn ${TT.state.isFavorite(dest.id) ? 'active' : ''}" data-dest-id="${dest.id}" onclick="event.stopPropagation(); toggleFav('${dest.id}', this)">
            <i data-lucide="heart"></i>
          </button>
        </div>
        <div class="dest-card__content">
          <h3 class="dest-card__title">${dest.name}</h3>
          <p class="dest-card__tagline">"${dest.tagline}"</p>
          <div class="flex flex--between" style="margin-top: var(--space-4); border-top: 1px solid var(--border-color); padding-top: var(--space-3); font-size: var(--fs-xs); color: var(--text-tertiary);">
            <span><i data-lucide="trending-up" class="card-icon"></i> ${dest.difficulty}</span>
            <span><i data-lucide="wallet" class="card-icon"></i> ₹${dest.budget.min} - ₹${dest.budget.max}</span>
            <span><i data-lucide="star" class="card-icon" style="color: var(--color-accent); fill: var(--color-accent);"></i> ${dest.safetyRating}.0</span>
          </div>
        </div>
      </div>
    `).join('');

    const personalizationSection = `
      <section class="section">
        <div class="container">
          <div class="flex flex--between flex--wrap gap-4" style="margin-bottom: var(--space-10);">
            <div>
              <div class="section-header__label">Personalized for you</div>
              <h2 style="font-size: var(--fs-3xl); font-weight: 800; font-family: var(--font-heading);">
                ${ageGroupData.icon} Curated Picks for ${ageGroupData.label.split(' ')[0]}
              </h2>
              <p style="color: var(--text-tertiary); margin-top: var(--space-2);">Based on your preferred travel traits: ${ageGroupData.traits.join(', ')}</p>
            </div>
            <div>
              <a href="#/profile" class="btn btn--outline" style="border: 1px solid var(--border-color); padding: var(--space-3) var(--space-6); border-radius: var(--radius-full); font-size: var(--fs-sm);">Customize Feed <i data-lucide="sliders" class="btn-icon"></i></a>
            </div>
          </div>
          
          <div class="grid grid--3">
            ${personalizedPicksHtml}
          </div>
        </div>
      </section>
    `;

    // Horizontal Scroll Featured
    const featuredHtml = featured.map(dest => `
      <div class="featured-scroll-card" onclick="window.location.hash = '#/destination/${dest.id}'">
        <div class="featured-scroll-card__visual" style="background: ${dest.gradient || 'var(--bg-hero)'}">
          <span style="font-size: 4rem;">${dest.emoji || '🏔️'}</span>
        </div>
        <div class="featured-scroll-card__body">
          <div style="font-size: var(--fs-xs); color: var(--color-primary); font-weight: 700; text-transform: uppercase;">${dest.state}</div>
          <h3 style="font-size: var(--fs-lg); margin: var(--space-1) 0 var(--space-2) 0; font-family: var(--font-heading);">${dest.name}</h3>
          <p style="font-size: var(--fs-sm); color: var(--text-tertiary); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">${dest.description}</p>
          <div class="flex gap-2" style="margin-top: var(--space-4);">
            ${dest.categories.slice(0, 2).map(catId => {
              const cat = TT.categories.find(c => c.id === catId);
              return `<span class="badge badge--primary">${cat ? cat.label : catId}</span>`;
            }).join('')}
          </div>
        </div>
      </div>
    `).join('');

    const featuredSection = `
      <section class="section" style="background: var(--bg-secondary); overflow: hidden;">
        <div class="container">
          <div class="section-header" style="text-align: left; margin-bottom: var(--space-8);">
            <div class="section-header__label">Top Hidden Gems</div>
            <h2 class="section-header__title" style="font-family: var(--font-heading);">Highly Rated Offbeat Escapes</h2>
            <p class="section-header__desc" style="margin: 0; max-width: 700px;">Chosen by local travel scouts for pristine isolation, ecological safety, and magnificent photo opportunities.</p>
          </div>
          
          <div class="featured-scroll-container">
            ${featuredHtml}
          </div>
        </div>
      </section>
    `;

    // Trending Section Grid
    const trendingGridHtml = trending.map(dest => `
      <div class="dest-card" onclick="window.location.hash = '#/destination/${dest.id}'">
        <div class="dest-card__image">
          <div class="dest-card__gradient-bg" style="background: ${dest.gradient || 'var(--bg-hero)'}">
            ${dest.emoji || '🏔️'}
          </div>
          <div class="dest-card__badge">${dest.state}</div>
          <button class="dest-card__fav-btn ${TT.state.isFavorite(dest.id) ? 'active' : ''}" data-dest-id="${dest.id}" onclick="event.stopPropagation(); toggleFav('${dest.id}', this)">
            <i data-lucide="heart"></i>
          </button>
        </div>
        <div class="dest-card__content">
          <h3 class="dest-card__title">${dest.name}</h3>
          <p class="dest-card__tagline">"${dest.tagline}"</p>
          <div class="flex flex--between" style="margin-top: var(--space-4); border-top: 1px solid var(--border-color); padding-top: var(--space-3); font-size: var(--fs-xs); color: var(--text-tertiary);">
            <span><i data-lucide="arrow-right-circle" class="card-icon"></i> ${dest.popularity} Popularity</span>
            <span><i data-lucide="calendar" class="card-icon"></i> ${dest.bestSeason.split(',')[0]}</span>
          </div>
        </div>
      </div>
    `).join('');

    const trendingSection = `
      <section class="section">
        <div class="container">
          <div class="section-header">
            <div class="section-header__label">Trending Explorations</div>
            <h2 class="section-header__title">Gems Rising In Popularity</h2>
            <p class="section-header__desc">Offbeat places seeing slightly more scouting runs, perfect to visit before mass commercialization arrives.</p>
          </div>
          
          <div class="card-grid">
            ${trendingGridHtml}
          </div>
        </div>
      </section>
    `;

    // AI Trip Planner CTA Banner
    const plannerCtaSection = `
      <section class="section" style="padding: 0;">
        <div class="container">
          <div class="planner-cta-card">
            <div style="max-width: 500px; z-index: 2; position: relative;">
              <span style="font-size: var(--fs-sm); font-weight: 700; color: var(--color-primary-light); text-transform: uppercase; letter-spacing: 0.08em; display: block; margin-bottom: var(--space-2);">Smart Travel Itineraries</span>
              <h2 style="font-size: clamp(1.8rem, 4vw, 2.5rem); font-family: var(--font-heading); color: white; font-weight: 900; line-height: 1.2; margin-bottom: var(--space-4);">Ready for your offbeat adventure?</h2>
              <p style="color: rgba(255,255,255,0.8); margin-bottom: var(--space-8); line-height: 1.6;">Let our AI-powered travel scouting engine build a day-by-day customized route with budget guides, travel times, regional food suggestions, and safety ratings.</p>
              <a href="#/planner" class="btn btn--primary" style="display: inline-block; padding: var(--space-4) var(--space-8); border-radius: var(--radius-xl); box-shadow: 0 4px 20px rgba(14, 165, 233, 0.4);">Launch Smart Planner <i data-lucide="arrow-right" class="btn-icon"></i></a>
            </div>
            <div class="planner-cta-card__bg-illustration">🗺️</div>
          </div>
        </div>
      </section>
    `;

    // Testimonials
    const testimonialsHtml = `
      <section class="section" style="background: var(--bg-secondary);">
        <div class="container">
          <div class="section-header">
            <div class="section-header__label">Explorer Community</div>
            <h2 class="section-header__title">Scout Reviews & Local Stories</h2>
            <p class="section-header__desc">Authentic reports filed by real travelers who used Travel Trippy to navigate offbeat regions.</p>
          </div>
          
          <div class="grid grid--3">
            ${TT.sampleReviews.slice(0, 3).map(rev => {
              const dest = TT.destinations.find(d => d.id === rev.destId);
              return `
                <div class="testimonial-card">
                  <div class="flex flex--between" style="margin-bottom: var(--space-4);">
                    <div>
                      <h4 style="font-weight: 600; font-family: var(--font-heading);">${rev.author}</h4>
                      <span style="font-size: var(--fs-xs); color: var(--text-muted);">${rev.date}</span>
                    </div>
                    <div style="color: var(--color-accent); font-size: var(--fs-xs);">
                      ${'★'.repeat(rev.rating)}${'☆'.repeat(5 - rev.rating)}
                    </div>
                  </div>
                  <p style="font-size: var(--fs-sm); color: var(--text-secondary); font-style: italic; line-height: 1.6;">"${rev.text}"</p>
                  <div style="margin-top: var(--space-4); border-top: 1px solid var(--border-color); padding-top: var(--space-3); font-size: var(--fs-xs); color: var(--text-tertiary);">
                    <span>Reviewed: </span>
                    <a href="#/destination/${rev.destId}" style="font-weight: 600; color: var(--color-primary);">${dest ? dest.name : rev.destId}</a>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </section>
    `;

    // Assemble and render
    appEl.innerHTML = `
      ${heroHtml}
      ${categoriesSection}
      ${personalizationSection}
      ${featuredSection}
      ${trendingSection}
      ${plannerCtaSection}
      ${testimonialsHtml}
    `;

    // Initialize Lucide Icons
    lucide.createIcons({
      attrs: {
        class: 'lucide-icon'
      }
    });

    // Add extra CSS styles for horizontal scroll cards and buttons dynamically if not in css/styles.css
    injectExtraStyles();

    // Bind Search events
    const searchInput = document.getElementById('hero-search-input');
    const searchSuggestions = document.getElementById('hero-search-suggestions');
    const searchBtn = document.getElementById('hero-search-btn');

    searchInput.addEventListener('input', () => {
      const q = searchInput.value.trim().toLowerCase();
      if (!q) {
        searchSuggestions.innerHTML = '';
        searchSuggestions.classList.remove('active');
        return;
      }

      // Filter matches from destinations and categories
      const matches = TT.destinations.filter(d => 
        d.name.toLowerCase().includes(q) || 
        d.state.toLowerCase().includes(q) || 
        d.tagline.toLowerCase().includes(q) ||
        d.foods.some(f => f.toLowerCase().includes(q))
      ).slice(0, 5);

      if (matches.length > 0) {
        searchSuggestions.innerHTML = matches.map(m => `
          <div class="search-bar__suggestion" onclick="window.location.hash = '#/destination/${m.id}'">
            <span class="search-bar__suggestion-icon">${m.emoji || '📍'}</span>
            <div>
              <div style="font-weight: 600; font-size: var(--fs-sm);">${m.name}</div>
              <div style="font-size: var(--fs-xs); color: var(--text-muted);">${m.state} — "${m.tagline}"</div>
            </div>
          </div>
        `).join('');
        searchSuggestions.classList.add('active');
      } else {
        searchSuggestions.innerHTML = `
          <div style="padding: var(--space-4); text-align: center; font-size: var(--fs-xs); color: var(--text-muted);">
            No matching offbeat gems found. Try "waterfall" or "mountains"
          </div>
        `;
        searchSuggestions.classList.add('active');
      }
    });

    // Close suggestions on click outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.search-bar')) {
        searchSuggestions.classList.remove('active');
      }
    });

    searchBtn.addEventListener('click', () => {
      const q = searchInput.value.trim();
      if (q) {
        window.location.hash = `#/explore?search=${encodeURIComponent(q)}`;
      }
    });

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const q = searchInput.value.trim();
        if (q) {
          window.location.hash = `#/explore?search=${encodeURIComponent(q)}`;
        }
      }
    });
  };

  // Helper function to handle favoriting
  window.toggleFav = function(destId, btnEl) {
    const isFav = TT.state.toggleFavorite(destId);
    if (isFav) {
      btnEl.classList.add('active');
      btnEl.querySelector('svg').style.fill = 'var(--color-danger)';
      btnEl.querySelector('svg').style.stroke = 'var(--color-danger)';
    } else {
      btnEl.classList.remove('active');
      btnEl.querySelector('svg').style.fill = 'none';
      btnEl.querySelector('svg').style.stroke = 'currentColor';
    }
  };

  function injectExtraStyles() {
    if (document.getElementById('tt-home-styles')) return;
    const s = document.createElement('style');
    s.id = 'tt-home-styles';
    s.textContent = `
      .category-pill {
        display: inline-flex;
        align-items: center;
        gap: var(--space-2);
        padding: var(--space-3) var(--space-5);
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-full);
        color: var(--text-secondary);
        font-weight: 500;
        font-size: var(--fs-sm);
        box-shadow: var(--shadow-sm);
        transition: all var(--transition-fast);
      }
      .category-pill:hover {
        transform: translateY(-2px);
        color: var(--color-primary);
        border-color: var(--color-primary-light);
        box-shadow: var(--shadow-md);
      }
      
      .featured-scroll-container {
        display: flex;
        gap: var(--space-6);
        overflow-x: auto;
        padding: var(--space-4) 0;
        scroll-snap-type: x mandatory;
        scrollbar-width: thin;
      }
      .featured-scroll-card {
        flex: 0 0 450px;
        scroll-snap-align: start;
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-xl);
        overflow: hidden;
        display: flex;
        box-shadow: var(--shadow-md);
        cursor: pointer;
        transition: all var(--transition-base);
      }
      .featured-scroll-card:hover {
        transform: translateY(-4px);
        box-shadow: var(--shadow-xl);
      }
      .featured-scroll-card__visual {
        flex: 0 0 160px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
      }
      .featured-scroll-card__body {
        flex: 1;
        padding: var(--space-5);
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
      
      .planner-cta-card {
        background: linear-gradient(135deg, #0F172A 0%, #0369A1 100%);
        border-radius: var(--radius-2xl);
        padding: var(--space-12) var(--space-16);
        position: relative;
        overflow: hidden;
        box-shadow: var(--shadow-xl);
        display: flex;
        align-items: center;
        min-height: 350px;
      }
      .planner-cta-card__bg-illustration {
        position: absolute;
        right: -30px;
        bottom: -50px;
        font-size: 24rem;
        opacity: 0.08;
        transform: rotate(-15deg);
        user-select: none;
        pointer-events: none;
      }
      
      .testimonial-card {
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-xl);
        padding: var(--space-6);
        box-shadow: var(--shadow-sm);
        transition: transform var(--transition-fast);
      }
      .testimonial-card:hover {
        transform: translateY(-3px);
      }

      .btn-icon {
        width: 16px;
        height: 16px;
        margin-left: var(--space-2);
        display: inline-block;
        vertical-align: middle;
      }

      .card-icon {
        width: 14px;
        height: 14px;
        margin-right: 4px;
        display: inline-block;
        vertical-align: middle;
      }

      .dest-card__fav-btn {
        position: absolute;
        top: var(--space-4);
        right: var(--space-4);
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.9);
        border: none;
        color: var(--text-secondary);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: var(--shadow-sm);
        transition: all var(--transition-fast);
      }
      .dest-card__fav-btn:hover {
        transform: scale(1.1);
        color: var(--color-danger);
      }
      .dest-card__fav-btn.active {
        color: var(--color-danger);
      }
      .dest-card__fav-btn.active svg {
        fill: var(--color-danger);
        stroke: var(--color-danger);
      }

      [data-theme="dark"] .dest-card__fav-btn {
        background: rgba(30, 41, 59, 0.9);
        color: var(--text-primary);
      }

      @media (max-width: 768px) {
        .featured-scroll-card {
          flex: 0 0 320px;
          flex-direction: column;
        }
        .featured-scroll-card__visual {
          flex: 0 0 120px;
        }
        .planner-cta-card {
          padding: var(--space-8) var(--space-6);
        }
      }
    `;
    document.head.appendChild(s);
  }
})();
