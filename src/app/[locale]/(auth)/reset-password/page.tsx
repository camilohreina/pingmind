"use client";

import { useState } from "react";
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
import {
  sendCodeResetPassword,
  updatePassword,
  verifyCodeResetPassword,
} from "@/services/auth";

export default function ResetPassword() {
  const t = useTranslations("reset_password_page");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"phone" | "otp" | "newPassword">("phone");
  const [phone, setPhone] = useState("");

  const handlePhoneSubmit = async (phoneNumber: string) => {
    setIsLoading(true);
    await sendCodeResetPassword({ phone: phoneNumber });
    setPhone(phoneNumber);
    setStep("otp");
    setIsLoading(false);
  };

  const handleOtpSubmit = async (otp: string) => {
    setIsLoading(true);
    await verifyCodeResetPassword({ phone, code: otp });
    setStep("newPassword");
    setIsLoading(false);
  };

  const handlePasswordReset = async (newPassword: string) => {
    setIsLoading(true);
    await updatePassword({
      phone,
      password: newPassword,
      confirmPassword: newPassword,
    });
    setIsLoading(false);
  };

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
            <PhoneForm onSubmit={handlePhoneSubmit} isLoading={isLoading} />
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
