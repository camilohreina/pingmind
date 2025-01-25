"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

type Props = {};

export default function UpgradeButton({}: Props) {
  /*   const { mutate: createPricingSession } =
    trpc.createPricingSession.useMutation({
      onSuccess: ({ url }) => {
        window.location.href = url ?? '/dashboard/billing';
      },
    }); */

  return (
    <Button
      onClick={() => console.log("create pricing session")}
      className="w-full"
    >
      Upgrade now <ArrowRight className="size-5 ml-1.5" />
    </Button>
  );
}
