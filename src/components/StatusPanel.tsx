import type { EmotionState } from "@/lib/types";

interface Props {
  emotion: EmotionState;
  confidence: number;
}

export function StatusPanel({ emotion, confidence }: Props) {
  const getConfidenceColor = (level: number) => {
    if (level >= 8) return "bg-confidence-high";
    if (level >= 5) return "bg-confidence-medium";
    return "bg-confidence-low";
  };

  const getConfidenceLabel = (level: number) => {
    if (level >= 9) return "Mastery";
    if (level >= 7) return "Strong";
    if (level >= 5) return "Building";
    if (level >= 3) return "Learning";
    return "Starting";
  };

  return (
    <div className="flex items-center gap-4 text-xs">
      <div className="flex items-center gap-1.5">
        <span>{emotion.emoji}</span>
        <span className={emotion.color + " font-medium"}>{emotion.label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">Confidence</span>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 10 }, (_, i) => (
            <div
              key={i}
              className={`h-3 w-1.5 rounded-sm transition-all duration-300 ${
                i < confidence
                  ? getConfidenceColor(confidence)
                  : "bg-muted"
              }`}
            />
          ))}
        </div>
        <span className="font-medium text-foreground">{confidence}/10</span>
        <span className="text-muted-foreground hidden sm:inline">
          ({getConfidenceLabel(confidence)})
        </span>
      </div>
    </div>
  );
}
