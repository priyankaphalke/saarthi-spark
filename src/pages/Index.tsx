import { useState, useRef, useEffect } from "react";
import { Send, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { useChat } from "@/hooks/use-chat";
import { useVoiceInput, speakText, stopSpeaking } from "@/hooks/use-voice";
import { ChatBubble } from "@/components/ChatBubble";
import { LearningModeSelector } from "@/components/LearningModeSelector";
import { StatusPanel } from "@/components/StatusPanel";
import { SessionSummary } from "@/components/SessionSummary";
import { motion } from "framer-motion";

const SUGGESTIONS = [
  "What is nanotechnology?",
  "Explain recursion in programming",
  "Compare TCP vs UDP",
  "What is the Pythagorean theorem?",
];

const Index = () => {
  const { messages, isLoading, mode, setMode, emotion, confidence, topicsDiscussed, sendMessage } = useChat();
  const { isListening, transcript, startListening, stopListening } = useVoiceInput();
  const [input, setInput] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // When voice transcript updates, put it in the input
  useEffect(() => {
    if (transcript) setInput(transcript);
  }, [transcript]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput("");
  };

  const handleVoice = () => {
    if (isListening) {
      stopListening();
    } else {
      const ok = startListening();
      if (!ok) {
        alert("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      }
    }
  };

  const handleSpeak = (text: string) => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      speakText(text, () => setIsSpeaking(false));
      setIsSpeaking(true);
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-72 flex-col border-r border-border bg-card p-5 gap-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-display font-bold text-lg">
            S
          </div>
          <div>
            <h1 className="font-display text-lg font-bold text-foreground leading-tight">Saarthi AI</h1>
            <p className="text-xs text-muted-foreground">Your AI Learning Companion</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Learning Mode</span>
          <LearningModeSelector mode={mode} onChange={setMode} />
        </div>

        <StatusPanel emotion={emotion} confidence={confidence} />

        <div className="flex-1" />

        <SessionSummary topics={topicsDiscussed} messageCount={messages.length} />
      </aside>

      {/* Main Chat */}
      <main className="flex flex-1 flex-col">
        {/* Mobile header */}
        <header className="flex lg:hidden items-center justify-between border-b border-border bg-card px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-display font-bold">
              S
            </div>
            <span className="font-display font-bold text-foreground">Saarthi AI</span>
          </div>
          <LearningModeSelector mode={mode} onChange={setMode} />
        </header>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6">
          <div className="mx-auto max-w-2xl space-y-4">
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center pt-20 text-center"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-3xl mb-4">
                  🎓
                </div>
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                  Welcome to Saarthi AI
                </h2>
                <p className="text-muted-foreground mb-8 max-w-md">
                  Ask me anything about Computer Science, Mathematics, Physics, Chemistry, Nanotechnology, Engineering, or any subject. I'll explain it step by step!
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="rounded-xl bg-card px-4 py-2.5 text-sm text-foreground shadow-card hover:shadow-elevated transition-shadow border border-border"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {messages.map((msg) => (
              <ChatBubble
                key={msg.id}
                message={msg}
                onSpeak={msg.role === "assistant" ? () => handleSpeak(msg.content) : undefined}
                isSpeaking={isSpeaking}
              />
            ))}

            {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md bg-chat-ai px-4 py-3 shadow-card">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile status bar */}
        <div className="flex lg:hidden items-center justify-center border-t border-border bg-card px-4 py-1.5">
          <StatusPanel emotion={emotion} confidence={confidence} />
        </div>

        {/* Input */}
        <div className="border-t border-border bg-card px-4 py-3">
          <div className="mx-auto max-w-2xl flex gap-2">
            <button
              onClick={handleVoice}
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors ${
                isListening
                  ? "bg-destructive text-destructive-foreground animate-pulse"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
              title={isListening ? "Stop listening" : "Voice input"}
            >
              {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder={isListening ? "Listening..." : "Ask any question..."}
              disabled={isLoading}
              className="flex-1 rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
