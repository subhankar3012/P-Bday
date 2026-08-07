# Moonlight Birthday Journey ✨ — Priyanka's Birthday

A handcrafted, interactive mobile birthday experience built with HTML5, CSS3, JavaScript ES Modules, and GSAP.

## Project Structure

```
Birthday-Adventure/
│
├── assets/
│   ├── audio/         # Audio clips & meme sound effects
│   ├── fonts/         # Custom typography assets
│   ├── icons/         # App icons & SVGs
│   ├── images/        # Photos & background artwork
│   └── videos/        # Meme videos & intro animations
│
├── css/
│   ├── base/          # CSS variables & global base styles
│   ├── layout/        # Grid, flex, and responsive media queries
│   ├── pages/         # Page-specific styling rules
│   ├── components/    # Reusable component styles
│   ├── animations/    # Keyframe animations & transitions
│   └── style.css      # Main stylesheet entrypoint
│
├── js/
│   ├── core/          # App entrypoint (app.js) & StateManager
│   ├── managers/      # Core single-responsibility managers
│   ├── pages/         # Descriptive page logic modules
│   ├── components/    # Reusable UI components & modals
│   └── utils/         # DOM, formatting, and haptic utilities
│
├── config/
│   ├── app.config.js    # Editable app configuration (names, passcode, themes)
│   └── assets.config.js # Centralized asset path registry
│
├── data/              # Content data models (memories, quiz, wishes, terms)
├── docs/              # Documentation (README, CHANGELOG, TODO)
├── index.html         # Application markup shell
├── sw.js              # Service Worker for offline PWA support
├── manifest.json      # Web App Manifest
└── LICENSE
```

## Features & Highlights
- **Layered Manager Architecture**: Decoupled managers for Audio, Video, Popups, Navigation, Pages, Assets, and Storage.
- **Descriptive Page Modules**: Modularized page logic across EntrancePage, MemoryLane, BalloonGame, ColorQuiz, CakeCeremony, LetterPage, and FinalAdventure.
- **Reusable UI Components**: Self-contained ScratchCard, CertificateCard, Credits, GalleryModal, PlaylistModal, WishesModal, SurpriseFlow, and VideoModal components.
- **Centralized Configuration**: All text, themes, dates, passcodes, and media paths are externalized in `config/` for easy customization and reuse.
- **Interactive Story Flow**: Secret code entrance with hints, 3D memory card flips, balloon popping game, color quiz theme morphing, candle blowing with microphone detection, typewriter letter, and interactive scratch card.

## License
MIT License.
