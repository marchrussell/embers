import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ChatOptionsProps {
  options: string[];
  onSelect: (option: string) => void;
  multiSelect?: boolean;
  selectedOptions?: string[];
}

export const ChatOptions = ({
  options,
  onSelect,
  multiSelect = false,
  selectedOptions = [],
}: ChatOptionsProps) => {
  return (
    <div className="mb-4 flex w-full flex-col gap-2 duration-500 animate-in fade-in slide-in-from-bottom-2">
      {options.map((option, index) => (
        <Button
          key={index}
          onClick={() => onSelect(option)}
          variant={selectedOptions.includes(option) ? "default" : "outline"}
          className={cn(
            "h-auto w-full justify-start px-4 py-3 text-left transition-all",
            "hover:scale-[1.02] active:scale-[0.98]"
          )}
        >
          {option}
        </Button>
      ))}
    </div>
  );
};
