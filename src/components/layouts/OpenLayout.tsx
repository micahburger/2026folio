import ProjectMeta from "../ProjectMeta";
import ProjectCopy from "../ProjectCopy";
import MediaGallery from "../MediaGallery";
import type { LayoutProps } from "./types";

/**
 * AI Assistant: warm pale beige across the full viewport, a very large
 * stacked title, and the most generous spacing of the three layouts.
 *
 * Background color comes from PortfolioShell's shared `.deck-background`
 * layer (see BleedLayout for why).
 */
export default function OpenLayout({ project, gallery, interactive }: LayoutProps) {
  return (
    <div className="layout layout-open" style={{ color: project.textColor }}>
      <div className="open-content">
        <ProjectMeta
          title={project.title}
          titleLines={project.titleLines}
          disciplines={project.disciplines}
          stacked
        />
        <ProjectCopy headline={project.headline} body={project.body} />
        <MediaGallery media={project.media} {...gallery} interactive={interactive} />
      </div>
    </div>
  );
}
