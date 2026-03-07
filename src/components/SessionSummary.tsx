interface Props {
  topics: string[];
  messageCount: number;
}

export function SessionSummary({ topics, messageCount }: Props) {
  if (messageCount === 0) return null;

  return (
    <div className="rounded-xl bg-card p-4 shadow-card">
      <h3 className="font-display text-sm font-semibold text-foreground mb-3">Session Summary</h3>
      <div className="space-y-2 text-xs text-muted-foreground">
        <div className="flex justify-between">
          <span>Questions asked</span>
          <span className="font-medium text-foreground">{Math.ceil(messageCount / 2)}</span>
        </div>
        {topics.length > 0 && (
          <div>
            <span className="block mb-1.5">Topics covered</span>
            <div className="flex flex-wrap gap-1">
              {topics.map((t, i) => (
                <span key={i} className="rounded-md bg-secondary px-2 py-0.5 text-secondary-foreground">
                  {t}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
