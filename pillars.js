'use strict';

(() => {
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

  function setPillarOpen(pillar, open) {
    if (!pillar) return;

    pillar.classList.toggle('open', open);

    const button = pillar.querySelector('.pillar-toggle');
    button?.setAttribute('aria-expanded', String(open));
  }

  function initPillars() {
    if (document.body.dataset.pillarsBound === 'true') return;
    document.body.dataset.pillarsBound = 'true';

    document.addEventListener('click', event => {
      const button = event.target.closest('.pillar-toggle');

      if (button) {
        const pillar = button.closest('.pillar');

        if (pillar) {
          setPillarOpen(pillar, !pillar.classList.contains('open'));
        }

        return;
      }

      if (!event.target.closest('.pillar')) {
        document.querySelectorAll('.pillar').forEach(pillar => {
          setPillarOpen(pillar, false);
        });
      }
    });

    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;

      document.querySelectorAll('.pillar').forEach(pillar => {
        setPillarOpen(pillar, false);
      });
    });
  }

  async function dropPillars(options = {}) {
    const {
      leftSelector = '.pillar-left',
      rightSelector = '.pillar-right',
      staggerMs = 1280,
      openAfter = true
    } = options;

    const left = document.querySelector(leftSelector);
    const right = document.querySelector(rightSelector);

    left?.classList.add('landed');

    if (right) {
      await wait(staggerMs);
      right.classList.add('landed');
    }

    if (openAfter) {
      await wait(staggerMs);
      document.querySelectorAll('.pillar').forEach(pillar => {
        setPillarOpen(pillar, true);
      });
    }
  }

  window.initPillars = initPillars;
  window.dropPillars = dropPillars;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPillars, { once: true });
  } else {
    initPillars();
  }
})();
