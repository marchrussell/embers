import { NavBar } from "@/components/NavBar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";

const PrivacyPolicy = () => {
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
            Privacy Policy
          </h1>
          <p className="text-[#E6DBC7]/60 text-center text-sm mb-12">
            Last Updated: December 2025
          </p>
          
          <div className="space-y-8 text-[#E6DBC7]/90" style={{ fontSize: 'clamp(0.9rem, 1vw, 1rem)', lineHeight: 1.7 }}>
            <p>
              March Collective Ltd ("March", "we", "us", or "our") is committed to protecting your personal information and respecting your privacy rights. This Privacy Policy explains how we collect, use, store, and safeguard your personal data when you:
            </p>
            
            <ul className="list-disc pl-6 space-y-2 text-[#E6DBC7]/80">
              <li>Visit or use our website (<a href="https://www.marchrussell.com" className="underline hover:text-[#E6DBC7]">www.marchrussell.com</a>)</li>
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
              For any questions, contact:{" "}
              <a href="mailto:support@marchrussell.com" className="underline hover:text-[#E6DBC7]">support@marchrussell.com</a>
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
              
              <h3 className="text-[#E6DBC7] font-medium text-lg">a) Information You Provide Directly</h3>
              <ul className="list-disc pl-6 space-y-2 text-[#E6DBC7]/80">
                <li>Account details: name, email address, password</li>
                <li>Digital product purchases: course enrolments, pre-sale details</li>
                <li>Subscription and billing data: handled by Stripe (we do not store full payment details)</li>
                <li>Support requests: messages and attachments sent to us</li>
                <li>Wellness or usage preferences: favourites, saved sessions, personal goals</li>
              </ul>

              <h3 className="text-[#E6DBC7] font-medium text-lg mt-4">b) Information Collected Automatically</h3>
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
              <p>When you use March Chat AI, we collect:</p>
              <ul className="list-disc pl-6 space-y-2 text-[#E6DBC7]/80">
                <li>Your conversation messages</li>
                <li>AI-generated response history</li>
                <li>Message timestamps</li>
                <li>Session engagement (e.g., practices completed, saved, skipped)</li>
                <li>Personalisation preferences</li>
              </ul>

              <h4 className="text-[#E6DBC7]/90 font-medium mt-4">How Chat Data Is Used</h4>
              <p>Only to:</p>
              <ul className="list-disc pl-6 space-y-2 text-[#E6DBC7]/80">
                <li>Provide personalised guidance</li>
                <li>Improve response relevance</li>
                <li>Support your experience in The Studio or digital courses</li>
              </ul>
              <p>We do not use March Chat data for marketing or resale.</p>
              <p>You may delete your March Chat history at any time from your account settings.</p>
            </section>

            {/* Section 4 */}
            <section className="space-y-4">
              <h2 className="font-editorial text-[#E6DBC7] text-xl font-medium">4. AI Processing & Third-Party Providers</h2>
              <p>
                March Chat uses AI models hosted through trusted third-party providers (e.g., OpenAI, Google, or equivalents). Data may be securely transmitted to these processors solely for generating responses.
              </p>
              <p>These providers:</p>
              <ul className="list-disc pl-6 space-y-2 text-[#E6DBC7]/80">
                <li>Operate under data processing agreements</li>
                <li>Do not retain your data for independent purposes</li>
                <li>Do not use your data to train public models</li>
              </ul>
              <p>Lovable Labs, Inc. provides the platform that hosts our App and manages secure integrations.</p>
              <p>Stripe processes all payments as an independent data controller.</p>
            </section>

            {/* Section 5 */}
            <section className="space-y-4">
              <h2 className="font-editorial text-[#E6DBC7] text-xl font-medium">5. How We Store & Process Data</h2>
              <p>
                Our platform is built and hosted on Lovable, which uses secure cloud infrastructure (e.g., Supabase, AWS, Google Cloud).
                Data may be transferred and stored outside the UK/EU under approved international safeguards.
              </p>
              <p>See their privacy policies for more details:</p>
              <ul className="list-disc pl-6 space-y-2 text-[#E6DBC7]/80">
                <li><a href="https://www.lovable.dev/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#E6DBC7]">Lovable Privacy Policy</a></li>
                <li><a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#E6DBC7]">Stripe Privacy Policy</a></li>
              </ul>
            </section>

            {/* Section 6 */}
            <section className="space-y-4">
              <h2 className="font-editorial text-[#E6DBC7] text-xl font-medium">6. Health & Wellness Data</h2>
              <p>
                We do not collect clinical medical information.
                Any wellness insights you log in the App (favourites, progress, breathing habits) are optional and processed under your consent.
              </p>
              <p className="text-[#E6DBC7]">Do not upload medical records, diagnostic information, or sensitive biometric data.</p>
            </section>

            {/* Section 7 */}
            <section className="space-y-4">
              <h2 className="font-editorial text-[#E6DBC7] text-xl font-medium">7. Data Retention</h2>
              <ul className="list-disc pl-6 space-y-2 text-[#E6DBC7]/80">
                <li>Account data: retained while your account is active</li>
                <li>Course purchases: retained to administer your access rights</li>
                <li>March Chat conversations: stored up to 24 months unless deleted by you</li>
                <li>Pre-sale products: your enrolment data is retained until release</li>
                <li>Event registration data: retained for event administration</li>
                <li>Legal/accounting records: retained for statutory periods</li>
              </ul>
              <p>You may delete your entire account, which permanently erases chat history and personal data except legally required records.</p>
            </section>

            {/* Section 8 */}
            <section className="space-y-4">
              <h2 className="font-editorial text-[#E6DBC7] text-xl font-medium">8. Cookies & Analytics</h2>
              <p>We use cookies and analytics tools to:</p>
              <ul className="list-disc pl-6 space-y-2 text-[#E6DBC7]/80">
                <li>Understand usage patterns</li>
                <li>Improve product performance</li>
                <li>Support essential site functionality</li>
              </ul>
              <p>You may disable non-essential cookies at any time through your browser settings or cookie banner.</p>
              <p>See our Cookie Notice at <a href="https://www.marchrussell.com/cookies" className="underline hover:text-[#E6DBC7]">www.marchrussell.com/cookies</a>.</p>
            </section>

            {/* Section 9 */}
            <section className="space-y-4">
              <h2 className="font-editorial text-[#E6DBC7] text-xl font-medium">9. International Data Transfers</h2>
              <p>If your data is transferred outside your region (e.g., to the United States), we rely on:</p>
              <ul className="list-disc pl-6 space-y-2 text-[#E6DBC7]/80">
                <li>UK/EU Standard Contractual Clauses</li>
                <li>UK-US Data Bridge</li>
                <li>Equivalent legally approved safeguards</li>
              </ul>
            </section>

            {/* Section 10 */}
            <section className="space-y-4">
              <h2 className="font-editorial text-[#E6DBC7] text-xl font-medium">10. Your Rights (UK & EU GDPR)</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2 text-[#E6DBC7]/80">
                <li>Access your personal data</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion ("right to be forgotten")</li>
                <li>Restrict or object to processing</li>
                <li>Withdraw consent at any time</li>
                <li>Request data portability</li>
              </ul>
              <p>
                To exercise your rights, email{" "}
                <a href="mailto:support@marchrussell.com" className="underline hover:text-[#E6DBC7]">support@marchrussell.com</a>.
                We will respond within 30 days as required by law.
              </p>
            </section>

            {/* Section 11 */}
            <section className="space-y-4">
              <h2 className="font-editorial text-[#E6DBC7] text-xl font-medium">11. California Residents (CCPA)</h2>
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2 text-[#E6DBC7]/80">
                <li>Know what data is collected</li>
                <li>Request deletion</li>
                <li>Opt out of the sale of personal data (we do not sell data)</li>
                <li>Access your personal information</li>
              </ul>
              <p>
                Requests can be emailed to{" "}
                <a href="mailto:support@marchrussell.com" className="underline hover:text-[#E6DBC7]">support@marchrussell.com</a>.
              </p>
            </section>

            {/* Section 12 */}
            <section className="space-y-4">
              <h2 className="font-editorial text-[#E6DBC7] text-xl font-medium">12. Children & Age Restrictions</h2>
              <p>
                Our Services are designed for individuals aged 16 and over.
                We do not knowingly collect personal data from anyone under 16.
                If you believe we have unintentionally collected such data, contact us for immediate deletion.
              </p>
            </section>

            {/* Section 13 */}
            <section className="space-y-4">
              <h2 className="font-editorial text-[#E6DBC7] text-xl font-medium">13. Event & Workshop Data</h2>
              <p>When you register for an event or workshop, we process:</p>
              <ul className="list-disc pl-6 space-y-2 text-[#E6DBC7]/80">
                <li>Name</li>
                <li>Email</li>
                <li>Ticket information</li>
                <li>Attendance status</li>
              </ul>
              <p>We do not collect sensitive data unless you voluntarily disclose wellbeing considerations for safety purposes.</p>
              <p>Event data is retained only as long as needed for event administration and compliance.</p>
            </section>

            {/* Section 14 */}
            <section className="space-y-4">
              <h2 className="font-editorial text-[#E6DBC7] text-xl font-medium">14. Updates to This Policy</h2>
              <p>
                We may update this Privacy Policy to reflect new technologies, legal requirements, or service changes.
                The most recent version will always be posted at{" "}
                <a href="https://www.marchrussell.com/privacy" className="underline hover:text-[#E6DBC7]">www.marchrussell.com/privacy</a>{" "}
                with the "Last Updated" date.
              </p>
              <p>For material changes (e.g., new AI processing), we will notify you via email or in-app.</p>
            </section>

            {/* Section 15 */}
            <section className="space-y-4">
              <h2 className="font-editorial text-[#E6DBC7] text-xl font-medium">15. Contact Us</h2>
              <p>If you have questions, concerns, or requests regarding this Policy or your personal data, contact:</p>
              <p className="text-[#E6DBC7]">
                📧{" "}
                <a href="mailto:support@marchrussell.com" className="underline hover:text-[#E6DBC7]/80">
                  support@marchrussell.com
                </a>
              </p>
              <p className="text-[#E6DBC7]">
                🌐{" "}
                <a href="https://www.marchrussell.com" className="underline hover:text-[#E6DBC7]/80">
                  www.marchrussell.com
                </a>
              </p>
              <p>
                If you are in the UK/EU, you may also complain to your local data protection authority (e.g., the UK ICO:{" "}
                <a href="https://ico.org.uk/" target="_blank" rel="noopener noreferrer" className="underline hover:text-[#E6DBC7]">https://ico.org.uk/</a>).
              </p>
            </section>
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
