"use client";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";

type Props = {
  size?: number;
  trigger?: number;
};

export function AnimatedLogo({ size = 42, trigger = 0 }: Props) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const stroke = 2;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;

  useEffect(() => {
    setMounted(true);
  }, []);

  const palette = useMemo(() => {
    if (resolvedTheme === "dark") {
      return {
        ringStart: "#22d3ee",
        ringEnd: "#06b6d4",
        coreStart: "#0ea5e9",
        coreEnd: "#7c3aed",
        glyph: "#ffffff",
      };
    }
    return {
      ringStart: "#6366f1",
      ringEnd: "#a855f7",
      coreStart: "#eef2ff",
      coreEnd: "#ede9fe",
      glyph: "#111827",
    };
  }, [resolvedTheme]);

  return (
    <div style={{ width: size, height: size }} className="relative">
      <div className="absolute inset-0" style={{ filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.25))" }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="url(#grad)"
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={0}
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={palette.ringStart} />
              <stop offset="100%" stopColor={palette.ringEnd} />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="absolute inset-0 rounded-full grid place-items-center">
        <div
          className="rounded-lg w-[70%] h-[70%] grid place-items-center"
          style={{
            background:
              `linear-gradient(135deg, ${palette.coreStart}, ${palette.coreEnd})`,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M18 7.5A6.5 6.5 0 1 0 18 16.5" stroke={palette.glyph} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M18 8v8" stroke={palette.glyph} strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
      </div>
      {mounted && (
        <motion.div
          key={`shine-${trigger}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.15, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 rounded-full"
          style={{
            background:
              "radial-gradient(closest-side, rgba(255,255,255,0.18), rgba(255,255,255,0))",
          }}
        />
      )}
    </div>
  );
}
