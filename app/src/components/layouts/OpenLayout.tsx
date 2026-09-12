import type { CSSProperties } from "react";
import ProjectMeta from "../ProjectMeta";
import MediaGallery from "../MediaGallery";
import { isLightColor } from "../../lib/color";
import { MEDIA_BOX, type LayoutProps } from "./types";

/**
 * Rental Assistant: white, contained (not edge-bled like Messaging). Same
 * stacked copy column as Applicant experience / Messaging — pill, title,
 * body — beside the shared media box, with the gallery's own progress dots
 * under it.
 */
export default function OpenLayout({ project, gallery, interactive }: LayoutProps) {

  return (
    <div
      className="layout layout-open"
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
