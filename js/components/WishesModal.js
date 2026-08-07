/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   WISHESMODAL.JS — Handwritten Wishes Modal Component
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

import { audioManager } from '../managers/AudioManager.js';
import { WISHES_DATA } from '../../data/wishes.data.js';

export class WishesModal {
  constructor() {
    this.overlay = null;
  }

  open() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'media-popup-overlay media-popup-overlay--wishes active';
    this.overlay.style.zIndex = '100150';

    const notesHtml = WISHES_DATA.map((noteText, idx) => `
      <div class="handwritten-wish-note">
        <div class="wish-note-tag">Wish #${idx + 1} ✨</div>
        <p>${noteText}</p>
      </div>
    `).join('');

    this.overlay.innerHTML = `
      <button class="popup-back-btn" id="wishes-popup-close" aria-label="Go back">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>

      <div class="wishes-popup-card">
        <div class="wishes-popup-header">
          <h2 class="wishes-popup-title">⭐ Birthday Wishes</h2>
          <p class="wishes-popup-subtitle">Heartfelt notes written for you 🌸</p>
        </div>

        <div class="wishes-popup-scroll">
          ${notesHtml}
        </div>
      </div>
    `;

    document.body.appendChild(this.overlay);

    const closeBtn = this.overlay.querySelector('#wishes-popup-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        audioManager.playPaper();
        this.close();
      });
    }

    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });

    if (typeof window.gsap !== 'undefined') {
      const card = this.overlay.querySelector('.wishes-popup-card');
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
      const card = this.overlay.querySelector('.wishes-popup-card');
      window.gsap.to(card, { scale: 0.9, opacity: 0, duration: 0.25 });
      window.gsap.to(this.overlay, { opacity: 0, duration: 0.3, onComplete: finish });
    } else {
      finish();
    }
  }
}

export const wishesModal = new WishesModal();
