/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   NAVIGATIONMANAGER.JS — Page Navigation Controller
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export class NavigationManager {
  /**
   * @param {import('./PageManager.js').PageManager} pageManager
   */
  constructor(pageManager) {
    this.pageManager = pageManager;
  }

  init() {
    this._bindContinueButtons();
    this._bindKeyboardNav();
  }

  _bindContinueButtons() {
    const buttons = document.querySelectorAll('[data-nav]');

    buttons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const action = btn.dataset.nav;

        switch (action) {
          case 'next':
            this.pageManager.next();
            break;
          case 'prev':
            this.pageManager.prev();
            break;
          case 'goto':
            const target = parseInt(btn.dataset.navTarget, 10);
            if (!isNaN(target)) {
              this.pageManager.goTo(target);
            }
            break;
        }
      });
    });
  }

  _bindKeyboardNav() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        this.pageManager.next();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        this.pageManager.prev();
      }
    });
  }

  goNext() {
    this.pageManager.next();
  }

  goToPage(index) {
    this.pageManager.goTo(index);
  }
}
