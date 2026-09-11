import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { flushSync } from "react-dom";
import type { Project } from "../data/types";
import ProjectView from "./ProjectView";
import { fadeIn, fadeOut, resetFlip, zoomCellToFullscreen, zoomToOverview, type Rect } from "../flip";
import { DECK_TRANSITION_MS, prefersReducedMotion } from "../motion";
import { isLightColor } from "../lib/color";

interface PortfolioShellProps {
  projects: Project[];
}

type ViewMode = "project" | "overview";

const WHEEL_MIN_DELTA = 12;
const WHEEL_COOLDOWN_MS = DECK_TRANSITION_MS + 150;
const SWIPE_THRESHOLD_PX = 48;

// Named seam (not just `.backgroundColor` inline) so a future layout-specific
// page color is a one-line change here instead of an audit of every call site.
function pageColorFor(project: Project) {
  return project.backgroundColor;
}

// Shorter paths that have been handed out for a project whose real slug
// differs. Without this, /assistant matches nothing and silently lands the
// visitor on the first project instead — a link sent to someone opens the
// wrong work.
const SLUG_ALIASES: Record<string, string> = {
  assistant: "ai-assistant",
};

function indexForSlug(projects: Project[], pathname: string) {
  const requested = pathname.replace(/^\//, "");
  const slug = SLUG_ALIASES[requested] ?? requested;
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

  const shellRef = useRef<HTMLDivElement | null>(null);
  const frameRefs = useRef<Array<HTMLDivElement | null>>([]);
  const projectViewRefs = useRef<Array<HTMLDivElement | null>>([]);
  // Only the overview-opening zoom is staged this way now; closing runs its
  // animation up front and commits afterwards (see closeOverview).
  const pendingFlip = useRef<{ index: number; rect: Rect } | null>(null);
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

  /**
   * Switches the overview cards' hover grow off until the returned release is
   * called. A grown card is a scaled ancestor of the zooming element, which
   * makes it the containing block for the zoom's position:fixed escape — the
   * zoom would play clipped inside the card. Set via a data attribute rather
   * than className, which React rewrites whenever viewMode changes. Each hold
   * is token-guarded, so a release from a zoom that a newer one interrupted
   * can't lift the newer one's hold.
   *
   * The forced layout after setting it is load-bearing. If the card loses its
   * scale in the same style pass that the zoom turns position:fixed on, Chrome
   * still paints the fixed element against the card — offset below it and
   * clipped away by the card's overflow, so the card went blank and the zoom
   * played invisibly. Layout reports the right box either way; only hit
   * testing and paint show it. Flushing here settles the card first, inside
   * the same frame, so nothing visibly changes.
   */
  const zoomHoldToken = useRef(0);
  function holdHoverGrow() {
    const token = ++zoomHoldToken.current;
    shellRef.current?.setAttribute("data-zooming", "");
    void shellRef.current?.offsetWidth;
    return () => {
      if (zoomHoldToken.current === token) shellRef.current?.removeAttribute("data-zooming");
    };
  }

  function openOverview() {
    // Measure the active project fullscreen, before the grid layout exists.
    const rect = rectOf(projectViewRefs.current[activeProject]);
    pendingFlip.current = rect ? { index: activeProject, rect } : null;
    setViewMode("overview");
  }

  function commitToProject(targetIndex: number) {
    pendingFlip.current = null;
    setActiveProject(targetIndex);
    setViewMode("project");
  }

  function closeOverview(targetIndex: number) {
    const el = projectViewRefs.current[targetIndex];
    // The target's grid cell, measured while the overview grid still exists —
    // and before the hover grow is released, so a hovered card is measured at
    // the size it's showing and the zoom picks up from exactly there.
    const rect = rectOf(frameRefs.current[targetIndex]);

    if (!el || !rect || prefersReducedMotion()) {
      commitToProject(targetIndex);
      return;
    }

    // Grow the cell into the page first, and only switch modes once it has
    // landed. Switching first re-laid the whole rail out instantly — the grid
    // collapsed and the project's background covered everything before the
    // zoom had played, so the cell never looked like it travelled anywhere.
    const releaseHover = holdHoverGrow();
    const zoom = zoomCellToFullscreen(el, rect, pageColorFor(projects[targetIndex]));
    zoom.finished
      .then(() => {
        // The escape hatch can only come off once the fullscreen project CSS
        // is actually on the element. Without the flush it came off first: a
        // plain state update isn't applied synchronously here, so cleanup on
        // the next frame beat React's commit to the DOM, and for that frame
        // the element had lost position:fixed while still carrying the
        // overview class — which scales it down into its grid cell. It
        // snapped back to the card and out again, one frame, every time.
        flushSync(() => commitToProject(targetIndex));
        resetFlip(el);
        releaseHover();
      })
      // A rejection just means a newer pick interrupted this one, and that
      // transition owns the cleanup instead.
      .catch(releaseHover);
  }

  /**
   * Parks the overview's scroll on a given project's card, centred in the
   * viewport. Has to run before anything measures the grid: the zoom animates
   * toward wherever the card currently sits on screen, so scrolling after it
   * was measured would aim it at a position the card has since left.
   */
  function centerCellInOverview(index: number) {
    const shell = shellRef.current;
    const cell = frameRefs.current[index];
    if (!shell || !cell) return;

    // Which element actually scrolls depends on the breakpoint: on desktop
    // the shell is a fixed-height scroll container, while on mobile it grows
    // to fit its content and the document scrolls instead. Both start at the
    // top of the viewport, so the arithmetic below is the same either way.
    const scroller: HTMLElement =
      shell.scrollHeight > shell.clientHeight
        ? shell
        : (document.scrollingElement as HTMLElement | null) ?? document.documentElement;

    const viewportHeight = scroller === shell ? shell.clientHeight : window.innerHeight;
    const cellBox = cell.getBoundingClientRect();
    const centred =
      cellBox.top + scroller.scrollTop - (viewportHeight - cellBox.height) / 2;

    scroller.scrollTop = Math.max(
      0,
      Math.min(centred, scroller.scrollHeight - viewportHeight)
    );
  }

  useLayoutEffect(() => {
    const flip = pendingFlip.current;
    pendingFlip.current = null;

    // Opening the gallery used to drop the visitor at the top of it however
    // deep into the deck they were, losing their place. Centring the project
    // they came from means the zoom settles onto its card and they can scroll
    // out from there. Also covers arriving by browser back, which carries no
    // pending flip.
    if (viewMode === "overview") centerCellInOverview(activeProject);

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
        else {
          // The pointer is often already resting over a card as the gallery
          // opens. Held until the zoom lands; zoomToOverview's own cleanup
          // was queued first, so the escape is gone before the card can grow.
          const releaseHover = holdHoverGrow();
          zoomToOverview(el, cell, flip.rect, pageColorFor(projects[i])).finished.then(
            releaseHover,
            releaseHover
          );
        }
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

  const hasSyncedUrl = useRef(false);
  useEffect(() => {
    const path = viewMode === "overview" ? "/overview" : `/${projects[activeProject]?.slug ?? ""}`;
    if (window.location.pathname !== path) {
      // The very first sync isn't navigation — it's correcting an unknown or
      // mistyped URL to whatever actually rendered. Replacing keeps that dead
      // path out of the back history, where it otherwise sat as an entry that
      // restored nothing when the visitor went back to it.
      if (hasSyncedUrl.current) window.history.pushState({}, "", path);
      else window.history.replaceState({}, "", path);
    }
    hasSyncedUrl.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, activeProject]);

  // Tab/window title follows the visible project — this is what a shared link
  // shows in a tab strip, a bookmark, and most link unfurls.
  useEffect(() => {
    const project = projects[activeProject];
    document.title =
      viewMode === "overview" || !project
        ? "Micah Lindenberger — 2026"
        : `${project.title} — Micah Lindenberger`;
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

  const headerColor =
    viewMode === "overview"
      ? "#F5F4F1"
      : isLightColor(pageColorFor(projects[activeProject]))
        ? "#1C1C1C"
        : "#F5F4F1";

  return (
    <div ref={shellRef} className={`shell ${viewMode === "overview" ? "shell--overview" : ""}`}>
      <header
        className="shell-header"
        style={
          {
            color: headerColor,
            // Feeds the scrim behind the pinned mobile header — see
            // .shell-header::before. Matching the page exactly means it's
            // invisible until content actually scrolls up under the nav.
            "--page-color": viewMode === "overview" ? "#000000" : pageColorFor(projects[activeProject]),
          } as CSSProperties
        }
      >
        <span className="shell-name">Micah Lindenberger</span>
        <button
          type="button"
          className="shell-menu-button"
          style={{ background: headerColor, color: viewMode === "overview" ? "#000000" : pageColorFor(projects[activeProject]) }}
          onClick={() => (viewMode === "overview" ? closeOverview(activeProject) : openOverview())}
        >
          {viewMode === "overview" ? "Close" : "Menu"}
        </button>
        <span className="shell-tagline">2026 Mini portfolio</span>
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
    </div>
  );
}
