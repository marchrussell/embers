import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { detectCrisisLanguage } from "@/lib/marchSafety";
import { SafetyAlert } from "./SafetyAlert";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput = ({ onSend, disabled, placeholder = "Type your message..." }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [showSafetyAlert, setShowSafetyAlert] = useState(false);
  const [isHighRisk, setIsHighRisk] = useState(false);

  const handleSend = () => {
    if (!message.trim() || disabled) return;

    // Check for crisis language
    const safetyCheck = detectCrisisLanguage(message);
    
    if (safetyCheck.isCrisis) {
      setIsHighRisk(safetyCheck.isHighRisk);
      setShowSafetyAlert(true);
      // Still send the message, but also show support resources
      onSend(message);
      setMessage("");
    } else {
      setShowSafetyAlert(false);
      onSend(message);
      setMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="space-y-4">
      {showSafetyAlert && <SafetyAlert isHighRisk={isHighRisk} />}
      
      <div className="flex gap-2">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled}
          className="min-h-[60px] max-h-[120px] resize-none"
        />
        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          size="icon"
          className="h-[60px] w-[60px] flex-shrink-0"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
