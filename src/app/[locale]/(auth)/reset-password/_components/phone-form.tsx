"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PhoneInput } from "@/components/ui/phone-input";
import { useTranslations } from "next-intl";
import { PhoneFormValues, phoneSchema } from "@/schemas/auth.schema";
import { Loader2 } from "lucide-react";
import { Country } from "react-phone-number-input";

interface PhoneFormProps {
  onSubmit: (phone: string) => void;
  isLoading: boolean;
  countryCode: Country;
}

export default function PhoneForm({
  onSubmit,
  isLoading,
  countryCode,
}: PhoneFormProps) {
  const t = useTranslations("reset_password_page.phone_form");
  const form = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      phone: "",
    },
  });

  const handleSubmit = (values: PhoneFormValues) => {
    onSubmit(values.phone);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("title")}</FormLabel>
              <FormControl>
                <PhoneInput defaultCountry={countryCode} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button disabled={isLoading} type="submit" className="w-full">
          {isLoading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
          {t("submit_button")}
        </Button>
      </form>
    </Form>
  );
}
