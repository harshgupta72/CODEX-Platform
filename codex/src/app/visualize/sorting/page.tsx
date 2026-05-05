"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { SortAlgo, SortEvent } from "@/lib/viz/types";
import { hasFirebaseConfig } from "@/lib/env";
import { getFirebase } from "@/lib/firebase";
import axios from "axios";

function randArray(n: number): number[] {
  const arr = Array.from({ length: n }, () => Math.floor(Math.random() * 100) + 1);
  return arr;
}

export default function SortingVisualizerPage() {
  const [algo, setAlgo] = useState<SortAlgo>("bubble");
  const [size, setSize] = useState(30);
  const [speed, setSpeed] = useState(1);
  const [base, setBase] = useState<number[]>(randArray(30));
  const [events, setEvents] = useState<SortEvent[]>([]);
  const [arr, setArr] = useState<number[]>([]);
  const [ptr, setPtr] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef<any>(null);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    const w = new Worker(new URL("../../../workers/sortWorker.ts", import.meta.url), { type: "module" });
    w.onmessage = (e: MessageEvent) => {
      const ev = e.data.events as SortEvent[];
      setEvents(ev);
      const init = ev.find(x => x.t === "init") as any;
      setArr(init?.a || []);
      setPtr(0);
      setPlaying(false);
    };
    workerRef.current = w;
    return () => {
      w.terminate();
    };
  }, []);

  function generate() {
    const a = randArray(size);
    setBase(a);
    workerRef.current?.postMessage({ algo, array: a });
  }

  useEffect(() => {
    generate();
  }, [algo, size]);

  function step(ev: SortEvent) {
    if (!ev) return;
    if (ev.t === "swap") {
      setArr(prev => {
        const p = prev.slice();
        const tmp = p[ev.i];
        p[ev.i] = p[ev.j];
        p[ev.j] = tmp;
        return p;
      });
    } else if (ev.t === "set") {
      setArr(prev => {
        const p = prev.slice();
        p[ev.i] = ev.v;
        return p;
      });
    }
  }

  function play() {
    if (playing) return;
    setPlaying(true);
    const tick = () => {
      setPtr(p => {
        const next = p + 1;
        if (p < events.length) step(events[p]);
        if (next >= events.length) {
          setPlaying(false);
          return next;
        }
        return next;
      });
      timer.current = setTimeout(() => requestAnimationFrame(tick), Math.max(10, 200 / speed));
    };
    tick();
  }

  function pause() {
    setPlaying(false);
    if (timer.current) clearTimeout(timer.current);
  }

  function resetPlayback() {
    const init = events.find(x => x.t === "init") as any;
    setArr(init?.a?.slice() || base.slice());
    setPtr(0);
    setPlaying(false);
    if (timer.current) clearTimeout(timer.current);
  }

  const max = useMemo(() => Math.max(1, ...arr), [arr]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="mx-auto max-w-7xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Sorting Visualizer</h1>
          <div className="flex gap-2">
            <button onClick={() => { window.location.href = "/editor"; }} className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700">Back to Editor</button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select value={algo} onChange={(e) => setAlgo(e.target.value as SortAlgo)} className="border rounded px-2 py-1 bg-white dark:bg-gray-800">
            <option value="bubble">Bubble</option>
            <option value="selection">Selection</option>
            <option value="insertion">Insertion</option>
            <option value="quick">Quick</option>
            <option value="merge">Merge</option>
          </select>
          <label className="flex items-center gap-2">Size
            <input type="range" min={5} max={100} value={size} onChange={(e) => setSize(parseInt(e.target.value))} />
          </label>
          <label className="flex items-center gap-2">Speed
            <input type="range" min={1} max={10} value={speed} onChange={(e) => setSpeed(parseInt(e.target.value))} />
          </label>
          <button onClick={generate} className="px-3 py-2 rounded bg-indigo-600 text-white">New Array</button>
          {!playing ? (
            <button onClick={play} className="px-3 py-2 rounded bg-emerald-600 text-white">Play</button>
          ) : (
            <button onClick={pause} className="px-3 py-2 rounded bg-yellow-500 text-white">Pause</button>
          )}
          <button onClick={() => { resetPlayback(); }} className="px-3 py-2 rounded bg-gray-600 text-white">Reset</button>
          <button
            onClick={async () => {
              try {
                if (hasFirebaseConfig()) {
                  const { db } = getFirebase();
                  const { collection, addDoc, serverTimestamp } = await import("firebase/firestore");
                  await addDoc(collection(db, "viz_runs"), {
                    kind: "sorting",
                    algo,
                    size,
                    speed,
                    base,
                    events,
                    createdAt: serverTimestamp(),
                  });
                }
              } catch {}
            }}
            className="px-3 py-2 rounded bg-blue-600 text-white"
          >
            Save
          </button>
          <button
            onClick={async () => {
              try {
                const codeText = `array = [${base.join(",")}]; algorithm = "${algo}"`;
                await axios.post("/api/rag-analyzer", { code: codeText, language: "python" });
              } catch {}
              alert("Requested analysis");
            }}
            className="px-3 py-2 rounded bg-purple-600 text-white"
          >
            Explain
          </button>
        </div>

        <div className="h-80 border border-gray-200 dark:border-gray-700 rounded-md p-3 bg-white dark:bg-gray-800">
          <div className="h-full flex items-end gap-[2px]">
            {arr.map((v, idx) => {
              const h = `${Math.round((v / max) * 100)}%`;
              return (
                <div key={idx} className="flex-1 bg-blue-500 relative" style={{ height: h }}>
                  <span className="absolute -top-6 text-[10px] text-gray-600 dark:text-gray-300">{v}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400">
          Events: {events.length} • Step: {ptr}/{events.length}
        </div>
      </div>
    </div>
  );
}
