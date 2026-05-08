import { getFirebase } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import axios from "axios";

export async function generateDSAProblem(options: {
  category: string;
  difficulty: string;
  companyStyle?: string;
  pattern?: string;
  questionType?: string;
  userId: string;
}) {
  try {
    // Call internal API instead of NVIDIA directly to avoid connection/CORS errors
    const response = await axios.post("/api/ai/generate-problem", options, {
      timeout: 90000 // Increased to 90 seconds for safety
    });
    const problem = response.data;
    
    if (problem.error) {
      const errorMsg = problem.message || problem.error;
      if (problem.error === "AI_SERVICE_UNAVAILABLE") {
        throw new Error("The AI server is currently busy. Please wait 10 seconds and try again.");
      }
      throw new Error(errorMsg);
    }
    
    // Save to Firestore
    const { db } = getFirebase();
    const docRef = await addDoc(collection(db, "problems"), {
      ...problem,
      generatedBy: options.userId,
      isAiGenerated: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return { id: docRef.id, ...problem };
  } catch (error: any) {
    console.error("AI Problem Generation Error:", error);
    const serverError = error.response?.data?.message || error.response?.data?.error || error.message;
    throw new Error(serverError);
  }
}
