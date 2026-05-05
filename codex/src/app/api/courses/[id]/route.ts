import { NextRequest, NextResponse } from "next/server";
import { getFirebase } from "@/lib/firebase";
import { doc, getDoc, updateDoc, deleteDoc, serverTimestamp, Timestamp } from "firebase/firestore";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { db } = getFirebase();
    const docRef = doc(db, "courses", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const data = docSnap.data();
    return NextResponse.json({
      id: docSnap.id,
      ...data,
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
      updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
    });
  } catch (error: any) {
    console.error("Error fetching course:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const data = await req.json();
    const { id } = await params;
    const { db } = getFirebase();
    const docRef = doc(db, "courses", id);
    
    const update: any = { updatedAt: serverTimestamp() };
    const allowedFields = ["title", "description", "category", "difficulty", "status", "startDate", "endDate", "coverImageUrl", "materialUrl", "materialType", "outcomes"];
    
    allowedFields.forEach(k => {
      if (data[k] !== undefined) update[k] = data[k];
    });
    
    await updateDoc(docRef, update);
    return new Response(null, { status: 204 });
  } catch (error: any) {
    console.error("Error updating course:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { db } = getFirebase();
    const docRef = doc(db, "courses", id);
    await deleteDoc(docRef);
    return new Response(null, { status: 204 });
  } catch (error: any) {
    console.error("Error deleting course:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
