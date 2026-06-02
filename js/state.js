/* ========================================
   TRAVEL TRIPPY - Global State Management
   ======================================== */

window.TT = window.TT || {};

(function() {
  // Initial state structure
  const DEFAULT_STATE = {
    favorites: [],
    profile: {
      name: 'Explorer',
      ageGroup: 'young-professionals',
      interests: ['nature', 'adventure', 'photography'],
      travelStyle: 'backpacking',
      startingCity: 'Mumbai'
    },
    savedTrips: [],
    recentlyViewed: [],
    theme: 'light'
  };

  // Load state from localStorage or use defaults
  function loadState() {
    try {
      const stored = localStorage.getItem('tt_state');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Deep merge with defaults to ensure new fields are populated
        return {
          ...DEFAULT_STATE,
          ...parsed,
          profile: { ...DEFAULT_STATE.profile, ...parsed.profile }
        };
      }
    } catch (e) {
      console.error('Failed to load state from localStorage:', e);
    }
    return { ...DEFAULT_STATE };
  }

  const state = loadState();

  // Simple Pub/Sub event system
  const listeners = {};

  function saveState() {
    try {
      localStorage.setItem('tt_state', JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save state to localStorage:', e);
    }
  }

  TT.state = {
    // Getters
    getTheme: () => state.theme,
    getFavorites: () => state.favorites,
    getProfile: () => state.profile,
    getSavedTrips: () => state.savedTrips,
    getRecentlyViewed: () => state.recentlyViewed,

    // Setters
    setTheme: (theme) => {
      state.theme = theme;
      saveState();
      document.documentElement.setAttribute('data-theme', theme);
      TT.state.emit('themeChange', theme);
    },

    // Favorites Management
    toggleFavorite: (destId) => {
      const index = state.favorites.indexOf(destId);
      if (index === -1) {
        state.favorites.push(destId);
      } else {
        state.favorites.splice(index, 1);
      }
      saveState();
      TT.state.emit('favoritesChange', state.favorites);
      return state.favorites.includes(destId);
    },

    isFavorite: (destId) => state.favorites.includes(destId),

    // Profile Management
    updateProfile: (newProfile) => {
      state.profile = { ...state.profile, ...newProfile };
      saveState();
      TT.state.emit('profileChange', state.profile);
    },

    // Saved Trips Management
    saveTrip: (trip) => {
      const newTrip = {
        id: 'trip_' + Date.now(),
        date: new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }),
        ...trip
      };
      state.savedTrips.unshift(newTrip);
      saveState();
      TT.state.emit('tripsChange', state.savedTrips);
      return newTrip;
    },

    deleteTrip: (tripId) => {
      state.savedTrips = state.savedTrips.filter(t => t.id !== tripId);
      saveState();
      TT.state.emit('tripsChange', state.savedTrips);
    },

    // Recently Viewed Management
    addRecentlyViewed: (destId) => {
      // Filter out existing and prepend
      state.recentlyViewed = [
        destId,
        ...state.recentlyViewed.filter(id => id !== destId)
      ].slice(0, 6); // Keep last 6 items
      saveState();
      TT.state.emit('recentChange', state.recentlyViewed);
    },

    // Simple Event Emitter methods
    on: (event, callback) => {
      if (!listeners[event]) {
        listeners[event] = [];
      }
      listeners[event].push(callback);
    },

    off: (event, callback) => {
      if (!listeners[event]) return;
      listeners[event] = listeners[event].filter(cb => cb !== callback);
    },

    emit: (event, data) => {
      if (!listeners[event]) return;
      listeners[event].forEach(callback => {
        try {
          callback(data);
        } catch (e) {
          console.error(`Error in event listener for ${event}:`, e);
        }
      });
    }
  };

  // Initialize theme on document load
  const initialTheme = state.theme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', initialTheme);
})();
