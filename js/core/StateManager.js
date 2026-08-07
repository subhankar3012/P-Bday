/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   STATEMANAGER.JS — Global Application State Controller
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

import { storageManager } from '../managers/StorageManager.js';

export class StateManager {
  constructor() {
    this.defaultState = {
      unlockedPages: [0],
      currentPage: 0,
      passcodeUnlocked: false,
      disclaimerAccepted: false,
      flippedMemories: {},
      balloonScore: 0,
      quizAnswered: false,
      activeTheme: 'blush-pink',
      candlesBlown: 0,
      letterRead: false,
      giftOpened: false,
      scratchProgress: 0,
      scratchCompleted: false,
      audioMuted: false,
      volume: 0.8
    };

    this.state = { ...this.defaultState };
    this.listeners = new Set();
  }

  init() {
    this.state = storageManager.loadState(this.defaultState);
    if (this.state.activeTheme) {
      document.documentElement.setAttribute('data-theme', this.state.activeTheme);
    }
  }

  applyTheme(themeId) {
    if (!themeId) return;
    document.documentElement.setAttribute('data-theme', themeId);
    this.set('activeTheme', themeId);
  }

  save() {
    storageManager.saveState(this.state);
  }

  get(key) {
    return this.state[key];
  }

  set(key, value) {
    this.state[key] = value;
    this.save();
    this.notify(key, value);
  }

  unlockPage(index) {
    if (!this.state.unlockedPages.includes(index)) {
      this.state.unlockedPages.push(index);
      this.save();
      this.notify('unlockedPages', this.state.unlockedPages);
    }
  }

  isPageUnlocked(index) {
    return this.state.unlockedPages.includes(index);
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(key, value) {
    this.listeners.forEach(fn => fn(key, value, this.state));
  }

  reset() {
    storageManager.clearState();
    this.state = { ...this.defaultState };
    this.save();
  }
}

export const stateManager = new StateManager();
