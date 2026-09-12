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

// Within-project media gallery transition: an opacity crossfade, defined in
// global.css (CSS can't read these, so the values there are hand-kept).
//
// Two speeds, because the same swap means different things. Left to drift on
// its own, the fade is the pace of the page and can be slow. Asked for — a
// dot, the image, an arrow key, a swipe — it's a response to input, and
// anything near a second reads as the site lagging behind the click.
export const MEDIA_FADE_AUTO_MS = 800;
export const MEDIA_FADE_MANUAL_MS = 250;
export const MEDIA_FADE_REDUCED_MS = 120;

/** How long the outgoing layer stays mounted — it has to outlast its fade. */
export function mediaLayerHoldMs(source: "auto" | "manual") {
  if (prefersReducedMotion()) return MEDIA_FADE_REDUCED_MS;
  return source === "auto" ? MEDIA_FADE_AUTO_MS : MEDIA_FADE_MANUAL_MS;
}
export const MEDIA_AUTOPLAY_MS = 4200; // dwell time before auto-advancing

// Overview <-> project FLIP zoom.
export const OVERVIEW_TRANSITION_MS = 650;
export const OVERVIEW_EASING = "cubic-bezier(0.65, 0, 0.35, 1)";
export const OVERVIEW_FADE_MS = 300;

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
