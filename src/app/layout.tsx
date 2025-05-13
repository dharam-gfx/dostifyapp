import type { Metadata as NextMetadata } from "next";

interface Metadata extends NextMetadata {
  openGraph?: {
    title?: string;
    description?: string;
    url?: string;
    images?: { url: string }[]; // Explicitly define images as an array of objects with 'url'
    siteName?: string;
  };
  twitter?: {
    card?: string; // Add 'card' property to the Twitter metadata
    title?: string;
    description?: string;
    images?: string[];
  };
}
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header, Footer, ThemeProvider } from "@/components/index"

// Fonts
const geistSans = Geist( {
  variable: "--font-geist-sans",
  subsets: ["latin"],
} );

const geistMono = Geist_Mono( {
  variable: "--font-geist-mono",
  subsets: ["latin"],
} );

export const metadata: Metadata = {
  metadataBase: new URL( "http://localhost:3000" ),
  title: "DostifyApp - Private and Secure Chat",
  description: "DostifyApp is a secure and anonymous chat app for one-time private conversations. Chat in real-time with end-to-end encryption.",
  keywords: ["anonymous chat", "real-time messaging", "end-to-end encryption", "private chat", "secure messaging", "chat app", "DostifyApp"], // Ensure keywords is not null or undefined
  authors: [{ name: "Dharmendra Kumar" }],
  openGraph: {
    title: "DostifyApp - Private and Secure Chat",
    description: "DostifyApp is a secure and anonymous chat app for one-time private conversations. Chat in real-time with end-to-end encryption.",
    url: "",  // Replace with your actual domain
    images: [{ url: "/public/logo-md.png" } as { url: string }], // Explicitly define 'images' as an array of objects with 'url'
    siteName: "DostifyApp",
  },
  twitter: {
    card: "summary_large_image",  // Large image card for Twitter
    title: "DostifyApp - Private and Secure Chat",
    description: "DostifyApp is a secure and anonymous chat app for one-time private conversations. Chat in real-time with end-to-end encryption.",
    images: ["/public/logo-md.png"], // Use the same image for Twitter
  },
  robots: {
    index: true,              // Allow search engines to index the site
    follow: true,             // Allow search engines to follow links
  },
};

export default function RootLayout( {
  children,
}: Readonly<{
  children: React.ReactNode;
}> ) {
  return (
    <html lang="en" suppressHydrationWarning className="">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />

        {/* SEO Meta Tags */}
        <meta name="description" content={metadata.description ?? ""} />
        <meta name="keywords" content={Array.isArray( metadata.keywords ) ? metadata.keywords.join( ", " ) : metadata.keywords ?? ""} />
        <meta name="author" content={Array.isArray( metadata.authors ) ? metadata.authors.join( ", " ) : ""} />

        {/* Open Graph Meta Tags */}
        <meta name="twitter:image" content={Array.isArray( metadata.twitter?.images ) ? metadata.twitter.images[0]?.toString() ?? "" : ""} />
        <meta property="og:description" content={metadata.openGraph?.description ?? ""} />
        <meta property="og:url" content={metadata.openGraph?.url?.toString() ?? ""} />
        <meta property="og:image" content={Array.isArray( metadata.openGraph?.images ) && typeof metadata.openGraph.images[0] === "object" ? metadata.openGraph.images[0]?.url ?? "" : ""} />
        <meta property="og:site_name" content={metadata.openGraph?.siteName ?? ""} />

        {/* Twitter Meta Tags */}
        <meta name="twitter:card" content={metadata.twitter?.card ?? ""} />
        <meta name="twitter:title" content={metadata.twitter?.title ?? ""} />
        <meta name="twitter:description" content={metadata.twitter?.description ?? ""} />
        <meta name="twitter:image" content={metadata.twitter?.images?.[0] ?? ""} />

        <title>{String( metadata.title ?? "DostifyApp" )}</title>

        {/* Fonts */}
        <link rel="icon" href="/favicon.ico" />
        {/* Fonts are now added in _document.tsx */}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
