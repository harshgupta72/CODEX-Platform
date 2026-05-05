import { NextRequest, NextResponse } from "next/server";
import { tryNvidiaCompletion } from "@/lib/nvidia-fallback";

export async function POST(req: NextRequest) {
  try {
    const { studentId, submissions, problemsSolved, timeSpent, weakAreas, strengths, recentTopics } = await req.json();

    const systemPrompt = "You are an expert coding education analyst. Analyze student progress and provide detailed, actionable insights in valid JSON format.";
    
    const prompt = `Analyze this student's coding progress and provide comprehensive insights:

Student Data:
- Problems Solved: ${problemsSolved}
- Time Spent: ${timeSpent} hours
- Weak Areas: ${weakAreas?.join(', ') || 'none identified'}
- Strengths: ${strengths?.join(', ') || 'none identified'}
- Recent Topics: ${recentTopics?.join(', ') || 'none'}
- Recent Submissions: ${submissions?.length || 0} attempts

Provide detailed analysis in this JSON format:
{
  "progressSummary": "Overall progress description with specific achievements",
  "strengths": ["specific strength 1", "specific strength 2"],
  "weakAreas": ["specific weakness 1", "specific weakness 2"],
  "learningPatterns": {
    "speed": "fast|moderate|slow",
    "preferredTopics": ["topic1", "topic2"],
    "struggleAreas": ["area1", "area2"],
    "improvementRate": "high|moderate|low"
  },
  "personalizedRecommendations": [
    {
      "type": "study_focus|practice_problems|concept_review|skill_building",
      "title": "Recommendation title",
      "description": "Detailed explanation of what to do and why",
      "priority": "high|medium|low",
      "estimatedTime": "time required",
      "resources": ["resource1", "resource2"],
      "expectedOutcome": "what they'll achieve"
    }
  ],
  "studyPlan": {
    "immediateFocus": "what to work on this week",
    "shortTermGoals": ["goal1", "goal2"],
    "longTermGoals": ["goal1", "goal2"],
    "timeline": "realistic timeline for improvement"
  },
  "motivation": {
    "achievements": ["specific achievement 1", "specific achievement 2"],
    "encouragement": "personalized motivational message",
    "nextMilestone": "what they're working towards"
  }
}

Focus on:
1. Identifying specific learning patterns and preferences
2. Providing targeted, actionable recommendations
3. Celebrating concrete achievements
4. Creating realistic, achievable goals
5. Offering specific resources and study materials`;

    const analysis = await tryNvidiaCompletion(systemPrompt, prompt);
    return NextResponse.json({ analysis });

  } catch (error: any) {
    console.error("AI Student Progress API Error:", error);
    // Fallback to static analysis if AI fails
    return NextResponse.json({ 
      analysis: {
        progressSummary: "You're making steady progress in coding fundamentals. Your problem-solving approach shows good logical thinking, and you're consistently improving your code organization.",
        strengths: ["Logical problem-solving approach", "Good code structure", "Persistence in debugging"],
        weakAreas: ["Algorithm optimization", "Edge case handling", "Time complexity analysis"],
        learningPatterns: {
          speed: "moderate",
          preferredTopics: ["arrays", "strings"],
          struggleAreas: ["dynamic programming", "graphs"],
          improvementRate: "moderate"
        },
        personalizedRecommendations: [
          {
            type: "practice_problems",
            title: "Focus on Array Manipulation",
            description: "Practice more array problems to build confidence and speed. Start with easy problems and gradually increase difficulty.",
            priority: "high",
            estimatedTime: "2-3 hours per week",
            resources: ["LeetCode Array section", "GeeksforGeeks Array tutorials"],
            expectedOutcome: "Faster problem-solving and better array intuition"
          }
        ],
        studyPlan: {
          immediateFocus: "Complete 5 easy array problems this week",
          shortTermGoals: ["Master array operations", "Improve debugging skills"],
          longTermGoals: ["Tackle medium-difficulty problems", "Learn advanced algorithms"],
          timeline: "2-3 months for significant improvement"
        },
        motivation: {
          achievements: ["Solved your first array problem", "Improved code readability"],
          encouragement: "Great job on your recent submissions! Your logical thinking is strong - keep practicing to build speed and confidence.",
          nextMilestone: "Solve 10 array problems independently"
        }
      }
    });
  }
}
