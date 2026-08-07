/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ENTRANCEPAGE.JS — The Secret Entrance Page Module
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

import { $, enableButton, disableButton } from '../utils/dom.js';
import { audioManager } from '../managers/AudioManager.js';
import { stateManager } from '../core/StateManager.js';
import { APP_CONFIG } from '../../config/app.config.js';

export function initEntrancePage(pageManager, navigation) {
  const page = document.getElementById('page-entrance');
  if (!page) return;

  const passcodeInput = $('#passcode-input', page);
  const unlockBtn = $('#unlock-btn', page);
  const errorMsg = $('#passcode-error', page);
  const envelope = $('#entrance-envelope', page);

  let attemptCount = 0;
  let isFrozen = false;

  function attemptUnlock() {
    if (isFrozen) return;
    const value = passcodeInput?.value.trim();
    if (!value) {
      if (errorMsg) errorMsg.textContent = 'Please enter the code 🔑';
      if (passcodeInput) {
        passcodeInput.focus();
        shakeInput();
      }
      return;
    }

    if (value === APP_CONFIG.profile.passcode) {
      onCorrectPasscode();
    } else {
      onWrongPasscode();
    }
  }

  function shakeInput() {
    if (!passcodeInput) return;
    if (typeof window.gsap !== 'undefined') {
      window.gsap.to(passcodeInput, {
        x: 10, duration: 0.08, repeat: 5, yoyo: true, ease: 'sine.inOut',
        onComplete: () => { window.gsap.set(passcodeInput, { x: 0 }); }
      });
    }
    audioManager.vibrate([30, 30]);
  }

  function shakeScreen() {
    const card = $('.card', page) || page;
    if (typeof window.gsap !== 'undefined') {
      window.gsap.to(card, {
        x: 14, y: 6, rotation: 2, duration: 0.08, repeat: 7, yoyo: true, ease: 'sine.inOut',
        onComplete: () => { window.gsap.set(card, { x: 0, y: 0, rotation: 0 }); }
      });
    }
    audioManager.vibrate([40, 60, 40]);
  }

  function onWrongPasscode() {
    attemptCount++;
    if (passcodeInput) passcodeInput.value = '';

    if (attemptCount === 1) {
      if (errorMsg) errorMsg.textContent = "That's not quite it… try again! 💖";
      shakeInput();
      passcodeInput?.focus();
    } else if (attemptCount === 2) {
      if (errorMsg) errorMsg.textContent = 'Hmm... phir se try karo 😌';
      shakeInput();
      passcodeInput?.focus();
    } else if (attemptCount === 3) {
      if (errorMsg) errorMsg.textContent = 'Pagal Aurat! 😂';
      audioManager.playPagalAurat();
      shakeScreen();
      passcodeInput?.focus();
    } else if (attemptCount === 4) {
      if (errorMsg) errorMsg.textContent = 'Itna bhi difficult nahi hai... 🤭';
      shakeInput();
      passcodeInput?.focus();
    } else {
      if (errorMsg) errorMsg.textContent = 'Chhod rehne de... 😭';
      showDramaticPasswordReveal();
    }
  }

  function showDramaticPasswordReveal() {
    isFrozen = true;
    document.body.style.pointerEvents = 'none';

    setTimeout(() => {
      document.body.style.pointerEvents = '';
      isFrozen = false;

      const modal = document.createElement('div');
      modal.className = 'media-popup-overlay media-popup-overlay--reveal active';
      modal.style.zIndex = '99999';
      modal.innerHTML = `
        <div class="password-reveal-card">
          <div class="password-reveal-icon">🔒✨</div>
          <div class="password-reveal-text" id="password-typewriter-text"></div>
          <button class="btn-try-again" id="btn-try-again" style="display: none;">Try Again 😌</button>
        </div>
      `;

      document.body.appendChild(modal);

      const typewriterEl = modal.querySelector('#password-typewriter-text');
      const tryAgainBtn = modal.querySelector('#btn-try-again');

      const lines = [
        'Chhod rehne de... 😭',
        'Tujhse nahi hoga...',
        'Theek hai...',
        `Password is 🎂 ${APP_CONFIG.profile.passcode}`
      ];

      let currentLineIndex = 0;

      function typeLine() {
        if (currentLineIndex < lines.length) {
          const p = document.createElement('p');
          p.className = `reveal-line reveal-line--${currentLineIndex}`;
          p.textContent = lines[currentLineIndex];
          typewriterEl.appendChild(p);

          if (typeof window.gsap !== 'undefined') {
            window.gsap.fromTo(p, 
              { opacity: 0, y: 10 },
              { opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.4)' }
            );
          }

          currentLineIndex++;
          const delay = currentLineIndex === lines.length ? 300 : 800;
          setTimeout(typeLine, delay);
        } else {
          tryAgainBtn.style.display = 'inline-flex';
          if (typeof window.gsap !== 'undefined') {
            window.gsap.fromTo(tryAgainBtn,
              { opacity: 0, scale: 0.88 },
              { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.6)' }
            );
          }
        }
      }

      typeLine();

      tryAgainBtn.addEventListener('click', () => {
        audioManager.playPaper();
        if (typeof window.gsap !== 'undefined') {
          window.gsap.to(modal, {
            opacity: 0, duration: 0.3, onComplete: () => {
              modal.remove();
              if (passcodeInput) {
                passcodeInput.value = APP_CONFIG.profile.passcode;
                passcodeInput.focus();
              }
            }
          });
        } else {
          modal.remove();
          if (passcodeInput) {
            passcodeInput.value = APP_CONFIG.profile.passcode;
            passcodeInput.focus();
          }
        }
      });
    }, 1000);
  }

  function onCorrectPasscode() {
    if (errorMsg) errorMsg.textContent = '';
    disableButton(unlockBtn);

    audioManager.playChime();
    stateManager.set('passcodeUnlocked', true);
    stateManager.unlockPage(1);

    if (envelope && typeof window.gsap !== 'undefined') {
      const flap = envelope.querySelector('.envelope__flap');
      const seal = envelope.querySelector('.envelope__seal');

      const tl = window.gsap.timeline({
        onComplete: () => {
          navigation.goNext();
        }
      });

      if (seal) {
        tl.to(seal, { scale: 1.3, rotation: 180, duration: 0.3, ease: 'back.out(2)' });
      }

      if (flap) {
        tl.to(flap, { scaleY: -1, transformOrigin: 'top center', duration: 0.45, ease: 'power2.inOut' }, '-=0.15');
      }

      tl.to(envelope, { scale: 1.08, y: -15, duration: 0.3, ease: 'sine.out' }, '-=0.2');
    } else {
      navigation.goNext();
    }
  }

  if (unlockBtn) {
    unlockBtn.addEventListener('click', (e) => {
      e.preventDefault();
      attemptUnlock();
    });
  }

  if (passcodeInput) {
    passcodeInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        attemptUnlock();
      }
    });

    passcodeInput.addEventListener('input', () => {
      if (errorMsg && errorMsg.textContent) {
        errorMsg.textContent = '';
      }
    });
  }

  pageManager.registerHooks(0, {
    onEnter: () => {
      attemptCount = 0;
      isFrozen = false;
      if (passcodeInput) passcodeInput.value = '';
      if (errorMsg) errorMsg.textContent = '';
      enableButton(unlockBtn);
    },
    onReady: () => {
      if (passcodeInput && !stateManager.get('passcodeUnlocked')) {
        setTimeout(() => passcodeInput.focus(), 400);
      }
    }
  });
}
