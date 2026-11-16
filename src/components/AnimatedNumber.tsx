import { useEffect, useRef, useState } from 'react';

interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  durationMs?: number;
}

export default function AnimatedNumber({
  value,
  decimals = 0,
  suffix = '',
  prefix = '',
  durationMs = 360,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const previousRef = useRef(value);

  useEffect(() => {
    const startVal = previousRef.current;
    const endVal = value;
    if (startVal === endVal) return;

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReduced) {
      previousRef.current = endVal;
      setDisplayValue(endVal);
      return;
    }

    let rafId = 0;
    const startTime = performance.now();

    const step = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / durationMs);
      // Cubic ease-out settling curve
      const eased = 1 - Math.pow(1 - t, 3);
      const current = startVal + (endVal - startVal) * eased;
      setDisplayValue(current);

      if (t < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        previousRef.current = endVal;
        setDisplayValue(endVal);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(rafId);
      previousRef.current = endVal;
    };
  }, [value, durationMs]);

  const formatted =
    decimals > 0 ? displayValue.toFixed(decimals) : Math.round(displayValue).toString();

  return (
    <span className="tabular-nums">
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
