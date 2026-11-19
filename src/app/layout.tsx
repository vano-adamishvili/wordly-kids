import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

/**
 * Canonical site URL. Set NEXT_PUBLIC_SITE_URL=https://wivilo.ge in Vercel once the domain is connected;
 * until then the Vercel production URL is used.
 */
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

const DESCRIPTION =
  "Wivilo — ინგლისური სიტყვები 6–10 წლის ბავშვებისთვის: ბარათები, გამოთქმა, ქვიზები და პროგრესი Wivi-სთან ერთად. ისწავლე. ითამაშე. განვითარდი.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: "Wivilo",
  title: { default: "Wivilo — ისწავლე. ითამაშე. განვითარდი.", template: "%s" },
  description: DESCRIPTION,
  appleWebApp: { capable: true, title: "Wivilo", statusBarStyle: "default" },
  openGraph: {
    type: "website",
    siteName: "Wivilo",
    locale: "ka_GE",
    title: "Wivilo — ისწავლე. ითამაშე. განვითარდი.",
    description: DESCRIPTION,
  },
  twitter: { card: "summary_large_image", title: "Wivilo — Learn. Play. Grow.", description: DESCRIPTION },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FAF8F3",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ka" className="h-full antialiased">
      <body className="min-h-full">
        <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col pb-32 sm:max-w-2xl lg:max-w-5xl">
          {children}
        </div>
        <BottomNav />
      </body>
    </html>
  );
}
