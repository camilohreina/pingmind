"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
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
import { signUpSchema, SignUpFormData } from "../../lib/schemas";
import { PhoneInput } from "@/components/ui/phone-input";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

export default function SignUpForm() {
  const t = useTranslations("signup_page.form");
  const router = useRouter();

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: SignUpFormData) {
    try {
      console.log("Sign up attempt with:", data);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      router.push("/dashboard");
    } catch (err) {
      console.error("Sign up failed:", err);
      form.setError("root", {
        type: "manual",
        message: t("rootErrorMessage"),
      });
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
                    <PhoneInput defaultCountry="US" {...field} />
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
            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting
                ? t("submittingButton")
                : t("submitButton")}
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
