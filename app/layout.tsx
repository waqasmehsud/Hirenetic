import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hirenetic — AI-Powered Job Resonance",
  description:
    "Compare your resume against crawled job postings with semantic precision. Quiet, confident career matching.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth">
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans selection:bg-signal selection:text-ink">
        {children}
      </body>
    </html>
  );
}
