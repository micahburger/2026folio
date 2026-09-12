import { useCallback, useEffect, useRef, useState } from "react";
import { MEDIA_AUTOPLAY_MS, mediaLayerHoldMs, prefersReducedMotion } from "../motion";

/** Who asked for the change — the autoplay timer, or the visitor. Decides how
 * fast the crossfade runs (see motion.ts). */
export type MediaChangeSource = "auto" | "manual";

interface UseMediaGalleryOptions {
  count: number;
  isActive: boolean;
  initialIndex: number;
  onIndexChange?: (index: number) => void;
  /** Auto-advances through the examples on a timer, looping back to 0. */
  autoplay?: boolean;
}

export function useMediaGallery({
  count,
  isActive,
  initialIndex,
  onIndexChange,
  autoplay = false,
}: UseMediaGalleryOptions) {
  const [index, setIndexState] = useState(initialIndex);
  const indexRef = useRef(initialIndex);
  const [previousIndex, setPreviousIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [source, setSource] = useState<MediaChangeSource>("auto");
  const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  // Sync to whatever index the caller has saved for this project the moment
  // it (re)activates — a fresh project-to-project step resets that saved
  // value to 0 upstream; jumping back in from overview leaves it untouched.
  const wasActive = useRef(isActive);
  useEffect(() => {
    if (isActive && !wasActive.current) {
      setIndexState(initialIndex);
      indexRef.current = initialIndex;
      setPreviousIndex(null);
    }
    wasActive.current = isActive;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  const goTo = useCallback(
    (nextIndex: number, changeSource: MediaChangeSource = "manual") => {
      const current = indexRef.current;
      const normalized = ((nextIndex % count) + count) % count;
      if (normalized === current) return;

      setDirection(normalized > current || (current === count - 1 && normalized === 0) ? 1 : -1);
      setSource(changeSource);
      setPreviousIndex(current);
      setIndexState(normalized);
      indexRef.current = normalized;
      onIndexChange?.(normalized);

      if (clearTimer.current) clearTimeout(clearTimer.current);
      clearTimer.current = setTimeout(
        () => setPreviousIndex(null),
        mediaLayerHoldMs(changeSource)
      );
    },
    [count, onIndexChange]
  );

  const goNext = useCallback(() => goTo(indexRef.current + 1), [goTo]);
  const goPrev = useCallback(() => goTo(indexRef.current - 1), [goTo]);

  // Auto-advance on a timer, looping back to the first item. Restarts its
  // dwell time on every index change (manual or automatic) so a click never
  // gets immediately followed by an auto-advance.
  useEffect(() => {
    if (!autoplay || count <= 1 || prefersReducedMotion()) return;
    const id = setTimeout(() => goTo(indexRef.current + 1, "auto"), MEDIA_AUTOPLAY_MS);
    return () => clearTimeout(id);
  }, [autoplay, count, goTo, index]);

  useEffect(() => {
    return () => {
      if (clearTimer.current) clearTimeout(clearTimer.current);
    };
  }, []);

  return {
    index,
    previousIndex,
    direction,
    source,
    goNext,
    goPrev,
    goTo,
  };
}
