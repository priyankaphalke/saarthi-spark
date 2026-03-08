export type LearningMode = "simple" | "exam" | "interview" | "assignment";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  imageUrl?: string;
}

export interface EmotionState {
  label: string;
  emoji: string;
  color: string;
}

export interface EmotionJourneyPoint {
  emotion: EmotionState;
  messageIndex: number;
  timestamp: Date;
}

export const LEARNING_MODES: Record<LearningMode, { label: string; description: string; icon: string }> = {
  simple: {
    label: "Simple",
    description: "Beginner-friendly explanations with analogies",
    icon: "💡",
  },
  exam: {
    label: "Exam",
    description: "Structured academic answers for exams",
    icon: "📝",
  },
  interview: {
    label: "Interview",
    description: "Deep conceptual explanations for interviews",
    icon: "🎯",
  },
  assignment: {
    label: "Assignment",
    description: "Professor-friendly academic assignment answers",
    icon: "📄",
  },
};
