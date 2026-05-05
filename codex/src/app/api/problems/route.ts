import { NextRequest } from "next/server";
import { getCollection } from "@/lib/mongo";
import { ObjectId } from "mongodb";
import { ProblemSchema, type ProblemModel } from "@/lib/models";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ownerUid = searchParams.get("ownerUid");
    const col = await getCollection<ProblemModel>("problems");
    const q = ownerUid ? { ownerUid } : {};
    const rows = await col.find(q).sort({ createdAt: -1 }).toArray();
    const res = rows.map((r: ProblemModel & { _id: ObjectId }) => ({
      id: String(r._id),
      ownerUid: r.ownerUid,
      name: r.name,
      description: r.description,
      sampleInput: r.sampleInput,
      sampleOutput: r.sampleOutput,
      difficulty: r.difficulty,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt
    }));
    return new Response(JSON.stringify(res), { status: 200 });
  } catch {
    return new Response(JSON.stringify([]), { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const validated = ProblemSchema.parse(data);
    const col = await getCollection<ProblemModel>("problems");
    const now = new Date();
    const res = await col.insertOne({
      ...validated,
      createdAt: now,
      updatedAt: now,
    } as any);
    return new Response(JSON.stringify({ id: String(res.insertedId) }), { status: 201 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
