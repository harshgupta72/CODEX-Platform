import { NextRequest } from "next/server";
import { getCollection } from "@/lib/mongo";
import { ObjectId } from "mongodb";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const data = await req.json();
  const { id } = await params;
  const col = await getCollection("problems");
  const update: any = { updatedAt: new Date() };
  ["name", "description", "sampleInput", "sampleOutput", "difficulty"].forEach(k => {
    if (data[k] !== undefined) update[k] = data[k];
  });
  await col.updateOne({ _id: new ObjectId(id) }, { $set: update });
  return new Response(null, { status: 204 });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const col = await getCollection("problems");
  await col.deleteOne({ _id: new ObjectId(id) });
  return new Response(null, { status: 204 });
}
