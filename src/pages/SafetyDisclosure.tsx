import { AlertTriangle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const SafetyDisclosure = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-6 pb-10 pt-6">
        <Link to="/online/about" className="mb-12 inline-block">
          <div className="group flex cursor-pointer items-center gap-3">
            <ArrowLeft className="h-6 w-6 text-white transition-colors group-hover:text-[#E6DBC7]" />
            <span className="text-base font-semibold text-white transition-colors group-hover:text-[#E6DBC7] md:text-lg">
              Back to About
            </span>
          </div>
        </Link>

        <h1 className="mb-4 text-3xl font-normal text-white">Safety Disclosure</h1>
        <p className="mb-8 text-base font-light text-white/70">
          Please read all of the information below before continuing.
        </p>

        {/* Introduction */}
        <div className="mb-10">
          <p className="mb-4 text-base font-light leading-relaxed text-white/80">
            You will be guided through simple Breathwork techniques which can have a powerful and
            profound effect on your:
          </p>
          <ul className="space-y-2 pl-6 text-base font-light text-white/70">
            <li className="list-disc">Nervous system</li>
            <li className="list-disc">Respiratory system</li>
            <li className="list-disc">Lymphatic System</li>
            <li className="list-disc">Endocrine system</li>
            <li className="list-disc">Cardiovascular system</li>
          </ul>
          <p className="mt-4 text-base font-light leading-relaxed text-white/80">
            For your safety, it is important and advisable to consult a medical professional if you
            have any medical history or issues related to the aforementioned bodily systems to
            ensure that the breathwork is safe and appropriate for you.
          </p>
        </div>

        {/* Warning Box */}
        <div className="mb-10 rounded-lg border border-[#5B9C9E]/30 bg-[#5B9C9E]/10 p-4">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-white" />
            <p className="text-base font-light leading-relaxed text-white/90">
              If you experience faintness, dizziness, pain or shortness of breath at any time while
              using the app, you should stop immediately and seek immediate medical attention.
            </p>
          </div>
        </div>

        {/* Contraindications */}
        <div className="mb-10 border-b border-white/10 pb-8">
          <h2 className="mb-4 text-xl font-light uppercase tracking-wider text-white">
            Contraindications
          </h2>
          <p className="mb-4 text-base font-light leading-relaxed text-white/80">
            The breathing classes and techniques in this App are not suitable for anyone with the
            following conditions. Please do not practice breathwork, Online or In-Person, without
            consulting your doctor if you have experienced or have any of the following conditions:
          </p>
          <ul className="grid grid-cols-1 gap-2 pl-5 text-base font-light text-white/70 md:grid-cols-2">
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
        <div className="mb-10 border-b border-white/10 pb-8">
          <h2 className="mb-4 text-lg font-light uppercase tracking-wider text-white">
            Breath Holds
          </h2>
          <p className="mb-4 font-light leading-relaxed text-white/80">
            Breath retention exercises (breath holds) are only appropriate for individuals in good
            health. If you have any concerns, it's advisable to consult your doctor before
            participating in these exercises. Please do not practice breath holds if you have any of
            the following:
          </p>
          <ul className="grid grid-cols-1 gap-2 pl-5 font-light text-white/70 md:grid-cols-2">
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
        <div className="mb-10 border-b border-white/10 pb-8">
          <h2 className="mb-4 text-lg font-light uppercase tracking-wider text-white">
            Where Not to Practice
          </h2>
          <p className="font-light leading-relaxed text-white/80">
            Do not use the Services while driving, in water, while operating machinery or performing
            other tasks that require attention and concentration. You understand that you are solely
            responsible for your use of the Services. We assume no responsibility for injuries
            suffered while practicing the techniques presented in the Services. It is important to
            only practice breathwork when you are in a safe place.
          </p>
        </div>

        {/* Pregnancy */}
        <div className="mb-10 border-b border-white/10 pb-8">
          <h2 className="mb-4 text-lg font-light uppercase tracking-wider text-white">Pregnancy</h2>
          <p className="mb-4 font-light leading-relaxed text-white/80">
            If you are currently attempting to conceive, are pregnant or in the postpartum phase,
            please take note of the following precautions when practicing breathwork:
          </p>
          <ul className="space-y-3 pl-5 font-light text-white/70">
            <li className="list-disc">
              Some breathing techniques involve breath retentions (holding your breath) which are
              not recommended and should not be attempted by you during this practice.
            </li>
            <li className="list-disc">
              Some breathing techniques involve muscle tension exercises, which involve squeezing
              and tensing various parts of the body, including in the abdomen region. This is not
              recommended and should not be attempted by you during this practice.
            </li>
          </ul>
          <p className="mt-4 font-light leading-relaxed text-white/80">
            Instead of practicing the aforementioned techniques, allow your breath to flow back to
            its natural rhythm and you can then continue as normal afterwards.
          </p>
          <div className="mt-4 rounded-lg border border-[#5B9C9E]/30 bg-[#5B9C9E]/10 p-4">
            <p className="text-sm font-light text-white/90">
              <strong>Please note:</strong> Breathwork is not a suitable practice for you, if you
              are in your first trimester of pregnancy.
            </p>
          </div>
        </div>

        {/* Cardiovascular Problems */}
        <div className="mb-10 border-b border-white/10 pb-8">
          <h2 className="mb-4 text-lg font-light uppercase tracking-wider text-white">
            Cardiovascular Problems
          </h2>
          <p className="mb-4 font-light leading-relaxed text-white/80">
            If you have cardiovascular problems, please note:
          </p>
          <ul className="space-y-3 pl-5 font-light text-white/70">
            <li className="list-disc">
              It is recommended to practice breathing exercises while sitting upright comfortably on
              a chair or with your torso raised by propping your body up at an angle.
            </li>
            <li className="list-disc">
              Breathe 30% slower than the pace that is set during any breathing exercises. Pay
              attention to your body and choose the actions that feel appropriate for you.
            </li>
          </ul>
          <div className="mt-4 rounded-lg border border-[#5B9C9E]/30 bg-[#5B9C9E]/10 p-4">
            <p className="text-sm font-light text-white/90">
              <strong>Please note:</strong> Breathwork is not a suitable practice for you if you
              have severe cardiovascular problems.
            </p>
          </div>
        </div>

        {/* Neurodiverse People */}
        <div className="mb-10 border-b border-white/10 pb-8">
          <h2 className="mb-4 text-lg font-light uppercase tracking-wider text-white">
            Neurodiverse People
          </h2>
          <p className="mb-4 font-light leading-relaxed text-white/80">
            If you are neurodiverse or have any psychological conditions like anxiety and
            depression, these breathing exercises can be beneficial. However, it is important to
            proceed at your own pace and seek professional advice if you feel uncertain about
            engaging with breathwork.
          </p>
          <p className="font-light leading-relaxed text-white/70">
            There have been rare reports that people with certain mental health conditions such as
            anxiety and depression having experienced worsening conditions in conjunction with
            intensive breathing practice. People with existing mental health conditions should speak
            with their healthcare providers before starting a breathing practice.
          </p>
        </div>

        {/* Tips */}
        <div className="mb-10 border-b border-white/10 pb-8">
          <h2 className="mb-4 text-lg font-light uppercase tracking-wider text-white">Tips</h2>
          <ul className="pl-5 font-light text-white/70">
            <li className="list-disc">
              It is advisable to practice breathwork on an empty stomach.
            </li>
          </ul>
        </div>

        {/* Legal Disclaimer */}
        <div className="mb-10">
          <p className="mb-6 text-sm font-light leading-relaxed text-white/50">
            Embers Studio Ltd. assumes no responsibility for injuries suffered while practicing
            these techniques and Embers Studio Ltd. shall not be held liable for any damages,
            circumstances, conditions or injuries that may occur, directly or indirectly, from
            engaging in any activities or ideas presented in any Application made by Embers Studio
            Ltd.
          </p>
          <p className="mb-6 text-sm font-light leading-relaxed text-white/60">
            By continuing to access and use Embers Studio, you agree that you have read and
            understood the above Safety Disclosure and accept all responsibility for your physical
            and mental health and any resultant injury or mishap that may affect your well-being or
            health in any way.
          </p>
          <p className="text-sm font-light text-white/50">
            If you have questions or comments, you may email us at{" "}
            <a href="mailto:support@embersstudio.io" className="text-[#5B9C9E] hover:underline">
              support@embersstudio.io
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SafetyDisclosure;
