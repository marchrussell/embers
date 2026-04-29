import { useMutation } from "@tanstack/react-query";
import { Minus, Plus } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";

import { EventDateSelector } from "@/components/ExperienceDateSelector";
import { ButtonLoadingSpinner, SkeletonBox } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DarkInput } from "@/components/ui/dark-input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ModalCloseButton } from "@/components/ui/modal-close-button";
import { supabase } from "@/integrations/supabase/client";
import { ScheduledExperienceDate } from "@/lib/experienceDateUtils";
import { analytics } from "@/lib/posthog";

interface ExperienceData {
  id: string;
  title: string;
  subtitle: string;
  time: string;
  price: number; // Price in pence
}

interface Props {
  event: ExperienceData | null;
  open: boolean;
  onClose: () => void;
}

const SAFETY_DISCLOSURE = `
Safety Disclosure for Breathwork Session

By participating in this breathwork session, I acknowledge the following:

1. Physical Considerations: 
   Breathwork can induce powerful physical and emotional responses. I understand that I should not participate if I:
   - Am pregnant
   - Have a history of cardiovascular disease, including angina or heart attack
   - Have high blood pressure
   - Have a history of stroke, transient ischemic attacks, or seizures
   - Have been diagnosed with epilepsy
   - Have severe mental illness
   - Am taking heavy medication

2. Personal Responsibility:
   I take full responsibility for my well-being during and after the session.

3. Right to Stop: 
   I understand I can stop at any time if I feel uncomfortable.

4. Medical Disclaimer: 
   This session is not a substitute for medical or psychological care.
`;

