/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   CREDITS.JS — Ending Credits Component
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

import { APP_CONFIG } from '../../config/app.config.js';

export const Credits = {
  renderEndingCard() {
    return `
      <div class="ending-card">
        <p class="ending-card__main">✨ Thank you for visiting this little birthday world. ✨</p>
        <p class="ending-card__sub">Hope this made you smile.</p>
        <p class="ending-card__wish">Have an amazing birthday, ${APP_CONFIG.profile.birthdayName}! 🌸</p>
        <p class="ending-card__credit">Made with ❤️ by ${APP_CONFIG.profile.creatorName}</p>
      </div>
    `;
  }
};
