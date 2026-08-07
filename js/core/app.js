/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   APP.JS — Main Application Entry Point & Orchestrator
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

import { PageManager } from '../managers/PageManager.js';
import { NavigationManager } from '../managers/NavigationManager.js';
import { audioManager } from '../managers/AudioManager.js';
import { videoManager } from '../managers/VideoManager.js';
import { stateManager } from './StateManager.js';
import { MotionController } from '../motion.js';
import { UI } from '../ui.js';
import { disclaimerModal } from '../components/DisclaimerModal.js';

// Page Initializers
import { initEntrancePage } from '../pages/EntrancePage.js';
import { initMemoryLanePage } from '../pages/MemoryLane.js';
import { initBalloonGamePage } from '../pages/BalloonGame.js';
import { initColorQuizPage } from '../pages/ColorQuiz.js';
import { initCakeCeremonyPage } from '../pages/CakeCeremony.js';
import { initLetterPage } from '../pages/LetterPage.js';
import { initFinalAdventurePage } from '../pages/FinalAdventure.js';

class App {
  constructor() {
    this.pageManager = new PageManager();
    this.navigation = new NavigationManager(this.pageManager);
    this.motionController = new MotionController();
  }

  init() {
    console.log('[App] Booting Birthday Adventure Application...');

    // 1. Initialize State Persistence
    stateManager.init();

    // 2. Setup Viewport & Touch Gestures
    UI.initViewport();
    UI.preventOverscroll();

    // 3. Motion Controller Initialization
    this.motionController.init();
    this.pageManager.setMotionController(this.motionController);

    // 4. Initialize Page Manager & Navigation
    this.pageManager.init('.page');
    this.navigation.init();

    // 5. Initialize Media Manager System
    videoManager.init(this.navigation, this.pageManager);

    // 6. Initialize Page Modules
    initEntrancePage(this.pageManager, this.navigation);
    initMemoryLanePage(this.pageManager, this.navigation);
    initBalloonGamePage(this.pageManager, this.navigation);
    initColorQuizPage(this.pageManager, this.navigation);
    initCakeCeremonyPage(this.pageManager, this.navigation);
    initLetterPage(this.pageManager, this.navigation);
    initFinalAdventurePage(this.pageManager, this.navigation);

    // Global Back Button visibility sync
    const updateBackBtn = (pageIndex) => {
      const backBtn = document.getElementById('global-back-btn');
      if (backBtn) {
        if (pageIndex > 0) {
          backBtn.classList.add('visible');
        } else {
          backBtn.classList.remove('visible');
        }
      }
    };

    // 7. Route to initial or saved page
    const savedPage = stateManager.get('currentPage') || 0;

    if (savedPage === 0) {
      disclaimerModal.show(() => {
        this.pageManager.goTo(0);
        updateBackBtn(0);
      });
    } else {
      this.pageManager.goTo(savedPage);
      updateBackBtn(savedPage);
    }

    // 8. Track page changes
    document.addEventListener('pagechange', (e) => {
      const { from, to } = e.detail;
      stateManager.set('currentPage', to);
      updateBackBtn(to);
    });

    // 9. Document Visibility Lifecycle Management
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        audioManager.suspend();
      } else {
        audioManager.resume();
      }
    });

    // 10. Service Worker Registration
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then(reg => console.log('[ServiceWorker] Registered successfully:', reg.scope))
          .catch(err => console.warn('[ServiceWorker] Registration failed:', err));
      });
    }

    console.log('[App] Application ready ✓');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();

  window.__app = app;
  window.__state = stateManager;
  window.__audio = audioManager;
});
