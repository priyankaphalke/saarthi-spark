import { LearningMode, LEARNING_MODES } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  mode: LearningMode;
  onChange: (mode: LearningMode) => void;
}

export function LearningModeSelector({ mode, onChange }: Props) {
  return (
    <div className="flex gap-2">
      {(Object.entries(LEARNING_MODES) as [LearningMode, typeof LEARNING_MODES.simple][]).map(
        ([key, val]) => (
          <button
            key={key}
            onClick={() => onChange(key)}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all",
              mode === key
                ? "bg-primary text-primary-foreground shadow-card"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            <span>{val.icon}</span>
            <span className="hidden sm:inline">{val.label}</span>
          </button>
        )
      )}
    </div>
  );
}
