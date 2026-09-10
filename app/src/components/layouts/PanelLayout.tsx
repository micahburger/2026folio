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
export default function PanelLayout({ project, gallery, interactive }: LayoutProps) {
  const current = project.media[gallery.index];
  const backgroundColor = current.backgroundColor ?? project.backgroundColor;
  const textColor = current.textColor ?? project.textColor;
  // One fixed box (the largest example's footprint) that every example
  // renders inside of, so neither the text column nor the media position
  // shift as examples swap — see MediaFrame's frameSize prop.
  const frameSize = {
    width: Math.max(...project.media.map((item) => item.width ?? 0)),
    height: Math.max(...project.media.map((item) => item.height ?? 0)),
  };

  return (
    <div className="layout layout-panel-wrap">
      <div
        className="layout-panel"
        data-theme={isLightColor(backgroundColor) ? "light" : "dark"}
        style={{ backgroundColor, color: textColor, "--media-w": `${frameSize.width}px` } as CSSProperties}
      >
        <div className="chapter-inner">
          <div className="chapter-text">
            <p className={`headline-pill headline-pill--${project.pillTheme}`}>{project.headline}</p>
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
