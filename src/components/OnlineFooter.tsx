const OnlineFooter = () => {
  return (
    <div className="my-6 mt-10 border-t border-[#E6DBC7]/5 px-5 text-center md:mt-16 md:px-8 md:py-16 lg:py-20">
      <p className="mb-2 text-sm text-[#E6DBC7]/40 md:mb-3">© Embers Studio Ltd</p>
      <p className="mx-auto mb-2 max-w-xl text-xs leading-relaxed text-[#E6DBC7]/30 md:mb-3">
        All content is educational only and not a substitute for medical or psychological care.
      </p>
      <p className="text-xs text-[#E6DBC7]/30">
        For support:{" "}
        <a
          href="mailto:support@embersstudio.io"
          className="underline-offset-2 transition-colors hover:text-[#E6DBC7]/50"
        >
          support@embersstudio.io
        </a>
      </p>
    </div>
  );
};

export default OnlineFooter;
