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

export default function ResetPassword() {
  const t = useTranslations("reset_password_page");
  const [step, setStep] = useState<"phone" | "otp" | "newPassword">("phone");
  const [phone, setPhone] = useState("");

  const handlePhoneSubmit = async (phoneNumber: string) => {
    // Simular envío de OTP
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setPhone(phoneNumber);
    setStep("otp");
  };

  const handleOtpSubmit = async (otp: string) => {
    // Simular verificación de OTP
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setStep("newPassword");
  };

  const handlePasswordReset = async (newPassword: string) => {
    // Simular actualización de contraseña
    await new Promise((resolve) => setTimeout(resolve, 1000));
    alert("Contraseña actualizada con éxito");
    // Aquí podrías redirigir al usuario a la página de inicio de sesión
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
          {step === "phone" && <PhoneForm onSubmit={handlePhoneSubmit} />}
          {step === "otp" && (
            <OtpForm onSubmit={handleOtpSubmit} phone={phone} />
          )}
          {step === "newPassword" && (
            <NewPasswordForm onSubmit={handlePasswordReset} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
