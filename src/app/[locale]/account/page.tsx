'use client'
import MaxWidthWrapper from "@/components/max-width-wrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PlanNumber from "./_components/plan-number";
import { useTranslations } from "next-intl";

export default function Page({ params }: { params: { locale: string } }) {
  const t = useTranslations("account_page");

  return (
    <MaxWidthWrapper className="mb-8 mt-24 text-center max-w-5xl">
      <h1 className="text-4xl font-bold sm:text-5xl mb-10">{t("title")}</h1>
      <div className="mx-auto mb-10 sm:max-w-lg flex flex-col gap-10">
        <PlanCard />
        <PlanNumber number="+573224354004" />
      </div>
    </MaxWidthWrapper>
  );
}

function PlanCard() {
  const t = useTranslations("account_page.plan_card");

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl text-left">{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-left">{t("description")}</p>
      </CardContent>
    </Card>
  );
}


