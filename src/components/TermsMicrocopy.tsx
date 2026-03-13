import { memo } from "react";

export const TermsMicrocopy = memo(() => {
  return (
    <div className="text-center py-12 px-6 bg-black">
      <div className="max-w-lg mx-auto space-y-3">
        <p className="text-[#E6DBC7]/50 text-xs md:text-sm">
          © Embers Studio Ltd
        </p>
        <p className="text-[#E6DBC7]/40 text-xs leading-relaxed">
          All content is educational only and not a substitute for medical or psychological care.
        </p>
        <p className="text-[#E6DBC7]/40 text-xs">
          For support:{" "}
          <a 
            href="mailto:support@embersstudio.io"
            className="underline hover:text-[#E6DBC7]/60 transition-colors"
          >
            support@embersstudio.io
          </a>
        </p>
      </div>
    </div>
  );
});

TermsMicrocopy.displayName = 'TermsMicrocopy';

export default TermsMicrocopy;
