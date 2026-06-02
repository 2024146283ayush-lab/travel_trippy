/* ========================================
   TRAVEL TRIPPY - Profile & Preferences
   ======================================== */

window.TT = window.TT || {};

(function() {
  TT.renderProfile = function() {
    const appEl = document.getElementById('app');
    if (!appEl) return;

    injectProfileStyles();

    const profile = TT.state.getProfile();

    // Interests Selection list
    const interestsHtml = TT.interests.map(int => {
      const isChecked = profile.interests.includes(int.id);
      return `
        <label class="pref-checkbox-card ${isChecked ? 'active' : ''}">
          <input type="checkbox" name="profile-interests" value="${int.id}" ${isChecked ? 'checked' : ''} style="display:none;" onchange="toggleCheckboxCard(this)">
          <span style="font-size: 1.5rem; display:block; margin-bottom:4px;">${int.icon}</span>
          <span style="font-weight:600; font-size:var(--fs-xs);">${int.label}</span>
        </label>
      `;
    }).join('');

    // Age groups list
    const ageGroupsHtml = Object.keys(TT.ageGroups).map(key => {
      const ag = TT.ageGroups[key];
      const isSelected = profile.ageGroup === key;
      return `
        <label class="pref-radio-card ${isSelected ? 'active' : ''}">
          <input type="radio" name="profile-agegroup" value="${key}" ${isSelected ? 'checked' : ''} style="display:none;" onchange="toggleRadioCard(this)">
          <div class="flex gap-3">
            <span style="font-size:1.8rem; display:flex; align-items:center;">${ag.icon}</span>
            <div>
              <span style="font-weight:700; font-size:var(--fs-sm); display:block; color:var(--text-primary);">${ag.label}</span>
              <span style="font-size:0.65rem; color:var(--text-muted); display:block; margin-top:2px;">Target Budget: ${ag.budgetRange}</span>
            </div>
          </div>
        </label>
      `;
    }).join('');

    // Starting cities options
    const startingCities = ['Mumbai', 'Delhi', 'Bangalore', 'Kolkata', 'Chennai', 'Pune', 'Hyderabad', 'Ahmedabad', 'Guwahati', 'Dehradun', 'Shimla'];
    const startingCitiesOptions = startingCities.map(c => `
      <option value="${c}" ${profile.startingCity === c ? 'selected' : ''}>${c}</option>
    `).join('');

    appEl.innerHTML = `
      <section class="section" style="padding-top: var(--space-12);">
        <div class="container container--narrow">
          <div class="profile-card">
            <div class="profile-card__header">
              <h2 style="font-size: var(--fs-2xl); font-family: var(--font-heading); font-weight: 800; margin-bottom: 2px;">Preferences Profile</h2>
              <p style="color: var(--text-tertiary); font-size: var(--fs-sm);">Lock your travel settings to personalize the homepage recommendations and AI planning traits.</p>
            </div>

            <form id="profile-settings-form" class="flex flex--col" style="gap: var(--space-6);">
              <div>
                <label class="form-label">Pathfinder Nickname</label>
                <input type="text" class="form-input" id="profile-name" value="${profile.name}" required style="cursor: text;">
              </div>

              <div>
                <label class="form-label" style="margin-bottom:var(--space-3);">Your Age Bracket</label>
                <div class="flex flex--col" style="gap: var(--space-3);">
                  ${ageGroupsHtml}
                </div>
              </div>

              <div>
                <label class="form-label" style="margin-bottom:var(--space-3);">Adventure Interests (Select all that apply)</label>
                <div class="interests-checkbox-grid">
                  ${interestsHtml}
                </div>
              </div>

              <div>
                <label class="form-label">Default Scouting Hub (Starting City)</label>
                <select class="form-input" id="profile-starting-city">
                  ${startingCitiesOptions}
                </select>
              </div>

              <div id="profile-success-alert" class="success-alert" style="display:none;">
                <i data-lucide="check-circle" style="width:16px; height:16px; display:inline-block; vertical-align:middle; margin-right:4px;"></i> Preferences Saved! Personalization updated successfully.
              </div>

              <button type="submit" class="btn btn--primary" style="padding: var(--space-3) 0; border-radius: var(--radius-xl); font-size: var(--fs-sm); font-weight: 700;">
                Save Scouting Profile <i data-lucide="shield-check" class="btn-icon"></i>
              </button>
            </form>
          </div>
        </div>
      </section>
    `;

    // Lucide Icons
    lucide.createIcons({ attrs: { class: 'lucide-icon' } });

    // Forms submit bind
    const form = document.getElementById('profile-settings-form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('profile-name').value.trim();
      const startingCity = document.getElementById('profile-starting-city').value;
      
      // Get selected age-group
      const ageGroupEl = form.querySelector('input[name="profile-agegroup"]:checked');
      const ageGroup = ageGroupEl ? ageGroupEl.value : 'young-professionals';

      // Get selected interests
      const interestEls = form.querySelectorAll('input[name="profile-interests"]:checked');
      const interests = Array.from(interestEls).map(el => el.value);

      // Save to global state!
      TT.state.updateProfile({
        name,
        startingCity,
        ageGroup,
        interests
      });

      // Show success alert
      const alertEl = document.getElementById('profile-success-alert');
      alertEl.style.display = 'block';
      
      // Highlight success and fade out after 2 seconds
      setTimeout(() => {
        alertEl.style.display = 'none';
        window.location.hash = '#/'; // Go Home
      }, 1500);
    });
  };

  // Helper visual toggle handlers
  window.toggleCheckboxCard = function(checkboxEl) {
    const card = checkboxEl.closest('.pref-checkbox-card');
    if (checkboxEl.checked) {
      card.classList.add('active');
    } else {
      card.classList.remove('active');
    }
  };

  window.toggleRadioCard = function(radioEl) {
    // Unhighlight all radios
    const form = radioEl.closest('form');
    form.querySelectorAll('.pref-radio-card').forEach(card => card.classList.remove('active'));
    
    if (radioEl.checked) {
      radioEl.closest('.pref-radio-card').classList.add('active');
    }
  };

  function injectProfileStyles() {
    if (document.getElementById('tt-profile-styles')) return;
    const s = document.createElement('style');
    s.id = 'tt-profile-styles';
    s.textContent = `
      .profile-card {
        background: var(--bg-card);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-2xl);
        padding: var(--space-8) var(--space-10);
        box-shadow: var(--shadow-xl);
      }
      .profile-card__header {
        border-bottom: 1px solid var(--border-color);
        padding-bottom: var(--space-4);
        margin-bottom: var(--space-6);
      }

      .pref-radio-card {
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-lg);
        padding: var(--space-3) var(--space-4);
        cursor: pointer;
        transition: all var(--transition-fast);
        display: block;
      }
      .pref-radio-card:hover {
        border-color: var(--color-primary-light);
      }
      .pref-radio-card.active {
        border-color: var(--color-primary);
        background: rgba(14, 165, 233, 0.05);
      }

      .interests-checkbox-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
        gap: var(--space-2);
      }
      
      .pref-checkbox-card {
        background: var(--bg-secondary);
        border: 1px solid var(--border-color);
        border-radius: var(--radius-lg);
        padding: var(--space-3);
        cursor: pointer;
        text-align: center;
        transition: all var(--transition-fast);
        display: block;
      }
      .pref-checkbox-card:hover {
        border-color: var(--color-primary-light);
      }
      .pref-checkbox-card.active {
        border-color: var(--color-primary);
        background: rgba(14, 165, 233, 0.05);
        color: var(--color-primary-dark);
      }

      .success-alert {
        background: rgba(16, 185, 129, 0.1);
        border: 1px solid var(--color-success);
        color: var(--color-success);
        padding: var(--space-3) var(--space-4);
        border-radius: var(--radius-md);
        font-size: var(--fs-xs);
        font-weight: 600;
        animation: fadeIn 0.3s;
      }
    `;
    document.head.appendChild(s);
  }
})();
