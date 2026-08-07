/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MEMORYLANE.JS — Memory Lane Page Module
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

import { $, $$ } from '../utils/dom.js';
import { audioManager } from '../managers/AudioManager.js';
import { stateManager } from '../core/StateManager.js';
import { MEMORY_CARDS_DATA } from '../../data/memories.data.js';

export function initMemoryLanePage(pageManager, navigation) {
  const page = document.getElementById('page-memories');
  if (!page) return;

  const galleryTrack = $('.gallery__track', page);
  const dots = $$('.gallery__dot', page);
  const items = $$('.gallery__item', page);
  const cards = $$('.card', page);

  let currentSlide = 0;

  cards.forEach((card, i) => {
    if (!card.querySelector('.card__back')) {
      const details = MEMORY_CARDS_DATA[i] || MEMORY_CARDS_DATA[0];
      const back = document.createElement('div');
      back.className = 'card__back';
      back.innerHTML = `
        <span class="label" style="font-size: 0.9rem;">${details.date}</span>
        <p class="body-text" style="font-weight: 600; font-family: var(--font-hand); font-size: 1.25rem; color: var(--color-text); margin: 0;">${details.caption}</p>
        <span class="hint" style="font-size: 0.8rem; margin-top: auto;">Tap to flip back 🔄</span>
      `;
      card.appendChild(back);
    }

    const flippedState = stateManager.get('flippedMemories') || {};
    if (flippedState[i]) {
      card.classList.add('flipped');
    }

    card.addEventListener('click', (e) => {
      e.stopPropagation();
      const isFlipped = card.classList.toggle('flipped');
      audioManager.playPaper();

      const currentFlipped = stateManager.get('flippedMemories') || {};
      currentFlipped[i] = isFlipped;
      stateManager.set('flippedMemories', currentFlipped);
    });
  });

  function updateDots() {
    if (!galleryTrack || dots.length === 0 || items.length === 0) return;

    const trackRect = galleryTrack.getBoundingClientRect();
    const trackCenter = trackRect.left + trackRect.width / 2;
    let closest = 0;
    let closestDist = Infinity;

    items.forEach((item, i) => {
      const rect = item.getBoundingClientRect();
      const itemCenter = rect.left + rect.width / 2;
      const dist = Math.abs(itemCenter - trackCenter);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    });

    if (closest !== currentSlide) {
      dots[currentSlide]?.classList.remove('active');
      currentSlide = closest;
      dots[currentSlide]?.classList.add('active');
    }
  }

  if (galleryTrack) {
    let scrollTimer;
    galleryTrack.addEventListener('scroll', () => {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(updateDots, 40);
    }, { passive: true });
  }

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      if (items[i]) {
        items[i].scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    });
  });

  pageManager.registerHooks(1, {
    onEnter: () => {
      if (galleryTrack) galleryTrack.scrollLeft = 0;
      currentSlide = 0;
      dots.forEach((d, i) => d.classList.toggle('active', i === 0));
      stateManager.unlockPage(2);
    }
  });
}
