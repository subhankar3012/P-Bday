/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ASSETMANAGER.JS — Background Asset Loader & Registry
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

import { ASSETS_CONFIG } from '../../config/assets.config.js';

export class AssetManager {
  constructor() {
    this.cache = new Map();
    this.preloadedSequences = new Set();
  }

  getAssetUrl(category, key) {
    if (ASSETS_CONFIG[category] && ASSETS_CONFIG[category][key]) {
      return ASSETS_CONFIG[category][key];
    }
    return null;
  }

  preloadImage(src) {
    if (!src || this.cache.has(src)) return Promise.resolve();
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        this.cache.set(src, img);
        resolve();
      };
      img.onerror = () => resolve();
      img.src = src;
    });
  }

  preloadVideo(src) {
    if (!src || this.cache.has(src)) return Promise.resolve();
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'auto';
      video.oncanplaythrough = () => {
        this.cache.set(src, video);
        resolve();
      };
      video.onerror = () => resolve();
      video.src = src;
    });
  }

  preloadSequence(seqName) {
    if (this.preloadedSequences.has(seqName)) return;
    this.preloadedSequences.add(seqName);

    if (seqName === 'init') {
      this.preloadVideo(ASSETS_CONFIG.videos.memories);
      this.preloadVideo(ASSETS_CONFIG.videos.wishes);
    } else if (seqName === 'memories') {
      this.preloadVideo(ASSETS_CONFIG.videos.playlist);
      this.preloadImage(ASSETS_CONFIG.images.photos.photo5);
      this.preloadImage(ASSETS_CONFIG.images.photos.photo6);
    } else if (seqName === 'playlist') {
      this.preloadVideo(ASSETS_CONFIG.videos.surprise);
    }
  }
}

export const assetManager = new AssetManager();
