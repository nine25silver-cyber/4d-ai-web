import type {Metadata} from 'next';

export const metadata: Metadata = {
  title: '4D AI Terms of Service',
  description: 'Terms of Service for 4D AI.'
};

const sections = [
  {
    title: 'Scope',
    body: [
      'These Terms of Service apply to the 4D AI website (https://4dai88.com) and related web services operated under the 4D AI name.',
      'The service is intended for users who access 4D AI through the website or related account features.'
    ]
  },
  {
    title: 'Agreement',
    body: [
      'By using the 4D AI website or service, users agree to these terms. Users who do not agree should not use the service.',
      'Users are responsible for reviewing these terms and using the service only where lawful and appropriate.'
    ]
  },
  {
    title: 'Service Purpose',
    body: [
      'The website provides lottery result information, historical data, analysis tools, AI recommendation features, and account-related services for informational purposes only.',
      '4D AI does not encourage unlawful activity and does not guarantee that all data is always complete, accurate, current, or available.'
    ]
  },
  {
    title: 'Subscriptions and Payments',
    body: [
      'Web subscriptions are processed by Stripe.',
      'Android App subscriptions are managed by Google Play.',
      'Users should manage cancellation, renewal, payment methods, and refund requests through the relevant payment service or platform used for the purchase.',
      'Refund eligibility and processing are subject to the policies of the relevant payment platform or provider, such as Stripe or Google Play.',
      'Subscription benefits may be suspended or terminated if a payment is declined, refunded, cancelled, or otherwise becomes invalid.',
      '4D AI may receive limited subscription status information to provide account access and support.'
    ]
  },
  {
    title: 'User Responsibilities',
    body: [
      'Users are responsible for complying with local laws and regulations.',
      'Users must not misuse the service, attempt unauthorized access, interfere with the service, abuse authentication features, or use the service in a way that could harm 4D AI or other users.'
    ]
  },
  {
    title: 'AI Recommendation Disclaimer',
    body: [
      'AI recommendations are provided for informational purposes only and should not be interpreted as financial, investment, gambling, or winning advice.',
      '4D AI does not guarantee winning results, prize outcomes, or financial benefit.',
      'Users are responsible for their own decisions and compliance with local laws.'
    ]
  },
  {
    title: 'Service Availability',
    body: [
      'The service may change, be interrupted, be suspended, or be discontinued from time to time.',
      '4D AI may update, remove, or limit features when needed for maintenance, security, business, legal, or operational reasons.'
    ]
  },
  {
    title: 'Limitation of Liability',
    body: [
      '4D AI is not responsible for losses, damages, or decisions made based on website information, lottery results, AI recommendations, or service availability.',
      'Users use the service at their own discretion and should verify important information independently where necessary.'
    ]
  },
  {
    title: 'Changes to Terms',
    body: [
      '4D AI may update these terms when needed. Continued use of the service after updates means users accept the updated terms.'
    ]
  },
  {
    title: 'Contact',
    body: ['For questions about these terms, contact 4dai88@gmail.com.']
  }
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
      <article className="mx-auto max-w-3xl rounded border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-normal text-blue-700">4D AI</p>
        <h1 className="mt-3 text-3xl font-bold">4D AI Terms of Service</h1>
        <p className="mt-2 text-sm text-slate-600">Last updated: 2026-07-09</p>

        <div className="mt-8 space-y-7">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-semibold">{section.title}</h2>
              <div className="mt-3 space-y-3 text-base leading-7 text-slate-700">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
