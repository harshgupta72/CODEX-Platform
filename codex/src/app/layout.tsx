import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CODEX Platform - Automated Code Evaluation",
  description: "A robust platform for automated code evaluation and assessment. Practice coding problems, manage courses, and track progress.",
  keywords: ["coding", "programming", "education", "code evaluation", "algorithms", "data structures"],
  authors: [{ name: "CODEX Team" }],
  openGraph: {
    title: "CODEX Platform",
    description: "A robust platform for automated code evaluation and assessment",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-black dark:bg-black dark:text-white`}
      >
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
