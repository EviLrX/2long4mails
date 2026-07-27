document.addEventListener('DOMContentLoaded', () => {
  const pillars = document.querySelectorAll('.pillar');
  
  // Helper function to close a pillar and update aria
  const closePillar = (pillar) => {
    pillar.classList.remove('open');
    const button = pillar.querySelector('.pillar-toggle');
    if (button) button.setAttribute('aria-expanded', 'false');
  };

  // Helper function to close all pillars
  const closeAllPillars = () => {
    pillars.forEach(closePillar);
  };

  pillars.forEach((pillar) => {
    const button = pillar.querySelector('.pillar-toggle');
    if (!button) return;

    button.addEventListener('click', (ev) => {
      ev.stopPropagation();
      const willOpen = !pillar.classList.contains('open');

      // Close other pillars
      pillars.forEach((other) => {
        if (other !== pillar) closePillar(other);
      });

      // Toggle this pillar and update aria
      pillar.classList.toggle('open', willOpen);
      button.setAttribute('aria-expanded', String(willOpen));
    });
  });

  // Close when clicking outside any open pillar
  document.addEventListener('click', (ev) => {
    pillars.forEach((pillar) => {
      if (pillar.classList.contains('open') && !pillar.contains(ev.target)) {
        closePillar(pillar);
      }
    });
  });

  // Close on Escape key for accessibility
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') closeAllPillars();
  });
});
