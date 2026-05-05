import { NextRequest } from "next/server";
import { getPool, ensureTables } from "@/lib/mysql";
import { verifyIdToken } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    const decoded = await verifyIdToken(token);
    await ensureTables();
    const pool = getPool();
    const email = decoded.email || "";
    const name = decoded.name || "";
    const uid = decoded.uid;
    await pool.query("INSERT IGNORE INTO users(firebase_uid,email,display_name) VALUES(?,?,?)", [uid, email, name]);
    const [rows] = await pool.query("SELECT id,firebase_uid,email,display_name,created_at FROM users WHERE firebase_uid=?", [uid]);
    return new Response(JSON.stringify({ user: (rows as any)[0] || null }), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 401 });
  }
}
