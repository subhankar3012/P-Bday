/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   DOM.JS — DOM Query Helpers & UI Utilities
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

/**
 * Safe query selector helper.
 * @param {string} selector
 * @param {Element|Document} [parent=document]
 * @returns {HTMLElement|null}
 */
export function $(selector, parent = document) {
  return parent ? parent.querySelector(selector) : null;
}

/**
 * Safe query selector all helper.
 * @param {string} selector
 * @param {Element|Document} [parent=document]
 * @returns {HTMLElement[]}
 */
export function $$(selector, parent = document) {
  return parent ? Array.from(parent.querySelectorAll(selector)) : [];
}

/**
 * Disable a button element cleanly.
 * @param {HTMLElement|null} btn
 */
export function disableButton(btn) {
  if (!btn) return;
  btn.disabled = true;
  btn.setAttribute('aria-disabled', 'true');
}

/**
 * Enable a button element cleanly.
 * @param {HTMLElement|null} btn
 */
export function enableButton(btn) {
  if (!btn) return;
  btn.disabled = false;
  btn.setAttribute('aria-disabled', 'false');
}

/**
 * Display toast notification overlay.
 * @param {string} message
 * @param {number} [duration=2500]
 */
export function showToast(message, duration = 2500) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add('active');

  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.classList.remove('active');
  }, duration);
}
