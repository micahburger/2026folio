import type { CSSProperties } from "react";
import ProjectMeta from "../ProjectMeta";
import MediaGallery from "../MediaGallery";
import { isLightColor } from "../../lib/color";
import { MEDIA_BOX, type LayoutProps } from "./types";

/**
 * Messaging: dark, generous negative space. A stacked copy column beside the
 * shared media box — the examples used to be anchored to the viewport edge
 * and placed individually, but each asset now carries its own framing, so
 * there's nothing left to position.
 *
 * Background color isn't set here — PortfolioShell's shared `.deck-background`
 * layer owns it so project-to-project color changes crossfade as one
 * continuous layer instead of two opaque panels cutting over each other.
 */
export default function BleedLayout({ project, gallery, interactive }: LayoutProps) {
  return (
    <div
      className="layout layout-bleed"
      data-theme={isLightColor(project.backgroundColor) ? "light" : "dark"}
      style={{ color: project.textColor } as CSSProperties}
    >
      <div className="chapter-inner">
        <div className="chapter-text">
          <ProjectMeta title={project.title} titleLines={project.titleLines} disciplines={project.disciplines} />
          <div className="project-body">
            {project.body.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        </div>
      </div>
      <MediaGallery
        media={project.media}
        {...gallery}
        interactive={interactive}
        frameSize={MEDIA_BOX}
        className="chapter-media"
      />
    </div>
  );
}
