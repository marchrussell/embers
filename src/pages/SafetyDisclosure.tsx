import { Link } from "react-router-dom";
import { ArrowLeft, AlertTriangle } from "lucide-react";

const SafetyDisclosure = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="px-6 pt-6 pb-10">
        <Link to="/online/about" className="inline-block mb-12">
          <div className="flex items-center gap-3 group cursor-pointer">
            <ArrowLeft className="w-6 h-6 text-white group-hover:text-[#E6DBC7] transition-colors" />
            <span className="text-base md:text-lg text-white font-semibold group-hover:text-[#E6DBC7] transition-colors">Back to About</span>
          </div>
        </Link>

        <h1 className="text-3xl font-normal text-white mb-4">Safety Disclosure</h1>
        <p className="text-base text-white/70 font-light mb-8">
          Please read all of the information below before continuing.
        </p>

        {/* Introduction */}
        <div className="mb-10">
          <p className="text-white/80 font-light leading-relaxed mb-4 text-base">
            You will be guided through simple Breathwork techniques which can have a powerful and profound effect on your:
          </p>
          <ul className="space-y-2 text-white/70 font-light pl-6 text-base">
            <li className="list-disc">Nervous system</li>
            <li className="list-disc">Respiratory system</li>
            <li className="list-disc">Lymphatic System</li>
            <li className="list-disc">Endocrine system</li>
            <li className="list-disc">Cardiovascular system</li>
          </ul>
          <p className="text-white/80 font-light leading-relaxed mt-4 text-base">
            For your safety, it is important and advisable to consult a medical professional if you have any medical history or issues related to the aforementioned bodily systems to ensure that the breathwork is safe and appropriate for you.
          </p>
        </div>

        {/* Warning Box */}
        <div className="bg-[#5B9C9E]/10 border border-[#5B9C9E]/30 rounded-lg p-4 mb-10">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 text-white flex-shrink-0 mt-0.5" />
            <p className="text-base text-white/90 font-light leading-relaxed">
              If you experience faintness, dizziness, pain or shortness of breath at any time while using the app, you should stop immediately and seek immediate medical attention.
            </p>
          </div>
        </div>

        {/* Contraindications */}
        <div className="mb-10 pb-8 border-b border-white/10">
          <h2 className="text-xl font-light text-white mb-4 uppercase tracking-wider">Contraindications</h2>
          <p className="text-white/80 font-light leading-relaxed mb-4 text-base">
            The breathing classes and techniques in this App are not suitable for anyone with the following conditions. Please do not practice breathwork, Online or In-Person, without consulting your doctor if you have experienced or have any of the following conditions:
          </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-white/70 font-light text-base pl-5">
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
        <div className="mb-10 pb-8 border-b border-white/10">
          <h2 className="text-lg font-light text-white mb-4 uppercase tracking-wider">Breath Holds</h2>
          <p className="text-white/80 font-light leading-relaxed mb-4">
            Breath retention exercises (breath holds) are only appropriate for individuals in good health. If you have any concerns, it's advisable to consult your doctor before participating in these exercises. Please do not practice breath holds if you have any of the following:
          </p>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-white/70 font-light pl-5">
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
        <div className="mb-10 pb-8 border-b border-white/10">
          <h2 className="text-lg font-light text-white mb-4 uppercase tracking-wider">Where Not to Practice</h2>
          <p className="text-white/80 font-light leading-relaxed">
            Do not use the Services while driving, in water, while operating machinery or performing other tasks that require attention and concentration. You understand that you are solely responsible for your use of the Services. We assume no responsibility for injuries suffered while practicing the techniques presented in the Services. It is important to only practice breathwork when you are in a safe place.
          </p>
        </div>

        {/* Pregnancy */}
        <div className="mb-10 pb-8 border-b border-white/10">
          <h2 className="text-lg font-light text-white mb-4 uppercase tracking-wider">Pregnancy</h2>
          <p className="text-white/80 font-light leading-relaxed mb-4">
            If you are currently attempting to conceive, are pregnant or in the postpartum phase, please take note of the following precautions when practicing breathwork:
          </p>
          <ul className="space-y-3 text-white/70 font-light pl-5">
            <li className="list-disc">Some breathing techniques involve breath retentions (holding your breath) which are not recommended and should not be attempted by you during this practice.</li>
            <li className="list-disc">Some breathing techniques involve muscle tension exercises, which involve squeezing and tensing various parts of the body, including in the abdomen region. This is not recommended and should not be attempted by you during this practice.</li>
          </ul>
          <p className="text-white/80 font-light leading-relaxed mt-4">
            Instead of practicing the aforementioned techniques, allow your breath to flow back to its natural rhythm and you can then continue as normal afterwards.
          </p>
          <div className="bg-[#5B9C9E]/10 border border-[#5B9C9E]/30 rounded-lg p-4 mt-4">
            <p className="text-sm text-white/90 font-light">
              <strong>Please note:</strong> Breathwork is not a suitable practice for you, if you are in your first trimester of pregnancy.
            </p>
          </div>
        </div>

        {/* Cardiovascular Problems */}
        <div className="mb-10 pb-8 border-b border-white/10">
          <h2 className="text-lg font-light text-white mb-4 uppercase tracking-wider">Cardiovascular Problems</h2>
          <p className="text-white/80 font-light leading-relaxed mb-4">
            If you have cardiovascular problems, please note:
          </p>
          <ul className="space-y-3 text-white/70 font-light pl-5">
            <li className="list-disc">It is recommended to practice breathing exercises while sitting upright comfortably on a chair or with your torso raised by propping your body up at an angle.</li>
            <li className="list-disc">Breathe 30% slower than the pace that is set during any breathing exercises. Pay attention to your body and choose the actions that feel appropriate for you.</li>
          </ul>
          <div className="bg-[#5B9C9E]/10 border border-[#5B9C9E]/30 rounded-lg p-4 mt-4">
            <p className="text-sm text-white/90 font-light">
              <strong>Please note:</strong> Breathwork is not a suitable practice for you if you have severe cardiovascular problems.
            </p>
          </div>
        </div>

        {/* Neurodiverse People */}
        <div className="mb-10 pb-8 border-b border-white/10">
          <h2 className="text-lg font-light text-white mb-4 uppercase tracking-wider">Neurodiverse People</h2>
          <p className="text-white/80 font-light leading-relaxed mb-4">
            If you are neurodiverse or have any psychological conditions like anxiety and depression, these breathing exercises can be beneficial. However, it is important to proceed at your own pace and seek professional advice if you feel uncertain about engaging with breathwork.
          </p>
          <p className="text-white/70 font-light leading-relaxed">
            There have been rare reports that people with certain mental health conditions such as anxiety and depression having experienced worsening conditions in conjunction with intensive breathing practice. People with existing mental health conditions should speak with their healthcare providers before starting a breathing practice.
          </p>
        </div>

        {/* Tips */}
        <div className="mb-10 pb-8 border-b border-white/10">
          <h2 className="text-lg font-light text-white mb-4 uppercase tracking-wider">Tips</h2>
          <ul className="text-white/70 font-light pl-5">
            <li className="list-disc">It is advisable to practice breathwork on an empty stomach.</li>
          </ul>
        </div>

        {/* Legal Disclaimer */}
        <div className="mb-10">
          <p className="text-xs text-white/50 font-light leading-relaxed mb-6">
            Ripple Effect Ltd. assumes no responsibility for injuries suffered while practicing these techniques and Ripple Effect Ltd. shall not be held liable for any damages, circumstances, conditions or injuries that may occur, directly or indirectly, from engaging in any activities or ideas presented in any Application made by Ripple Effect Ltd.
          </p>
          <p className="text-xs text-white/60 font-light leading-relaxed mb-6">
            By continuing to access and use the March app, you agree that you have read and understood the above Safety Disclosure and accept all responsibility for your physical and mental health and any resultant injury or mishap that may affect your well-being or health in any way.
          </p>
          <p className="text-xs text-white/50 font-light">
            If you have questions or comments, you may email us at{" "}
            <a href="mailto:march@marchrussell.com" className="text-[#5B9C9E] hover:underline">
              march@marchrussell.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SafetyDisclosure;
