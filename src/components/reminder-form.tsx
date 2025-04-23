"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const reminderSchema = z.object({
  title: z.string().optional(),
  text: z.string().min(3, { message: "El texto debe tener al menos 3 caracteres" }),
  date: z.date().optional(),
  time: z.string().optional(),
});

type ReminderFormValues = z.infer<typeof reminderSchema>;

interface ReminderFormProps {
  editingReminder?: {
    id: string;
    title?: string;
    text: string;
    scheduledAt?: Date;
  };
  onSuccess: () => void;
}

export default function ReminderForm({ editingReminder, onSuccess }: ReminderFormProps) {
  const t = useTranslations("dashboard.form");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues: Partial<ReminderFormValues> = {
    title: editingReminder?.title || "",
    text: editingReminder?.text || "",
    date: editingReminder?.scheduledAt ? new Date(editingReminder.scheduledAt) : undefined,
    time: editingReminder?.scheduledAt 
      ? format(new Date(editingReminder.scheduledAt), "HH:mm") 
      : undefined,
  };

  const form = useForm<ReminderFormValues>({
    resolver: zodResolver(reminderSchema),
    defaultValues,
  });

  const onSubmit = async (data: ReminderFormValues) => {
    setIsSubmitting(true);
    
    try {
      let scheduledAt: Date | undefined = undefined;
      
      if (data.date) {
        scheduledAt = new Date(data.date);
        
        if (data.time) {
          const [hours, minutes] = data.time.split(":").map(Number);
          scheduledAt.setHours(hours, minutes);
        }
      }
      
      const reminderData = {
        title: data.title,
        text: data.text,
        scheduledAt,
      };
      
      const url = editingReminder 
        ? `/api/reminders/${editingReminder.id}` 
        : "/api/reminders";
      
      const method = editingReminder ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reminderData),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      form.reset();
      onSuccess();
    } catch (error) {
      console.error("Error al guardar el recordatorio:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editingReminder ? t("edit_title") : t("add_title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("title.label")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("title.placeholder")} {...field} />
                  </FormControl>
                  <FormDescription>{t("title.description")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("text.label")}</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder={t("text.placeholder")} 
                      {...field} 
                      rows={3}
                    />
                  </FormControl>
                  <FormDescription>{t("text.description")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>{t("date.label")}</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: es })
                            ) : (
                              <span>{t("date.placeholder")}</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date: Date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>{t("date.description")}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("time.label")}</FormLabel>
                    <FormControl>
                      <Input 
                        type="time" 
                        placeholder={t("time.placeholder")} 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>{t("time.description")}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <CardFooter className="px-0 pt-6">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t("submitting") : (editingReminder ? t("update") : t("create"))}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
} 