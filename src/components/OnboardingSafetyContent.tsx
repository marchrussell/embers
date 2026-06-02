import DisclosureNote from "@/components/DisclosureNote";
import DisclosureSection from "@/components/DisclosureSection";

export const OnboardingSafetyContent = () => (
  <div className="space-y-6">
    {/* Intro */}
    <div>
      <p className="mb-4 text-base font-light leading-relaxed text-[#E6DBC7]/80">
        Welcome to HŌM. Our practices, including Breathwork, Meditation, Somatic Exercises, Yoga,
        and Movement are designed to support your well-being and can have a powerful effect on your
        nervous, respiratory, lymphatic, endocrine, and cardiovascular systems. By using this
        platform, you acknowledge that these are deep, transformative practices that require
        self-responsibility and medical awareness.
      </p>
    </div>

    <DisclosureSection title="1. Medical Disclaimer & Advice">
      <p className="mb-4 font-light leading-relaxed text-[#E6DBC7]/80">
        HŌM does not provide medical advice. The content provided is for educational and
        informational purposes only and is not a substitute for professional medical advice,
        diagnosis, or treatment. Always seek the advice of your physician or other qualified health
        provider with any questions regarding a medical condition. Never disregard professional
        medical advice or delay seeking it because of something you have read or experienced in this
        App.
      </p>
      <DisclosureNote icon>
        <strong>THE GOLDEN RULE:</strong> These practices are designed to be restorative. If at any
        time you feel faint, dizzy, experience chest pains, sharp physical pain, or shortness of
        breath, stop immediately, return to your natural breath, and seek medical attention. You are
        responsible for monitoring your own physical and mental limits.
      </DisclosureNote>
    </DisclosureSection>

    <DisclosureSection title="2. Medical Considerations & Contraindications">
      <p className="mb-4 font-light leading-relaxed text-[#E6DBC7]/80">
        To ensure these techniques are safe for you, you must consult your doctor before practicing
        if you have experienced or currently have any of the following:
      </p>
      <ul className="space-y-3 pl-5 font-light text-[#E6DBC7]/70">
        <li className="list-disc">
          <strong className="text-[#E6DBC7]/90">Cardiovascular:</strong> Heart conditions,
          pacemakers, irregular heartbeat (arrhythmia), angina, history of heart attack, high or low
          blood pressure (hypertension/hypotension), or family history of aneurysms.
        </li>
        <li className="list-disc">
          <strong className="text-[#E6DBC7]/90">Neurological:</strong> Epilepsy, history of seizures
          of any kind, vertigo, or spinal disorders.
        </li>
        <li className="list-disc">
          <strong className="text-[#E6DBC7]/90">Vision:</strong> Glaucoma, detached retina,
          cataracts, or recent eye surgery (specifically regarding breath holds and yoga
          inversions).
        </li>
        <li className="list-disc">
          <strong className="text-[#E6DBC7]/90">Respiratory:</strong> Severe or uncontrolled asthma,
          COPD, or active respiratory infections.
        </li>
        <li className="list-disc">
          <strong className="text-[#E6DBC7]/90">Physical:</strong> Hernias, recent surgery
          (especially abdominal, brain, heart, lung), significant injury, or osteoporosis.
        </li>
        <li className="list-disc">
          <strong className="text-[#E6DBC7]/90">Mental Health:</strong> Serious mental illness,
          severe anxiety, panic attacks, depression, psychotic or borderline psychotic states, or
          spiritual emergence.
        </li>
        <li className="list-disc">
          <strong className="text-[#E6DBC7]/90">Other:</strong> Severe Tinnitus, organ failure, or
          any conditions for which you take regular medication.
        </li>
      </ul>
    </DisclosureSection>

    <DisclosureSection title="3. Intense Breathwork & Breath Retention (Holds)">
      <p className="mb-4 font-light leading-relaxed text-[#E6DBC7]/80">
        While slow and gentle rhythmic breathing is generally safe, intense breathwork (fast,
        forceful, or prolonged) and breath holds can significantly alter your physiology. Avoid
        these specific techniques if you have:
      </p>
      <ul className="space-y-2 pl-5 font-light text-[#E6DBC7]/70">
        <li className="list-disc">Pregnancy, Epilepsy, or history of Seizures</li>
        <li className="list-disc">Cardiovascular issues, High Blood Pressure, or Pacemakers</li>
        <li className="list-disc">Cancer, Kidney disease, Diabetes, or Sickle cell anemia</li>
        <li className="list-disc">Uncontrolled hyperthyroidism or Sleep apnea</li>
        <li className="list-disc">Glaucoma, Retinal detachment, or severe Tinnitus</li>
        <li className="list-disc">Schizophrenia, Panic disorder, or severe Anxiety</li>
      </ul>
      <p className="mt-4 font-light leading-relaxed text-[#E6DBC7]/70">
        Note: Intensive breathing may cause tingling in the hands/face or temporary muscle
        contraction (tetany) due to changes in blood pH. If this becomes uncomfortable, slow your
        breathing down immediately.
      </p>
    </DisclosureSection>

    <DisclosureSection title="4. Modality-Specific Guidelines">
      <ul className="space-y-3 pl-5 font-light text-[#E6DBC7]/70">
        <li className="list-disc">
          <strong className="text-[#E6DBC7]/90">Pregnancy & Postpartum:</strong> If you are pregnant
          (especially in the first trimester), attempting to conceive, or postpartum, avoid breath
          retentions and intense abdominal "pumping." In Yoga/Movement, avoid deep twists or lying
          flat on your belly.
        </li>
        <li className="list-disc">
          <strong className="text-[#E6DBC7]/90">Yoga & Somatics:</strong> Move with curiosity rather
          than force. Avoid "head-below-heart" inversions if you have blood pressure or eye pressure
          issues.
        </li>
        <li className="list-disc">
          <strong className="text-[#E6DBC7]/90">Meditation & Trauma:</strong> If closing your eyes
          triggers anxiety or a "fight-or-flight" response, keep your eyes open and maintain a soft
          gaze on a fixed point.
        </li>
        <li className="list-disc">
          <strong className="text-[#E6DBC7]/90">Emotional Release:</strong> Somatic and breath
          practices can occasionally release stored emotions (crying, shaking, or heat). This is
          normal; however, always take it at your own speed, work within your own window of capacity
          and if you feel overwhelmed, stop the practice and seek professional psychological
          support.
        </li>
      </ul>
    </DisclosureSection>

    <DisclosureSection title="5. Practice Environment & Safety">
      <ul className="space-y-2 pl-5 font-light text-[#E6DBC7]/70">
        <li className="list-disc">
          <strong className="text-[#E6DBC7]/90">Prohibited Use:</strong> Never use the App while
          driving, operating machinery, or in/near water.
        </li>
        <li className="list-disc">
          <strong className="text-[#E6DBC7]/90">Stability:</strong> Always practice breathwork while
          seated or lying down in a clear, hazard-free space to prevent injury from potential
          lightheadedness or falls.
        </li>
        <li className="list-disc">
          <strong className="text-[#E6DBC7]/90">Satiety:</strong> Practices are most effective and
          comfortable on an empty stomach or 2 hours after a meal.
        </li>
      </ul>
    </DisclosureSection>

    <DisclosureSection title="6. Acknowledgment & Liability Waiver">
      <p className="mb-4 font-light leading-relaxed text-[#E6DBC7]/80">
        HŌM is owned and operated by March Collective Ltd. By clicking "I Accept" and continuing to
        use the App, you agree to the following:
      </p>
      <ul className="space-y-3 pl-5 font-light text-[#E6DBC7]/70">
        <li className="list-disc">
          <strong className="text-[#E6DBC7]/90">Assumption of Risk:</strong> You understand that
          these practices involve physical and physiological exertion and you voluntarily assume all
          risks, known or unknown.
        </li>
        <li className="list-disc">
          <strong className="text-[#E6DBC7]/90">Release of Liability:</strong> You agree that March
          Collective Ltd. (including its directors, officers, and instructors) shall not be held
          liable for any damages, circumstances, conditions, or injuries — direct or indirect — that
          may occur from engaging in any activities or ideas presented in the App.
        </li>
        <li className="list-disc">
          <strong className="text-[#E6DBC7]/90">Indemnification:</strong> You waive and release
          March Collective Ltd. of any and all claims or causes of action arising out of your use of
          the App.
        </li>
        <li className="list-disc">
          <strong className="text-[#E6DBC7]/90">Age Requirement:</strong> You certify that you are
          18 years of age or older, or have explicit parental consent to use this App.
        </li>
      </ul>
      <p className="mt-4 text-sm font-light text-[#E6DBC7]/50">
        Questions or Support? Reach us at:{" "}
        <a href="mailto:support@studiohom.co" className="text-[#EC9037] hover:underline">
          support@studiohom.co
        </a>
      </p>
    </DisclosureSection>
  </div>
);
