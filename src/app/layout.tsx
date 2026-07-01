import './globals.css';
import type {Metadata} from 'next';

export const metadata: Metadata = {
  icons: {
    icon: '/brand/web-logo.png',
    apple: '/brand/web-logo.png'
  }
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
