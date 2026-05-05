import { NextRequest, NextResponse } from "next/server";
import { hasFirebaseConfig } from "@/lib/env";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action as string;
    const userId = body.userId as string | undefined;
    const problemId = body.problemId as string | undefined;

    if (action === "start") {
      const sessionId = crypto.randomUUID();
      const disableWrites = process.env.FIRESTORE_DISABLE_WRITES === 'true';
      if (hasFirebaseConfig() && !disableWrites) {
        try {
          // Use dynamic import to avoid server-side issues
          const { getFirebase } = await import("@/lib/firebase");
          const { db } = getFirebase();
          const { doc, setDoc, serverTimestamp, collection } = await import("firebase/firestore");
          const ref = doc(collection(db, "proctor_sessions"), sessionId);
          await setDoc(ref, {
            sessionId,
            userId: userId || null,
            problemId: problemId || null,
            startedAt: serverTimestamp(),
            endedAt: null,
          });
        } catch (err) {
          console.error("Failed to save proctor session:", err);
          // Continue even if Firebase fails
        }
      }
      return NextResponse.json({ sessionId });
    }

    if (action === "end") {
      const sessionId = body.sessionId as string;
      const report = body.report as any;
      const disableWrites = process.env.FIRESTORE_DISABLE_WRITES === 'true';
      if (hasFirebaseConfig() && !disableWrites) {
        try {
          // Use dynamic import to avoid server-side issues
          const { getFirebase } = await import("@/lib/firebase");
          const { db } = getFirebase();
          const { doc, serverTimestamp, collection, updateDoc } = await import("firebase/firestore");
          const ref = doc(collection(db, "proctor_sessions"), sessionId);
          await updateDoc(ref, { 
            endedAt: serverTimestamp(),
            report: report || {},
            status: report?.violationCount > 3 ? "Flagged" : "Valid"
          });
        } catch (err) {
          console.error("Failed to update proctor session:", err);
          // Continue even if Firebase fails
        }
      }
      return NextResponse.json({ sessionId });
    }

    return NextResponse.json({ error: "invalid action" }, { status: 400 });
  } catch (e: any) {
    const msg = e?.message || "session error";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
