/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SURPRISEMODAL.JS — Final Surprise Note Modal Component
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

import { audioManager } from '../managers/AudioManager.js';
import { APP_CONFIG } from '../../config/app.config.js';
import { surpriseFlow } from './SurpriseFlow.js';

export class SurpriseModal {
  constructor() {
    this.overlay = null;
  }

  open() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'media-popup-overlay media-popup-overlay--surprise active';
    this.overlay.style.zIndex = '100150';
    this.overlay.innerHTML = `
      <button class="popup-back-btn" id="surprise-popup-close" aria-label="Go back">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>

      <canvas class="surprise-particles-canvas" id="surprise-particles"></canvas>
      <div class="surprise-card">
        <div class="surprise-card__icon">🎁✨</div>
        <h2 class="surprise-card__title">Happy Birthday, ${APP_CONFIG.profile.birthdayName}!</h2>
        <div class="surprise-card__letter">Kya soch rahi thi...
Tujhe gift milega?

Bhool ja. 😂

Nahi milega.

Because...

Main gareeb hoon yaar. 🥲💸

Waise...
Iss website ko banane me jo time aur mehnat mehti me lagi,
wohi mera asli gift hai. ❤️</div>
        <button class="btn-final-surprise" id="btn-final-surprise">
          <span class="btn-final-title">✨ Click Here For Final Surprise! ✨</span>
          <span class="btn-final-subtitle">A special ending sequence awaits 🌸</span>
        </button>
      </div>
    `;

    document.body.appendChild(this.overlay);

    const closeBtn = this.overlay.querySelector('#surprise-popup-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        audioManager.playPaper();
        this.close();
      });
    }

    const finalBtn = this.overlay.querySelector('#btn-final-surprise');
    if (finalBtn) {
      finalBtn.addEventListener('click', () => {
        audioManager.playChime();
        this.close(() => {
          surpriseFlow.start();
        });
      });
    }

    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });

    if (typeof window.gsap !== 'undefined') {
      const card = this.overlay.querySelector('.surprise-card');
      window.gsap.fromTo(this.overlay, { opacity: 0 }, { opacity: 1, duration: 0.3 });
      window.gsap.fromTo(card,
        { scale: 0.85, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.6)' }
      );
    }
  }

  close(onComplete = null) {
    if (!this.overlay) {
      if (onComplete) onComplete();
      return;
    }
    const finish = () => {
      if (this.overlay) {
        this.overlay.remove();
        this.overlay = null;
      }
      if (onComplete) onComplete();
    };

    if (typeof window.gsap !== 'undefined') {
      const card = this.overlay.querySelector('.surprise-card');
      window.gsap.to(card, { scale: 0.9, opacity: 0, duration: 0.25 });
      window.gsap.to(this.overlay, { opacity: 0, duration: 0.3, onComplete: finish });
    } else {
      finish();
    }
  }
}

export const surpriseModal = new SurpriseModal();
