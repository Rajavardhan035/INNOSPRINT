import React, { useEffect, useState } from 'react';

export default function CountUp({
  value = 0,
  duration = 900,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
}) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const startVal = displayValue;
    const targetVal = Number(value) || 0;

    if (startVal === targetVal) return;

    let animationFrameId;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Quartic Out easing
      const easedProgress = 1 - Math.pow(1 - progress, 4);
      const current = startVal + (targetVal - startVal) * easedProgress;

      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setDisplayValue(targetVal);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animationFrameId);
  }, [value, duration]);

  const formatted = displayValue.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span className={`tabular-nums font-mono ${className}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
