import { useState, useCallback, useRef } from "react";
import type { ChatMessage, LearningMode, EmotionState } from "@/lib/types";
import { streamChat } from "@/lib/chat-api";

function detectEmotion(text: string): EmotionState {
  const lower = text.toLowerCase();
  if (lower.includes("confused") || lower.includes("don't understand") || lower.includes("help")) {
    return { label: "Needs Help", emoji: "🤗", color: "text-emotion-curious" };
  }
  if (lower.includes("?") || lower.includes("how") || lower.includes("what") || lower.includes("why")) {
    return { label: "Curious", emoji: "🤔", color: "text-emotion-curious" };
  }
  if (lower.includes("thank") || lower.includes("great") || lower.includes("awesome") || lower.includes("got it")) {
    return { label: "Positive", emoji: "😊", color: "text-emotion-positive" };
  }
  if (lower.includes("frustrated") || lower.includes("difficult") || lower.includes("hard")) {
    return { label: "Struggling", emoji: "💪", color: "text-emotion-curious" };
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
