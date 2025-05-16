import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export default function TermsAcceptance() {
  const t = useTranslations("signup_page");

  return (
    <p className="text-sm text-muted-foreground text-center mt-4">
      {t("form.termsText")}{" "}
      <Link href="/terms" className="text-primary hover:underline">
        {t("form.termsLink")}
      </Link>{" "}
      {t("form.andText")}{" "}
      <Link href="/privacy" className="text-primary hover:underline">
        {t("form.privacyLink")}
      </Link>
      .
    </p>
  );
}