"use client";

import { Button } from "@/components/ui/button";
import { WhatsApp } from "@/components/icons";
import { useTranslations } from "next-intl";

interface WhatsAppInvitationProps {
  userPhone?: string;
  className?: string;
}

export default function WhatsAppInvitation({
  userPhone,
  className,
}: WhatsAppInvitationProps) {
  const t = useTranslations(
    "account_page.subscription_card.whatsapp_invitation",
  );

  // WhatsApp number from environment or fallback
  const whatsappNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ||
    process.env.WHATSAPP_NUMBER ||
    "447908679639";

  // Create WhatsApp URL with pre-filled message
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hello!")}`;

  const handleOpenWhatsApp = () => {
    window.open(whatsappUrl, "_blank");
  };

  return (
    <Button
      onClick={handleOpenWhatsApp}
      variant="outline"
      size="sm"
      className="w-full bg-green-800 mt-4 border-green-800 text-white hover:bg-green-200 hover:border-green-200 hover:text-green-800 transition-colors duration-300"
    >
      {t("title")}
      <WhatsApp className="w-4 h-4 mr-2" />
    </Button>
  );
}
