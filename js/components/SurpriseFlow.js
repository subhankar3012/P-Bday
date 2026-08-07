/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   FINAL SURPRISE FLOW (V4 POLISH - CINEMATIC ENDING & CREDITS)
   Layer 6 — Media System Architecture & Story Conclusion
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

import { audioManager } from '../managers/AudioManager.js';
import { UI } from '../ui.js';
import { ASSETS_CONFIG } from '../../config/assets.config.js';

export class FinalSurpriseFlow {
  constructor() {
    this.container = null;
    this.audioBg = null;
    this.animFrame = null;
    this.currentStage = 'idle';
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.lastTapTime = 0;
    this.tapTimeout = null;
    this.stageTimers = [];
    this.creditsTween = null;
  }

  clearStageTimers() {
    this.stageTimers.forEach(t => clearTimeout(t));
    this.stageTimers = [];
    if (this.creditsTween) {
      this.creditsTween.kill();
      this.creditsTween = null;
    }
    this.resetContainerTransform();
  }

  resetContainerTransform() {
    if (this.container) {
      if (typeof window.gsap !== 'undefined') {
        window.gsap.set(this.container, { clearProps: 'x,y,translateX,translateY,transform' });
      }
      this.container.style.transform = 'none';
    }
  }

  /**
   * STEP 3: Begin Cinematic Flow
   */
  start() {
    if (this.container) this.cleanup();
    this.currentStage = 'transition';

    // Lock body touch scroll
    document.body.classList.add('popup-open');

    // Create master container
    this.container = document.createElement('div');
    this.container.id = 'cinematic-flow-container';
    this.container.className = 'cinematic-flow-container';
    document.body.appendChild(this.container);

    // Step 3: Fade to black 300ms
    if (typeof window.gsap !== 'undefined') {
      window.gsap.fromTo(this.container, { opacity: 0 }, {
        opacity: 1,
        duration: 0.3,
        onComplete: () => this.playJumpscare()
      });
    } else {
      this.container.style.opacity = '1';
      setTimeout(() => this.playJumpscare(), 300);
    }
  }

  /**
   * STEP 4: Funny Jumpscare Video
   */
  playJumpscare() {
    if (!this.container || this.currentStage === 'jumpscare') return;
    this.currentStage = 'jumpscare';
    this.clearStageTimers();

    this.container.innerHTML = `
      <div class="jumpscare-wrapper">
        <video id="jumpscare-video" class="jumpscare-video" playsinline preload="auto">
          <source src="${ASSETS_CONFIG.videos.jumpScare}" type="video/mp4">
        </video>
      </div>
    `;

    const video = this.container.querySelector('#jumpscare-video');
    if (!video) {
      this.playLaughSequence();
      return;
    }

    video.volume = 0.85;

    const onEnded = () => {
      video.pause();
      this.playLaughSequence();
    };

    video.addEventListener('ended', onEnded, { once: true });
    video.addEventListener('error', () => onEnded(), { once: true });

    const timer = setTimeout(() => {
      if (this.currentStage === 'jumpscare') {
        onEnded();
      }
    }, 6000);
    this.stageTimers.push(timer);

    video.play().catch(err => {
      console.warn('[FinalSurprise] Jumpscare autoplay issue:', err);
      onEnded();
    });
  }

