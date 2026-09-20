import { useCallback, useEffect, useRef, useState } from "react";
import {
  MEDIA_AUTOPLAY_MS,
  MEDIA_DRAG_COMMIT_RATIO,
  MEDIA_DRAG_FLICK_VELOCITY,
  mediaSlideMs,
  prefersReducedMotion,
} from "../motion";

/** Who asked for the change — the autoplay timer, or the visitor. Decides how
 * fast the track slides and on which curve (see motion.ts). */
export type MediaChangeSource = "auto" | "manual";

/** idle: parked on a slide. dragging: the visitor has hold of the track.
 * settling: animating onto a slide, either the one they threw it to or back
 * to the one it started on. Only `settling` gets a CSS transition. */
export type MediaPhase = "idle" | "dragging" | "settling";

interface UseMediaGalleryOptions {
  count: number;
  isActive: boolean;
  initialIndex: number;
  onIndexChange?: (index: number) => void;
  /** Auto-advances through the examples on a timer, looping back to 0. */
  autoplay?: boolean;
}

/** A settle in flight. `to` is where it lands; `dir` is which way the track
 * travels to get there (0 when a released drag didn't earn a change and the
 * track is going back where it came from). */
interface Settle {
  to: number;
  dir: -1 | 0 | 1;
  source: MediaChangeSource;
}

const wrap = (i: number, count: number) => ((i % count) + count) % count;

/**
 * Which way round the loop is shorter. With exactly three examples (which is
 * what the project type guarantees) every target is one step away, which is
 * why the track only ever has to render the previous, current and next slide
 * — see MediaGallery.
 */
function shortestDir(from: number, to: number, count: number): -1 | 1 {
  const forward = wrap(to - from, count);
  return forward * 2 <= count ? 1 : -1;
}

