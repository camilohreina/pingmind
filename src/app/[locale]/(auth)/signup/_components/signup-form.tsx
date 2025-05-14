"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signUpSchema, SignUpFormData } from "@/schemas/auth.schema";
import { PhoneInput } from "@/components/ui/phone-input";
import { Link, useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { useMutation, useQuery } from "@tanstack/react-query";
import { signup } from "@/services/auth";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { detectUserCountry } from "@/services/utils.services";
import { Country } from "react-phone-number-input";

interface Props {
  phone: null | string;
}

export default function SignUpForm({ phone }: Props) {
  const [countryCode, setCountryCode] = useState<Country>("US");
  const t = useTranslations("signup_page.form");
  const router = useRouter();
  const { mutateAsync: signupFn, isPending } = useMutation({
    mutationFn: (data: SignUpFormData) => {
      return signup(data);
    },
  });

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      phone: phone ? `+${phone}` : "",
      password: "",
      country: "",
    },
  });

  useEffect(() => {
    detectUserCountry().then((country_code: Country) => {
      if (country_code) {
        setCountryCode(country_code);
      }
    });
  }, []);

  async function onSubmit(data: SignUpFormData) {
    try {
      await signupFn(data);
      router.push("/login");
    } catch (err) {
      console.error("Sign up failed:", err);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{t("signUpTitle")}</CardTitle>
        <CardDescription>{t("signUpDescription")}</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("nameLabel")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("namePlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("phoneLabel")}</FormLabel>
                  <FormControl>
                    <PhoneInput
                      onCountryChange={(country) => {
                        form.setValue("country", country ? country : "");
                      }}
                      {...field}
                      defaultCountry={countryCode}
                    />
                  </FormControl>
                  <FormDescription>{t("phoneDescription")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("passwordLabel")}</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormDescription>{t("passwordDescription")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.formState.errors.root && (
              <FormMessage>{form.formState.errors.root.message}</FormMessage>
            )}
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending && <Loader2 className="animate-spin mr-2" size={20} />}
              {isPending ? t("submittingButton") : t("submitButton")}
            </Button>
          </CardContent>
          <CardFooter>
            <div className="w-full text-center text-sm text-gray-400">
              {t("loginPrompt")}{" "}
              <Link className="underline" href="/login">
                {t("loginLink")}
              </Link>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