  /**
   * STEP 5: Laugh Sequence & Emoji Rain (Executes strictly ONCE)
   */
  playLaughSequence() {
    if (!this.container || this.currentStage === 'laugh') return;
    this.currentStage = 'laugh';
    this.clearStageTimers();

    audioManager.playLaugh();

    this.container.innerHTML = `
      <div class="laugh-sequence-wrapper" id="laugh-sequence-wrapper">
        <div class="emoji-rain-container" id="emoji-rain"></div>
        <div class="laugh-card" id="laugh-card">
          <div class="laugh-emojis">😂😂😂</div>
          <h2 class="laugh-title">Got you!!</h2>
        </div>
      </div>
    `;

    // Trigger Screen Shake ONLY on laugh-card (so container translateX is NEVER modified)
    const laughCard = this.container.querySelector('#laugh-card');
    if (typeof window.gsap !== 'undefined' && laughCard) {
      window.gsap.to(laughCard, {
        x: '+=10',
        duration: 0.05,
        repeat: 8,
        yoyo: true,
        ease: 'sine.inOut',
        onComplete: () => {
          window.gsap.set(laughCard, { clearProps: 'x,transform' });
        }
      });
    }

    const rainContainer = this.container.querySelector('#emoji-rain');
    const emojis = ['😂', '🤣', '😆', '🤣', '😂', '😹'];
    
    for (let i = 0; i < 30; i++) {
      const p = document.createElement('span');
      p.className = 'falling-emoji';
      p.textContent = emojis[i % emojis.length];
      p.style.left = `${Math.random() * 95}%`;
      p.style.animationDuration = `${1.2 + Math.random() * 1.2}s`;
      p.style.animationDelay = `${Math.random() * 0.5}s`;
      p.style.fontSize = `${1.8 + Math.random() * 1.5}rem`;
      rainContainer.appendChild(p);
    }

    const timer = setTimeout(() => {
      const laughWrapper = this.container.querySelector('#laugh-sequence-wrapper');
      if (laughWrapper) laughWrapper.remove();
      this.playFakeLoading();
    }, 2100);
    this.stageTimers.push(timer);
  }

  /**
   * STEP 6: Fake Loading Screen
   */
  playFakeLoading() {
    if (!this.container || this.currentStage === 'fake-loading') return;
    this.currentStage = 'fake-loading';
    this.clearStageTimers();

    this.startSoftPianoBgm();

    this.container.innerHTML = `
      <div class="fake-loading-wrapper">
        <div class="fake-loading-card">
          <div class="fake-loading-icon">😂</div>
          <p class="fake-loading-line">Okay okay...</p>
          <p class="fake-loading-line">That wasn't your real surprise.</p>
          <div class="fake-loading-divider"></div>
          <p class="fake-loading-subline">Wait...</p>
          <p class="fake-loading-subline">Your real surprise is loading...</p>
          <div class="fake-loading-dots" id="loading-dots">Loading.</div>
        </div>
      </div>
    `;

    const dotsEl = this.container.querySelector('#loading-dots');
    let dotCount = 1;
    const interval = setInterval(() => {
      dotCount = (dotCount % 4) + 1;
      if (dotsEl) {
        dotsEl.textContent = `Loading${'.'.repeat(dotCount)}`;
      }
    }, 450);

    const timer = setTimeout(() => {
      clearInterval(interval);
      this.playRealSurpriseVideo();
    }, 2600);
    this.stageTimers.push(timer);
  }

  /**
   * Start soft background piano music for loading/ending
   */
  startSoftPianoBgm() {
    if (this.audioBg) return;
    try {
      this.audioBg = new Audio(ASSETS_CONFIG.videos.favSong);
      this.audioBg.loop = true;
      this.audioBg.volume = 0.35;
      this.audioBg.play().catch(() => {});
    } catch {
      // Ignored
    }
  }

