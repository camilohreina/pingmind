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


interface PhoneFormProps {
  onSubmit: (phone: string) => void;
}

export default function PhoneForm({ onSubmit }: PhoneFormProps) {
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
                <PhoneInput {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          {t("submit_button")}
        </Button>
      </form>
    </Form>
  );
}
