import { X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DarkInput } from "@/components/ui/dark-input";
import { DarkTextarea } from "@/components/ui/dark-textarea";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ContactFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ContactFormModal = ({ open, onOpenChange }: ContactFormModalProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
  });
  const [subscribeToNewsletter, setSubscribeToNewsletter] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.message) {
      toast({
        title: "All fields required",
        description: "Please fill in all fields to send a message.",
        variant: "destructive",
      });
      return;
    }

    if (formData.message.trim().length < 5) {
      toast({
        title: "Message too short",
        description: "Please write at least 5 characters in your message.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const fullName = `${formData.firstName.trim()} ${formData.lastName.trim()}`;

      // Send the message
      const { data, error } = await supabase.functions.invoke("send-contact-email", {
        body: {
          name: fullName,
          email: formData.email.trim().toLowerCase(),
          message: formData.message.trim(),
          type: "contact",
        },
      });

      console.log("Contact email response:", { data, error });

      if (error) throw error;

      // If newsletter checkbox is checked, also subscribe them
      if (subscribeToNewsletter) {
        try {
          const { error: dbError } = await supabase.from("newsletter_subscribers").insert([
            {
              email: formData.email.trim().toLowerCase(),
              name: fullName,
            },
          ]);

          if (dbError && dbError.code !== "23505") {
            // Ignore duplicate error
            throw dbError;
          }

          // Send confirmation email
          await supabase.functions.invoke("send-contact-email", {
            body: {
              name: fullName,
              email: formData.email.trim().toLowerCase(),
              message: "",
              type: "newsletter",
            },
          });
        } catch (newsletterError) {
          console.error("Error subscribing to newsletter:", newsletterError);
          // Don't fail the message send if newsletter fails
        }
      }

      toast({
        title: subscribeToNewsletter ? "Message sent and subscribed!" : "Message sent!",
        description: subscribeToNewsletter
          ? "Thank you for your message. You've also been subscribed to our newsletter."
          : "Thank you for your message. We'll get back to you soon.",
      });
      setFormData({ firstName: "", lastName: "", email: "", message: "" });
      setSubscribeToNewsletter(false);
      onOpenChange(false);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error sending message",
        description: "Please try again later or contact us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideClose
        className="max-h-[92vh] w-[94%] max-w-4xl overflow-y-auto rounded-[28px] border border-white/20 bg-black/75 p-0 backdrop-blur-xl sm:max-h-[88vh] sm:w-[90%]"
      >
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-6 top-6 z-50 opacity-70 transition-opacity hover:opacity-100 sm:right-8 sm:top-8 md:right-10 md:top-10"
        >
          <X className="h-6 w-6 text-white" />
        </button>

        <div className="space-y-6 px-6 pb-10 pt-14 sm:space-y-8 sm:px-10 sm:pb-10 sm:pt-16 md:px-12 md:pb-12 md:pt-20">
          <div className="mb-6 space-y-3 text-center sm:mb-8 md:mb-10">
            <h2 className="font-['PP_Editorial_Old'] text-3xl text-white sm:text-4xl md:text-5xl">
              Send a Message
            </h2>
            <p className="text-base font-light text-white/70 sm:text-lg md:text-xl">
              Get in touch and I'll get back to you as soon as possible
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <DarkInput
                id="modal-first-name"
                placeholder="First name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
                className="text-lg"
              />

              <DarkInput
                id="modal-last-name"
                placeholder="Last name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
                className="text-lg"
              />
            </div>

            <DarkInput
              id="modal-email"
              type="email"
              placeholder="your@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="text-lg"
            />

            <DarkTextarea
              id="message"
              placeholder="Tell me about what you're looking for..."
              rows={6}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
              className="text-lg"
            />

            <div className="flex items-center justify-center space-x-3 py-2 sm:py-3">
              <Checkbox
                id="newsletter-opt-in"
                checked={subscribeToNewsletter}
                onCheckedChange={(checked) => setSubscribeToNewsletter(checked as boolean)}
                className="h-5 w-5 border-white/40 data-[state=checked]:bg-white data-[state=checked]:text-black sm:h-6 sm:w-6"
              />
              <label
                htmlFor="newsletter-opt-in"
                className="cursor-pointer text-base font-light leading-none text-white/80 sm:text-lg md:text-xl"
              >
                Also subscribe me to the newsletter
              </label>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="w-full rounded-full border-2 border-white bg-transparent py-5 text-base text-white transition-all hover:bg-white/10 disabled:opacity-50 sm:py-6 sm:text-lg md:py-7 md:text-xl"
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
