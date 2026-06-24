import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sevanto — Trusted local workforce",
  description: "Find verified, skilled workers in your neighborhood.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
