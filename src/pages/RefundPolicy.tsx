import { memo } from "react";
import { NavBar } from "@/components/NavBar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";

const RefundPolicy = memo(() => {
  return (
    <div className="min-h-screen flex flex-col bg-[#1A1A1A]">
      <NavBar />

      <main className="flex-1 pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <Card className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-8 md:p-12">
            <h1 
              className="font-editorial text-[#E6DBC7] text-center mb-4 tracking-[0.01em]"
              style={{
                fontSize: 'clamp(1.8rem, 2.2vw, 2.4rem)',
                lineHeight: 1.15,
                fontWeight: 400
              }}
            >
              Refund Policy
            </h1>
            
            <p className="text-[#E6DBC7]/60 text-center text-sm mb-12">
              Last Updated: December 2025
            </p>

            <div className="space-y-8 text-[#E6DBC7]/90" style={{ fontSize: 'clamp(0.9rem, 1vw, 1rem)', lineHeight: 1.7 }}>
              <p>
                Thank you for choosing to learn and practise with Ripple Effect Ltd ("March", "we", "us" or "our").
                This Refund Policy outlines your rights and our responsibilities regarding purchases of digital courses, memberships, workshops, and live events.
              </p>
              
              <p>
                By making a purchase, you agree to the terms below, which comply with UK consumer protection laws.
              </p>

              {/* Section 1 */}
              <section className="space-y-4">
                <h2 className="font-editorial text-[#E6DBC7] text-xl font-medium">
                  1. Digital Courses (Instant Access + Pre-Release / Founder Pricing)
                </h2>
                <p className="text-[#E6DBC7]/70">
                  This includes all self-guided short courses, toolkits, resets, and multi-day programmes.
                </p>
                
                <h3 className="text-[#E6DBC7] font-medium mt-6">1.1 Refund Eligibility</h3>
                <p>Refunds for digital courses are only provided if:</p>
                <ul className="list-disc pl-6 space-y-1 text-[#E6DBC7]/80">
                  <li>The course is faulty,</li>
                  <li>The course is unavailable, or</li>
                  <li>The course is not as described.</li>
                </ul>
                <p className="mt-4">This applies to both:</p>
                <ul className="list-disc pl-6 space-y-1 text-[#E6DBC7]/80">
                  <li>Instant-access courses, and</li>
                  <li>Pre-release / founder-rate courses that unlock at a later date.</li>
                </ul>

                <h3 className="text-[#E6DBC7] font-medium mt-6">1.2 No Refund for Change of Mind</h3>
                <p>
                  Because digital content is delivered (or reserved) instantly and cannot be "returned," refunds cannot be issued for:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-[#E6DBC7]/80">
                  <li>Change of mind</li>
                  <li>Personal circumstances</li>
                  <li>Non-use</li>
                  <li>Misunderstanding of the practice requirements</li>
                </ul>

                <h3 className="text-[#E6DBC7] font-medium mt-6">1.3 Pre-Release Purchases</h3>
                <p>For courses that unlock on a future date:</p>
                <ul className="list-disc pl-6 space-y-1 text-[#E6DBC7]/80">
                  <li>Your purchase guarantees your place and discounted price.</li>
                  <li>You gain access on the advertised release date.</li>
                  <li>Refunds apply only if the course is not delivered as described, is unavailable, or contains a fault.</li>
                </ul>
              </section>

              {/* Section 2 */}
              <section className="space-y-4">
                <h2 className="font-editorial text-[#E6DBC7] text-xl font-medium">
                  2. Live Workshops, Events & Online Sessions
                </h2>
                <p className="text-[#E6DBC7]/70">
                  This includes breathwork workshops, classes, retreats, and any scheduled live group experience.
                </p>

                <h3 className="text-[#E6DBC7] font-medium mt-6">2.1 Cancellations & Refunds (Customer-Initiated)</h3>
                <p>Because event spaces are limited and preparation is required:</p>
                <ul className="list-disc pl-6 space-y-1 text-[#E6DBC7]/80">
                  <li>Tickets are non-refundable once purchased.</li>
                  <li>Transfers to another date may be offered at our discretion if notice is given at least 72 hours before the event and if space allows.</li>
                  <li>If no alternative dates exist, the ticket remains non-refundable.</li>
                </ul>

                <h3 className="text-[#E6DBC7] font-medium mt-6">2.2 Cancellations by March</h3>
                <p>If we cancel or reschedule an event:</p>
                <ul className="list-disc pl-6 space-y-1 text-[#E6DBC7]/80">
                  <li>You may choose between:</li>
                  <ul className="list-disc pl-6 space-y-1">
                    <li>A full refund, or</li>
                    <li>A free transfer to a future session or equivalent offering.</li>
                  </ul>
                </ul>

                <h3 className="text-[#E6DBC7] font-medium mt-6">2.3 Late Arrival / No-Show</h3>
                <p>No refunds or credits are issued for missed sessions.</p>
              </section>

              {/* Section 3 */}
              <section className="space-y-4">
                <h2 className="font-editorial text-[#E6DBC7] text-xl font-medium">
                  3. Memberships (The Studio)
                </h2>
                <p>Covered under the Terms of Use, but summarised here for clarity:</p>
                <ul className="list-disc pl-6 space-y-1 text-[#E6DBC7]/80">
                  <li>You have a 14-day cooling-off period, unless you access digital content immediately.</li>
                  <li>Once access begins, you waive the right to cancel under the cooling-off period.</li>
                  <li>Refunds after this period only apply if the service is faulty or unavailable.</li>
                </ul>
              </section>

              {/* Section 4 */}
              <section className="space-y-4">
                <h2 className="font-editorial text-[#E6DBC7] text-xl font-medium">
                  4. Faulty or Unavailable Content
                </h2>
                <p>If a digital course or membership feature is genuinely faulty or inaccessible, we will:</p>
                <ul className="list-disc pl-6 space-y-1 text-[#E6DBC7]/80">
                  <li>Attempt to repair the issue, or</li>
                  <li>Provide access in another suitable form, or</li>
                  <li>Offer a refund if the issue cannot be resolved within a reasonable time.</li>
                </ul>
                <p className="mt-4 text-[#E6DBC7]/70">
                  This follows UK Consumer Rights Act guidelines.
                </p>
              </section>

              {/* Section 5 */}
              <section className="space-y-4">
                <h2 className="font-editorial text-[#E6DBC7] text-xl font-medium">
                  5. How to Request Support or a Refund
                </h2>
                <p>Please contact:</p>
                <p className="text-[#E6DBC7]">
                  📧{" "}
                  <a 
                    href="mailto:march@marchrussell.com" 
                    className="underline hover:text-[#E6DBC7]/80 transition-colors"
                  >
                    march@marchrussell.com
                  </a>
                </p>
                <p className="mt-4">Include:</p>
                <ul className="list-disc pl-6 space-y-1 text-[#E6DBC7]/80">
                  <li>Your full name</li>
                  <li>The email used for purchase</li>
                  <li>Order confirmation or receipt</li>
                  <li>A brief description of the issue</li>
                </ul>
                <p className="mt-4 text-[#E6DBC7]/70">
                  We aim to respond within 3–5 business days.
                </p>
              </section>

              {/* Section 6 */}
              <section className="space-y-4">
                <h2 className="font-editorial text-[#E6DBC7] text-xl font-medium">
                  6. Additional Notes
                </h2>
                <ul className="list-disc pl-6 space-y-1 text-[#E6DBC7]/80">
                  <li>Refunds can only be issued to the original payment method.</li>
                  <li>We reserve the right to refuse refund claims that fall outside the terms stated above.</li>
                  <li>Your statutory rights under UK consumer law are not affected.</li>
                </ul>
              </section>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
});

RefundPolicy.displayName = 'RefundPolicy';

export default RefundPolicy;
