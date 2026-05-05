import type { SortEvent, SortAlgo } from "@/lib/viz/types";

function bubble(a: number[]): SortEvent[] {
  const ev: SortEvent[] = [{ t: "init", a: a.slice() }];
  const arr = a.slice();
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      ev.push({ t: "compare", i: j, j: j + 1 });
      if (arr[j] > arr[j + 1]) {
        const tmp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = tmp;
        ev.push({ t: "swap", i: j, j: j + 1 });
      }
    }
    ev.push({ t: "mark", i: n - i - 1, tag: "sorted" });
  }
  ev.push({ t: "mark", i: 0, tag: "sorted" });
  return ev;
}

function selection(a: number[]): SortEvent[] {
  const ev: SortEvent[] = [{ t: "init", a: a.slice() }];
  const arr = a.slice();
  const n = arr.length;
  for (let i = 0; i < n; i++) {
    let min = i;
    for (let j = i + 1; j < n; j++) {
      ev.push({ t: "compare", i: min, j });
      if (arr[j] < arr[min]) min = j;
    }
    if (min !== i) {
      const tmp = arr[i];
      arr[i] = arr[min];
      arr[min] = tmp;
      ev.push({ t: "swap", i, j: min });
    }
    ev.push({ t: "mark", i, tag: "sorted" });
  }
  return ev;
}

function insertion(a: number[]): SortEvent[] {
  const ev: SortEvent[] = [{ t: "init", a: a.slice() }];
  const arr = a.slice();
  for (let i = 1; i < arr.length; i++) {
    const key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > key) {
      ev.push({ t: "compare", i: j, j: j + 1 });
      arr[j + 1] = arr[j];
      ev.push({ t: "set", i: j + 1, v: arr[j] });
      j--;
    }
    arr[j + 1] = key;
    ev.push({ t: "set", i: j + 1, v: key });
  }
  for (let i = 0; i < arr.length; i++) ev.push({ t: "mark", i, tag: "sorted" });
  return ev;
}

function quick(a: number[]): SortEvent[] {
  const ev: SortEvent[] = [{ t: "init", a: a.slice() }];
  const arr = a.slice();
  function part(l: number, r: number): number {
    const pivot = arr[r];
    ev.push({ t: "mark", i: r, tag: "pivot" });
    let i = l;
    for (let j = l; j < r; j++) {
      ev.push({ t: "compare", i: j, j: r });
      if (arr[j] <= pivot) {
        const tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
        ev.push({ t: "swap", i, j });
        i++;
      }
    }
    const tmp = arr[i];
    arr[i] = arr[r];
    arr[r] = tmp;
    ev.push({ t: "swap", i, j: r });
    return i;
  }
  function qs(l: number, r: number) {
    if (l >= r) {
      if (l === r) ev.push({ t: "mark", i: l, tag: "sorted" });
      return;
    }
    const p = part(l, r);
    ev.push({ t: "mark", i: p, tag: "sorted" });
    qs(l, p - 1);
    qs(p + 1, r);
  }
  qs(0, arr.length - 1);
  return ev;
}

function merge(a: number[]): SortEvent[] {
  const ev: SortEvent[] = [{ t: "init", a: a.slice() }];
  const arr = a.slice();
  function mg(l: number, m: number, r: number) {
    const left = arr.slice(l, m + 1);
    const right = arr.slice(m + 1, r + 1);
    let i = 0, j = 0, k = l;
    while (i < left.length && j < right.length) {
      ev.push({ t: "compare", i: l + i, j: m + 1 + j });
      if (left[i] <= right[j]) {
        arr[k] = left[i];
        ev.push({ t: "set", i: k, v: left[i] });
        i++;
      } else {
        arr[k] = right[j];
        ev.push({ t: "set", i: k, v: right[j] });
        j++;
      }
      k++;
    }
    while (i < left.length) {
      arr[k] = left[i];
      ev.push({ t: "set", i: k, v: left[i] });
      i++; k++;
    }
    while (j < right.length) {
      arr[k] = right[j];
      ev.push({ t: "set", i: k, v: right[j] });
      j++; k++;
    }
  }
  function ms(l: number, r: number) {
    if (l >= r) return;
    const m = Math.floor((l + r) / 2);
    ms(l, m);
    ms(m + 1, r);
    mg(l, m, r);
  }
  ms(0, arr.length - 1);
  for (let i = 0; i < arr.length; i++) ev.push({ t: "mark", i, tag: "sorted" });
  return ev;
}

function run(algo: SortAlgo, a: number[]): SortEvent[] {
  if (algo === "bubble") return bubble(a);
  if (algo === "selection") return selection(a);
  if (algo === "insertion") return insertion(a);
  if (algo === "quick") return quick(a);
  return merge(a);
}

self.onmessage = (e: MessageEvent) => {
  const { algo, array } = e.data as { algo: SortAlgo; array: number[] };
  const events = run(algo, array);
  (self as any).postMessage({ events });
};
