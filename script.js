'use strict';

(async function () {
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

  async function runIntro() {
    const landing = document.querySelector('.landing');
    if (!landing) return;

    // Prevent the intro from running twice
    if (landing.dataset.introInit === '1') return;
    landing.dataset.introInit = '1';

    landing.classList.add('intro-running');

    // Hold on first image
    await wait(900);

    // Fade to second image
    landing.classList.add('show-two');

    await wait(2200 + 1200);

    // Fade to crown
    landing.classList.add('show-final');

    await wait(2200 + 1200);

    // Tell pillars.js to handle the pillars
    await window.dropPillars();

    // Reveal homepage title
    landing.classList.add('intro-complete');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runIntro);
  } else {
    runIntro();
  }
})();
