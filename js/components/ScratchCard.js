/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SCRATCHCARD.JS — Reusable Canvas Scratch Foil Component
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

import { audioManager } from '../managers/AudioManager.js';
import { stateManager } from '../core/StateManager.js';
import { APP_CONFIG } from '../../config/app.config.js';

export class ScratchCard {
  constructor(containerEl, options = {}) {
    this.container = containerEl;
    this.options = options;
    this.canvas = null;
    this.ctx = null;
    this.isScratching = false;
    this.lastX = 0;
    this.lastY = 0;
    this.tapCount = 0;
    this.moveCount = 0;
    this.revealed = stateManager.get('scratchCompleted') || false;
    this.onReveal = options.onReveal || (() => {});
  }

  init() {
    if (!this.container) return;

    if (this.revealed) {
      this.onReveal(true);
      return;
    }

    const oldCanvas = this.container.querySelector('canvas');
    if (oldCanvas) oldCanvas.remove();

    try {
      this.canvas = document.createElement('canvas');
      this.canvas.style.cssText = `
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        z-index: 10;
        touch-action: none;
        border-radius: 45% 55% 65% 35% / 40% 60% 40% 60%;
        cursor: pointer;
        will-change: opacity;
      `;
      this.container.appendChild(this.canvas);

      this.ctx = this.canvas.getContext('2d');
      const width = this.container.clientWidth || 240;
      const height = this.container.clientHeight || 280;
      this.canvas.width = width;
      this.canvas.height = height;

      this.drawSilverFoilLayer(width, height);

      this.canvas.addEventListener('mousedown', (e) => this.onPointerDown(e));
      this.canvas.addEventListener('mousemove', (e) => this.onPointerMove(e));
      this.canvas.addEventListener('mouseup', () => this.onPointerUp());
      this.canvas.addEventListener('mouseleave', () => this.onPointerUp());

      this.canvas.addEventListener('touchstart', (e) => this.onPointerDown(e), { passive: false });
      this.canvas.addEventListener('touchmove', (e) => this.onPointerMove(e), { passive: false });
      this.canvas.addEventListener('touchend', () => this.onPointerUp());
      this.canvas.addEventListener('touchcancel', () => this.onPointerUp());

    } catch (e) {
      console.warn('[ScratchCard] Canvas init error:', e);
      this.revealSurprise(false);
    }
  }

