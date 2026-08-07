/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   PARTICLESYSTEM.JS — Confetti, Sparkles, and Floating Effects Component
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export const ParticleSystem = {
  createConfettiBurst() {
    const emojis = ['🌸', '✨', '💖', '⭐', '🎈', '🦋', '💫'];
    for (let i = 0; i < 24; i++) {
      const p = document.createElement('div');
      p.textContent = emojis[i % emojis.length];
      p.style.cssText = `
        position: fixed;
        left: ${10 + Math.random() * 80}vw;
        top: ${20 + Math.random() * 30}vh;
        font-size: ${1 + Math.random() * 0.8}rem;
        pointer-events: none;
        z-index: 950;
      `;
      document.body.appendChild(p);

      if (typeof window.gsap !== 'undefined') {
        window.gsap.to(p, {
          y: 200 + Math.random() * 250,
          x: (Math.random() - 0.5) * 120,
          rotation: Math.random() * 360,
          opacity: 0,
          duration: 2.2 + Math.random() * 1.5,
          ease: 'power1.out',
          onComplete: () => p.remove()
        });
      } else {
        setTimeout(() => p.remove(), 2500);
      }
    }
  },

  createSparkleBurst(bubbleEl, color) {
    if (!bubbleEl) return;
    const rect = bubbleEl.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const symbols = ['✦', '✨', '⭐', '🌸', '💫'];
    for (let i = 0; i < 10; i++) {
      const p = document.createElement('div');
      p.textContent = symbols[i % symbols.length];
      p.style.cssText = `
        position: fixed;
        left: ${centerX}px;
        top: ${centerY}px;
        font-size: ${0.9 + Math.random() * 0.6}rem;
        color: ${color};
        text-shadow: 0 0 10px rgba(255, 255, 255, 0.9);
        pointer-events: none;
        z-index: 950;
      `;
      document.body.appendChild(p);

      if (typeof window.gsap !== 'undefined') {
        const angle = (i / 10) * Math.PI * 2;
        const dist = 35 + Math.random() * 45;
        window.gsap.to(p, {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist - 15,
          opacity: 0,
          scale: 1.5,
          duration: 0.85,
          ease: 'power2.out',
          onComplete: () => p.remove()
        });
      } else {
        setTimeout(() => p.remove(), 700);
      }
    }
  },

  createParticleBurst(arena, x, y) {
    if (!arena) return;
    const arenaRect = arena.getBoundingClientRect();
    const localX = x - arenaRect.left;
    const localY = y - arenaRect.top;

    const symbols = ['✦', '✨', '💖', '⭐', '🌸'];
    for (let i = 0; i < 8; i++) {
      const p = document.createElement('div');
      p.textContent = symbols[i % symbols.length];
      p.style.cssText = `
        position: absolute;
        left: ${localX}px;
        top: ${localY}px;
        font-size: ${0.8 + Math.random() * 0.6}rem;
        pointer-events: none;
        z-index: 40;
      `;
      arena.appendChild(p);

      if (typeof window.gsap !== 'undefined') {
        const angle = (i / 8) * Math.PI * 2;
        const dist = 30 + Math.random() * 40;
        window.gsap.to(p, {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist - 15,
          opacity: 0,
          scale: 1.4,
          duration: 0.75,
          ease: 'power2.out',
          onComplete: () => p.remove()
        });
      } else {
        setTimeout(() => p.remove(), 600);
      }
    }
  }
};
