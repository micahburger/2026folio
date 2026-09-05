import { OVERVIEW_EASING, OVERVIEW_TRANSITION_MS } from "./motion";

export type Rect = Pick<DOMRect, "top" | "left" | "width" | "height">;

// Web Animations API gives us a real Animation handle we can cancel — that's
// the piece a hand-rolled "set inline style, setTimeout to clear it" version
// is missing, and exactly what makes rapid open/close/reselect interruptions
// (the reported "buggy" behavior) leave elements stuck mid-transform. Every
// element here can only ever run one of these at a time; starting a new one
// cancels whatever was still playing first.
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

/**
 * Classic FLIP: given where an element WAS (`from`) and where it naturally
 * rests now (its current computed position, reflecting whatever CSS applies
 * post-render), animate from that inverted start to its natural resting
 * transform. Returns the Animation so the caller can await `.finished`.
 */
export function playFlip(element: HTMLElement, from: Rect): Animation {
  const to = element.getBoundingClientRect();

  const deltaX = from.left - to.left;
  const deltaY = from.top - to.top;
  const scaleX = from.width / to.width;
  const scaleY = from.height / to.height;

  // The natural resting transform differs by direction — "none" when
  // settling into fullscreen project mode, a container-query scale() when
  // settling into an overview cell. Read whatever the cascade already
  // resolves to rather than assuming, so both directions animate correctly.
  const restingTransform = getComputedStyle(element).transform;

  element.style.transformOrigin = "top left";

  const animation = runExclusive(
    element,
    [
      { transform: `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})` },
      { transform: restingTransform },
    ],
    { duration: OVERVIEW_TRANSITION_MS, easing: OVERVIEW_EASING, fill: "both" }
  );

  // Once settled, hand control back to the CSS cascade (cancel the WAAPI
  // effect) so responsive rules — the container-query scale in particular —
  // keep tracking window size after the transition itself is done. Skipped
  // if this animation was itself interrupted by a newer one.
  releaseWhenSettled(element, animation);

  return animation;
}

function releaseWhenSettled(element: HTMLElement, animation: Animation) {
  animation.finished
    .then(() => {
      if (runningAnimations.get(element) === animation) {
        animation.cancel();
        runningAnimations.delete(element);
      }
    })
    .catch(() => {});
}

export function fadeIn(element: HTMLElement, durationMs: number): Animation {
  const animation = runExclusive(element, [{ opacity: 0 }, { opacity: 1 }], {
    duration: durationMs,
    easing: "ease",
    fill: "both",
  });
  releaseWhenSettled(element, animation);
  return animation;
}

export function fadeOut(element: HTMLElement, durationMs: number): Animation {
  const animation = runExclusive(element, [{ opacity: 1 }, { opacity: 0.15 }], {
    duration: durationMs,
    easing: "ease",
    fill: "both",
  });
  releaseWhenSettled(element, animation);
  return animation;
}

/** Cancels any in-flight FLIP/fade on this element and clears inline leftovers. */
export function resetFlip(element: HTMLElement) {
  runningAnimations.get(element)?.cancel();
  runningAnimations.delete(element);
}
