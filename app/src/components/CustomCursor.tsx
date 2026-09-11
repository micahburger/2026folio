import { useEffect, useRef } from "react";

// Anything that responds to a click. Kept in step with the places global.css
// hands out `cursor: pointer` — the native cursor is hidden now, so this list
// is the only thing that says what's clickable.
const CLICKABLE = [
  "a[href]",
  "button",
  '[role="button"]',
  '[role="tab"]',
  ".media-stage",
  ".shell-rail--overview",
].join(",");

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

    // Leaving the window would otherwise strand the dot at the edge.
    function onLeave() {
      dot!.classList.remove("is-visible");
    }

    function enable() {
      if (enabled) return;
      enabled = true;
      document.documentElement.classList.add("has-custom-cursor");
      window.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
    }

    function disable() {
      if (!enabled) return;
      enabled = false;
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      dot!.classList.remove("is-visible", "is-active");
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
