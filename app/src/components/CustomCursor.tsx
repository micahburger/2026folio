import { useEffect, useRef } from "react";

// Anything that answers a pointer — clicked, or in the gallery's case grabbed
// and thrown. Kept in step with the places global.css hands out a `cursor`,
// since the native one is hidden and this list is now the only thing that
// says what will respond.
const CLICKABLE = [
  "a[href]",
  "button",
  '[role="button"]',
  '[role="tab"]',
  ".media-stage[data-grabbable]",
  ".shell-rail--overview",
].join(",");

// The one thing on the page that is grabbed rather than clicked. Watched
// directly rather than read off the stage's own `data-phase`, which is React
// state and so isn't on the element yet when pointerdown fires — the press
// has to answer on the press, not on the first move after it.
const GRABBABLE = ".media-stage[data-grabbable]";

// Only a mouse or trackpad gets the dot. Touch has no cursor to replace.
const FINE_POINTER = "(hover: hover) and (pointer: fine)";

/**
 * Replaces the system cursor with a small dot that changes color over
 * anything clickable. The native cursor is only hidden once this has
 * mounted (the class on <html>), so if the script never runs the page keeps
 * a normal cursor rather than none at all.
 */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    if (!dot) return;
    const media = window.matchMedia(FINE_POINTER);
    let enabled = false;

    function onMove(event: PointerEvent) {
      if (event.pointerType === "touch") return;
      dot!.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0)`;
      dot!.classList.add("is-visible");
      const target = event.target as Element | null;
      dot!.classList.toggle("is-active", !!target?.closest?.(CLICKABLE));
    }

    function onDown(event: PointerEvent) {
      if (event.pointerType === "touch" || event.button !== 0) return;
      const target = event.target as Element | null;
      dot!.classList.toggle("is-grabbing", !!target?.closest?.(GRABBABLE));
    }

    // Any way a press can end, including one released outside the window —
    // the alternative is a dot stuck on the pressed colour for the rest of
    // the visit.
    function onRelease() {
      dot!.classList.remove("is-grabbing");
    }

    // Leaving the window would otherwise strand the dot at the edge.
    function onLeave() {
      dot!.classList.remove("is-visible");
    }

    function enable() {
      if (enabled) return;
      enabled = true;
      document.documentElement.classList.add("has-custom-cursor");
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerdown", onDown, { passive: true });
      window.addEventListener("pointerup", onRelease, { passive: true });
      window.addEventListener("pointercancel", onRelease, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
    }

    function disable() {
      if (!enabled) return;
      enabled = false;
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onRelease);
      window.removeEventListener("pointercancel", onRelease);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      dot!.classList.remove("is-visible", "is-active", "is-grabbing");
    }

    function sync() {
      if (media.matches) enable();
      else disable();
    }

    sync();
    media.addEventListener("change", sync);
    return () => {
      media.removeEventListener("change", sync);
      disable();
    };
  }, []);

  return <div ref={dotRef} className="custom-cursor" aria-hidden="true" />;
}
