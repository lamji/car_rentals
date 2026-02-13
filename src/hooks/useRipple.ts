import { useCallback } from "react";

/**
 * Hook that creates a ripple effect on click for any element.
 * Returns a handler that should be called with the MouseEvent.
 */
export function useRipple() {
  const createRipple = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const ripple = document.createElement("span");
    ripple.style.cssText = `
      position: absolute;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.35);
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      transform: scale(0);
      animation: ripple-effect 0.5s ease-out forwards;
      pointer-events: none;
    `;

    // Ensure parent has relative positioning and overflow hidden
    const pos = getComputedStyle(el).position;
    if (pos === "static") {
      el.style.position = "relative";
    }
    el.style.overflow = "hidden";

    el.appendChild(ripple);

    ripple.addEventListener("animationend", () => {
      ripple.remove();
    });
  }, []);

  return createRipple;
}
