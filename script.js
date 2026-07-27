document.addEventListener('DOMContentLoaded', () => {
  const pillars = document.querySelectorAll('.pillar');
  let openPillar = null;

  const closePillar = (pillar) => {
    if (!pillar) return;
    pillar.classList.remove('open');
    const button = pillar.querySelector('.pillar-toggle');
    if (button) button.setAttribute('aria-expanded', 'false');
    if (openPillar === pillar) openPillar = null;
  };

  const openPillar = (pillar) => {
    if (openPillar) closePillar(openPillar);
    pillar.classList.add('open');
    const button = pillar.querySelector('.pillar-toggle');
    if (button) button.setAttribute('aria-expanded', 'true');
    openPillar = pillar;
  };

  // Event delegation for button clicks
  document.addEventListener('click', (ev) => {
    const button = ev.target.closest('.pillar-toggle');
    if (!button) return;

    ev.stopPropagation();
    const pillar = button.closest('.pillar');
    
    if (openPillar === pillar) {
      closePillar(pillar);
    } else {
      openPillar(pillar);
    }
  });

  // Close when clicking outside
  document.addEventListener('click', (ev) => {
    if (openPillar && !openPillar.contains(ev.target)) {
      closePillar(openPillar);
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape' && openPillar) closePillar(openPillar);
  });
});
