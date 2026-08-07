/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   UI.JS — UI Utilities
   Layer 2: UX Layout & Page Composition
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export const UI = {

  /**
   * Fix mobile viewport height (100vh issue).
   * Sets --vh custom property to real viewport height.
   */
  initViewport() {
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVH();

    // Debounced resize
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(setVH, 50);
    });

    window.addEventListener('orientationchange', () => {
      setTimeout(setVH, 150);
    });

    // Prevent pinch zoom
    document.addEventListener('gesturestart', (e) => e.preventDefault());

    // Prevent double-tap zoom
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    }, { passive: false });

    console.log('[UI] Viewport initialized');
  },

  /**
   * Prevent pull-to-refresh and overscroll.
   */
  preventOverscroll() {
    document.body.addEventListener('touchmove', (e) => {
      let target = e.target;
      while (target && target !== document.body) {
        const style = window.getComputedStyle(target);
        const overflowY = style.overflowY;
        const overflowX = style.overflowX;

        // Allow horizontal scroll in horizontal scrollable containers (like gallery carousel)
        if (overflowX === 'auto' || overflowX === 'scroll') {
          const { scrollLeft, scrollWidth, clientWidth } = target;
          const isAtLeft = scrollLeft <= 0;
          const isAtRight = scrollLeft + clientWidth >= scrollWidth;

          if (!isAtLeft && !isAtRight) return;

          if (e.touches.length === 1) {
            const touch = e.touches[0];
            const lastTouchX = target._lastTouchX || 0;
            if (isAtLeft && touch.clientX > lastTouchX) {
              e.preventDefault();
              return;
            }
            if (isAtRight && touch.clientX < lastTouchX) {
              e.preventDefault();
              return;
            }
          }
          return;
        }

        // Allow vertical scroll in vertical scrollable containers
        if (overflowY === 'auto' || overflowY === 'scroll') {
          const { scrollTop, scrollHeight, clientHeight } = target;
          const isAtTop = scrollTop <= 0;
          const isAtBottom = scrollTop + clientHeight >= scrollHeight;

          // Allow scrolling if not at boundary
          if (!isAtTop && !isAtBottom) return;

          // At boundary — check direction
          if (e.touches.length === 1) {
            const touch = e.touches[0];
            if (isAtTop && touch.clientY > (target._lastTouchY || 0)) {
              e.preventDefault();
              return;
            }
            if (isAtBottom && touch.clientY < (target._lastTouchY || 0)) {
              e.preventDefault();
              return;
            }
          }
          return;
        }
        target = target.parentElement;
      }
      e.preventDefault();
    }, { passive: false });

    // Track touch position for overscroll detection
    document.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        let target = e.target;
        while (target && target !== document.body) {
          target._lastTouchY = e.touches[0].clientY;
          target._lastTouchX = e.touches[0].clientX;
          target = target.parentElement;
        }
      }
    }, { passive: true });
  },

  /**
   * Show toast notification.
   * @param {string} message
   * @param {number} duration
   */
  showToast(message, duration = 2500) {
    let toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add('active');

    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.classList.remove('active');
    }, duration);
  },

  /** Show overlay by ID */
  showOverlay(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
  },

  /** Hide overlay by ID */
  hideOverlay(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
  },

  /** Show modal by ID */
  showModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
  },

  /** Hide modal by ID */
  hideModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
  },

  /** Show dialog by ID */
  showDialog(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
  },

  /** Hide dialog by ID */
  hideDialog(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
  },

  /**
   * Query helper.
   * @param {string} selector
   * @param {Element} parent
   * @returns {HTMLElement|null}
   */
  $(selector, parent = document) {
    return parent.querySelector(selector);
  },

  /**
   * Query-all helper.
   * @param {string} selector
   * @param {Element} parent
   * @returns {HTMLElement[]}
   */
  $$(selector, parent = document) {
    return Array.from(parent.querySelectorAll(selector));
  },

  /** Disable button */
  disableButton(btn) {
    if (!btn) return;
    btn.disabled = true;
    btn.setAttribute('aria-disabled', 'true');
  },

  /** Enable button */
  enableButton(btn) {
    if (!btn) return;
    btn.disabled = false;
    btn.setAttribute('aria-disabled', 'false');
  }
};
