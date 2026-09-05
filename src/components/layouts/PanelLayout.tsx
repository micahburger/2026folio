import ProjectMeta from "../ProjectMeta";
import ProjectCopy from "../ProjectCopy";
import MediaGallery from "../MediaGallery";
import type { LayoutProps } from "./types";

/**
 * Applicant experience: content sits inside one large rounded colored field,
 * inset from the viewport edges so the white page shows around it. Color
 * shifts per active example (olive / orange), matching the source design.
 */
export default function PanelLayout({ project, gallery, interactive }: LayoutProps) {
  const current = project.media[gallery.index];
  const backgroundColor = current.backgroundColor ?? project.backgroundColor;
  const textColor = current.textColor ?? project.textColor;

  return (
    <div className="layout layout-panel-wrap">
      <div className="layout-panel" style={{ backgroundColor, color: textColor }}>
        <div className="panel-content">
          <ProjectMeta title={project.title} disciplines={project.disciplines} />
          <ProjectCopy headline={project.headline} body={project.body} />
          <MediaGallery media={project.media} {...gallery} interactive={interactive} />
        </div>
      </div>
    </div>
  );
}
