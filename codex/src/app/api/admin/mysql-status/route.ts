import { NextResponse } from "next/server";
import { getPool } from "@/lib/mysql";

export async function GET() {
  const host = process.env.MYSQL_HOST;
  const user = process.env.MYSQL_USER;
  const dbName = process.env.MYSQL_DB;
  const configured = Boolean(host && user && dbName);

  if (!configured) {
    return NextResponse.json(
      { configured: false, ok: false, error: "Missing MySQL environment variables" },
      { status: 200 }
    );
  }

  try {
    const pool = getPool();
    await pool.query("SELECT 1");
    return NextResponse.json({ configured: true, ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { configured: true, ok: false, error: e.message || String(e) },
      { status: 500 }
    );
  }
}
