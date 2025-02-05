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

export default function ResetPassword() {
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
          <CardTitle>Restablecer Contraseña</CardTitle>
          <CardDescription>
            {step === "phone" &&
              "Ingresa tu número de teléfono para recibir un código"}
            {step === "otp" && "Ingresa el código OTP enviado a tu teléfono"}
            {step === "newPassword" && "Ingresa tu nueva contraseña"}
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
