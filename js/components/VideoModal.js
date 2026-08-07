/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   VIDEOMODAL.JS — Fullscreen Video Popup Component
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

import { audioManager } from '../managers/AudioManager.js';

const MEME_TITLES = {
  'memories.mp4': { icon: '📼', title: 'One of your best childhood videos...' },
  'wishes.mp4': { icon: '💌', title: 'This is a special birthday wish...' },
  'playlist.mp4': { icon: '🎵', title: 'Is this really your favorite video?' },
  'surprise.mp4': { icon: '🎁', title: 'Is this the surprise you were waiting for?' }
};

export class VideoModal {
  constructor() {
    this.overlay = null;
    this.video = null;
    this.card = null;
    this.loader = null;
    this.skipTimer = null;
    this.isPlaying = false;
    this.onFinishedCallback = null;
    this.isClosed = false;
  }

  getFilename(url) {
    if (!url) return '';
    const parts = url.split('/');
    return parts[parts.length - 1];
  }

  open(videoUrl, onFinished = () => {}) {
    if (this.isPlaying) this.close();

    this.isPlaying = true;
    this.isClosed = false;
    this.onFinishedCallback = onFinished;

    const filename = this.getFilename(videoUrl);
    const meta = MEME_TITLES[filename] || { icon: '✨', title: 'Special Memory Video...' };

    this.overlay = document.createElement('div');
    this.overlay.className = 'media-popup-overlay media-popup-overlay--video active';
    this.overlay.style.zIndex = '100100';
    this.overlay.innerHTML = `
      <button class="popup-back-btn" id="video-modal-back-btn" aria-label="Go back">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>

      <button class="popup-skip-btn" id="video-modal-skip-btn" aria-label="Skip video">
        <span>Skip</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="14" height="14">
          <polygon points="5 4 15 12 5 20 5 4"></polygon>
          <line x1="19" y1="5" x2="19" y2="19"></line>
        </svg>
      </button>

      <div class="video-modal-card">
        <div class="video-modal-loader" id="video-modal-loader">
          <div class="media-loader-spinner"></div>
          <span class="media-loader-text">Loading surprise... ✨</span>
        </div>
        <video class="video-modal-video" playsinline preload="auto">
          <source src="${videoUrl}" type="video/mp4">
        </video>
        <div class="cinematic-video-title">
          <span class="cinematic-video-title__icon">${meta.icon}</span>
          <span class="cinematic-video-title__text">${meta.title}</span>
        </div>
      </div>
    `;

    document.body.appendChild(this.overlay);

    this.card = this.overlay.querySelector('.video-modal-card');
    this.video = this.overlay.querySelector('video');
    this.loader = this.overlay.querySelector('#video-modal-loader');
    const backBtn = this.overlay.querySelector('#video-modal-back-btn');
    const skipBtn = this.overlay.querySelector('#video-modal-skip-btn');

    this.video.volume = 0.9;
    this.video.controls = false;
    this.video.addEventListener('contextmenu', e => e.preventDefault());

    backBtn.addEventListener('click', () => {
      audioManager.playPaper();
      this.close(false);
    });

    skipBtn.addEventListener('click', () => {
      audioManager.playChime();
      this.close(true);
    });

    this.skipTimer = setTimeout(() => {
      if (skipBtn && !this.isClosed) {
        skipBtn.classList.add('visible');
        if (typeof window.gsap !== 'undefined') {
          window.gsap.fromTo(skipBtn, 
            { opacity: 0, scale: 0.8, x: 10 },
            { opacity: 1, scale: 1, x: 0, duration: 0.4, ease: 'back.out(1.5)' }
          );
        }
      }
    }, 2000);

    const onMetadata = () => {
      if (!this.video || !this.card) return;
      const w = this.video.videoWidth || 16;
      const h = this.video.videoHeight || 9;
      const ratio = w / h;

      if (ratio < 0.85) {
        this.card.classList.add('video-modal-card--portrait');
        this.card.classList.remove('video-modal-card--landscape');
      } else {
        this.card.classList.add('video-modal-card--landscape');
        this.card.classList.remove('video-modal-card--portrait');
      }

      if (this.loader) {
        this.loader.style.opacity = '0';
        setTimeout(() => { if (this.loader) this.loader.style.display = 'none'; }, 300);
      }
    };

    this.video.addEventListener('loadedmetadata', onMetadata, { once: true });
    this.video.addEventListener('canplay', onMetadata, { once: true });

    const onEnded = () => {
      this.close(true);
    };

    this.video.addEventListener('ended', onEnded, { once: true });

    if (typeof window.gsap !== 'undefined') {
      window.gsap.to(this.overlay, { opacity: 1, duration: 0.4 });
      window.gsap.fromTo(this.card, 
        { scale: 0.88, opacity: 0, y: 24 },
        { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.6)' }
      );
    }

    const playPromise = this.video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        this.showTapToPlayOverlay(onEnded);
      });
    }
  }

  showTapToPlayOverlay() {
    if (!this.card) return;
    if (this.loader) this.loader.style.display = 'none';

    const tapOverlay = document.createElement('div');
    tapOverlay.className = 'video-modal-tap-overlay';
    tapOverlay.innerHTML = `
      <div class="tap-icon">▶️</div>
      <span style="font-family: var(--font-hand); font-size: 1.25rem; font-weight: bold;">Tap to Play Video ✨</span>
    `;

    this.card.appendChild(tapOverlay);

    tapOverlay.addEventListener('click', () => {
      tapOverlay.remove();
      if (this.video) {
        this.video.volume = 0.9;
        this.video.play().catch(e => console.error('[VideoModal] Manual play error:', e));
      }
    }, { once: true });
  }

  close(triggerNext = false) {
    if (this.isClosed) return;
    this.isClosed = true;
    this.isPlaying = false;

    if (this.skipTimer) {
      clearTimeout(this.skipTimer);
      this.skipTimer = null;
    }

    const finish = () => {
      this.destroy();
      if (triggerNext && typeof this.onFinishedCallback === 'function') {
        this.onFinishedCallback();
      }
    };

    if (this.overlay && typeof window.gsap !== 'undefined') {
      window.gsap.to(this.card, { scale: 0.9, opacity: 0, duration: 0.3 });
      window.gsap.to(this.overlay, {
        opacity: 0, duration: 0.35,
        onComplete: finish
      });
    } else {
      finish();
    }
  }

  destroy() {
    if (this.video) {
      this.video.pause();
      this.video.removeAttribute('src');
      this.video = null;
    }
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
    this.card = null;
    this.loader = null;
  }
}

export const videoModal = new VideoModal();
