/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   POPUPMANAGER.JS — Centralized Modal & Popup Stack Manager
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

export class PopupManager {
  constructor() {
    this.activeModals = new Set();
  }

  showModal(id) {
    const el = document.getElementById(id);
    if (el) {
      el.classList.add('active');
      el.style.display = 'flex';
      this.activeModals.add(id);
      document.body.classList.add('popup-open');
    }
  }

  hideModal(id) {
    const el = document.getElementById(id);
    if (el) {
      el.classList.remove('active');
      el.style.display = 'none';
      this.activeModals.delete(id);
      if (this.activeModals.size === 0) {
        document.body.classList.remove('popup-open');
      }
    }
  }

  hideAllModals() {
    this.activeModals.forEach(id => this.hideModal(id));
  }

  isAnyModalOpen() {
    return this.activeModals.size > 0;
  }
}

export const popupManager = new PopupManager();
