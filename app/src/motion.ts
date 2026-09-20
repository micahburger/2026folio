/**
 * Central place to tune motion. Nothing here should be duplicated elsewhere —
 * change a value here and every consumer picks it up.
 */

// Project-to-project staggered transition (PortfolioShell). Elements move on
// their own offset schedule rather than the whole viewport translating:
// outgoing media first, outgoing copy a fraction later, background color
// throughout, incoming media then incoming copy settle last. Total ~700ms.
export const DECK_EASING = "cubic-bezier(0.65, 0, 0.35, 1)";
// Arrivals get their own curve. The in-out above starts slow, which on an
// entrance delays the moment the visitor is actually watching; a strong
// ease-out puts the movement up front and settles.
export const DECK_ENTER_EASING = "cubic-bezier(0.23, 1, 0.32, 1)";
export const DECK_MEDIA_OUT_MS = 320;
export const DECK_MEDIA_OUT_DELAY_MS = 0;
export const DECK_COPY_OUT_MS = 320;
export const DECK_COPY_OUT_DELAY_MS = 120;
export const DECK_BG_MS = 560;
export const DECK_MEDIA_IN_MS = 380;
export const DECK_MEDIA_IN_DELAY_MS = 160;
export const DECK_COPY_IN_MS = 380;
export const DECK_COPY_IN_DELAY_MS = 320;
export const DECK_SHIFT_PX = 40;
export const DECK_COPY_SHIFT_PX = 16;
// Total time the overlay (both leaving + entering project) stays mounted.
export const DECK_TRANSITION_MS = DECK_COPY_IN_DELAY_MS + DECK_COPY_IN_MS; // 700ms

// Within-project media gallery: the examples sit side by side on a track that
// slides, and the visitor can grab and throw it. The old crossfade said
// nothing about there being more to see; a slide shows the next example
// arriving from the edge it lives on, which is the whole affordance.
//
// Two speeds, because the same swap means different things. Left to drift on
// its own, the slide is the pace of the page and can take its time. Asked for
// — a dot, an arrow key, a thrown swipe — it's a response to input, and
// anything near a second reads as the site lagging behind the hand. It also
// gets its own curve: a drift eases in and out of the move, while a release
// has to leave at the speed it was thrown and settle, which is all ease-out.
export const MEDIA_SLIDE_AUTO_MS = 700;
export const MEDIA_SLIDE_MANUAL_MS = 400;
export const MEDIA_SLIDE_REDUCED_MS = 120;
export const MEDIA_SLIDE_AUTO_EASING = "cubic-bezier(0.65, 0, 0.35, 1)";
export const MEDIA_SLIDE_MANUAL_EASING = "cubic-bezier(0.32, 0.72, 0, 1)";

/** How long the track takes to settle onto a slide — also how long the
 * committed index waits before it catches up with the one being shown. */
export function mediaSlideMs(source: "auto" | "manual") {
  if (prefersReducedMotion()) return MEDIA_SLIDE_REDUCED_MS;
  return source === "auto" ? MEDIA_SLIDE_AUTO_MS : MEDIA_SLIDE_MANUAL_MS;
}

// What counts as a swipe rather than a nudge. Distance is a fraction of the
// stage's own width, not a pixel count, so the same gesture reads the same on
// a phone and on a 786px desktop box. Velocity is the escape hatch for a fast
// flick that never travelled far — without it, a quick throw snaps back, which
// feels like the page ignoring you.
export const MEDIA_DRAG_COMMIT_RATIO = 0.2;
export const MEDIA_DRAG_FLICK_VELOCITY = 0.45; // px per ms

export const MEDIA_AUTOPLAY_MS = 4200; // dwell time before auto-advancing

// Overview <-> project FLIP zoom.
export const OVERVIEW_TRANSITION_MS = 650;
export const OVERVIEW_EASING = "cubic-bezier(0.65, 0, 0.35, 1)";
export const OVERVIEW_FADE_MS = 300;

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
