import { NextRequest } from "next/server";
import { getCollection } from "@/lib/mongo";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ownerUid = searchParams.get("ownerUid");
    const col = await getCollection("notices");
    const q = ownerUid ? { ownerUid } : {};
    const rows = await col.find(q).sort({ createdAt: -1 }).toArray();
    const res = rows.map((r: any) => ({
      id: String(r._id),
      ownerUid: r.ownerUid,
      title: r.title,
      body: r.body,
      audience: r.audience,
      courseId: r.courseId,
      createdAt: r.createdAt
    }));
    return new Response(JSON.stringify(res), { status: 200 });
  } catch {
    return new Response(JSON.stringify([]), { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const col = await getCollection("notices");
    const doc = {
      ownerUid: String(data.ownerUid || ""),
      title: String(data.title || ""),
      body: String(data.body || ""),
      audience: String(data.audience || "all"),
      courseId: data.courseId || null,
      createdAt: new Date()
    };
    const res = await col.insertOne(doc);
    return new Response(JSON.stringify({ id: String(res.insertedId) }), { status: 201 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
