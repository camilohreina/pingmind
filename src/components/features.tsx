"use client";
import React from "react";
import {Calendar, BellRing, Receipt, Rss, Workflow, RefreshCcwDot} from "lucide-react";

import SpotlightCard from "./ui/spotlight-card";

import {cn} from "@/lib/utils";
import {fontHead} from "@/ui/fonts";

const FEATURES_INFO = [
  {
    id: "0",
    title: "Recordatorios Puntuales",
    text: "Recibe notificaciones exactas en el momento indicado para que nunca olvides tus tareas importantes.",
    icon: BellRing,
  },
  {
    id: "1",
    title: "Automatización Inteligente",
    text: "Nuestra IA guarda tus mensajes y los transforma en recordatorios sin esfuerzo adicional.",
    icon: RefreshCcwDot,
    iconColor: "bg-yellow-300",
  },
  {
    id: "2",
    title: "Integración con WhatsApp",
    text: "Todo ocurre en tu chat favorito, sin necesidad de descargar más aplicaciones.",
    icon: Workflow,
  },
];

export default function Features() {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {FEATURES_INFO.map(({id, text, title, icon}) => (
        <InfoFeatureCard key={id} icon={icon} text={text} title={title} />
      ))}
    </section>
  );
}

type PropsInfoCard = {
  title: string;
  icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  text: string;
};

function InfoFeatureCard({icon: Icon, title, text}: PropsInfoCard) {
  return (
    <SpotlightCard>
      <div className="6 flex flex-col items-start justify-start">
        <div className={cn("mb-10 rounded-lg border-gray-200 p-2.5")}>
          <Icon className="size-8 text-white" />
        </div>
        <h3
          className={`${fontHead.className} mb-4 text-start text-2xl font-medium md:text-xl lg:text-2xl`}
        >
          {title}
        </h3>
        <p className="text-slate text-start opacity-50">{text}</p>
      </div>
    </SpotlightCard>
  );
}
