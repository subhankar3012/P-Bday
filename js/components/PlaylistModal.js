/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   PLAYLISTMODAL.JS — Custom Track Player Popup Component
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

import { audioManager } from '../managers/AudioManager.js';
import { APP_CONFIG } from '../../config/app.config.js';
import { ASSETS_CONFIG } from '../../config/assets.config.js';
import { premiumVideoPlayer } from './PremiumVideoPlayer.js';

export class PlaylistModal {
  constructor() {
    this.overlay = null;
  }

  open() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'media-popup-overlay media-popup-overlay--playlist active';
    this.overlay.style.zIndex = '100150';

    this.overlay.innerHTML = `
      <button class="popup-back-btn" id="playlist-popup-close" aria-label="Go back">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>

      <div class="playlist-popup-card">
        <div class="playlist-popup-header">
          <h2 class="playlist-popup-title">🎵 Favorite Song</h2>
          <p class="playlist-popup-subtitle">A special track dedicated to ${APP_CONFIG.profile.birthdayName} 🌸</p>
        </div>

        <div class="playlist-player-wrapper" id="playlist-player-container">
          <div class="tu-jaane-na-card" id="tu-jaane-na-card">
            <div class="tu-jaane-na-card__artwork">
              <span>🎵</span>
              <span class="artwork-sparkle">✨</span>
            </div>
            <div class="tu-jaane-na-card__info">
              <h3 class="tu-jaane-na-card__title">Tu Jaane Na</h3>
              <p class="tu-jaane-na-card__artist">Atif Aslam • Pritam</p>
            </div>
            <button class="tu-jaane-na-card__play-btn" id="tjn-play-btn">▶</button>
          </div>
        </div>

        <a href="${APP_CONFIG.profile.youtubeSongUrl}" target="_blank" rel="noopener" class="btn-youtube-official">
          <span class="yt-icon">▶</span> Open Official Song on YouTube
        </a>
      </div>
    `;

    document.body.appendChild(this.overlay);

    const closeBtn = this.overlay.querySelector('#playlist-popup-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        audioManager.playPaper();
        this.close();
      });
    }

    const cardBtn = this.overlay.querySelector('#tu-jaane-na-card');
    const playerContainer = this.overlay.querySelector('#playlist-player-container');

    if (cardBtn && playerContainer) {
      cardBtn.addEventListener('click', () => {
        audioManager.playChime();
        premiumVideoPlayer.embedInto(playerContainer, ASSETS_CONFIG.videos.favSong);
      });
    }

    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });

    if (typeof window.gsap !== 'undefined') {
      const card = this.overlay.querySelector('.playlist-popup-card');
      window.gsap.fromTo(this.overlay, { opacity: 0 }, { opacity: 1, duration: 0.3 });
      window.gsap.fromTo(card,
        { scale: 0.85, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.6)' }
      );
    }
  }

  close() {
    if (!this.overlay) return;
    premiumVideoPlayer.destroy();
    const finish = () => {
      if (this.overlay) {
        this.overlay.remove();
        this.overlay = null;
      }
    };

    if (typeof window.gsap !== 'undefined') {
      const card = this.overlay.querySelector('.playlist-popup-card');
      window.gsap.to(card, { scale: 0.9, opacity: 0, duration: 0.25 });
      window.gsap.to(this.overlay, { opacity: 0, duration: 0.3, onComplete: finish });
    } else {
      finish();
    }
  }
}

export const playlistModal = new PlaylistModal();
