import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DarkInput } from "@/components/ui/dark-input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ModalCloseButton } from "@/components/ui/modal-close-button";
import { supabase } from "@/integrations/supabase/client";

interface NewsletterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NewsletterModal = ({ open, onOpenChange }: NewsletterModalProps) => {
  const [newsletterData, setNewsletterData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  const handleNewsletterSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newsletterData.email || !newsletterData.firstName || !newsletterData.lastName) {
      toast.error("Please fill in all fields to subscribe.");
      return;
    }

    try {
      const fullName = `${newsletterData.firstName.trim()} ${newsletterData.lastName.trim()}`;

      // First, insert into newsletter_subscribers
      const { error: insertError } = await supabase.from("newsletter_subscribers").insert([
        {
          email: newsletterData.email.trim().toLowerCase(),
          name: fullName,
        },
      ]);

      if (insertError) {
        if (insertError.code === "23505") {
          // Unique violation
          toast.error("This email is already subscribed to our newsletter.");
          return;
        }
        throw insertError;
      }

      // Send welcome email
      const { error: emailError } = await supabase.functions.invoke("send-contact-email", {
        body: {
          name: fullName,
          email: newsletterData.email.trim().toLowerCase(),
          message: "",
          type: "newsletter",
        },
      });

      if (emailError) throw emailError;

      toast.success("Thank you for subscribing to our newsletter.");

      setNewsletterData({ firstName: "", lastName: "", email: "" });
      onOpenChange(false);
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      toast.error("There was an error subscribing you to the newsletter. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideClose
        className="max-h-[90vh] w-[90%] max-w-md overflow-y-auto rounded-3xl border border-white/20 bg-black/65 p-0 backdrop-blur-xl"
      >
        <ModalCloseButton onClose={() => onOpenChange(false)} size="sm" />

        <div className="space-y-8 p-8 pt-14 md:p-10 md:pt-16">
          <div className="space-y-3 text-center">
            <h2 className="font-editorial text-3xl font-light text-white md:text-4xl">
              Newsletter
            </h2>
            <p className="mx-auto max-w-xs text-base font-light leading-relaxed text-white/70 md:text-lg">
              Subscribe to receive news, updates and exclusive content
            </p>
          </div>

          <form onSubmit={handleNewsletterSubscribe} className="space-y-5">
            <DarkInput
              id="newsletter-first-name"
              placeholder="First name"
              value={newsletterData.firstName}
              onChange={(e) => setNewsletterData({ ...newsletterData, firstName: e.target.value })}
              required
            />

            <DarkInput
              id="newsletter-last-name"
              placeholder="Last name"
              value={newsletterData.lastName}
              onChange={(e) => setNewsletterData({ ...newsletterData, lastName: e.target.value })}
              required
            />

            <DarkInput
              id="newsletter-email"
              type="email"
              placeholder="your@email.com"
              value={newsletterData.email}
              onChange={(e) => setNewsletterData({ ...newsletterData, email: e.target.value })}
              required
            />

            <Button
              type="submit"
              size="lg"
              className="mt-2 w-full rounded-full bg-white py-6 text-base font-normal text-black hover:bg-white/90"
            >
              Subscribe
            </Button>
            <p className="pt-2 text-center text-sm font-light leading-relaxed text-white/50">
              By subscribing, you accept marketing communications from March. We respect your
              privacy.
            </p>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
