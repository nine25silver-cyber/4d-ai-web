import './globals.css';
import type {Metadata} from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  icons: {
    icon: '/brand/web-logo.png',
    apple: '/brand/web-logo.png'
  }
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <head>
        <Script
          id="google-adsense-verification"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2990166380936491"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
