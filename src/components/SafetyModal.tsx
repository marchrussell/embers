import { AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ModalCloseButton } from "@/components/ui/modal-close-button";

interface SafetyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SafetyModal = ({ open, onOpenChange }: SafetyModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        hideClose
        className="max-h-[95vh] w-[95%] max-w-4xl overflow-y-auto rounded-lg border border-white/30 bg-black/30 p-0 backdrop-blur-xl md:rounded-none"
      >
        <ModalCloseButton onClose={() => onOpenChange(false)} size="sm" position="tight" />
        <div className="p-6 md:p-8">
          <h1 className="mb-4 font-['PP_Editorial_Old'] text-2xl text-[#E6DBC7] md:text-3xl">
            Safety Disclosure
          </h1>
          <p className="mb-6 text-sm font-light text-foreground/70 md:mb-8 md:text-base">
            Please read all of the information below before continuing.
          </p>

          {/* Introduction */}
          <div className="mb-8 md:mb-10">
            <p className="mb-4 text-sm font-light leading-relaxed text-foreground/80 md:text-base">
              You will be guided through simple Breathwork techniques which can have a powerful and
              profound effect on your:
            </p>
            <ul className="space-y-2 pl-6 text-sm font-light text-foreground/70 md:text-base">
              <li className="list-disc">Nervous system</li>
              <li className="list-disc">Respiratory system</li>
              <li className="list-disc">Lymphatic System</li>
              <li className="list-disc">Endocrine system</li>
              <li className="list-disc">Cardiovascular system</li>
            </ul>
            <p className="mt-4 text-sm font-light leading-relaxed text-foreground/80 md:text-base">
              For your safety, it is important and advisable to consult a medical professional if
              you have any medical history or issues related to the aforementioned bodily systems to
              ensure that the breathwork is safe and appropriate for you.
            </p>
          </div>

          {/* Warning Box */}
          <div className="mb-8 rounded-lg border border-white/30 bg-white/10 p-4 md:mb-10">
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-white md:h-5 md:w-5" />
              <p className="text-sm font-light leading-relaxed text-foreground/90 md:text-base">
                If you experience faintness, dizziness, pain or shortness of breath at any time
                while using the app, you should stop immediately and seek immediate medical
                attention.
              </p>
            </div>
          </div>

          {/* Contraindications */}
          <div className="mb-8 border-b border-foreground/10 pb-8 md:mb-10">
            <h2 className="mb-4 text-lg font-light uppercase tracking-wider text-foreground md:text-xl">
              Contraindications
            </h2>
            <p className="mb-4 text-sm font-light leading-relaxed text-foreground/80 md:text-base">
              The breathing classes and techniques in this App are not suitable for anyone with the
              following conditions. Please do not practice breathwork, Online or In-Person, without
              consulting your doctor if you have experienced or have any of the following
              conditions:
            </p>
            <ul className="grid grid-cols-1 gap-2 pl-5 text-sm font-light text-foreground/70 md:grid-cols-2 md:text-base">
              <li className="list-disc">Pregnancy</li>
              <li className="list-disc">Epilepsy</li>
              <li className="list-disc">Serious mental illness</li>
              <li className="list-disc">Respiratory conditions</li>
              <li className="list-disc">Seizures</li>
              <li className="list-disc">High Blood Pressure</li>
              <li className="list-disc">Eye conditions (detached retina, cataracts, glaucoma)</li>
              <li className="list-disc">Cardiovascular disease</li>
              <li className="list-disc">Heart conditions</li>
              <li className="list-disc">Osteoporosis</li>
              <li className="list-disc">Panic attacks</li>
              <li className="list-disc">Family history of aneurysms</li>
              <li className="list-disc">Recent surgery or injury</li>
              <li className="list-disc">Spiritual emergence</li>
              <li className="list-disc">Vertigo</li>
              <li className="list-disc">Spinal disorders</li>
              <li className="list-disc">Any conditions requiring regular medication</li>
            </ul>
          </div>

          {/* Breath Holds */}
          <div className="mb-8 border-b border-foreground/10 pb-8 md:mb-10">
            <h2 className="mb-4 text-base font-light uppercase tracking-wider text-foreground md:text-lg">
              Breath Holds
            </h2>
            <p className="mb-4 text-sm font-light leading-relaxed text-foreground/80 md:text-base">
              Breath retention exercises (breath holds) are only appropriate for individuals in good
              health. If you have any concerns, it's advisable to consult your doctor before
              participating in these exercises. Please do not practice breath holds if you have any
              of the following:
            </p>
            <ul className="grid grid-cols-1 gap-2 pl-5 text-sm font-light text-foreground/70 md:grid-cols-2 md:text-base">
              <li className="list-disc">Cancer</li>
              <li className="list-disc">Uncontrolled hyperthyroidism</li>
              <li className="list-disc">Schizophrenia</li>
              <li className="list-disc">Sleep apnea</li>
              <li className="list-disc">Pregnancy</li>
              <li className="list-disc">High blood pressure</li>
              <li className="list-disc">Kidney disease</li>
              <li className="list-disc">Cardiovascular issues</li>
              <li className="list-disc">Epilepsy</li>
              <li className="list-disc">Chest pains or heart problems</li>
              <li className="list-disc">Near water</li>
              <li className="list-disc">Panic disorder and anxiety</li>
              <li className="list-disc">Sickle cell anemia</li>
              <li className="list-disc">Arterial aneurysm</li>
              <li className="list-disc">Diabetes</li>
            </ul>
          </div>

          {/* Where Not to Practice */}
          <div className="mb-8 border-b border-foreground/10 pb-8 md:mb-10">
            <h2 className="mb-4 text-base font-light uppercase tracking-wider text-foreground md:text-lg">
              Where Not to Practice
            </h2>
            <p className="text-sm font-light leading-relaxed text-foreground/80 md:text-base">
              Do not use the Services while driving, in water, while operating machinery or
              performing other tasks that require attention and concentration. You understand that
              you are solely responsible for your use of the Services. We assume no responsibility
              for injuries suffered while practicing the techniques presented in the Services. It is
              important to only practice breathwork when you are in a safe place.
            </p>
          </div>

          {/* Legal Disclaimer */}
          <div className="mb-8 md:mb-10">
            <p className="mb-6 text-sm font-light leading-relaxed text-foreground/70">
              Embers Studio Ltd. assumes no responsibility for injuries suffered while practicing
              these techniques and Embers Studio Ltd. shall not be held liable for any damages,
              circumstances, conditions or injuries that may occur, directly or indirectly, from
              engaging in any activities or ideas presented in any Application made by Embers Studio
              Ltd.
            </p>
            <p className="mb-6 text-sm font-light leading-relaxed text-foreground/70">
              By continuing to access and use the March app, you agree that you have read and
              understood the above Safety Disclosure and accept all responsibility for your physical
              and mental health and any resultant injury or mishap that may affect your well-being
              or health in any way.
            </p>
            <p className="mb-4 text-sm font-light leading-relaxed text-foreground/70">
              For complete safety information, please visit our{" "}
              <Link
                to="/safety-disclosure"
                className="font-normal text-[#EC9037] hover:underline"
                onClick={() => onOpenChange(false)}
              >
                Safety Disclosure page
              </Link>
              .
            </p>
            <p className="text-sm font-light text-foreground/70">
              If you have questions or comments, you may email us at{" "}
              <a href="mailto:support@embersstudio.io" className="text-[#EC9037] hover:underline">
                support@embersstudio.io
              </a>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
