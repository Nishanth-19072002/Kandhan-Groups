import type { Metadata, Viewport } from "next";
import { Sora, Inter } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/lib/siteConfig";
import SmoothScroll from "@/components/SmoothScroll";

const display = Sora({ subsets: ["latin"], variable: "--font-display", weight: ["400", "600", "700", "800"] });
const body = Inter({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: `${siteConfig.name} | Civil Construction, Industrial Works & PMC`,
  description: siteConfig.description,
  keywords: [
    "civil contractor",
    "industrial construction",
    "factory civil works",
    "house construction",
    "project management consultancy",
    "PMC",
    "painting contractor",
    "plumbing contractor",
    "Kandhan Groups",
  ],
  openGraph: {
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: "website",
    images: ["/images/industrial.jpg"],
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#070b14" };

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "GeneralContractor",
  name: siteConfig.name,
  description: siteConfig.description,
  url: siteConfig.url,
  telephone: siteConfig.contact.phones[0]?.raw,
  email: siteConfig.contact.emails.join(", "),
  address: siteConfig.contact.address,
  areaServed: siteConfig.contact.serviceArea,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${display.variable} ${body.variable}`}>
      <body className="noise" suppressHydrationWarning>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}

