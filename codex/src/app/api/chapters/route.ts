import { NextRequest, NextResponse } from "next/server";
import { getFirebase } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp, Timestamp } from "firebase/firestore";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    const { db } = getFirebase();
    
    let q;
    const chaptersRef = collection(db, "chapters");
    
    if (courseId) {
      q = query(chaptersRef, where("courseId", "==", courseId));
    } else {
      q = query(chaptersRef, orderBy("orderIndex", "asc"), orderBy("createdAt", "asc"));
    }
    
    const querySnapshot = await getDocs(q);
    const res = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
        updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : data.updatedAt,
      };
    });
    
    return NextResponse.json(res);
  } catch (error: any) {
    console.error("Error fetching chapters:", error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { db } = getFirebase();
    
    const docData = {
      courseId: String(data.courseId || ""),
      title: String(data.title || ""),
      description: String(data.description || ""),
      status: String(data.status || "draft"),
      orderIndex: Number(data.orderIndex ?? 0),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, "chapters"), docData);
    return NextResponse.json({ id: docRef.id }, { status: 201 });
  } catch (e: any) {
    console.error("Error creating chapter:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
