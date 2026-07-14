"use client";

import { useState, useEffect, useRef } from "react";

/**
 * Detects when a toolbar has become sticky by watching its own top edge
 * against the nearest .overflow-y-auto scroll container.
 *
 * The `toolbarRef` must be placed on the element that has
 * `position: sticky; top: 0` — it must be a DIRECT child of the
 * scrollable content container (not wrapped in another positioned div),
 * otherwise the CSS sticky containment prevents it from working.
 *
 * Usage:
 *   const { toolbarRef, isSticky } = useStickyToolbar();
 *   <div ref={toolbarRef} style={{ position: "sticky", top: 0, zIndex: 30 }}>
 *     <Toolbar isSticky={isSticky} />
 *   </div>
 */
export function useStickyToolbar() {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const toolbar = toolbarRef.current;
    if (!toolbar) return;

    const scrollContainer = toolbar.closest(".overflow-y-auto") as HTMLElement | null;
    if (!scrollContainer) return;

    const check = () => {
      const toolbarTop = toolbar.getBoundingClientRect().top;
      const containerTop = scrollContainer.getBoundingClientRect().top;
      // +1px tolerance for sub-pixel rounding
      setIsSticky(toolbarTop <= containerTop + 1);
    };

    scrollContainer.addEventListener("scroll", check, { passive: true });
    // Run once on mount in case page loads already scrolled
    check();

    return () => scrollContainer.removeEventListener("scroll", check);
  }, []);

  return { toolbarRef, isSticky };
}
