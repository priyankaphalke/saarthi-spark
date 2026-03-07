export type LearningMode = "simple" | "exam" | "interview";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface EmotionState {
  label: string;
  emoji: string;
  color: string;
}

export const LEARNING_MODES: Record<LearningMode, { label: string; description: string; icon: string }> = {
  simple: {
    label: "Simple Mode",
    description: "Beginner-friendly explanations with analogies",
    icon: "💡",
  },
  exam: {
    label: "Exam Ready",
    description: "Structured academic answers for exams",
    icon: "📝",
  },
  interview: {
    label: "Interview Ready",
    description: "Deep conceptual explanations for interviews",
    icon: "🎯",
  },
};
