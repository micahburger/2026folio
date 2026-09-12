import type { CSSProperties } from "react";
import ProjectMeta from "../ProjectMeta";
import MediaGallery from "../MediaGallery";
import { isLightColor } from "../../lib/color";
import { MEDIA_BOX, type LayoutProps } from "./types";

/**
 * Applicant experience: content sits inside one large rounded colored field,
 * inset from the viewport edges so the white page shows around it. Color
 * shifts per active example (olive / orange), matching the source design.
 * Copy is one stacked column (title, body) so it holds its position
 * while only the media column swaps between examples on an autoplay fade,
 * with the gallery's own progress dots under the media.
 */
export default function PanelLayout({ project, gallery, interactive }: LayoutProps) {
  const current = project.media[gallery.index];
  const backgroundColor = current.backgroundColor ?? project.backgroundColor;
  const textColor = current.textColor ?? project.textColor;

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
          frameSize={MEDIA_BOX}
          className="chapter-media"
        />
      </div>
    </div>
  );
}
