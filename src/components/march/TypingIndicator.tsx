export const TypingIndicator = () => {
  return (
    <div className="mb-4 flex w-full justify-start duration-300 animate-in fade-in">
      <div className="max-w-[80%] rounded-2xl border border-border bg-card px-5 py-3.5 text-card-foreground shadow-sm">
        <div className="flex space-x-1.5">
          <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
          <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
          <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
        </div>
      </div>
    </div>
  );
};
