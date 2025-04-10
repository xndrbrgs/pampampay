import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import localFont from "next/font/local";
import { Toaster } from "@/components/ui/toaster";
import { dark } from "@clerk/themes";
import { ReactLenis } from "@/components/General/Lenis";
import { SpeedInsights } from '@vercel/speed-insights/next';
import "./globals.css";
import { GooglePayLoader } from "@/components/Auth.Net/wallets/GooglePayLoader";

const BasisRegular = localFont({
  src: "../public/fonts/BasisGrotesqueArabicPro-Regular.ttf",
  display: "swap",
  weight: "500",
  variable: "--font-basis-regular",
});

const Editorial = localFont({
  src: "../public/fonts/PPEditorialNew-Regular.otf",
  display: "swap",
  weight: "500",
  variable: "--font-editorial",
});

export const metadata: Metadata = {
  title: "PamPamPay",
  description: "PamPamPay is a modern banking platform for everyone.",
  referrer: "origin-when-cross-origin",
  creator: "Maxjoy Studio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
      }}
    >
      <html lang="en">
        <ReactLenis root>
          <body
            className={`${BasisRegular.variable} ${Editorial.variable} antialiased dark font-basis`}
          >
            {children}
            <GooglePayLoader />
            <SpeedInsights />
            <Toaster />
          </body>
        </ReactLenis>
      </html>
    </ClerkProvider>
  );
}
