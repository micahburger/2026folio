import type { CSSProperties } from "react";
import ProjectMeta from "../ProjectMeta";
import MediaGallery from "../MediaGallery";
import { isLightColor } from "../../lib/color";
import type { LayoutProps } from "./types";

/**
 * Rental Assistant: white, contained (not edge-bled like Messaging). Same
 * stacked copy column as Applicant experience / Messaging — pill, title,
 * body — with the media sitting in a second grid column that scales down
 * rather than overflowing. No progress dots, same as Applicant experience.
 */
export default function OpenLayout({ project, gallery, interactive }: LayoutProps) {
  const current = project.media[gallery.index];
  // One fixed box (the largest example's footprint) that every example
  // renders inside of, so neither the text column nor the media position
  // shift as examples swap — see MediaFrame's frameSize prop.
  const frameSize = {
    width: Math.max(...project.media.map((item) => item.width ?? 0)),
    height: Math.max(...project.media.map((item) => item.height ?? 0)),
  };

  return (
    <div
      className="layout layout-open"
      data-theme={isLightColor(project.backgroundColor) ? "light" : "dark"}
      style={{ color: project.textColor, "--media-w": `${frameSize.width}px` } as CSSProperties}
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
        frameSize={frameSize}
        style={current.edgeInset ? { right: current.edgeInset } : undefined}
        className={`chapter-media ${current.verticalAlign === "bottom" ? "chapter-media--bottom" : ""}`}
      />
    </div>
  );
}
