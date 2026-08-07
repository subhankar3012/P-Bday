/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   GALLERYMODAL.JS — Fullscreen Photo Gallery & Lightbox Component
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

import { audioManager } from '../managers/AudioManager.js';
import { MEMORIES_DATA } from '../../data/memories.data.js';

export class GalleryModal {
  constructor() {
    this.overlay = null;
    this.lightboxOverlay = null;
    this.currentIndex = 0;
  }

  open() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'media-popup-overlay media-popup-overlay--gallery active';
    this.overlay.style.zIndex = '100150';

    const itemsHtml = MEMORIES_DATA.map((item, index) => `
      <div class="gallery-carousel-item ${index === 0 ? 'active-slide' : ''}" data-index="${index}">
        <img src="${item.image}" alt="${item.title}" loading="lazy">
        <div class="gallery-item-caption">${item.title}</div>
      </div>
    `).join('');

    const dotsHtml = MEMORIES_DATA.map((_, index) => `
      <div class="carousel-dot ${index === 0 ? 'active' : ''}" data-index="${index}"></div>
    `).join('');

    this.overlay.innerHTML = `
      <button class="popup-back-btn" id="gallery-popup-close" aria-label="Go back">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="20" height="20">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
      </button>

      <div class="gallery-popup-card">
        <div class="gallery-popup-header">
          <h2 class="gallery-popup-title">📸 Beautiful Memories</h2>
          <p class="gallery-popup-subtitle">Tap any photo to view full size 🌸</p>
        </div>

        <div class="gallery-carousel-wrapper" id="gallery-wrapper">
          <div class="gallery-carousel-track" id="gallery-track">
            ${itemsHtml}
          </div>
        </div>

        <div class="gallery-carousel-footer">
          <div class="carousel-counter" id="carousel-counter">1 / ${MEMORIES_DATA.length}</div>
          <div class="carousel-dots" id="carousel-dots">
            ${dotsHtml}
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.overlay);

    const closeBtn = this.overlay.querySelector('#gallery-popup-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        audioManager.playPaper();
        this.close();
      });
    }

    const wrapper = this.overlay.querySelector('#gallery-wrapper');
    const items = this.overlay.querySelectorAll('.gallery-carousel-item');
    const dots = this.overlay.querySelectorAll('.carousel-dot');
    const counter = this.overlay.querySelector('#carousel-counter');

    items.forEach(item => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.dataset.index, 10);
        audioManager.playPaper();
        this.openLightbox(idx);
      });
    });

    if (wrapper) {
      wrapper.addEventListener('scroll', () => {
        const itemWidth = items[0]?.offsetWidth || 260;
        const activeIdx = Math.round(wrapper.scrollLeft / (itemWidth + 16));
        const clampedIdx = Math.max(0, Math.min(activeIdx, MEMORIES_DATA.length - 1));

        if (counter) counter.textContent = `${clampedIdx + 1} / ${MEMORIES_DATA.length}`;

        items.forEach((it, i) => {
          it.classList.toggle('active-slide', i === clampedIdx);
        });

        dots.forEach((dot, i) => {
          dot.classList.toggle('active', i === clampedIdx);
        });
      }, { passive: true });
    }

    if (typeof window.gsap !== 'undefined') {
      const card = this.overlay.querySelector('.gallery-popup-card');
      window.gsap.fromTo(this.overlay, { opacity: 0 }, { opacity: 1, duration: 0.3 });
      window.gsap.fromTo(card,
        { scale: 0.85, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.6)' }
      );
    }
  }

  openLightbox(index) {
    this.currentIndex = index;
    const memory = MEMORIES_DATA[index];

    this.lightboxOverlay = document.createElement('div');
    this.lightboxOverlay.className = 'lightbox-overlay';
    this.lightboxOverlay.style.opacity = '1';

    this.lightboxOverlay.innerHTML = `
      <div class="lightbox-header">
        <button class="lightbox-btn" id="lightbox-close">✕ Close</button>
        <span class="lightbox-counter" id="lightbox-counter">${index + 1} / ${MEMORIES_DATA.length}</span>
      </div>

      <div class="lightbox-content">
        <button class="lightbox-nav-btn lightbox-nav-btn--prev" id="lightbox-prev">‹</button>
        <img src="${memory.image}" alt="${memory.title}" class="lightbox-img" id="lightbox-img">
        <button class="lightbox-nav-btn lightbox-nav-btn--next" id="lightbox-next">›</button>
      </div>

      <div class="lightbox-caption-bar" id="lightbox-caption">${memory.title} — ${memory.description}</div>
    `;

    document.body.appendChild(this.lightboxOverlay);

    const updateLightbox = () => {
      const item = MEMORIES_DATA[this.currentIndex];
      const img = this.lightboxOverlay.querySelector('#lightbox-img');
      const caption = this.lightboxOverlay.querySelector('#lightbox-caption');
      const cnt = this.lightboxOverlay.querySelector('#lightbox-counter');
      if (img) img.src = item.image;
      if (caption) caption.textContent = `${item.title} — ${item.description}`;
      if (cnt) cnt.textContent = `${this.currentIndex + 1} / ${MEMORIES_DATA.length}`;
    };

    this.lightboxOverlay.querySelector('#lightbox-close').addEventListener('click', () => {
      audioManager.playPaper();
      this.closeLightbox();
    });

    this.lightboxOverlay.querySelector('#lightbox-prev').addEventListener('click', () => {
      audioManager.playPaper();
      this.currentIndex = (this.currentIndex - 1 + MEMORIES_DATA.length) % MEMORIES_DATA.length;
      updateLightbox();
    });

    this.lightboxOverlay.querySelector('#lightbox-next').addEventListener('click', () => {
      audioManager.playPaper();
      this.currentIndex = (this.currentIndex + 1) % MEMORIES_DATA.length;
      updateLightbox();
    });
  }

  closeLightbox() {
    if (this.lightboxOverlay) {
      this.lightboxOverlay.remove();
      this.lightboxOverlay = null;
    }
  }

  close() {
    this.closeLightbox();
    if (!this.overlay) return;
    const finish = () => {
      if (this.overlay) {
        this.overlay.remove();
        this.overlay = null;
      }
    };

    if (typeof window.gsap !== 'undefined') {
      const card = this.overlay.querySelector('.gallery-popup-card');
      window.gsap.to(card, { scale: 0.9, opacity: 0, duration: 0.25 });
      window.gsap.to(this.overlay, { opacity: 0, duration: 0.3, onComplete: finish });
    } else {
      finish();
    }
  }
}

export const galleryModal = new GalleryModal();
