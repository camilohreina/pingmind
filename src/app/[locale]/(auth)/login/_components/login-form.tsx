"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormData } from "@/schemas/auth.schema";
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
import { PhoneInput } from "@/components/ui/phone-input";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { useMutation } from "@tanstack/react-query";
import { login } from "@/services/auth";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { detectUserCountry } from "@/services/utils.services";
import { Country } from "react-phone-number-input";

export function LoginForm() {
  const [countryCode, setCountryCode] = useState<Country>("US");
  const { toast } = useToast();
  const t = useTranslations("login_page.form");
  const router = useRouter();
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      phone: "",
      password: "",
    },
  });

  useEffect(() => {
    detectUserCountry().then((country_code: Country) => {
      if (country_code) {
        setCountryCode(country_code);
      }
    });
  }, []);

  const toastSuccessLogin = () => {
    toast({
      title: t("toast.success.title"),
      description: t("toast.success.description"),
    });
  };

  const toastFailedLogin = () => {
    toast({
      title: t("toast.error.title"),
      description: t("toast.error.description"),
    });
  };

  const { mutateAsync: loginFn, isPending } = useMutation({
    mutationFn: (data: LoginFormData) => {
      return login(data);
    },
    onSuccess: (response) => {
      if (response?.error) {
        return toastFailedLogin();
      }
      toastSuccessLogin();
      router.push("/account");
    },
    onError: (err) => {
      toastFailedLogin();
    },
  });

  async function onSubmit(data: LoginFormData) {
    try {
      // Here you would typically call your authentication API
      loginFn(data);

      // Simulating a successful login
      //await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate API call
      //router.push("/dashboard");
    } catch (err) {
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
                    <PhoneInput defaultCountry={countryCode} {...field} />
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
                  <div className="flex justify-between">
                    <FormLabel>{t("password_label")}</FormLabel>
                    <Link
                      href="/reset-password"
                      className="ml-auto inline-block text-sm hover:underline"
                    >
                      {t("reset_password")}
                    </Link>
                  </div>
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

            <Button className="w-full " disabled={isPending} type="submit">
              {isPending && <Loader2 className="animate-spin mr-2" size={20} />}
              {isPending ? `${t("login_button")}...` : t("login_button")}
            </Button>
          </CardContent>
          <CardFooter>
            <div className="w-full text-center text-sm text-gray-400">
              {t("signup_prompt")}{" "}
              <Link className="hover:underline text-primary" href="/signup">
                {t("signup_link")}
              </Link>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
