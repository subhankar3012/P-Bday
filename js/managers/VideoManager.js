/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   VIDEOMANAGER.JS — Media Flow & Video Player Orchestrator
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

import { videoModal } from '../components/VideoModal.js';
import { galleryModal } from '../components/GalleryModal.js';
import { wishesModal } from '../components/WishesModal.js';
import { playlistModal } from '../components/PlaylistModal.js';
import { surpriseModal } from '../components/SurpriseModal.js';
import { assetManager } from './AssetManager.js';
import { ASSETS_CONFIG } from '../../config/assets.config.js';

export class VideoManager {
  constructor() {
    this.navigation = null;
    this.pageManager = null;
  }

  init(navigation, pageManager) {
    this.navigation = navigation;
    this.pageManager = pageManager;
    assetManager.preloadSequence('init');
  }

  /** Flow 1: MEMORIES */
  playMemoriesFlow() {
    assetManager.preloadSequence('memories');
    videoModal.open(ASSETS_CONFIG.videos.memories, () => {
      galleryModal.open();
    });
  }

  /** Flow 2: WISHES */
  playWishesFlow() {
    videoModal.open(ASSETS_CONFIG.videos.wishes, () => {
      wishesModal.open();
    });
  }

  /** Flow 3: PLAYLIST */
  playPlaylistFlow() {
    assetManager.preloadSequence('playlist');
    videoModal.open(ASSETS_CONFIG.videos.playlist, () => {
      playlistModal.open();
    });
  }

  /** Flow 4: SURPRISE */
  playSurpriseFlow() {
    videoModal.open(ASSETS_CONFIG.videos.surprise, () => {
      surpriseModal.open();
    });
  }
}

export const videoManager = new VideoManager();
