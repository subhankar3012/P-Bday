/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   COLORQUIZ.JS — Special Color Quiz & Theme Morphing Page Module
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

import { $, $$, enableButton, disableButton, showToast } from '../utils/dom.js';
import { audioManager } from '../managers/AudioManager.js';
import { stateManager } from '../core/StateManager.js';
import { ParticleSystem } from '../components/ParticleSystem.js';

export function initColorQuizPage(pageManager, navigation) {
  const page = document.getElementById('page-quiz');
  if (!page) return;

  const continueBtn = $('[data-nav="next"]', page);
  const waveOverlay = document.getElementById('theme-wave-overlay');
  const bubbles = $$('.color-bubble', page);

  if (typeof window.gsap !== 'undefined' && bubbles.length > 0) {
    bubbles.forEach((bubble, i) => {
      const floatDuration = 3.5 + Math.random() * 2.5;
      const wobbleY = (i % 2 === 0 ? -1 : 1) * (6 + Math.random() * 6);
      const rotateDeg = (Math.random() - 0.5) * 8;

      window.gsap.to(bubble, {
        y: wobbleY,
        rotation: rotateDeg,
        duration: floatDuration,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: i * 0.15
      });
    });
  }

  const activeTheme = stateManager.get('activeTheme') || 'blush-pink';
  bubbles.forEach(b => {
    if (b.dataset.theme === activeTheme) {
      b.classList.add('selected');
    }
  });

  bubbles.forEach(bubble => {
    bubble.addEventListener('click', (e) => {
      e.preventDefault();

      const themeId = bubble.dataset.theme;
      const colorName = bubble.dataset.name || 'Blush Pink';
      const colorIcon = bubble.dataset.icon || '🌸';
      const bubbleColor = bubble.style.getPropertyValue('--bubble-color') || '#FFB6C9';

      bubbles.forEach(b => b.classList.remove('selected'));
      bubble.classList.add('selected');

      audioManager.playChime();
      audioManager.vibrate([20, 30, 40]);

      if (typeof window.gsap !== 'undefined') {
        window.gsap.fromTo(bubble,
          { scale: 0.88 },
          { scale: 1.18, duration: 0.35, ease: 'back.out(2)', onComplete: () => {
            window.gsap.to(bubble, { scale: 1, duration: 0.25 });
          }}
        );
      }

      ParticleSystem.createSparkleBurst(bubble, bubbleColor);

      triggerThemeWave(bubbleColor, () => {
        stateManager.applyTheme(themeId);
        stateManager.set('quizAnswered', true);
        stateManager.unlockPage(4);

        enableButton(continueBtn);
        showToast(`✨ Bingo! ${colorName} is Priyanka's favorite color! ${colorIcon}`);

        if (typeof window.gsap !== 'undefined' && continueBtn) {
          window.gsap.fromTo(continueBtn,
            { scale: 0.9, boxShadow: '0 0 0px var(--color-primary)' },
            { scale: 1, boxShadow: '0 0 25px var(--color-primary-glow)', duration: 0.6, ease: 'back.out(1.5)' }
          );
        }
      });
    });
  });

  function triggerThemeWave(color, onMidpoint) {
    if (!waveOverlay) {
      onMidpoint();
      return;
    }

    waveOverlay.style.setProperty('--wave-color', color);
    waveOverlay.style.visibility = 'visible';

    if (typeof window.gsap !== 'undefined') {
      const tl = window.gsap.timeline({
        onComplete: () => {
          waveOverlay.style.visibility = 'hidden';
          waveOverlay.style.opacity = '0';
        }
      });

      tl.fromTo(waveOverlay,
        { opacity: 0, scale: 0.2 },
        { opacity: 0.85, scale: 2.2, duration: 0.65, ease: 'power2.out' }
      )
      .add(() => {
        onMidpoint();
      })
      .to(waveOverlay, {
        opacity: 0,
        duration: 0.55,
        ease: 'power2.inOut'
      });
    } else {
      waveOverlay.style.opacity = '1';
      onMidpoint();
      setTimeout(() => {
        waveOverlay.style.opacity = '0';
        waveOverlay.style.visibility = 'hidden';
      }, 600);
    }
  }

  disableButton(continueBtn);

  pageManager.registerHooks(3, {
    onEnter: () => {
      if (stateManager.get('quizAnswered')) {
        enableButton(continueBtn);
      } else {
        disableButton(continueBtn);
      }
    }
  });
}
