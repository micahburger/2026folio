import type { CSSProperties } from "react";
import type { ProjectMediaItem } from "../data/types";
import type { MediaChangeSource, MediaPhase } from "../hooks/useMediaGallery";
import MediaFrame from "./MediaFrame";

export interface MediaGalleryState {
  /** The slide the track's geometry is built around — still the outgoing one
   * while a settle is in flight. Positions come from this. */
  index: number;
  /** The slide being shown — the incoming one from the moment a settle
   * starts. Dots, labels and per-example colour come from this. */
  activeIndex: number;
  phase: MediaPhase;
  /** The track's x offset: px while in hand, a whole-width step otherwise. */
  offset: string;
  source: MediaChangeSource;
  trackRef: React.MutableRefObject<HTMLDivElement | null>;
  goNext: () => void;
  goPrev: () => void;
  goTo: (index: number) => void;
  dragHandlers: {
    onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void;
    onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => void;
    onPointerUp: (event: React.PointerEvent<HTMLDivElement>) => void;
    onPointerCancel: (event: React.PointerEvent<HTMLDivElement>) => void;
  };
}

interface MediaGalleryProps extends MediaGalleryState {
  media: [ProjectMediaItem, ProjectMediaItem, ProjectMediaItem];
  className?: string;
  /** Per-item positioning (e.g. bleed layout's edgeInset) — a layout computes
   * this from the active item since the wrapper itself doesn't know which
   * item is current. */
  style?: CSSProperties;
  /** False while shown as a non-active overview preview — the whole preview
   * is one click target then, so the gallery must not intercept it. */
  interactive?: boolean;
  /** Fixed box every example renders inside of (see MediaFrame) — omitted by
   * bleed layout (Messaging), which keeps each example at its own size. */
  frameSize?: { width: number; height?: number };
}

/**
 * Where slide `i` sits relative to the one on screen, in whole stage widths,
 * taking whichever way round the loop is shorter. With three examples that's
 * always one of -1 (waiting off the left edge), 0 (on screen) or 1 (waiting
 * off the right), so the loop has no seam in either direction: there is
 * always a slide parked just outside both edges to drag into view.
 */
function relativeOffset(i: number, index: number, count: number) {
  let rel = i - index;
  if (rel * 2 > count) rel -= count;
  if (rel * 2 < -count) rel += count;
  return rel;
}

export default function MediaGallery({
  media,
  index,
  activeIndex,
  phase,
  offset,
  source,
  trackRef,
  goNext,
  goPrev,
  goTo,
  dragHandlers,
  className = "",
  style,
  interactive = true,
  frameSize,
}: MediaGalleryProps) {
  const current = media[activeIndex];

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowRight") {
      event.stopPropagation();
      event.preventDefault();
      goNext();
    } else if (event.key === "ArrowLeft") {
      event.stopPropagation();
      event.preventDefault();
      goPrev();
    }
  }

  // The deck listens for swipes on the window to step between projects. A
  // swipe that started on the media is about the examples, not the chapter,
  // so it's stopped here before it can reach that listener. Pointer events
  // drive the drag itself, but they don't suppress the touch events the deck
  // is watching — those are a separate stream and have to be caught too.
  const swallowTouch = (event: React.TouchEvent) => event.stopPropagation();

  return (
    <div
      className={`media-gallery ${className}`}
      style={style}
      tabIndex={interactive ? 0 : undefined}
      role="group"
      aria-roledescription="carousel"
      aria-label={`UI example ${activeIndex + 1} of ${media.length}: ${current.label}`}
      onKeyDown={interactive ? handleKeyDown : undefined}
    >
      <div
        className="media-stage"
        data-phase={phase}
        // Picks the slide's speed and curve in CSS — a swap the visitor asked
        // for is a response to their hand, one the autoplay timer made can
        // drift. Only read while the track is settling.
        data-source={source}
        data-grabbable={interactive ? "" : undefined}
        {...(interactive
          ? {
              ...dragHandlers,
              onTouchStart: swallowTouch,
              onTouchMove: swallowTouch,
              onTouchEnd: swallowTouch,
            }
          : {})}
      >
        <div
          ref={trackRef}
          className="media-track"
          style={{ transform: `translate3d(${offset}, 0, 0)` }}
        >
          {media.map((item, i) => (
            <div
              key={item.id}
              className="media-slide"
              // Whole stage widths, so the slide's own box stays the unit —
              // this survives the box being scaled down on a narrow window
              // without any of it having to be measured.
              style={{ "--media-slide-offset": relativeOffset(i, index, media.length) } as CSSProperties}
              aria-hidden={i === activeIndex ? undefined : "true"}
            >
              <MediaFrame item={item} frameSize={frameSize} />
            </div>
          ))}
        </div>
      </div>

      <div className="media-progress" role={interactive ? "tablist" : undefined} aria-label="UI examples">
        {media.map((item, i) =>
          interactive ? (
            <button
              key={item.id}
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={`Show UI example ${i + 1}: ${item.label}`}
              className={`media-progress-mark ${i === activeIndex ? "is-active" : ""}`}
              onClick={(event) => {
                event.stopPropagation();
                goTo(i);
              }}
            />
          ) : (
            <span
              key={item.id}
              className={`media-progress-mark ${i === activeIndex ? "is-active" : ""}`}
            />
          )
        )}
      </div>
    </div>
  );
}
