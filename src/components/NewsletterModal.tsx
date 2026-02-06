import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DarkInput } from "@/components/ui/dark-input";
import { ModalCloseButton } from "@/components/ui/modal-close-button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface NewsletterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NewsletterModal = ({ open, onOpenChange }: NewsletterModalProps) => {
  const [newsletterData, setNewsletterData] = useState({
    firstName: "",
    lastName: "",
    email: ""
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
      const { error: insertError } = await supabase
        .from('newsletter_subscribers')
        .insert([
          {
            email: newsletterData.email.trim().toLowerCase(),
            name: fullName
          }
        ]);

      if (insertError) {
        if (insertError.code === '23505') { // Unique violation
          toast.error("This email is already subscribed to our newsletter.");
          return;
        }
        throw insertError;
      }

      // Send welcome email
      const { error: emailError } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: fullName,
          email: newsletterData.email.trim().toLowerCase(),
          message: '',
          type: 'newsletter',
        },
      });

      if (emailError) throw emailError;

      toast.success("Thank you for subscribing to our newsletter.");

      setNewsletterData({ firstName: "", lastName: "", email: "" });
      onOpenChange(false);
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      toast.error("There was an error subscribing you to the newsletter. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent hideClose className="w-[90%] max-w-md max-h-[90vh] overflow-y-auto backdrop-blur-xl bg-black/65 border border-white/20 p-0 rounded-3xl">
        <ModalCloseButton onClose={() => onOpenChange(false)} size="sm" />
        
        <div className="p-8 pt-14 md:p-10 md:pt-16 space-y-8">
          <div className="text-center space-y-3">
            <h2 className="font-editorial text-3xl md:text-4xl text-white font-light">Newsletter</h2>
            <p className="text-base md:text-lg text-white/70 font-light max-w-xs mx-auto leading-relaxed">
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
            
            <Button type="submit" size="lg" className="w-full bg-white text-black hover:bg-white/90 rounded-full text-base py-6 mt-2 font-normal">
              Subscribe
            </Button>
            <p className="text-sm text-white/50 text-center font-light leading-relaxed pt-2">
              By subscribing, you accept marketing communications from March. We respect your privacy.
            </p>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};