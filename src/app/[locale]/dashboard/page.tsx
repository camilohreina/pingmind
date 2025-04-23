"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import ReminderList from "@/components/reminder-list";
import ReminderForm from "@/components/reminder-form";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MaxWidthWrapper from "@/components/max-width-wrapper";

export default function Dashboard() {
  const t = useTranslations("dashboard");
  const [isAddingReminder, setIsAddingReminder] = useState(false);
  const [editingReminder, setEditingReminder] = useState<{
    id: string;
    title?: string;
    text: string;
    scheduledAt?: Date;
  } | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSuccess = () => {
    setIsAddingReminder(false);
    setEditingReminder(null);
    // Forzar actualización de la lista de recordatorios
    setRefreshKey(prev => prev + 1);
  };

  return (
    <MaxWidthWrapper className="py-8">
      <div className="flex flex-col space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
            <p className="text-muted-foreground">{t("subtitle")}</p>
          </div>
          
          {!isAddingReminder && !editingReminder && (
            <Button onClick={() => setIsAddingReminder(true)}>
              <Plus className="mr-2 h-4 w-4" />
              {t("add_reminder")}
            </Button>
          )}
          
          {(isAddingReminder || editingReminder) && (
            <Button variant="outline" onClick={() => {
              setIsAddingReminder(false);
              setEditingReminder(null);
            }}>
              <X className="mr-2 h-4 w-4" />
              {t("cancel")}
            </Button>
          )}
        </div>
        
        {(isAddingReminder || editingReminder) && (
          <div className="md:max-w-2xl mx-auto w-full">
            <ReminderForm 
              editingReminder={editingReminder || undefined} 
              onSuccess={handleSuccess}
            />
          </div>
        )}
        
        {!isAddingReminder && !editingReminder && (
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">{t("tabs.all")}</TabsTrigger>
              <TabsTrigger value="pending">{t("tabs.pending")}</TabsTrigger>
              <TabsTrigger value="completed">{t("tabs.completed")}</TabsTrigger>
              <TabsTrigger value="cancelled">{t("tabs.cancelled")}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-0">
              <ReminderList key={`all-${refreshKey}`} />
            </TabsContent>
            
            <TabsContent value="pending" className="mt-0">
              <ReminderList key={`pending-${refreshKey}`} filter="PENDING" />
            </TabsContent>
            
            <TabsContent value="completed" className="mt-0">
              <ReminderList key={`completed-${refreshKey}`} filter="COMPLETED" />
            </TabsContent>
            
            <TabsContent value="cancelled" className="mt-0">
              <ReminderList key={`cancelled-${refreshKey}`} filter="CANCELLED" />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </MaxWidthWrapper>
  );
}