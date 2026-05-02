import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '4D AI Dashboard',
  description: 'Latest 4D draw results from Cloudflare JSON feeds',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
