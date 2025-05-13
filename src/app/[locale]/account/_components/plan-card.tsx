import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";


export default function PlanCard() {
    const t = useTranslations("account_page.plan_card");
  
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl text-left">{t("title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-left">{t("description")}</p>
          <Button asChild variant="secondary" className="w-full mt-3" size="sm">
            <Link href="/plans">
              {t("action_button")} <ArrowRight className="ml-1.5 size-5" />
            </Link>
          </Button>
          <Button asChild variant="default" className="w-full mt-3" size="sm">
            <Link href="/plans">
              {t("admin_button")} <ArrowRight className="ml-1.5 size-5" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }