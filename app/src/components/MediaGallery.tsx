import { useRef, type CSSProperties } from "react";
import type { ProjectMediaItem } from "../data/types";
import MediaFrame from "./MediaFrame";

export interface MediaGalleryState {
  index: number;
  previousIndex: number | null;
  direction: 1 | -1;
  goNext: () => void;
  goPrev: () => void;
  goTo: (index: number) => void;
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
  /** Suppresses the built-in progress dots — set when a layout renders its own. */
  hideProgress?: boolean;
  /** Fixed box every example renders inside of (see MediaFrame) — omitted by
   * bleed layout (Messaging), which keeps each example at its own size. */
  frameSize?: { width: number; height: number };
}

const SWIPE_THRESHOLD_PX = 40;

export default function MediaGallery({
  media,
  index,
  previousIndex,
  direction,
  goNext,
  goPrev,
  goTo,
  className = "",
  style,
  interactive = true,
  hideProgress = false,
  frameSize,
}: MediaGalleryProps) {
  const touchStartX = useRef<number | null>(null);
  const current = media[index];

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

  function handleStageClick(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const clickedRight = event.clientX - rect.left > rect.width / 2;
    if (clickedRight) goNext();
    else goPrev();
  }

  function handleTouchStart(event: React.TouchEvent) {
    // Swiping the media changes the example, not the project — stop it
    // here so the deck-level swipe listener never also sees this gesture.
    event.stopPropagation();
    touchStartX.current = event.touches[0].clientX;
  }

  function handleTouchEnd(event: React.TouchEvent) {
    event.stopPropagation();
    if (touchStartX.current === null) return;
    const deltaX = event.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX) return;
    if (deltaX < 0) goNext();
    else goPrev();
  }

  return (
    <div
      className={`media-gallery ${className}`}
      style={style}
      tabIndex={interactive ? 0 : undefined}
      role="group"
      aria-roledescription="media gallery"
      aria-label={`UI example ${index + 1} of ${media.length}: ${current.label}`}
      onKeyDown={interactive ? handleKeyDown : undefined}
    >
      <div
        className="media-stage"
        onClick={interactive ? handleStageClick : undefined}
        onTouchStart={interactive ? handleTouchStart : undefined}
        onTouchEnd={interactive ? handleTouchEnd : undefined}
      >
        {previousIndex !== null && (
          <div
            key={`exit-${previousIndex}`}
            className="media-layer media-layer--exit"
            data-direction={direction}
            aria-hidden="true"
          >
            <MediaFrame item={media[previousIndex]} frameSize={frameSize} />
          </div>
        )}
        <div key={`enter-${index}`} className="media-layer media-layer--enter" data-direction={direction}>
          <MediaFrame item={current} frameSize={frameSize} />
        </div>
      </div>

      {!hideProgress && (
        <div className="media-progress" role={interactive ? "tablist" : undefined} aria-label="UI examples">
          {media.map((item, i) =>
            interactive ? (
              <button
                key={item.id}
                role="tab"
                aria-selected={i === index}
                className={`media-progress-mark ${i === index ? "is-active" : ""}`}
                onClick={(event) => {
                  event.stopPropagation();
                  goTo(i);
                }}
              />
            ) : (
              <span
                key={item.id}
                className={`media-progress-mark ${i === index ? "is-active" : ""}`}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}
