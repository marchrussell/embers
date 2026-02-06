import { NavBar } from "@/components/NavBar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";

const TermsOfService = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#1A1A1A]">
      <NavBar />
      <main className="flex-1 container mx-auto px-4 py-32 max-w-4xl">
        <Card className="p-8 md:p-12 bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl">
          <h1 
            className="font-editorial text-[#E6DBC7] text-center mb-4 tracking-[0.01em]"
            style={{
              fontSize: 'clamp(1.8rem, 2.2vw, 2.4rem)',
              lineHeight: 1.15,
              fontWeight: 400
            }}
          >
            Terms of Use
          </h1>
          <p className="text-[#E6DBC7]/60 text-center text-sm mb-12">
            Last Updated: December 2025
          </p>
          
          <div className="space-y-8 text-[#E6DBC7]/90" style={{ fontSize: 'clamp(0.9rem, 1vw, 1rem)', lineHeight: 1.7 }}>
            <p>
              Thank you for choosing March, operated by March Collective Ltd ("March", "we", "us", or "our"), registered in England and Wales.
            </p>
            
            <p>
              These Terms of Use ("Terms") govern your access to and use of our digital products and services, including our website{" "}
              <a href="https://www.marchrussell.com" className="underline hover:text-[#E6DBC7]">www.marchrussell.com</a>, 
              our mobile and web applications (the "App"), The Studio membership, digital courses, live events, and all related content, materials, and features (collectively, the "Services").
            </p>

            <p>
              By accessing or using our Services, you agree to these Terms. If you do not agree, please discontinue use immediately.
            </p>

            {/* Section 1 */}
            <section className="space-y-4">
              <h2 className="font-editorial text-[#E6DBC7] text-xl font-medium">1. About March</h2>
              <p>
                March provides breathwork education, nervous system training, and wellbeing content designed for informational and educational purposes only. Our Services, including March Chat AI, do not provide medical, psychological, or therapeutic advice.
              </p>
              <p>
                Always consult a qualified healthcare professional before beginning any new wellness, breathwork, or somatic practice. Your use of our Services is entirely at your own risk.
              </p>
            </section>

            {/* Section 1.1 */}
            <section className="space-y-4">
              <h3 className="text-[#E6DBC7] font-medium text-lg">1.1 Membership and Accounts</h3>
              <p>
                To access certain features, including The Studio and digital courses, you must create an account by providing accurate and complete information. By creating an account, you agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-[#E6DBC7]/80">
                <li>Keep your login credentials secure and confidential</li>
                <li>Maintain accurate, current information</li>
                <li>Not create fraudulent or duplicate accounts</li>
                <li>Not share your account with others</li>
                <li>Be at least 16 years old (or have parental/guardian consent)</li>
              </ul>
              <p>You are responsible for all activity under your account.</p>
              <p>
                Please review our{" "}
                <a href="/privacy-policy" className="underline hover:text-[#E6DBC7]">Privacy Policy</a>{" "}
                for information on how we process your data.
              </p>
            </section>

            {/* Section 2 */}
            <section className="space-y-4">
              <h2 className="font-editorial text-[#E6DBC7] text-xl font-medium">2. Paid Services</h2>
              <p>
                The Studio membership, digital courses, and ticketed events are purchased through Stripe at{" "}
                <a href="https://www.marchrussell.com" className="underline hover:text-[#E6DBC7]">www.marchrussell.com</a>.
              </p>
            </section>

            {/* Section 2.1 */}
            <section className="space-y-4">
              <h3 className="text-[#E6DBC7] font-medium text-lg">2.1 The Studio Membership (Subscription Service)</h3>
              <p>The Studio is offered as a monthly or annual subscription.</p>
              
              <h4 className="text-[#E6DBC7]/90 font-medium">Subscription Terms</h4>
              <ul className="list-disc pl-6 space-y-2 text-[#E6DBC7]/80">
                <li>Subscriptions renew automatically unless cancelled.</li>
                <li>Renewal charges are processed through your original payment method.</li>
                <li>You may cancel anytime through your account settings or by emailing{" "}
                  <a href="mailto:march@marchrussell.com" className="underline hover:text-[#E6DBC7]">march@marchrussell.com</a>.</li>
                <li>You will retain access until the end of your current billing period.</li>
              </ul>

              <h4 className="text-[#E6DBC7]/90 font-medium mt-4">Cooling-Off Period</h4>
              <p>
                Under UK consumer law, you have a 14-day cooling-off period for subscription purchases.
                You acknowledge that by accessing The Studio content immediately, you waive the right to withdraw during this period.
              </p>

              <h4 className="text-[#E6DBC7]/90 font-medium mt-4">Refunds</h4>
              <p>
                Refunds are only provided if the service is faulty, unavailable, or not as described.
                Refund requests may be made at{" "}
                <a href="mailto:march@marchrussell.com" className="underline hover:text-[#E6DBC7]">march@marchrussell.com</a>.
              </p>

              <h4 className="text-[#E6DBC7]/90 font-medium mt-4">Price Changes</h4>
              <p>
                We may modify pricing in the future. You will be notified in advance and may cancel before any new pricing takes effect.
              </p>
            </section>

            {/* Section 3 */}
            <section className="space-y-4">
              <h2 className="font-editorial text-[#E6DBC7] text-xl font-medium">3. Digital Products (Courses, Toolkits & Programs)</h2>
              <p>Digital courses include:</p>
              <ul className="list-disc pl-6 space-y-2 text-[#E6DBC7]/80">
                <li>The Anxiety Reset (immediate access)</li>
                <li>Emotional Regulation Toolkit (pre-sale or full-access versions)</li>
                <li>Sleep & NSDR Pack (pre-sale or full-access versions)</li>
                <li>Any future digital-only offerings</li>
              </ul>
            </section>

            {/* Section 3.1 */}
            <section className="space-y-4">
              <h3 className="text-[#E6DBC7] font-medium text-lg">3.1 Access to Digital Products</h3>
              <ul className="list-disc pl-6 space-y-2 text-[#E6DBC7]/80">
                <li>Some courses provide immediate access upon purchase.</li>
                <li>Pre-sale or "founder rate" courses unlock on the stated release date.</li>
                <li>You will receive an email confirmation and access link after purchase.</li>
                <li>You are responsible for maintaining access to your email and login credentials.</li>
              </ul>
            </section>

            {/* Section 3.2 */}
            <section className="space-y-4">
              <h3 className="text-[#E6DBC7] font-medium text-lg">3.2 Refund Policy for Digital Products</h3>
              <p>
                Under UK consumer law, digital products are non-refundable once access has been delivered (including locked pre-sale courses where delivery is defined as receiving your course login).
              </p>
              <p>Refunds are only provided if:</p>
              <ul className="list-disc pl-6 space-y-2 text-[#E6DBC7]/80">
                <li>the product is faulty,</li>
                <li>inaccessible due to an issue on our end, or</li>
                <li>not as described.</li>
              </ul>
              <p>No refunds are offered for:</p>
              <ul className="list-disc pl-6 space-y-2 text-[#E6DBC7]/80">
                <li>change of mind,</li>
                <li>failure to use the product,</li>
                <li>misunderstanding of the release date (clearly stated at checkout).</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="space-y-4">
              <h2 className="font-editorial text-[#E6DBC7] text-xl font-medium">4. Events, Workshops & Live Sessions</h2>
              <p>This includes in-person sessions, online workshops, breathwork sessions, and community events.</p>
              
              <h4 className="text-[#E6DBC7]/90 font-medium mt-4">Refund Policy for Events</h4>
              <ul className="list-disc pl-6 space-y-2 text-[#E6DBC7]/80">
                <li>Tickets are non-refundable once purchased unless the event is cancelled by us or significantly changed.</li>
                <li>You may request transfer to another date (if available) at our discretion.</li>
                <li>If an event is cancelled, you will receive a full refund or option to transfer your ticket.</li>
              </ul>

              <h4 className="text-[#E6DBC7]/90 font-medium mt-4">Event Safety</h4>
              <p>By attending any event, you confirm that you:</p>
              <ul className="list-disc pl-6 space-y-2 text-[#E6DBC7]/80">
                <li>Are physically and emotionally able to participate</li>
                <li>Will notify the facilitator of any relevant concerns</li>
                <li>Take full responsibility for your wellbeing throughout the session</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section className="space-y-4">
              <h2 className="font-editorial text-[#E6DBC7] text-xl font-medium">5. Promotions and Discounts</h2>
              <ul className="list-disc pl-6 space-y-2 text-[#E6DBC7]/80">
                <li>Promotional offers may not be combined unless stated.</li>
                <li>Discounts apply only to the first billing cycle unless specified.</li>
                <li>Early-access or founder-rate pricing for digital products does not include additional materials unless noted.</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section className="space-y-4">
              <h2 className="font-editorial text-[#E6DBC7] text-xl font-medium">6. March Chat AI – Disclaimers and Use</h2>
              <p>March Chat AI is a supportive companion, not a therapist, clinician, or medical provider.</p>
              <p>March Chat must not be used for:</p>
              <ul className="list-disc pl-6 space-y-2 text-[#E6DBC7]/80">
                <li>emergencies or crisis situations</li>
                <li>diagnosis or medical decision-making</li>
                <li>mental health treatment</li>
                <li>self-harm concerns</li>
              </ul>
              <p className="text-[#E6DBC7]">
                If you are in crisis, contact local emergency services or crisis hotlines.
              </p>
              <p>
                AI-generated responses may be inaccurate or incomplete. Use personal judgment and seek professional guidance when needed.
              </p>
            </section>

            {/* Section 7 */}
            <section className="space-y-4">
              <h2 className="font-editorial text-[#E6DBC7] text-xl font-medium">7. Contraindications & Safety</h2>
              <p>By using the Services, you confirm that you:</p>
              <ul className="list-disc pl-6 space-y-2 text-[#E6DBC7]/80">
                <li>Understand breathwork may produce physical or emotional responses</li>
                <li>Will practise within your limits</li>
                <li>Will stop if you feel unwell, distressed, or uncomfortable</li>
                <li>Have consulted a medical professional where appropriate</li>
              </ul>
            </section>

            {/* Section 8 */}
            <section className="space-y-4">
              <h2 className="font-editorial text-[#E6DBC7] text-xl font-medium">8. Intellectual Property</h2>
              <p>
                All content, materials, video/audio sessions, trademarks, and software are owned by March Collective Ltd.
                You receive a personal, non-transferable, non-commercial licence to use the Services.
              </p>
              <p>
                You may not copy, modify, resell, distribute, or create derivative works without our written consent.
              </p>
            </section>

            {/* Section 9 */}
            <section className="space-y-4">
              <h2 className="font-editorial text-[#E6DBC7] text-xl font-medium">9. Availability and Maintenance</h2>
              <p>
                We aim to provide reliable access but cannot guarantee uninterrupted service.
                Temporary downtime may occur for maintenance, updates, or technical issues.
                If a significant fault affects paid access, we will investigate and offer appropriate remedies under consumer law.
              </p>
            </section>

            {/* Section 10 */}
            <section className="space-y-4">
              <h2 className="font-editorial text-[#E6DBC7] text-xl font-medium">10. Limitation of Liability</h2>
              <p>To the fullest extent permitted by law:</p>
              <ul className="list-disc pl-6 space-y-2 text-[#E6DBC7]/80">
                <li>March Collective Ltd is not liable for indirect, incidental, or consequential damages.</li>
                <li>We make no guarantees of specific outcomes or results from any practice or course.</li>
                <li>Total liability shall not exceed the amount paid by you in the preceding 12 months.</li>
              </ul>
              <p>
                Nothing in these Terms excludes liability where unlawful to do so (e.g., negligence resulting in death or injury).
              </p>
            </section>

            {/* Section 11 */}
            <section className="space-y-4">
              <h2 className="font-editorial text-[#E6DBC7] text-xl font-medium">11. Indemnity</h2>
              <p>You agree to indemnify and hold harmless March Collective Ltd from claims arising from:</p>
              <ul className="list-disc pl-6 space-y-2 text-[#E6DBC7]/80">
                <li>Your misuse of the Services</li>
                <li>Violation of these Terms</li>
                <li>Unlawful or harmful conduct</li>
              </ul>
            </section>

            {/* Section 12 */}
            <section className="space-y-4">
              <h2 className="font-editorial text-[#E6DBC7] text-xl font-medium">12. Termination</h2>
              <p>
                We may suspend or terminate your account if you violate these Terms or misuse content or AI features.
                If we discontinue the Services, you will receive a pro-rata refund for any unused subscription period.
              </p>
            </section>

            {/* Section 13 */}
            <section className="space-y-4">
              <h2 className="font-editorial text-[#E6DBC7] text-xl font-medium">13. Governing Law and Jurisdiction</h2>
              <p>
                These Terms are governed by the laws of England and Wales.
                Both parties submit to the non-exclusive jurisdiction of the courts of England and Wales.
              </p>
            </section>

            {/* Section 14 */}
            <section className="space-y-4">
              <h2 className="font-editorial text-[#E6DBC7] text-xl font-medium">14. Contact</h2>
              <p>For questions, concerns, or support:</p>
              <p className="text-[#E6DBC7]">
                📧{" "}
                <a href="mailto:march@marchrussell.com" className="underline hover:text-[#E6DBC7]/80">
                  march@marchrussell.com
                </a>
              </p>
              <p className="text-[#E6DBC7]">
                🌐{" "}
                <a href="https://www.marchrussell.com" className="underline hover:text-[#E6DBC7]/80">
                  www.marchrussell.com
                </a>
              </p>
            </section>
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;
