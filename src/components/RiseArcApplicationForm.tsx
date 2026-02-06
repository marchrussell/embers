import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { DarkInput } from "@/components/ui/dark-input";
import { DarkTextarea } from "@/components/ui/dark-textarea";
import { ModalCloseButton } from "@/components/ui/modal-close-button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { ButtonLoadingSpinner } from "@/components/skeletons";
import { useState } from "react";

interface RiseArcApplicationFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CHALLENGES = [
  "Stress / overwhelm",
  "Racing thoughts / anxiety / tension",
  "Exhaustion / burnout",
  "Emotional shutdown / numbness",
  "Reactivity / irritability",
  "Trouble sleeping / switching off",
  "Feeling disconnected — from myself, others, or life",
  "Difficulty feeling joy, presence, or aliveness",
  "Not sure — I just know something needs to shift"
];

const STATEMENTS = [
  '"I can get things done — but I don\'t always feel them."',
  '"I\'m capable, but inside I feel tense, stressed, or overloaded."',
  '"I\'m present for others — but not always connected to myself."',
  '"I\'m tired, wired, or emotionally flat — even when nothing is wrong."',
  '"I live in my head more than in my body."',
  '"I rarely feel open, relaxed, or emotionally available."',
  '"I feel too much sometimes… and nothing at other times."',
  '"I don\'t feel broken — I just don\'t feel fully here."',
  '"I\'m not looking for motivation — I want to feel alive, connected, and safe in myself."'
];

const TRIED_OPTIONS = [
  "Therapy or coaching",
  "Breathwork or meditation",
  "Somatic or nervous system work",
  "Mindset work / journaling",
  "Medication or medical support",
  "Books / podcasts / online learning",
  "Managing it alone / pushing through",
  "Other or not sure"
];

const NEEDS = [
  "Deeper sleep and rest",
  "Steadier energy — not wired, not exhausted",
  "To feel present instead of in my head",
  "To respond better under pressure",
  "Emotional availability — for myself and others",
  "To stop disconnecting or shutting down",
  "A sense of internal space instead of pressure",
  "To feel more alive, real, and engaged",
  "To feel safe enough to soften",
  "To recover faster when stressed"
];

const WHERE_ARE_YOU = [
  "Just exploring — curious",
  "I know something needs to change",
  "I've tried things, and now I need something deeper",
  "I'm ready — gently, but with commitment",
  "Unsure — but I feel drawn to this"
];

const FINAL_CHECKIN = [
  "Yes — this feels right",
  "No — not the right time",
  "Unsure — but curious",
  "Something else"
];

// Reusable selection option component with larger tap targets and clear selection state
const SelectionOption = ({ 
  label, 
  selected, 
  onSelect, 
  isRadio = false,
  italic = false 
}: { 
  label: string; 
  selected: boolean; 
  onSelect: () => void; 
  isRadio?: boolean;
  italic?: boolean;
}) => (
  <button
    type="button"
    onClick={onSelect}
    className={cn(
      "w-full min-h-[52px] flex items-center gap-4 px-5 py-4 rounded-xl transition-colors duration-200 text-left",
      "border",
      selected 
        ? "bg-white/12 border-white/40 shadow-[0_0_20px_rgba(255,255,255,0.08)]" 
        : "bg-white/[0.03] border-white/10 hover:bg-white/[0.06] hover:border-white/20"
    )}
  >
    {/* Custom checkbox/radio indicator */}
    <div className={cn(
      "w-6 h-6 flex-shrink-0 flex items-center justify-center transition-colors duration-200",
      isRadio ? "rounded-full" : "rounded-md",
      selected 
        ? "bg-white border-2 border-white" 
        : "bg-transparent border-2 border-white/40"
    )}>
      {selected && (
        <Check className="w-4 h-4 text-black" strokeWidth={3} />
      )}
    </div>
    <span className={cn(
      "text-[15px] leading-relaxed transition-colors",
      selected ? "text-white font-normal" : "text-white/80",
      italic && "italic"
    )}>
      {label}
    </span>
  </button>
);

