export type MediaTreatment = "phone" | "card" | "desktop";
export type ProjectLayoutVariant = "bleed" | "panel" | "open";

export interface ProjectMediaItem {
  id: string;
  label: string;
  treatment: MediaTreatment;
  /** Overrides the project's default backgroundColor while this example is active. */
  backgroundColor?: string;
  /** Overrides the project's default textColor while this example is active. */
  textColor?: string;
  /** Real exported asset path, once available. Falls back to a placeholder block. */
  src?: string;
  /** Lets this example's media bleed past the content edge (bleed layout only). */
  overflow?: boolean;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  /** Forces the title to render as stacked lines instead of natural word-wrap. */
  titleLines?: string[];
  disciplines: string[];
  headline: string;
  body: string[];
  backgroundColor: string;
  textColor: string;
  layout: ProjectLayoutVariant;
  /** Exactly 3 media examples per project. */
  media: [ProjectMediaItem, ProjectMediaItem, ProjectMediaItem];
}
