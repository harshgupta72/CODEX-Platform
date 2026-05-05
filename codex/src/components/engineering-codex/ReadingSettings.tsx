'use client';
import { useState, useEffect, useRef } from 'react';

interface Prefs {
  size:       number;
  lineHeight: number;
  weight:     number;
}

const DEFAULTS: Prefs = { size: 18, lineHeight: 1.78, weight: 400 };

function apply(p: Prefs) {
  const r = document.documentElement;
  r.style.setProperty('--reading-size',   `${p.size}px`);
  r.style.setProperty('--reading-lh',     String(p.lineHeight));
  r.style.setProperty('--reading-weight', String(p.weight));
}

export default function ReadingSettings() {
  const [open,  setOpen]  = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('reading-prefs');
      if (saved) {
        const p = { ...DEFAULTS, ...JSON.parse(saved) } as Prefs;
        setPrefs(p);
        apply(p);
      } else {
        apply(DEFAULTS);
      }
    } catch { apply(DEFAULTS); }
  }, []);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  function update(patch: Partial<Prefs>) {
    setPrefs(prev => {
      const next = { ...prev, ...patch };
      apply(next);
      localStorage.setItem('reading-prefs', JSON.stringify(next));
      return next;
    });
  }

  function reset() { update(DEFAULTS); }

  const weights = [
    { value: 300, label: 'Light' },
    { value: 400, label: 'Regular' },
    { value: 500, label: 'Medium' },
  ];

  return (
    <div ref={panelRef} className="fixed bottom-[80px] right-4 z-50">
      {open && (
        <div className="mb-2 w-72 rounded-2xl overflow-hidden
          bg-[var(--surface)]
          border border-[var(--hairline-2)]
          shadow-[0_18px_50px_-12px_rgba(28,20,13,0.18)] dark:shadow-[0_18px_50px_-12px_rgba(0,0,0,0.65)]">

          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <span className="text-[11px] font-black uppercase tracking-widest text-[var(--muted)]">
              Reading
            </span>
            <button onClick={reset}
              className="text-[11px] font-semibold text-[var(--muted)] hover:text-[var(--accent)] transition-colors">
              Reset
            </button>
          </div>

          <div className="px-4 pb-4 space-y-5">

            {/* Live preview */}
            <div className="rounded-xl border border-[var(--hairline)] bg-[var(--surface-2)] p-3">
              <p
                className="font-serif text-[var(--ink-2)] m-0"
                style={{
                  fontSize: prefs.size,
                  lineHeight: prefs.lineHeight,
                  fontWeight: prefs.weight,
                }}
              >
                The quick brown fox jumps — <strong>preview</strong>.
              </p>
            </div>

            {/* Font size */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[12px] font-semibold text-[var(--ink)]">Font Size</span>
                <span className="text-[11px] font-mono text-[var(--muted)]">{prefs.size}px</span>
              </div>
              <input type="range"
                min={14} max={26} step={1}
                value={prefs.size}
                onChange={e => update({ size: Number(e.target.value) })}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer
                  bg-[var(--hairline)]
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-[var(--accent)]
                  [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-webkit-slider-thumb]:shadow-sm"/>
            </div>

            {/* Line spacing */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-[12px] font-semibold text-[var(--ink)]">Line Spacing</span>
                <span className="text-[11px] font-mono text-[var(--muted)]">{prefs.lineHeight.toFixed(2)}</span>
              </div>
              <input type="range"
                min={1.4} max={2.2} step={0.05}
                value={prefs.lineHeight}
                onChange={e => update({ lineHeight: Number(e.target.value) })}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer
                  bg-[var(--hairline)]
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-[var(--accent)]
                  [&::-webkit-slider-thumb]:cursor-pointer"/>
            </div>

            {/* Font weight */}
            <div>
              <span className="text-[12px] font-semibold text-[var(--ink)] block mb-2">
                Font Weight
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {weights.map(w => (
                  <button key={w.value} onClick={() => update({ weight: w.value })}
                    className={`py-1.5 rounded-lg text-[12px] transition-all border
                      ${prefs.weight === w.value
                        ? 'bg-[var(--accent)] text-white border-transparent font-semibold'
                        : 'bg-transparent border-[var(--hairline-2)] text-[var(--muted)] hover:border-[var(--accent)]'
                      }`}
                    style={{ fontWeight: w.value }}>
                    {w.label}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Toggle button */}
      <button onClick={() => setOpen(o => !o)}
        aria-label="Reading settings"
        className={`w-11 h-11 rounded-full flex items-center justify-center
          text-[14px] font-black tracking-tight font-serif
          border shadow-md transition-all
          ${open
            ? 'btn-primary text-white border-transparent'
            : 'bg-[var(--surface)] border-[var(--hairline-2)] text-[var(--ink-2)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
          }`}>
        Aa
      </button>
    </div>
  );
}
