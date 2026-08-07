/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   PREMIUM VIDEO PLAYER — Custom Native Mobile Video Player (Favorite Song)
   Layer 6 — Media System Architecture
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

import { audioManager } from '../managers/AudioManager.js';
import { ASSETS_CONFIG } from '../../config/assets.config.js';

export class PremiumVideoPlayer {
  constructor() {
    this.container = null;
    this.video = null;
    this.wrapper = null;
    this.controls = null;
    this.progressTrack = null;
    this.progressFill = null;
    this.progressHandle = null;
    this.timeDisplay = null;
    this.playBtn = null;
    this.playIcon = null;
    this.muteBtn = null;
    this.loader = null;
    this.replayOverlay = null;

    this.autoHideTimer = null;
    this.lastTapTime = 0;
    this.lastTapSide = null;
    this.isMuted = false;
    this.previousVolume = 0.9;
  }

  /**
   * Embed native mobile custom video player into container element.
   * @param {HTMLElement} containerEl 
   * @param {string} videoUrl 
   */
  embedInto(containerEl, videoUrl = ASSETS_CONFIG.videos.favSong) {
    if (this.container) this.destroy();

    this.container = containerEl;
    if (!this.container) return;

    audioManager.pauseBgm?.();

    this.container.innerHTML = `
      <div class="custom-player-wrapper">
        <!-- Buffer / Loading Spinner -->
        <div class="custom-player-loader" id="player-loader">
          <div class="media-loader-spinner"></div>
          <span class="media-loader-text">Loading video... ✨</span>
        </div>

        <!-- Video Element -->
        <video class="custom-player-video" playsinline preload="auto">
          <source src="${videoUrl}" type="video/mp4">
        </video>

        <!-- Double Tap Gesture Ripples -->
        <div class="gesture-indicator gesture-indicator--left" id="gesture-left">
          <span style="font-size: 1.4rem;">⏪</span>
          <span>-10s</span>
        </div>
        <div class="gesture-indicator gesture-indicator--right" id="gesture-right">
          <span style="font-size: 1.4rem;">⏩</span>
          <span>+10s</span>
        </div>

        <!-- Replay Overlay (when video ends) -->
        <div class="custom-player-replay" id="replay-overlay" style="display: none;">
          <button class="replay-btn" id="replay-btn">
            <span style="font-size: 1.8rem;">🔄</span>
            <span style="font-family: var(--font-hand); font-size: 1.15rem; font-weight: bold;">Replay Video ✨</span>
          </button>
        </div>

        <!-- Native Mobile Controls Bar -->
        <div class="custom-player-controls" id="custom-controls">
          <!-- Top Row: Title -->
          <div class="mobile-player-title-bar">
            <span class="mobile-player-song-title">🎵 Tu Jaane Na</span>
            <span class="player-time-display" id="time-display">0:00 / 0:00</span>
          </div>

          <!-- Progress Scrubber -->
          <div class="player-progress-container" id="progress-container">
            <div class="player-progress-track">
              <div class="player-progress-fill" id="progress-fill"></div>
            </div>
            <div class="player-progress-handle" id="progress-handle"></div>
          </div>

          <!-- Main Touch Action Row -->
          <div class="mobile-player-actions-row">
            <!-- Left: Skip -10s -->
            <button class="mobile-ctrl-btn" id="skip-back-btn" aria-label="Skip backward 10s">
              <span>⏪</span>
            </button>

            <!-- Center: Large Play / Pause Button -->
            <button class="mobile-ctrl-btn mobile-ctrl-btn--play" id="play-btn" aria-label="Play/Pause">
              <span id="play-icon">▶</span>
            </button>

            <!-- Right: Skip +10s -->
            <button class="mobile-ctrl-btn" id="skip-fwd-btn" aria-label="Skip forward 10s">
              <span>⏩</span>
            </button>

            <!-- Volume Mute -->
            <button class="mobile-ctrl-btn" id="mute-btn" aria-label="Mute/Unmute">
              <span id="mute-icon">🔊</span>
            </button>

            <!-- Fullscreen -->
            <button class="mobile-ctrl-btn" id="fullscreen-btn" aria-label="Fullscreen">
              <span>⛶</span>
            </button>
          </div>
        </div>
      </div>
    `;

    this.wrapper = this.container.querySelector('.custom-player-wrapper');
    this.video = this.container.querySelector('video');
    this.controls = this.container.querySelector('#custom-controls');
    this.loader = this.container.querySelector('#player-loader');
    this.replayOverlay = this.container.querySelector('#replay-overlay');
    this.progressTrack = this.container.querySelector('#progress-container');
    this.progressFill = this.container.querySelector('#progress-fill');
    this.progressHandle = this.container.querySelector('#progress-handle');
    this.timeDisplay = this.container.querySelector('#time-display');
    this.playBtn = this.container.querySelector('#play-btn');
    this.playIcon = this.container.querySelector('#play-icon');
    this.muteBtn = this.container.querySelector('#mute-btn');

    const skipBackBtn = this.container.querySelector('#skip-back-btn');
    const skipFwdBtn = this.container.querySelector('#skip-fwd-btn');
    const fullscreenBtn = this.container.querySelector('#fullscreen-btn');
    const replayBtn = this.container.querySelector('#replay-btn');

    // Default volume ~90%
    this.video.volume = 0.9;
    this.video.controls = false;

    // Detect Video Orientation Dynamic Ratio
    const onMetadata = () => {
      if (!this.video || !this.wrapper) return;
      const w = this.video.videoWidth || 16;
      const h = this.video.videoHeight || 9;
      const ratio = w / h;

      if (ratio < 0.85) {
        this.wrapper.classList.add('custom-player-wrapper--portrait');
        this.wrapper.classList.remove('custom-player-wrapper--landscape');
      } else {
        this.wrapper.classList.add('custom-player-wrapper--landscape');
        this.wrapper.classList.remove('custom-player-wrapper--portrait');
      }

      this.updateTimeAndProgress();
      this.showLoader(false);
    };

    this.video.addEventListener('loadedmetadata', onMetadata, { once: true });
    this.video.addEventListener('canplay', onMetadata, { once: true });
    this.video.addEventListener('playing', () => this.showLoader(false));
    this.video.addEventListener('waiting', () => this.showLoader(true));

    // Time update & seeking
    this.video.addEventListener('timeupdate', () => this.updateTimeAndProgress());

    // Video Ended -> Show Replay
    this.video.addEventListener('ended', () => {
      this.updatePlayIcon(false);
      if (this.replayOverlay) this.replayOverlay.style.display = 'flex';
      if (this.controls) this.controls.classList.remove('hidden');
    });

    if (replayBtn) {
      replayBtn.addEventListener('click', () => {
        if (this.replayOverlay) this.replayOverlay.style.display = 'none';
        if (this.video) {
          this.video.currentTime = 0;
          this.video.play();
          this.updatePlayIcon(true);
        }
      });
    }

    // Play/Pause toggle
    if (this.playBtn) {
      this.playBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.togglePlay();
      });
    }

    // Single Tap on Video to toggle controls
    if (this.video) {
      this.video.addEventListener('click', () => {
        if (this.controls) {
          this.controls.classList.toggle('hidden');
        }
        this.resetAutoHideTimer();
      });
    }

    // Skip Back / Forward
    if (skipBackBtn) {
      skipBackBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.skip(-10);
      });
    }

    if (skipFwdBtn) {
      skipFwdBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.skip(10);
      });
    }

    // Interactive Touch Scrubber Seeking
    let isDragging = false;
    const seek = (clientX) => {
      if (!this.video || !this.video.duration || !this.progressTrack) return;
      const rect = this.progressTrack.getBoundingClientRect();
      const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      this.video.currentTime = pos * this.video.duration;
      this.updateTimeAndProgress();
    };

    if (this.progressTrack) {
      this.progressTrack.addEventListener('touchstart', (e) => {
        isDragging = true;
        if (e.touches[0]) seek(e.touches[0].clientX);
      }, { passive: true });

      this.progressTrack.addEventListener('touchmove', (e) => {
        if (isDragging && e.touches[0]) seek(e.touches[0].clientX);
      }, { passive: true });

      this.progressTrack.addEventListener('touchend', () => { isDragging = false; });

      this.progressTrack.addEventListener('mousedown', (e) => {
        isDragging = true;
        seek(e.clientX);
      });
    }

    window.addEventListener('mousemove', (e) => {
      if (isDragging) seek(e.clientX);
    });

    window.addEventListener('mouseup', () => { isDragging = false; });

    // Mute Button
    if (this.muteBtn) {
      this.muteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleMute();
      });
    }

    // Fullscreen Toggle
    if (fullscreenBtn) {
      fullscreenBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!document.fullscreenElement) {
          this.wrapper.requestFullscreen?.() || this.container.requestFullscreen?.();
        } else {
          document.exitFullscreen?.();
        }
      });
    }

    // Touch gesture setup for double-tap -10s/+10s
    this.setupGestures();

    // Start playback
    if (this.video) {
      this.video.play().then(() => {
        this.updatePlayIcon(true);
      }).catch(err => {
        console.warn('[PremiumPlayer] Autoplay prevented:', err);
        this.updatePlayIcon(false);
      });
    }

    this.resetAutoHideTimer();
  }

  showLoader(show) {
    if (this.loader) {
      this.loader.style.display = show ? 'flex' : 'none';
    }
  }

  togglePlay() {
    if (!this.video) return;
    if (this.replayOverlay && this.replayOverlay.style.display !== 'none') {
      this.replayOverlay.style.display = 'none';
    }
    if (this.video.paused) {
      this.video.play();
      this.updatePlayIcon(true);
    } else {
      this.video.pause();
      this.updatePlayIcon(false);
    }
  }

  toggleMute() {
    if (!this.video) return;
    this.isMuted = !this.isMuted;
    this.video.muted = this.isMuted;
    this.updateMuteIcon();
  }

  updateMuteIcon() {
    const icon = this.container?.querySelector('#mute-icon');
    if (!icon || !this.video) return;
    icon.textContent = (this.video.muted || this.video.volume === 0) ? '🔇' : '🔊';
  }

  skip(seconds) {
    if (!this.video || !this.video.duration) return;
    this.video.currentTime = Math.max(0, Math.min(this.video.duration, this.video.currentTime + seconds));
    this.showGestureIndicator(seconds > 0 ? 'right' : 'left');
  }

  showGestureIndicator(side) {
    const el = this.container?.querySelector(`#gesture-${side}`);
    if (!el) return;
    if (typeof window.gsap !== 'undefined') {
      window.gsap.fromTo(el,
        { opacity: 0, scale: 0.6 },
        { opacity: 1, scale: 1.1, duration: 0.25, yoyo: true, repeat: 1, ease: 'back.out(2)' }
      );
    }
  }

  updatePlayIcon(isPlaying) {
    if (this.playIcon) {
      this.playIcon.textContent = isPlaying ? '⏸' : '▶';
    }
  }

  updateTimeAndProgress() {
    if (!this.video || !this.progressFill || !this.timeDisplay) return;
    const cur = this.video.currentTime || 0;
    const dur = this.video.duration || 0;
    const pct = dur > 0 ? (cur / dur) * 100 : 0;

    this.progressFill.style.width = `${pct}%`;
    if (this.progressHandle) this.progressHandle.style.left = `${pct}%`;

    this.timeDisplay.textContent = `${this.formatTime(cur)} / ${this.formatTime(dur)}`;
  }

  formatTime(sec) {
    if (isNaN(sec) || sec < 0) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }

  resetAutoHideTimer() {
    if (this.controls) this.controls.classList.remove('hidden');

    if (this.autoHideTimer) clearTimeout(this.autoHideTimer);
    this.autoHideTimer = setTimeout(() => {
      if (this.video && !this.video.paused) {
        if (this.controls) this.controls.classList.add('hidden');
      }
    }, 3500);
  }

  setupGestures() {
    if (!this.wrapper) return;
    this.wrapper.addEventListener('touchend', (e) => {
      const now = Date.now();
      const touch = e.changedTouches[0];
      if (!touch) return;

      const rect = this.wrapper.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const side = x < rect.width / 2 ? 'left' : 'right';

      if (now - this.lastTapTime < 300 && this.lastTapSide === side) {
        if (side === 'left') this.skip(-10);
        else this.skip(10);
      }

      this.lastTapTime = now;
      this.lastTapSide = side;
    });
  }

  destroy() {
    if (this.autoHideTimer) {
      clearTimeout(this.autoHideTimer);
      this.autoHideTimer = null;
    }
    if (this.video) {
      this.video.pause();
      this.video.removeAttribute('src');
      this.video.load();
      this.video = null;
    }
    if (this.container) {
      this.container.innerHTML = '';
      this.container = null;
    }
    console.log('[PremiumPlayer] Destroyed cleanly');
  }
}

export const premiumVideoPlayer = new PremiumVideoPlayer();
