import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const benzin = localFont({
  src: [
    {
      path: "./fonts/Benzin-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Benzin-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/Benzin-Semibold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/Benzin-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/Benzin-ExtraBold.woff2",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-benzin",
});

export const metadata: Metadata = {
  title: "AnyShape - Crop Images to Any Shape | Free Online Tool",
  description: "Free, open-source tool to crop images into any shape. Choose from 16+ preset shapes or create your own. No watermarks, no sign-up, all processing in your browser.",
  keywords: ["image crop", "shape crop", "circle crop", "heart crop", "star crop", "custom shape", "image editor", "free tool", "open source"],
  authors: [{ name: "AnyShape" }],
  manifest: "/manifest.json",
  openGraph: {
    title: "AnyShape - Crop Images to Any Shape",
    description: "Free, open-source tool to crop images into any shape. No watermarks, no sign-up required.",
    type: "website",
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
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        <meta name="apple-mobile-web-app-title" content="AnyShape" />
      </head>
      <body
        className={`${benzin.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
