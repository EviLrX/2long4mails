'use strict';

(() => {
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

  function setPillarOpen(pillar, open) {
    pillar.classList.toggle('open', open);

    const button = pillar.querySelector('.pillar-toggle');
    button?.setAttribute('aria-expanded', String(open));
  }

  // Open or close a pillar when its button is clicked
  document.addEventListener('click', event => {
    const button = event.target.closest('.pillar-toggle');

    if (button) {
      const pillar = button.closest('.pillar');

      if (pillar) {
        setPillarOpen(pillar, !pillar.classList.contains('open'));
      }

      return;
    }

    // Click outside a pillar: close the menus
    if (!event.target.closest('.pillar')) {
      document.querySelectorAll('.pillar').forEach(pillar => {
        setPillarOpen(pillar, false);
      });
    }
  });

  // Escape closes all pillars
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;

    document.querySelectorAll('.pillar').forEach(pillar => {
      setPillarOpen(pillar, false);
    });
  });

  // Make pillars descend, one after the other
  async function dropPillars() {
    const left = document.querySelector('.pillar-left');
    const right = document.querySelector('.pillar-right');

    left?.classList.add('landed');

    await wait(1280);

    right?.classList.add('landed');

    await wait(1280);

    document.querySelectorAll('.pillar').forEach(pillar => {
      setPillarOpen(pillar, true);
    });
  }

  // Make the animation callable by the homepage intro
  window.dropPillars = dropPillars;
})();
