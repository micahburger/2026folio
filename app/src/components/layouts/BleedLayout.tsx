import type { CSSProperties } from "react";
import ProjectMeta from "../ProjectMeta";
import MediaGallery from "../MediaGallery";
import { isLightColor } from "../../lib/color";
import type { LayoutProps } from "./types";

/**
 * Messaging: dark, edge-to-edge, generous negative space. Copy is one
 * stacked column (pill, title, body) like Applicant experience — the media
 * is anchored to the right edge of the full viewport (not the text column),
 * and allowed to bleed further past it for examples flagged `overflow`. No
 * progress dots, same as the other two chapters.
 *
 * Background color isn't set here — PortfolioShell's shared `.deck-background`
 * layer owns it so project-to-project color changes crossfade as one
 * continuous layer instead of two opaque panels cutting over each other.
 */
export default function BleedLayout({ project, gallery, interactive }: LayoutProps) {
  const current = project.media[gallery.index];
  // Reserve room for the widest example (not just the active one) so the
  // text column's own max-width never resizes as examples swap — each
  // example still keeps its own width/edge-bleed/vertical-anchor otherwise.
  const reservedWidth = Math.max(...project.media.map((item) => item.width ?? 0));

  return (
    <div
      className="layout layout-bleed"
      data-theme={isLightColor(project.backgroundColor) ? "light" : "dark"}
      style={{ color: project.textColor, "--media-w": `${reservedWidth}px` } as CSSProperties}
    >
      <div className="chapter-inner">
        <div className="chapter-text">
          <p className={`headline-pill headline-pill--${project.pillTheme}`}>{project.headline}</p>
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
        hideProgress
        style={current.edgeInset ? { right: current.edgeInset } : undefined}
        className={`chapter-media ${current.overflow ? "chapter-media--overflow" : ""} ${
          current.verticalAlign === "bottom" ? "chapter-media--bottom" : ""
        }`}
      />
    </div>
  );
}
