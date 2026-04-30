import { AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

import { PolicyModalShell } from "@/components/PolicyModalShell";

interface SafetyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SafetyModal = ({ open, onOpenChange }: SafetyModalProps) => (
  <PolicyModalShell
    open={open}
    onOpenChange={onOpenChange}
    title="Safety Disclosure"
    subtitle="Please read all of the information below before continuing."
  >
    {/* Introduction */}
    <div>
      <p className="mb-4">
        You will be guided through simple Breathwork techniques which can have a powerful and
        profound effect on your:
      </p>
      <ul className="space-y-2 pl-6">
        <li className="list-disc">Nervous system</li>
        <li className="list-disc">Respiratory system</li>
        <li className="list-disc">Lymphatic System</li>
        <li className="list-disc">Endocrine system</li>
        <li className="list-disc">Cardiovascular system</li>
      </ul>
      <p className="mt-4">
        For your safety, it is important and advisable to consult a medical professional if you have
        any medical history or issues related to the aforementioned bodily systems to ensure that
        the breathwork is safe and appropriate for you.
      </p>
    </div>

    <div className="flex w-fit items-center gap-3 rounded-lg border border-[#E6DBC7]/30 bg-[#E6DBC7]/10 p-4">
      <AlertTriangle className="h-6 w-5 flex-shrink-0" />
      <div className="text-base font-light leading-relaxed">
        If you experience faintness, dizziness, pain or shortness of breath at any time while using
        the app, you should stop immediately and seek immediate medical attention.
      </div>
    </div>

    {/* Contraindications */}
    <div className="border-b border-white/10 pb-6">
      <h2 className="mb-4 text-lg font-light uppercase tracking-wider text-[#E6DBC7]">
        Contraindications
      </h2>
      <p className="mb-4">
        The breathing classes and techniques in this App are not suitable for anyone with the
        following conditions. Please do not practice breathwork, Online or In-Person, without
        consulting your doctor if you have experienced or have any of the following conditions:
      </p>
      <ul className="grid grid-cols-1 gap-2 pl-5 md:grid-cols-2">
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
    <div className="border-b border-white/10 pb-6">
      <h2 className="mb-4 text-lg font-light uppercase tracking-wider text-[#E6DBC7]">
        Breath Holds
      </h2>
      <p className="mb-4">
        Breath retention exercises (breath holds) are only appropriate for individuals in good
        health. If you have any concerns, it's advisable to consult your doctor before participating
        in these exercises. Please do not practice breath holds if you have any of the following:
      </p>
      <ul className="grid grid-cols-1 gap-2 pl-5 md:grid-cols-2">
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
    <div className="border-b border-white/10 pb-6">
      <h2 className="mb-4 text-lg font-light uppercase tracking-wider text-[#E6DBC7]">
        Where Not to Practice
      </h2>
      <p>
        Do not use the Services while driving, in water, while operating machinery or performing
        other tasks that require attention and concentration. You understand that you are solely
        responsible for your use of the Services. We assume no responsibility for injuries suffered
        while practicing the techniques presented in the Services. It is important to only practice
        breathwork when you are in a safe place.
      </p>
    </div>

    {/* Legal Disclaimer */}
    <div className="space-y-4 text-sm text-[#E6DBC7]/60">
      <p>
        Embers Studio Ltd. assumes no responsibility for injuries suffered while practicing these
        techniques and Embers Studio Ltd. shall not be held liable for any damages, circumstances,
        conditions or injuries that may occur, directly or indirectly, from engaging in any
        activities or ideas presented in any Application made by Embers Studio Ltd.
      </p>
      <p>
        By continuing to access and use Embers Studio, you agree that you have read and understood
        the above Safety Disclosure and accept all responsibility for your physical and mental
        health and any resultant injury or mishap that may affect your well-being or health in any
        way.
      </p>
      <p>
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
      <p>
        If you have questions or comments, you may email us at{" "}
        <a href="mailto:support@embersstudio.io" className="text-[#EC9037] hover:underline">
          support@embersstudio.io
        </a>
      </p>
    </div>
  </PolicyModalShell>
);
