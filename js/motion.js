/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MOTION.JS — Motion Design & Scene Transitions
   Layer 5 — Motion Design & Cinematic Animations
   
   Powered by GSAP & GPU-accelerated CSS.
   Handles cinematic scene transitions, organic floating,
   staggered component reveals, and micro-interactions.
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export class MotionController {
  constructor() {
    this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.hasGSAP = typeof window.gsap !== 'undefined';
    this.floatingTweens = [];
  }

  /**
   * Boot the motion engine.
   */
  init() {
    console.log(`[Motion] Initializing... (GSAP: ${this.hasGSAP}, Reduced Motion: ${this.isReducedMotion})`);

    if (this.isReducedMotion) {
      console.log('[Motion] Reduced motion preferred — simplifying animations.');
      return;
    }

    this._setupMicroInteractions();
    this._setupFloatingMotion();

    console.log('[Motion] Ready ✓');
  }

  /**
   * Perform cinematic scene transition between pages.
   * @param {HTMLElement} prevPage 
   * @param {HTMLElement} nextPage 
   * @param {string} direction ('forward' | 'backward')
   * @param {Function} onMidpoint Callback when switch happens
   */
  playTransition(prevPage, nextPage, direction, onMidpoint) {
    if (this.isReducedMotion || !this.hasGSAP) {
      onMidpoint();
      return;
    }

    const overlay = document.getElementById('scene-overlay');
    const gsap = window.gsap;

    const tl = gsap.timeline({
      onComplete: () => {
        if (overlay) {
          overlay.style.visibility = 'hidden';
          overlay.style.opacity = '0';
        }
      }
    });

    // 1. Light Flash & Depth Push
    if (overlay) {
      overlay.style.visibility = 'visible';
      tl.to(overlay, {
        opacity: 0.7,
        duration: 0.25,
        ease: 'power2.in'
      });
    }

    if (prevPage) {
      tl.to(prevPage, {
        scale: direction === 'forward' ? 0.94 : 1.06,
        filter: 'blur(8px)',
        opacity: 0,
        duration: 0.28,
        ease: 'power2.in'
      }, 0);
    }

    // 2. Midpoint Callback (Switch pages)
    tl.add(() => {
      onMidpoint();
      if (prevPage) {
        gsap.set(prevPage, { clearProps: 'scale,filter,opacity' });
      }
    });

    // 3. Reveal next page with Camera Zoom-In Reveal
    if (nextPage) {
      tl.fromTo(nextPage, 
        { scale: direction === 'forward' ? 1.08 : 0.92, filter: 'blur(10px)', opacity: 0 },
        { scale: 1, filter: 'blur(0px)', opacity: 1, duration: 0.45, ease: 'power3.out' }
      );
    }

    if (overlay) {
      tl.to(overlay, {
        opacity: 0,
        duration: 0.35,
        ease: 'power2.out'
      }, '-=0.35');
    }

    // 4. Trigger staggered entrance reveal for new page
    const pageIndex = parseInt(nextPage?.dataset?.page || '0', 10);
    tl.add(() => {
      this.animatePageEntrance(nextPage, pageIndex);
    }, '-=0.25');
  }

  /**
   * Staggered Component Entrance Sequence.
   * @param {HTMLElement} pageEl 
   * @param {number} pageIndex 
   */
  animatePageEntrance(pageEl, pageIndex) {
    if (!pageEl || this.isReducedMotion || !this.hasGSAP) return;

    const gsap = window.gsap;

    // Collect elements in sequence
    const blobs = pageEl.querySelectorAll('.deco-blob');
    const sparkles = pageEl.querySelectorAll('.deco-sparkle, .deco-heart, .deco-flower, .deco-star');
    const labels = pageEl.querySelectorAll('.label');
    const headings = pageEl.querySelectorAll('.heading-display, .heading-page');
    const subtitles = pageEl.querySelectorAll('.subtitle, .hint');
    const hero = pageEl.querySelectorAll('.envelope, .gallery, .game-area, .cake, .letter, .gift-box');
    const interactive = pageEl.querySelectorAll('.passcode-group, .card, .quiz, .audio-player, .final-reveal');
    const buttons = pageEl.querySelectorAll('.btn[data-nav], #unlock-btn, #share-btn');

    const tl = gsap.timeline();

    // Background Blobs
    if (blobs.length > 0) {
      tl.fromTo(blobs, 
        { scale: 0.7, opacity: 0 },
        { scale: 1, opacity: 0.35, duration: 0.6, stagger: 0.1, ease: 'sine.out' },
        0
      );
    }

    // Sparkles
    if (sparkles.length > 0) {
      tl.fromTo(sparkles,
        { scale: 0.3, opacity: 0, y: -10 },
        { scale: 1, opacity: 0.45, y: 0, duration: 0.5, stagger: 0.05, ease: 'back.out(1.5)' },
        0.1
      );
    }

    // Label & Headings
    if (labels.length > 0) {
      tl.fromTo(labels,
        { opacity: 0, y: 15, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'power2.out' },
        0.15
      );
    }

    if (headings.length > 0) {
      tl.fromTo(headings,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out' },
        0.2
      );
    }

    if (subtitles.length > 0) {
      tl.fromTo(subtitles,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
        0.25
      );
    }

    // Hero Element Elastic Pop
    if (hero.length > 0) {
      tl.fromTo(hero,
        { opacity: 0, y: 35, scale: 0.88 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.4)' },
        0.25
      );
    }

    // Interactive Components
    if (interactive.length > 0) {
      tl.fromTo(interactive,
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' },
        0.35
      );
    }

    // Action Buttons Pop
    if (buttons.length > 0) {
      tl.fromTo(buttons,
        { opacity: 0, y: 20, scale: 0.92 },
        { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'back.out(1.5)' },
        0.4
      );
    }
  }

  /**
   * Setup slow, multi-frequency GSAP organic floating motions.
   */
  _setupFloatingMotion() {
    if (!this.hasGSAP || this.isReducedMotion) return;

    const gsap = window.gsap;

    // Envelope Floating
    const envelope = document.getElementById('entrance-envelope');
    if (envelope) {
      gsap.to(envelope, {
        y: -10,
        rotation: 1,
        duration: 4.2,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true
      });
    }

    // Polaroid Floating
    const cards = document.querySelectorAll('.page--memories .card');
    cards.forEach((card, i) => {
      gsap.to(card, {
        y: i % 2 === 0 ? -8 : -12,
        rotation: i % 2 === 0 ? '+=1.5' : '-=1.5',
        duration: 4 + i * 0.5,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: i * 0.2
      });
    });

    // Cake Floating
    const cake = document.querySelector('.page--cake .cake');
    if (cake) {
      gsap.to(cake, {
        y: -12,
        duration: 4.5,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true
      });
    }

    // Letter Floating
    const letter = document.querySelector('.page--letter .letter');
    if (letter) {
      gsap.to(letter, {
        y: -7,
        duration: 5.2,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true
      });
    }

    // Gift Box Floating
    const giftBox = document.getElementById('gift-box');
    if (giftBox) {
      gsap.to(giftBox, {
        y: -10,
        rotation: 1.5,
        duration: 3.8,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true
      });
    }

    // Decorative Blobs slow drift
    const blobs = document.querySelectorAll('.deco-blob');
    blobs.forEach((blob, i) => {
      gsap.to(blob, {
        scale: 1.1,
        x: i % 2 === 0 ? 15 : -15,
        y: i % 2 === 0 ? -15 : 15,
        duration: 7 + i,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true
      });
    });
  }

  /**
   * Micro-interactions for buttons, cards, and inputs.
   */
  _setupMicroInteractions() {
    if (!this.hasGSAP) return;

    const gsap = window.gsap;

    // Elastic Button Press Feedback
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('pointerdown', () => {
        if (this.isReducedMotion) return;
        gsap.to(btn, { scale: 0.93, duration: 0.12, ease: 'power2.out' });
      });

      btn.addEventListener('pointerup', () => {
        if (this.isReducedMotion) return;
        gsap.to(btn, { scale: 1.02, duration: 0.18, ease: 'back.out(2)', onComplete: () => {
          gsap.to(btn, { scale: 1, duration: 0.15 });
        }});
      });

      btn.addEventListener('pointerleave', () => {
        if (this.isReducedMotion) return;
        gsap.to(btn, { scale: 1, duration: 0.2 });
      });
    });

    // Card Depth Lift on Touch/Hover
    document.querySelectorAll('.card').forEach(card => {
      card.addEventListener('pointerenter', () => {
        if (this.isReducedMotion) return;
        gsap.to(card, { y: -6, duration: 0.3, ease: 'power2.out' });
      });

      card.addEventListener('pointerleave', () => {
        if (this.isReducedMotion) return;
        gsap.to(card, { y: 0, duration: 0.3, ease: 'power2.out' });
      });
    });
  }
}
