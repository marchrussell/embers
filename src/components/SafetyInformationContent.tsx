import DisclosureNote from "@/components/DisclosureNote";
import DisclosureSection from "@/components/DisclosureSection";

export const SafetyInformationContent = () => (
  <div className="space-y-6">
    {/* Intro */}
    <div>
      <p className="mb-4 text-base font-light leading-relaxed text-[#E6DBC7]/80">
        You will be guided through practices such as breathwork, meditation, somatic exercises, yoga,
        movement, and sound. These can influence your nervous, respiratory, cardiovascular, endocrine,
        and lymphatic systems and may produce strong physiological or emotional responses. By using
        HŌM, you accept full responsibility for your own physical and mental well‑being.
      </p>
      <ul className="space-y-2 pl-6 text-base font-light text-[#E6DBC7]/70">
        <li className="list-disc">
          If you experience a medical emergency, call your local emergency services immediately.
        </li>
        <li className="list-disc">
          HŌM is intended for adults (18+) and may only be used by minors with parental consent.
        </li>
        <li className="list-disc">
          When using headphones for sound sessions, keep volume low to protect hearing.
        </li>
      </ul>
      <p className="mt-4 text-base font-light leading-relaxed text-[#E6DBC7]/80">
        It is strongly recommended that you consult a medical professional before participating if
        you have any medical history or concerns related to the systems above to ensure that
        practice is safe and appropriate for you.
      </p>
    </div>

    <DisclosureNote icon className="w-full">
      If at any time you feel faint, dizzy, short of breath, anxious, or in pain, stop immediately,
      return to natural breathing, and seek medical attention if needed.
    </DisclosureNote>

    <DisclosureSection title="Contraindications">
      <p className="mb-4 text-base font-light leading-relaxed text-[#E6DBC7]/80">
        Do not practice HŌM techniques without medical approval if you have ever experienced or
        been diagnosed with any of the following:
      </p>
      <ul className="space-y-2 pl-5 text-base font-light text-[#E6DBC7]/70">
        <li className="list-disc">Pregnancy (particularly first trimester or high‑risk)</li>
        <li className="list-disc">
          Cardiovascular disease, angina, arrhythmia, heart attack history, high / low blood
          pressure, or pacemaker
        </li>
        <li className="list-disc">Epilepsy / seizure disorder</li>
        <li className="list-disc">
          Serious mental illness (severe anxiety, panic disorder, major depression, psychotic or
          borderline states, active spiritual emergence)
        </li>
        <li className="list-disc">
          Respiratory conditions (COPD, severe asthma, recent respiratory infection or
          COVID‑related complications)
        </li>
        <li className="list-disc">Detached retina, glaucoma, or recent eye surgery</li>
        <li className="list-disc">
          Severe osteoporosis or major musculoskeletal injury / post‑operative state
        </li>
        <li className="list-disc">Vertigo or spinal disorders</li>
        <li className="list-disc">Kidney disease, diabetes, or sickle‑cell anemia</li>
        <li className="list-disc">Uncontrolled hyperthyroidism or sleep apnea</li>
        <li className="list-disc">
          Organ failure or conditions requiring regular medication
        </li>
        <li className="list-disc">Family history of aneurysm</li>
      </ul>
    </DisclosureSection>

    <DisclosureSection title="Breath Holds & Intensive Breathing">
      <p className="mb-4 font-light leading-relaxed text-[#E6DBC7]/80">
        Breath retentions and intense cyclic breathing significantly alter blood gases (CO₂/O₂) and
        heart rate. Practise only if in good health and never if you are:
      </p>
      <ul className="space-y-2 pl-5 font-light text-[#E6DBC7]/70">
        <li className="list-disc">Pregnant</li>
        <li className="list-disc">Living with cardiovascular disease / hypertension</li>
        <li className="list-disc">Using a pacemaker or recently had cardiac surgery</li>
        <li className="list-disc">Diagnosed with epilepsy or aneurysm risk</li>
        <li className="list-disc">
          Managing serious mental health conditions (panic disorder, bipolar disorder, psychosis)
        </li>
        <li className="list-disc">
          Experiencing chronic respiratory disease or sleep apnea
        </li>
      </ul>
      <p className="mt-4 font-light leading-relaxed text-[#E6DBC7]/70">
        Tingling or temperature shifts may occur and are usually temporary. If they become
        uncomfortable, slow down or stop.
      </p>
    </DisclosureSection>

    <DisclosureSection title="Pregnancy & Postpartum">
      <p className="mb-4 font-light leading-relaxed text-[#E6DBC7]/80">
        If pregnant, postpartum, or trying to conceive:
      </p>
      <ul className="space-y-2 pl-5 font-light text-[#E6DBC7]/70">
        <li className="list-disc">
          Avoid breath holds, rapid‑fire breathing, and abdominal "pumping."
        </li>
        <li className="list-disc">
          Avoid deep spinal twists and lying on your belly.
        </li>
        <li className="list-disc">
          Practise gentle, rhythmic breathing and supportive movement only.
        </li>
      </ul>
    </DisclosureSection>

    <DisclosureSection title="Mental Health & Neurodiversity">
      <p className="mb-4 font-light leading-relaxed text-[#E6DBC7]/80">
        These practices can help with anxiety and fatigue when applied slowly and within your
        personal window of tolerance. If you feel overwhelmed or disconnected, pause and ground
        yourself by opening your eyes, feeling contact with the floor, or taking a walk.
      </p>
      <p className="font-light leading-relaxed text-[#E6DBC7]/70">
        Emotional responses (such as tears, tremor, or heat) are usually temporary. If distress
        continues after practice, contact a qualified mental‑health professional.
      </p>
    </DisclosureSection>

    <DisclosureSection title="Safe Environment">
      <ul className="space-y-2 pl-5 font-light text-[#E6DBC7]/70">
        <li className="list-disc">
          Practise only in a clear, quiet space where you can sit or lie down safely.
        </li>
        <li className="list-disc">
          Never use HŌM while driving, swimming, or operating machinery.
        </li>
        <li className="list-disc">
          Avoid practice immediately after heavy meals (allow 2 hours).
        </li>
        <li className="list-disc">Keep warm and hydrated after sessions.</li>
        <li className="list-disc">
          When using sound‑based sessions, limit volume to comfortable levels.
        </li>
      </ul>
    </DisclosureSection>

    <DisclosureSection title="General Tips">
      <ul className="space-y-2 pl-5 font-light text-[#E6DBC7]/70">
        <li className="list-disc">Practise on an empty stomach or two hours after eating.</li>
        <li className="list-disc">Move and breathe with curiosity, not force.</li>
        <li className="list-disc">
          Finish sessions gently; take time to sit or rest before standing.
        </li>
      </ul>
    </DisclosureSection>

    {/* Acknowledgment & Liability */}
    <div className="space-y-4">
      <p className="text-sm font-light leading-relaxed text-[#E6DBC7]/80">
        Your participation is voluntary and at your own risk. By continuing to use HŌM you confirm
        that you have read and understood this Safety Information and that you assume full
        responsibility for your physical and mental health.
      </p>
      <p className="text-sm font-light leading-relaxed text-[#E6DBC7]/70">
        Emotional responses are normal; if distress persists after practice, pause and seek
        professional support.
      </p>
      <p className="text-sm font-light leading-relaxed text-[#E6DBC7]/50">
        By using HŌM you agree to our Safety Information and{" "}
        <a href="https://studiohom.co" className="text-[#EC9037] hover:underline">
          studiohom.co
        </a>
        . HŌM is owned and operated by March Collective Ltd, registered in the United Kingdom.
        March Collective Ltd and its teachers shall not be held liable for any injury, condition,
        or loss — direct or indirect — arising from use of HŌM's services or content.
      </p>
      <p className="text-sm font-light text-[#E6DBC7]/50">
        For questions or support, email{" "}
        <a href="mailto:support@studiohom.co" className="text-[#EC9037] hover:underline">
          support@studiohom.co
        </a>
      </p>
    </div>
  </div>
);
