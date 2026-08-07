/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   DISCLAIMERMODAL.JS — Terms & Promises Entrance Modal Component
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

import { audioManager } from '../managers/AudioManager.js';
import { stateManager } from '../core/StateManager.js';
import { DISCLAIMER_PROMISES } from '../../data/disclaimer.data.js';

export class DisclaimerModal {
  constructor() {
    this.overlay = null;
    this.animFrame = null;
  }

  show(onComplete = () => {}) {
    if (stateManager.get('disclaimerAccepted')) {
      onComplete();
      return;
    }

    this.overlay = document.createElement('div');
    this.overlay.className = 'media-popup-overlay media-popup-overlay--disclaimer active';
    this.overlay.style.zIndex = '100200';

    const itemsHtml = DISCLAIMER_PROMISES.map(promiseText => `
      <label class="disclaimer-label">
        <input type="checkbox" class="disclaimer-checkbox">
        <span class="custom-box"></span>
        <span class="label-text">${promiseText}</span>
      </label>
    `).join('');

    this.overlay.innerHTML = `
      <canvas class="disclaimer-particles-canvas" id="disclaimer-canvas"></canvas>
      <div class="disclaimer-card">
        <div class="disclaimer-card__icon">🌸✨</div>
        <h2 class="disclaimer-card__title">✧ Promise Me first... ✧</h2>
        <p class="disclaimer-card__subtitle">Please agree to these cute little terms before entering the magic 💌</p>

        <div class="disclaimer-checkboxes">
          ${itemsHtml}
        </div>

        <p class="disclaimer-note">Every chapter hides a surprise… and one very special reward is waiting for explorers who complete the entire adventure. ✨</p>

        <button class="btn-enter-story" id="btn-enter-story">✨ Enter The Story</button>
      </div>
    `;

    document.body.appendChild(this.overlay);

    const enterBtn = this.overlay.querySelector('#btn-enter-story');
    enterBtn.addEventListener('click', () => {
      audioManager.playChime();
      stateManager.set('disclaimerAccepted', true);
      this.close(onComplete);
    });

    this.initParticles();

    if (typeof window.gsap !== 'undefined') {
      const card = this.overlay.querySelector('.disclaimer-card');
      window.gsap.fromTo(this.overlay, { opacity: 0 }, { opacity: 1, duration: 0.4 });
      window.gsap.fromTo(card,
        { scale: 0.85, opacity: 0, y: 30 },
        { scale: 1, opacity: 1, y: 0, duration: 0.65, ease: 'back.out(1.5)' }
      );
    }
  }

  initParticles() {
    const canvas = this.overlay.querySelector('#disclaimer-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles = [];
    const emojis = ['🌸', '✨', '💖', '⭐', '🎈'];

    for (let i = 0; i < 15; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 14 + Math.random() * 12,
        speedY: 0.4 + Math.random() * 0.8,
        speedX: (Math.random() - 0.5) * 0.5,
        emoji: emojis[i % emojis.length],
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.015
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
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
        ctx.fillText(p.emoji, 0, 0);
        ctx.restore();
      });

      this.animFrame = requestAnimationFrame(render);
    };

    render();
  }

  close(onComplete) {
    if (this.animFrame) {
      cancelAnimationFrame(this.animFrame);
    }

    const finish = () => {
      if (this.overlay) {
        this.overlay.remove();
        this.overlay = null;
      }
      onComplete();
    };

    if (typeof window.gsap !== 'undefined') {
      const card = this.overlay.querySelector('.disclaimer-card');
      window.gsap.to(card, { scale: 0.9, opacity: 0, y: 15, duration: 0.3 });
      window.gsap.to(this.overlay, { opacity: 0, duration: 0.35, onComplete: finish });
    } else {
      finish();
    }
  }
}

export const disclaimerModal = new DisclaimerModal();
