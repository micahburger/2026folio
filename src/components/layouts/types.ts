import type { Project } from "../../data/types";
import type { MediaGalleryState } from "../MediaGallery";

export interface LayoutProps {
  project: Project;
  gallery: MediaGalleryState;
  /** False while this project is shown as a non-active overview preview. */
  interactive: boolean;
}
