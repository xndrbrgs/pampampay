import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import localFont from "next/font/local";
import { Toaster } from "@/components/ui/toaster";
import { dark } from "@clerk/themes";
import "./globals.css";
import { ReactLenis } from "@/components/General/Lenis";

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
            <Toaster />
          </body>
        </ReactLenis>
      </html>
    </ClerkProvider>
  );
}
