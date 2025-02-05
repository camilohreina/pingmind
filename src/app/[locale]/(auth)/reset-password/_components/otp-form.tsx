"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useTranslations } from "next-intl";

const otpSchema = z.object({
  otp: z.string().length(6, "El código OTP debe tener 6 dígitos"),
});

type OtpFormValues = z.infer<typeof otpSchema>;

interface OtpFormProps {
  onSubmit: (otp: string) => void;
  phone: string;
}

export default function OtpForm({ onSubmit, phone }: OtpFormProps) {
  const form = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });
  const t = useTranslations("reset_password_page.otp_form");
  const handleSubmit = (values: OtpFormValues) => {
    onSubmit(values.otp);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="otp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("label")}</FormLabel>
              <FormControl>
                <InputOTP maxLength={6} {...field}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormDescription>{t("description")}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <p className="text-sm text-gray-500">
          {t("phone_message")} {phone}
        </p>
        <Button type="submit" className="w-full">
          {t("verify_button")}
        </Button>
      </form>
    </Form>
  );
}
