import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

export async function GET() {
  const uri = process.env.MONGO_URI;
  const dbName = process.env.MONGO_DB;
  const configured = Boolean(uri && dbName);
  if (!configured) {
    return NextResponse.json(
      { configured: false, ok: false, error: "Missing MONGO_URI or MONGO_DB" },
      { status: 200 }
    );
  }
  const client = new MongoClient(uri!);
  try {
    await client.connect();
    const db = client.db(dbName!);
    await db.command({ ping: 1 });
    return NextResponse.json({ configured: true, ok: true }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { configured: true, ok: false, error: e.message || String(e) },
      { status: 500 }
    );
  } finally {
    try {
      await client.close();
    } catch {}
  }
}
