import type { StandardProject } from "../../data/types";
import type { MediaGalleryState } from "../MediaGallery";

export interface LayoutProps {
  /** Resume is handled separately by ResumeLayout, which takes a
   * ResumeProject directly — these three layouts only ever see the
   * pill/title/body/media deck shape. */
  project: StandardProject;
  gallery: MediaGalleryState;
  /** False while this project is shown as a non-active overview preview. */
  interactive: boolean;
}
