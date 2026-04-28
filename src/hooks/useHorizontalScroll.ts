import { useCallback, useRef, useState } from "react";

export function useHorizontalScroll(scrollAmount = 280) {
  const ref = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const check = useCallback(() => {
    if (!ref.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = ref.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  const scrollTo = useCallback(
    (direction: "left" | "right") => {
      ref.current?.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    },
    [scrollAmount]
  );

  return { ref, canScrollLeft, canScrollRight, check, scrollTo };
}