export function useMediaGallery({
  count,
  isActive,
  initialIndex,
  onIndexChange,
  autoplay = false,
}: UseMediaGalleryOptions) {
  // The index the track's geometry is built around. While a settle is in
  // flight this is still the *outgoing* one — the slides hold their positions
  // and only the track moves, so the committed index can't catch up until the
  // track is reset (see the commit timer below).
  const [index, setIndexState] = useState(initialIndex);
  const indexRef = useRef(initialIndex);
  const [settle, setSettle] = useState<Settle | null>(null);
  const settleRef = useRef<Settle | null>(null);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const trackRef = useRef<HTMLDivElement | null>(null);
  const commitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Through a ref, not a dependency. Every caller passes an inline arrow, so
  // depending on it would hand `step` a new identity on each render — and the
  // autoplay effect below, which depends on `step`, would tear down and
  // restart its dwell timer every time, so it could never reach the end of it.
  const notifyRef = useRef(onIndexChange);
  useEffect(() => {
    notifyRef.current = onIndexChange;
  }, [onIndexChange]);

  // What the visitor is looking at, which during a settle is already the
  // incoming example — the dots, the aria label and the panel chapter's
  // background colour all follow this, so they change as the slide starts
  // travelling rather than 400ms after it has arrived.
  const activeIndex = settle ? settle.to : index;

  useEffect(() => {
    indexRef.current = index;
  }, [index]);
  useEffect(() => {
    settleRef.current = settle;
  }, [settle]);

  const clearCommit = useCallback(() => {
    if (commitTimer.current) clearTimeout(commitTimer.current);
    commitTimer.current = null;
  }, []);

  /**
   * Lands the track. The committed index moves to wherever the settle was
   * heading and the track's offset returns to zero in the same render — the
   * slide that was sitting one width over becomes the slide sitting at zero,
   * so the two changes cancel out on screen and nothing moves. Doing either
   * one without the other is a full-width jump.
   */
  const commit = useCallback(() => {
    clearCommit();
    const pending = settleRef.current;
    if (!pending) return;
    settleRef.current = null;
    indexRef.current = pending.to;
    setIndexState(pending.to);
    setSettle(null);
    setDragX(0);
  }, [clearCommit]);

  /** Starts a settle. `to === index` with dir 0 is the snap back. */
  const startSettle = useCallback(
    (to: number, dir: -1 | 0 | 1, source: MediaChangeSource) => {
      const next: Settle = { to, dir, source };
      settleRef.current = next;
      setSettle(next);
      setIsDragging(false);
      if (to !== indexRef.current) notifyRef.current?.(to);
      clearCommit();
      commitTimer.current = setTimeout(commit, mediaSlideMs(source));
    },
    [clearCommit, commit]
  );

  /**
   * One step round the loop. A settle already in flight is landed first, so
   * the step always starts from a track parked at zero — that's what keeps a
   * fast run of dot clicks from compounding offsets.
   */
  const step = useCallback(
    (dir: -1 | 1, source: MediaChangeSource) => {
      if (count <= 1) return;
      if (settleRef.current) commit();
      startSettle(wrap(indexRef.current + dir, count), dir, source);
    },
    [commit, count, startSettle]
  );

  const goTo = useCallback(
    (target: number, source: MediaChangeSource = "manual") => {
      if (count <= 1) return;
      const normalized = wrap(target, count);
      const from = settleRef.current ? settleRef.current.to : indexRef.current;
      if (normalized === from) return;
      step(shortestDir(from, normalized, count), source);
    },
    [count, step]
  );

  const goNext = useCallback(() => step(1, "manual"), [step]);
  const goPrev = useCallback(() => step(-1, "manual"), [step]);

  // ---- drag ---------------------------------------------------------------

  const gesture = useRef<{
    pointerId: number;
    startX: number;
    base: number;
    lastX: number;
    lastT: number;
    velocity: number;
  } | null>(null);

  /** The track's live x offset in px, read mid-transition. getComputedStyle
   * reports the animated value, not the declared one, which is what lets a
   * grab pick a moving track up exactly where it is instead of snapping it. */
  function liveOffset() {
    const el = trackRef.current;
    if (!el) return 0;
    const transform = getComputedStyle(el).transform;
    if (!transform || transform === "none") return 0;
    try {
      return new DOMMatrixReadOnly(transform).m41;
    } catch {
      return 0;
    }
  }

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (count <= 1) return;
      // Mouse: primary button only, so a right-click never starts a drag.
      if (event.pointerType === "mouse" && event.button !== 0) return;

      // Catching a settle mid-flight hands control back rather than fighting
      // it: the offset carries over, the pending target is dropped, and the
      // release below decides again from where the track actually is.
      const base = settleRef.current ? liveOffset() : 0;
      clearCommit();
      settleRef.current = null;
      setSettle(null);

      gesture.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        base,
        lastX: event.clientX,
        lastT: event.timeStamp,
        velocity: 0,
      };
      setDragX(base);
      setIsDragging(true);
      event.currentTarget.setPointerCapture?.(event.pointerId);
    },
    [clearCommit, count]
  );

  const onPointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const g = gesture.current;
    if (!g || g.pointerId !== event.pointerId) return;

    // Sampled per move rather than over the whole gesture: what decides a
    // flick is how fast the hand was going when it let go, not its average
    // over a drag that may have paused halfway.
    const dt = event.timeStamp - g.lastT;
    if (dt > 0) g.velocity = (event.clientX - g.lastX) / dt;
    g.lastX = event.clientX;
    g.lastT = event.timeStamp;

    // Clamped to one width in each direction. Only three slides exist, at one
    // width either side, so past that there is nothing left to show and the
    // track would drag empty space into view.
    const width = trackRef.current?.offsetWidth || 1;
    const raw = g.base + (event.clientX - g.startX);
    setDragX(Math.max(-width, Math.min(width, raw)));
  }, []);

  const endGesture = useCallback(
    (event: React.PointerEvent<HTMLDivElement>, cancelled: boolean) => {
      const g = gesture.current;
      if (!g || g.pointerId !== event.pointerId) return;
      gesture.current = null;
      if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      const width = trackRef.current?.offsetWidth || 1;
      const offset = Math.max(-width, Math.min(width, g.base + (event.clientX - g.startX)));
      const travelled = Math.abs(offset) > width * MEDIA_DRAG_COMMIT_RATIO;
      // A flick only counts toward the direction it's actually moving — a
      // drag left that snaps back right at the last moment shouldn't advance.
      const flicked =
        Math.abs(g.velocity) > MEDIA_DRAG_FLICK_VELOCITY &&
        Math.sign(g.velocity) === Math.sign(offset);

      // A press that never moved — which, now that clicking the media does
      // nothing, is most presses on it. There is nothing to animate back
      // from, so it goes straight to rest rather than spending 400ms
      // "settling" onto the slide it never left.
      if (offset === 0) {
        setIsDragging(false);
        return;
      }
      // pointercancel means the browser took the gesture over (a vertical
      // page scroll on mobile) — never a change, just put the track back.
      if (cancelled || !(travelled || flicked)) {
        startSettle(indexRef.current, 0, "manual");
        return;
      }
      const dir: -1 | 1 = offset < 0 ? 1 : -1;
      startSettle(wrap(indexRef.current + dir, count), dir, "manual");
    },
    [count, startSettle]
  );

  const onPointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => endGesture(event, false),
    [endGesture]
  );
  const onPointerCancel = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => endGesture(event, true),
    [endGesture]
  );

  // ---- lifecycle ----------------------------------------------------------

  // Sync to whatever index the caller has saved for this project the moment
  // it (re)activates — a fresh project-to-project step resets that saved
  // value to 0 upstream; jumping back in from overview leaves it untouched.
  const wasActive = useRef(isActive);
  useEffect(() => {
    if (isActive && !wasActive.current) {
      clearCommit();
      gesture.current = null;
      settleRef.current = null;
      setSettle(null);
      setIsDragging(false);
      setDragX(0);
      setIndexState(initialIndex);
      indexRef.current = initialIndex;
    }
    wasActive.current = isActive;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  // Auto-advance on a timer, looping back to the first item. Restarts its
  // dwell time on every change (whoever asked for it) so a swipe never gets
  // immediately followed by an auto-advance — and holds off entirely while
  // the visitor has the track in hand.
  useEffect(() => {
    if (!autoplay || count <= 1 || isDragging || prefersReducedMotion()) return;
    const id = setTimeout(() => step(1, "auto"), MEDIA_AUTOPLAY_MS);
    return () => clearTimeout(id);
  }, [autoplay, count, isDragging, step, activeIndex]);

  useEffect(() => clearCommit, [clearCommit]);

  const phase: MediaPhase = isDragging ? "dragging" : settle ? "settling" : "idle";

  return {
    index,
    activeIndex,
    phase,
    /** Where the track sits: px while in hand, otherwise a whole-width step
     * (or zero) that the settle transition animates to. */
    offset: isDragging ? `${dragX}px` : settle ? `${settle.dir * -100}%` : "0px",
    source: settle?.source ?? "auto",
    trackRef,
    goNext,
    goPrev,
    goTo,
    dragHandlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel },
  };
}
