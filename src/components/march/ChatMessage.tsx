import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: string;
  isFromMarch: boolean;
  timestamp?: Date;
}

export const ChatMessage = ({ message, isFromMarch, timestamp }: ChatMessageProps) => {
  return (
    <div
      className={cn(
        "mb-4 flex w-full duration-500 animate-in fade-in slide-in-from-bottom-2",
        isFromMarch ? "justify-start" : "justify-end"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-5 py-4 shadow-lg",
          isFromMarch ? "bg-[#E6DBC7] text-black" : "bg-[#40332a] text-[#F5F5DC]"
        )}
      >
        <p className="whitespace-pre-line text-base leading-relaxed">{message}</p>
        {timestamp && (
          <p className="mt-2 text-xs opacity-60">
            {timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        )}
      </div>
    </div>
  );
};
