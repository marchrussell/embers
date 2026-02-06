import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { NavBar } from "@/components/NavBar";
import { Footer } from "@/components/Footer";
import { ChatInput } from "@/components/march/ChatInput";
import { ChatMessage } from "@/components/march/ChatMessage";
import { TypingIndicator } from "@/components/march/TypingIndicator";
import { MarchPrivacyModal } from "@/components/march/MarchPrivacyModal";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function MarchChat() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasConsent, setHasConsent] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    loadChatHistory();
  }, [user, navigate]);

  const loadChatHistory = async () => {
    if (!user) return;

    setIsLoading(true);

    try {
      // Check consent status
      const { data: profile } = await supabase
        .from("profiles")
        .select("has_accepted_march_data_consent")
        .eq("id", user.id)
        .maybeSingle();

      const consent = profile?.has_accepted_march_data_consent || false;
      setHasConsent(consent);
      setShowPrivacyModal(!consent); // Show modal if no consent

      if (consent) {
        // Load conversation history
        const { data: messageHistory, error } = await supabase
          .from("march_messages")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true })
          .limit(50); // Last 50 messages for context

        if (error) throw error;

        if (messageHistory && messageHistory.length > 0) {
          const formattedMessages = messageHistory.map((msg) => ({
            role: msg.is_from_march ? ("assistant" as const) : ("user" as const),
            content: msg.message_text,
          }));
          setMessages(formattedMessages);
        } else {
          // No history, show welcome message
          setMessages([
            {
              role: "assistant",
              content: "Hi there 💛 I'm March. I'm here to help you stay consistent with your wellbeing goals and support you along the way. How are you feeling today?",
            },
          ]);
        }
      } else {
        // No consent, show welcome without loading history
        setMessages([
          {
            role: "assistant",
            content: "Hi there 💛 I'm March. I'm here to help you stay consistent with your wellbeing goals and support you along the way. How are you feeling today?",
          },
        ]);
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
      // Fallback to welcome message
      setMessages([
        {
          role: "assistant",
          content: "Hi there 💛 I'm March. I'm here to help you stay consistent with your wellbeing goals and support you along the way. How are you feeling today?",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptPrivacy = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          has_accepted_march_data_consent: true,
          march_data_consent_date: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;

      setHasConsent(true);
      setShowPrivacyModal(false);
      
      toast({
        title: "Thank you!",
        description: "You can now start chatting with March.",
      });
    } catch (error) {
      console.error("Error accepting privacy:", error);
      toast({
        title: "Error",
        description: "Failed to save your consent. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReadFullPolicy = () => {
    window.open("/privacy-policy", "_blank");
  };

  // Handle quick message from dashboard
  useEffect(() => {
    const state = location.state as { quickMessage?: string };
    if (state?.quickMessage) {
      streamChat(state.quickMessage);
      // Clear the state so it doesn't resend on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const streamChat = async (userMessage: string) => {
    const newMessages = [...messages, { role: "user" as const, content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    // Save user message to database if consent given
    if (hasConsent && user) {
      await supabase.from("march_messages").insert({
        user_id: user.id,
        message_text: userMessage,
        is_from_march: false,
      });
    }

    let assistantMessageContent = "";

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/march-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ messages: newMessages }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to get response");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream");

      const decoder = new TextDecoder();
      let assistantMessage = "";
      let textBuffer = "";

      // Add empty assistant message that we'll update
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            
            if (content) {
              assistantMessage += content;
              assistantMessageContent = assistantMessage;
              // Update the last message (assistant's message)
              setMessages((prev) => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                  role: "assistant",
                  content: assistantMessage,
                };
                return newMessages;
              });
            }
          } catch (e) {
            // Incomplete JSON, put it back and wait for more data
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Save assistant message to database if consent given
      if (hasConsent && user && assistantMessageContent) {
        await supabase.from("march_messages").insert({
          user_id: user.id,
          message_text: assistantMessageContent,
          is_from_march: true,
        });
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
      // Remove the failed messages
      setMessages((prev) => prev.slice(0, -2));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-[hsl(var(--warm-amber))]/5 to-background">
      <NavBar />

      <MarchPrivacyModal
        open={showPrivacyModal}
        onAccept={handleAcceptPrivacy}
        onReadFullPolicy={handleReadFullPolicy}
      />

      <main className="flex-1 container max-w-4xl mx-auto px-4 py-8 flex flex-col">
        {/* Header */}
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/studio/march-dashboard")}
              className="hover:bg-[hsl(var(--warm-amber))]/10"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[hsl(var(--warm-amber))] to-[hsl(var(--warm-peach))] flex items-center justify-center shadow-[0_0_20px_rgba(var(--warm-amber),0.4)]">
                <Sparkles className="h-6 w-6 text-background" />
              </div>
              <div>
                <h1 className="text-3xl font-editorial text-[#E6DBC7]">Chat with March</h1>
                <p className="text-xs text-muted-foreground">Here to help you find your rhythm</p>
              </div>
            </div>
          </div>
          
          {/* Disclaimer */}
          <div className="bg-gradient-to-r from-[hsl(var(--warm-amber))]/10 via-[hsl(var(--warm-peach))]/10 to-[hsl(var(--soft-rose))]/10 border border-[hsl(var(--warm-amber))]/20 rounded-2xl p-4 backdrop-blur-xl">
            <p className="text-xs text-muted-foreground leading-relaxed">
              💛 I'm here to help you with practical guidance and finding the right sessions—but I'm not a therapist. 
              If you need mental health support, please reach out to a professional.
            </p>
          </div>
        </div>

        {/* Messages */}
        <Card className="flex-1 mb-6 p-6 overflow-y-auto max-h-[600px] space-y-6 bg-gradient-to-br from-background/60 to-background/40 backdrop-blur-xl border-[#E6DBC7]/20 shadow-[0_0_30px_rgba(230,219,199,0.05)]">
          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              message={message.content}
              isFromMarch={message.role === "assistant"}
            />
          ))}
          {isLoading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </Card>

        {/* Input */}
        <div className="sticky bottom-0 bg-background/95 backdrop-blur-xl pt-4 pb-2 rounded-t-2xl border-t border-[hsl(var(--warm-amber))]/20 shadow-[0_-10px_30px_rgba(var(--warm-amber),0.1)]">
          <ChatInput
            onSend={streamChat}
            disabled={isLoading || !hasConsent}
            placeholder={hasConsent ? "Share how you're feeling or when you have time to practice..." : "Please accept the privacy terms to start chatting..."}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
