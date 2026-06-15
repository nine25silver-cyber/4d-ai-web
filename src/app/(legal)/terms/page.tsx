import type {Metadata} from 'next';

export const metadata: Metadata = {
  title: '4D AI Terms of Service',
  description: 'Terms of Service for 4D AI.'
};

const sections = [
  {
    title: 'Agreement',
    body: [
      'App name: 4D AI.',
      'By using 4D AI, users agree to these terms. Users who do not agree should not use the service.'
    ]
  },
  {
    title: 'Service Purpose',
    body: [
      'The app provides lottery/result information and related app features for informational purposes only.',
      '4D AI does not encourage unlawful activity and does not guarantee that all data is always complete, accurate, or available.'
    ]
  },
  {
    title: 'User Responsibilities',
    body: [
      'Users are responsible for complying with local laws and regulations.',
      'Users must not misuse the service, attempt unauthorized access, interfere with the service, or abuse authentication features.'
    ]
  },
  {
    title: 'Service Changes',
    body: [
      'The service may change, be suspended, or be discontinued from time to time.',
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
