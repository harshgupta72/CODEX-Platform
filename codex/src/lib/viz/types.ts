export type SortEvent =
  | { t: "init"; a: number[] }
  | { t: "compare"; i: number; j: number }
  | { t: "swap"; i: number; j: number }
  | { t: "set"; i: number; v: number }
  | { t: "mark"; i: number; tag: "pivot" | "active" | "sorted" };

export type SortAlgo = "bubble" | "selection" | "insertion" | "quick" | "merge";

export type Timeline = SortEvent[];
