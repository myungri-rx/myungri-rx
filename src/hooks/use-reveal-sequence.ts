
import { useState, useCallback, useRef, useEffect } from "react";

interface UseRevealSequenceOptions {
  totalSections: number;
  intervalMs?: number;
}

export function useRevealSequence({
  totalSections,
  intervalMs = 500,
}: UseRevealSequenceOptions) {
  const [visibleCount, setVisibleCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startReveal = useCallback(() => {
    setVisibleCount(1);
    intervalRef.current = setInterval(() => {
      setVisibleCount((prev) => {
        if (prev >= totalSections) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return prev;
        }
        return prev + 1;
      });
    }, intervalMs);
  }, [totalSections, intervalMs]);

  const resetReveal = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setVisibleCount(0);
  }, []);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return {
    visibleCount,
    startReveal,
    resetReveal,
    isVisible: (index: number) => index < visibleCount,
  };
}
