import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

import { SafetyInformationContent } from "@/components/SafetyInformationContent";

const SafetyDisclosure = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-6 pb-10 pt-6">
        <Link to="/online/about" className="mb-12 inline-block" aria-label="Back to About Page">
          <div className="group flex cursor-pointer items-center gap-3">
            <ArrowLeft className="h-6 w-6 text-white transition-colors group-hover:text-[#E6DBC7]" />
          </div>
        </Link>

        <h1 className="mb-8 text-3xl font-normal text-[#E6DBC7]">Safety Information</h1>
        <p className="mb-8 text-base font-light text-[#E6DBC7]/70">
          Please read all of the information below before continuing.
        </p>

        <SafetyInformationContent />
      </div>
    </div>
  );
};

export default SafetyDisclosure;
