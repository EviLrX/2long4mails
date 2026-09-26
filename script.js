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
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
// These are intentional pauses, not animation durations. CSS controls fade/
// drop speed.
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
/**
 * Wait until an <img> is both downloaded and decoded.
 * decode() avoids beginning a fade only to stall on the first frame that
 * needs the image.
 */
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
// Some browsers can reject decode() even though the image is already
// renderable.
// naturalWidth above is the final sanity check, so this is safe to
// continue from.
console.warn('Image decode() did not resolve cleanly; continuing with loaded image.', error);
}
}
};
const maxCssTime = (value) => {
if (!value) return 0;
return Math.max(...value.split(',').map((part) => {
const time = part.trim();
if (time.endsWith('ms')) return Number.parseFloat(time) || 0;
if (time.endsWith('s')) return (Number.parseFloat(time) || 0) * 1000;
return 0;
}));
};
const forceLayout = (element) => {
void element.offsetWidth;
};
/**
 * Resolve when one CSS transition finishes. The computed CSS duration is used
 * to choose a short fallback, while the explicit fallback remains important
 * when a property does not actually change or a browser suppresses events.
 */
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
let timerId;
const finish = () => {
if (settled) return;
settled = true;
window.clearTimeout(timerId);
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
/**
 * Resolve when the pillar slam animation finishes. The helper is called before
 * the .landed class is added, so it deliberately uses the fallback when no
 * animation duration is active yet instead of resolving immediately.
 */
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
let timerId;
const finish = () => {
if (settled) return;
settled = true;
window.clearTimeout(timerId);
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
element.addEventListener('animationcancel', finish);
})
);
const setPillarOpen = (pillar, open) => {
const button = pillar.querySelector('.pillar-toggle');
pillar.classList.toggle('open', open);
button?.setAttribute('aria-expanded', String(open));
};
const finishImmediately = () => {
// Prefer crown.webp, then bt-2, then bt-1 if an asset failed. This prevents
// missing final image from turning the entire landing page black.
const fallbackImage = [bgFinal, bgTwo, bgOne].find((image) =>
image.naturalWidth > 0);
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
try {
// Wait for only the images this sequence actually needs. Using
// window.load would unnecessarily wait for every unrelated page resource.
await Promise.all([
prepareImage(bgOne),
prepareImage(bgTwo),
prepareImage(bgFinal),
]);
} catch (error) {
console.error('A critical opening image did not load. Showing the final layout instead.', error);
finishImmediately();
return;
}
if (reduceMotion) {
finishImmediately();
return;
}
landing.classList.add('intro-running');
await wait(TIMING.firstImageHold);
// bt-1 -> bt-2
const secondImageVisible = waitForTransition(bgTwo, 'opacity');
forceLayout(bgTwo);
landing.classList.add('show-two');
await secondImageVisible;
await wait(TIMING.secondImageHold);
// bt-2 -> crown.webp wallpaper
const finalImageVisible = waitForTransition(bgFinal, 'opacity');
forceLayout(bgFinal);
landing.classList.add('show-final');
await finalImageVisible;
await wait(TIMING.finalImageHold);
// Left pillar slams down.
const leftLanded = waitForAnimation(leftPillar, 'pillar-slam');
forceLayout(leftPillar);
leftPillar.classList.add('landed');
await leftLanded;
await wait(TIMING.betweenPillars);
// Right pillar slams down.
const rightLanded = waitForAnimation(rightPillar, 'pillar-slam');
forceLayout(rightPillar);
rightPillar.classList.add('landed');
await rightLanded;
await wait(TIMING.beforeMenus);
// Final state: both menus drop open together and ENERGY appears.
pillars.forEach((pillar) => setPillarOpen(pillar, true));
landing.classList.add('intro-complete');
};
// Keep the finished menus interactive after the automatic opening sequence.
document.addEventListener('click', (event) => {
const button = event.target.closest('.pillar-toggle');
if (button) {
event.stopPropagation();
const pillar = button.closest('.pillar');
if (pillar) setPillarOpen(pillar, !pillar.classList.contains('open'));
return;
}
// Clicking outside the pillars closes any open menu.
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
