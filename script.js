'use strict';
/**
 * Opening sequence:
 * bt-1 -> bt-2 -> crown.webp -> left pillar -> right pillar -> both menus
 *
 * The sequence does not begin until all three scene images have loaded and
 * decoded.
 * CSS handles the actual animation; JavaScript only advances the states.
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

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const TIMING = Object.freeze({
    firstImageHold: 900,
    secondImageHold: 750,
    finalImageHold: 350,
    betweenPillars: 140,
    beforeMenus: 140,
  });

  const wait = (milliseconds) => new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });

  const prepareImage = async (image) => {
    if (!(image instanceof HTMLImageElement)) return;
    if (!image.complete) {
      await new Promise((resolve, reject) => {
        image.addEventListener('load', resolve, { once: true });
        image.addEventListener('error', reject, { once: true });
      });
    }
    if (image.naturalWidth === 0) {
      throw new Error(`Image failed to load: ${image.currentSrc || image.src}`);
    }
    if (typeof image.decode === 'function') {
      try {
        await image.decode();
      } catch (error) {
        console.warn('Image decode() did not resolve cleanly; continuing with loaded image.', error);
      }
    }
  };

  const maxCssTime = (value) => {
    if (!value) return 0;
    const parts = value.split(',');
    const times = parts.map((part) => {
      const trimmed = part.trim();
      if (!trimmed) return 0;
      if (trimmed.endsWith('ms')) return Number.parseFloat(trimmed) || 0;
      if (trimmed.endsWith('s')) return (Number.parseFloat(trimmed) || 0) * 1000;
      return 0;
    });
    return Math.max(0, ...times);
  };

  const forceLayout = (element) => {
    void element.offsetWidth;
  };

  const waitForTransition = (element, propertyName, fallbackMs = 3000) => (
    new Promise((resolve) => {
      if (!element) {
        resolve();
        return;
      }

      const computed = window.getComputedStyle(element);
      const duration = maxCssTime(computed.transitionDuration);
      const delay = maxCssTime(computed.transitionDelay);
      const timeout = duration > 0 ? duration + delay + 120 : fallbackMs;
      let settled = false;
      let timerId = null;

      const finish = () => {
        if (settled) return;
        settled = true;
        if (timerId) window.clearTimeout(timerId);
        element.removeEventListener('transitionend', onEnd);
        element.removeEventListener('transitioncancel', finish);
        resolve();
      };

      const onEnd = (event) => {
        if (event.target === element && (!propertyName || event.propertyName === propertyName)) {
          finish();
        }
      };

      timerId = window.setTimeout(finish, timeout);
      element.addEventListener('transitionend', onEnd);
      element.addEventListener('transitioncancel', finish, { once: true });
    })
  );

  const waitForAnimation = (element, animationName, fallbackMs = 1200) => (
    new Promise((resolve) => {
      if (!element) {
        resolve();
        return;
      }

      const computed = window.getComputedStyle(element);
      const duration = maxCssTime(computed.animationDuration);
      const delay = maxCssTime(computed.animationDelay);
      const timeout = duration > 0 ? duration + delay + 120 : fallbackMs;
      let settled = false;
      let timerId = null;

      const finish = () => {
        if (settled) return;
        settled = true;
        if (timerId) window.clearTimeout(timerId);
        element.removeEventListener('animationend', onEnd);
        element.removeEventListener('animationcancel', finish);
        resolve();
      };

      const onEnd = (event) => {
        if (event.target === element && (!animationName || event.animationName === animationName)) {
          finish();
        }
      };

      timerId = window.setTimeout(finish, timeout);
      element.addEventListener('animationend', onEnd);
      element.addEventListener('animationcancel', finish, { once: true });
    })
  );

  const setPillarOpen = (pillar, open) => {
    const button = pillar.querySelector('.pillar-toggle');
    pillar.classList.toggle('open', open);
    button?.setAttribute('aria-expanded', String(open));
  };

  const finishImmediately = () => {
    const fallbackImage = [bgFinal, bgTwo, bgOne].find((image) => image.naturalWidth > 0);
    landing.classList.add('intro-running', 'intro-complete');

    if (fallbackImage === bgFinal) {
      landing.classList.add('show-two', 'show-final');
    } else if (fallbackImage === bgTwo) {
      landing.classList.add('show-two');
    }

    if (fallbackImage) {
      fallbackImage.style.opacity = '1';
      fallbackImage.style.visibility = 'visible';
    }

    leftPillar.classList.add('landed');
    rightPillar.classList.add('landed');
    pillars.forEach((pillar) => setPillarOpen(pillar, true));
  };

  const runOpeningSequence = async () => {
    debug('start intro sequence');

    try {
      debug('waiting for images');
      await Promise.all([
        prepareImage(bgOne),
        prepareImage(bgTwo),
        prepareImage(bgFinal),
      ]);
      debug('images ready');
    } catch (error) {
      console.error('A critical opening image did not load. Showing the final layout instead.', error);
      finishImmediately();
      return;
    }

    if (reduceMotion) {
      debug('reduced motion enabled');
      finishImmediately();
      return;
    }

    landing.classList.add('intro-running');
    debug('entered intro-running state');

    await wait(TIMING.firstImageHold);
    debug('after first hold; showing bg-two');
    const secondImageVisible = waitForTransition(bgTwo, 'opacity');
    forceLayout(bgTwo);
    landing.classList.add('show-two');
    await secondImageVisible;
    debug('bg-two visible');

    await wait(TIMING.secondImageHold);
    debug('after second hold; showing bg-final');
    const finalImageVisible = waitForTransition(bgFinal, 'opacity');
    forceLayout(bgFinal);
    landing.classList.add('show-final');
    await finalImageVisible;
    debug('bg-final visible');

    await wait(TIMING.finalImageHold);
    debug('showing left pillar');
    const leftLanded = waitForAnimation(leftPillar, 'pillar-slam');
    forceLayout(leftPillar);
    leftPillar.classList.add('landed');
    await leftLanded;
    debug('left pillar landed');

    await wait(TIMING.betweenPillars);
    debug('showing right pillar');
    const rightLanded = waitForAnimation(rightPillar, 'pillar-slam');
    forceLayout(rightPillar);
    rightPillar.classList.add('landed');
    await rightLanded;
    debug('right pillar landed');

    await wait(TIMING.beforeMenus);
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
