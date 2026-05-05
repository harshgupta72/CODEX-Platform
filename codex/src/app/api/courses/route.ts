import { NextRequest, NextResponse } from "next/server";
import { getFirebase } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp, Timestamp } from "firebase/firestore";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ownerUid = searchParams.get("ownerUid");
    const { db } = getFirebase();
    
    let q;
    const coursesRef = collection(db, "courses");
    
    if (ownerUid) {
      q = query(coursesRef, where("ownerUid", "==", ownerUid));
    } else {
      q = query(coursesRef, orderBy("createdAt", "desc"));
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
    console.error("Error fetching courses:", error);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { db } = getFirebase();
    
    const docData = {
      ownerUid: String(data.ownerUid || ""),
      title: String(data.title || ""),
      description: String(data.description || ""),
      category: String(data.category || ""),
      difficulty: String(data.difficulty || "Beginner"),
      status: String(data.status || "draft"),
      startDate: String(data.startDate || ""),
      endDate: String(data.endDate || ""),
      outcomes: String(data.outcomes || ""),
      coverImageUrl: data.coverImageUrl || null,
      materialUrl: data.materialUrl || null,
      materialType: data.materialType || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, "courses"), docData);
    return NextResponse.json({ id: docRef.id }, { status: 201 });
  } catch (e: any) {
    console.error("Error creating course:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
