import type {Metadata} from 'next';

export const metadata: Metadata = {
  title: '4D AI Privacy Policy',
  description: 'Privacy Policy for 4D AI.'
};

const sections = [
  {
    title: 'Information We Collect',
    body: [
      'App name: 4D AI.',
      '4D AI may collect basic account information when users sign in with Google, such as email address, display name, and profile image if provided by Google.',
      '4D AI may also process app usage data needed to provide, operate, secure, and improve the service.'
    ]
  },
  {
    title: 'How We Use Information',
    body: [
      'The information is used for authentication, account access, app functionality, security, support, and service improvement.',
      'Google login is used only for account sign-in and basic profile identification.'
    ]
  },
  {
    title: 'Third-Party Services',
    body: [
      '4D AI uses third-party services such as Google Sign-In and Supabase authentication to provide account access and related app functionality.',
      'These third-party services may process information according to their own privacy policies.'
    ]
  },
  {
    title: 'Data and Results',
    body: [
      'Lottery results, related data, and app information shown in 4D AI are for informational purposes only.',
      '4D AI does not sell users personal information.'
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
        <p className="mt-2 text-sm text-slate-600">Last updated: 2026-06-15</p>

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
