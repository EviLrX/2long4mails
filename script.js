document.addEventListener('DOMContentLoaded', () => {
  const pillars = document.querySelectorAll('.pillar');
  let currentOpenPillar = null;

  const closePillar = (pillar) => {
    if (!pillar) return;
    pillar.classList.remove('open');
    const button = pillar.querySelector('.pillar-toggle');
    if (button) button.setAttribute('aria-expanded', 'false');
    if (currentOpenPillar === pillar) currentOpenPillar = null;
  };

  const openPillar = (pillar) => {
    if (!pillar) return;
    if (currentOpenPillar && currentOpenPillar !== pillar) closePillar(currentOpenPillar);
    pillar.classList.add('open');
    const button = pillar.querySelector('.pillar-toggle');
    if (button) button.setAttribute('aria-expanded', 'true');
    currentOpenPillar = pillar;
  };

  // Event delegation for button clicks
  document.addEventListener('click', (ev) => {
    const button = ev.target.closest('.pillar-toggle');
    if (!button) return;

    ev.stopPropagation();
    const pillar = button.closest('.pillar');
    if (!pillar) return;

    if (currentOpenPillar === pillar) {
      closePillar(pillar);
    } else {
      openPillar(pillar);
    }
  });

  // Close when clicking outside any open pillar
  document.addEventListener('click', (ev) => {
    if (currentOpenPillar && !currentOpenPillar.contains(ev.target)) {
      closePillar(currentOpenPillar);
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape' && currentOpenPillar) closePillar(currentOpenPillar);
  });
});
