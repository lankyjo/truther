import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "TRUTHER - Truth Detector",
  description: "A simple, accessible tool to detect fake news, AI-generated content, and misinformation.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "TRUTHER",
  },
  icons: {
    icon: "/icon-192x192.png", // You should add these images to /public
    apple: "/icon-192x192.png",
  },
    openGraph: {
    images: '/desc.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&family=Space+Grotesk:wght@300;400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-white text-black antialiased min-h-screen selection:bg-black selection:text-white overflow-x-hidden scanline">
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
