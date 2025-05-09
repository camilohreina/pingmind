'use client';

import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PhoneInput } from "@/components/ui/phone-input";

interface PlanNumberProps {
  number: string;
}

export default function PlanNumber({ number }: PlanNumberProps) {
  const t = useTranslations('account_page.number_card');

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl text-left">{t('title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-left">{t('description')}</p>
        <PhoneInput
          disabled
          className="w-full my-2 [&>input]:text-base"
          value={number}
          placeholder={t('phone_placeholder')}
        />
      </CardContent>
    </Card>
  );
}