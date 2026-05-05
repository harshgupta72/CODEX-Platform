'use client';
import { useEffect, useMemo, useRef, useState } from 'react';

export interface TerminalStats {
  domainCount:  number;
  courseCount:  number;
  chapterCount: number;
  wordCount:    number;
  svgCount:     number;
  hours:        number;
  domains:      { id: string; label: string }[];
  courses:      { id: string; domain: string; title: string; chapters: number; svgs: number }[];
}

type LineKind = 'cmd' | 'log' | 'ok' | 'warn' | 'dim' | 'blank' | 'header';
interface Line { kind: LineKind; text: string }

const PROMPT = '~/codex $';

function fmtNum(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(n >= 10_000 ? 0 : 1) + 'k';
  return String(n);
}
function pad(s: string, w: number): string {
  return s.length >= w ? s.slice(0, w) : s + ' '.repeat(w - s.length);
}

function buildScript(stats: TerminalStats): Line[] {
  const lines: Line[] = [];

  // ── codex init ───────────────────────────────────────────────────────────
  lines.push({ kind: 'cmd', text: 'codex init' });
  lines.push({ kind: 'log', text: 'Loading domain registry...........' });
  lines.push({ kind: 'ok',  text: `✓ ${stats.domainCount} domains` });
  lines.push({ kind: 'log', text: 'Mounting courses..................' });
  lines.push({ kind: 'ok',  text: `✓ ${stats.courseCount} mounted` });
  lines.push({ kind: 'log', text: 'Indexing chapters.................' });
  lines.push({ kind: 'ok',  text: `✓ ${stats.chapterCount} chapters · ${fmtNum(stats.wordCount)} words` });
  lines.push({ kind: 'log', text: 'Compiling SVG animations..........' });
  lines.push({ kind: 'ok',  text: `✓ ${stats.svgCount} figures` });
  lines.push({ kind: 'log', text: 'Calibrating reading time..........' });
  lines.push({ kind: 'ok',  text: `✓ ~${stats.hours}h total` });
  lines.push({ kind: 'blank', text: '' });

  // ── codex courses --list ─────────────────────────────────────────────────
  lines.push({ kind: 'cmd', text: 'codex courses --list' });
  lines.push({ kind: 'header', text: `${pad('DOMAIN', 16)}${pad('COURSE', 32)}CH` });
  for (const c of stats.courses) {
    lines.push({
      kind: 'dim',
      text: `${pad(c.domain, 16)}${pad(c.id, 32)}${String(c.chapters).padStart(2, ' ')}`,
    });
  }
  lines.push({ kind: 'blank', text: '' });

  // ── codex serve ──────────────────────────────────────────────────────────
  lines.push({ kind: 'cmd', text: 'codex serve --port 3000' });
  lines.push({ kind: 'log', text: 'Booting reader shell...' });
  lines.push({ kind: 'ok',  text: `✓ static pages: ${stats.courseCount + stats.chapterCount + 1}` });
  lines.push({ kind: 'ok',  text: `✓ first load JS: ~99 KB` });
  lines.push({ kind: 'warn',text: '▲ ready — open localhost:3000' });
  lines.push({ kind: 'blank', text: '' });

  return lines;
}

