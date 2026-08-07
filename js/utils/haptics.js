/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   HAPTICS.JS — Device Haptic Feedback Helper
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

/**
 * Trigger mobile vibration haptic pattern if supported.
 * @param {number[]} [pattern=[15, 30, 15]]
 */
export function vibrate(pattern = [15, 30, 15]) {
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Ignored on unsupported devices
    }
  }
}
