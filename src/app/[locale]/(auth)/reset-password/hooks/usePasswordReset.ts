// hooks/usePasswordReset.ts
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  sendCodeResetPassword,
  verifyCodeResetPassword,
  updatePassword,
} from "@/services/auth";
import { useRouter } from "@/i18n/routing";

type ResetStep = "phone" | "otp" | "newPassword";

interface AsyncActionConfig {
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: () => void;
}

export const usePasswordReset = () => {
  const [step, setStep] = useState<ResetStep>("phone");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const router = useRouter();

  const handleAsyncAction = async <T>(
    action: () => Promise<T>,
    config: AsyncActionConfig = {},
  ) => {
    const {
      successMessage,
      errorMessage = "An error occurred",
      onSuccess,
    } = config;

    setIsLoading(true);
    try {
      const result = await action();

      if (successMessage) {
        toast({
          description: successMessage,
        });
      }

      onSuccess?.();
      return result;
    } catch (error: any) {
      toast({
        description: error?.message || errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneSubmit = async (phoneNumber: string) => {
    await handleAsyncAction(
      async () => {
        const response = await sendCodeResetPassword({ phone: phoneNumber });
        if (!response.ok) {
          throw new Error(response.message);
        }
        return response;
      },
      {
        successMessage: "Verification code sent successfully",
        onSuccess: () => {
          setPhone(phoneNumber);
          setStep("otp");
        },
      },
    );
  };

  const handleOtpSubmit = async (otp: string) => {
    await handleAsyncAction(
      () => verifyCodeResetPassword({ phone, code: otp }),
      {
        successMessage: "Code verified successfully",
        onSuccess: () => setStep("newPassword"),
      },
    );
  };

  const handlePasswordReset = async (newPassword: string) => {
    await handleAsyncAction(
      () =>
        updatePassword({
          phone,
          password: newPassword,
          confirmPassword: newPassword,
        }),
      {
        successMessage: "Password updated successfully",
        onSuccess: () => {
          router.push("/login");
          setStep("phone");
          setPhone("");
        },
      },
    );
  };

  return {
    step,
    phone,
    isLoading,
    handlePhoneSubmit,
    handleOtpSubmit,
    handlePasswordReset,
  };
};
