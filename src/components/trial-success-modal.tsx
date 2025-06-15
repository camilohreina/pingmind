"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle, Sparkles } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Confetti from "react-confetti";
import WhatsAppInvitation from "./whatsapp-invitation";

interface TrialSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  trialEndDate: Date;
}

export default function TrialSuccessModal({
  isOpen,
  onClose,
  trialEndDate,
}: TrialSuccessModalProps) {
  const [windowDimensions, setWindowDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [showConfetti, setShowConfetti] = useState(false);
  const t = useTranslations("trial_modal");
  const locale = useLocale();

  useEffect(() => {
    const updateWindowDimensions = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    if (typeof window !== "undefined") {
      updateWindowDimensions();
      window.addEventListener("resize", updateWindowDimensions);
      return () => window.removeEventListener("resize", updateWindowDimensions);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      // Stop confetti after 3 seconds
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  const getDaysRemaining = (endDate: Date) => {
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <>
      {showConfetti && (
        <Confetti
          width={windowDimensions.width}
          height={windowDimensions.height}
          recycle={true}
          numberOfPieces={400}
          gravity={0.8}
          style={{
            position: "fixed",
            zIndex: 9999,
            pointerEvents: "none",
          }}
        />
      )}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-sm ">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <DialogTitle className="text-2xl font-bold text-green-700 dark:text-green-400">
              {t("title")}
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground">
              {t("subtitle")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border bg-gradient-to-r from-blue-50 to-purple-50 p-4 dark:from-blue-950/50 dark:to-purple-950/50">
              <div className="flex items-center space-x-3">
                <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <div>
                  <p className="font-semibold text-purple-800 dark:text-purple-200">
                    {t("trial_active")}
                  </p>
                  <p className="text-sm text-purple-600 dark:text-purple-300">
                    {t("enjoy_features")}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border bg-gray-50 p-4 dark:bg-gray-900/50">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {t("trial_ends")}
                  </p>
                  <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    {formatDate(trialEndDate)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t("days_remaining", {
                      days: getDaysRemaining(trialEndDate),
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>{t("reminder")}:</strong> {t("reminder_text")}
              </p>
            </div>
          </div>

          <div className="flex flex-col space-y-2 pt-4">
            <WhatsAppInvitation />
            <Button variant="outline" onClick={onClose} className="w-full">
              {t("close")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
