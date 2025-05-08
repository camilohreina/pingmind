"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import PhoneForm from "./_components/phone-form";
import OtpForm from "./_components/otp-form";
import NewPasswordForm from "./_components/new-password-form";
import { useTranslations } from "next-intl";
import { usePasswordReset } from "./hooks/usePasswordReset";
import { useEffect, useState } from "react";
import { detectUserCountry } from "@/services/utils.services";
import { Country } from "react-phone-number-input";

export default function ResetPassword() {
  const [countryCode, setCountryCode] = useState<Country>("US"); 
  const t = useTranslations("reset_password_page");

  const {
    step,
    phone,
    isLoading,
    handlePhoneSubmit,
    handleOtpSubmit,
    handlePasswordReset,
  } = usePasswordReset();

  useEffect(() => {
    detectUserCountry().then((country_code: Country) => {
      if (country_code) {
        setCountryCode(country_code);
      }
    });
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>
            {step === "phone" && t("description.phone")}
            {step === "otp" && t("description.otp")}
            {step === "newPassword" && t("description.newPassword")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "phone" && (
            <PhoneForm onSubmit={handlePhoneSubmit} isLoading={isLoading} countryCode={countryCode} />
          )}
          {step === "otp" && (
            <OtpForm
              onSubmit={handleOtpSubmit}
              phone={phone}
              isLoading={isLoading}
            />
          )}
          {step === "newPassword" && (
            <NewPasswordForm
              onSubmit={handlePasswordReset}
              isLoading={isLoading}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
