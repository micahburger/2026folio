import type { StandardProject } from "../../data/types";
import type { MediaGalleryState } from "../MediaGallery";

/**
 * The one box every example renders inside, in every chapter. Each asset is
 * now exported onto an identical 786px-wide canvas (at 2x), with its own
 * framing and background composed in, so there's nothing left for a layout to
 * place per example — they all just fade in the same spot. 762 is the tallest
 * of the nine; the shorter ones centre inside it, which is what keeps every
 * example exactly 786 wide rather than letterboxing some of them narrower.
 */
export const MEDIA_BOX = { width: 786, height: 762 };

export interface LayoutProps {
  /** Resume is handled separately by ResumeLayout, which takes a
   * ResumeProject directly — these three layouts only ever see the
   * title/body/media deck shape. */
  project: StandardProject;
  gallery: MediaGalleryState;
  /** False while this project is shown as a non-active overview preview. */
  interactive: boolean;
}
