import type { CSSProperties } from "react";
import type { ProjectMediaItem } from "../data/types";

interface MediaFrameProps {
  item: ProjectMediaItem;
  /** Overrides the item's own width/height — every example in a chapter
   * renders inside this one fixed box (sized to the chapter's largest
   * example) instead of its own natural size, so the container never
   * resizes as examples swap. Bleed layout (Messaging) omits this and
   * keeps each example at its own size. */
  frameSize?: { width: number; height: number };
}

export default function MediaFrame({ item, frameSize }: MediaFrameProps) {
  const Component = item.component;
  const style: CSSProperties = {};
  const width = frameSize?.width ?? item.width;
  const height = frameSize?.height ?? item.height;
  if (width) style.width = width;
  if (width && height) style.aspectRatio = `${width} / ${height}`;
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
