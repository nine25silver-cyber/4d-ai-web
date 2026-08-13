import type {Metadata} from 'next';

export const metadata: Metadata = {
  title: '4D Live AI App and 4D AI Privacy Policy',
  description: 'Privacy Policy for the 4D Live AI mobile application and 4D AI website/services.'
};

const sections = [
  {
    title: 'Scope',
    body: [
      'This Privacy Policy applies to the 4D Live AI mobile application and 4D AI website/services, including https://4dai88.com and related web services operated under the 4D AI name.',
      'By using the App, website, or related services, users acknowledge that information may be processed as described in this Privacy Policy.',
      '4D Live AI is a data analysis and information tool. It does not provide betting functions.'
    ]
  },
  {
    title: 'Information We Collect',
    body: [
      '4D AI may collect basic account information when users sign in with Google, such as email address, display name, and profile image if provided by Google.',
      '4D AI may also process App and website usage data needed to provide, operate, secure, and improve the service.',
      'Where permitted by applicable platform settings and user consent, the Android App may use device advertising identifiers and related device information for advertising measurement, attribution, fraud prevention, and ad delivery.',
      'We do not intentionally collect sensitive personal information, Facebook private profile content, or Facebook messages.'
    ]
  },
  {
    title: 'How We Use Information',
    body: [
      'The information is used for authentication, account access, App and website features, security, support, payment-related account handling, advertising measurement, attribution, and service improvement.',
      'Google Sign-In is used through Supabase OAuth as a login method for account sign-in and basic profile identification.'
    ]
  },
  {
    title: 'Third-Party Services and SDKs',
    body: [
      '4D AI uses Supabase for authentication and account-related services. Google Sign-In is provided through Supabase OAuth.',
      '4D AI uses Stripe for website payment and subscription processing, Google Play Billing for Android App subscriptions, Google AdSense for website advertising services, and Google AdMob for Android App advertising services.',
      'The Android App uses the Meta/Facebook App Events SDK to measure App installs, App launches and sessions, advertising attribution, and campaign performance.',
      'The Meta/Facebook App Events SDK may process information related to the device, App activity, and advertising attribution according to Meta platform settings and Meta policies.',
      'These third-party services may process information according to their own privacy policies.'
    ]
  },
  {
    title: 'Payments and Subscriptions',
    body: [
      'Web subscriptions are processed securely by Stripe. 4D AI does not store full credit card details.',
      'Stripe may process payment information, billing details, transaction identifiers, and related subscription information according to its own Privacy Policy.',
      'Android App subscriptions and in-app purchases are processed by Google Play Billing. Payment methods, renewal, cancellation, receipts, and billing account details are handled by Google Play.',
      "4D AI does not directly receive or store users' full credit card details for Google Play Billing transactions.",
      '4D AI may receive limited payment or subscription status information from Stripe or Google Play to provide account access and support.'
    ]
  },
  {
    title: 'Advertising and Attribution',
    body: [
      '4D AI may use Google AdSense on the website and Google AdMob in the Android App to display advertisements and measure ad performance.',
      'Ad personalization may depend on user settings, region-specific legal requirements, and consent status. Not all users will receive personalized ads.',
      'The Android App may use device advertising identifiers and related device information for advertising measurement, attribution, fraud prevention, and ad delivery where permitted by applicable platform settings and user consent.',
      'The Android App uses the Meta/Facebook App Events SDK for App install measurement, App launch or session measurement, advertising attribution, and campaign performance measurement.',
      'Google, Meta, and their partners may use cookies, SDKs, or similar technologies to serve ads, limit how often ads are shown, measure ad performance, and support advertising attribution.',
      'Users can disable or limit cookies through their browser settings. Some website features or advertising functions may not work as intended if cookies are disabled.',
      'Users can manage personalized advertising preferences through Google Ads Settings, Android privacy controls, and other platform privacy settings where available.'
    ]
  },
  {
    title: 'Data and Results',
    body: [
      '4D/3D results, historical records, related data, analysis, and other information shown in 4D AI are for informational purposes only.',
      '4D AI does not sell users personal information.'
    ]
  },
  {
    title: 'Data Retention',
    body: [
      '4D AI keeps account and service-related personal data only for as long as needed to provide the service, meet legal or operational requirements, resolve disputes, prevent abuse, and support account or subscription records.',
      'Some records may be retained for longer where required by law, payment processing records, security, fraud prevention, or legitimate business purposes.',
      "Advertising and analytics data processed by third-party services may be retained according to those services' own policies and user settings."
    ]
  },
  {
    title: 'User Rights and Data Deletion',
    body: [
      'Users may request deletion of their 4D AI account and associated personal data by contacting:',
      '4dai88@gmail.com',
      'Please include the email address associated with your account.',
      "Upon verification of the request, we will delete the user's account and associated personal data within our control within 30 days, unless retention is required by law, payment processing records, security, fraud prevention, or legitimate business purposes.",
      'Web subscriptions processed by Stripe and Android App subscriptions managed by Google Play may need to be cancelled or managed through the relevant payment service or platform account.',
      'Users may request full account deletion. Partial data deletion while retaining the account is not currently supported.'
    ]
  },
  {
    title: 'Children and Age Requirements',
    body: [
      '4D AI is not intended for children below the minimum age required under applicable local law and relevant platform rules. Users must be old enough to use the account, advertising, and subscription services made available through 4D AI.',
      '4D AI does not knowingly collect personal information from children where parental consent is required. If you believe a child has provided personal information, contact us so we can review and delete it where appropriate.'
    ]
  },
  {
    title: 'Security',
    body: [
      '4D AI uses reasonable technical and organizational measures to protect account and service-related information.',
      'No online service can guarantee absolute security, and users should protect their own account credentials and device access.'
    ]
  },
  {
    title: 'Changes to This Privacy Policy',
    body: [
      'This Privacy Policy may be updated from time to time. Updates will be posted on this page with a revised last updated date.'
    ]
  },
  {
    title: 'Contact',
    body: [
      'Users may contact 4dai88@gmail.com for privacy questions or account-related requests.',
      'Users may also use this contact address for account deletion or requests to delete personal data within our control.'
    ]
  }
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
      <article className="mx-auto max-w-3xl rounded border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-normal text-blue-700">4D AI</p>
        <h1 className="mt-3 text-3xl font-bold">4D Live AI App and 4D AI Privacy Policy</h1>
        <p className="mt-2 text-sm text-slate-600">Last updated: 2026-08-13</p>

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
