'use client";';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PhoneInput } from "@/components/ui/phone-input";

interface PlanNumberProps {
  number: string;
}

export default function PlanNumber({ number }: PlanNumberProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl text-left">Tu Plan</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-left">
          Aún no tienes ningún plan activo. ¡Animate a probar PingMind!{" "}
        </p>
        <PhoneInput
          disabled
          className="w-full"
          value={number}
          placeholder="Número de WhatsApp"
        />
      </CardContent>
    </Card>
  );
}
