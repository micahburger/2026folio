import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Project } from "../data/types";
import ProjectView from "./ProjectView";
import ProjectProgress from "./ProjectProgress";
import { fadeIn, fadeOut, zoomFromOverview, zoomToOverview, type Rect } from "../flip";
import { DECK_TRANSITION_MS, prefersReducedMotion } from "../motion";

interface PortfolioShellProps {
  projects: Project[];
}

type ViewMode = "project" | "overview";

const WHEEL_MIN_DELTA = 12;
const WHEEL_COOLDOWN_MS = DECK_TRANSITION_MS + 150;
const SWIPE_THRESHOLD_PX = 48;

function pageColorFor(project: Project) {
  return project.layout === "panel" ? "#FFFFFF" : project.backgroundColor;
}

function indexForSlug(projects: Project[], pathname: string) {
  const slug = pathname.replace(/^\//, "");
  const index = projects.findIndex((p) => p.slug === slug);
  return index === -1 ? 0 : index;
}

function readInitialState(projects: Project[]) {
  if (typeof window === "undefined") return { mode: "project" as ViewMode, index: 0 };
  if (window.location.pathname === "/overview") return { mode: "overview" as ViewMode, index: 0 };
  return { mode: "project" as ViewMode, index: indexForSlug(projects, window.location.pathname) };
}

export default function PortfolioShell({ projects }: PortfolioShellProps) {
  const initial = useRef(readInitialState(projects)).current;
  const [viewMode, setViewMode] = useState<ViewMode>(initial.mode);
  const [activeProject, setActiveProject] = useState(initial.index);
  const [transitionOverlay, setTransitionOverlay] = useState<{
    from: number;
    to: number;
    direction: 1 | -1;
  } | null>(null);
  const [mediaIndexByProject, setMediaIndexByProject] = useState<Record<string, number>>({});

  const frameRefs = useRef<Array<HTMLDivElement | null>>([]);
  const projectViewRefs = useRef<Array<HTMLDivElement | null>>([]);
  const pendingFlip = useRef<{ index: number; mode: "enter" | "exit"; rect: Rect } | null>(null);
  const overlayClearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wheelCooldown = useRef(false);
  const touchStartX = useRef<number | null>(null);

  // ---- project-to-project navigation (staggered deck transition) --------

  function navigateToProject(rawIndex: number, opts: { resetMedia?: boolean } = {}) {
    const target = Math.max(0, Math.min(projects.length - 1, rawIndex));
    if (viewMode !== "project" || target === activeProject) return;
    const direction: 1 | -1 = target > activeProject ? 1 : -1;

    if (opts.resetMedia) {
      const targetId = projects[target].id;
      setMediaIndexByProject((prev) => ({ ...prev, [targetId]: 0 }));
    }

    setTransitionOverlay({ from: activeProject, to: target, direction });
    setActiveProject(target);

    if (overlayClearTimer.current) clearTimeout(overlayClearTimer.current);
    overlayClearTimer.current = setTimeout(
      () => setTransitionOverlay(null),
      prefersReducedMotion() ? 180 : DECK_TRANSITION_MS
    );
  }

  useEffect(() => {
    return () => {
      if (overlayClearTimer.current) clearTimeout(overlayClearTimer.current);
    };
  }, []);

  // keyboard
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (viewMode !== "project") return;
      if (event.key === "ArrowRight") navigateToProject(activeProject + 1, { resetMedia: true });
      else if (event.key === "ArrowLeft") navigateToProject(activeProject - 1, { resetMedia: true });
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, activeProject]);

  // trackpad / mouse-wheel horizontal intent — requires a clearly horizontal
  // gesture above a minimum delta, and a cooldown so one gesture is one step.
  useEffect(() => {
    function onWheel(event: WheelEvent) {
      if (viewMode !== "project") return;
      const absX = Math.abs(event.deltaX);
      const absY = Math.abs(event.deltaY);
      if (absX < WHEEL_MIN_DELTA || absX <= absY * 1.5) return;
      if (wheelCooldown.current) return;
      wheelCooldown.current = true;
      navigateToProject(activeProject + (event.deltaX > 0 ? 1 : -1), { resetMedia: true });
      setTimeout(() => {
        wheelCooldown.current = false;
      }, WHEEL_COOLDOWN_MS);
    }
    window.addEventListener("wheel", onWheel, { passive: true });
    return () => window.removeEventListener("wheel", onWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, activeProject]);

  // touch swipe — MediaGallery stops propagation on its own touch handlers,
  // so this only ever fires for swipes outside the media itself.
  useEffect(() => {
    function onTouchStart(event: TouchEvent) {
      if (viewMode !== "project") return;
      touchStartX.current = event.touches[0].clientX;
    }
    function onTouchEnd(event: TouchEvent) {
      if (viewMode !== "project" || touchStartX.current === null) return;
      const deltaX = event.changedTouches[0].clientX - touchStartX.current;
      touchStartX.current = null;
      if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX) return;
      navigateToProject(activeProject + (deltaX < 0 ? 1 : -1), { resetMedia: true });
    }
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, activeProject]);

  // ---- overview mode: FLIP zoom -------------------------------------------

  function rectOf(el: HTMLElement | null): Rect | null {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { top: r.top, left: r.left, width: r.width, height: r.height };
  }

  function openOverview() {
    // Measure the active project fullscreen, before the grid layout exists.
    const rect = rectOf(projectViewRefs.current[activeProject]);
    pendingFlip.current = rect ? { index: activeProject, mode: "enter", rect } : null;
    setViewMode("overview");
  }

  function closeOverview(targetIndex: number) {
    // Measure the target's grid CELL now, while the overview grid still
    // exists — once viewMode flips, .overview-frame reverts to its
    // fullscreen project-mode CSS and this position is gone.
    const rect = rectOf(frameRefs.current[targetIndex]);
    pendingFlip.current = rect ? { index: targetIndex, mode: "exit", rect } : null;
    setActiveProject(targetIndex);
    setViewMode("project");
  }

  useLayoutEffect(() => {
    const flip = pendingFlip.current;
    pendingFlip.current = null;
    // A plain project-to-project step never sets a pending flip — the deck
    // transition above handles that motion entirely on its own.
    if (!flip) return;

    const reduced = prefersReducedMotion();

    projects.forEach((_, i) => {
      const el = projectViewRefs.current[i];
      const cell = frameRefs.current[i];
      if (!el || !cell) return;

      if (i === flip.index) {
        if (reduced) fadeIn(el, 150);
        else if (flip.mode === "enter") zoomToOverview(el, cell, flip.rect, pageColorFor(projects[i]));
        else zoomFromOverview(el, flip.rect, pageColorFor(projects[i]));
      } else if (viewMode === "overview") {
        fadeIn(el, reduced ? 150 : 300);
      } else {
        fadeOut(el, reduced ? 100 : 200);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, activeProject]);

  // Escape closes overview
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && viewMode === "overview") {
        closeOverview(activeProject);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, activeProject]);

  // ---- URL sync (no router) ------------------------------------------------

  useEffect(() => {
    const path = viewMode === "overview" ? "/overview" : `/${projects[activeProject]?.slug ?? ""}`;
    if (window.location.pathname !== path) {
      window.history.pushState({}, "", path);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, activeProject]);

  useEffect(() => {
    function onPopState() {
      if (window.location.pathname === "/overview") {
        setViewMode("overview");
        return;
      }
      const index = indexForSlug(projects, window.location.pathname);
      if (viewMode === "overview") {
        closeOverview(index);
      } else {
        navigateToProject(index, { resetMedia: true });
      }
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, activeProject]);

  // ---- render ---------------------------------------------------------------

  function slotClass(index: number): string {
    if (viewMode !== "project") return "";
    if (transitionOverlay) {
      if (index === transitionOverlay.from) return "is-leaving";
      if (index === transitionOverlay.to) return "is-entering";
      return "is-hidden";
    }
    return index === activeProject ? "" : "is-hidden";
  }

  function slotDirection(index: number): 1 | -1 | undefined {
    if (!transitionOverlay) return undefined;
    return index === transitionOverlay.from || index === transitionOverlay.to
      ? transitionOverlay.direction
      : undefined;
  }

  return (
    <div className={`shell ${viewMode === "overview" ? "shell--overview" : ""}`}>
      <header className="shell-header">
        <button
          type="button"
          className="shell-label shell-label--interactive"
          onClick={() => (viewMode === "overview" ? closeOverview(activeProject) : openOverview())}
        >
          Micah Lindenberger
          {viewMode === "overview" && <span className="shell-label-tag">Close</span>}
        </button>
        <span className="shell-label">2026</span>
      </header>

      {viewMode === "project" && (
        <div
          className="deck-background"
          style={{ backgroundColor: pageColorFor(projects[activeProject]) }}
        />
      )}

      <div className={`shell-rail ${viewMode === "overview" ? "shell-rail--overview" : ""}`}>
        {projects.map((project, index) => (
          <div
            key={project.id}
            ref={(node) => (frameRefs.current[index] = node)}
            className={`overview-frame ${viewMode === "overview" ? "overview-frame--overview" : ""}`}
            style={viewMode === "overview" ? { backgroundColor: pageColorFor(project) } : undefined}
          >
            <ProjectView
              ref={(node) => (projectViewRefs.current[index] = node)}
              project={project}
              viewMode={viewMode}
              isActiveProject={index === activeProject}
              initialIndex={mediaIndexByProject[project.id] ?? 0}
              onIndexChange={(i) => setMediaIndexByProject((prev) => ({ ...prev, [project.id]: i }))}
              onSelectFromOverview={() => closeOverview(index)}
              stateClass={slotClass(index)}
              deckDirection={slotDirection(index)}
            />
          </div>
        ))}
      </div>

      {viewMode === "project" && (
        <ProjectProgress
          count={projects.length}
          active={activeProject}
          onSelect={(i) => navigateToProject(i, { resetMedia: true })}
        />
      )}
    </div>
  );
}
