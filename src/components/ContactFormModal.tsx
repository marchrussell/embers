import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DarkInput } from "@/components/ui/dark-input";
import { DarkTextarea } from "@/components/ui/dark-textarea";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  message: z
    .string()
    .min(5, "Message must be at least 5 characters")
    .max(5000, "Message cannot exceed 5000 characters"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

interface ContactFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ContactFormModal = ({ open, onOpenChange }: ContactFormModalProps) => {
  const { toast } = useToast();
  const [subscribeToNewsletter, setSubscribeToNewsletter] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormValues) => {
    try {
      const fullName = `${data.firstName.trim()} ${data.lastName.trim()}`;

      const { data: responseData, error } = await supabase.functions.invoke("send-contact-email", {
        body: {
          name: fullName,
          email: data.email.trim().toLowerCase(),
          message: data.message.trim(),
          type: "contact",
        },
      });

      console.log("Contact email response:", { data: responseData, error });

      if (error) throw error;

      if (subscribeToNewsletter) {
        try {
          const { error: dbError } = await supabase.from("newsletter_subscribers").insert([
            {
              email: data.email.trim().toLowerCase(),
              name: fullName,
            },
          ]);

          if (dbError && dbError.code !== "23505") {
            throw dbError;
          }

          await supabase.functions.invoke("send-contact-email", {
            body: {
              name: fullName,
              email: data.email.trim().toLowerCase(),
              message: "",
              type: "newsletter",
            },
          });
        } catch (newsletterError) {
          console.error("Error subscribing to newsletter:", newsletterError);
        }
      }

      toast({
        title: subscribeToNewsletter ? "Message sent and subscribed!" : "Message sent!",
        description: subscribeToNewsletter
          ? "Thank you for your message. You've also been subscribed to our newsletter."
          : "Thank you for your message. We'll get back to you soon.",
      });
      reset();
      setSubscribeToNewsletter(false);
      onOpenChange(false);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error sending message",
        description: "Please try again later or contact us directly.",
        variant: "destructive",
      });
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <DarkInput
                  id="modal-first-name"
                  placeholder="First name"
                  className="text-lg"
                  {...register("firstName")}
                />
                {errors.firstName && (
                  <p className="mt-1.5 text-sm text-red-400">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <DarkInput
                  id="modal-last-name"
                  placeholder="Last name"
                  className="text-lg"
                  {...register("lastName")}
                />
                {errors.lastName && (
                  <p className="mt-1.5 text-sm text-red-400">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <DarkInput
                id="modal-email"
                type="email"
                placeholder="your@email.com"
                className="text-lg"
                {...register("email")}
              />
              {errors.email && (
                <p className="mt-1.5 text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div>
              <DarkTextarea
                id="message"
                placeholder="Tell me about what you're looking for..."
                rows={6}
                className="text-lg"
                {...register("message")}
              />
              {errors.message && (
                <p className="mt-1.5 text-sm text-red-400">{errors.message.message}</p>
              )}
            </div>

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
