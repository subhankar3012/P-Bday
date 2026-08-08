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
            <button class="btn-post-behind-scenes" id="btn-cert-behind-scenes">
              <span>✨</span>
              <span>Behind the Little Magic ✨</span>
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

    const certBehindBtn = this.container.querySelector('#btn-cert-behind-scenes');
    if (certBehindBtn) {
      certBehindBtn.addEventListener('click', () => {
        audioManager.playChime?.();
        this.playBehindTheScenes();
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
            <button class="btn-post-behind-scenes" id="btn-post-behind-scenes">
              <span>✨</span>
              <span>Behind the Little Magic ✨</span>
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

    const behindBtn = this.container.querySelector('#btn-post-behind-scenes');
    if (behindBtn) {
      behindBtn.addEventListener('click', () => {
        audioManager.playChime?.();
        this.playBehindTheScenes();
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

  /**
   * STEP 14: ✨ Behind the Little Magic (Secret Page)
   */
  playBehindTheScenes() {
    if (!this.container) {
      this.start();
    }
    this.currentStage = 'behind-the-scenes';
    this.clearStageTimers();

    if (this.audioBg && this.audioBg.paused) {
      this.audioBg.play().catch(() => {});
    }

    const treeData = {
      name: "P-Bday",
      type: "root",
      icon: "🌳",
      badge: "Root Project",
      desc: "The complete root workspace directory containing every chapter, media asset, style token, algorithm, and interactive component of the Birthday Adventure.",
      children: [
        {
          name: "index.html",
          type: "file",
          icon: "🌐",
          badge: "HTML Entry",
          desc: "The doorway to the entire adventure — the primary HTML structure where every chapter and popup is mounted."
        },
        {
          name: "sw.js",
          type: "file",
          icon: "⚙️",
          badge: "Service Worker",
          desc: "Service Worker handling offline asset caching, background preloading, and smooth PWA experience."
        },
        {
          name: "manifest.json",
          type: "file",
          icon: "⚙️",
          badge: "Web Manifest",
          desc: "Web App Manifest defining app branding, colors, orientation, and mobile install properties."
        },
        {
          name: "assets",
          type: "folder",
          icon: "📁",
          badge: "Media Repository",
          desc: "Central repository housing all audio melodies, birthday photo memories, background wallpapers, and video clips.",
          children: [
            {
              name: "audio",
              type: "folder",
              icon: "📁",
              badge: "Sound Tracks",
              desc: "Background audio assets and interactive sound effects for celebrations and surprise moments.",
              children: [
                { name: "pagal-aurat.mp3", type: "file", icon: "🎵", badge: "Audio Track", desc: "Interactive funny audio track played during special surprise moments." }
              ]
            },
            {
              name: "images",
              type: "folder",
              icon: "📁",
              badge: "Photo Gallery",
              desc: "High-resolution photo gallery images, ambient wallpapers, certificate templates, and glowing graphics.",
              children: [
                { name: "bg_moon_sky.jpg", type: "file", icon: "🖼️", badge: "Wallpaper", desc: "Magical night sky and glowing moon background wallpaper." },
                { name: "magical_room_bg.jpg", type: "file", icon: "🖼️", badge: "Wallpaper", desc: "Cozy room ambient background wallpaper image." },
                { name: "pink_glowing_moon.jpg", type: "file", icon: "🖼️", badge: "Wallpaper", desc: "Pink glowing moon texture for chapter transitions." },
                { name: "bday_card_master.jpg", type: "file", icon: "🖼️", badge: "Graphic Asset", desc: "Master template for birthday card artwork." },
                { name: "photo1.jpg - photo10.jpg", type: "file", icon: "🖼️", badge: "Memory Photos", desc: "Curated collection of 10 special memory photos used in Chapter 1 Memory Lane." },
                { name: "photos/B day Certificate.png", type: "file", icon: "🖼️", badge: "Certificate Asset", desc: "High-res printable Birthday Certificate image awarded at the end." }
              ]
            },
            {
              name: "videos",
              type: "folder",
              icon: "📁",
              badge: "Video Highlights",
              desc: "Full HD video files for memory slideshows, favorite songs, jump scares, and final birthday wishes.",
              children: [
                { name: "fav-song.mp4", type: "file", icon: "🎬", badge: "Music Video", desc: "The custom music video player feature for her favorite song." },
                { name: "memories.mp4", type: "file", icon: "🎬", badge: "Slideshow Video", desc: "Cinematic memory video compilation of unforgettable moments." },
                { name: "playlist.mp4", type: "file", icon: "🎬", badge: "Playlist Stream", desc: "Interactive birthday song playlist video stream." },
                { name: "jump scare.mp4", type: "file", icon: "🎬", badge: "Prank Clip", desc: "Playful prank video clip for the mini-games section." },
                { name: "surprise.mp4", type: "file", icon: "🎬", badge: "Surprise Video", desc: "The grand birthday surprise video feature." },
                { name: "wish.mp4 / wishes.mp4", type: "file", icon: "🎬", badge: "Wish Video", desc: "Heartfelt video messages and birthday wishes." }
              ]
            }
          ]
        },
        {
          name: "config",
          type: "folder",
          icon: "📁",
          badge: "Configuration",
          desc: "Centralized configuration modules storing constants, birthday profile details, and media paths.",
          children: [
            { name: "app.config.js", type: "file", icon: "⚙️", badge: "App Config", desc: "Profile data (Priyanka, Aug 16), secret passcodes, and app-wide constants." },
            { name: "assets.config.js", type: "file", icon: "⚙️", badge: "Asset Mapping", desc: "Central registry linking image, video, and audio file paths to application components." }
          ]
        },
        {
          name: "css",
          type: "folder",
          icon: "📁",
          badge: "Styling System",
          desc: "Modular CSS architecture organizing colors, typography, glassmorphism components, layouts, and animations.",
          children: [
            { name: "style.css", type: "file", icon: "🎨", badge: "Main Stylesheet", desc: "Root CSS file importing all base, component, page, and layout styles." },
            { name: "base/variables.css", type: "file", icon: "🎨", badge: "Design Tokens", desc: "Color palettes (pink/gold gradients), font definitions, spacing scale, and HSL themes." },
            { name: "base/base.css", type: "file", icon: "🎨", badge: "Global Reset", desc: "CSS resets, box-sizing rules, smooth scrolling, and default typography." },
            { name: "components/components.css", type: "file", icon: "🎨", badge: "UI Styling", desc: "Styles for buttons, glass cards, modal overlays, progress bars, and badges." },
            { name: "layout/layout.css", type: "file", icon: "🎨", badge: "Page Layout", desc: "Grid & flexbox structures, chapter container positioning, and z-index layers." },
            { name: "layout/media.css", type: "file", icon: "🎨", badge: "Responsive Queries", desc: "Mobile-first responsive adaptations, touch target sizing, and cinema mode layout." },
            { name: "pages/pages.css", type: "file", icon: "🎨", badge: "Chapter Layouts", desc: "Custom styles for each chapter (Entrance door, Memory cards, Quiz, Cake, Letter, Gift)." },
            { name: "animations/animations.css", type: "file", icon: "🎨", badge: "Keyframe FX", desc: "CSS keyframes for floating icons, glowing shimmers, pulsing candles, and particle fades." }
          ]
        },
        {
          name: "data",
          type: "folder",
          icon: "📁",
          badge: "Data Models",
          desc: "Static datasets powering the quiz questions, memory card captions, and disclaimer prank strings.",
          children: [
            { name: "disclaimer.data.js", type: "file", icon: "⚙️", badge: "Data Store", desc: "Agreement terms and humorous warning prompts for the entrance modal." },
            { name: "memories.data.js", type: "file", icon: "⚙️", badge: "Data Store", desc: "Captions, dates, and image sources for the 3D memory cards." },
            { name: "quiz.data.js", type: "file", icon: "⚙️", badge: "Data Store", desc: "Favorite color quiz questions, option themes, and morphing color schemes." },
            { name: "wishes.data.js", type: "file", icon: "⚙️", badge: "Data Store", desc: "Personal birthday notes and wish card parameters." }
          ]
        },
        {
          name: "js",
          type: "folder",
          icon: "📁",
          badge: "JavaScript Logic",
          desc: "Core application scripts, chapter page controllers, event managers, and interactive UI components.",
          children: [
            { name: "motion.js", type: "file", icon: "⚙️", badge: "Motion System", desc: "GSAP animation triggers, smooth scroll reveals, and button micro-interactions." },
            { name: "ui.js", type: "file", icon: "⚙️", badge: "UI Helpers", desc: "Toast notifications system, loading overlays, and DOM state helpers." },
            {
              name: "core",
              type: "folder",
              icon: "📁",
              badge: "Core System",
              desc: "Application bootstrapper and global reactive state manager.",
              children: [
                { name: "app.js", type: "file", icon: "⚙️", badge: "Bootstrapper", desc: "Main entry point initializing navigation, managers, chapter hooks, and service workers." },
                { name: "StateManager.js", type: "file", icon: "⚙️", badge: "State Engine", desc: "Reactive state store tracking unlocked chapters, quiz scores, and user progress." }
              ]
            },
            {
              name: "managers",
              type: "folder",
              icon: "📁",
              badge: "Event Managers",
              desc: "Decoupled managers for audio, video, asset preloading, page routing, and storage.",
              children: [
                { name: "AssetManager.js", type: "file", icon: "⚙️", badge: "Preloader", desc: "Preloads images, audio, and video assets to guarantee smooth playback without lag." },
                { name: "AudioManager.js", type: "file", icon: "⚙️", badge: "Audio Controller", desc: "Web Audio controller managing background melodies, chime effects, and blow sounds." },
                { name: "NavigationManager.js", type: "file", icon: "⚙️", badge: "Router", desc: "Manages chapter page transitions, history state, and forward/backward navigation." },
                { name: "PageManager.js", type: "file", icon: "⚙️", badge: "Page Hooks", desc: "Registers page visibility, enter/exit lifecycle hooks, and active index tracking." },
                { name: "PopupManager.js", type: "file", icon: "⚙️", badge: "Modal Manager", desc: "Handles modal open/close states, backdrop blurs, and ESC key listener." },
                { name: "StorageManager.js", type: "file", icon: "⚙️", badge: "LocalStorage", desc: "Saves unlocked chapters and user preferences in browser LocalStorage." },
                { name: "VideoManager.js", type: "file", icon: "⚙️", badge: "Video Controller", desc: "Manages video modals, cinema mode, and triggers the final surprise flow." }
              ]
            },
            {
              name: "pages",
              type: "folder",
              icon: "📁",
              badge: "Chapter Controllers",
              desc: "Page modules containing logic and event bindings for each of the 7 story chapters.",
              children: [
                { name: "EntrancePage.js", type: "file", icon: "⚙️", badge: "Chapter 0", desc: "Passcode verification door, hint modal, and entrance unlock logic." },
                { name: "MemoryLane.js", type: "file", icon: "⚙️", badge: "Chapter 1", desc: "Interactive 3D photo flip cards and gallery lightbox viewer." },
                { name: "BalloonGame.js", type: "file", icon: "⚙️", badge: "Chapter 2", desc: "Interactive balloon popping game with score counters and pop sound effects." },
                { name: "ColorQuiz.js", type: "file", icon: "⚙️", badge: "Chapter 3", desc: "Favorite color quiz with real-time dynamic CSS theme morphing." },
                { name: "CakeCeremony.js", type: "file", icon: "⚙️", badge: "Chapter 4", desc: "Cake ceremony with tap-to-extinguish candles, smoke particles, and celebration sounds." },
                { name: "LetterPage.js", type: "file", icon: "⚙️", badge: "Chapter 5", desc: "Personal birthday letter with animated typewriter text and floating heart particles." },
                { name: "FinalAdventure.js", type: "file", icon: "⚙️", badge: "Chapter 6", desc: "Final surprise hub featuring the scratch card, memories, playlist, and final gift trigger." }
              ]
            },
            {
              name: "components",
              type: "folder",
              icon: "📁",
              badge: "UI Components",
              desc: "Reusable interactive UI components, canvas animations, and modal dialogs.",
              children: [
                { name: "CertificateCard.js", type: "file", icon: "✨", badge: "Component", desc: "Render engine for the personalized birthday completion certificate." },
                { name: "Credits.js", type: "file", icon: "✨", badge: "Component", desc: "Movie credits card component displaying cast and crew details." },
                { name: "DisclaimerModal.js", type: "file", icon: "✨", badge: "Component", desc: "Prank agreement popup modal presented on entrance." },
                { name: "GalleryModal.js", type: "file", icon: "✨", badge: "Component", desc: "Full-screen photo memory gallery modal with swipe and zoom support." },
                { name: "ParticleSystem.js", type: "file", icon: "✨", badge: "Component", desc: "HTML5 canvas particle engine creating floating sakura petals and star sparkles." },
                { name: "PlaylistModal.js", type: "file", icon: "✨", badge: "Component", desc: "Interactive music player modal showcasing favorite songs." },
                { name: "PremiumVideoPlayer.js", type: "file", icon: "✨", badge: "Component", desc: "Custom player that gives her favourite song its own little theatre." },
                { name: "ScratchCard.js", type: "file", icon: "✨", badge: "Interactive Game", desc: "HTML5 canvas scratch-card mini-game revealing the secret gift." },
                { name: "SurpriseFlow.js", type: "file", icon: "✨", badge: "Storyteller Engine", desc: "The little storyteller responsible for the cinematic final surprise sequence, credits, and secret page." },
                { name: "SurpriseModal.js", type: "file", icon: "✨", badge: "Component", desc: "Video surprise modal overlay with backdrop blurring." },
                { name: "VideoModal.js", type: "file", icon: "✨", badge: "Component", desc: "Reusable video player modal wrapper." },
                { name: "WishesModal.js", type: "file", icon: "✨", badge: "Component", desc: "Popup modal displaying birthday wish cards." }
              ]
            },
            {
              name: "utils",
              type: "folder",
              icon: "📁",
              badge: "Utilities",
              desc: "Helper functions for DOM manipulation, string formatting, and mobile haptic feedback.",
              children: [
                { name: "dom.js", type: "file", icon: "⚙️", badge: "DOM Utilities", desc: "Shorthand element query selectors ($, $$), class togglers, and button enablers." },
                { name: "formatters.js", type: "file", icon: "⚙️", badge: "Formatters", desc: "String capitalization, date formatting, and time display utilities." },
                { name: "haptics.js", type: "file", icon: "⚙️", badge: "Haptics API", desc: "Triggers gentle tactile vibration feedback on mobile touch events." }
              ]
            }
          ]
        },
        {
          name: "docs",
          type: "folder",
          icon: "📁",
          badge: "Documentation",
          desc: "Project documentation, version changelogs, and task tracking files.",
          children: [
            { name: "README.md", type: "file", icon: "📄", badge: "Docs", desc: "Project overview, features list, technology stack, and installation guide." },
            { name: "CHANGELOG.md", type: "file", icon: "📄", badge: "Docs", desc: "Detailed chronological record of feature updates and bug fixes." },
            { name: "TODO.md", type: "file", icon: "📄", badge: "Docs", desc: "Developer roadmap, planned enhancements, and completion checklist." }
          ]
        }
      ]
    };

    const buildNodeHTML = (node, path = '') => {
      const isFolder = node.type === 'folder' || node.type === 'root';
      const nodePath = path ? `${path}/${node.name}` : node.name;
      const isSubFolder = depth => depth > 0;

      if (isFolder) {
        const childrenHTML = (node.children || [])
          .map(child => buildNodeHTML(child, nodePath))
          .join('');

        return `
          <div class="bts-tree-node bts-tree-folder" data-path="${nodePath}">
            <div class="bts-tree-row" data-name="${node.name}" data-badge="${node.badge}" data-desc="${encodeURIComponent(node.desc)}" data-type="folder">
              <span class="bts-tree-arrow">▼</span>
              <span class="bts-tree-icon">${node.icon}</span>
              <span class="bts-tree-name">${node.name}</span>
              <span class="bts-tree-badge">${node.badge}</span>
            </div>
            <div class="bts-tree-children">
              ${childrenHTML}
            </div>
          </div>
        `;
      } else {
        return `
          <div class="bts-tree-node bts-tree-file" data-path="${nodePath}">
            <div class="bts-tree-row" data-name="${node.name}" data-badge="${node.badge}" data-desc="${encodeURIComponent(node.desc)}" data-type="file">
              <span class="bts-tree-bullet">•</span>
              <span class="bts-tree-icon">${node.icon}</span>
              <span class="bts-tree-name">${node.name}</span>
              <span class="bts-tree-badge">${node.badge}</span>
            </div>
          </div>
        `;
      }
    };

    const treeHTML = buildNodeHTML(treeData);

    this.container.innerHTML = `
      <div class="bts-page-wrapper">
        <canvas class="certificate-canvas" id="bts-canvas"></canvas>

        <!-- Top-Left Floating Glass Back Button (Icon Only) -->
        <button class="popup-back-btn" id="bts-back-btn" aria-label="Back to post-credits">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>

        <div class="bts-container">
          <!-- Header -->
          <header class="bts-header">
            <div class="bts-flower-badge">✨ Secret Chapter ✦</div>
            <h1 class="bts-title">Behind the Little Magic ✨</h1>
            <div class="bts-sparkle-line"></div>
          </header>

          <!-- Main Intro -->
          <div class="bts-intro-card">
            <p class="bts-intro-lead">
              Every little moment in this adventure had something quietly working behind the scenes.
            </p>
            <p class="bts-intro-body">
              A little code here, a little mathematics there, some science, a few clever algorithms, and a whole lot of tiny details coming together. 🌸
            </p>
            <p class="bts-intro-body">
              This is a tiny peek behind the curtain — a place to discover the ideas, concepts, and technologies that helped bring this little birthday journey to life.
            </p>

            <div class="bts-note-box">
              <span>Don't worry, there won't be a test. 😄</span><br>
              <span class="bts-note-sub">Just a curious little tour through the magic behind the screen.</span>
            </div>
          </div>

          <!-- NEW: Organic Living Tree Architecture Canvas Section -->
          <div class="bts-organic-tree-section">
            <div class="bts-tree-header">
              <span class="bts-tree-badge">🌳 Magical Living Architecture ✦</span>
              <h2 class="bts-tree-title">The Little World Behind the Screen</h2>
              <p class="bts-tree-sub">Explore the organic living tree representing the real codebase of this adventure.</p>
            </div>

            <!-- Legend & Controls Bar -->
            <div class="bts-organic-toolbar">
              <div class="bts-organic-legend">
                <span class="legend-item"><span class="legend-dot dot-trunk"></span> 🌳 Trunk (Root)</span>
                <span class="legend-item"><span class="legend-dot dot-branch"></span> 📁 Branch (Folder)</span>
                <span class="legend-item"><span class="legend-dot dot-code"></span> ⚙️ Code Leaf</span>
                <span class="legend-item"><span class="legend-dot dot-style"></span> 🎨 Style Leaf</span>
                <span class="legend-item"><span class="legend-dot dot-media"></span> 🎬 Media Fruit</span>
              </div>
              <div class="bts-organic-controls">
                <button class="btn-tree-ctrl" id="btn-tree-reset" title="Reset View">🎯 Center Tree</button>
                <button class="btn-tree-ctrl" id="btn-tree-zoom-in" title="Zoom In">🔍 +</button>
                <button class="btn-tree-ctrl" id="btn-tree-zoom-out" title="Zoom Out">🔍 −</button>
              </div>
            </div>

            <!-- Interactive Organic Tree Canvas Viewport -->
            <div class="bts-organic-canvas-container" id="bts-organic-canvas-container">
              <canvas id="bts-organic-tree-canvas"></canvas>

              <!-- Floating Glass Info Panel Overlay -->
              <div class="bts-organic-info-card" id="bts-organic-info-card">
                <button class="bts-info-close" id="bts-info-close">✕</button>
                <div class="bts-info-body" id="bts-info-body">
                  <span class="info-placeholder-icon">🌸</span>
                  <h4 class="info-placeholder-title">Touch a Leaf or Branch</h4>
                  <p class="info-placeholder-text">Explore the organic branches, leaves, and fruits to inspect the real purpose of each project file.</p>
                </div>
              </div>

              <div class="bts-canvas-hint">Drag to Pan • Pinch / Scroll to Zoom • Tap Leaves to Inspect ✨</div>
            </div>

            <!-- Project Summary -->
            <div class="bts-tree-summary-card">
              <p class="bts-summary-line">One little website.</p>
              <p class="bts-summary-line">Many folders.</p>
              <p class="bts-summary-line">Many files.</p>
              <p class="bts-summary-line">Countless tiny decisions.</p>
              <h3 class="bts-summary-final">One very special adventure. ✨</h3>
            </div>
          </div>

          <!-- Cards Grid -->
          <div class="bts-grid">

            <!-- Card 1 -->
            <div class="bts-card">
              <div class="bts-card-header">
                <span class="bts-card-icon">💻</span>
                <h2 class="bts-card-title">The Code Behind the Magic</h2>
              </div>
              <p class="bts-card-desc">
                The foundation and dynamic logic powering every interaction, page transition, and state update across the birthday experience.
              </p>
              <div class="bts-chips">
                <span class="bts-chip">HTML</span>
                <span class="bts-chip">CSS</span>
                <span class="bts-chip">JavaScript</span>
                <span class="bts-chip">ES Modules</span>
                <span class="bts-chip">DOM</span>
                <span class="bts-chip">Events</span>
                <span class="bts-chip">State Management</span>
                <span class="bts-chip">Web APIs</span>
              </div>
            </div>

            <!-- Card 2 -->
            <div class="bts-card">
              <div class="bts-card-header">
                <span class="bts-card-icon">🌐</span>
                <h2 class="bts-card-title">The Journey Through the Internet</h2>
              </div>
              <p class="bts-card-desc">
                How packets of data travel across global networks, resolve domain names, and securely deliver this website right to your screen.
              </p>
              <div class="bts-chips">
                <span class="bts-chip">HTTP/HTTPS</span>
                <span class="bts-chip">DNS</span>
                <span class="bts-chip">IP Addresses</span>
                <span class="bts-chip">TCP/IP</span>
                <span class="bts-chip">Git</span>
                <span class="bts-chip">GitHub</span>
                <span class="bts-chip">CDN</span>
                <span class="bts-chip">Hosting</span>
              </div>
            </div>

            <!-- Card 3 -->
            <div class="bts-card">
              <div class="bts-card-header">
                <span class="bts-card-icon">📐</span>
                <h2 class="bts-card-title">A Little Mathematics</h2>
              </div>
              <p class="bts-card-desc">
                The geometric, spatial, and numeric formulas orchestrating every smooth movement, floating particle, and dynamic screen layout.
              </p>
              <div class="bts-chips">
                <span class="bts-chip">Coordinates</span>
                <span class="bts-chip">Percentages</span>
                <span class="bts-chip">Ratios</span>
                <span class="bts-chip">Geometry</span>
                <span class="bts-chip">Trigonometry</span>
                <span class="bts-chip">Vectors</span>
                <span class="bts-chip">Interpolation</span>
                <span class="bts-chip">Bézier Curves</span>
              </div>
            </div>

            <!-- Card 4 -->
            <div class="bts-card">
              <div class="bts-card-header">
                <span class="bts-card-icon">⚙️</span>
                <h2 class="bts-card-title">The Tiny Algorithms</h2>
              </div>
              <p class="bts-card-desc">
                Clever step-by-step logic managing random balloon spawns, memory card shuffling, task queues, and interactive game states.
              </p>
              <div class="bts-chips">
                <span class="bts-chip">Randomization</span>
                <span class="bts-chip">Shuffling</span>
                <span class="bts-chip">Queues</span>
                <span class="bts-chip">State Machines</span>
                <span class="bts-chip">Event Scheduling</span>
                <span class="bts-chip">Collision Detection</span>
              </div>
            </div>

            <!-- Card 5 -->
            <div class="bts-card">
              <div class="bts-card-header">
                <span class="bts-card-icon">🎨</span>
                <h2 class="bts-card-title">The Art of Making Things Move</h2>
              </div>
              <p class="bts-card-desc">
                Bringing elements to life with fluid CSS keyframes, hardware-accelerated transforms, particle physics, and smooth opacity fades.
              </p>
              <div class="bts-chips">
                <span class="bts-chip">CSS Transforms</span>
                <span class="bts-chip">Keyframe Animations</span>
                <span class="bts-chip">Easing</span>
                <span class="bts-chip">Particles</span>
                <span class="bts-chip">Opacity</span>
                <span class="bts-chip">Transitions</span>
                <span class="bts-chip">GPU Acceleration</span>
              </div>
            </div>

            <!-- Card 6 -->
            <div class="bts-card">
              <div class="bts-card-header">
                <span class="bts-card-icon">🎵</span>
                <h2 class="bts-card-title">Sound & Motion</h2>
              </div>
              <p class="bts-card-desc">
                Synchronizing background melodies, video playback, haptic vibrations, and festive sound effects for an immersive story.
              </p>
              <div class="bts-chips">
                <span class="bts-chip">Audio APIs</span>
                <span class="bts-chip">Video APIs</span>
                <span class="bts-chip">Timing</span>
                <span class="bts-chip">Synchronization</span>
                <span class="bts-chip">Preloading</span>
                <span class="bts-chip">Media Controls</span>
              </div>
            </div>

            <!-- Card 7 -->
            <div class="bts-card">
              <div class="bts-card-header">
                <span class="bts-card-icon">🧪</span>
                <h2 class="bts-card-title">A Sprinkle of Science</h2>
              </div>
              <p class="bts-card-desc">
                Applying real-world physics concepts like velocity, gravity, acceleration, and damping to make digital motion feel tactile and natural.
              </p>
              <div class="bts-chips">
                <span class="bts-chip">Physics-inspired motion</span>
                <span class="bts-chip">Velocity</span>
                <span class="bts-chip">Acceleration</span>
                <span class="bts-chip">Gravity</span>
                <span class="bts-chip">Particles</span>
                <span class="bts-chip">Damping</span>
                <span class="bts-chip">Light and Color</span>
              </div>
            </div>

            <!-- Card 8 -->
            <div class="bts-card">
              <div class="bts-card-header">
                <span class="bts-card-icon">📱</span>
                <h2 class="bts-card-title">Making It Feel Good Everywhere</h2>
              </div>
              <p class="bts-card-desc">
                Optimizing layouts, touch gesture handlers, and viewport scaling so every smartphone, tablet, and monitor delivers a flawless journey.
              </p>
              <div class="bts-chips">
                <span class="bts-chip">Responsive Design</span>
                <span class="bts-chip">Mobile Touch Interaction</span>
                <span class="bts-chip">Screen Adaptation</span>
                <span class="bts-chip">Performance Optimization</span>
              </div>
            </div>

          </div>

          <!-- Final Section -->
          <div class="bts-footer-card">
            <div class="bts-footer-flower">🌷</div>
            <p class="bts-footer-pre">And behind all of this...</p>
            <p class="bts-footer-sub">There was a simple idea:</p>
            <h2 class="bts-footer-idea">Make someone smile. 🌷</h2>
            <div class="bts-divider"></div>
            <p class="bts-footer-body">
              The code, formulas, animations and technologies were only the tools.<br>
              The real purpose was to turn a little idea into a tiny journey worth remembering.
            </p>
            <p class="bts-footer-closing">
              Made with code, curiosity, patience, and a ridiculous number of little fixes. 😄
            </p>

            <button class="btn-claim-certificate" id="bts-return-btn" style="margin-top: 24px;">
              <span>🌸</span>
              <span>Back to Post-Credits</span>
            </button>
          </div>
        </div>
      </div>
    `;

    // Bind Back / Return buttons
    const backBtn = this.container.querySelector('#bts-back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        audioManager.playPaper?.();
        this.playPostCreditsScene();
      });
    }

    const returnBtn = this.container.querySelector('#bts-return-btn');
    if (returnBtn) {
      returnBtn.addEventListener('click', () => {
        audioManager.playChime?.();
        this.playPostCreditsScene();
      });
    }

    // Initialize Organic Living Tree Canvas Engine
    this.initOrganicTreeCanvas();

    this.initSakuraCanvas();

    const wrapper = this.container.querySelector('.bts-container');
    if (typeof window.gsap !== 'undefined') {
      window.gsap.fromTo(wrapper,
        { scale: 0.92, opacity: 0, y: 30 },
        { scale: 1, opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }
      );
    }
  }

  /**
   * ORGANIC LIVING TREE CANVAS ENGINE
   */
  initOrganicTreeCanvas() {
    if (!this.container) return;

    const canvas = this.container.querySelector('#bts-organic-tree-canvas');
    const infoCard = this.container.querySelector('#bts-organic-info-card');
    const infoBody = this.container.querySelector('#bts-info-body');
    const btnClose = this.container.querySelector('#bts-info-close');
    const btnReset = this.container.querySelector('#btn-tree-reset');
    const btnZoomIn = this.container.querySelector('#btn-tree-zoom-in');
    const btnZoomOut = this.container.querySelector('#btn-tree-zoom-out');

    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const rect = parent.getBoundingClientRect();
      canvas.width = rect.width * (window.devicePixelRatio || 1);
      canvas.height = rect.height * (window.devicePixelRatio || 1);
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const rawData = {
      id: 'root',
      name: 'P-Bday',
      type: 'root',
      icon: '🌳',
      badge: 'Root Workspace',
      desc: 'The complete root workspace directory containing every chapter, media asset, style token, algorithm, and interactive component of the Birthday Adventure.',
      expanded: true,
      growth: 1,
      targetGrowth: 1,
      children: [
        {
          id: 'index-html',
          name: 'index.html',
          type: 'html',
          icon: '🌐',
          badge: 'HTML Entry',
          desc: 'The doorway to the entire adventure — the primary HTML structure where every chapter and popup is mounted.'
        },
        {
          id: 'sw-js',
          name: 'sw.js',
          type: 'code',
          icon: '⚙️',
          badge: 'Service Worker',
          desc: 'Service Worker handling offline asset caching, background preloading, and smooth PWA experience.'
        },
        {
          id: 'manifest-json',
          name: 'manifest.json',
          type: 'config',
          icon: '⚙️',
          badge: 'Web Manifest',
          desc: 'Web App Manifest defining app branding, colors, orientation, and mobile install properties.'
        },
        {
          id: 'assets',
          name: 'assets',
          type: 'folder',
          icon: '📁',
          badge: 'Media Repository',
          desc: 'Central repository housing all audio melodies, birthday photo memories, background wallpapers, and video clips.',
          expanded: true,
          growth: 1,
          targetGrowth: 1,
          children: [
            {
              id: 'assets-audio',
              name: 'audio',
              type: 'folder',
              icon: '📁',
              badge: 'Sound Tracks',
              desc: 'Background audio assets and interactive sound effects for celebrations and surprise moments.',
              expanded: true,
              growth: 1,
              targetGrowth: 1,
              children: [
                { id: 'pagal-aurat', name: 'pagal-aurat.mp3', type: 'media', icon: '🎵', badge: 'Audio Track', desc: 'Interactive funny audio track played during special surprise moments.' }
              ]
            },
            {
              id: 'assets-images',
              name: 'images',
              type: 'folder',
              icon: '📁',
              badge: 'Photo Gallery',
              desc: 'High-resolution photo gallery images, ambient wallpapers, certificate templates, and glowing graphics.',
              expanded: true,
              growth: 1,
              targetGrowth: 1,
              children: [
                { id: 'bg-moon', name: 'bg_moon_sky.jpg', type: 'media', icon: '🖼️', badge: 'Wallpaper', desc: 'Magical night sky and glowing moon background wallpaper.' },
                { id: 'room-bg', name: 'magical_room_bg.jpg', type: 'media', icon: '🖼️', badge: 'Wallpaper', desc: 'Cozy room ambient background wallpaper image.' },
                { id: 'pink-moon', name: 'pink_glowing_moon.jpg', type: 'media', icon: '🖼️', badge: 'Wallpaper', desc: 'Pink glowing moon texture for chapter transitions.' },
                { id: 'photos-1-10', name: 'photo1-10.jpg', type: 'media', icon: '🖼️', badge: 'Memory Photos', desc: 'Curated collection of 10 special memory photos used in Chapter 1 Memory Lane.' },
                { id: 'cert-img', name: 'B day Certificate.png', type: 'media', icon: '🖼️', badge: 'Certificate Asset', desc: 'High-res printable Birthday Certificate image awarded at the end.' }
              ]
            },
            {
              id: 'assets-videos',
              name: 'videos',
              type: 'folder',
              icon: '📁',
              badge: 'Video Highlights',
              desc: 'Full HD video files for memory slideshows, favorite songs, jump scares, and final birthday wishes.',
              expanded: true,
              growth: 1,
              targetGrowth: 1,
              children: [
                { id: 'fav-song', name: 'fav-song.mp4', type: 'media', icon: '🎬', badge: 'Music Video', desc: 'The custom music video player feature for her favorite song.' },
                { id: 'memories-vid', name: 'memories.mp4', type: 'media', icon: '🎬', badge: 'Slideshow Video', desc: 'Cinematic memory video compilation of unforgettable moments.' },
                { id: 'playlist-vid', name: 'playlist.mp4', type: 'media', icon: '🎬', badge: 'Playlist Stream', desc: 'Interactive birthday song playlist video stream.' },
                { id: 'surprise-vid', name: 'surprise.mp4', type: 'media', icon: '🎬', badge: 'Surprise Video', desc: 'The grand birthday surprise video feature.' },
                { id: 'wishes-vid', name: 'wish/wishes.mp4', type: 'media', icon: '🎬', badge: 'Wish Video', desc: 'Heartfelt video messages and birthday wishes.' }
              ]
            }
          ]
        },
        {
          id: 'config',
          name: 'config',
          type: 'folder',
          icon: '📁',
          badge: 'Configuration',
          desc: 'Centralized configuration modules storing constants, birthday profile details, and media paths.',
          expanded: true,
          growth: 1,
          targetGrowth: 1,
          children: [
            { id: 'app-config', name: 'app.config.js', type: 'config', icon: '⚙️', badge: 'App Config', desc: 'Profile data (Priyanka, Aug 16), secret passcodes, and app-wide constants.' },
            { id: 'assets-config', name: 'assets.config.js', type: 'config', icon: '⚙️', badge: 'Asset Mapping', desc: 'Central registry linking image, video, and audio file paths to application components.' }
          ]
        },
        {
          id: 'css',
          name: 'css',
          type: 'folder',
          icon: '📁',
          badge: 'Styling System',
          desc: 'Modular CSS architecture organizing colors, typography, glassmorphism components, layouts, and animations.',
          expanded: true,
          growth: 1,
          targetGrowth: 1,
          children: [
            { id: 'style-css', name: 'style.css', type: 'style', icon: '🎨', badge: 'Main Stylesheet', desc: 'Root CSS file importing all base, component, page, and layout styles.' },
            { id: 'css-base', name: 'base/variables.css', type: 'style', icon: '🎨', badge: 'Design Tokens', desc: 'Color palettes (pink/gold gradients), font definitions, spacing scale, and HSL themes.' },
            { id: 'css-components', name: 'components.css', type: 'style', icon: '🎨', badge: 'UI Styling', desc: 'Styles for buttons, glass cards, modal overlays, progress bars, and badges.' },
            { id: 'css-layout', name: 'layout & media.css', type: 'style', icon: '🎨', badge: 'Responsive Layout', desc: 'Grid & flexbox structures, chapter container positioning, and mobile queries.' },
            { id: 'css-animations', name: 'animations.css', type: 'style', icon: '🎨', badge: 'Keyframe FX', desc: 'CSS keyframes for floating icons, glowing shimmers, pulsing candles, and particle fades.' }
          ]
        },
        {
          id: 'data',
          name: 'data',
          type: 'folder',
          icon: '📁',
          badge: 'Data Models',
          desc: 'Static datasets powering the quiz questions, memory card captions, and disclaimer prank strings.',
          expanded: true,
          growth: 1,
          targetGrowth: 1,
          children: [
            { id: 'disclaimer-data', name: 'disclaimer.data.js', type: 'code', icon: '⚙️', badge: 'Data Store', desc: 'Agreement terms and humorous warning prompts for the entrance modal.' },
            { id: 'memories-data', name: 'memories.data.js', type: 'code', icon: '⚙️', badge: 'Data Store', desc: 'Captions, dates, and image sources for the 3D memory cards.' },
            { id: 'quiz-data', name: 'quiz.data.js', type: 'code', icon: '⚙️', badge: 'Data Store', desc: 'Favorite color quiz questions, option themes, and morphing color schemes.' },
            { id: 'wishes-data', name: 'wishes.data.js', type: 'code', icon: '⚙️', badge: 'Data Store', desc: 'Personal birthday notes and wish card parameters.' }
          ]
        },
        {
          id: 'js',
          name: 'js',
          type: 'folder',
          icon: '📁',
          badge: 'JavaScript Logic',
          desc: 'Core application scripts, chapter page controllers, event managers, and interactive UI components.',
          expanded: true,
          growth: 1,
          targetGrowth: 1,
          children: [
            { id: 'motion-js', name: 'motion.js', type: 'code', icon: '⚙️', badge: 'Motion System', desc: 'GSAP animation triggers, smooth scroll reveals, and button micro-interactions.' },
            { id: 'ui-js', name: 'ui.js', type: 'code', icon: '⚙️', badge: 'UI Helpers', desc: 'Toast notifications system, loading overlays, and DOM state helpers.' },
            {
              id: 'js-core',
              name: 'core',
              type: 'folder',
              icon: '📁',
              badge: 'Core Architecture',
              desc: 'Application bootstrapper and global reactive state manager.',
              expanded: true,
              growth: 1,
              targetGrowth: 1,
              children: [
                { id: 'app-js', name: 'app.js', type: 'code', icon: '⚙️', badge: 'Bootstrapper', desc: 'Main entry point initializing navigation, managers, chapter hooks, and service workers.' },
                { id: 'state-mgr', name: 'StateManager.js', type: 'code', icon: '⚙️', badge: 'State Engine', desc: 'Reactive state store tracking unlocked chapters, quiz scores, and user progress.' }
              ]
            },
            {
              id: 'js-managers',
              name: 'managers',
              type: 'folder',
              icon: '📁',
              badge: 'Event Managers',
              desc: 'Decoupled managers for audio, video, asset preloading, page routing, and storage.',
              expanded: true,
              growth: 1,
              targetGrowth: 1,
              children: [
                { id: 'asset-mgr', name: 'AssetManager.js', type: 'code', icon: '⚙️', badge: 'Preloader', desc: 'Preloads images, audio, and video assets to guarantee smooth playback without lag.' },
                { id: 'audio-mgr', name: 'AudioManager.js', type: 'code', icon: '⚙️', badge: 'Audio Controller', desc: 'Web Audio controller managing background melodies, chime effects, and blow sounds.' },
                { id: 'nav-mgr', name: 'NavigationManager.js', type: 'code', icon: '⚙️', badge: 'Router', desc: 'Manages chapter page transitions, history state, and forward/backward navigation.' },
                { id: 'page-mgr', name: 'PageManager.js', type: 'code', icon: '⚙️', badge: 'Page Hooks', desc: 'Registers page visibility, enter/exit lifecycle hooks, and active index tracking.' },
                { id: 'popup-mgr', name: 'PopupManager.js', type: 'code', icon: '⚙️', badge: 'Modal Manager', desc: 'Handles modal open/close states, backdrop blurs, and ESC key listener.' },
                { id: 'video-mgr', name: 'VideoManager.js', type: 'code', icon: '⚙️', badge: 'Video Controller', desc: 'Manages video modals, cinema mode, and triggers the final surprise flow.' }
              ]
            },
            {
              id: 'js-pages',
              name: 'pages',
              type: 'folder',
              icon: '📁',
              badge: 'Chapter Controllers',
              desc: 'Page modules containing logic and event bindings for each of the 7 story chapters.',
              expanded: true,
              growth: 1,
              targetGrowth: 1,
              children: [
                { id: 'page-entrance', name: 'EntrancePage.js', type: 'code', icon: '⚙️', badge: 'Chapter 0', desc: 'Passcode verification door, hint modal, and entrance unlock logic.' },
                { id: 'page-memory', name: 'MemoryLane.js', type: 'code', icon: '⚙️', badge: 'Chapter 1', desc: 'Interactive 3D photo flip cards and gallery lightbox viewer.' },
                { id: 'page-balloon', name: 'BalloonGame.js', type: 'code', icon: '⚙️', badge: 'Chapter 2', desc: 'Interactive balloon popping game with score counters and pop sound effects.' },
                { id: 'page-quiz', name: 'ColorQuiz.js', type: 'code', icon: '⚙️', badge: 'Chapter 3', desc: 'Favorite color quiz with real-time dynamic CSS theme morphing.' },
                { id: 'page-cake', name: 'CakeCeremony.js', type: 'code', icon: '⚙️', badge: 'Chapter 4', desc: 'Cake ceremony with tap-to-extinguish candles, smoke particles, and celebration sounds.' },
                { id: 'page-letter', name: 'LetterPage.js', type: 'code', icon: '⚙️', badge: 'Chapter 5', desc: "Personal birthday letter with animated typewriter text and floating heart particles." },
                { id: 'page-final', name: 'FinalAdventure.js', type: 'code', icon: '⚙️', badge: 'Chapter 6', desc: 'Final surprise hub featuring the scratch card, memories, playlist, and final gift trigger.' }
              ]
            },
            {
              id: 'js-components',
              name: 'components',
              type: 'folder',
              icon: '📁',
              badge: 'UI Components',
              desc: 'Reusable interactive UI components, canvas animations, and modal dialogs.',
              expanded: true,
              growth: 1,
              targetGrowth: 1,
              children: [
                { id: 'comp-cert', name: 'CertificateCard.js', type: 'code', icon: '✨', badge: 'Component', desc: 'Render engine for the personalized birthday completion certificate.' },
                { id: 'comp-credits', name: 'Credits.js', type: 'code', icon: '✨', badge: 'Component', desc: 'Movie credits card component displaying cast and crew details.' },
                { id: 'comp-gallery', name: 'GalleryModal.js', type: 'code', icon: '✨', badge: 'Component', desc: 'Full-screen photo memory gallery modal with swipe and zoom support.' },
                { id: 'comp-particles', name: 'ParticleSystem.js', type: 'code', icon: '✨', badge: 'Component', desc: 'HTML5 canvas particle engine creating floating sakura petals and star sparkles.' },
                { id: 'comp-playlist', name: 'PlaylistModal.js', type: 'code', icon: '✨', badge: 'Component', desc: 'Interactive music player modal showcasing favorite songs.' },
                { id: 'comp-player', name: 'PremiumVideoPlayer.js', type: 'code', icon: '✨', badge: 'Component', desc: 'Custom player that gives her favourite song its own little theatre.' },
                { id: 'comp-scratch', name: 'ScratchCard.js', type: 'code', icon: '✨', badge: 'Interactive Game', desc: 'HTML5 canvas scratch-card mini-game revealing the secret gift.' },
                { id: 'comp-surprise', name: 'SurpriseFlow.js', type: 'code', icon: '✨', badge: 'Storyteller Engine', desc: 'The little storyteller responsible for the cinematic final surprise sequence, credits, and secret page.' }
              ]
            }
          ]
        },
        {
          id: 'docs',
          name: 'docs',
          type: 'folder',
          icon: '📁',
          badge: 'Documentation',
          desc: 'Project documentation, version changelogs, and task tracking files.',
          expanded: true,
          growth: 1,
          targetGrowth: 1,
          children: [
            { id: 'readme-md', name: 'README.md', type: 'doc', icon: '📄', badge: 'Docs', desc: 'Project overview, features list, technology stack, and installation guide.' },
            { id: 'changelog-md', name: 'CHANGELOG.md', type: 'doc', icon: '📄', badge: 'Docs', desc: 'Detailed chronological record of feature updates and bug fixes.' }
          ]
        }
      ]
    };

    let panX = 0;
    let panY = 120;
    let zoom = 0.85;
    let isDragging = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let activeNode = null;
    let time = 0;

    const particles = Array.from({ length: 35 }, () => ({
      x: (Math.random() - 0.5) * 1200,
      y: (Math.random() - 0.5) * 1200,
      radius: 1.5 + Math.random() * 3,
      alpha: 0.3 + Math.random() * 0.5,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: (Math.random() - 0.5) * 0.4
    }));

    function calculatePositions(node, parentX = 0, parentY = 240, startAngle = -Math.PI / 2, angleSpan = Math.PI * 1.25, depth = 0) {
      node.x = parentX;
      node.y = parentY;
      node.depth = depth;

      if (!node.children || node.children.length === 0 || !node.expanded) return;

      const count = node.children.length;
      const len = depth === 0 ? 170 : depth === 1 ? 130 : 90;
      const thickness = depth === 0 ? 32 : depth === 1 ? 18 : depth === 2 ? 10 : 5;

      node.children.forEach((child, i) => {
        const fraction = count === 1 ? 0.5 : i / (count - 1);
        const angle = startAngle - angleSpan / 2 + fraction * angleSpan + (Math.sin(i * 3 + depth) * 0.08);

        const targetX = parentX + Math.cos(angle) * len * (child.growth || 1);
        const targetY = parentY + Math.sin(angle) * len * (child.growth || 1);

        child.parentX = parentX;
        child.parentY = parentY;
        child.angle = angle;
        child.thickness = thickness;

        const midX = (parentX + targetX) / 2;
        const midY = (parentY + targetY) / 2;
        const perpOffset = (i % 2 === 0 ? 22 : -22) * (1 - depth * 0.2);
        child.cpX = midX - Math.sin(angle) * perpOffset;
        child.cpY = midY + Math.cos(angle) * perpOffset;

        calculatePositions(child, targetX, targetY, angle, Math.PI / (1.8 + depth * 0.5), depth + 1);
      });
    }

    const renderLoop = () => {
      if (this.currentStage !== 'behind-the-scenes') return;

      time += 0.016;
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);

      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);

      ctx.translate(width / 2 + panX, height / 2 + panY);
      ctx.scale(zoom, zoom);

      calculatePositions(rawData, 0, 180, -Math.PI / 2, Math.PI * 1.3, 0);

      // Render Fireflies
      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x > 700) p.x = -700;
        if (p.x < -700) p.x = 700;
        if (p.y > 700) p.y = -700;
        if (p.y < -700) p.y = 700;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 215, 180, ${p.alpha * (0.6 + 0.4 * Math.sin(time * 2 + p.x))})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#FFD54F';
        ctx.fill();
      });
      ctx.shadowBlur = 0;

      // Draw Organic Curved Branches
      const drawBranches = (node) => {
        if (!node.children || !node.expanded) return;

        node.children.forEach(child => {
          const sway = Math.sin(time * 1.5 + child.x * 0.01) * (child.depth * 2);
          const childX = child.x + sway;
          const childY = child.y;

          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.quadraticCurveTo(child.cpX, child.cpY, childX, childY);

          const grad = ctx.createLinearGradient(node.x, node.y, childX, childY);
          grad.addColorStop(0, node.depth === 0 ? '#6D4C41' : '#8D6E63');
          grad.addColorStop(0.5, '#AB47BC');
          grad.addColorStop(1, '#EC407A');

          ctx.strokeStyle = grad;
          ctx.lineWidth = Math.max(2, child.thickness * (child.growth || 1));
          ctx.lineCap = 'round';
          ctx.shadowBlur = 12;
          ctx.shadowColor = 'rgba(255, 126, 185, 0.45)';
          ctx.stroke();
          ctx.shadowBlur = 0;

          drawBranches(child);
        });
      };
      drawBranches(rawData);

      // Draw Leaves, Fruits, Trunk Nodes
      const drawNodes = (node) => {
        const sway = Math.sin(time * 1.5 + node.x * 0.01) * (node.depth * 2);
        const nx = node.x + sway;
        const ny = node.y;
        const isHovered = activeNode === node;

        if (node.type === 'root') {
          ctx.beginPath();
          ctx.arc(nx, ny, 32, 0, Math.PI * 2);
          ctx.fillStyle = '#8D6E63';
          ctx.shadowBlur = isHovered ? 25 : 15;
          ctx.shadowColor = '#FFD54F';
          ctx.fill();

          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 3;
          ctx.stroke();

          ctx.font = '22px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(node.icon, nx, ny);

          ctx.font = 'bold 15px sans-serif';
          ctx.fillStyle = '#3D2B1F';
          ctx.fillText(node.name, nx, ny + 46);
        } else if (node.type === 'folder') {
          ctx.beginPath();
          ctx.arc(nx, ny, isHovered ? 22 : 18, 0, Math.PI * 2);
          ctx.fillStyle = '#AB47BC';
          ctx.shadowBlur = isHovered ? 20 : 10;
          ctx.shadowColor = '#E87890';
          ctx.fill();

          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 2.5;
          ctx.stroke();

          ctx.font = '14px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(node.icon, nx, ny);

          ctx.font = 'bold 13px sans-serif';
          ctx.fillStyle = '#4A148C';
          ctx.fillText(node.name, nx, ny + 30);
        } else {
          const isMedia = node.type === 'media';
          const isStyle = node.type === 'style';
          const isCode = node.type === 'code';

          ctx.beginPath();
          if (isMedia) {
            ctx.arc(nx, ny, isHovered ? 16 : 13, 0, Math.PI * 2);
            ctx.fillStyle = '#FFA726';
            ctx.shadowColor = '#FF9800';
          } else {
            ctx.arc(nx, ny, isHovered ? 14 : 11, 0, Math.PI * 2);
            ctx.fillStyle = isStyle ? '#EC407A' : isCode ? '#66BB6A' : '#4FC3F7';
            ctx.shadowColor = isStyle ? '#E91E63' : isCode ? '#4CAF50' : '#03A9F4';
          }

          ctx.shadowBlur = isHovered ? 22 : 10;
          ctx.fill();

          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.font = '11px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(node.icon, nx, ny);

          ctx.font = `${isHovered ? 'bold 12px' : '11px'} sans-serif`;
          ctx.fillStyle = '#3D2B1F';
          ctx.fillText(node.name, nx, ny + 24);
        }

        ctx.shadowBlur = 0;

        if (node.expanded && node.children) {
          node.children.forEach(child => drawNodes(child));
        }
      };
      drawNodes(rawData);

      ctx.restore();

      requestAnimationFrame(renderLoop);
    };
    renderLoop();

    const findNodeAt = (worldX, worldY, node) => {
      const dx = worldX - node.x;
      const dy = worldY - node.y;
      const hitRadius = node.type === 'root' ? 36 : node.type === 'folder' ? 24 : 18;

      if (dx * dx + dy * dy <= hitRadius * hitRadius) {
        return node;
      }

      if (node.expanded && node.children) {
        for (const child of node.children) {
          const found = findNodeAt(worldX, worldY, child);
          if (found) return found;
        }
      }
      return null;
    };

    canvas.addEventListener('mousedown', (e) => {
      isDragging = true;
      dragStartX = e.clientX - panX;
      dragStartY = e.clientY - panY;
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      panX = e.clientX - dragStartX;
      panY = e.clientY - dragStartY;
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        dragStartX = e.touches[0].clientX - panX;
        dragStartY = e.touches[0].clientY - panY;
      }
    }, { passive: true });

    canvas.addEventListener('touchmove', (e) => {
      if (isDragging && e.touches.length === 1) {
        panX = e.touches[0].clientX - dragStartX;
        panY = e.touches[0].clientY - dragStartY;
      }
    }, { passive: true });

    canvas.addEventListener('touchend', () => {
      isDragging = false;
    });

    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      zoom = Math.min(Math.max(0.4, zoom * zoomFactor), 2.2);
    }, { passive: false });

    canvas.addEventListener('click', (e) => {
      const rect = canvas.getBoundingClientRect();
      const width = canvas.width / (window.devicePixelRatio || 1);
      const height = canvas.height / (window.devicePixelRatio || 1);

      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;

      const worldX = (screenX - width / 2 - panX) / zoom;
      const worldY = (screenY - height / 2 - panY) / zoom;

      const hit = findNodeAt(worldX, worldY, rawData);
      if (hit) {
        audioManager.playChime?.();
        activeNode = hit;

        if (hit.type === 'folder') {
          hit.expanded = !hit.expanded;
        }

        infoCard.style.display = 'block';
        infoBody.innerHTML = `
          <div class="info-panel-content">
            <div class="info-panel-header">
              <span class="info-panel-icon">${hit.icon}</span>
              <div>
                <h3 class="info-panel-title">${hit.name}</h3>
                <span class="info-panel-badge">${hit.badge}</span>
              </div>
            </div>
            <p class="info-panel-desc">${hit.desc}</p>
          </div>
        `;

        if (typeof window.gsap !== 'undefined') {
          window.gsap.fromTo(infoCard, { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.5)' });
        }
      }
    });

    if (btnReset) {
      btnReset.addEventListener('click', () => {
        audioManager.playChime?.();
        panX = 0;
        panY = 120;
        zoom = 0.85;
      });
    }

    if (btnZoomIn) {
      btnZoomIn.addEventListener('click', () => {
        audioManager.playChime?.();
        zoom = Math.min(2.2, zoom * 1.25);
      });
    }

    if (btnZoomOut) {
      btnZoomOut.addEventListener('click', () => {
        audioManager.playChime?.();
        zoom = Math.max(0.4, zoom / 1.25);
      });
    }

    if (btnClose) {
      btnClose.addEventListener('click', () => {
        audioManager.playPaper?.();
        infoCard.style.display = 'none';
      });
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

