"use client";
import { useState } from "react";
import axios from "axios";

type Ev = { t: "init"; a: number[] } | { t: "swap"; i: number; j: number } | { t: "set"; i: number; v: number };

export default function Judge0VisualizerPage() {
  const [language, setLanguage] = useState<"c"|"cpp"|"python"|"java">("cpp");
  const [code, setCode] = useState<string>(
`#include <bits/stdc++.h>
using namespace std;
int main(){
  vector<int>a={5,1,4,2,8,3};
  cout<<"VIZ:{\\"t\\":\\"init\\",\\"a\\":[5,1,4,2,8,3]}"<<endl;
  int n=a.size();
  for(int i=0;i<n-1;i++){
    for(int j=0;j<n-i-1;j++){
      if(a[j]>a[j+1]){
        int t=a[j];a[j]=a[j+1];a[j+1]=t;
        cout<<"VIZ:{\\\\\\"t\\\\\\":\\\\\\"swap\\\\\\",\\\\\\"i\\\\\\":"<<j<<",\\\\\\"j\\\\\\":"<<j+1<<"}"<<endl;
      }
    }
  }
  return 0;
}`
  );
  const [arr,setArr]=useState<number[]>([]);
  const [events,setEvents]=useState<Ev[]>([]);

  async function run() {
    const res = await axios.post("/api/judge0",{ code, language });
    const out: string = res.data.output || "";
    const ev: Ev[] = [];
    out.split("\n").forEach(line=>{
      const i = line.indexOf("VIZ:");
      if(i>=0){
        try{
          const obj = JSON.parse(line.slice(i+4).trim());
          ev.push(obj);
        }catch{}
      }
    });
    setEvents(ev);
    const init = ev.find(e=>e.t==="init") as any;
    setArr(init?.a||[]);
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <div className="mx-auto max-w-6xl p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Judge0 Visualizer Bridge</h1>
          <button onClick={()=>{window.location.href="/editor"}} className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700">Back to Editor</button>
        </div>
        <div className="flex items-center gap-2">
          <select value={language} onChange={(e)=>setLanguage(e.target.value as any)} className="border rounded px-2 py-1 bg-white dark:bg-gray-800">
            <option value="cpp">C++</option>
            <option value="c">C</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
          </select>
          <button onClick={run} className="px-3 py-2 rounded bg-indigo-600 text-white">Run</button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <textarea value={code} onChange={(e)=>setCode(e.target.value)} className="h-80 border rounded p-2 font-mono text-xs bg-white dark:bg-gray-800" />
          <div className="h-80 border rounded p-3 bg-white dark:bg-gray-800">
            <div className="h-full flex items-end gap-[2px]">
              {arr.map((v,i)=>{
                const max=Math.max(1,...arr);
                const h=`${Math.round((v/max)*100)}%`;
                return <div key={i} className="flex-1 bg-pink-500 relative" style={{height:h}}><span className="absolute -top-6 text-[10px]">{v}</span></div>
              })}
            </div>
          </div>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">Parsed events: {events.length}</div>
      </div>
    </div>
  );
}

