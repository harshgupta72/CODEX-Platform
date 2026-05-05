"use client";
import { useCallback, useMemo, useState } from "react";
import { ReactFlow, Background, MiniMap, Controls, addEdge } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

type NodeT = { id: string; position: { x: number; y: number }; data: { label: string } };
type EdgeT = { id: string; source: string; target: string; label?: string };

export default function GraphVisualizerPage() {
  const [nodes, setNodes] = useState<NodeT[]>([
    { id: "1", position: { x: 0, y: 0 }, data: { label: "A" } },
    { id: "2", position: { x: 200, y: 100 }, data: { label: "B" } },
  ]);
  const [edges, setEdges] = useState<EdgeT[]>([{ id: "e1-2", source: "1", target: "2", label: "edge" }]);
  const onConnect = useCallback((params: any) => setEdges((eds) => addEdge(params, eds as any) as any), []);
  const addNode = () => {
    const id = String(nodes.length + 1);
    setNodes(n => n.concat({ id, position: { x: Math.random() * 400, y: Math.random() * 200 }, data: { label: id } }));
  };
  const addRandEdge = () => {
    if (nodes.length < 2) return;
    const a = nodes[Math.floor(Math.random() * nodes.length)].id;
    let b = a;
    while (b === a) b = nodes[Math.floor(Math.random() * nodes.length)].id;
    setEdges(e => e.concat({ id: `e${a}-${b}`, source: a, target: b }));
  };
  const flowNodes = useMemo(() => nodes.map(n => ({ id: n.id, position: n.position, data: n.data } as any)), [nodes]);
  const flowEdges = useMemo(() => edges.map(e => ({ id: e.id, source: e.source, target: e.target, label: e.label } as any)), [edges]);
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="mx-auto max-w-7xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Graph Visualizer</h1>
          <div className="flex gap-2">
            <button onClick={() => { window.location.href = "/editor"; }} className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700">Back to Editor</button>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={addNode} className="px-3 py-2 rounded bg-indigo-600 text-white">Add Node</button>
          <button onClick={addRandEdge} className="px-3 py-2 rounded bg-emerald-600 text-white">Add Edge</button>
        </div>
        <div style={{ height: 500 }} className="border border-gray-200 dark:border-gray-700 rounded">
          <ReactFlow nodes={flowNodes as any} edges={flowEdges as any} onConnect={onConnect}>
            <MiniMap />
            <Controls />
            <Background />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}

