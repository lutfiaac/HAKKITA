import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type {
  FocusEvent,
  KeyboardEvent,
  MouseEvent,
  PointerEvent,
} from "react";

export function carouselGeometry(
  viewportWidth: number,
  contentWidth: number,
  cardWidth: number,
  gap: number,
) {
  return {
    max: Math.max(0, contentWidth - viewportWidth),
    step: Math.max(1, cardWidth + gap),
  };
}
export function useProgramCarousel(itemCount: number, autoplayEnabled = true) {
  const viewport = useRef<HTMLDivElement>(null);
  const frame = useRef<number | null>(null),
    restoreSnap = useRef(""),
    suppressedUntil = useRef(0);
  const drag = useRef<{
    x: number;
    left: number;
    pointerId: number;
    moved: boolean;
  } | null>(null);
  const [position, setPosition] = useState({ left: 0, max: 0, step: 1 });
  const [hovered, setHovered] = useState(false),
    [focused, setFocused] = useState(false),
    [manuallyStopped, setManuallyStopped] = useState(false),
    [dragging, setDragging] = useState(false),
    [hidden, setHidden] = useState(() => document.hidden),
    [reducedMotion, setReducedMotion] = useState(
      () =>
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ||
        false,
    );
  const measure = useCallback(() => {
    const element = viewport.current;
    if (!element) return;
    const card = element.querySelector<HTMLElement>("[data-carousel-slide]");
    const style = window.getComputedStyle(element);
    const geometry = carouselGeometry(
      element.clientWidth,
      element.scrollWidth,
      card?.getBoundingClientRect().width || card?.offsetWidth || 1,
      parseFloat(style.columnGap) || parseFloat(style.gap) || 0,
    );
    const left = Math.max(0, Math.min(element.scrollLeft, geometry.max));
    setPosition((previous) =>
      previous.left === left &&
      previous.max === geometry.max &&
      previous.step === geometry.step
        ? previous
        : { ...geometry, left },
    );
  }, []);
  const stopAnimation = useCallback(() => {
    if (frame.current !== null) {
      window.cancelAnimationFrame?.(frame.current);
      frame.current = null;
    }
    if (viewport.current)
      viewport.current.style.scrollSnapType = restoreSnap.current;
  }, []);
  // Reset before paint, including a fresh route mount after browser navigation.
  useLayoutEffect(() => {
    if (viewport.current) viewport.current.scrollLeft = 0;
    measure();
  }, [measure]);
  const scrollToPosition = useCallback(
    (target: number) => {
      const element = viewport.current;
      if (!element) return;
      stopAnimation();
      const destination = Math.max(
        0,
        Math.min(target, element.scrollWidth - element.clientWidth),
      );
      if (reducedMotion || !window.requestAnimationFrame) {
        element.scrollLeft = destination;
        measure();
        return;
      }
      const start = element.scrollLeft;
      let started: number | null = null;
      restoreSnap.current = element.style.scrollSnapType;
      element.style.scrollSnapType = "none";
      const tick = (timestamp: number) => {
        if (started === null) started = timestamp;
        const progress = Math.min(1, (timestamp - started) / 480),
          eased = 1 - Math.pow(1 - progress, 3);
        element.scrollLeft = start + (destination - start) * eased;
        measure();
        if (progress < 1) frame.current = window.requestAnimationFrame(tick);
        else {
          frame.current = null;
          element.style.scrollSnapType = restoreSnap.current;
          measure();
        }
      };
      frame.current = window.requestAnimationFrame(tick);
    },
    [measure, reducedMotion, stopAnimation],
  );
  const manualMove = useCallback(
    (direction: "previous" | "next" | "first" | "last") => {
      setManuallyStopped(true);
      const element = viewport.current;
      if (!element) return;
      const current = element.scrollLeft;
      const target =
        direction === "first"
          ? 0
          : direction === "last"
            ? position.max
            : current + (direction === "next" ? position.step : -position.step);
      scrollToPosition(target);
    },
    [position.max, position.step, scrollToPosition],
  );
  const hasOverflow = position.max > 1,
    showControls = itemCount > 1 && hasOverflow;
  const canPrevious = showControls && position.left > 1,
    canNext = showControls && position.left < position.max - 1;
  const autoplayEligible = autoplayEnabled && showControls && !reducedMotion;
  const playing =
    autoplayEligible &&
    canNext &&
    !hovered &&
    !focused &&
    !hidden &&
    !manuallyStopped &&
    !dragging;
  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    measure();
    element.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", measure);
    const Observer = window.ResizeObserver;
    const observer = Observer ? new Observer(measure) : null;
    observer?.observe(element);
    element
      .querySelectorAll("[data-carousel-slide]")
      .forEach((card) => observer?.observe(card));
    return () => {
      observer?.disconnect();
      element.removeEventListener("scroll", measure);
      window.removeEventListener("resize", measure);
      stopAnimation();
    };
  }, [itemCount, measure, stopAnimation]);
  useEffect(() => {
    const media = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!media) return;
    const changed = () => {
      setReducedMotion(media.matches);
      stopAnimation();
    };
    changed();
    media.addEventListener?.("change", changed);
    return () => media.removeEventListener?.("change", changed);
  }, [stopAnimation]);
  useEffect(() => {
    const changed = () => {
      setHidden(document.hidden);
      if (document.hidden) stopAnimation();
    };
    document.addEventListener("visibilitychange", changed);
    return () => document.removeEventListener("visibilitychange", changed);
  }, [stopAnimation]);
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      const element = viewport.current;
      if (element) scrollToPosition(element.scrollLeft + position.step);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [playing, position.step, scrollToPosition]);
  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    setManuallyStopped(true);
    stopAnimation();
    if (
      (event.pointerType && event.pointerType !== "mouse") ||
      event.button !== 0
    )
      return;
    const element = viewport.current;
    if (!element) return;
    drag.current = {
      x: event.clientX,
      left: element.scrollLeft,
      pointerId: event.pointerId,
      moved: false,
    };
  }
  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const current = drag.current,
      element = viewport.current;
    if (!current || !element || event.pointerId !== current.pointerId) return;
    const delta = event.clientX - current.x;
    if (!current.moved && Math.abs(delta) < 8) return;
    if (!current.moved) {
      current.moved = true;
      setDragging(true);
      restoreSnap.current = element.style.scrollSnapType;
      element.style.scrollSnapType = "none";
      element.setPointerCapture?.(event.pointerId);
    }
    event.preventDefault();
    element.scrollLeft = Math.max(
      0,
      Math.min(current.left - delta, element.scrollWidth - element.clientWidth),
    );
    measure();
  }
  function finishPointer(event: PointerEvent<HTMLDivElement>) {
    const current = drag.current,
      element = viewport.current;
    if (!current || event.pointerId !== current.pointerId) return;
    drag.current = null;
    setDragging(false);
    if (current.moved) {
      suppressedUntil.current = Date.now() + 350;
      if (element) {
        element.style.scrollSnapType = restoreSnap.current;
        if (element.hasPointerCapture?.(event.pointerId))
          element.releasePointerCapture?.(event.pointerId);
        scrollToPosition(
          Math.round(element.scrollLeft / position.step) * position.step,
        );
      }
    }
  }
  function onClickCapture(event: MouseEvent<HTMLDivElement>) {
    setManuallyStopped(true);
    if (Date.now() < suppressedUntil.current) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const command = {
      ArrowLeft: "previous",
      ArrowRight: "next",
      Home: "first",
      End: "last",
    }[event.key] as "previous" | "next" | "first" | "last" | undefined;
    if (command && hasOverflow) {
      event.preventDefault();
      manualMove(command);
    }
  }
  function onBlur(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null))
      setFocused(false);
  }
  function toggleAutoplay() {
    setManuallyStopped((previous) => !previous);
  }
  return {
    viewport,
    measure,
    dragging,
    canPrevious,
    canNext,
    showControls,
    autoplayEligible,
    manuallyStopped,
    playing,
    manualMove,
    toggleAutoplay,
    pauseForManual: () => setManuallyStopped(true),
    regionEvents: {
      onMouseEnter: () => setHovered(true),
      onMouseLeave: () => setHovered(false),
      onFocusCapture: () => setFocused(true),
      onBlurCapture: onBlur,
      onKeyDown,
    },
    viewportEvents: {
      onPointerDown,
      onPointerMove,
      onPointerUp: finishPointer,
      onPointerCancel: finishPointer,
      onLostPointerCapture: finishPointer,
      onClickCapture,
      onTouchStart: () => {
        setManuallyStopped(true);
        stopAnimation();
      },
      onWheel: () => setManuallyStopped(true),
      onDragStart: (event: React.DragEvent) => event.preventDefault(),
    },
  };
}
