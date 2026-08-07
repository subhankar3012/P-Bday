# Changelog

All notable architectural refactorings and improvements to this project are documented in this file.

## [2.0.0] - Production Architecture Refactor

### Architectural Improvements
- **Directory Restructuring**: Reorganized the codebase into standard production directories (`assets/`, `css/`, `js/`, `config/`, `data/`, `docs/`).
- **Pragmatic Manager System**: Introduced core managers (`AudioManager`, `VideoManager`, `PopupManager`, `NavigationManager`, `PageManager`, `AssetManager`, `StorageManager`).
- **Descriptive Page Modules**: Renamed page files to descriptive names (`EntrancePage.js`, `MemoryLane.js`, `BalloonGame.js`, `ColorQuiz.js`, `CakeCeremony.js`, `LetterPage.js`, `FinalAdventure.js`).
- **Reusable UI Components**: Decoupled reusable UI logic into components (`ScratchCard.js`, `CertificateCard.js`, `Credits.js`, `GalleryModal.js`, `PlaylistModal.js`, `WishesModal.js`, `SurpriseFlow.js`, `DisclaimerModal.js`, `VideoModal.js`, `ParticleSystem.js`).
- **Centralized Configurations**: Created `config/app.config.js` and `config/assets.config.js` to eliminate hardcoded values and allow easy site repurposing.
- **Data Externalization**: Moved content definitions into `data/` modules (`memories.data.js`, `quiz.data.js`, `wishes.data.js`, `disclaimer.data.js`).
- **CSS Modularization**: Split stylesheets into `css/base/`, `css/layout/`, `css/pages/`, `css/components/`, `css/animations/`, linked cleanly via `css/style.css`.
- **Zero Regressions**: Preserved 100% of existing features, animations, UI, and story flow.
