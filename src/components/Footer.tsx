import { ArrowRight } from "lucide-react";
import { memo, Suspense, useCallback, useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";

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
        .from("newsletter_subscribers")
        .insert({ email, active: true });

      if (error) {
        if (error.code === "23505") {
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
        className="relative flex flex-col bg-[#E6E0D4] pb-4 pt-6 font-unica md:min-h-[240px] md:pb-10 md:pt-8 lg:min-h-[280px] lg:pb-12 lg:pt-10"
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom, 1rem))" }}
      >
        {/* Extend cream background below footer to cover overscroll on mobile */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-[100px] translate-y-full bg-[#E6E0D4] md:hidden"
          aria-hidden="true"
        />
        <div className="flex flex-1 flex-col justify-between px-5 md:px-14 lg:px-20">
          {/* Mobile: Categorized footer layout */}
          <div className="flex flex-col md:hidden">
            {/* Connect & Legal Sections - Side by Side */}
            <div className="grid grid-cols-2 gap-x-6 py-4">
              {/* Connect Section */}
              <div className="flex flex-col gap-5">
                <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#1A1A1A]/60">
                  Connect
                </span>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setShowContactModal(true)}
                    className="flex min-h-[44px] items-center gap-2 text-[13px] tracking-[0.02em] text-[#1A1A1A] transition-opacity duration-200 hover:opacity-60"
                  >
                    Contact <ArrowRight className="h-5 w-5" />
                  </button>
                  <a
                    href="https://www.instagram.com/embers.io"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-[44px] items-center gap-2 text-[13px] tracking-[0.02em] text-[#1A1A1A] transition-opacity duration-200 hover:opacity-60"
                  >
                    Instagram <ArrowRight className="h-5 w-5" />
                  </a>
                </div>
              </div>

              {/* Legal Section */}
              <div className="flex flex-col gap-5">
                <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#1A1A1A]/60">
                  Legal
                </span>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setShowPrivacyModal(true)}
                    className="flex min-h-[44px] items-center gap-2 text-[13px] tracking-[0.02em] text-[#1A1A1A] transition-opacity duration-200 hover:opacity-60"
                  >
                    Privacy <ArrowRight className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setShowTermsModal(true)}
                    className="flex min-h-[44px] items-center gap-2 text-[13px] tracking-[0.02em] text-[#1A1A1A] transition-opacity duration-200 hover:opacity-60"
                  >
                    Terms <ArrowRight className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setShowRefundModal(true)}
                    className="flex min-h-[44px] items-center gap-2 text-[13px] tracking-[0.02em] text-[#1A1A1A] transition-opacity duration-200 hover:opacity-60"
                  >
                    Refunds <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Newsletter Section */}
            <div className="pt-4">
              <form onSubmit={handleNewsletterSubmit} className="flex-1">
                <div className="flex w-full items-center overflow-hidden rounded-full border border-[#1A1A1A]/80 bg-transparent">
                  <input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="min-h-[44px] min-w-0 flex-1 bg-transparent px-5 py-3 text-[13px] tracking-[0.02em] text-[#1A1A1A] outline-none placeholder:text-[#1A1A1A]/50"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex min-h-[44px] items-center gap-2 pl-3 pr-5 text-[11px] font-medium uppercase tracking-[0.06em] text-[#1A1A1A] transition-colors duration-200 hover:text-[#1A1A1A]/70 disabled:opacity-40"
                  >
                    Join <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Tablet+: Original horizontal layout */}
          <div className="hidden md:flex md:flex-wrap md:items-center md:justify-start md:gap-x-10 lg:gap-x-12">
            <a
              href="https://www.marchrussell.com/explore"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.06em] text-[#1A1A1A] transition-opacity duration-200 hover:opacity-60"
            >
              Explore <ArrowRight className="h-5 w-5" />
            </a>
            <button
              onClick={() => setShowContactModal(true)}
              className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.06em] text-[#1A1A1A] transition-opacity duration-200 hover:opacity-60"
            >
              Contact <ArrowRight className="h-5 w-5" />
            </button>
            <a
              href="https://instagram.com/embers.io"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.06em] text-[#1A1A1A] transition-opacity duration-200 hover:opacity-60"
            >
              Instagram <ArrowRight className="h-5 w-5" />
            </a>
          </div>

          {/* Tablet+: Bottom Section - Newsletter and Legal Links */}
          <div className="mt-auto hidden flex-col gap-6 md:flex lg:flex-row lg:items-center lg:justify-between">
            {/* Newsletter Signup */}
            <form onSubmit={handleNewsletterSubmit} className="flex w-full items-center lg:w-auto">
              <div className="flex w-full max-w-[480px] items-center overflow-hidden rounded-full border border-[#1A1A1A]/80 bg-transparent transition-colors duration-300 hover:border-[#1A1A1A]">
                <span className="whitespace-nowrap border-r border-[#1A1A1A]/60 pl-7 pr-5 text-[11px] font-medium uppercase tracking-[0.08em] text-[#1A1A1A] md:text-[12px]">
                  Get Updates
                </span>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="min-w-0 flex-1 bg-transparent px-5 py-3.5 text-[11px] tracking-[0.02em] text-[#1A1A1A] outline-none placeholder:text-[#1A1A1A]/40 md:text-[12px]"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-3 whitespace-nowrap pl-4 pr-7 text-[11px] font-medium uppercase tracking-[0.08em] text-[#1A1A1A] transition-colors duration-200 hover:text-[#1A1A1A]/70 disabled:opacity-40 md:text-[12px]"
                >
                  Join Us <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </form>

            {/* Legal Links */}
            <div className="flex flex-wrap items-center justify-end gap-x-10">
              <button
                onClick={() => setShowPrivacyModal(true)}
                className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.06em] text-[#1A1A1A] transition-opacity duration-200 hover:opacity-60"
              >
                Privacy Policy <ArrowRight className="h-5 w-5" />
              </button>
              <button
                onClick={() => setShowTermsModal(true)}
                className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.06em] text-[#1A1A1A] transition-opacity duration-200 hover:opacity-60"
              >
                Terms of Service <ArrowRight className="h-5 w-5" />
              </button>
              <button
                onClick={() => setShowRefundModal(true)}
                className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.06em] text-[#1A1A1A] transition-opacity duration-200 hover:opacity-60"
              >
                Refund Policy <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
});

Footer.displayName = "Footer";

export default Footer;
