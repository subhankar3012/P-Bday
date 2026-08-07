/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   PAGEMANAGER.JS — Page Lifecycle & Transition Manager
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export class PageManager {
  constructor() {
    /** @type {HTMLElement[]} */
    this.pages = [];
    this.currentIndex = -1;
    this.previousIndex = -1;
    this.hooks = new Map();
    this.isTransitioning = false;
    this.history = [];
    this.motionController = null;
  }

  setMotionController(motionController) {
    this.motionController = motionController;
  }

  init(selector = '.page') {
    this.pages = Array.from(document.querySelectorAll(selector));
    this.pages.forEach((page, i) => {
      page.classList.remove('active', 'transitioning-in', 'transitioning-out');
      page.dataset.pageIndex = String(i);
    });
  }

  registerHooks(index, hooks) {
    this.hooks.set(index, hooks);
  }

  goTo(index) {
    if (this.isTransitioning) return false;
    if (index < 0 || index >= this.pages.length) return false;
    if (index === this.currentIndex) return false;

    this.isTransitioning = true;
    this.previousIndex = this.currentIndex;

    const prevPage = this.pages[this.previousIndex];
    const nextPage = this.pages[index];
    const direction = index > this.currentIndex ? 'forward' : 'backward';

    const executeSwitch = () => {
      if (prevPage) {
        const exitHook = this.hooks.get(this.previousIndex)?.onExit;
        if (exitHook) exitHook(prevPage, this.previousIndex);
        prevPage.classList.remove('active', 'transitioning-out');
      }

      nextPage.classList.remove('transitioning-in');
      nextPage.classList.add('active');

      this.currentIndex = index;
      this.history.push(index);

      const scrollContainer = nextPage.querySelector('.page-gift-scroll, .page__scroll');
      if (scrollContainer) scrollContainer.scrollTop = 0;
      nextPage.scrollTop = 0;

      const enterHook = this.hooks.get(index)?.onEnter;
      if (enterHook) enterHook(nextPage, index);

      const readyHook = this.hooks.get(index)?.onReady;
      if (readyHook) {
        requestAnimationFrame(() => readyHook(nextPage, index));
      }

      document.dispatchEvent(new CustomEvent('pagechange', {
        detail: {
          from: this.previousIndex,
          to: index,
          direction,
          total: this.pages.length
        }
      }));

      this.isTransitioning = false;
    };

    if (this.motionController && prevPage && this.previousIndex !== -1) {
      this.motionController.playTransition(prevPage, nextPage, direction, executeSwitch);
    } else {
      executeSwitch();
      if (this.motionController) {
        this.motionController.animatePageEntrance(nextPage, index);
      }
    }

    return true;
  }

  next() { return this.goTo(this.currentIndex + 1); }
  prev() { return this.goTo(this.currentIndex - 1); }
  getCurrentPage() { return this.pages[this.currentIndex] || null; }
  getCurrentIndex() { return this.currentIndex; }
  getTotal() { return this.pages.length; }
  isLastPage() { return this.currentIndex === this.pages.length - 1; }
  isFirstPage() { return this.currentIndex === 0; }
}
