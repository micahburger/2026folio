import ProjectMeta from "../ProjectMeta";
import ProjectCopy from "../ProjectCopy";
import MediaGallery from "../MediaGallery";
import type { LayoutProps } from "./types";

/**
 * Messaging: white, edge-to-edge, generous negative space. The media is
 * anchored to the right edge of the content column (not centered), and is
 * allowed to bleed past it for examples flagged `overflow`.
 *
 * Background color isn't set here — PortfolioShell's shared `.deck-background`
 * layer owns it so project-to-project color changes crossfade as one
 * continuous layer instead of two opaque panels cutting over each other.
 */
export default function BleedLayout({ project, gallery, interactive }: LayoutProps) {
  const current = project.media[gallery.index];

  return (
    <div className="layout layout-bleed" style={{ color: project.textColor }}>
      <div className="bleed-inner">
        <div className="bleed-text">
          <ProjectMeta
            title={project.title}
            titleLines={project.titleLines}
            disciplines={project.disciplines}
          />
          <ProjectCopy headline={project.headline} body={project.body} />
        </div>
        <MediaGallery
          media={project.media}
          {...gallery}
          interactive={interactive}
          className={`bleed-media ${current.overflow ? "bleed-media--overflow" : ""}`}
        />
      </div>
    </div>
  );
}
