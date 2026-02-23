const OnlineFooter = () => {
  return (
    <div className="text-center my-6 md:py-16 lg:py-20 mt-10 md:mt-16 border-t border-[#E6DBC7]/5 px-5 md:px-8 ">
      <p className="text-[#E6DBC7]/40 text-sm mb-2 md:mb-3">
        © Ripple Effect Ltd
      </p>
      <p className="text-[#E6DBC7]/30 text-xs mb-2 md:mb-3 max-w-xl mx-auto leading-relaxed">
        All content is educational only and not a substitute for medical or psychological care.
      </p>
      <p className="text-[#E6DBC7]/30 text-xs">
        For support: <a href="mailto:support@embers-space.com" className="hover:text-[#E6DBC7]/50 transition-colors underline-offset-2">support@embers-space.com</a>
      </p>
    </div>
  );
};

export default OnlineFooter;
