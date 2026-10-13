'use strict';

(function () {
  // Small helpers
  const wait = ms => new Promise(res => setTimeout(res, ms));
  const debug = (...args) => console.log('[intro]', ...args);

  // Toggle pillar open state (scoped to a pillar element)
  const setPillarOpen = (pillar, open) => {
    const button = pillar.querySelector('.pillar-toggle');
    pillar.classList.toggle('open', open);
    button?.setAttribute('aria-expanded', String(open));
  };

  // Create and return an object with functions bound to a specific root element.
  function createLandingController(root = document) {
    const landing = root.querySelector('.landing');
    if (!landing) return null;

    // Avoid double-initializing the same root
    if (landing.dataset.landingInit === '1') return null;
    landing.dataset.landingInit = '1';

    // Scoped queries (so the script can run on any page/container)
    const bgOne = landing.querySelector('.bg-one');
    const bgTwo = landing.querySelector('.bg-two');
    const bgFinal = landing.querySelector('.bg-final');
    const leftPillar = landing.querySelector('.pillar-left');
    const rightPillar = landing.querySelector('.pillar-right');
    const pillars = [...landing.querySelectorAll('.pillar')];

    // Pillar controls (shared by both full and pillar-only modes)
    const handleDocumentClick = (event) => {
      const button = event.target.closest?.('.pillar-toggle');
      if (button) {
        event.stopPropagation();
        const pillar = button.closest('.pillar');
        if (pillar) setPillarOpen(pillar, !pillar.classList.contains('open'));
        return;
      }

      if (!event.target.closest?.('.pillar')) {
        pillars.forEach(p => setPillarOpen(p, false));
      }
    };

    const handleKeydown = (event) => {
      if (event.key === 'Escape') pillars.forEach(p => setPillarOpen(p, false));
    };

    // Attach global handlers once (safe even if multiple controllers exist)
    // Use a symbol on document to avoid name collisions
    const GLOBAL_HANDLERS_FLAG = '__landing_global_handlers_attached';
    if (!document[GLOBAL_HANDLERS_FLAG]) {
      document.addEventListener('click', handleDocumentClick);
      document.addEventListener('keydown', handleKeydown);
      document[GLOBAL_HANDLERS_FLAG] = true;
    }

    // Full opening sequence (images + pillars)
    const runOpeningSequence = async () => {
      debug('start intro sequence');

      if (!bgOne || !bgTwo || !bgFinal || !leftPillar || !rightPillar) {
        debug('missing full-scene elements, falling back to pillar-only sequence');
        await runPillarOnlySequence();
        return;
      }

      landing.classList.add('intro-running');
      debug('entered intro-running state');

      // Hold on bt-1
      await wait(900);
      debug('showing bt-2');
      landing.classList.add('show-two');

      // Wait for fade (2200ms) + hold (1200ms)
      await wait(2200 + 1200);
      debug('showing crown');
      landing.classList.add('show-final');

      // Wait for fade (2200ms) + hold (1200ms)
      await wait(2200 + 1200);
      debug('showing left pillar');
      leftPillar.classList.add('landed');

      await wait(1100 + 180);
      debug('showing right pillar');
      rightPillar.classList.add('landed');

      await wait(1100 + 180);
      debug('opening menus');
      pillars.forEach((pillar) => setPillarOpen(pillar, true));
      landing.classList.add('intro-complete');
      debug('intro complete');
    };

    // Shorter sequence that only covers the pillars (useful on other pages)
    const runPillarOnlySequence = async () => {
      debug('start pillar-only sequence');

      landing.classList.add('intro-running');
      // small initial pause so CSS has a tick to apply intro-running
      await wait(80);

      leftPillar?.classList.add('landed');
      await wait(1100 + 180);
      rightPillar?.classList.add('landed');
      await wait(1100 + 180);

      pillars.forEach((pillar) => setPillarOpen(pillar, true));
      landing.classList.add('intro-complete');
      debug('pillar-only complete');
    };

    return {
      runOpeningSequence,
      runPillarOnlySequence,
      elements: { landing, bgOne, bgTwo, bgFinal, leftPillar, rightPillar, pillars }
    };
  }

  // Public API: initLanding(root?) and initPillars(root?)
  function initLanding(root = document) {
    const c = createLandingController(root);
    if (!c) return null;

    // If we have the full images, run the full sequence; otherwise, run pillar-only.
    const { elements, runOpeningSequence, runPillarOnlySequence } = c;
    const haveImages = elements.bgOne && elements.bgTwo && elements.bgFinal && elements.leftPillar && elements.rightPillar;
    if (haveImages) {
      runOpeningSequence();
    } else {
      runPillarOnlySequence();
    }
    return c;
  }

  // If you only want the pillars (no image-intro), call this
  function initPillars(root = document) {
    const c = createLandingController(root);
    if (!c) return null;
    c.runPillarOnlySequence();
    return c;
  }

  // Auto-init on pages that include the .landing markup
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => initLanding(document));
  } else {
    // already parsed
    initLanding(document);
  }

  // Expose API for other pages/scripts to call manually
  window.initLanding = initLanding;
  window.initPillars = initPillars;
})();
