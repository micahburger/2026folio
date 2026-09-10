import type { CSSProperties } from "react";
import type { ProjectMediaItem } from "../data/types";

interface MediaFrameProps {
  item: ProjectMediaItem;
  /** Overrides the item's own render width so every example in a chapter
   * shares one fixed width instead of its own natural size — the container
   * never resizes as examples swap. With `height` also given, every example
   * shares that exact box (letterboxed via object-fit: contain); without
   * it, width is fixed but height follows the example's own aspect ratio
   * (so it fills the column width edge to edge). Bleed layout (Messaging)
   * omits this and keeps each example at its own size. */
  frameSize?: { width: number; height?: number };
}

export default function MediaFrame({ item, frameSize }: MediaFrameProps) {
  const Component = item.component;
  const style: CSSProperties = {};
  const width = frameSize?.width ?? item.width;
  if (width) style.width = width;
  if (frameSize?.height) {
    style.aspectRatio = `${frameSize.width} / ${frameSize.height}`;
  } else if (item.width && item.height) {
    style.aspectRatio = `${item.width} / ${item.height}`;
  }
  if (item.radius !== undefined) style.borderRadius = item.radius;

  return (
    <div
      className={`media-frame media-frame--${item.treatment} ${
        Component ? "media-frame--has-content" : item.src ? "media-frame--has-image" : ""
      }`}
      style={style}
    >
      {Component ? (
        <Component />
      ) : item.src ? (
        <img src={item.src} alt={item.label} draggable={false} />
      ) : (
        <span className="media-placeholder-label">{item.label}</span>
      )}
    </div>
  );
}
