/* ========================================
   TRAVEL TRIPPY - Hash-based SPA Router
   ======================================== */

window.TT = window.TT || {};

(function() {
  const routes = {};
  let currentRoute = null;

  function compileRoutePattern(pattern) {
    // Escape special regex chars, but convert :param to ([^/]+)
    const keys = [];
    const regexSource = pattern
      .replace(/([.+*?^=!:${}()|\[\]\/\\])/g, '\\$1') // escape regex chars
      .replace(/\\:([a-zA-Z0-9_]+)/g, (_, name) => {
        keys.push(name);
        return '([^/]+)';
      });
    return {
      regex: new RegExp('^' + regexSource + '$'),
      keys
    };
  }

  TT.router = {
    // Register a route
    add: (path, handler) => {
      const compiled = compileRoutePattern(path);
      routes[path] = {
        handler,
        ...compiled
      };
    },

    // Trigger navigation programmatically
    navigate: (path) => {
      window.location.hash = path;
    },

    // Get current hash route
    getCurrentPath: () => {
      const hash = window.location.hash || '#/';
      return hash.substring(1) || '/'; // Strip '#' and return
    },

    // Resolve the current path and run the handler
    resolve: () => {
      const path = TT.router.getCurrentPath();
      let matchedRoute = null;
      let params = {};

      for (const routePath in routes) {
        const route = routes[routePath];
        const match = path.match(route.regex);
        if (match) {
          matchedRoute = route;
          // Extract param values
          route.keys.forEach((key, index) => {
            params[key] = decodeURIComponent(match[index + 1]);
          });
          break;
        }
      }

      if (matchedRoute) {
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'instant' });

        const appEl = document.getElementById('app');
        if (appEl) {
          // Play fade-out transition
          appEl.style.opacity = '0';
          appEl.style.transform = 'translateY(10px)';

          setTimeout(() => {
            try {
              matchedRoute.handler(params);
            } catch (err) {
              console.error('Error in route handler:', err);
              appEl.innerHTML = `
                <div class="container section text-center">
                  <h2 style="font-size: 2rem; margin-bottom: var(--space-4);">Oops! Something went wrong</h2>
                  <p style="color: var(--text-tertiary);">Failed to render this page. Try heading back to the home page.</p>
                  <a href="#/" class="btn btn--primary" style="display: inline-block; margin-top: var(--space-6);">Go Home</a>
                </div>
              `;
            }
            // Trigger reflow
            appEl.offsetHeight;
            // Play fade-in transition
            appEl.style.opacity = '1';
            appEl.style.transform = 'translateY(0)';
          }, 200);
        }
      } else {
        // 404 Route Not Found
        const appEl = document.getElementById('app');
        if (appEl) {
          appEl.innerHTML = `
            <div class="container section text-center" style="padding: 100px 24px;">
              <div style="font-size: 6rem; line-height: 1; font-weight: 800; color: var(--color-primary); margin-bottom: var(--space-4);">404</div>
              <h2 style="font-size: 2rem; font-family: var(--font-heading); margin-bottom: var(--space-4);">Gem Hidden Too Well!</h2>
              <p style="color: var(--text-tertiary); max-width: 500px; margin: 0 auto var(--space-8);">The destination or page you are looking for does not exist. It might have been moved or is just extremely offbeat.</p>
              <a href="#/" class="btn btn--primary" style="display: inline-block;">Discover Home</a>
            </div>
          `;
        }
      }

      // Update active navbar link styles
      updateActiveLinks(path);
    }
  };

  function updateActiveLinks(path) {
    const links = document.querySelectorAll('.nav__link');
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href) {
        const linkPath = href.substring(1); // Strip '#'
        // Check if we are active (exact match or prefix for /explore etc.)
        const isActive = (linkPath === '/' && path === '/') ||
                        (linkPath !== '/' && path.startsWith(linkPath));
        if (isActive) {
          link.classList.add('nav__link--active');
        } else {
          link.classList.remove('nav__link--active');
        }
      }
    });
  }

  // Hook into popstate/hashchange
  window.addEventListener('hashchange', TT.router.resolve);
  window.addEventListener('load', TT.router.resolve);
})();
