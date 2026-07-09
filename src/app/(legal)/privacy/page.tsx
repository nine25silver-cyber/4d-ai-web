import type {Metadata} from 'next';

export const metadata: Metadata = {
  title: '4D AI Privacy Policy',
  description: 'Privacy Policy for 4D AI.'
};

const sections = [
  {
    title: 'Scope',
    body: [
      'This Privacy Policy applies to the 4D AI website (https://4dai88.com) and related web services operated under the 4D AI name.',
      'By using the website, users acknowledge that information may be processed as described in this Privacy Policy.'
    ]
  },
  {
    title: 'Information We Collect',
    body: [
      '4D AI may collect basic account information when users sign in with Google, such as email address, display name, and profile image if provided by Google.',
      '4D AI may also process website usage data needed to provide, operate, secure, and improve the service.'
    ]
  },
  {
    title: 'How We Use Information',
    body: [
      'The information is used for authentication, account access, website features, security, support, payment-related account handling, and service improvement.',
      'Google Sign-In is used as a login method for account sign-in and basic profile identification.'
    ]
  },
  {
    title: 'Third-Party Services',
    body: [
      '4D AI uses Google Sign-In as a login method and Supabase for authentication and account management.',
      '4D AI uses Stripe for website payment and subscription processing, and Google AdSense for website advertising services.',
      'These third-party services may process information according to their own privacy policies.'
    ]
  },
  {
    title: 'Payments and Subscriptions',
    body: [
      'Web subscriptions are processed securely by Stripe. 4D AI does not store full credit card details.',
      'Stripe may process payment information, billing details, transaction identifiers, and related subscription information according to its own Privacy Policy.',
      'Android App subscriptions are managed by Google Play. Users should manage cancellation, renewal, and payment methods through the relevant platform or payment service used for the purchase.',
      '4D AI may receive limited payment or subscription status information from Stripe or Google Play to provide account access and support.'
    ]
  },
  {
    title: 'Advertising, Cookies, and Google AdSense',
    body: [
      '4D AI may use Google AdSense and other third-party advertising services to display advertisements on the website.',
      'Google and its partners may use cookies or similar technologies to serve ads, limit how often ads are shown, measure ad performance, and support personalized advertising.',
      'Third-party advertising services may use information about visits to this website and other websites to help show advertisements that may be more relevant to users.',
      'Users can disable or limit cookies through their browser settings. Some website features or advertising functions may not work as intended if cookies are disabled.',
      'Users can manage personalized advertising preferences through Google Ads Settings and other Google privacy controls.'
    ]
  },
  {
    title: 'Data and Results',
    body: [
      'Lottery results, related data, and website information shown in 4D AI are for informational purposes only.',
      '4D AI does not sell users personal information.'
    ]
  },
  {
    title: 'Account Deletion',
    body: [
      'Users may request deletion of their 4D AI account and associated personal data by contacting:',
      '4dai88@gmail.com',
      'Please include the email address associated with your account.',
      "Upon verification of the request, we will delete the user's account and associated personal data within 30 days, unless retention is required by law or for legitimate business purposes.",
      'Web subscriptions processed by Stripe and Android App subscriptions managed by Google Play may need to be cancelled or managed through the relevant payment service or platform account.',
      'Users may request full account deletion. Partial data deletion while retaining the account is not currently supported.'
    ]
  },
  {
    title: 'Contact and Updates',
    body: [
      'Users may contact 4dai88@gmail.com for privacy questions or account-related requests.',
      'This Privacy Policy may be updated from time to time. Updates will be posted on this page with a revised last updated date.'
    ]
  }
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
      <article className="mx-auto max-w-3xl rounded border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-normal text-blue-700">4D AI</p>
        <h1 className="mt-3 text-3xl font-bold">4D AI Privacy Policy</h1>
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
