import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ModalCloseButton } from "@/components/ui/modal-close-button";

interface LegalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TermsModal = ({ open, onOpenChange }: LegalModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent hideClose className="max-w-4xl w-[92vw] max-h-[90vh] overflow-y-auto backdrop-blur-xl bg-black/75 border border-white/30 p-0 rounded-xl">
        <ModalCloseButton onClose={() => onOpenChange(false)} size="md" />
        <div className="pt-16 md:pt-20 pb-10 px-6 md:px-10 lg:px-12">
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

          <div 
            className="max-w-[46rem] mx-auto space-y-8"
            style={{ 
              fontSize: 'clamp(0.9rem, 1vw, 1rem)',
              lineHeight: 1.7,
              color: 'rgba(230, 219, 199, 0.9)'
            }}
          >
            <p>
              Thank you for choosing March, operated by March Collective Ltd ("March", "we", "us", or "our"), registered in England and Wales.
            </p>
            
            <p>
              These Terms of Use ("Terms") govern your access to and use of our digital products and services, including our website www.marchrussell.com, our mobile and web applications (the "App"), The Studio membership, digital courses, live events, and all related content, materials, and features (collectively, the "Services").
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
              <p>Please review our Privacy Policy for information on how we process your data.</p>
            </section>

            {/* Section 2 */}
            <section className="space-y-4">
              <h2 className="font-editorial text-[#E6DBC7] text-xl font-medium">2. Paid Services</h2>
              <p>
                The Studio membership, digital courses, and ticketed events are purchased through Stripe at www.marchrussell.com.
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
                <li>You may cancel anytime through your account settings or by emailing march@marchrussell.com.</li>
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
                Refund requests may be made at march@marchrussell.com.
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

            {/* Section 3.1-3.2 */}
            <section className="space-y-4">
              <h3 className="text-[#E6DBC7] font-medium text-lg">3.1 Access to Digital Products</h3>
              <ul className="list-disc pl-6 space-y-2 text-[#E6DBC7]/80">
                <li>Some courses provide immediate access upon purchase.</li>
                <li>Pre-sale or "founder rate" courses unlock on the stated release date.</li>
                <li>You will receive an email confirmation and access link after purchase.</li>
                <li>You are responsible for maintaining access to your email and login credentials.</li>
              </ul>

              <h3 className="text-[#E6DBC7] font-medium text-lg mt-6">3.2 Refund Policy for Digital Products</h3>
              <p>
                Under UK consumer law, digital products are non-refundable once access has been delivered (including locked pre-sale courses where delivery is defined as receiving your course login).
              </p>
              <p>Refunds are only provided if the product is faulty, inaccessible due to an issue on our end, or not as described.</p>
              <p>No refunds are offered for change of mind, failure to use the product, or misunderstanding of the release date.</p>
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
              <p>By attending any event, you confirm that you are physically and emotionally able to participate, will notify the facilitator of any relevant concerns, and take full responsibility for your wellbeing throughout the session.</p>
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
              <p>March Chat must not be used for emergencies or crisis situations, diagnosis or medical decision-making, mental health treatment, or self-harm concerns.</p>
              <p className="text-[#E6DBC7]">If you are in crisis, contact local emergency services or crisis hotlines.</p>
              <p>AI-generated responses may be inaccurate or incomplete. Use personal judgment and seek professional guidance when needed.</p>
            </section>

            {/* Section 7 */}
            <section className="space-y-4">
              <h2 className="font-editorial text-[#E6DBC7] text-xl font-medium">7. Contraindications & Safety</h2>
              <p>By using the Services, you confirm that you understand breathwork may produce physical or emotional responses, will practise within your limits, will stop if you feel unwell, distressed, or uncomfortable, and have consulted a medical professional where appropriate.</p>
            </section>

            {/* Section 8 */}
            <section className="space-y-4">
              <h2 className="font-editorial text-[#E6DBC7] text-xl font-medium">8. Intellectual Property</h2>
              <p>All content, materials, video/audio sessions, trademarks, and software are owned by March Collective Ltd. You receive a personal, non-transferable, non-commercial licence to use the Services.</p>
              <p>You may not copy, modify, resell, distribute, or create derivative works without our written consent.</p>
            </section>

            {/* Section 9-14 */}
            <section className="space-y-4">
              <h2 className="font-editorial text-[#E6DBC7] text-xl font-medium">9. Availability and Maintenance</h2>
              <p>We aim to provide reliable access but cannot guarantee uninterrupted service. Temporary downtime may occur for maintenance, updates, or technical issues. If a significant fault affects paid access, we will investigate and offer appropriate remedies under consumer law.</p>
            </section>

            <section className="space-y-4">
              <h2 className="font-editorial text-[#E6DBC7] text-xl font-medium">10. Limitation of Liability</h2>
              <p>To the fullest extent permitted by law: March Collective Ltd is not liable for indirect, incidental, or consequential damages. We make no guarantees of specific outcomes or results from any practice or course. Total liability shall not exceed the amount paid by you in the preceding 12 months.</p>
              <p>Nothing in these Terms excludes liability where unlawful to do so (e.g., negligence resulting in death or injury).</p>
            </section>

            <section className="space-y-4">
              <h2 className="font-editorial text-[#E6DBC7] text-xl font-medium">11. Indemnity</h2>
              <p>You agree to indemnify and hold harmless March Collective Ltd from claims arising from your misuse of the Services, violation of these Terms, or unlawful or harmful conduct.</p>
            </section>

            <section className="space-y-4">
              <h2 className="font-editorial text-[#E6DBC7] text-xl font-medium">12. Termination</h2>
              <p>We may suspend or terminate your account if you violate these Terms or misuse content or AI features. If we discontinue the Services, you will receive a pro-rata refund for any unused subscription period.</p>
            </section>

            <section className="space-y-4">
              <h2 className="font-editorial text-[#E6DBC7] text-xl font-medium">13. Governing Law and Jurisdiction</h2>
              <p>These Terms are governed by the laws of England and Wales. Both parties submit to the non-exclusive jurisdiction of the courts of England and Wales.</p>
            </section>

            <section className="space-y-4">
              <h2 className="font-editorial text-[#E6DBC7] text-xl font-medium">14. Contact</h2>
              <p>For questions, concerns, or support:</p>
              <p className="text-[#E6DBC7]">
                📧{" "}
                <a href="mailto:march@marchrussell.com" className="underline hover:text-[#E6DBC7]/80 transition-colors">
                  march@marchrussell.com
                </a>
              </p>
              <p className="text-[#E6DBC7]">
                🌐{" "}
                <a href="https://www.marchrussell.com" className="underline hover:text-[#E6DBC7]/80 transition-colors">
                  www.marchrussell.com
                </a>
              </p>
            </section>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const PrivacyModal = ({ open, onOpenChange }: LegalModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent hideClose className="max-w-4xl w-[92vw] max-h-[90vh] overflow-y-auto backdrop-blur-xl bg-black/75 border border-white/30 p-0 rounded-xl">
        <ModalCloseButton onClose={() => onOpenChange(false)} size="md" />
        <div className="pt-16 md:pt-20 pb-10 px-6 md:px-10 lg:px-12">
          <h1 
            className="font-editorial text-[#E6DBC7] text-center mb-4 tracking-[0.01em]"
            style={{
              fontSize: 'clamp(1.8rem, 2.2vw, 2.4rem)',
              lineHeight: 1.15,
              fontWeight: 400
            }}
          >
            Privacy Policy
          </h1>
          
          <p className="text-[#E6DBC7]/60 text-center text-sm mb-12">
            Last Updated: December 2025
          </p>

          <div 
            className="max-w-[46rem] mx-auto space-y-8"
            style={{ 
              fontSize: 'clamp(0.9rem, 1vw, 1rem)',
              lineHeight: 1.7,
              color: 'rgba(230, 219, 199, 0.9)'
            }}
          >
            <p>
              March Collective Ltd ("March", "we", "us", or "our") is committed to protecting your personal information and respecting your privacy rights. This Privacy Policy explains how we collect, use, store, and safeguard your personal data when you:
            </p>
            
            <ul className="list-disc pl-6 space-y-2 text-[#E6DBC7]/80">
              <li>Visit or use our website (www.marchrussell.com)</li>
              <li>Use our mobile or web applications (the "App"), including The Studio</li>
              <li>Purchase or access digital courses, toolkits, or pre-sale products</li>
              <li>Interact with March Chat AI</li>
              <li>Attend our events or workshops</li>
              <li>Make payments through Stripe</li>
            </ul>

            <p>
              This Policy complies with UK GDPR, EU GDPR, CCPA, and other applicable international privacy laws.
            </p>

            <p>
              For any questions, contact: support@marchrussell.com
            </p>

            {/* Section 1 */}
            <section className="space-y-4">
              <h2 className="font-editorial text-[#E6DBC7] text-xl font-medium">1. What This Policy Covers</h2>
              <p>This Policy applies to all information collected through:</p>
              <ul className="list-disc pl-6 space-y-2 text-[#E6DBC7]/80">
                <li>The website</li>
                <li>The Studio membership</li>
                <li>Digital products (e.g., Anxiety Reset, Emotional Regulation Toolkit, Sleep & NSDR Pack)</li>
                <li>March Chat AI</li>
                <li>Events, workshops, and ticketed sessions</li>
                <li>Third-party services that support our platform (Lovable, Stripe, AI providers)</li>
              </ul>
              <p>It does not apply to any third-party websites linked from our Services.</p>
            </section>

            {/* Section 2 */}
            <section className="space-y-4">
              <h2 className="font-editorial text-[#E6DBC7] text-xl font-medium">2. Information We Collect</h2>
              <p>We collect personal information to provide and improve our Services.</p>
              
              <h3 className="text-[#E6DBC7] font-medium">a) Information You Provide Directly</h3>
              <ul className="list-disc pl-6 space-y-2 text-[#E6DBC7]/80">
                <li>Account details: name, email address, password</li>
                <li>Digital product purchases: course enrolments, pre-sale details</li>
                <li>Subscription and billing data: handled by Stripe (we do not store full payment details)</li>
                <li>Support requests: messages and attachments sent to us</li>
                <li>Wellness or usage preferences: favourites, saved sessions, personal goals</li>
              </ul>

              <h3 className="text-[#E6DBC7] font-medium mt-4">b) Information Collected Automatically</h3>
              <ul className="list-disc pl-6 space-y-2 text-[#E6DBC7]/80">
                <li>IP address, device type, operating system</li>
                <li>Log data (pages viewed, time on page, features used)</li>
                <li>App usage metrics</li>
                <li>Cookies and similar tracking technologies (see Section 8)</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="space-y-4">
              <h2 className="font-editorial text-[#E6DBC7] text-xl font-medium">3. March Chat AI Data Collection</h2>
              <p>When you use March Chat AI, we collect: your conversation messages, AI-generated response history, message timestamps, session engagement (e.g., practices completed, saved, skipped), and personalisation preferences.</p>
              <p>Chat data is only used to provide personalised guidance, improve response relevance, and support your experience in The Studio or digital courses.</p>
              <p>We do not use March Chat data for marketing or resale. You may delete your March Chat history at any time from your account settings.</p>
            </section>

            {/* Section 4 */}
            <section className="space-y-4">
              <h2 className="font-editorial text-[#E6DBC7] text-xl font-medium">4. AI Processing & Third-Party Providers</h2>
              <p>March Chat uses AI models hosted through trusted third-party providers (e.g., OpenAI, Google, or equivalents). Data may be securely transmitted to these processors solely for generating responses.</p>
              <p>These providers operate under data processing agreements, do not retain your data for independent purposes, and do not use your data to train public models.</p>
              <p>Lovable Labs, Inc. provides the platform that hosts our App. Stripe processes all payments as an independent data controller.</p>
            </section>

            {/* Section 5-15 condensed */}
            <section className="space-y-4">
              <h2 className="font-editorial text-[#E6DBC7] text-xl font-medium">5. How We Store & Process Data</h2>
              <p>Our platform is built and hosted on Lovable, which uses secure cloud infrastructure (e.g., Supabase, AWS, Google Cloud). Data may be transferred and stored outside the UK/EU under approved international safeguards.</p>
            </section>

            <section className="space-y-4">
              <h2 className="font-editorial text-[#E6DBC7] text-xl font-medium">6. Health & Wellness Data</h2>
              <p>We do not collect clinical medical information. Any wellness insights you log in the App are optional and processed under your consent. Do not upload medical records, diagnostic information, or sensitive biometric data.</p>
            </section>

            <section className="space-y-4">
              <h2 className="font-editorial text-[#E6DBC7] text-xl font-medium">7. Data Retention</h2>
              <p>Account data is retained while your account is active. March Chat conversations are stored up to 24 months unless deleted by you. You may delete your entire account, which permanently erases chat history and personal data except legally required records.</p>
            </section>

            <section className="space-y-4">
              <h2 className="font-editorial text-[#E6DBC7] text-xl font-medium">8. Cookies & Analytics</h2>
              <p>We use cookies and analytics tools to understand usage patterns, improve product performance, and support essential site functionality. You may disable non-essential cookies at any time.</p>
            </section>

            <section className="space-y-4">
              <h2 className="font-editorial text-[#E6DBC7] text-xl font-medium">9. International Data Transfers</h2>
              <p>If your data is transferred outside your region, we rely on UK/EU Standard Contractual Clauses, UK-US Data Bridge, or equivalent legally approved safeguards.</p>
            </section>

            <section className="space-y-4">
              <h2 className="font-editorial text-[#E6DBC7] text-xl font-medium">10. Your Rights (UK & EU GDPR)</h2>
              <p>You have the right to access, correct, delete, restrict, object to processing, withdraw consent, and request data portability. To exercise your rights, email support@marchrussell.com. We will respond within 30 days.</p>
            </section>

            <section className="space-y-4">
              <h2 className="font-editorial text-[#E6DBC7] text-xl font-medium">11. California Residents (CCPA)</h2>
              <p>You have the right to know what data is collected, request deletion, opt out of the sale of personal data (we do not sell data), and access your personal information. Requests can be emailed to support@marchrussell.com.</p>
            </section>

            <section className="space-y-4">
              <h2 className="font-editorial text-[#E6DBC7] text-xl font-medium">12. Children & Age Restrictions</h2>
              <p>Our Services are designed for individuals aged 16 and over. We do not knowingly collect personal data from anyone under 16.</p>
            </section>

            <section className="space-y-4">
              <h2 className="font-editorial text-[#E6DBC7] text-xl font-medium">13. Event & Workshop Data</h2>
              <p>When you register for an event or workshop, we process name, email, ticket information, and attendance status. Event data is retained only as long as needed for event administration and compliance.</p>
            </section>

            <section className="space-y-4">
              <h2 className="font-editorial text-[#E6DBC7] text-xl font-medium">14. Updates to This Policy</h2>
              <p>We may update this Privacy Policy to reflect new technologies, legal requirements, or service changes. For material changes, we will notify you via email or in-app.</p>
            </section>

            <section className="space-y-4">
              <h2 className="font-editorial text-[#E6DBC7] text-xl font-medium">15. Contact Us</h2>
              <p>For questions, concerns, or requests regarding this Policy or your personal data, contact:</p>
              <p className="text-[#E6DBC7]">
                📧{" "}
                <a href="mailto:support@marchrussell.com" className="underline hover:text-[#E6DBC7]/80 transition-colors">
                  support@marchrussell.com
                </a>
              </p>
              <p className="text-[#E6DBC7]">
                🌐{" "}
                <a href="https://www.marchrussell.com" className="underline hover:text-[#E6DBC7]/80 transition-colors">
                  www.marchrussell.com
                </a>
              </p>
              <p>If you are in the UK/EU, you may also complain to your local data protection authority (e.g., the UK ICO: https://ico.org.uk/).</p>
            </section>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const RefundModal = ({ open, onOpenChange }: LegalModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent hideClose className="max-w-[8xl] w-[85vw] max-h-[90vh] overflow-y-auto backdrop-blur-xl bg-black/75 border border-white/30 p-0 rounded-xl">
        <ModalCloseButton onClose={() => onOpenChange(false)} size="md" />
        <div className="pt-20 md:pt-24 pb-10 px-6 md:px-12 lg:px-16">
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

          <div 
            className="max-w-[46rem] mx-auto space-y-8"
            style={{ 
              fontSize: 'clamp(0.9rem, 1vw, 1rem)',
              lineHeight: 1.7,
              color: 'rgba(230, 219, 199, 0.9)'
            }}
          >
            <p>
              Thank you for choosing to learn and practise with March Collective Ltd ("March", "we", "us" or "our").
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
              <p>If we cancel or reschedule an event, you may choose between:</p>
              <ul className="list-disc pl-6 space-y-1 text-[#E6DBC7]/80">
                <li>A full refund, or</li>
                <li>A free transfer to a future session or equivalent offering.</li>
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
        </div>
      </DialogContent>
    </Dialog>
  );
};
