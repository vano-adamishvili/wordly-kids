import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "Wordly Kids — ინგლისური სიტყვები ბავშვებისთვის",
  description: "ინტერაქტიული ინგლისური ლექსიკა 6–10 წლის ქართულენოვანი ბავშვებისთვის: ბარათები, გამოთქმა, ქვიზები და პროგრესი.",
  appleWebApp: { capable: true, title: "Wordly Kids", statusBarStyle: "default" },
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
