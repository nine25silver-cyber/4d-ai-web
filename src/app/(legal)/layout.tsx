export default function LegalLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/brand/web-logo.png" />
        <link rel="apple-touch-icon" href="/brand/web-logo.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
