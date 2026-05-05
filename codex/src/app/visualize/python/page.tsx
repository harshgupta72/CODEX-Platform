"use client";
import { useEffect, useMemo, useRef, useState } from "react";

type Ev = { t: "init"; a: number[] } | { t: "swap"; i: number; j: number } | { t: "set"; i: number; v: number };

export default function PythonVisualizerPage() {
  const [pyodideReady, setReady] = useState(false);
  const [events, setEvents] = useState<Ev[]>([]);
  const [arr, setArr] = useState<number[]>([]);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const timer = useRef<any>(null);
  const ptr = useRef(0);
  const pyRef = useRef<any>(null);

  useEffect(() => {
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js";
    s.onload = async () => {
      const pyodide = await (globalThis as any).loadPyodide({ indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/" });
      pyRef.current = pyodide;
      setReady(true);
    };
    document.body.appendChild(s);
    return () => { document.body.removeChild(s); };
  }, []);

  async function runDemo() {
    if (!pyRef.current) return;
    const code = `
from js import viz_push
def bubble(a):
    viz_push({"t":"init","a":a[:]})
    n=len(a)
    for i in range(n-1):
        for j in range(n-i-1):
            if a[j]>a[j+1]:
                a[j],a[j+1]=a[j+1],a[j]
                viz_push({"t":"swap","i":j,"j":j+1})
    return a
a=[5,1,4,2,8,3]
bubble(a)
`;
    const ev: Ev[] = [];
    (globalThis as any).viz_push = (x: any) => { ev.push(x); };
    await pyRef.current.runPythonAsync(code);
    setEvents(ev);
    const init = ev.find(e => e.t === "init") as any;
    setArr(init?.a || []);
    ptr.current = 0;
  }

  function step(e: Ev) {
    if (!e) return;
    if (e.t === "swap") {
      setArr(prev => {
        const p = prev.slice();
        const tmp = p[e.i]; p[e.i] = p[e.j]; p[e.j] = tmp;
        return p;
      });
    } else if (e.t === "set") {
      setArr(prev => { const p = prev.slice(); p[e.i] = e.v; return p; });
    }
  }

  function play() {
    if (playing) return;
    setPlaying(true);
    const tick = () => {
      if (ptr.current < events.length) step(events[ptr.current]);
      ptr.current++;
      if (ptr.current >= events.length) { setPlaying(false); return; }
      timer.current = setTimeout(() => requestAnimationFrame(tick), Math.max(10, 200 / speed));
    };
    tick();
  }

  const max = useMemo(() => Math.max(1, ...arr), [arr]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="mx-auto max-w-5xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Python Visualizer (Pyodide)</h1>
          <button onClick={() => { window.location.href = "/editor"; }} className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700">Back to Editor</button>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={runDemo} disabled={!pyodideReady} className="px-3 py-2 rounded bg-indigo-600 text-white disabled:opacity-50">Run Demo</button>
          <label className="flex items-center gap-2">Speed<input type="range" min={1} max={10} value={speed} onChange={(e)=>setSpeed(parseInt(e.target.value))}/></label>
          <button onClick={play} className="px-3 py-2 rounded bg-emerald-600 text-white">Play</button>
        </div>
        <div className="h-72 border border-gray-200 dark:border-gray-700 rounded p-3 bg-white dark:bg-gray-800">
          <div className="h-full flex items-end gap-[2px]">
            {arr.map((v,i)=>{
              const h = `${Math.round((v/max)*100)}%`;
              return <div key={i} className="flex-1 bg-yellow-500 relative" style={{height:h}}><span className="absolute -top-6 text-[10px]">{v}</span></div>
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
