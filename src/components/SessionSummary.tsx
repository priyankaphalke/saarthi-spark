import type { EmotionJourneyPoint } from "@/lib/types";
import { motion } from "framer-motion";

interface Props {
  topics: string[];
  messageCount: number;
  emotionJourney: EmotionJourneyPoint[];
}

export function SessionSummary({ topics, messageCount, emotionJourney }: Props) {
  if (messageCount === 0) return null;

  return (
    <div className="rounded-xl bg-card p-4 shadow-card space-y-4">
      <h3 className="font-display text-sm font-semibold text-foreground">Session Summary</h3>

      <div className="space-y-2 text-xs text-muted-foreground">
        <div className="flex justify-between">
          <span>Questions asked</span>
          <span className="font-medium text-foreground">{Math.ceil(messageCount / 2)}</span>
        </div>
      </div>

      {/* Emotion Journey */}
      {emotionJourney.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-medium text-muted-foreground">Emotion Journey</span>
          <div className="flex items-center gap-0.5">
            {emotionJourney.map((point, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.08 }}
                className="flex flex-col items-center group relative"
              >
                <div
                  className="text-base cursor-default transition-transform hover:scale-125"
                  title={`${point.emotion.label}`}
                >
                  {point.emotion.emoji}
                </div>
                {i < emotionJourney.length - 1 && (
                  <div className="absolute top-1/2 left-full w-1 h-px bg-border -translate-y-1/2" />
                )}
              </motion.div>
            ))}
          </div>
          {/* Start → End summary */}
          {emotionJourney.length >= 2 && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className={emotionJourney[0].emotion.color + " font-medium"}>
                {emotionJourney[0].emotion.emoji} {emotionJourney[0].emotion.label}
              </span>
              <span className="text-muted-foreground">→</span>
              <span className={emotionJourney[emotionJourney.length - 1].emotion.color + " font-medium"}>
                {emotionJourney[emotionJourney.length - 1].emotion.emoji} {emotionJourney[emotionJourney.length - 1].emotion.label}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Topics */}
      {topics.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-xs font-medium text-muted-foreground">Topics covered</span>
          <div className="flex flex-wrap gap-1">
            {topics.map((t, i) => (
              <span key={i} className="rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                {t}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
