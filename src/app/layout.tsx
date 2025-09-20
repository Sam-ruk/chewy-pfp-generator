import type { Metadata } from "next";
import { Orbitron, Oxanium } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next"

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["600"],
});

const oxanium = Oxanium({
  variable: "--font-oxanium",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Chewy PFP Generator",
  description: "Create your own Chewy PFP.",
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Chewy PFP Generator",
    description: "Create your own Chewy PFP.",
    url: "https://chewy-pfp.vercel.app",
    siteName: "Chewy PFP Generator",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Chewy PFP Generator",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Chewy PFP Generator",
    description: "Create your own Chewy PFP.",
    images: ["/logo.png"],
  },
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className={`${orbitron.variable} ${oxanium.variable} antialiased bg-[#191C1E] text-[#C0C0C0]`}>
        {children}
	<Analytics />
      </body>
    </html>
  );
}
