export const TypingIndicator = () => {
  return (
    <div className="flex w-full mb-4 justify-start animate-in fade-in duration-300">
      <div className="max-w-[80%] rounded-2xl px-5 py-3.5 bg-card text-card-foreground border border-border shadow-sm">
        <div className="flex space-x-1.5">
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]" />
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]" />
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
        </div>
      </div>
    </div>
  );
};
