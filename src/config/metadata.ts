import type { Metadata } from "next";

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : `http://localhost:${process.env.PORT}`;

const imageUrl = `${baseUrl}/thumbnail.jpg`;

const titleSmall = "GainForest";
const title = "GainForest | Protecting and Restoring Earth's Forests";
const description =
  "GainForest is a decentralized network that uses AI and blockchain to protect and restore Earth's natural ecosystems through transparent, data-driven conservation efforts.";
const iconSizes: `${number}`[] = ["16", "32"];

export const metadata: Metadata = {
  title: title,
  description: description,
  keywords:
    "conservation, reforestation, blockchain, climate change, sustainability, forest protection, environmental impact, carbon offset, biodiversity",
  authors: [{ name: "GainForest Team" }],
  creator: "GainForest",
  publisher: "GainForest",
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: title,
    description: description,
    url: baseUrl,
    siteName: titleSmall,
    images: [
      {
        url: imageUrl,
        width: 1920,
        height: 1080,
        alt: title,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: title,
    description: description,
    creator: "@GainForestNow",
    images: [imageUrl],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      ...iconSizes.map((size) => ({
        url: `/favicon-${size}x${size}.png`,
        sizes: `${size}x${size}`,
        type: "image/png",
      })),
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    title: titleSmall,
    statusBarStyle: "black-translucent",
  },
  manifest: "/site.webmanifest",
  themeColor: "#34D399",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  category: "Environment & Conservation",
  verification: {
    google: "google-site-verification-code", // Replace with actual verification code
  },
};
