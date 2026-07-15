import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LLM-SHEILD | Secure Database Operations Console",
  description: "AI-powered real-time security vault and compliance logging system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth">
      <body className="min-h-full flex flex-col bg-black text-foreground font-sans selection:bg-primary selection:text-black">
        {children}
      </body>
    </html>
  );
}
