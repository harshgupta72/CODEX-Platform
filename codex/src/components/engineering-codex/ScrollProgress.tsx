'use client';
import { useEffect, useState } from 'react';

/** A thin reading-progress bar fixed under the header. Tracks scroll within the chapter article. */
export default function ScrollProgress({ targetSelector = 'main' }: { targetSelector?: string }) {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    function update() {
      const el = document.querySelector(targetSelector) as HTMLElement | null;
      const total = (el?.scrollHeight ?? document.body.scrollHeight) - window.innerHeight;
      if (total <= 0) { setPct(0); return; }
      const y = window.scrollY;
      const ratio = Math.min(1, Math.max(0, y / total));
      setPct(Math.round(ratio * 100));
    }
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [targetSelector]);

  return (
    <div
      aria-hidden
      className="fixed top-14 left-0 right-0 z-40 h-[2px] bg-transparent pointer-events-none"
    >
      <div
        className="h-full transition-all duration-150 ease-out"
        style={{
          width: `${pct}%`,
          background: 'linear-gradient(90deg, var(--accent), var(--accent-2), var(--accent-3))',
        }}
      />
    </div>
  );
}
