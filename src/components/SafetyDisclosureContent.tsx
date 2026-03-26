export const SafetyDisclosureContent = () => (
  <div className="space-y-10">
    {/* Introduction */}
    <section className="space-y-6">
      <h2 className="my-6 font-editorial text-xl font-medium text-[#E6DBC7]">
        Important Safety Information
      </h2>
      <p>
        Embers Studio provides specialist breathwork, meditation, and wellness classes designed to
        support your wellbeing. All content and tools provided through the App are for informational
        and educational purposes only and do not constitute or replace medical, psychological, or
        therapeutic advice.
      </p>
      <p>
        Breathwork can have powerful effects on the body and mind, so please practice gently,
        safely, and within your own window of capacity. It is important and advisable to read and
        understand the Safety Information below before continuing.
      </p>
      <p>
        Please consult a medical professional if you have any medical history, conditions, or
        concerns, and reach out to March at{" "}
        <a
          href="mailto:support@embersstudio.io"
          className="text-[#E6DBC7] underline transition-colors hover:text-[#E6DBC7]/80"
        >
          support@embersstudio.io
        </a>{" "}
        if you have any questions.
      </p>
    </section>

    {/* Confirmation Note */}
    <div className="rounded-lg border border-[#E6DBC7]/20 bg-[#E6DBC7]/5 p-5">
      <p>
        <span className="font-medium text-[#E6DBC7]">By continuing, you confirm</span> that you have
        read and understood our safety guidelines, and that you take full responsibility for your
        own health and wellbeing while using this service.
      </p>
    </div>

    {/* Full Disclosure */}
    <section className="space-y-8">
      <div>
        <h1 className="my-6 font-editorial text-2xl text-[#E6DBC7]">Full Safety Disclosure</h1>
        <p className="text-sm italic">
          Please read all of the information below before continuing to Embers Studio.
        </p>
      </div>

      {/* Introduction */}
      <div>
        <p className="mb-4">
          You will be guided through simple Breathwork techniques which can have a powerful and
          profound effect on your:
        </p>
        <ul className="mb-5 space-y-2 pl-5">
          <li className="list-disc">Nervous system</li>
          <li className="list-disc">Respiratory system</li>
          <li className="list-disc">Lymphatic System</li>
          <li className="list-disc">Endocrine system</li>
          <li className="list-disc">Cardiovascular system</li>
        </ul>
        <p>
          For your safety, it is important and advisable to consult a medical professional if you
          have any medical history or issues related to the aforementioned bodily systems to ensure
          that the breathwork is safe and appropriate for you.
        </p>
      </div>

      {/* Contraindications */}
      <div className="border-b border-foreground/10 pb-6">
        <h2 className="my-6 text-lg font-semibold uppercase tracking-wide text-[#E6DBC7]">
          Contraindications
        </h2>
        <p className="mb-5">
          The breathing classes and techniques in this App are not suitable for anyone with the
          following conditions. Please do not practice breathwork, Online or In-Person, without
          consulting your doctor if you have experienced or have any of the following conditions:
        </p>
        <ul className="mb-5 space-y-2 pl-5">
          <li className="list-disc">Pregnancy</li>
          <li className="list-disc">Epilepsy</li>
          <li className="list-disc">
            Serious mental illness; severe anxiety or depression, psychotic states/borderline
            psychotic states
          </li>
          <li className="list-disc">Respiratory conditions or infections</li>
          <li className="list-disc">Seizures (of any kind)</li>
          <li className="list-disc">High Blood Pressure</li>
          <li className="list-disc">Detached retina / cataracts / glaucoma</li>
          <li className="list-disc">Cardiovascular disease</li>
          <li className="list-disc">Angina/heart attack/heart conditions</li>
          <li className="list-disc">Osteoporosis</li>
          <li className="list-disc">Panic attacks</li>
          <li className="list-disc">Family History of aneurysms</li>
          <li className="list-disc">Recent surgery or injury</li>
          <li className="list-disc">Any conditions which you take regular medication for</li>
          <li className="list-disc">Spiritual Emergence</li>
          <li className="list-disc">Vertigo</li>
          <li className="list-disc">Spinal Disorders</li>
        </ul>
        <p className="italic">
          Please note: Rapid breathing can cause lightheadedness and may disrupt the heart. If you
          experience faintness, dizziness, pain or shortness of breath at any time while using the
          app, you should stop immediately and seek immediate medical attention.
        </p>
      </div>

      {/* Breathholds */}
      <div className="border-b border-foreground/10 pb-6">
        <h2 className="my-6 text-lg font-semibold uppercase tracking-wide text-[#E6DBC7]">
          Breathholds
        </h2>
        <p className="mb-5">
          Breath retention exercises (breath holds) are only appropriate for individuals in good
          health. If you have any concerns, it's advisable to consult your doctor before
          participating in these exercises. Please do not practice breath holds if you have any of
          the following;
        </p>
        <ul className="mb-5 space-y-2 pl-5">
          <li className="list-disc">Cancer.</li>
          <li className="list-disc">Uncontrolled hyperthyroidism.</li>
          <li className="list-disc">Schizophrenia.</li>
          <li className="list-disc">Sleep apnea.</li>
          <li className="list-disc">During pregnancy.</li>
          <li className="list-disc">High blood pressure.</li>
          <li className="list-disc">Kidney disease.</li>
          <li className="list-disc">Cardiovascular issues.</li>
          <li className="list-disc">Epilepsy.</li>
          <li className="list-disc">Chest pains or heart problems.</li>
          <li className="list-disc">Near water.</li>
          <li className="list-disc">Panic disorder and anxiety.</li>
          <li className="list-disc">Sickle cell anemia.</li>
          <li className="list-disc">Arterial aneurysm.</li>
          <li className="list-disc">Diabetes.</li>
        </ul>
        <p>
          Always consult a healthcare professional before attempting breath holding exercises if you
          have any of these conditions or concerns.
        </p>
      </div>

      {/* Where Not to Practice */}
      <div className="border-b border-foreground/10 pb-6">
        <h2 className="my-6 text-lg font-semibold uppercase tracking-wide text-[#E6DBC7]">
          Where Not to Practice Breathwork
        </h2>
        <p>
          Do not use the Services while driving, in water, while operating machinery or performing
          other tasks that require attention and concentration. You understand that you are solely
          responsible for your use of the Services. We assume no responsibility for injuries
          suffered while practicing the techniques presented in the Services.{" "}
          <span className="italic">
            It is important to only practice breathwork when you are in a safe place.
          </span>
        </p>
      </div>

      {/* Pregnancy */}
      <div className="border-b border-foreground/10 pb-6">
        <h2 className="my-6 text-lg font-semibold uppercase tracking-wide text-[#E6DBC7]">
          Pregnancy
        </h2>
        <p className="mb-4">
          If you are currently attempting to conceive, are pregnant or in the postpartum phase,
          please take note of the following precautions when practicing breathwork:
        </p>
        <ul className="mb-4 space-y-3 pl-5">
          <li className="list-disc">
            Some breathing techniques involve breath retentions (holding your breath) which are not
            recommended and should not be attempted by you during this practice.
          </li>
          <li className="list-disc">
            Some breathing techniques involve muscle tension exercises, which involve squeezing and
            tensing various parts of the body, including in the abdomen region. This is not
            recommended and should not be attempted by you during this practice.
          </li>
        </ul>
        <p className="mb-4">
          Instead of practicing the aforementioned techniques, allow your breath to flow back to its
          natural rhythm and you can then continue as normal afterwards.
        </p>
        <p className="italic">
          Please note: Breathwork is not a suitable practice for you, if you are in your first
          trimester of pregnancy,
        </p>
      </div>

      {/* Cardiovascular Problems */}
      <div className="border-b border-foreground/10 pb-6">
        <h2 className="my-6 text-lg font-semibold uppercase tracking-wide text-[#E6DBC7]">
          Cardiovascular Problems
        </h2>
        <p className="mb-4">If you have cardiovascular problems, please note:</p>
        <ul className="mb-4 space-y-3 pl-5">
          <li className="list-disc">
            It is recommended to practice breathing exercises while sitting upright comfortably on a
            chair or with your torso raised by propping your body up at an angle.
          </li>
          <li className="list-disc">
            Breathe 30% slower than the pace that is set during any breathing exercises. Pay
            attention to your body and chose the actions that feel appropriate for you.
          </li>
        </ul>
        <p className="italic">
          Please note: Breathwork is not a suitable practice for you if you have severe
          cardiovascular problems,
        </p>
      </div>

      {/* Neurodiverse People */}
      <div className="border-b border-foreground/10 pb-6">
        <h2 className="my-6 text-lg font-semibold uppercase tracking-wide text-[#E6DBC7]">
          Neurodiverse People
        </h2>
        <p className="mb-4">
          If you are neurodiverse or have any psychological conditions like anxiety and depression,
          these breathing exercises can be beneficial. However, it is important to proceed at your
          own pace and seek professional advice if you feel uncertain about engaging with
          breathwork.
        </p>
        <p>
          There have been rare reports that people with certain mental health conditions such as
          anxiety and depression having experienced worsening conditions in conjunction with
          intensive breathing practice. People with existing mental health conditions should speak
          with their healthcare providers before starting a breathing practice.
        </p>
      </div>

      {/* Tips */}
      <div className="border-b border-foreground/10 pb-6">
        <h2 className="my-6 text-lg font-semibold uppercase tracking-wide text-[#E6DBC7]">Tips</h2>
        <p>It is advisable to practice breathwork on an empty stomach.</p>
      </div>

      {/* Legal Disclaimer */}
      <div className="space-y-6">
        <p>
          Embers Studio Ltd. assumes no responsibility for injuries suffered while practicing these
          techniques and Embers Studio Ltd. shall not be held liable for any damages, circumstances,
          conditions or injuries that may occur, directly or indirectly, from engaging in any
          activities or ideas presented in any Application made by Embers Studio, Ltd.
        </p>
        <p>
          By continuing to access and use Embers Studio App, you agree that you have read and
          understood the above Safety Disclosure and accept all responsibility for your physical and
          mental health and any resultant injury or mishap that may affect your well-being or health
          in any way.
        </p>
        <p>
          If you have questions or comments, you may email us at{" "}
          <a href="mailto:support@embersstudio.io" className="text-[#E6DBC7] hover:underline">
            support@embersstudio.io
          </a>
        </p>
      </div>
    </section>
  </div>
);
