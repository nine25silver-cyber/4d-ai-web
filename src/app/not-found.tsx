import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-950">
      <section className="mx-auto max-w-2xl rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold text-blue-700">4D AI</p>
        <h1 className="mt-3 text-3xl font-black">Page not found</h1>
        <p className="mt-4 text-slate-600">
          This page is not available. Please return to the latest 4D results.
        </p>
        <Link
          href="/zh/results/west-malaysia"
          className="mt-6 inline-flex rounded-md border border-blue-200 bg-blue-50 px-4 py-2 font-semibold text-blue-900"
        >
          Back to results
        </Link>
      </section>
    </main>
  );
}
