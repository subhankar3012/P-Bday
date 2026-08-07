/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   AUDIOMANAGER.JS — Web Audio Synthesizer & Sound Effects Manager
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

import { ASSETS_CONFIG } from '../../config/assets.config.js';
import { storageManager } from './StorageManager.js';
import { vibrate } from '../utils/haptics.js';

export class AudioManager {
  constructor() {
    this.ctx = null;
    this.isMuted = storageManager.isAudioMuted();
    this.pagalAuratAudio = null;
  }

  suspend() {
    if (this.ctx && this.ctx.state === 'running') {
      this.ctx.suspend();
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  pauseBgm() {
    // Helper to pause active BGM audio if playing
    if (this.pagalAuratAudio && !this.pagalAuratAudio.paused) {
      this.pagalAuratAudio.pause();
    }
  }

  _getAudioContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    storageManager.setAudioMuted(this.isMuted);
    return this.isMuted;
  }

  vibrate(pattern = [15, 30, 15]) {
    vibrate(pattern);
  }

  /** Play "Pagal Aurat" meme sound effect */
  playPagalAurat() {
    if (this.pagalAuratAudio && !this.pagalAuratAudio.paused) return;

    if (!this.pagalAuratAudio) {
      this.pagalAuratAudio = new Audio(ASSETS_CONFIG.audio.pagalAurat);
      this.pagalAuratAudio.loop = false;
      this.pagalAuratAudio.volume = 0.95;
    }

    this.pagalAuratAudio.currentTime = 0;
    this.pagalAuratAudio.play().catch(e => console.warn('[AudioManager] playPagalAurat error:', e));
    this.vibrate([30, 50, 30]);
  }

  /** Play funny cheerful laugh synth sequence */
  playLaugh() {
    const ctx = this._getAudioContext();
    if (!ctx) return;
    try {
      const pitches = [587.33, 783.99, 659.25, 880.00, 783.99, 987.77];
      pitches.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.09);
        gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.09);
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + idx * 0.09 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.09 + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.09);
        osc.stop(ctx.currentTime + idx * 0.09 + 0.09);
      });
      this.vibrate([20, 30, 20, 30, 20]);
    } catch (e) {
      console.warn('[AudioManager] playLaugh error:', e);
    }
  }

  /** Balloon Pop Sound (Cheerful sine frequency drop) */
  playPop() {
    if (this.isMuted) return;
    const ctx = this._getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(450, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.12);

      this.vibrate([10]);
    } catch (e) {
      console.warn('[AudioManager] playPop error:', e);
    }
  }

  /** Success Chime Sound (Bright major triad arpeggio) */
  playChime() {
    if (this.isMuted) return;
    const ctx = this._getAudioContext();
    if (!ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0, ctx.currentTime + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.4);
      });

      this.vibrate([20, 40, 30]);
    } catch (e) {
      console.warn('[AudioManager] playChime error:', e);
    }
  }

  /** Card Flip / Paper Rustle Sound */
  playPaper() {
    if (this.isMuted) return;
    const ctx = this._getAudioContext();
    if (!ctx) return;

    try {
      const bufferSize = ctx.sampleRate * 0.08;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1200;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start();
      this.vibrate([8]);
    } catch (e) {
      console.warn('[AudioManager] playPaper error:', e);
    }
  }

  /** Candle Blow Sound */
  playBlow() {
    if (this.isMuted) return;
    const ctx = this._getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(280, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.25);

      this.vibrate([15, 20]);
    } catch (e) {
      console.warn('[AudioManager] playBlow error:', e);
    }
  }

  /** Scratch Friction Sound */
  playScratch() {
    if (this.isMuted) return;
    const ctx = this._getAudioContext();
    if (!ctx) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180 + Math.random() * 80, ctx.currentTime);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // Ignored
    }
  }

  /** Celebration Bell Chime Sound */
  playCelebrationBell() {
    if (this.isMuted) return;
    const ctx = this._getAudioContext();
    if (!ctx) return;

    try {
      const notes = [880, 1108.73, 1318.51, 1760];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.06);

        gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.06 + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.06);
        osc.stop(ctx.currentTime + idx * 0.06 + 0.5);
      });
      this.vibrate([20, 30, 40]);
    } catch {
      // Ignored
    }
  }
}

export const audioManager = new AudioManager();
