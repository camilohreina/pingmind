import React from "react";
import { BellRing, Workflow, RefreshCcwDot, AlarmClock, Angry, LayoutDashboard } from "lucide-react";
import SpotlightCard from "./ui/spotlight-card";
import { cn } from "@/lib/utils";
import { fontHead } from "@/ui/fonts";
import { useTranslations } from "next-intl";

interface FeatureInfo {
  id: string;
  title: string;
  text: string;
  icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
}

const FEATURES_INFO = (): FeatureInfo[] => {
  const t = useTranslations("home_page");

  return [
    {
      id: "0",
      title: t("features.0.title"),
      text: t("features.0.text"),
      icon: Angry,
    },
    {
      id: "1",
      title: t("features.1.title"),
      text: t("features.1.text"),
      icon: LayoutDashboard,
    },
    {
      id: "2",
      title: t("features.2.title"),
      text: t("features.2.text"),
      icon: AlarmClock,
    },
  ];
};

export default function Features() {
  const features = FEATURES_INFO();
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {features.map(({ id, text, title, icon }) => (
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

function InfoFeatureCard({ icon: Icon, title, text }: PropsInfoCard) {
  return (
    <SpotlightCard>
      <div className="6 flex flex-col items-start justify-start">
        <div className={cn("mb-10 rounded-lg border-gray-200 p-2.5")}>
          <Icon className="size-10 text-white" />
        </div>
        <h3
          className={`${fontHead.className} mb-4 text-start text-2xl font-medium md:text-xl lg:text-2xl`}
        >
          {title}
        </h3>
        <p className="text-start opacity-50">{text}</p>
      </div>
    </SpotlightCard>
  );
}
