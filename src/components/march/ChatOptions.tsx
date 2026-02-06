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
  selectedOptions = []
}: ChatOptionsProps) => {
  return (
    <div className="flex flex-col gap-2 w-full mb-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {options.map((option, index) => (
        <Button
          key={index}
          onClick={() => onSelect(option)}
          variant={selectedOptions.includes(option) ? "default" : "outline"}
          className={cn(
            "w-full justify-start text-left h-auto py-3 px-4 transition-all",
            "hover:scale-[1.02] active:scale-[0.98]"
          )}
        >
          {option}
        </Button>
      ))}
    </div>
  );
};
