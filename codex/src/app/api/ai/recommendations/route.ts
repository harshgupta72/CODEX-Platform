import { NextRequest, NextResponse } from "next/server";
import { tryNvidiaCompletion } from "@/lib/nvidia-fallback";

export async function POST(req: NextRequest) {
  try {
    const { studentId, currentLevel, weakAreas, recentProblems, preferences, currentTopic } = await req.json();

    const systemPrompt = "You are an expert coding curriculum designer. Create personalized learning plans in valid JSON format.";
    
    const userPrompt = `Based on this student's profile, create a comprehensive learning plan with specific recommendations:

Student Profile:
- Current Level: ${currentLevel}
- Weak Areas: ${weakAreas?.join(', ') || 'none identified'}
- Recent Problems: ${recentProblems?.map((p: any) => p.title).join(', ') || 'none'}
- Current Topic: ${currentTopic || 'general programming'}
- Preferences: ${preferences?.join(', ') || 'none'}

Create a detailed learning plan in this JSON format:
{
  "immediateActions": [
    {
      "type": "concept_review|practice_problem|tutorial_watch",
      "title": "Action title",
      "description": "What to do and why",
      "estimatedTime": "15-30 minutes",
      "priority": "high|medium|low",
      "resources": ["resource1", "resource2"]
    }
  ],
  "learningPath": [
    {
      "week": 1,
      "focus": "Topic to focus on",
      "goals": ["goal1", "goal2"],
      "problems": ["problem1", "problem2"],
      "concepts": ["concept1", "concept2"]
    }
  ],
  "strengtheningPlan": {
    "weakArea": "specific weak area",
    "approach": "how to strengthen it",
    "practiceProblems": ["problem1", "problem2"],
    "studyResources": ["resource1", "resource2"],
    "timeline": "2-3 weeks"
  },
  "nextSteps": [
    "Specific action item 1",
    "Specific action item 2"
  ],
  "encouragement": "Motivational message highlighting their potential"
}

Focus on:
1. Addressing immediate weak areas
2. Building a progressive learning path
3. Providing specific, actionable steps
4. Including relevant resources and references
5. Creating a realistic timeline for improvement`;

    const recommendations = await tryNvidiaCompletion(systemPrompt, userPrompt);
    return NextResponse.json({ recommendations });

  } catch (error: any) {
    console.error("AI Recommendations API Error:", error);
    // Fallback to static recommendations if AI fails
    return NextResponse.json({ 
      recommendations: {
        immediateActions: [
          {
            type: "concept_review",
            title: "Review Array Fundamentals",
            description: "Strengthen your understanding of array operations and indexing",
            estimatedTime: "20-30 minutes",
            priority: "high",
            resources: ["Array basics tutorial", "Practice with simple array problems"]
          }
        ],
        learningPath: [
          {
            week: 1,
            focus: "Array Fundamentals",
            goals: ["Master array indexing", "Understand array traversal"],
            problems: ["Two Sum", "Best Time to Buy Stock"],
            concepts: ["Array operations", "Loop patterns"]
          }
        ],
        strengtheningPlan: {
          weakArea: "Array manipulation",
          approach: "Start with basic operations, then move to advanced patterns",
          practiceProblems: ["Two Sum", "Remove Duplicates", "Rotate Array"],
          studyResources: ["GeeksforGeeks Arrays", "LeetCode Array section"],
          timeline: "2-3 weeks"
        },
        nextSteps: [
          "Complete 3 easy array problems this week",
          "Watch array fundamentals video",
          "Practice array traversal patterns"
        ],
        encouragement: "You're making great progress! Arrays are fundamental - mastering them will unlock many advanced concepts."
      }
    });
  }
}
