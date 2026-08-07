/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   LETTERPAGE.JS — Typewriter Letter Page Module
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

import { $, enableButton, disableButton, showToast } from '../utils/dom.js';
import { formatTime } from '../utils/formatters.js';
import { audioManager } from '../managers/AudioManager.js';
import { stateManager } from '../core/StateManager.js';
import { BIRTHDAY_LETTER_TEXT } from '../../data/wishes.data.js';
import { ASSETS_CONFIG } from '../../config/assets.config.js';

let letterBgmAudio = null;

function getLetterAudio() {
  if (!letterBgmAudio) {
    letterBgmAudio = new Audio(ASSETS_CONFIG.videos.favSong);
    letterBgmAudio.loop = false;
    letterBgmAudio.volume = 0.85;
  }
  return letterBgmAudio;
}

export function initLetterPage(pageManager, navigation) {
  const page = document.getElementById('page-letter');
  if (!page) return;

  const letterText = $('.letter__text', page);
  const cursor = $('.letter__cursor', page);
  const audioBtn = $('.audio-player__btn', page);
  const audioFill = $('.audio-player__fill', page);
  const audioTime = $('.audio-player__time', page);
  const continueBtn = $('[data-nav="next"]', page);
  const letterEl = $('.letter', page);

  let typewriterTimer = null;
  let cursorFadeTimer = null;
  let charIndex = 0;

  function updateAudioUI() {
    const audio = getLetterAudio();
    const cur = audio.currentTime || 0;
    const dur = audio.duration || 0;
    const pct = dur > 0 ? (cur / dur) * 100 : 0;

    if (audioFill) audioFill.style.width = `${pct}%`;
    if (audioTime) audioTime.textContent = formatTime(cur);
  }

  function getDelayForChar(char) {
    if (['.', '!', '?'].includes(char)) return 360;
    if ([',', ';', '…'].includes(char)) return 180;
    if (char === '\n') return 420;
    return 36 + Math.random() * 12;
  }

  function typeNextChar() {
    if (charIndex < BIRTHDAY_LETTER_TEXT.length) {
      const currentChar = BIRTHDAY_LETTER_TEXT[charIndex];
      if (letterText) letterText.textContent += currentChar;
      charIndex++;

      if (charIndex % 16 === 0) {
        audioManager.playScratch();
      }

      const delay = getDelayForChar(currentChar);
      typewriterTimer = setTimeout(typeNextChar, delay);
    } else {
      finishTypewriter();
    }
  }

  function startTypewriter() {
    if (typewriterTimer) clearTimeout(typewriterTimer);
    if (cursorFadeTimer) clearTimeout(cursorFadeTimer);

    charIndex = 0;
    if (letterText) letterText.textContent = '';
    if (cursor) {
      cursor.style.display = 'inline-block';
      cursor.style.opacity = '1';
    }

    disableButton(continueBtn);
    typeNextChar();
  }

  function finishTypewriter() {
    if (typewriterTimer) clearTimeout(typewriterTimer);
    typewriterTimer = null;
    if (letterText) letterText.textContent = BIRTHDAY_LETTER_TEXT;

    cursorFadeTimer = setTimeout(() => {
      if (cursor) {
        cursor.style.transition = 'opacity 0.6s ease';
        cursor.style.opacity = '0';
      }
    }, 2000);

    stateManager.set('letterRead', true);
    stateManager.unlockPage(6);
    enableButton(continueBtn);

    if (typeof window.gsap !== 'undefined' && continueBtn) {
      window.gsap.fromTo(continueBtn,
        { scale: 0.9, boxShadow: '0 0 0px var(--color-primary)' },
        { scale: 1, boxShadow: '0 0 25px var(--color-primary-glow)', duration: 0.6, ease: 'back.out(1.5)' }
      );
    }
  }

  if (letterEl) {
    letterEl.addEventListener('click', () => {
      if (typewriterTimer) {
        audioManager.playPaper();
        finishTypewriter();
      }
    });
  }

  function toggleAudio() {
    const audio = getLetterAudio();

    if (audio.paused) {
      audio.play().then(() => {
        if (audioBtn) audioBtn.textContent = '⏸';
        showToast('Playing Favorite Song Audio 🎵');
      }).catch(err => {
        console.warn('[LetterPage] Audio play error:', err);
      });
    } else {
      audio.pause();
      if (audioBtn) audioBtn.textContent = '▶';
      showToast('Audio Paused 🎵');
    }
  }

  if (audioBtn) {
    audioBtn.addEventListener('click', toggleAudio);
  }

  const audio = getLetterAudio();
  audio.addEventListener('timeupdate', updateAudioUI);
  audio.addEventListener('ended', () => {
    if (audioBtn) audioBtn.textContent = '▶';
    if (audioFill) audioFill.style.width = '0%';
  });

  disableButton(continueBtn);

  pageManager.registerHooks(5, {
    onEnter: () => {
      startTypewriter();
      const audio = getLetterAudio();
      if (!audio.paused) audio.pause();
      if (audioBtn) audioBtn.textContent = '▶';
      updateAudioUI();
    },
    onReady: () => {
      if (!typewriterTimer && charIndex === 0) {
        startTypewriter();
      }
    },
    onExit: () => {
      if (typewriterTimer) clearTimeout(typewriterTimer);
      if (cursorFadeTimer) clearTimeout(cursorFadeTimer);

      const audio = getLetterAudio();
      if (!audio.paused) {
        audio.pause();
      }
      if (audioBtn) audioBtn.textContent = '▶';
    }
  });
}
