import type { Metadata } from "next";
import { DM_Mono, Lora, Playfair_Display, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const defaultSiteUrl = "https://court-interpreter-toolkit.vercel.app";
const siteUrl = (() => {
  const vercelProdUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : undefined;
  const vercelPreviewUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : undefined;
  const configuredSiteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    vercelProdUrl ??
    vercelPreviewUrl ??
    defaultSiteUrl;

  try {
    return new URL(configuredSiteUrl).origin;
  } catch {
    return defaultSiteUrl;
  }
})();
const pageTitle = "Court Interpreter Toolkit";
const pageDescription =
  "Practice tool for court interpreters with timed sessions, vocabulary drills, and task management.";
const socialImagePath = "/og-image.jpg";
const socialImageAlt = "Court Interpreter Toolkit social preview";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: pageTitle,
  description: pageDescription,
  applicationName: pageTitle,
  keywords: [
    "court interpreter",
    "interpreter practice",
    "legal interpreter",
    "vocabulary drills",
    "interpreting toolkit",
  ],
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: ["/favicon.ico"],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: pageTitle,
    title: pageTitle,
    description: pageDescription,
    images: [
      {
        url: socialImagePath,
        width: 1200,
        height: 630,
        type: "image/png",
        alt: socialImageAlt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
    images: [socialImagePath],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        playfair.variable,
        lora.variable,
        dmMono.variable,
        "font-sans",
        geist.variable,
      )}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
