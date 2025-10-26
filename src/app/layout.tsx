import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/contexts/ThemeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MLJ-NET - WiFi Hotspot Voucher Tercepat",
  description: "Provider internet hotspot terpercaya dengan voucher WiFi murah dan cepat. Nikmati internet super cepat hingga 100 Mbps dengan harga terjangkau.",
  keywords: ["MLJ-NET", "WiFi", "Hotspot", "Internet", "Voucher WiFi", "Internet Cepat", "Provider WiFi", "Hotspot Voucher"],
  authors: [{ name: "MLJ-NET Team" }],
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    title: "MLJ-NET - WiFi Hotspot Voucher Tercepat",
    description: "Provider internet hotspot terpercaya dengan voucher WiFi murah dan cepat",
    url: "https://mljnet.tokowifi.com",
    siteName: "MLJ-NET",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MLJ-NET - WiFi Hotspot Voucher Tercepat",
    description: "Provider internet hotspot terpercaya dengan voucher WiFi murah dan cepat",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
