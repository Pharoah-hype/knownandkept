import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BackgroundGradientAnimation } from "@/components/ui/BackgroundGradientAnimation";

export const metadata: Metadata = {
  title: "Known & Kept",
  description: "A private space to be fully known",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#161614",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icons/icon-192.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <script
          src="https://observer.mooreinside.com/obs.js"
          data-client-id={process.env.NEXT_PUBLIC_OBS_CLIENT_ID}
          async
        />
      </head>
      <body className="bg-bg text-text-primary min-h-screen">
        {/* Animated gradient background — fixed, behind all content */}
        <BackgroundGradientAnimation
          containerClassName="fixed inset-0 -z-10"
          interactive={true}
        />
        {/* Light black overlay */}
        <div className="fixed inset-0 -z-10 bg-black/30 pointer-events-none" />
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js')}`,
          }}
        />
      </body>
    </html>
  );
}
