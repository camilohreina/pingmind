"use client";

import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useRouter} from "next/navigation";

import {loginSchema, LoginFormData} from "../../lib/schemas";

import {Button} from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {PhoneInput} from "@/components/ui/phone-input";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export function LoginForm() {
  const t = useTranslations("login_page.form");
  const router = useRouter();
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormData) {
    try {
      // Here you would typically call your authentication API
      console.log("Login attempt with:", data);

      // Simulating a successful login
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      router.push("/dashboard");
    } catch (err) {
      console.error("Login failed:", err);
      form.setError("root", {
        type: "manual",
        message: "Invalid credentials. Please try again.",
      });
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{t("title")}</CardTitle>
        <CardDescription>{t("subtitle")}</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("phone_label")}</FormLabel>
                  <FormControl>
                    <PhoneInput defaultCountry="CO" {...field} />
                  </FormControl>
                  <FormDescription>{t("phone_placeholder")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("password_label")}</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.formState.errors.root && (
              <FormMessage>{form.formState.errors.root.message}</FormMessage>
            )}

            <Button className="w-full" disabled={form.formState.isSubmitting} type="submit">
              {form.formState.isSubmitting ? `${t("login_button")}...` : t("login_button")}
            </Button>
          </CardContent>
          <CardFooter>
            <div className="w-full text-center text-sm text-gray-400">
              {t("signup_prompt")}{" "}
              <Link className="underline" href="/signup">
                {t("signup_link")}
              </Link>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
