"use client";
import { useCallback, useMemo, useState } from "react";
import { ReactFlow, Background, MiniMap, Controls } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

type NodeT = { id: string; keys: number[]; level: number; x: number };
type EdgeT = { id: string; source: string; target: string };

function layout(nodes: NodeT[]): { id: string; position: { x: number; y: number }; data: { label: string } }[] {
  const byLevel: Record<number, NodeT[]> = {};
  nodes.forEach(n => {
    byLevel[n.level] = byLevel[n.level] || [];
    byLevel[n.level].push(n);
  });
  const res: any[] = [];
  Object.keys(byLevel).forEach(k => {
    const lvl = parseInt(k);
    const row = byLevel[lvl].sort((a,b)=>a.x-b.x);
    row.forEach((n,i) => {
      res.push({ id: n.id, position: { x: i*180, y: lvl*120 }, data: { label: n.keys.join(" | ") || "•" } });
    });
  });
  return res;
}

function split(nodes: NodeT[], edges: EdgeT[], parent: NodeT | null, node: NodeT) {
  if (node.keys.length <= 2) return;
  const midVal = node.keys[1];
  const leftKeys = [node.keys[0]];
  const rightKeys = [node.keys[2]];
  const left: NodeT = { id: node.id+"L", keys: leftKeys, level: node.level+1, x: node.x-1 };
  const right: NodeT = { id: node.id+"R", keys: rightKeys, level: node.level+1, x: node.x+1 };
  nodes.splice(nodes.findIndex(n=>n.id===node.id),1);
  if (!parent) {
    const root: NodeT = { id: "R"+Math.random().toString(36).slice(2,6), keys: [midVal], level: 0, x: 0 };
    nodes.push(root);
    left.level = 1; right.level = 1;
    nodes.push(left,right);
    edges.push({ id: "e"+Math.random(), source: root.id, target: left.id });
    edges.push({ id: "e"+Math.random(), source: root.id, target: right.id });
    return;
  }
  nodes.push(left,right);
  edges = edges.filter(e => e.target !== node.id);
  edges.push({ id: "e"+Math.random(), source: parent.id, target: left.id });
  edges.push({ id: "e"+Math.random(), source: parent.id, target: right.id });
  parent.keys.push(midVal);
  parent.keys.sort((a,b)=>a-b);
  split(nodes, edges, null, parent);
}

export default function StructuresPage() {
  const [mode, setMode] = useState<"btree"|"linked">("btree");
  const [nodes, setNodes] = useState<NodeT[]>([{ id: "root", keys: [], level: 0, x: 0 }]);
  const [edges, setEdges] = useState<EdgeT[]>([]);
  const [value, setValue] = useState<number>(0);
  const [listData, setListData] = useState<number[]>([1,2,3,4,5]);
  const [listIndex, setListIndex] = useState(0);

  const flowNodes = useMemo(()=> layout(nodes), [nodes]);
  const flowEdges = useMemo(()=> edges.map(e=>({ id:e.id, source:e.source, target:e.target } as any)), [edges]);

  const insert = useCallback((v: number) => {
    setNodes(prev => {
      const n = prev.map(x=>({ ...x, keys: x.keys.slice() }));
      const e = edges.slice();
      function ins(parent: NodeT | null, id: string) {
        const node = n.find(x=>x.id===id)!;
        if (n.every(x => !e.find(ed=>ed.source===node.id && ed.target===x.id))) {
          node.keys.push(v);
          node.keys.sort((a,b)=>a-b);
          split(n, e, parent, node);
          setEdges(e);
          return;
        }
        const k = node.keys;
        let childId = "";
        const children = e.filter(ed=>ed.source===node.id).map(ed=>ed.target);
        if (v < k[0]) childId = children[0];
        else if (k.length===1 || v < k[1]) childId = children[1];
        else childId = children[2];
        ins(node, childId);
      }
      ins(null, n[0].id);
      return n;
    });
  }, [edges]);

  const makeChild = useCallback((parentId: string) => {
    setNodes(prev => {
      const id = "N"+Math.random().toString(36).slice(2,6);
      const parent = prev.find(x=>x.id===parentId)!;
      const child: NodeT = { id, keys: [], level: parent.level+1, x: parent.x };
      setEdges(e => e.concat({ id: "e"+Math.random(), source: parentId, target: id }));
      return prev.concat(child);
    });
  }, []);

  const buildLinked = useCallback(() => {
    const arr = listData;
    const ns: NodeT[] = arr.map((v,i)=>({ id: "L"+i, keys:[v], level: 0, x: i }));
    const es: EdgeT[] = arr.slice(1).map((_,i)=>({ id: "le"+i, source: "L"+i, target: "L"+(i+1) }));
    setNodes(ns);
    setEdges(es);
    setListIndex(0);
  }, [listData]);

  const stepLinked = useCallback(() => {
    setListIndex(i => Math.min(i+1, nodes.length-1));
  }, [nodes.length]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="mx-auto max-w-7xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Structures Visualizer</h1>
          <div className="flex gap-2">
            <button onClick={()=>{window.location.href="/editor"}} className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700">Back to Editor</button>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={()=>setMode("btree")} className={`px-3 py-2 rounded ${mode==="btree"?"bg-indigo-600 text-white":"border"}`}>B‑Tree</button>
          <button onClick={()=>setMode("linked")} className={`px-3 py-2 rounded ${mode==="linked"?"bg-indigo-600 text-white":"border"}`}>Linked List</button>
        </div>
        {mode==="btree" ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input type="number" value={value} onChange={(e)=>setValue(parseInt(e.target.value||"0"))} className="border rounded px-2 py-1 bg-white dark:bg-gray-800 w-28" />
              <button onClick={()=>insert(value)} className="px-3 py-2 rounded bg-emerald-600 text-white">Insert</button>
              <button onClick={()=>makeChild(nodes[0].id)} className="px-3 py-2 rounded bg-gray-600 text-white">Add Child to Root</button>
            </div>
            <div style={{ height: 520 }} className="border border-gray-200 dark:border-gray-700 rounded">
              <ReactFlow nodes={flowNodes as any} edges={flowEdges as any}>
                <MiniMap />
                <Controls />
                <Background />
              </ReactFlow>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input value={listData.join(",")} onChange={(e)=>setListData(e.target.value.split(",").map(x=>parseInt(x.trim())).filter(x=>!Number.isNaN(x)))} className="border rounded px-2 py-1 bg-white dark:bg-gray-800 w-80" />
              <button onClick={buildLinked} className="px-3 py-2 rounded bg-emerald-600 text-white">Build</button>
              <button onClick={stepLinked} className="px-3 py-2 rounded bg-yellow-600 text-white">Traverse Step</button>
            </div>
            <div style={{ height: 520 }} className="border border-gray-200 dark:border-gray-700 rounded">
              <ReactFlow nodes={flowNodes as any} edges={flowEdges as any}>
                <MiniMap />
                <Controls />
                <Background />
              </ReactFlow>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Index {listIndex+1}/{nodes.length}</div>
          </div>
        )}
      </div>
    </div>
  );
}

