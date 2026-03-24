import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

const supportedLocales = ["pt-BR", "en", "es"] as const;
type Locale = (typeof supportedLocales)[number];

function isValidLocale(locale: string): locale is Locale {
  return supportedLocales.includes(locale as Locale);
}

export default getRequestConfig(async () => {
  // Read locale from cookie (set by settings page)
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("locale")?.value;

  const locale =
    cookieLocale && isValidLocale(cookieLocale) ? cookieLocale : "pt-BR";

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