export function ExperienceBookingModal({ event, open, onClose }: Props) {
  const [step, setStep] = useState(1);
  const [quantity, setQuantity] = useState(1);
  const [attendeeName, setAttendeeName] = useState("");
  const [attendeeEmail, setAttendeeEmail] = useState("");
  const [hasAccepted, setHasAccepted] = useState(false);
  const [selectedDate, setSelectedDate] = useState<ScheduledExperienceDate | null>(null);

  const maxTickets = selectedDate
    ? Math.min(selectedDate.maxCapacity, selectedDate.spotsRemaining ?? selectedDate.maxCapacity)
    : 1;

  useEffect(() => {
    if (open) {
      setStep(1);
      setQuantity(1);
      setAttendeeName("");
      setAttendeeEmail("");
      setHasAccepted(false);
      setSelectedDate(null);
    }
  }, [open]);

  const { mutate: proceedToPayment, isPending } = useMutation({
    mutationFn: async () => {
      if (!event || !selectedDate) throw new Error("Missing event or date");

      const eventLocation =
        event.id.includes("online") || event.id === "unwind-rest"
          ? "Online (Zoom link will be sent)"
          : "AUFI, 20 Eastcastle St, London W1W 8DB";

      const { data, error } = await supabase.functions.invoke("create-event-payment", {
        body: {
          eventType: event.id,
          eventTitle: event.title,
          eventDescription: event.subtitle,
          eventDate: selectedDate.date,
          eventDisplayDate: selectedDate.displayDate,
          eventTime: selectedDate.time,
          eventLocation,
          quantity,
          attendeeName,
          attendeeEmail,
          priceInPence: event.price,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      if (data?.url) {
        analytics.eventBooked(event!.id, event!.title);
        window.open(data.url, "_blank");
        onClose();
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create payment");
    },
  });

  if (!event) return null;

  const totalPrice = (event.price / 100) * quantity;
  const isFreeEvent = event.price === 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        hideClose
        className="max-h-[90vh] min-h-[70vh] w-[92%] max-w-2xl overflow-y-auto rounded-3xl border border-white/20 bg-black/70 p-10 backdrop-blur-xl"
      >
        <ModalCloseButton onClose={onClose} size="md" />
        <DialogHeader className="pb-2">
          <DialogTitle className="font-editorial text-2xl tracking-wide text-white md:text-3xl">
            Book {event.title}
          </DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-10 pt-6">
            {/* Date Selector */}
            <div>
              <Label className="mb-4 block text-[15px] font-medium tracking-wide text-white/90">
                Select a Date
              </Label>
              <Suspense fallback={<SkeletonBox className="h-10 w-full rounded-lg bg-white/10" />}>
                <EventDateSelector
                  eventId={event.id}
                  time={event.time}
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                />
              </Suspense>
            </div>

            <div>
              <Label className="mb-4 block text-[15px] font-medium tracking-wide text-white/90">
                Your Details
              </Label>
              <div className="space-y-4">
                <DarkInput
                  placeholder="Full Name"
                  value={attendeeName}
                  onChange={(e) => setAttendeeName(e.target.value)}
                  required
                  className="py-5 text-[15px]"
                />
                <DarkInput
                  type="email"
                  placeholder="Email Address"
                  value={attendeeEmail}
                  onChange={(e) => setAttendeeEmail(e.target.value)}
                  required
                  className="py-5 text-[15px]"
                />
              </div>
            </div>

            {!isFreeEvent && (
              <div>
                <Label className="mb-4 block text-[15px] font-medium tracking-wide text-white/90">
                  Number of Tickets
                </Label>
                <div className="mt-2 flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="h-11 w-11 rounded-full border-white/30 bg-transparent text-white hover:bg-white/10"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center text-2xl font-medium text-white">
                    {quantity}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.min(maxTickets, quantity + 1))}
                    disabled={quantity >= maxTickets}
                    className="h-11 w-11 rounded-full border-white/30 bg-transparent text-white hover:bg-white/10"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {!selectedDate?.isOnline && selectedDate?.spotsRemaining && (
                  <p className="mt-3 text-sm text-white/60">
                    {selectedDate.spotsRemaining} spots remaining
                  </p>
                )}
              </div>
            )}

            {!isFreeEvent && (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-5">
                <div className="flex justify-between text-lg font-medium text-white">
                  <span>Total:</span>
                  <span>£{totalPrice.toFixed(2)}</span>
                </div>
              </div>
            )}

            <Button
              variant="outline"
              className="w-full rounded-full border-white/40 bg-transparent py-6 text-[15px] font-medium tracking-wide text-white hover:bg-white/10"
              onClick={() => setStep(2)}
              disabled={!attendeeName || !attendeeEmail || !selectedDate}
            >
              Continue to Safety Disclosure
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 pt-4 md:space-y-8">
            <div className="prose prose-sm max-h-[50vh] min-h-64 max-w-none overflow-y-auto rounded-2xl border border-white/10 bg-white/5 p-5 md:min-h-80 md:p-6">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-white/90 md:text-base">
                {SAFETY_DISCLOSURE}
              </pre>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="accept"
                checked={hasAccepted}
                onCheckedChange={(checked) => setHasAccepted(checked === true)}
                className="mt-0.5 border-white/40 p-2 data-[state=checked]:bg-green-500 data-[state=checked]:text-black"
              />
              <label
                htmlFor="accept"
                className="cursor-pointer text-base leading-relaxed text-white/90"
              >
                I have read and agree to the safety disclosure above
              </label>
            </div>

            <div className="flex flex-col gap-3 pt-2 md:flex-row">
              <Button
                variant="outline"
                onClick={() => setStep(1)}
                className="flex-1 rounded-full border-white/30 bg-transparent py-6 text-base text-white hover:bg-white/10"
              >
                Back
              </Button>
              <Button
                variant="outline"
                onClick={() => proceedToPayment()}
                disabled={!hasAccepted || isPending}
                className="flex-1 rounded-full border-white/40 bg-transparent py-6 text-base font-medium text-white hover:bg-white/10 disabled:opacity-50"
              >
                {isPending ? (
                  <ButtonLoadingSpinner />
                ) : isFreeEvent ? (
                  "Confirm Booking"
                ) : (
                  `Pay £${totalPrice.toFixed(2)}`
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
