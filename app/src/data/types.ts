import type { ComponentType } from "react";

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
  /** A coded recreation of the UI, rendered instead of `src` when present. */
  component?: ComponentType;
  /** Lets this example's media bleed past the content edge (bleed layout only). */
  overflow?: boolean;
  /** Custom render size in px, overriding the treatment's fixed box — each
   * example can be its own width/height instead of one shared preset. */
  width?: number;
  height?: number;
  /** Overrides the treatment's default corner radius, in px. */
  radius?: number;
  /** Bleed layout only — vertical anchor for this example. Defaults to
   * vertically centered; "bottom" locks it to the bottom-right corner. */
  verticalAlign?: "center" | "bottom";
  /** Bleed layout only — px to inset this example from the viewport's right
   * edge (default 0, flush). Each example's placement is hand-tuned, not a
   * shared rule, so this is deliberately a per-item escape hatch. */
  edgeInset?: number;
}

export interface StandardProject {
  id: string;
  slug: string;
  title: string;
  /** Forces the title to render as stacked lines instead of natural word-wrap. */
  titleLines?: string[];
  disciplines: string[];
  /** Kept as copy, but nothing renders it since the pill above the title was
   * removed — available if it finds another home. */
  headline: string;
  body: string[];
  backgroundColor: string;
  textColor: string;
  layout: ProjectLayoutVariant;
  /** Exactly 3 media examples per project. */
  media: [ProjectMediaItem, ProjectMediaItem, ProjectMediaItem];
}

export interface WorkHistoryItem {
  id: string;
  company: string;
  role: string;
  /** Company logo, square. */
  logo: string;
  dateRange: string;
  location: string;
}

export interface ResumeContact {
  photo: string;
  email: string;
  linkedin: string;
  store: string;
  storeLabel: string;
}

/** The Resume chapter: no media gallery, scrolls vertically
 * (every other chapter is one fixed screen) — a deliberately different page,
 * not a fourth variant of the deck pattern the other three share. */
export interface ResumeProject {
  id: string;
  slug: string;
  title: string;
  backgroundColor: string;
  textColor: string;
  layout: "resume";
  workHistory: WorkHistoryItem[];
  contact: ResumeContact;
}

export type Project = StandardProject | ResumeProject;
