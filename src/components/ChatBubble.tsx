import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";
import { Volume2 } from "lucide-react";
import type { ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  message: ChatMessage;
  onSpeak?: () => void;
  isSpeaking?: boolean;
}

export function ChatBubble({ message, onSpeak, isSpeaking }: Props) {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn("flex", isUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-chat-user text-chat-user-foreground rounded-br-md"
            : "bg-chat-ai text-chat-ai-foreground rounded-bl-md shadow-card"
        )}
      >
        {isUser ? (
          <p>{message.content}</p>
        ) : (
          <div className="prose prose-sm max-w-none prose-headings:font-display prose-headings:text-foreground prose-p:text-chat-ai-foreground prose-li:text-chat-ai-foreground prose-strong:text-foreground prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-table:text-sm prose-th:bg-muted prose-th:px-3 prose-th:py-1.5 prose-td:px-3 prose-td:py-1.5 prose-td:border-t prose-td:border-border">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
        {onSpeak && !isUser && message.content.length > 10 && (
          <button
            onClick={onSpeak}
            className={cn(
              "mt-2 flex items-center gap-1 text-xs transition-colors",
              isSpeaking ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Volume2 className="h-3.5 w-3.5" />
            {isSpeaking ? "Stop" : "Listen"}
          </button>
        )}
      </div>
    </motion.div>
  );
}
