document.addEventListener('DOMContentLoaded', () => {
  const pillars = document.querySelectorAll('.pillar');

  pillars.forEach((pillar) => {
    const button = pillar.querySelector('.pillar-toggle');
    if (!button) return;

    button.addEventListener('click', (ev) => {
      ev.stopPropagation();
      const willOpen = !pillar.classList.contains('open');

      // close other pillars
      pillars.forEach((other) => {
        if (other !== pillar) {
          other.classList.remove('open');
          const b = other.querySelector('.pillar-toggle');
          if (b) b.setAttribute('aria-expanded', 'false');
        }
      });

      // toggle this pillar and update aria
      pillar.classList.toggle('open', willOpen);
      button.setAttribute('aria-expanded', String(willOpen));
    });
  });

  // close when clicking outside any open pillar
  document.addEventListener('click', (ev) => {
    pillars.forEach((pillar) => {
      if (pillar.classList.contains('open') && !pillar.contains(ev.target)) {
        pillar.classList.remove('open');
        const b = pillar.querySelector('.pillar-toggle');
        if (b) b.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // close on Escape key for accessibility
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') {
      pillars.forEach((pillar) => {
        if (pillar.classList.contains('open')) {
          pillar.classList.remove('open');
          const b = pillar.querySelector('.pillar-toggle');
          if (b) b.setAttribute('aria-expanded', 'false');
        }
      });
    }
  });
});