  /**
   * STEP 7: Real Surprise Video Player
   */
  playRealSurpriseVideo() {
    if (!this.container || this.currentStage === 'real-video') return;
    this.currentStage = 'real-video';
    this.clearStageTimers();

    if (this.audioBg) {
      this.audioBg.pause();
    }

    this.container.innerHTML = `
      <div class="real-video-wrapper" id="real-video-wrapper">
        <div class="brightness-overlay" id="brightness-overlay" style="opacity: 0;"></div>

        <div class="touch-feedback-badge touch-feedback-left" id="badge-rewind">-10s ⏪</div>
        <div class="touch-feedback-badge touch-feedback-right" id="badge-forward">⏩ +10s</div>
        <div class="touch-feedback-badge touch-feedback-center" id="badge-toggle">⏸</div>

        <video id="real-surprise-video" class="real-surprise-video" playsinline preload="auto">
          <source src="${ASSETS_CONFIG.videos.realSurpriseVideo}" type="video/mp4">
        </video>

        <div class="real-video-controls">
          <button class="real-control-btn" id="real-play-btn" aria-label="Play/Pause">⏸</button>
          <div class="real-time-display" id="real-time">00:00 / 00:00</div>
          <input type="range" class="real-seek-bar" id="real-seek" min="0" max="100" value="0">
          <button class="real-control-btn" id="real-volume-btn" aria-label="Mute/Unmute">🔊</button>
        </div>
      </div>
    `;

    const video = this.container.querySelector('#real-surprise-video');
    const playBtn = this.container.querySelector('#real-play-btn');
    const timeDisplay = this.container.querySelector('#real-time');
    const seekBar = this.container.querySelector('#real-seek');
    const volumeBtn = this.container.querySelector('#real-volume-btn');
    const videoWrapper = this.container.querySelector('#real-video-wrapper');
    const badgeRewind = this.container.querySelector('#badge-rewind');
    const badgeForward = this.container.querySelector('#badge-forward');
    const badgeToggle = this.container.querySelector('#badge-toggle');

    if (!video) return;

    video.volume = 0.9;
    video.play().catch(() => {});

    const formatTime = (seconds) => {
      const m = Math.floor(seconds / 60);
      const s = Math.floor(seconds % 60);
      return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    };

    video.addEventListener('timeupdate', () => {
      if (video.duration) {
        seekBar.value = (video.currentTime / video.duration) * 100;
        timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;
      }
    });

    seekBar.addEventListener('input', () => {
      if (video.duration) {
        video.currentTime = (seekBar.value / 100) * video.duration;
      }
    });

    const togglePlay = () => {
      if (video.paused) {
        video.play();
        playBtn.textContent = '⏸';
        this.showBadge(badgeToggle, '▶');
      } else {
        video.pause();
        playBtn.textContent = '▶';
        this.showBadge(badgeToggle, '⏸');
      }
    };

    playBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePlay();
    });

    volumeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      video.muted = !video.muted;
      volumeBtn.textContent = video.muted ? '🔇' : '🔊';
    });

    let startX = 0;
    let startY = 0;

    videoWrapper.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      }
    }, { passive: true });

    videoWrapper.addEventListener('touchend', (e) => {
      if (!e.changedTouches[0]) return;
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const dist = Math.hypot(endX - startX, endY - startY);

      if (dist > 15) return;

      const now = Date.now();
      const rect = videoWrapper.getBoundingClientRect();
      const clickX = endX - rect.left;
      const width = rect.width;

      if (now - this.lastTapTime < 280) {
        clearTimeout(this.tapTimeout);
        if (clickX < width * 0.38) {
          video.currentTime = Math.max(0, video.currentTime - 10);
          this.showBadge(badgeRewind, '-10s ⏪');
        } else if (clickX > width * 0.62) {
          video.currentTime = Math.min(video.duration || 0, video.currentTime + 10);
          this.showBadge(badgeForward, '⏩ +10s');
        } else {
          togglePlay();
        }
      } else {
        this.tapTimeout = setTimeout(() => {
          togglePlay();
        }, 280);
      }
      this.lastTapTime = now;
    });

    video.addEventListener('ended', () => {
      this.fadeToWhite(() => this.playCertificateUnlock());
    }, { once: true });
  }

  showBadge(el, text) {
    if (!el) return;
    el.textContent = text;
    el.classList.add('visible');
    setTimeout(() => el.classList.remove('visible'), 600);
  }

  fadeToWhite(callback) {
    const fadeOverlay = document.createElement('div');
    fadeOverlay.className = 'cinematic-white-fade';
    this.container.appendChild(fadeOverlay);

    setTimeout(() => fadeOverlay.classList.add('active'), 20);
    setTimeout(() => callback(), 600);
  }

  /**
   * STEP 8: Certificate Unlock Achievement
   */
  playCertificateUnlock() {
    if (!this.container || this.currentStage === 'achievement') return;
    this.currentStage = 'achievement';
    this.clearStageTimers();

    audioManager.playChime?.();

    this.container.innerHTML = `
      <div class="achievement-unlock-wrapper">
        <div class="achievement-card">
          <div class="achievement-icon">🏆</div>
          <h2 class="achievement-title">Achievement Unlocked</h2>
          <p class="achievement-subtitle">The Birthday Adventure Completed ✨</p>
        </div>
      </div>
    `;

    const card = this.container.querySelector('.achievement-card');
    if (typeof window.gsap !== 'undefined') {
      window.gsap.fromTo(card,
        { scale: 0.7, opacity: 0, y: 30 },
        { scale: 1, opacity: 1, y: 0, duration: 0.6, ease: 'back.out(1.8)' }
      );
    }

    const timer = setTimeout(() => {
      this.playCertificatePage();
    }, 2200);
    this.stageTimers.push(timer);
  }

  /**
   * STEP 9 & 10: Certificate Page & Download Section
   */
  playCertificatePage() {
    if (!this.container) return;
    this.currentStage = 'certificate';
    this.clearStageTimers();

    if (this.audioBg && this.audioBg.paused) {
      this.audioBg.play().catch(() => {});
    }

    this.container.innerHTML = `
      <div class="certificate-page-wrapper">
        <canvas class="certificate-canvas" id="certificate-canvas"></canvas>

        <!-- Top-Left Floating Glass Back Button (Icon Only) -->
        <button class="popup-back-btn" id="certificate-back-btn" aria-label="Back to adventure">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>

        <div class="certificate-scroll-card">
          <div class="certificate-header">
            <h2 class="certificate-title">Congratulations! 🎉</h2>
            <p class="certificate-msg">
              You completed every chapter of this Birthday Adventure.<br>
              Thank you for exploring every surprise, memory and joke.<br>
              This certificate belongs to you. ❤️
            </p>
          </div>

          <div class="certificate-img-container">
            <img src="${ASSETS_CONFIG.images.photos.bdayCertificate}" alt="Birthday Certificate" class="certificate-img">
          </div>

          <!-- Luxury Date Badge -->
          <div class="certificate-date-badge">
            Unlocked on 16th August • Completed with ❤️
          </div>

          <div class="certificate-actions" style="display: flex; flex-direction: column; gap: 12px; width: 100%;">
            <button class="btn-claim-certificate" id="btn-claim-certificate">
              <span>📜</span>
              <span>Claim My Certificate</span>
            </button>
            <button class="btn-claim-certificate" id="btn-goto-credits">
              <span>🎬</span>
              <span>Watch Credits Again</span>
            </button>
          </div>
        </div>
      </div>
    `;

    const backBtn = this.container.querySelector('#certificate-back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        audioManager.playPaper?.();
        this.cleanup();
      });
    }

    const creditsBtn = this.container.querySelector('#btn-goto-credits');
    if (creditsBtn) {
      creditsBtn.addEventListener('click', () => {
        audioManager.playChime?.();
        this.playMovieCredits();
      });
    }

    const claimBtn = this.container.querySelector('#btn-claim-certificate');
    if (claimBtn) {
      claimBtn.addEventListener('click', () => {
        audioManager.playChime?.();

        const link = document.createElement('a');
        link.href = ASSETS_CONFIG.images.photos.bdayCertificate;
        link.download = 'Priyanka_Birthday_Certificate.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        UI.showToast('🏆 Certificate Successfully Claimed! Keep this memory forever. ❤️', 4000);

        if (typeof window.gsap !== 'undefined') {
          window.gsap.to(claimBtn, { scale: 0.92, duration: 0.1, yoyo: true, repeat: 1 });
        }

        const timer = setTimeout(() => {
          this.playMovieCredits();
        }, 2500);
        this.stageTimers.push(timer);
      });
    }

    this.initSakuraCanvas();

    const card = this.container.querySelector('.certificate-scroll-card');
    if (typeof window.gsap !== 'undefined') {
      window.gsap.fromTo(card,
        { scale: 0.85, opacity: 0, y: 25 },
        { scale: 1, opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }
      );
    }
  }

  /**
   * Floating Sakura & Butterfly Background Canvas
   */
  initSakuraCanvas() {
    const canvas = this.container?.querySelector('.certificate-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const items = [];
    const symbols = ['🌸', '🦋', '✨', '💖', '⭐'];

    for (let i = 0; i < 22; i++) {
      items.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 14 + Math.random() * 16,
        speedY: 0.3 + Math.random() * 0.8,
        speedX: (Math.random() - 0.5) * 0.6,
        symbol: symbols[i % symbols.length],
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.02
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      items.forEach(p => {
        p.y -= p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotSpeed;

        if (p.y < -30) {
          p.y = height + 20;
          p.x = Math.random() * width;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.font = `${p.size}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.symbol, 0, 0);
        ctx.restore();
      });

      this.animFrame = requestAnimationFrame(render);
    };

    render();
  }

  /**
   * STEP 12: Fixed Cinematic End Movie Credits
   */
  playMovieCredits() {
    if (!this.container || this.currentStage === 'credits') return;
    this.currentStage = 'credits';
    this.clearStageTimers();

    this.startSoftPianoBgm();

    this.container.innerHTML = `
      <div class="movie-credits-wrapper" id="movie-credits-wrapper">
        <!-- Fixed Top-Left Glass Back Button (Icon Only) -->
        <button class="popup-back-btn" id="credits-back-btn" aria-label="Back to adventure">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>

        <div class="movie-credits-track" id="credits-track">
          <div class="credits-header">
            <div class="credits-star">🌟</div>
            <h1 class="credits-main-title">THE BIRTHDAY ADVENTURE</h1>
            <div class="credits-dedication-block">
              <p class="credits-dedication-tag">Created Especially For</p>
              <h2 class="credits-birthday-girl">PRIYANKA ❤️</h2>
              <p class="credits-main-subtitle">Happy Birthday • 16th August</p>
            </div>
          </div>

          <div class="credits-divider"></div>

          <div class="credits-section">
            <div class="credits-role">CAST</div>
            <div class="credits-name">Birthday Girl</div>
            <div class="credits-subname">PRIYANKA</div>
          </div>

          <div class="credits-divider"></div>

          <div class="credits-section">
            <div class="credits-role">DIRECTOR</div>
            <div class="credits-name">Subhankar Das</div>
          </div>

          <div class="credits-section">
            <div class="credits-role">STORY</div>
            <div class="credits-name">Also Subhankar 😂</div>
          </div>

          <div class="credits-section">
            <div class="credits-role">DEVELOPER</div>
            <div class="credits-name">Also Subhankar 😂</div>
          </div>

          <div class="credits-section">
            <div class="credits-role">UI DESIGNER</div>
            <div class="credits-name">Also Subhankar 😂</div>
          </div>

          <div class="credits-section">
            <div class="credits-role">VIDEO EDITOR</div>
            <div class="credits-name">Also Subhankar 😂</div>
          </div>

          <div class="credits-section">
            <div class="credits-role">PROFESSIONAL SLEEP DESTROYER</div>
            <div class="credits-name">Definitely Subhankar 😂</div>
          </div>

          <div class="credits-section">
            <div class="credits-role">BUG CREATOR</div>
            <div class="credits-name">Also Subhankar 😭</div>
          </div>

          <div class="credits-section">
            <div class="credits-role">BUG FIXER</div>
            <div class="credits-name">Also Subhankar 😂</div>
          </div>

          <div class="credits-section">
            <div class="credits-role">COFFEE CONSUMER</div>
            <div class="credits-name">Also Subhankar ☕</div>
          </div>

          <div class="credits-divider"></div>

          <div class="credits-section">
            <div class="credits-role">SPECIAL THANKS</div>
            <div class="credits-thanks-list">
              <p>Coffee ☕</p>
              <p>Late Night Coding 🌙</p>
              <p>Cats 🐱</p>
              <p>Butterflies 🦋</p>
              <p>Memes 😂</p>
              <p>Chocolate 🍫</p>
            </div>
          </div>

          <div class="credits-divider"></div>

          <div class="credits-footer-note">
            <p>"No developers were harmed during the making of this Birthday Adventure...</p>
            <p>...although several nights of sleep disappeared." 😂❤️</p>
          </div>
        </div>
      </div>
    `;

    const backBtn = this.container.querySelector('#credits-back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        audioManager.playPaper?.();
        this.cleanup();
      });
    }

    const wrapper = this.container.querySelector('#movie-credits-wrapper');
    if (wrapper) {
      const preventScroll = (e) => {
        if (e.target.closest('#credits-back-btn')) return;
        e.preventDefault();
      };
      wrapper.addEventListener('touchmove', preventScroll, { passive: false });
      wrapper.addEventListener('wheel', preventScroll, { passive: false });
    }

    const track = this.container.querySelector('#credits-track');
    if (track) {
      requestAnimationFrame(() => {
        setTimeout(() => {
          const creditsHeight = track.offsetHeight || track.getBoundingClientRect().height || 1400;
          const viewportHeight = window.innerHeight;

          const startY = viewportHeight;
          const endY = -(creditsHeight + 60);

          const totalDistance = startY - endY;
          const duration = totalDistance / 55;

          if (typeof window.gsap !== 'undefined') {
            this.creditsTween = window.gsap.fromTo(track,
              { y: startY },
              {
                y: endY,
                duration: duration,
                ease: 'none',
                onComplete: () => {
                  const timer = setTimeout(() => {
                    this.playPostCreditsScene();
                  }, 1000);
                  this.stageTimers.push(timer);
                }
              }
            );
          } else {
            let currentY = startY;
            const step = () => {
              currentY -= (totalDistance / (duration * 60));
              if (currentY > endY) {
                track.style.transform = `translateY(${currentY}px)`;
                requestAnimationFrame(step);
              } else {
                const timer = setTimeout(() => {
                  this.playPostCreditsScene();
                }, 1000);
                this.stageTimers.push(timer);
              }
            };
            step();
          }
        }, 60);
      });
    }
  }

  /**
   * STEP 13: Separate Post-Credits Final Ending Scene
   */
  playPostCreditsScene() {
    if (!this.container || this.currentStage === 'post-credits') return;
    this.currentStage = 'post-credits';
    this.clearStageTimers();

    this.startSoftPianoBgm();

    this.container.innerHTML = `
      <div class="post-credits-scene-wrapper">
        <canvas class="certificate-canvas" id="post-credits-canvas"></canvas>

        <!-- Floating Glass Back Button (Icon Only) -->
        <button class="popup-back-btn" id="post-back-btn" aria-label="Back to adventure">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>

        <div class="post-credits-card">
          <div class="post-credits-flower">🌸</div>
          <h2 class="post-credits-title">Thank You</h2>
          <p class="post-credits-sub">for completing</p>
          <h3 class="post-credits-headline">The Birthday Adventure.</h3>
          <p class="post-credits-text">I hope this little journey</p>
          <p class="post-credits-text">made you smile.</p>
          <div class="post-credits-badge">
            Happy Birthday<br>
            <strong style="font-size: 1.4rem; color: var(--color-primary-deep, #E87890);">PRIYANKA</strong><br>
            16th August ❤️
          </div>

          <div class="post-credits-actions" style="display: flex; flex-direction: column; gap: 12px; width: 100%;">
            <button class="btn-claim-certificate" id="btn-post-adventure">
              <span>🏠</span>
              <span>Return to Adventure</span>
            </button>
            <button class="btn-claim-certificate" id="btn-post-certificate">
              <span>📜</span>
              <span>Claim My Certificate</span>
            </button>
            <button class="btn-claim-certificate" id="btn-post-replay">
              <span>🎬</span>
              <span>Watch Credits Again</span>
            </button>
          </div>
        </div>
      </div>
    `;

    const backBtn = this.container.querySelector('#post-back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        audioManager.playPaper?.();
        this.cleanup();
      });
    }

    const advBtn = this.container.querySelector('#btn-post-adventure');
    if (advBtn) {
      advBtn.addEventListener('click', () => {
        audioManager.playChime?.();
        this.cleanup();
      });
    }

    const certBtn = this.container.querySelector('#btn-post-certificate');
    if (certBtn) {
      certBtn.addEventListener('click', () => {
        audioManager.playChime?.();
        this.playCertificatePage();
      });
    }

    const replayBtn = this.container.querySelector('#btn-post-replay');
    if (replayBtn) {
      replayBtn.addEventListener('click', () => {
        audioManager.playChime?.();
        this.playMovieCredits();
      });
    }

    this.initSakuraCanvas();

    const card = this.container.querySelector('.post-credits-card');
    if (typeof window.gsap !== 'undefined') {
      window.gsap.fromTo(card,
        { scale: 0.85, opacity: 0, y: 25 },
        { scale: 1, opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }
      );
    }
  }

  cleanup() {
    this.clearStageTimers();
    this.currentStage = 'idle';

    if (this.animFrame) {
      cancelAnimationFrame(this.animFrame);
      this.animFrame = null;
    }
    if (this.audioBg) {
      this.audioBg.pause();
      this.audioBg = null;
    }
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
    document.body.classList.remove('popup-open');
  }
}

export const finalSurpriseFlow = new FinalSurpriseFlow();
export const surpriseFlow = finalSurpriseFlow;
