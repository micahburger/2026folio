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
// Same fixed two-column treatment as Applicant experience (desktop only —
// see the min-width:901px block in global.css): a 600px copy column, 125px
// gap, 750px media column. Each example fills that width edge to edge up to
// MEDIA_COLUMN_MAX_HEIGHT, then shrinks to fit the height and centers
// horizontally instead (see MediaFrame's frameSize prop). The examples
// themselves render 15% smaller than the column (still centered within it)
// — the column's own width/gap stay put.
const MEDIA_COLUMN_WIDTH = 750;
const MEDIA_COLUMN_MAX_HEIGHT = 720;
const MEDIA_SCALE = 0.85;

export default function OpenLayout({ project, gallery, interactive }: LayoutProps) {
  const current = project.media[gallery.index];
  const frameSize = { width: MEDIA_COLUMN_WIDTH * MEDIA_SCALE, height: MEDIA_COLUMN_MAX_HEIGHT * MEDIA_SCALE };

  return (
    <div
      className="layout layout-open"
      data-theme={isLightColor(project.backgroundColor) ? "light" : "dark"}
      style={{ color: project.textColor } as CSSProperties}
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
