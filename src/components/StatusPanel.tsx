import type { EmotionState } from "@/lib/types";

interface Props {
  emotion: EmotionState;
  confidence: number;
}

export function StatusPanel({ emotion, confidence }: Props) {
  const confColor =
    confidence >= 80 ? "bg-confidence-high" : confidence >= 50 ? "bg-confidence-medium" : "bg-confidence-low";

  return (
    <div className="flex items-center gap-4 text-xs">
      <div className="flex items-center gap-1.5">
        <span>{emotion.emoji}</span>
        <span className={emotion.color + " font-medium"}>{emotion.label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">Confidence</span>
        <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${confColor}`}
            style={{ width: `${confidence}%` }}
          />
        </div>
        <span className="font-medium text-foreground">{confidence}%</span>
      </div>
    </div>
  );
}
