import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "@/components/arc/foundation.css";
import "./globals.css";
import { themeScript } from "@/lib/config";
import { Providers } from "./providers";

/**
 * Neue Montreal, the Melanin Kapital brand face, from the same files the
 * public website uses. It carries both headings and body text here.
 */
const neueMontreal = localFont({
  variable: "--font-neue",
  display: "swap",
  src: [
    {
      path: "./fonts/NeueMontreal-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/NeueMontreal-Medium.woff2",
      weight: "500",
      style: "normal",
    },
  ],
});

export const metadata: Metadata = {
  title: {
    default: "Melanin Kapital Showcase: the businesses greening Africa",
    template: "%s | Melanin Kapital Showcase",
  },
  description:
    "Meet the businesses Melanin Kapital works with across Africa: who they are, what they do, and the impact they report.",
  icons: { icon: "/logo.svg" },
};

export const viewport: Viewport = { themeColor: "#111a22" };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-accent="green"
      data-theme="dark"
      className={neueMontreal.variable}
      suppressHydrationWarning
    >
      <head>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static script, sets the theme before first paint */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        {/* The page's backdrop: dotted paper and three soft brand blooms. */}
        <div className="backdrop" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
