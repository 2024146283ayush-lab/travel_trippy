/* ========================================
   TRAVEL TRIPPY - Main App Initialization
   ======================================== */

window.TT = window.TT || {};

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize persistent UI elements & behaviors
  initNavbarScrollBehavior();
  initThemeToggle();
  initMobileMenuToggle();
  
  // 2. Initialize persistent AI Chatbot widget
  if (TT.chatbot && typeof TT.chatbot.init === 'function') {
    TT.chatbot.init();
  }

  // 3. Register SPA Routes
  if (TT.router && typeof TT.router.add === 'function') {
    TT.router.add('/', TT.renderHome);
    TT.router.add('/explore', TT.renderExplore);
    TT.router.add('/destination/:id', TT.renderDestination);
    TT.router.add('/planner', TT.renderPlanner);
    TT.router.add('/gallery', TT.renderGallery);
    TT.router.add('/food', TT.renderFood);
    TT.router.add('/nearby', TT.renderNearby);
    TT.router.add('/dashboard', TT.renderDashboard);
    TT.router.add('/profile', TT.renderProfile);
    
    // Resolve initial URL route
    TT.router.resolve();
  } else {
    console.error('SPA Router not loaded correctly!');
  }
});

// Binds scroll listener to nav for professional glassmorphism toggle
function initNavbarScrollBehavior() {
  const nav = document.getElementById('main-nav');
  if (!nav) return;

  function checkScroll() {
    if (window.scrollY > 15) {
      nav.classList.add('nav--glass');
      nav.style.boxShadow = 'var(--shadow-md)';
    } else {
      nav.classList.remove('nav--glass');
      nav.style.boxShadow = 'none';
    }
  }

  window.addEventListener('scroll', checkScroll);
  checkScroll(); // Trigger initial state
}

// Binds light/dark mode buttons and syncs Lucide icons
function initThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle-btn');
  if (!toggleBtn) return;

  const sunIcon = toggleBtn.querySelector('.sun-icon');
  const moonIcon = toggleBtn.querySelector('.moon-icon');

  function updateVisualToggle(theme) {
    if (theme === 'dark') {
      if (sunIcon) sunIcon.style.display = 'none';
      if (moonIcon) moonIcon.style.display = 'block';
    } else {
      if (sunIcon) sunIcon.style.display = 'block';
      if (moonIcon) moonIcon.style.display = 'none';
    }
  }

  // Initial update
  const currentTheme = TT.state.getTheme();
  updateVisualToggle(currentTheme);

  toggleBtn.addEventListener('click', () => {
    const current = TT.state.getTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    TT.state.setTheme(next);
  });

  // Keep synced if updated from profile or chatbot
  TT.state.on('themeChange', (theme) => {
    updateVisualToggle(theme);
  });
}

// Binds responsive slide-out menu interactions
function initMobileMenuToggle() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const closeBtn = document.getElementById('close-menu-btn');
  const overlay = document.getElementById('mobile-overlay');
  const menu = document.getElementById('mobile-menu');

  if (!menuBtn || !closeBtn || !overlay || !menu) return;

  function openMenu() {
    menu.style.display = 'flex';
    overlay.style.display = 'block';
    // Trigger layout reflow to allow transition
    menu.offsetHeight;
    menu.classList.add('open');
  }

  function closeMenu() {
    menu.classList.remove('open');
    overlay.style.display = 'none';
    setTimeout(() => {
      if (!menu.classList.contains('open')) {
        menu.style.display = 'none';
      }
    }, 300);
  }

  menuBtn.addEventListener('click', openMenu);
  closeBtn.addEventListener('click', closeMenu);
  overlay.addEventListener('click', closeMenu);

  // Close menu if a link is clicked
  menu.querySelectorAll('.nav__link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });
}
