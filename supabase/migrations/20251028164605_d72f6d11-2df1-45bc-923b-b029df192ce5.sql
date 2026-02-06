-- Update terms title to match app styling
UPDATE content_pages 
SET title = 'TERMS & CONDITIONS',
    updated_at = now()
WHERE slug = 'terms';

-- Insert privacy policy page
INSERT INTO content_pages (slug, title, content, updated_at)
VALUES (
  'privacy',
  'PRIVACY POLICY',
  'Privacy Policy

Last updated: October 2025

Thank you for choosing to be part of our community at March Russell Ltd, doing business as March Russell ("March Russell", "we", "us", or "our").
We are committed to protecting your personal information and respecting your privacy rights.

If you have any questions about this notice or how we handle your data, please contact us at:
📧 support@marchrussell.com
🌐 www.marchrussell.com

1. What This Policy Covers

This Privacy Policy describes how we collect, use, and protect your personal data when you:
- Visit or use our website (www.marchrussell.com)
- Use our digital services and breathwork app built via Lovable ("the App")
- Subscribe to or purchase services or memberships through our platform (payments processed by Stripe)

This Policy applies globally, in accordance with UK GDPR and other applicable international data protection laws.

2. Information We Collect

We collect personal information that you provide directly to us or that is generated automatically when you use our services.

Information You Provide:
- Account details – your name, email, and password when creating an account.
- Subscription and billing data – payment information processed securely by Stripe. We never store full card details.
- Support interactions – if you contact us for help or feedback.
- Wellness preferences – optional data you choose to share within the App (e.g., class history, breathwork preferences).

Automatically Collected Data:
- Device type, IP address, browser, and usage logs.
- Interactions with our website or App (pages viewed, time spent, etc.).
- Cookies or similar tracking technologies (see section 6).

3. How We Use Your Information

We use your data to:
- Provide, maintain, and personalise your breathwork experience
- Manage your subscription, free trial, and billing
- Improve our services through analytics
- Communicate updates, newsletters, and special offers (you can opt out anytime)
- Ensure security and compliance with applicable laws

We process data on the following legal bases:
- Performance of a contract (for delivering your subscription or service)
- Consent (for newsletters, cookies, or health-related data)
- Legitimate interests (to improve and secure our services)
- Legal obligation (for accounting or compliance purposes)

4. How Your Data Is Stored & Processed

Our website and app are built using Lovable, a development and hosting platform operated by Lovable Labs, Inc. ("Lovable").

Some of your personal data may be stored or processed through Lovable''s secure cloud services and its subprocessors (such as Supabase, OpenAI, Google, or AWS).

Lovable may transfer data internationally, including to the United States. Such transfers are protected under Standard Contractual Clauses (SCCs) or equivalent safeguards.
You can learn more about Lovable''s practices here:
👉 https://www.lovable.dev/privacy

We also use Stripe for payment processing. Stripe acts as an independent data controller for billing information. See:
👉 https://stripe.com/privacy

5. Health & Wellness Data

We provide breathwork and wellness classes, not medical advice.
We do not collect or process sensitive health data such as biometric identifiers or medical information.

If you choose to record breathwork activity, it remains within your account and is processed securely under your consent.
Do not upload any special-category or clinical health data to the App.

6. Cookies and Analytics

We use cookies and analytics tools (such as those provided by Lovable, Google Analytics, or similar) to understand how users interact with our services.

You can disable non-essential cookies via your browser or in-app preferences.
For more details, see our Cookie Notice (available on our website footer).

7. Data Retention

We retain your personal information only as long as necessary for the purposes described here, or as required by law.

- Account data is kept for as long as you maintain an active subscription.
- If you cancel your account, your data will be deleted or anonymised within 12 months.
- Data stored by Lovable or Stripe follows their respective retention policies.

8. Data Security

We and our platform partners (Lovable, Stripe, etc.) use robust organisational and technical safeguards to protect your data, including encryption, secure transmission, and restricted access.

However, no online service is completely risk-free. By using our Services, you acknowledge that data transmission over the internet carries inherent risks.

9. International Transfers

Where data is transferred outside the UK or EU, we rely on:
- Standard Contractual Clauses (SCCs), or
- The UK-US Data Bridge, where applicable.

10. Your Privacy Rights (UK & EU GDPR)

You have the right to:
- Access a copy of your personal data
- Correct inaccurate data
- Request deletion ("right to be forgotten")
- Restrict or object to processing
- Withdraw consent at any time
- Port your data to another provider

To exercise any of these rights, email support@marchrussell.com.
We will respond within 30 days.

11. California Residents (CCPA)

If you live in California, you have additional rights under the California Consumer Privacy Act (CCPA), including:
- The right to know what data we collect and why
- The right to request deletion
- The right to opt out of data sale (we do not sell data)
- The right to non-discrimination for exercising privacy rights

To submit a request, contact support@marchrussell.com.

12. Children & Age Restrictions

Our Services are designed for users aged 16 and over.
We do not knowingly collect data from anyone under 16.
If you believe we have inadvertently collected data from a minor, please contact us for immediate deletion.

13. Updates to This Policy

We may update this Policy from time to time to stay compliant with law and technology changes.
The updated version will always be posted at www.marchrussell.com/privacy with the "Last Updated" date shown above.

14. Contact Us

If you have any questions about this notice or your data, please contact:
📧 support@marchrussell.com
🌐 www.marchrussell.com

If you are based in the UK or EU and wish to raise a complaint, you can contact your local data protection authority (e.g., the UK ICO: https://ico.org.uk).

✅ Summary of Key Points

- Platform built and hosted via Lovable
- Payments handled securely via Stripe
- 7-day free trial available
- Minimum user age: 16+
- We do not store health or medical data
- Fully compliant with UK GDPR, EU GDPR, and CCPA',
  now()
);