export default function HeroTerminal({ stats }: { stats: TerminalStats }) {
  const SCRIPT = useMemo(() => buildScript(stats), [stats]);

  const [printed, setPrinted] = useState<Line[]>([]);
  const [typing,  setTyping]  = useState<number>(0);
  const [cursor,  setCursor]  = useState<number>(0);
  const tick = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const current = SCRIPT[typing % SCRIPT.length];
    const isCmd   = current.kind === 'cmd';

    const charDelay = isCmd ? 38 : 6;
    const lineDelay =
      current.kind === 'blank' ? 90  :
      current.kind === 'cmd'   ? 280 :
      current.kind === 'ok'    ? 220 : 95;

    if (cursor < current.text.length) {
      tick.current = setTimeout(() => setCursor(c => c + 1), charDelay);
    } else {
      tick.current = setTimeout(() => {
        const next = (typing + 1) % SCRIPT.length;
        if (next === 0) setPrinted([]);
        else setPrinted(p => [...p, current]);
        setTyping(next);
        setCursor(0);
      }, lineDelay);
    }
    return () => { if (tick.current) clearTimeout(tick.current); };
  }, [typing, cursor, SCRIPT]);

  const live = SCRIPT[typing % SCRIPT.length];

  return (
    <div className="hero-terminal-wrap pointer-events-none select-none" aria-hidden="true">
      <div className="hero-terminal-stage">
        <div className="hero-terminal">
          {/* macOS-style chrome */}
          <div className="hero-terminal-bar">
            <span className="hero-tl-dot" style={{ background: '#ff5f57' }} />
            <span className="hero-tl-dot" style={{ background: '#febc2e' }} />
            <span className="hero-tl-dot" style={{ background: '#28c840' }} />
            <span className="hero-terminal-title">codex — zsh — 80×24</span>
          </div>

          {/* Body */}
          <pre className="hero-terminal-body">
            {printed.map((l, i) => <Row key={i} line={l} />)}
            <Row line={live} truncateAt={cursor} live />
          </pre>

          {/* gloss + scanline overlays for depth */}
          <div className="hero-terminal-gloss" />
          <div className="hero-terminal-scanlines" />
        </div>
      </div>

      <style jsx>{`
        .hero-terminal-wrap {
          position: absolute;
          right: -36px;
          top: 16px;
          width: 470px;
          max-width: 50vw;
          z-index: 0;
        }
        .hero-terminal-stage {
          /* The stage holds perspective so children can transform in 3D space. */
          perspective: 1100px;
          perspective-origin: 75% 35%;
          transform-style: preserve-3d;
        }
        .hero-terminal {
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          background: #14110d;
          color: #e0d0ba;
          font-family: var(--font-mono);
          font-size: 11.5px;
          line-height: 1.65;
          transform-style: preserve-3d;
          transform-origin: 50% 50%;
          will-change: transform;
          /* Initial state for the intro spin */
          transform: rotateY(360deg) scale(0.6);
          opacity: 0;
          /* Run the intro once (forwards locks the resting tilt),
             then run the float loop starting after the intro lands. */
          animation:
            hero-intro 1.6s cubic-bezier(0.2, 0.8, 0.25, 1) 0.15s 1 forwards,
            hero-float 9s ease-in-out 1.85s infinite;
          /* Heavy multi-layered shadow → reads as a thick floating panel */
          box-shadow:
            /* ambient */
            0 60px 100px -30px rgba(15, 12, 8, 0.45),
            /* contact */
            0 26px 38px -16px rgba(15, 12, 8, 0.32),
            /* short crisp */
            0 6px 12px -4px rgba(15, 12, 8, 0.28),
            /* edge */
            0 0 0 1px rgba(0, 0, 0, 0.12),
            /* inner top highlight (thickness illusion) */
            inset 0 1px 0 rgba(255, 255, 255, 0.06),
            /* inner bottom shadow (thickness illusion) */
            inset 0 -2px 0 rgba(0, 0, 0, 0.4);
        }
        :global(.dark) .hero-terminal {
          background: #161210;
          box-shadow:
            0 60px 100px -28px rgba(0, 0, 0, 0.85),
            0 26px 38px -14px rgba(0, 0, 0, 0.6),
            0 6px 12px -4px rgba(0, 0, 0, 0.5),
            0 0 0 1px #3a3f4b,
            inset 0 1px 0 rgba(255, 255, 255, 0.04),
            inset 0 -2px 0 rgba(0, 0, 0, 0.6);
        }
        .hero-terminal-bar {
          display: flex; align-items: center; gap: 7px;
          padding: 11px 14px;
          background: #0f0a07;
          border-bottom: 1px solid #1f1814;
        }
        :global(.dark) .hero-terminal-bar {
          background: #21252b;
          border-bottom-color: #2c313a;
        }
        .hero-tl-dot {
          width: 11px; height: 11px; border-radius: 999px;
          box-shadow:
            inset 0 0 0 0.5px rgba(0, 0, 0, 0.25),
            inset 0 -1px 0 rgba(0, 0, 0, 0.18),
            0 0 4px currentColor;
        }
        .hero-terminal-title {
          margin-left: 10px;
          font-size: 10px; font-weight: 700;
          letter-spacing: 0.06em;
          color: #a08872;
        }
        :global(.dark) .hero-terminal-title { color: #636d83; }
        .hero-terminal-body {
          margin: 0;
          padding: 14px 16px 18px;
          min-height: 360px;
          max-height: 360px;
          overflow: hidden;
          white-space: pre;
        }
        .hero-terminal-gloss {
          position: absolute; inset: 0;
          background:
            linear-gradient(180deg,
              rgba(255, 255, 255, 0.08) 0%,
              rgba(255, 255, 255, 0.00) 18%,
              rgba(0, 0, 0, 0.00) 80%,
              rgba(0, 0, 0, 0.10) 100%),
            radial-gradient(ellipse 70% 40% at 80% 0%,
              rgba(255, 255, 255, 0.10), transparent 60%);
          pointer-events: none;
        }
        .hero-terminal-scanlines {
          position: absolute; inset: 0;
          background-image:
            repeating-linear-gradient(
              180deg,
              rgba(255, 255, 255, 0.018) 0px,
              rgba(255, 255, 255, 0.018) 1px,
              transparent 1px,
              transparent 3px);
          pointer-events: none;
          mix-blend-mode: overlay;
        }

        /* Resting 3D tilt — sits "into" the page, lifted top-left, anchored bottom-right */
        @keyframes hero-intro {
          0% {
            transform: rotateY(360deg) rotateX(0deg) rotateZ(0deg) translateY(20px) scale(0.55);
            opacity: 0;
          }
          40% { opacity: 1; }
          100% {
            transform: rotateY(-12deg) rotateX(6deg) rotateZ(-1.4deg) translateY(0) scale(1);
            opacity: 1;
          }
        }
        @keyframes hero-float {
          0%, 100% {
            transform: rotateY(-12deg)   rotateX(6deg)   rotateZ(-1.4deg) translateY(0px);
          }
          50% {
            transform: rotateY(-10.5deg) rotateX(5.2deg) rotateZ(-1.1deg) translateY(-7px);
          }
        }

        @media (max-width: 1023px) {
          .hero-terminal-wrap { display: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-terminal {
            transform: rotateY(-12deg) rotateX(6deg) rotateZ(-1.4deg);
            opacity: 1;
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

function Row({ line, truncateAt, live }: { line: Line; truncateAt?: number; live?: boolean }) {
  const text = truncateAt !== undefined ? line.text.slice(0, truncateAt) : line.text;
  const showCursor = !!live;

  if (line.kind === 'blank') return <div>{'\u00A0'}</div>;
  if (line.kind === 'cmd') {
    return (
      <div>
        <span style={{ color: '#86efac', fontWeight: 700 }}>{PROMPT}</span>{' '}
        <span style={{ color: '#e5d8c6' }}>{text}</span>
        {showCursor && <Caret />}
      </div>
    );
  }
  if (line.kind === 'header') return <div style={{ color: '#a08872', fontWeight: 700 }}>{text}{showCursor && <Caret />}</div>;
  if (line.kind === 'ok')     return <div style={{ color: '#86efac' }}>{text}{showCursor && <Caret />}</div>;
  if (line.kind === 'warn')   return <div style={{ color: '#fcd34d' }}>{text}{showCursor && <Caret />}</div>;
  if (line.kind === 'dim')    return <div style={{ color: '#9aa0a8' }}>{text}{showCursor && <Caret />}</div>;
  return <div style={{ color: '#c5b9a3' }}>{text}{showCursor && <Caret />}</div>;
}

function Caret() {
  return <span className="hero-caret">
    <style jsx>{`
      .hero-caret {
        display: inline-block;
        width: 7px; height: 13px;
        margin-left: 1px;
        background: #fcd34d;
        vertical-align: -2px;
        animation: caret-blink 1s steps(1) infinite;
      }
      @keyframes caret-blink {
        0%, 50% { opacity: 1; }
        51%, 100% { opacity: 0; }
      }
    `}</style>
  </span>;
}
