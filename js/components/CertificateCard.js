/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   CERTIFICATECARD.JS — Birthday Certificate Modal Component
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

import { audioManager } from '../managers/AudioManager.js';
import { ASSETS_CONFIG } from '../../config/assets.config.js';
import { APP_CONFIG } from '../../config/app.config.js';

export class CertificateCard {
  constructor() {
    this.overlay = null;
  }

  show() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'media-popup-overlay media-popup-overlay--certificate active';
    this.overlay.style.zIndex = '100250';
    this.overlay.innerHTML = `
      <div class="certificate-popup-card">
        <button class="popup-close-btn" id="certificate-popup-close">✕</button>
        <div class="certificate-popup-header">
          <span class="certificate-icon">🏆📜</span>
          <h2 class="certificate-popup-title">Official Birthday Certificate</h2>
          <p class="certificate-popup-subtitle">Awarded to ${APP_CONFIG.profile.birthdayName} ✨</p>
        </div>
        <div class="certificate-img-wrapper">
          <img src="${ASSETS_CONFIG.images.photos.certificate}" alt="Birthday Certificate" class="certificate-img">
        </div>
        <a href="${ASSETS_CONFIG.images.photos.certificate}" download="Priyanka-Birthday-Certificate.png" class="btn-download-cert">
          <span>📥</span> Download Certificate
        </a>
      </div>
    `;

    document.body.appendChild(this.overlay);

    const closeBtn = this.overlay.querySelector('#certificate-popup-close');
    closeBtn.addEventListener('click', () => {
      audioManager.playPaper();
      this.close();
    });

    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });

    if (typeof window.gsap !== 'undefined') {
      const card = this.overlay.querySelector('.certificate-popup-card');
      window.gsap.fromTo(this.overlay, { opacity: 0 }, { opacity: 1, duration: 0.3 });
      window.gsap.fromTo(card,
        { scale: 0.85, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.6)' }
      );
    }
  }

  close() {
    if (!this.overlay) return;
    const finish = () => {
      if (this.overlay) {
        this.overlay.remove();
        this.overlay = null;
      }
    };

    if (typeof window.gsap !== 'undefined') {
      const card = this.overlay.querySelector('.certificate-popup-card');
      window.gsap.to(card, { scale: 0.9, opacity: 0, duration: 0.25 });
      window.gsap.to(this.overlay, { opacity: 0, duration: 0.3, onComplete: finish });
    } else {
      finish();
    }
  }
}

export const certificateCard = new CertificateCard();
