"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TimezoneCombobox } from "@/components/ui/timezone-combobox";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { updateUserTimezone } from "@/services/utils.services";

interface TimezoneCardProps {
  currentTimezone: string;
  userId: string;
}

export default function TimezoneCard({
  currentTimezone,
  userId,
}: TimezoneCardProps) {
  const t = useTranslations("account_page.timezone_card");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: session, update } = useSession();
  const [selectedTimezone, setSelectedTimezone] = useState(
    session?.user?.timezone || currentTimezone,
  );

  const updateTimezoneMutation = useMutation({
    mutationFn: (timezone: string) => updateUserTimezone(userId, timezone),
    onSuccess: async (data) => {
      toast({
        title: t("success_message"),
        variant: "default",
      });
      if (!session || !data?.timezone) return;
      await update({ timezone: data?.timezone });
      setSelectedTimezone(data.timezone);
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error: Error) => {
      toast({
        title: t("error_message"),
        description: error.message,
        variant: "destructive",
      });
      // Reset to current timezone on error
      setSelectedTimezone(currentTimezone);
    },
  });

  const hasChanges = selectedTimezone !== session?.user?.timezone;

  const handleUpdate = () => {
    if (!hasChanges) {
      toast({
        title: "No changes detected",
        description: "Please select a different timezone to update.",
        variant: "default",
      });
      return;
    }
    updateTimezoneMutation.mutate(selectedTimezone);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl text-left">{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-left text-muted-foreground">{t("description")}</p>

        <div className="flex flex-col space-y-2">
          <label className="text-sm font-medium text-left">
            {t("current_timezone")}
          </label>
          <TimezoneCombobox
            value={selectedTimezone}
            onValueChange={setSelectedTimezone}
            disabled={updateTimezoneMutation.isPending}
          />
        </div>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-left">
            {t("disclaimer")}
          </AlertDescription>
        </Alert>

        <Button
          onClick={handleUpdate}
          disabled={!hasChanges || updateTimezoneMutation.isPending}
          className="w-full"
        >
          {updateTimezoneMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("updating_button")}
            </>
          ) : (
            t("update_button")
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