  drawSilverFoilLayer(width, height) {
    if (!this.ctx) return;

    const grad = this.ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#FAFAFA');
    grad.addColorStop(0.25, '#D4D4D4');
    grad.addColorStop(0.5, '#EBEBEB');
    grad.addColorStop(0.75, '#C0C0C0');
    grad.addColorStop(1, '#F0F0F0');

    this.ctx.fillStyle = grad;
    this.ctx.fillRect(0, 0, width, height);

    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    this.ctx.lineWidth = 4;
    for (let x = -height; x < width + height; x += 30) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x + height, height);
      this.ctx.stroke();
    }

    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    for (let i = 0; i < 40; i++) {
      const gx = Math.random() * width;
      const gy = Math.random() * height;
      this.ctx.beginPath();
      this.ctx.arc(gx, gy, 1 + Math.random() * 2, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.fillStyle = '#4A4A4A';
    this.ctx.font = 'bold 15px "Fredoka", sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('✨ Scratch to Reveal ✨', width / 2, height / 2);
  }

  getCanvasCoords(e) {
    if (!this.canvas) return { x: 0, y: 0, clientX: 0, clientY: 0 };
    const rect = this.canvas.getBoundingClientRect();
    const touch = e.touches ? e.touches[0] : e;
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
      clientX: touch.clientX,
      clientY: touch.clientY
    };
  }

  onPointerDown(e) {
    e.preventDefault();
    this.isScratching = true;
    this.moveCount = 0;

    const coords = this.getCanvasCoords(e);
    this.lastX = coords.x;
    this.lastY = coords.y;

    this.eraseSpot(coords.x, coords.y, 32);
    this.createRippleEffect(coords.clientX, coords.clientY);
    this.createSilverParticles(coords.clientX, coords.clientY);
    audioManager.playScratch();

    this.tapCount++;
    if (this.tapCount >= APP_CONFIG.games.requiredScratchTaps) {
      this.revealSurprise(false);
    }
  }

  onPointerMove(e) {
    if (!this.isScratching || !this.ctx || this.revealed) return;
    e.preventDefault();

    const coords = this.getCanvasCoords(e);

    this.ctx.globalCompositeOperation = 'destination-out';
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.lineWidth = 48;

    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
    this.ctx.lineTo(coords.x, coords.y);
    this.ctx.stroke();

    this.lastX = coords.x;
    this.lastY = coords.y;
    this.moveCount++;

    if (this.moveCount % 3 === 0) {
      audioManager.playScratch();
      this.createSilverParticles(coords.clientX, coords.clientY);
    }

    if (this.moveCount % 6 === 0) {
      this.checkScratchProgress();
    }
  }

  onPointerUp() {
    this.isScratching = false;
    this.checkScratchProgress();
  }

  eraseSpot(x, y, radius = 32) {
    if (!this.ctx) return;
    this.ctx.globalCompositeOperation = 'destination-out';
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, Math.PI * 2);
    this.ctx.fill();
    this.checkScratchProgress();
  }

  checkScratchProgress() {
    if (!this.ctx || !this.canvas || this.revealed) return;

    try {
      const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      const pixels = imageData.data;
      let clearCount = 0;

      for (let i = 3; i < pixels.length; i += 16) {
        if (pixels[i] === 0) clearCount++;
      }

      const totalSampled = pixels.length / 16;
      const pct = (clearCount / totalSampled) * 100;
      stateManager.set('scratchProgress', Math.round(pct));

      if (pct >= APP_CONFIG.games.requiredScratchProgress || this.tapCount >= APP_CONFIG.games.requiredScratchTaps) {
        this.revealSurprise(false);
      }
    } catch {
      if (this.tapCount >= APP_CONFIG.games.requiredScratchTaps) {
        this.revealSurprise(false);
      }
    }
  }

  createRippleEffect(x, y) {
    if (!this.container) return;
    const rect = this.container.getBoundingClientRect();
    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position: absolute;
      left: ${x - rect.left}px;
      top: ${y - rect.top}px;
      width: 12px;
      height: 12px;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
      z-index: 15;
    `;
    this.container.appendChild(ripple);

    if (typeof window.gsap !== 'undefined') {
      window.gsap.to(ripple, {
        width: 90, height: 90, opacity: 0,
        duration: 0.5, ease: 'power2.out',
        onComplete: () => ripple.remove()
      });
    } else {
      setTimeout(() => ripple.remove(), 400);
    }
  }

  createSilverParticles(x, y) {
    if (!this.container) return;
    const rect = this.container.getBoundingClientRect();
    const localX = x - rect.left;
    const localY = y - rect.top;

    for (let i = 0; i < 4; i++) {
      const p = document.createElement('div');
      p.style.cssText = `
        position: absolute;
        left: ${localX}px;
        top: ${localY}px;
        width: 6px;
        height: 6px;
        background: #EBEBEB;
        border-radius: 50%;
        box-shadow: 0 0 8px #FFFFFF;
        pointer-events: none;
        z-index: 16;
      `;
      this.container.appendChild(p);

      if (typeof window.gsap !== 'undefined') {
        const angle = Math.random() * Math.PI * 2;
        const dist = 18 + Math.random() * 28;
        window.gsap.to(p, {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist - 12,
          opacity: 0, scale: 0.3,
          duration: 0.65, ease: 'power2.out',
          onComplete: () => p.remove()
        });
      } else {
        setTimeout(() => p.remove(), 500);
      }
    }
  }

  revealSurprise(instant = false) {
    if (this.revealed && !instant) return;
    this.revealed = true;
    stateManager.set('scratchCompleted', true);

    if (this.canvas) {
      if (typeof window.gsap !== 'undefined' && !instant) {
        window.gsap.to(this.canvas, {
          opacity: 0, duration: 0.6, ease: 'power2.out',
          onComplete: () => this.canvas.remove()
        });
      } else {
        this.canvas.remove();
      }
    }

    this.onReveal(instant);
  }

  reset() {
    this.revealed = false;
    this.tapCount = 0;
    this.moveCount = 0;
    this.init();
  }
}
