import { supabase } from "@/integrations/supabase/client";
import { ArrowRight } from "lucide-react";
import { memo, Suspense, useCallback, useState } from "react";
import { toast } from "sonner";
import { PrivacyModal, RefundModal, TermsModal } from "./LegalModals";
import { ContactFormModal } from "./modals/LazyModals";

export const Footer = memo(() => {
  const [showContactModal, setShowContactModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContactModalChange = useCallback((open: boolean) => {
    setShowContactModal(open);
  }, []);

  const handleTermsModalChange = useCallback((open: boolean) => {
    setShowTermsModal(open);
  }, []);

  const handlePrivacyModalChange = useCallback((open: boolean) => {
    setShowPrivacyModal(open);
  }, []);

  const handleRefundModalChange = useCallback((open: boolean) => {
    setShowRefundModal(open);
  }, []);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({ email, active: true });
      
      if (error) {
        if (error.code === '23505') {
          toast.success("You're already subscribed!");
        } else {
          throw error;
        }
      } else {
        toast.success("Thanks for subscribing!");
      }
      setEmail("");
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

    return (
    <>
      <Suspense fallback={null}>
        <ContactFormModal open={showContactModal} onOpenChange={handleContactModalChange} />
      </Suspense>
      <TermsModal open={showTermsModal} onOpenChange={handleTermsModalChange} />
      <PrivacyModal open={showPrivacyModal} onOpenChange={handlePrivacyModalChange} />
      <RefundModal open={showRefundModal} onOpenChange={handleRefundModalChange} />

      <footer
        className="relative bg-[#E6E0D4] pt-6 pb-4 md:pt-8 md:pb-10 lg:pt-10 lg:pb-12 font-unica md:min-h-[240px] lg:min-h-[280px] flex flex-col"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))' }}
      >
        {/* Extend cream background below footer to cover overscroll on mobile */}
        <div
          className="absolute left-0 right-0 bottom-0 h-[100px] bg-[#E6E0D4] translate-y-full pointer-events-none md:hidden"
          aria-hidden="true"
        />
        <div className="px-5 md:px-14 lg:px-20 flex flex-col justify-between flex-1">
          {/* Mobile: Categorized footer layout */}
          <div className="md:hidden flex flex-col">
            {/* Connect & Legal Sections - Side by Side */}
            <div className="grid grid-cols-2 gap-x-6 py-4">
              {/* Connect Section */}
              <div className="flex flex-col gap-5">
                <span className="text-[#1A1A1A]/60 text-[11px] uppercase tracking-[0.08em] font-medium">
                  Connect
                </span>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setShowContactModal(true)}
                    className="text-[#1A1A1A] text-[13px] tracking-[0.02em] hover:opacity-60 transition-opacity duration-200 flex items-center gap-2 min-h-[44px]"
                  >
                    Contact <ArrowRight className="w-5 h-5" />
                  </button>
                  <a
                    href="https://instagram.com/marchrussell"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#1A1A1A] text-[13px] tracking-[0.02em] hover:opacity-60 transition-opacity duration-200 flex items-center gap-2 min-h-[44px]"
                  >
                    Instagram <ArrowRight className="w-5 h-5" />
                  </a>
                </div>
              </div>

              {/* Legal Section */}
              <div className="flex flex-col gap-5">
                <span className="text-[#1A1A1A]/60 text-[11px] uppercase tracking-[0.08em] font-medium">
                  Legal
                </span>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setShowPrivacyModal(true)}
                    className="text-[#1A1A1A] text-[13px] tracking-[0.02em] hover:opacity-60 transition-opacity duration-200 flex items-center gap-2 min-h-[44px]"
                  >
                    Privacy <ArrowRight className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowTermsModal(true)}
                    className="text-[#1A1A1A] text-[13px] tracking-[0.02em] hover:opacity-60 transition-opacity duration-200 flex items-center gap-2 min-h-[44px]"
                  >
                    Terms <ArrowRight className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowRefundModal(true)}
                    className="text-[#1A1A1A] text-[13px] tracking-[0.02em] hover:opacity-60 transition-opacity duration-200 flex items-center gap-2 min-h-[44px]"
                  >
                    Refunds <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Newsletter Section */}
            <div className="pt-4">
              <form onSubmit={handleNewsletterSubmit} className="flex-1">
                <div className="flex items-center border border-[#1A1A1A]/80 rounded-full overflow-hidden w-full bg-transparent">
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-transparent text-[#1A1A1A] text-[13px] tracking-[0.02em] placeholder:text-[#1A1A1A]/50 px-5 py-3 outline-none flex-1 min-w-0 min-h-[44px]"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="text-[#1A1A1A] text-[11px] uppercase tracking-[0.06em] font-medium pr-5 pl-3 flex items-center gap-2 hover:text-[#1A1A1A]/70 transition-colors duration-200 disabled:opacity-40 min-h-[44px]"
                  >
                    Join <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Tablet+: Original horizontal layout */}
          <div className="hidden md:flex md:flex-wrap md:items-center md:gap-x-10 lg:gap-x-12 md:justify-start">
            <a
              href="https://www.marchrussell.com/explore"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1A1A1A] text-[11px] uppercase tracking-[0.06em] font-medium hover:opacity-60 transition-opacity duration-200 flex items-center gap-2"
            >
              Explore <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="https://www.marchrussell.com/courses"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1A1A1A] text-[11px] uppercase tracking-[0.06em] font-medium hover:opacity-60 transition-opacity duration-200 flex items-center gap-2"
            >
              Courses <ArrowRight className="w-5 h-5" />
            </a>
            <a
              href="/experiences"
              className="text-[#1A1A1A] text-[11px] uppercase tracking-[0.06em] font-medium hover:opacity-60 transition-opacity duration-200 flex items-center gap-2"
            >
              Experiences <ArrowRight className="w-5 h-5" />
            </a>
            <button
              onClick={() => setShowContactModal(true)}
              className="text-[#1A1A1A] text-[11px] uppercase tracking-[0.06em] font-medium hover:opacity-60 transition-opacity duration-200 flex items-center gap-2"
            >
              Contact <ArrowRight className="w-5 h-5" />
            </button>
            <a
              href="https://instagram.com/marchrussell"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1A1A1A] text-[11px] uppercase tracking-[0.06em] font-medium hover:opacity-60 transition-opacity duration-200 flex items-center gap-2"
            >
              Instagram <ArrowRight className="w-5 h-5" />
            </a>
          </div>

          {/* Tablet+: Bottom Section - Newsletter and Legal Links */}
          <div className="hidden md:flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mt-auto">
            {/* Newsletter Signup */}
            <form onSubmit={handleNewsletterSubmit} className="flex items-center w-full lg:w-auto">
              <div className="flex items-center border border-[#1A1A1A]/80 rounded-full overflow-hidden w-full max-w-[480px] bg-transparent hover:border-[#1A1A1A] transition-colors duration-300">
                <span className="text-[#1A1A1A] text-[11px] md:text-[12px] uppercase tracking-[0.08em] font-medium pl-7 pr-5 whitespace-nowrap border-r border-[#1A1A1A]/60">
                  Get Updates
                </span>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent text-[#1A1A1A] text-[11px] md:text-[12px] tracking-[0.02em] placeholder:text-[#1A1A1A]/40 px-5 py-3.5 outline-none flex-1 min-w-0"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="text-[#1A1A1A] text-[11px] md:text-[12px] uppercase tracking-[0.08em] font-medium pr-7 pl-4 flex items-center gap-3 hover:text-[#1A1A1A]/70 transition-colors duration-200 disabled:opacity-40 whitespace-nowrap"
                >
                  Join Us <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </form>

            {/* Legal Links */}
            <div className="flex flex-wrap justify-end items-center gap-x-10">
              <button
                onClick={() => setShowPrivacyModal(true)}
                className="text-[#1A1A1A] text-[11px] uppercase tracking-[0.06em] font-medium hover:opacity-60 transition-opacity duration-200 flex items-center gap-2"
              >
                Privacy Policy <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowTermsModal(true)}
                className="text-[#1A1A1A] text-[11px] uppercase tracking-[0.06em] font-medium hover:opacity-60 transition-opacity duration-200 flex items-center gap-2"
              >
                Terms of Service <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowRefundModal(true)}
                className="text-[#1A1A1A] text-[11px] uppercase tracking-[0.06em] font-medium hover:opacity-60 transition-opacity duration-200 flex items-center gap-2"
              >
                Refund Policy <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
});

Footer.displayName = 'Footer';

export default Footer;
