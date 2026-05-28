import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, EB_Garamond } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const ebGaramond = EB_Garamond({
  variable: "--font-eb-garamond",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "NBF Forecasting Engine",
  description: "Forecasting console for deep technology categories and industry-level predictions."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${ebGaramond.variable} antialiased`}>{children}</body>
    </html>
  );
}
