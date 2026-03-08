import { useState, useCallback, useRef } from "react";
import type { ChatMessage, LearningMode, EmotionState, EmotionJourneyPoint } from "@/lib/types";
import { streamChat } from "@/lib/chat-api";

function detectEmotion(text: string): EmotionState {
  const lower = text.toLowerCase();

  // Fear & Anxiety patterns
  if (/scared|afraid|fear|nervous|anxiety|anxious|panic|terrified|dreading|exam\s*stress|placement\s*fear/.test(lower)) {
    return { label: "Anxious", emoji: "🫂", color: "text-emotion-curious" };
  }
  // Deep confusion / lost
  if (/lost|no\s*idea|clueless|nothing\s*makes\s*sense|completely\s*confused|can'?t\s*understand\s*anything|give\s*up|hopeless/.test(lower)) {
    return { label: "Lost", emoji: "😵‍💫", color: "text-emotion-curious" };
  }
  // Low confidence / self-doubt
  if (/i'?m\s*(so\s*)?stupid|i\s*can'?t\s*do|not\s*smart\s*enough|never\s*get|too\s*dumb|i'?ll\s*fail|will\s*i\s*fail|doubt\s*myself|no\s*confidence/.test(lower)) {
    return { label: "Low Confidence", emoji: "💙", color: "text-emotion-curious" };
  }
  // Frustration / struggling
  if (/frustrated|difficult|hard|struggling|stuck|annoying|irritating|ugh|hate\s*this|sick\s*of|tired\s*of/.test(lower)) {
    return { label: "Struggling", emoji: "💪", color: "text-emotion-curious" };
  }
  // Confusion / needs help
  if (/confused|don'?t\s*understand|help|explain\s*again|what\s*do\s*you\s*mean|unclear|doesn'?t\s*make\s*sense|samajh\s*nahi|kuch\s*nahi\s*samjha/.test(lower)) {
    return { label: "Needs Help", emoji: "🤗", color: "text-emotion-curious" };
  }
  // Overwhelmed / pressure
  if (/overwhelm|too\s*much|pressure|stress|burnout|overload|jee|neet|board\s*exam|backlog/.test(lower)) {
    return { label: "Pressured", emoji: "🧘", color: "text-emotion-curious" };
  }
  // Bored / disengaged
  if (/boring|bored|uninteresting|don'?t\s*care|pointless|why\s*do\s*i\s*need|waste\s*of\s*time/.test(lower)) {
    return { label: "Disengaged", emoji: "😴", color: "text-emotion-neutral" };
  }
  // Curiosity
  if (/\?|how|what|why|wonder|curious|tell\s*me|explain|kaise|kya|kyu/.test(lower)) {
    return { label: "Curious", emoji: "🤔", color: "text-emotion-curious" };
  }
  // Excitement / positive
  if (/thank|great|awesome|got\s*it|amazing|love|perfect|wow|understood|samajh\s*aa\s*gaya|badiya|mast/.test(lower)) {
    return { label: "Positive", emoji: "😊", color: "text-emotion-positive" };
  }
  // Eureka / breakthrough
  if (/oh!|aha|now\s*i\s*get|finally|makes\s*sense\s*now|clicked|ohh|accha/.test(lower)) {
    return { label: "Eureka!", emoji: "🎉", color: "text-emotion-positive" };
  }
  return { label: "Focused", emoji: "🧠", color: "text-emotion-neutral" };
}

function estimateConfidence(content: string): number {
  const length = content.length;
  if (length > 1000) return 10;
  if (length > 800) return 9;
  if (length > 600) return 8;
  if (length > 400) return 7;
  if (length > 300) return 6;
  if (length > 200) return 5;
  if (length > 100) return 4;
  if (length > 50) return 3;
  return 2;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<LearningMode>("simple");
  const [emotion, setEmotion] = useState<EmotionState>({ label: "Ready", emoji: "🎯", color: "text-emotion-neutral" });
  const [confidence, setConfidence] = useState(0);
  const [topicsDiscussed, setTopicsDiscussed] = useState<string[]>([]);
  const [emotionJourney, setEmotionJourney] = useState<EmotionJourneyPoint[]>([]);
  const assistantBuffer = useRef("");

  const clearMessages = useCallback(() => {
    setMessages([]);
    setConfidence(0);
    setTopicsDiscussed([]);
    setEmotion({ label: "Ready", emoji: "🎯", color: "text-emotion-neutral" });
  }, []);

  const sendMessage = useCallback(async (input: string, imageUrl?: string) => {
    if ((!input.trim() && !imageUrl) || isLoading) return;

    setEmotion(detectEmotion(input));

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim() || "Please analyze this image and explain what you see.",
      timestamp: new Date(),
      imageUrl,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    assistantBuffer.current = "";

    const allMessages = [...messages, userMsg];

    const topic = imageUrl ? "📷 Image analysis" : input.trim().split(" ").slice(0, 4).join(" ");
    setTopicsDiscussed((prev) => {
      if (prev.includes(topic)) return prev;
      return [...prev.slice(-9), topic];
    });

    await streamChat({
      messages: allMessages,
      mode,
      onDelta: (chunk) => {
        assistantBuffer.current += chunk;
        const content = assistantBuffer.current;
        setConfidence(estimateConfidence(content));
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content } : m));
          }
          return [...prev, { id: crypto.randomUUID(), role: "assistant", content, timestamp: new Date() }];
        });
      },
      onDone: () => setIsLoading(false),
      onError: (error) => {
        setIsLoading(false);
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: "assistant", content: `⚠️ ${error}`, timestamp: new Date() },
        ]);
      },
    });
  }, [messages, mode, isLoading]);

  return { messages, isLoading, mode, setMode, emotion, confidence, topicsDiscussed, sendMessage, clearMessages };
}
