/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   FINALADVENTURE.JS — Scrollable Magical Room & Final Adventure Page Module
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

import { $, $$, showToast } from '../utils/dom.js';
import { audioManager } from '../managers/AudioManager.js';
import { videoManager } from '../managers/VideoManager.js';
import { stateManager } from '../core/StateManager.js';
import { ScratchCard } from '../components/ScratchCard.js';
import { ParticleSystem } from '../components/ParticleSystem.js';
import { galleryModal } from '../components/GalleryModal.js';
import { wishesModal } from '../components/WishesModal.js';
import { playlistModal } from '../components/PlaylistModal.js';
import { surpriseModal } from '../components/SurpriseModal.js';
import { APP_CONFIG } from '../../config/app.config.js';

export function initFinalAdventurePage(pageManager, navigation) {
  const page = document.getElementById('page-gift');
  if (!page) return;

  const scrollContainer = $('#page-gift-scroll', page);
  const scratchCardContainer = $('#scratch-card', page);
  const photoFrame = $('#photo-frame', page);
  const glassCaption = $('#glass-caption', page);
  const replyInput = $('#reply-input', page);
  const replyBtn = $('#reply-btn', page);
  const shareBtn = $('#share-btn', page);
  const giftHint = $('#gift-hint', page);
  const curiosityPopup = $('#scroll-curiosity-popup', page);
  const collectibleModal = $('#collectible-modal', page);
  const modalTitle = $('#modal-title', page);
  const modalBody = $('#modal-body', page);
  const modalClose = $('#modal-close', page);
  const collectibleBtns = $$('.magic-collectible', page);
  const resetBtn = $('#gift-reset-btn', page);

  let scratchCardInstance = null;
  let curiosityTimer = null;
  let scrollTriggersInit = false;

  function showCuriosityPopup() {
    if (!curiosityPopup || !scrollContainer) return;
    curiosityTimer = setTimeout(() => {
      if (scrollContainer.scrollTop < 60) {
        curiosityPopup.classList.add('visible');
        setTimeout(() => {
          curiosityPopup.classList.remove('visible');
        }, APP_CONFIG.animations.curiosityPopupDisplayMs);
      }
    }, APP_CONFIG.animations.curiosityPopupDelayMs);
  }

  function initScrollReveals() {
    if (scrollTriggersInit || !scrollContainer) return;
    scrollTriggersInit = true;

    const revealSections = page.querySelectorAll('.reveal-section');

    if (typeof window.gsap !== 'undefined' && window.gsap.registerPlugin && typeof window.ScrollTrigger !== 'undefined') {
      window.gsap.registerPlugin(window.ScrollTrigger);

      revealSections.forEach((section) => {
        const children = section.querySelectorAll('.mini-wish-card, .memory-polaroid, .music-card, .handwritten-note, .little-chip, .celebration-emoji, .ending-card');

        window.gsap.fromTo(section, 
          { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: section,
              scroller: scrollContainer,
              start: 'top 85%',
              toggleActions: 'play none none none'
            }
          }
        );

        if (children.length > 0) {
          window.gsap.fromTo(children,
            { opacity: 0, y: 20, scale: 0.92 },
            {
              opacity: 1, y: 0, scale: 1,
              stagger: 0.08,
              duration: 0.5,
              ease: 'back.out(1.4)',
              scrollTrigger: {
                trigger: section,
                scroller: scrollContainer,
                start: 'top 80%',
                toggleActions: 'play none none none'
              }
            }
          );
        }
      });
    } else {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
          }
        });
      }, { root: scrollContainer, threshold: 0.15 });

      revealSections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(section);
      });
    }
  }

  if (scrollContainer) {
    scrollContainer.addEventListener('scroll', () => {
      if (scrollContainer.scrollTop > 30) {
        if (curiosityPopup) curiosityPopup.classList.remove('visible');
      } else {
        if (curiosityPopup) curiosityPopup.classList.add('visible');
      }
    }, { passive: true });
  }

  function handleScratchReveal(instant = false) {
    if (!instant) {
      audioManager.playChime();
      audioManager.playCelebrationBell();

      if (typeof window.gsap !== 'undefined' && photoFrame) {
        window.gsap.fromTo(photoFrame,
          { scale: 0.82, rotation: -3 },
          { scale: 1.05, rotation: 1.5, duration: 0.8, ease: 'back.out(1.8)', onComplete: () => {
            window.gsap.to(photoFrame, { scale: 1, duration: 0.5 });
          }}
        );
      }

      ParticleSystem.createConfettiBurst();
      showCuriosityPopup();
    }

    if (glassCaption) glassCaption.style.display = 'block';
    if (giftHint) giftHint.style.display = 'none';

    showToast(`✨ Portrait Revealed! Happy Birthday ${APP_CONFIG.profile.birthdayName}! 🌸`);
  }

  function initScratchCard() {
    if (!scratchCardContainer) return;
    scratchCardInstance = new ScratchCard(scratchCardContainer, {
      onReveal: handleScratchReveal
    });
    scratchCardInstance.init();
  }

  collectibleBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const type = btn.dataset.popup;
      audioManager.playChime();

      const triggerMediaFlow = () => {
        if (type === 'memories') {
          videoManager.playMemoriesFlow();
        } else if (type === 'wishes') {
          videoManager.playWishesFlow();
        } else if (type === 'playlist') {
          videoManager.playPlaylistFlow();
        } else if (type === 'surprise') {
          videoManager.playSurpriseFlow();
        }
      };

      if (typeof window.gsap !== 'undefined') {
        window.gsap.to(btn, { scale: 1.25, duration: 0.15, yoyo: true, repeat: 1, onComplete: triggerMediaFlow });
      } else {
        triggerMediaFlow();
      }
    });
  });

  const tuJaaneNaCard = $('#tu-jaane-na-card', page);
  if (tuJaaneNaCard) {
    tuJaaneNaCard.addEventListener('click', (e) => {
      e.preventDefault();
      audioManager.playChime();
      videoManager.playPlaylistFlow();
    });
  }

  const polaroids = $$('.memory-polaroid', page);
  polaroids.forEach(pol => {
    pol.addEventListener('click', (e) => {
      e.preventDefault();
      const img = pol.querySelector('img');
      const caption = pol.querySelector('.memory-polaroid__caption')?.textContent || 'Memory';
      if (img && img.src && collectibleModal) {
        modalTitle.textContent = caption;
        modalBody.innerHTML = `
          <div style="text-align:center;">
            <div style="border-radius:18px; overflow:hidden; border:3px solid #FFF; box-shadow:0 8px 24px rgba(0,0,0,0.12); margin-bottom:12px;">
              <img src="${img.src}" alt="${caption}" style="width:100%; max-height:50vh; object-fit:cover; display:block;">
            </div>
            <p style="font-family:var(--font-hand); font-size:1.2rem; color:var(--color-text); margin:0;">${caption}</p>
          </div>
        `;
        collectibleModal.style.display = 'flex';
        audioManager.playPaper();

        if (typeof window.gsap !== 'undefined') {
          const card = collectibleModal.querySelector('.collectible-modal__card');
          window.gsap.fromTo(card,
            { scale: 0.85, opacity: 0, y: 20 },
            { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.8)' }
          );
        }
      }
    });
  });

  function closeModal() {
    if (!collectibleModal) return;
    if (typeof window.gsap !== 'undefined') {
      const card = collectibleModal.querySelector('.collectible-modal__card');
      window.gsap.to(card, {
        scale: 0.9, opacity: 0, duration: 0.25, ease: 'power2.in',
        onComplete: () => { collectibleModal.style.display = 'none'; }
      });
    } else {
      collectibleModal.style.display = 'none';
    }
  }

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (collectibleModal) {
    collectibleModal.addEventListener('click', (e) => {
      if (e.target === collectibleModal) closeModal();
    });
  }

  if (replyBtn) {
    replyBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const userReply = replyInput?.value.trim() || "Thank you for the amazing birthday surprise! 💖";
      const fullText = `Hi ${APP_CONFIG.profile.creatorName}! 🌸 ${userReply}`;
      const encoded = encodeURIComponent(fullText);
      const waUrl = `https://wa.me/${APP_CONFIG.profile.phoneNumber}?text=${encoded}`;

      audioManager.playChime();
      audioManager.vibrate([20, 30, 40]);

      if (typeof window.gsap !== 'undefined') {
        window.gsap.fromTo(replyBtn,
          { scale: 0.9 },
          { scale: 1.08, duration: 0.2, ease: 'back.out(2)', onComplete: () => {
            window.gsap.to(replyBtn, { scale: 1, duration: 0.15 });
          }}
        );
      }

      showToast('Redirecting to WhatsApp 💌...');

      setTimeout(() => {
        window.open(waUrl, '_blank');
      }, 500);
    });
  }

  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      audioManager.playPaper();
      if (navigator.share) {
        try {
          await navigator.share({
            title: `Happy Birthday ${APP_CONFIG.profile.birthdayName}! 🎂`,
            text: 'Check out this magical birthday surprise!',
            url: window.location.href,
          });
        } catch { /* Cancelled */ }
      } else {
        try {
          await navigator.clipboard.writeText(window.location.href);
          showToast('Link copied to clipboard! 📋');
        } catch {
          showToast('Sharing not available on this device');
        }
      }
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', (e) => {
      e.preventDefault();
      audioManager.playChime();
      audioManager.vibrate([30, 40, 50]);

      if (typeof window.gsap !== 'undefined') {
        window.gsap.fromTo(resetBtn, 
          { rotation: 0 }, 
          { rotation: -360, duration: 0.6, ease: 'power2.inOut' }
        );
      }

      stateManager.reset();
      document.documentElement.removeAttribute('data-theme');

      if (scrollContainer) {
        scrollContainer.scrollTop = 0;
      }

      if (giftHint) giftHint.style.display = 'block';
      if (glassCaption) glassCaption.style.display = 'none';

      if (scratchCardInstance) {
        scratchCardInstance.reset();
      }

      showToast('✨ Website reset! Back to Page 1 🌸');

      setTimeout(() => {
        navigation.goTo(0);
      }, 350);
    });
  }

  pageManager.registerHooks(6, {
    onEnter: () => {
      initScratchCard();
      initScrollReveals();
      if (scrollContainer && scrollContainer.scrollTop <= 30 && curiosityPopup) {
        curiosityPopup.classList.add('visible');
      }
    }
  });
}
