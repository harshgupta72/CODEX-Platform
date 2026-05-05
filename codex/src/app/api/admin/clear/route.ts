import { ensureTables, getPool } from "@/lib/mysql";

export async function POST() {
  await ensureTables();
  const p = getPool();
  await p.query("DELETE FROM assignments");
  await p.query("DELETE FROM problems");
  await p.query("DELETE FROM notices");
  await p.query("DELETE FROM courses");
  return new Response(JSON.stringify({ ok: true }), { status: 200 });
}
