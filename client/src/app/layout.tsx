import { Metadata } from "@/types/config";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import ClientLayout from "./ClientLayout";

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
  metadataBase: new URL( "https://nookchat" ),
  title: "NookChat – Private, One-Time Encrypted Chat",
  description: "NookChat is a secure and anonymous chat app for one-time, end-to-end encrypted conversations. No login. No traces. Just private talk in a cozy digital nook.",
  keywords: [
    "NookChat",
    "anonymous chat",
    "one-time messaging",
    "encrypted chat",
    "private chat app",
    "ephemeral messaging",
    "secure conversations"
  ], // Ensure keywords is not null or undefined
  authors: [{ name: "Dharmendra Kumar" }],
  openGraph: {
    title: "NookChat – Private, One-Time Encrypted Chat",
    description: "Step into a secure, cozy space for anonymous, end-to-end encrypted chats. Your messages vanish after the talk.",
    url: "https://nookchat",
    images: [{
      url: "/logo-md.png"
    } as { url: string }], // Explicitly define 'images'
    siteName: "NookChat",
  },
  twitter: {
    card: "summary_large_image",
    title: "NookChat – One-Time, Private Chat",
    description: "A cozy and secure place for private, disappearing conversations.",
    images: ["/public/logo-md.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/logo-md.png",
  },
  themeColor: "#1E1E2F",
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

        <title>{String( metadata.title ?? "NookChat" )}</title>

        {/* Fonts */}
        <link rel="icon" href="/favicon.ico" />
        {/* Fonts are now added in _document.tsx */}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClientLayout>{children}</ClientLayout>
        
        {/* Google tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-C0FQ6EPDCL"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-C0FQ6EPDCL');
          `}
        </Script>
      </body>
    </html>
  );
}
