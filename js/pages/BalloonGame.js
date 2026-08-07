/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   BALLOONGAME.JS — Balloon Pop Game Page Module
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

import { $, enableButton, disableButton, showToast } from '../utils/dom.js';
import { audioManager } from '../managers/AudioManager.js';
import { stateManager } from '../core/StateManager.js';
import { ParticleSystem } from '../components/ParticleSystem.js';
import { BALLOON_COLORS, POP_MESSAGES } from '../../data/wishes.data.js';
import { APP_CONFIG } from '../../config/app.config.js';

export function initBalloonGamePage(pageManager, navigation) {
  const page = document.getElementById('page-games');
  if (!page) return;

  const arena = $('#balloon-game', page);
  const countDisplay = $('#balloons-count', page);
  const continueBtn = $('[data-nav="next"]', page);

  const TOTAL_BALLOONS = APP_CONFIG.games.balloonsTotal;
  let balloonsLeft = TOTAL_BALLOONS;
  let balloonElements = [];

  function updateCounter() {
    if (countDisplay) countDisplay.textContent = `${balloonsLeft} / ${TOTAL_BALLOONS}`;
  }

  function createBalloons() {
    if (!arena) return;
    arena.innerHTML = '';
    balloonElements = [];
    balloonsLeft = TOTAL_BALLOONS;
    updateCounter();

    const arenaWidth = arena.clientWidth || 340;
    const arenaHeight = arena.clientHeight || 360;

    for (let i = 0; i < TOTAL_BALLOONS; i++) {
      const balloon = document.createElement('div');
      balloon.className = 'balloon-item';

      const color = BALLOON_COLORS[i % BALLOON_COLORS.length];
      const size = 44 + Math.random() * 24;
      const left = 6 + (i * 4.4) + (Math.random() * 2 - 1);
      const top = 10 + Math.random() * (arenaHeight - size - 40);

      balloon.style.cssText = `
        left: ${left}%;
        top: ${top}px;
        width: ${size}px;
        height: ${size * 1.25}px;
      `;

      balloon.innerHTML = `
        <div class="balloon-item__body" style="background-color: ${color};">
          <div class="balloon-item__shine"></div>
        </div>
        <div class="balloon-item__knot" style="background-color: ${color};"></div>
        <div class="balloon-item__string"></div>
      `;

      arena.appendChild(balloon);
      balloonElements.push(balloon);

      if (typeof window.gsap !== 'undefined') {
        const floatDuration = 4 + Math.random() * 3.5;
        const wobbleX = (Math.random() - 0.5) * 24;
        const rotateDeg = (Math.random() - 0.5) * 12;

        window.gsap.to(balloon, {
          y: '-=18',
          x: `+=${wobbleX}`,
          rotation: rotateDeg,
          duration: floatDuration,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          delay: Math.random() * 2
        });
      }

      balloon.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        popBalloon(balloon, e.clientX || left, e.clientY || top);
      });
    }
  }

  function popBalloon(balloon, clickX, clickY) {
    if (!balloon || balloon.dataset.popped) return;
    balloon.dataset.popped = 'true';

    balloonsLeft--;
    updateCounter();

    audioManager.playPop();

    if (typeof window.gsap !== 'undefined') {
      const tl = window.gsap.timeline({
        onComplete: () => balloon.remove()
      });

      tl.to(balloon, { scale: 0.82, duration: 0.08 })
        .to(balloon, { scale: 1.35, opacity: 0, duration: 0.12, ease: 'power2.out' });
    } else {
      balloon.remove();
    }

    ParticleSystem.createParticleBurst(arena, clickX, clickY);
    createFloatingMessage(clickX, clickY);

    if (balloonsLeft <= 0) {
      onAllBalloonsPopped();
    }
  }

  function createFloatingMessage(x, y) {
    if (!arena) return;
    const arenaRect = arena.getBoundingClientRect();
    const localX = Math.max(40, Math.min(arenaRect.width - 40, x - arenaRect.left));
    const localY = Math.max(30, y - arenaRect.top);

    const msg = document.createElement('div');
    msg.textContent = POP_MESSAGES[Math.floor(Math.random() * POP_MESSAGES.length)];
    msg.style.cssText = `
      position: absolute;
      left: ${localX}px;
      top: ${localY}px;
      transform: translate(-50%, -100%);
      font-family: var(--font-display);
      font-size: 1.2rem;
      color: var(--color-text);
      background: #FFFDF9;
      padding: 4px 14px;
      border-radius: var(--radius-full);
      border: 1.5px solid var(--color-primary-soft);
      box-shadow: 0 4px 14px rgba(244, 160, 176, 0.25);
      pointer-events: none;
      z-index: 50;
    `;
    arena.appendChild(msg);

    if (typeof window.gsap !== 'undefined') {
      window.gsap.to(msg, {
        y: '-=45',
        opacity: 0,
        scale: 1.1,
        duration: 1.1,
        ease: 'power2.out',
        onComplete: () => msg.remove()
      });
    } else {
      setTimeout(() => msg.remove(), 900);
    }
  }

  function onAllBalloonsPopped() {
    stateManager.set('balloonScore', TOTAL_BALLOONS);
    stateManager.unlockPage(3);

    audioManager.playCelebrationBell();
    enableButton(continueBtn);
    showToast('All balloons popped! 🎉 Continue unlocked!');

    if (typeof window.gsap !== 'undefined' && continueBtn) {
      window.gsap.fromTo(continueBtn, 
        { scale: 0.9, boxShadow: '0 0 0px var(--color-primary)' },
        { scale: 1, boxShadow: '0 0 25px var(--color-primary-glow)', duration: 0.6, ease: 'back.out(1.5)' }
      );
    }
  }

  disableButton(continueBtn);

  pageManager.registerHooks(2, {
    onEnter: () => {
      createBalloons();
      disableButton(continueBtn);
    }
  });
}
