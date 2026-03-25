import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { ThemeProvider } from "next-themes";
import "@/styles/globals.css";
import { PWAInstallBanner } from "@/components/shared/pwa-install-banner";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: {
    default: "Calendário do Casal",
    template: "%s | Calendário do Casal",
  },
  description:
    "Registre e celebre os momentos mais especiais do seu relacionamento.",
  keywords: ["casal", "calendário", "relacionamento", "memórias", "fotos"],
  authors: [{ name: "Calendário do Casal" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Calendário do Casal",
  },
  openGraph: {
    type: "website",
    siteName: "Calendário do Casal",
    title: "Calendário do Casal",
    description:
      "Registre e celebre os momentos mais especiais do seu relacionamento.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning className={cn("font-sans", geist.variable)}>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <NextIntlClientProvider messages={messages} locale={locale}>
            {children}
            <PWAInstallBanner />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
