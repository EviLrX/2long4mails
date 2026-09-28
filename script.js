'use strict';
/**
 * Opening sequence:
 * bt-1 -> bt-2 -> crown.webp -> left pillar -> right pillar -> both menus
 */
document.addEventListener('DOMContentLoaded', () => {
  const landing = document.querySelector('.landing');
  const bgOne = document.querySelector('.bg-one');
  const bgTwo = document.querySelector('.bg-two');
  const bgFinal = document.querySelector('.bg-final');
  const leftPillar = document.querySelector('.pillar-left');
  const rightPillar = document.querySelector('.pillar-right');
  const pillars = [...document.querySelectorAll('.pillar')];

  if (!landing || !bgOne || !bgTwo || !bgFinal || !leftPillar || !rightPillar) {
    console.error('Opening sequence could not start: required landing-page elements are missing.');
    return;
  }

  const debug = (...args) => {
    console.log('[intro]', ...args);
  };

  const wait = (milliseconds) => new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });

  const setPillarOpen = (pillar, open) => {
    const button = pillar.querySelector('.pillar-toggle');
    pillar.classList.toggle('open', open);
    button?.setAttribute('aria-expanded', String(open));
  };

  const runOpeningSequence = async () => {
    debug('start intro sequence');

    landing.classList.add('intro-running');
    debug('entered intro-running state');

    // Hold on bt-1
    await wait(900);
    debug('showing bt-2');
    landing.classList.add('show-two');
    
    // Wait for fade (1400ms) + hold on bt-2
    await wait(1400 + 1200);
    debug('showing crown');
    landing.classList.add('show-final');
    
    // Wait for fade (1400ms) + hold on crown
    await wait(1400 + 1200);
    debug('showing left pillar');
    leftPillar.classList.add('landed');
    
    // Wait for pillar animation (1100ms) + gap
    await wait(1100 + 180);
    debug('showing right pillar');
    rightPillar.classList.add('landed');
    
    // Wait for pillar animation (1100ms) + gap
    await wait(1100 + 180);
    debug('opening menus');
    pillars.forEach((pillar) => setPillarOpen(pillar, true));
    landing.classList.add('intro-complete');
    debug('intro complete');
  };

  document.addEventListener('click', (event) => {
    const button = event.target.closest('.pillar-toggle');
    if (button) {
      event.stopPropagation();
      const pillar = button.closest('.pillar');
      if (pillar) setPillarOpen(pillar, !pillar.classList.contains('open'));
      return;
    }

    if (!event.target.closest('.pillar')) {
      pillars.forEach((pillar) => setPillarOpen(pillar, false));
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      pillars.forEach((pillar) => setPillarOpen(pillar, false));
    }
  });

  runOpeningSequence();
});
