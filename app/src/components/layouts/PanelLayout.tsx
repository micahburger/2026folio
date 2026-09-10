import type { CSSProperties } from "react";
import ProjectMeta from "../ProjectMeta";
import MediaGallery from "../MediaGallery";
import { isLightColor } from "../../lib/color";
import type { LayoutProps } from "./types";

/**
 * Applicant experience: content sits inside one large rounded colored field,
 * inset from the viewport edges so the white page shows around it. Color
 * shifts per active example (olive / orange), matching the source design.
 * Copy is one stacked column (pill, title, body) so it holds its position
 * while only the media column swaps between examples on an autoplay fade —
 * no manual progress indicator for now.
 */
// Fixed two-column widths (desktop only — see the min-width:901px block in
// global.css): a 600px copy column, 125px gap, 750px media column. Each
// example fills that width edge to edge up to MEDIA_COLUMN_MAX_HEIGHT; the
// two portrait examples (phone mockup, pet-form card) would otherwise blow
// past that height at 750px wide, so past the cap they shrink to fit the
// height instead and center horizontally (see MediaFrame's frameSize prop,
// object-fit: contain on the img). Trying this on Applicant experience only
// for now.
const MEDIA_COLUMN_WIDTH = 750;
const MEDIA_COLUMN_MAX_HEIGHT = 720;

export default function PanelLayout({ project, gallery, interactive }: LayoutProps) {
  const current = project.media[gallery.index];
  const backgroundColor = current.backgroundColor ?? project.backgroundColor;
  const textColor = current.textColor ?? project.textColor;
  const frameSize = { width: MEDIA_COLUMN_WIDTH, height: MEDIA_COLUMN_MAX_HEIGHT };

  return (
    <div className="layout layout-panel-wrap">
      <div
        className="layout-panel"
        data-theme={isLightColor(backgroundColor) ? "light" : "dark"}
        style={{ backgroundColor, color: textColor } as CSSProperties}
      >
        <div className="chapter-inner">
          <div className="chapter-text">
            <ProjectMeta title={project.title} disciplines={project.disciplines} />
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
    </div>
  );
}
