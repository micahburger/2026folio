/**
 * Central place to tune motion. Nothing here should be duplicated elsewhere —
 * change a value here and every consumer picks it up.
 */

// Project-to-project staggered transition (PortfolioShell). Elements move on
// their own offset schedule rather than the whole viewport translating:
// outgoing media first, outgoing copy a fraction later, background color
// throughout, incoming media then incoming copy settle last. Total ~700ms.
export const DECK_EASING = "cubic-bezier(0.65, 0, 0.35, 1)";
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

// Within-project media gallery transition: one 800ms opacity crossfade
// everywhere, defined in global.css (CSS can't read these).
export const MEDIA_TRANSITION_MS = 800;
/** How long the outgoing layer stays mounted — it has to outlast the fade. */
export const MEDIA_LAYER_HOLD_MS = MEDIA_TRANSITION_MS;
export const MEDIA_AUTOPLAY_MS = 4200; // dwell time before auto-advancing

// Overview <-> project FLIP zoom.
export const OVERVIEW_TRANSITION_MS = 650;
export const OVERVIEW_EASING = "cubic-bezier(0.65, 0, 0.35, 1)";
export const OVERVIEW_FADE_MS = 300;

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