export const RiseArcApplicationForm = ({ open, onOpenChange }: RiseArcApplicationFormProps) => {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    challenges: [] as string[],
    internalExperience: "",
    statements: [] as string[],
    triedOptions: [] as string[],
    triedNote: "",
    needs: [] as string[],
    desiredShift: "",
    awareness: "",
    whereAreYou: "",
    finalCheckin: "",
    finalComment: ""
  });

  const totalSteps = 11; // Added one more step for name/email

  const toggleArrayItem = (array: string[], item: string) => {
    if (array.includes(item)) {
      return array.filter(i => i !== item);
    }
    return [...array, item];
  };

  const canProceed = () => {
    switch (step) {
      case 1: return formData.fullName.trim().length > 0 && formData.email.trim().length > 0 && formData.email.includes('@');
      case 2: return formData.challenges.length > 0;
      case 3: return formData.internalExperience.trim().length > 0;
      case 4: return formData.statements.length > 0;
      case 5: return formData.triedOptions.length > 0;
      case 6: return formData.needs.length > 0;
      case 7: return formData.desiredShift.trim().length > 0;
      case 8: return true;
      case 9: return formData.whereAreYou.length > 0;
      case 10: return formData.finalCheckin.length > 0;
      default: return true;
    }
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('arc_applications')
        .insert({
          full_name: formData.fullName.trim(),
          email: formData.email.trim().toLowerCase(),
          challenges: formData.challenges,
          internal_experience: formData.internalExperience,
          statements: formData.statements,
          tried_options: formData.triedOptions,
          tried_note: formData.triedNote,
          needs: formData.needs,
          desired_shift: formData.desiredShift,
          awareness: formData.awareness,
          where_are_you: formData.whereAreYou,
          final_checkin: formData.finalCheckin,
          final_comment: formData.finalComment
        });

      if (error) throw error;

      // Open Calendly after successful submission
      window.open("https://calendly.com/march-marchrussell/welcome-call", "_blank");
      
      toast({
        title: "Application submitted",
        description: "Thank you! Your application has been received.",
      });
      
      onOpenChange(false);
      setStep(1);
      setFormData({
        fullName: "",
        email: "",
        challenges: [],
        internalExperience: "",
        statements: [],
        triedOptions: [],
        triedNote: "",
        needs: [],
        desiredShift: "",
        awareness: "",
        whereAreYou: "",
        finalCheckin: "",
        finalComment: ""
      });
    } catch (error) {
      console.error('Error submitting application:', error);
      toast({
        title: "Submission failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-8">
            {/* Intro message */}
            <div className="mb-8 pb-8 border-b border-white/[0.08]">
              <h3 className="text-xl md:text-2xl font-light text-white mb-5">Before You Apply</h3>
              <div className="text-white/70 text-[15px] md:text-base leading-[1.75] space-y-4 max-w-[55ch]">
                <p>
                  This isn't a test — just a gentle check-in to understand where you are.
                </p>
                <p>
                  Take your time. There are no right answers, just honesty in your own words.
                </p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg md:text-xl font-light text-white mb-2">Let's start with your name</h3>
                <p className="text-white/50 text-sm md:text-base mb-4">So we know who we're speaking with</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-white/70 text-sm mb-2 block">Full Name *</label>
                  <DarkInput
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="text-white/70 text-sm mb-2 block">Email Address *</label>
                  <DarkInput
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your@email.com"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <div className="mb-4">
              <h3 className="text-lg md:text-xl font-light text-white mb-2">Where are you noticing challenges most right now?</h3>
              <p className="text-white/50 text-sm md:text-base">Select all that apply</p>
            </div>
            <div className="space-y-3">
              {CHALLENGES.map((challenge) => (
                <SelectionOption
                  key={challenge}
                  label={challenge}
                  selected={formData.challenges.includes(challenge)}
                  onSelect={() => setFormData(prev => ({
                    ...prev,
                    challenges: toggleArrayItem(prev.challenges, challenge)
                  }))}
                />
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg md:text-xl font-light text-white mb-2">How would you describe your current internal experience?</h3>
              <p className="text-white/50 text-sm md:text-base">Your words — no right or wrong</p>
            </div>
            <DarkTextarea
              value={formData.internalExperience}
              onChange={(e) => setFormData(prev => ({ ...prev, internalExperience: e.target.value }))}
              placeholder="Share what feels true for you..."
              className="min-h-[160px]"
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg md:text-xl font-light text-white mb-2">Which statements feel true for you right now?</h3>
              <p className="text-white/50 text-sm md:text-base">Select any that resonate</p>
            </div>
            <div className="space-y-3">
              {STATEMENTS.map((statement) => (
                <SelectionOption
                  key={statement}
                  label={statement}
                  selected={formData.statements.includes(statement)}
                  onSelect={() => setFormData(prev => ({
                    ...prev,
                    statements: toggleArrayItem(prev.statements, statement)
                  }))}
                  italic
                />
              ))}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg md:text-xl font-light text-white mb-2">What have you already tried?</h3>
              <p className="text-white/50 text-sm md:text-base">Select all that apply</p>
            </div>
            <div className="space-y-3">
              {TRIED_OPTIONS.map((option) => (
                <SelectionOption
                  key={option}
                  label={option}
                  selected={formData.triedOptions.includes(option)}
                  onSelect={() => setFormData(prev => ({
                    ...prev,
                    triedOptions: toggleArrayItem(prev.triedOptions, option)
                  }))}
                />
              ))}
            </div>
            <div className="pt-4">
              <p className="text-white/50 text-sm md:text-base mb-3">Optional short note</p>
              <DarkTextarea
                value={formData.triedNote}
                onChange={(e) => setFormData(prev => ({ ...prev, triedNote: e.target.value }))}
                placeholder="Anything else you'd like to add..."
                className="min-h-[100px]"
              />
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg md:text-xl font-light text-white mb-2">What do you feel you need more of right now?</h3>
              <p className="text-white/50 text-sm md:text-base">Choose intuitively</p>
            </div>
            <div className="space-y-3">
              {NEEDS.map((need) => (
                <SelectionOption
                  key={need}
                  label={need}
                  selected={formData.needs.includes(need)}
                  onSelect={() => setFormData(prev => ({
                    ...prev,
                    needs: toggleArrayItem(prev.needs, need)
                  }))}
                />
              ))}
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg md:text-xl font-light text-white mb-2">If something were to shift, what would you most want to feel?</h3>
            </div>
            <DarkTextarea
              value={formData.desiredShift}
              onChange={(e) => setFormData(prev => ({ ...prev, desiredShift: e.target.value }))}
              placeholder="Describe what you'd most want to experience..."
              className="min-h-[160px]"
            />
          </div>
        );

      case 8:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg md:text-xl font-light text-white mb-2">Is there anything you'd like me to be aware of before we speak?</h3>
              <p className="text-white/50 text-sm md:text-base">Optional — skip if nothing comes to mind</p>
            </div>
            <DarkTextarea
              value={formData.awareness}
              onChange={(e) => setFormData(prev => ({ ...prev, awareness: e.target.value }))}
              placeholder="Share anything that feels relevant..."
              className="min-h-[160px]"
            />
          </div>
        );

      case 9:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg md:text-xl font-light text-white mb-2">How would you describe where you are right now?</h3>
            </div>
            <div className="space-y-3">
              {WHERE_ARE_YOU.map((option) => (
                <SelectionOption
                  key={option}
                  label={option}
                  selected={formData.whereAreYou === option}
                  onSelect={() => setFormData(prev => ({
                    ...prev,
                    whereAreYou: prev.whereAreYou === option ? "" : option
                  }))}
                  isRadio
                />
              ))}
            </div>
          </div>
        );

      case 10:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg md:text-xl font-light text-white mb-2">Final check-in</h3>
              <p className="text-white/60 text-[15px] md:text-base">When you imagine exploring this process, your body feels more like:</p>
            </div>
            <div className="space-y-3">
              {FINAL_CHECKIN.map((option) => (
                <SelectionOption
                  key={option}
                  label={option}
                  selected={formData.finalCheckin === option}
                  onSelect={() => setFormData(prev => ({
                    ...prev,
                    finalCheckin: prev.finalCheckin === option ? "" : option
                  }))}
                  isRadio
                />
              ))}
            </div>
            {formData.finalCheckin === "Something else" && (
              <DarkTextarea
                value={formData.finalComment}
                onChange={(e) => setFormData(prev => ({ ...prev, finalComment: e.target.value }))}
                placeholder="Share what feels true..."
                className="min-h-[100px]"
              />
            )}
          </div>
        );

      case 11:
        return (
          <div className="space-y-10 text-center py-10">
            <div className="space-y-5">
              <h3 className="text-2xl md:text-3xl font-light text-white">Thank you for sharing, {formData.fullName.split(' ')[0]}.</h3>
              <p className="text-white/70 text-[17px] md:text-lg leading-relaxed max-w-[45ch] mx-auto">
                We'll explore the rest together on the call.
              </p>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-white text-black hover:bg-white/90 px-10 py-6 text-base md:text-lg font-normal rounded-full transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? <ButtonLoadingSpinner /> : "Schedule Your Call"}
              {!isSubmitting && <ArrowRight className="ml-2 w-5 h-5" />}
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        hideClose
        className="w-[94vw] max-w-[640px] max-h-[90vh] overflow-y-auto scrollbar-hide backdrop-blur-2xl bg-black/50 border border-white/[0.12] rounded-[24px] p-0 shadow-[0_24px_80px_rgba(0,0,0,0.5)]"
      >
        <DialogTitle className="sr-only">Rise ARC Method Application</DialogTitle>

        {/* Close button - matches other modals */}
        <ModalCloseButton onClose={() => onOpenChange(false)} size="md" position="loose" />

        <div className="p-8 sm:p-10 md:p-12">
          {/* Progress indicator - stronger visibility */}
          {step < 11 && (
            <div className="mb-10 pr-12">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-white/70 text-sm font-normal">Step {step} of 10</span>
              </div>
              <div className="h-[6px] bg-white/[0.08] rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-[width] duration-500 ease-out"
                  style={{ 
                    width: `${(step / 10) * 100}%`,
                    background: 'linear-gradient(90deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.7) 100%)',
                    boxShadow: '0 0 12px rgba(255,255,255,0.3)'
                  }}
                />
              </div>
            </div>
          )}

          {/* Step content */}
          {renderStep()}

          {/* Navigation - clear button hierarchy */}
          {step < 11 && (
            <div className="flex items-center justify-between mt-10 pt-8 border-t border-white/[0.06]">
              {step > 1 ? (
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-[15px] font-normal"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
              ) : (
                <div />
              )}
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className={cn(
                  "min-w-[180px] px-10 py-5 h-auto rounded-full text-[15px] font-normal transition-all flex items-center justify-center gap-2",
                  canProceed()
                    ? "bg-white text-black hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] transition-[background-color,transform]"
                    : "bg-white/10 text-white/40 cursor-not-allowed"
                )}
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};