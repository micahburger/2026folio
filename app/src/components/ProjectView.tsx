import { forwardRef, useEffect, useRef, type MutableRefObject } from "react";
import type { Project } from "../data/types";
import { useMediaGallery } from "../hooks/useMediaGallery";
import BleedLayout from "./layouts/BleedLayout";
import PanelLayout from "./layouts/PanelLayout";
import OpenLayout from "./layouts/OpenLayout";
import ResumeLayout from "./layouts/ResumeLayout";

const LAYOUTS = {
  bleed: BleedLayout,
  panel: PanelLayout,
  open: OpenLayout,
} as const;

interface ProjectViewProps {
  project: Project;
  viewMode: "project" | "overview";
  isActiveProject: boolean;
  initialIndex: number;
  onIndexChange: (index: number) => void;
  onSelectFromOverview: () => void;
  /** "is-leaving" | "is-entering" | "is-hidden" | "" — drives the deck transition. */
  stateClass?: string;
  /** Which way the deck is moving, while a transition is in flight. */
  deckDirection?: 1 | -1;
}

const ProjectView = forwardRef<HTMLDivElement, ProjectViewProps>(function ProjectView(
  {
    project,
    viewMode,
    isActiveProject,
    initialIndex,
    onIndexChange,
    onSelectFromOverview,
    stateClass = "",
    deckDirection,
  },
  ref
) {
  const isFocused = viewMode === "project" && isActiveProject;
  // Resume has no media gallery — pass a 0 count so the hook stays inert
  // rather than skipping it (hooks can't be called conditionally).
  const gallery = useMediaGallery({
    count: project.layout === "resume" ? 0 : project.media.length,
    isActive: isActiveProject,
    initialIndex,
    onIndexChange,
    autoplay: isFocused,
  });

  // In focused project mode, off-screen slides sit fully out of the DOM's
  // focus/hit-test order — otherwise tabbing into them can scroll the
  // clipped rail into view. Every slide is interactive in overview mode.
  const isInert = viewMode === "project" && !isActiveProject;
  const localRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (localRef.current) {
      localRef.current.inert = isInert;
    }
  }, [isInert]);

  function setRefs(node: HTMLDivElement | null) {
    localRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) (ref as MutableRefObject<HTMLDivElement | null>).current = node;
  }

  const isClickableOverviewCell = viewMode === "overview";
  const galleryInteractive = isFocused;

  let content: JSX.Element;
  if (project.layout === "resume") {
    content = <ResumeLayout project={project} />;
  } else {
    const Layout = LAYOUTS[project.layout];
    content = <Layout project={project} gallery={gallery} interactive={galleryInteractive} />;
  }

  return (
    <div
      ref={setRefs}
      className={`project-view ${viewMode === "overview" ? "project-view--overview" : stateClass}`}
      data-direction={deckDirection}
      aria-hidden={viewMode === "project" && !isActiveProject}
      aria-label={project.title}
      role={isClickableOverviewCell ? "button" : undefined}
      tabIndex={isClickableOverviewCell ? 0 : undefined}
      onClick={isClickableOverviewCell ? onSelectFromOverview : undefined}
      onKeyDown={
        isClickableOverviewCell
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelectFromOverview();
              }
            }
          : undefined
      }
    >
      {content}
    </div>
  );
});

export default ProjectView;
