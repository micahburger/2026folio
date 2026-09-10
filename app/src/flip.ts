import { OVERVIEW_EASING, OVERVIEW_TRANSITION_MS } from "./motion";

export type Rect = Pick<DOMRect, "top" | "left" | "width" | "height">;

// Web Animations API gives us a real Animation handle we can cancel — that's
// the piece a hand-rolled "set inline style, setTimeout to clear it" version
// is missing, and exactly what makes rapid open/close/reselect interruptions
// leave elements stuck mid-transform. Every element here can only ever run
// one of these at a time; starting a new one cancels whatever was playing.
const runningAnimations = new WeakMap<HTMLElement, Animation>();

function runExclusive(element: HTMLElement, keyframes: Keyframe[], options: KeyframeAnimationOptions) {
  runningAnimations.get(element)?.cancel();
  const animation = element.animate(keyframes, options);
  runningAnimations.set(element, animation);
  animation.finished.catch(() => {
    /* cancellation is expected when a newer transition interrupts this one */
  });
  return animation;
}

function releaseWhenSettled(element: HTMLElement, animation: Animation, onRelease?: () => void) {
  animation.finished
    .then(() => {
      if (runningAnimations.get(element) === animation) {
        animation.cancel();
        runningAnimations.delete(element);
        onRelease?.();
      }
    })
    .catch(() => {});
}

/**
 * Both zoom functions temporarily pull the .project-view out of normal flow
 * (position: fixed, viewport-relative) for the duration of the animation.
 * This is the fix for the "zoom happens inside the tiny grid cell" bug: the
 * element's real parent (.overview-frame) is already sized to its final
 * small grid-cell box the instant CSS Grid lays out the overview — nothing
 * about that reflow is animated. If the zooming element stays inside that
 * box, its own overflow:hidden clips the zoom to a tiny window the whole
 * time. Escaping to position:fixed removes that clipping ancestor entirely,
 * so the element can visually occupy the full viewport while it shrinks
 * toward the cell (or grows away from it), landing exactly on the cell's
 * on-screen position. Once settled, the fixed override is cleared and the
 * element falls back to whatever the CSS cascade naturally specifies —
 * fullscreen for project mode, the container-query scale for the grid.
 */

function withEscapedPosition(element: HTMLElement, backgroundColor: string) {
  element.style.position = "fixed";
  element.style.zIndex = "50";
  // The element itself must carry the page's own background color while it's
  // the thing traveling/scaling — otherwise only the bare content (text,
  // media) zooms while the "page" look (the solid colored/white rect behind
  // it) just appears at the destination size, unanimated.
  element.style.backgroundColor = backgroundColor;
}

function clearEscapedPosition(element: HTMLElement) {
  element.style.position = "";
  element.style.zIndex = "";
  element.style.transform = "";
  element.style.transformOrigin = "";
  element.style.backgroundColor = "";
}

/** Entering overview: element is currently fullscreen (`fromRect`), animate
 * it down to the on-screen position of its grid cell (`cellEl`, already
 * laid out in its final overview position by the time this runs). */
export function zoomToOverview(
  element: HTMLElement,
  cellEl: HTMLElement,
  fromRect: Rect,
  backgroundColor: string
): Animation {
  const cell = cellEl.getBoundingClientRect();
  // Cover, not fit-by-width — must match .project-view--overview's own
  // scale(max(...)) in global.css, or the element pops to a different size
  // the instant the animation ends and CSS takes back over.
  const scale = Math.max(cell.width / fromRect.width, cell.height / fromRect.height);
  const targetTransform = `translate(${cell.left}px, ${cell.top}px) scale(${scale})`;

  element.style.transformOrigin = "top left";
  withEscapedPosition(element, backgroundColor);

  const animation = runExclusive(element, [{ transform: "none" }, { transform: targetTransform }], {
    duration: OVERVIEW_TRANSITION_MS,
    easing: OVERVIEW_EASING,
    fill: "both",
  });
  releaseWhenSettled(element, animation, () => clearEscapedPosition(element));
  return animation;
}

/**
 * Overview -> project, played BEFORE the mode switch: the picked cell grows
 * out of the gallery and fills the viewport while the rest of the grid stays
 * put behind it.
 *
 * Switching modes first (see zoomFromOverview) meant the project's own
 * background covered the whole gallery the instant you clicked, and the
 * content only zoomed in afterwards — the cell never appeared to travel.
 * Here nothing about the page changes until the growth lands.
 *
 * Cleanup is deliberately left to the caller: the escape hatch has to stay
 * on until the mode switch has actually committed, or the element drops back
 * into its little cell for a frame first. Call `resetFlip` once it has.
 */
export function zoomCellToFullscreen(
  element: HTMLElement,
  cellRect: Rect,
  backgroundColor: string
): Animation {
  // Same cover math as the other two — the element is already viewport-sized
  // and merely scaled down into its cell, so this reproduces exactly where it
  // currently appears, then releases it to its natural full size.
  const scale = Math.max(cellRect.width / window.innerWidth, cellRect.height / window.innerHeight);
  const startTransform = `translate(${cellRect.left}px, ${cellRect.top}px) scale(${scale})`;

  element.style.transformOrigin = "top left";
  withEscapedPosition(element, backgroundColor);

  return runExclusive(element, [{ transform: startTransform }, { transform: "none" }], {
    duration: OVERVIEW_TRANSITION_MS,
    easing: OVERVIEW_EASING,
    fill: "both",
  });
}


/**
 * A fade can interrupt a zoom — click through the gallery quickly and the
 * same element gets zoomed, then faded, before the zoom settles. The zoom
 * escapes the element to position:fixed up front and only undoes that when
 * it finishes, so an interrupted one left the element pinned over the page
 * forever: several projects stacked on screen at once, each stuck fixed.
 * A fade never wants that escape hatch, so it drops it before starting.
 */
export function fadeIn(element: HTMLElement, durationMs: number): Animation {
  clearEscapedPosition(element);
  const animation = runExclusive(element, [{ opacity: 0 }, { opacity: 1 }], {
    duration: durationMs,
    easing: "ease",
    fill: "both",
  });
  releaseWhenSettled(element, animation);
  return animation;
}

export function fadeOut(element: HTMLElement, durationMs: number): Animation {
  clearEscapedPosition(element);
  const animation = runExclusive(element, [{ opacity: 1 }, { opacity: 0.15 }], {
    duration: durationMs,
    easing: "ease",
    fill: "both",
  });
  releaseWhenSettled(element, animation);
  return animation;
}

/** Cancels any in-flight animation on this element and clears inline leftovers. */
export function resetFlip(element: HTMLElement) {
  runningAnimations.get(element)?.cancel();
  runningAnimations.delete(element);
  clearEscapedPosition(element);
}
