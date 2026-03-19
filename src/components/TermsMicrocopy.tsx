import { memo } from "react";

export const TermsMicrocopy = memo(() => {
  return (
    <div className="bg-black px-6 py-12 text-center">
      <div className="mx-auto max-w-lg space-y-3">
        <p className="text-xs text-[#E6DBC7]/50 md:text-sm">© Embers Studio Ltd</p>
        <p className="text-xs leading-relaxed text-[#E6DBC7]/40">
          All content is educational only and not a substitute for medical or psychological care.
        </p>
        <p className="text-xs text-[#E6DBC7]/40">
          For support:{" "}
          <a
            href="mailto:support@embersstudio.io"
            className="underline transition-colors hover:text-[#E6DBC7]/60"
          >
            support@embersstudio.io
          </a>
        </p>
      </div>
    </div>
  );
});

TermsMicrocopy.displayName = "TermsMicrocopy";

export default TermsMicrocopy;
