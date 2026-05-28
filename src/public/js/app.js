'use strict';

// Auto-dismiss flash messages after 5 seconds
document.addEventListener('DOMContentLoaded', () => {
  const flashMessages = document.querySelectorAll('[role="alert"]');
  flashMessages.forEach(el => {
    setTimeout(() => {
      el.style.transition = 'opacity 0.5s ease';
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 500);
    }, 5000);
  });
});
