import type { ProjectMediaItem } from "../data/types";

export default function MediaFrame({ item }: { item: ProjectMediaItem }) {
  return (
    <div
      className={`media-frame media-frame--${item.treatment} ${item.src ? "media-frame--has-image" : ""}`}
    >
      {item.src ? (
        <img src={item.src} alt={item.label} draggable={false} />
      ) : (
        <span className="media-placeholder-label">{item.label}</span>
      )}
    </div>
  );
}
