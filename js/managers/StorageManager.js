/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   STORAGEMANAGER.JS — Local Storage & State Persistence
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

import { APP_CONFIG } from '../../config/app.config.js';

export class StorageManager {
  constructor() {
    this.key = APP_CONFIG.storage.key;
    this.audioKey = APP_CONFIG.storage.audioMutedKey;
  }

  loadState(defaultState) {
    try {
      const saved = localStorage.getItem(this.key);
      if (saved) {
        return { ...defaultState, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('[StorageManager] Failed to load state:', e);
    }
    return defaultState;
  }

  saveState(state) {
    try {
      localStorage.setItem(this.key, JSON.stringify(state));
    } catch (e) {
      console.warn('[StorageManager] Failed to save state:', e);
    }
  }

  clearState() {
    try {
      localStorage.removeItem(this.key);
    } catch (e) {
      console.warn('[StorageManager] Failed to clear state:', e);
    }
  }

  isAudioMuted() {
    return localStorage.getItem(this.audioKey) === 'true';
  }

  setAudioMuted(isMuted) {
    try {
      localStorage.setItem(this.audioKey, isMuted.toString());
    } catch (e) {
      console.warn('[StorageManager] Failed to save audio mute state:', e);
    }
  }
}

export const storageManager = new StorageManager();
