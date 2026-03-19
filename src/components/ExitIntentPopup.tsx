import { X } from "lucide-react";
import { useEffect, useState } from "react";

interface ExitIntentPopupProps {
  onSubscribe: () => void;
}

export const ExitIntentPopup = ({ onSubscribe }: ExitIntentPopupProps) => {
  const [showPopup, setShowPopup] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if popup has been shown in this session
    const popupShown = sessionStorage.getItem("exitPopupShown");
    if (popupShown) {
      setHasShown(true);
      return;
    }

    // Show after 30 seconds of being on the page (engagement-based)
    const engagementTimer = setTimeout(() => {
      if (!hasShown) {
        setShowPopup(true);
        setHasShown(true);
        sessionStorage.setItem("exitPopupShown", "true");
        setTimeout(() => setIsVisible(true), 50);
      }
    }, 30000); // 30 seconds

    // Also keep exit intent as backup
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasShown) {
        setShowPopup(true);
        setHasShown(true);
        sessionStorage.setItem("exitPopupShown", "true");
        setTimeout(() => setIsVisible(true), 50);
      }
    };

    const exitIntentTimer = setTimeout(() => {
      document.addEventListener("mouseleave", handleMouseLeave);
    }, 5000);

    return () => {
      clearTimeout(engagementTimer);
      clearTimeout(exitIntentTimer);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [hasShown]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => setShowPopup(false), 300);
  };

  const handleSubscribe = () => {
    handleClose();
    onSubscribe();
  };

  if (!showPopup) return null;

  return (
    <>
      {/* Mobile/Tablet: backdrop overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isVisible ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={handleClose}
      />

      <div
        className={`fixed bottom-0 left-0 right-0 z-50 mx-auto w-[calc(100%-2rem)] max-w-[440px] transition-[transform,opacity] duration-700 ease-out md:bottom-6 md:left-auto md:right-6 md:w-auto md:max-w-[540px] lg:bottom-8 lg:right-8 lg:max-w-[620px] ${
          isVisible
            ? "translate-y-0 opacity-100 md:translate-x-0"
            : "translate-y-full opacity-0 md:translate-x-full md:translate-y-0"
        }`}
      >
        <div className="relative overflow-hidden rounded-t-2xl bg-[#E6DBC7] shadow-[0_-10px_40px_rgba(0,0,0,0.2)] md:rounded-2xl md:shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
          {/* Subtle texture overlay */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#E6DBC7] via-[#E6DBC7]/95 to-[#D4C4AA]/90" />

          {/* Close button - better positioning for mobile */}
          <button
            onClick={handleClose}
            className="group absolute right-3 top-3 z-10 rounded-full p-2 transition-colors hover:bg-background/10 active:bg-background/20 sm:right-4 sm:top-4 sm:p-1.5 md:right-5 md:top-5"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-background/60 transition-colors group-hover:text-background/80 sm:h-4 sm:w-4" />
          </button>

          <div className="relative space-y-6 p-8 pb-10 sm:space-y-7 sm:p-10 sm:pb-12 md:space-y-8 md:p-12 md:pb-14">
            {/* Title */}
            {/* <div className="pr-8 sm:pr-6">
              <h3 className="font-editorial text-3xl sm:text-4xl lg:text-5xl xl:text-6xl text-background leading-tight">
                Your first 7 days are on us
              </h3>
            </div> */}

            {/* Description */}
            <p className="text-base font-light leading-relaxed text-background/70 sm:text-lg md:text-xl">
              Get full access to guided sessions and on-demand practices to help you feel calmer,
              clearer, and more connected
            </p>

            {/* CTA Button */}
            {/* <div className="relative pt-2 sm:pt-3">
              <Button
                onClick={handleSubscribe}
                className="relative w-full bg-background hover:bg-background/90 active:bg-background/80 text-[#E6DBC7] rounded-full font-light text-base sm:text-lg md:text-xl py-6 sm:py-7 md:py-8 transition-[background-color,box-shadow,transform] shadow-[0_4px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.2)] active:scale-[0.98] md:hover:scale-[1.02]"
              >
                Begin Free Trial
              </Button>
            </div> */}
          </div>
        </div>
      </div>
    </>
  );
};
