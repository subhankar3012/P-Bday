/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   CAKECEREMONY.JS — Cake Ceremony Page Module
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

import { $, $$, enableButton, disableButton, showToast } from '../utils/dom.js';
import { audioManager } from '../managers/AudioManager.js';
import { stateManager } from '../core/StateManager.js';
import { APP_CONFIG } from '../../config/app.config.js';

export function initCakeCeremonyPage(pageManager, navigation) {
  const page = document.getElementById('page-cake');
  if (!page) return;

  const flames = $$('.cake__flame', page);
  const instructionText = $('#cake-instruction', page);
  const continueBtn = $('[data-nav="next"]', page);

  let candlesBlown = 0;
  let micStream = null;
  let audioCtx = null;
  let analyser = null;
  let micInterval = null;

  function blowCandle(flame) {
    if (!flame || flame.classList.contains('blown')) return;
    flame.classList.add('blown');
    candlesBlown++;

    audioManager.playBlow();
    createSmokeEffect(flame);

    const remaining = flames.length - candlesBlown;
    if (remaining > 0 && instructionText) {
      instructionText.textContent = `${remaining} candle${remaining > 1 ? 's' : ''} left! 🎂`;
    }

    if (candlesBlown >= flames.length) {
      onAllCandlesBlown();
    }
  }

  function createSmokeEffect(flame) {
    const rect = flame.getBoundingClientRect();
    const smoke = document.createElement('div');
    smoke.style.cssText = `
      position: absolute;
      left: ${rect.left + rect.width / 2}px;
      top: ${rect.top}px;
      width: 14px;
      height: 14px;
      background: rgba(220, 200, 190, 0.75);
      border-radius: 50%;
      filter: blur(4px);
      pointer-events: none;
      z-index: 100;
    `;
    document.body.appendChild(smoke);

    if (typeof window.gsap !== 'undefined') {
      window.gsap.to(smoke, {
        y: '-=55', x: '+=12', scale: 2.6, opacity: 0,
        duration: 1.3, ease: 'power1.out',
        onComplete: () => smoke.remove()
      });
    } else {
      setTimeout(() => smoke.remove(), 1000);
    }
  }

  function onAllCandlesBlown() {
    stopMic();
    stateManager.set('candlesBlown', flames.length);
    stateManager.unlockPage(5);

    if (instructionText) {
      instructionText.textContent = `🎉 Happy Birthday, ${APP_CONFIG.profile.birthdayName}! 🎂✨`;
    }

    audioManager.playCelebrationBell();
    enableButton(continueBtn);
    showToast('All candles blown! Happy Birthday! 🥳');

    if (typeof window.gsap !== 'undefined' && continueBtn) {
      window.gsap.fromTo(continueBtn,
        { scale: 0.9, boxShadow: '0 0 0px var(--color-primary)' },
        { scale: 1, boxShadow: '0 0 25px var(--color-primary-glow)', duration: 0.6, ease: 'back.out(1.5)' }
      );
    }
  }

  async function initMic() {
    if (candlesBlown >= flames.length) return;
    try {
      if (!navigator.mediaDevices?.getUserMedia) return;
      micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioCtx();
      const source = audioCtx.createMediaStreamSource(micStream);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      micInterval = setInterval(() => {
        if (candlesBlown >= flames.length) {
          stopMic();
          return;
        }

        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;

        if (average > 40) {
          const unblown = flames.filter(f => !f.classList.contains('blown'));
          if (unblown.length > 0) {
            blowCandle(unblown[0]);
          }
        }
      }, 140);

      showToast('Microphone active! Blow to extinguish! 🕯️');
    } catch {
      showToast('Tap each flame to blow it out! 🕯️');
    }
  }

  function stopMic() {
    if (micInterval) {
      clearInterval(micInterval);
      micInterval = null;
    }
    if (micStream) {
      micStream.getTracks().forEach(track => track.stop());
      micStream = null;
    }
    if (audioCtx) {
      audioCtx.close();
      audioCtx = null;
    }
  }

  flames.forEach(flame => {
    flame.addEventListener('click', (e) => {
      e.stopPropagation();
      blowCandle(flame);
    });

    flame.addEventListener('touchstart', (e) => {
      e.preventDefault();
      e.stopPropagation();
      blowCandle(flame);
    }, { passive: false });
  });

  disableButton(continueBtn);

  pageManager.registerHooks(4, {
    onEnter: () => {
      candlesBlown = 0;
      flames.forEach(f => f.classList.remove('blown'));
      if (instructionText) instructionText.textContent = 'Make a birthday wish... Then blow the candles. ✨';
      disableButton(continueBtn);

      setTimeout(initMic, 500);
    },
    onExit: () => {
      stopMic();
    }
  });
}
