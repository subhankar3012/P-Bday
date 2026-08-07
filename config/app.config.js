/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   APP.CONFIG.JS — Application & Experience Configuration
   Centralized editable values for easy project reuse.
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export const APP_CONFIG = {
  profile: {
    birthdayName: 'Priyanka',
    creatorName: 'Subhankar',
    phoneNumber: '918093397462',
    passcode: '2005',
    youtubeSongUrl: 'https://www.youtube.com/watch?v=P8PWN1OmZOA'
  },
  storage: {
    key: 'moonlight_birthday_state_v1',
    audioMutedKey: 'moonlight_audio_muted'
  },
  games: {
    balloonsTotal: 20,
    requiredScratchTaps: 7,
    requiredScratchProgress: 60
  },
  audio: {
    defaultVolume: 0.8,
    pagalAuratVolume: 0.95,
    letterBgmVolume: 0.85
  },
  animations: {
    toastDurationMs: 2500,
    curiosityPopupDelayMs: 3500,
    curiosityPopupDisplayMs: 4500
  },
  themes: [
    { id: 'blush-pink', name: 'Blush Pink', icon: '🌸', color: '#FFB6C9', glow: 'rgba(255, 182, 201, 0.5)' },
    { id: 'lavender', name: 'Lavender', icon: '💜', color: '#C9B6FF', glow: 'rgba(201, 182, 255, 0.5)' },
    { id: 'rose-pink', name: 'Rose Pink', icon: '🌷', color: '#FF7EB9', glow: 'rgba(255, 126, 185, 0.5)' },
    { id: 'peach', name: 'Peach', icon: '🍑', color: '#FFC7A6', glow: 'rgba(255, 199, 166, 0.5)' },
    { id: 'baby-blue', name: 'Baby Blue', icon: '🩵', color: '#A9D9FF', glow: 'rgba(169, 217, 255, 0.5)' },
    { id: 'butter-yellow', name: 'Butter Yellow', icon: '💛', color: '#FFE89A', glow: 'rgba(255, 232, 154, 0.5)' },
    { id: 'mint-green', name: 'Mint Green', icon: '🌿', color: '#BFF7D4', glow: 'rgba(191, 247, 212, 0.5)' }
  ]
};
