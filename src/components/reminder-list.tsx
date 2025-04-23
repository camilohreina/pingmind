"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PencilIcon, TrashIcon, BellIcon, CheckIcon } from "lucide-react";
import { useTranslations } from "next-intl";

type ReminderStatus = "PENDING" | "COMPLETED" | "CANCELLED";

interface Reminder {
  id: string;
  title?: string;
  text: string;
  scheduledAt?: Date;
  localDate?: Date;
  status: ReminderStatus;
  createdAt: Date;
}

interface ReminderListProps {
  filter?: ReminderStatus;
}

export default function ReminderList({ filter }: ReminderListProps) {
  const t = useTranslations("dashboard");
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const url = filter 
          ? `/api/reminders?status=${filter}` 
          : "/api/reminders";
          
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        setReminders(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    fetchReminders();
  }, [filter]);

  const handleUpdateStatus = async (id: string, status: ReminderStatus) => {
    try {
      const response = await fetch(`/api/reminders/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      // Actualizar la lista de recordatorios localmente
      setReminders(
        reminders.map((reminder) =>
          reminder.id === id ? { ...reminder, status } : reminder
        )
      );
    } catch (err) {
      console.error("Error al actualizar el estado:", err);
    }
  };

  const getStatusBadge = (status: ReminderStatus) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">{t("status.pending")}</Badge>;
      case "COMPLETED":
        return <Badge variant="outline" className="bg-green-100 text-green-800">{t("status.completed")}</Badge>;
      case "CANCELLED":
        return <Badge variant="outline" className="bg-red-100 text-red-800">{t("status.cancelled")}</Badge>;
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString();
  };

  if (loading) return <div className="flex justify-center p-8">{t("loading")}</div>;
  if (error) return <div className="text-red-500 p-8">{t("error")}: {error}</div>;
  if (reminders.length === 0) return <div className="p-8">{t("no_reminders")}</div>;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {reminders.map((reminder) => (
        <Card key={reminder.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardDescription className="flex justify-between">
              <span>{formatDate(reminder.createdAt)}</span>
              {getStatusBadge(reminder.status)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{reminder.text}</p>
            {reminder.scheduledAt && (
              <div className="mt-2 flex items-center text-xs text-muted-foreground">
                <BellIcon className="mr-1 h-3 w-3" />
                <span>{formatDate(reminder.scheduledAt)}</span>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between bg-muted/50 px-6 py-3">
            <div className="flex space-x-2">
              {reminder.status === "PENDING" && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleUpdateStatus(reminder.id, "COMPLETED")}
                >
                  <CheckIcon className="h-4 w-4 mr-1" />
                  {t("actions.complete")}
                </Button>
              )}
              {reminder.status === "PENDING" && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleUpdateStatus(reminder.id, "CANCELLED")}
                >
                  <TrashIcon className="h-4 w-4 mr-1" />
                  {t("actions.cancel")}
                </Button>
              )}
            </div>
            <Button variant="outline" size="sm">
              <PencilIcon className="h-4 w-4 mr-1" />
              {t("actions.edit")}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
} 