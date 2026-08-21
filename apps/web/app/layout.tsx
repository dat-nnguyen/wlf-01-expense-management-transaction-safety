import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Wealify Guardian — AI Expense Management & Transaction Safety Microservice',
  description: 'Enterprise AI Financial Assistant & Transaction Safety Copilot for Wealify',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>{children}</body>
    </html>
  );
}
