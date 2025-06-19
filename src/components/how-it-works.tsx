import { fontHead } from "@/ui/fonts";
import { useTranslations } from "next-intl";

interface StepCard {
  id: number;
  title: string;
  description: string;
  className?: string;
}

interface StepCardProps {
  step: StepCard;
}

function StepCard({ step }: StepCardProps) {
  return (
    <div className="text-center">
      <div className="mb-6">
        <div className="w-20 h-20 border-green-500 border rounded-full flex items-center justify-center mx-auto shadow-lg">
          <span className="text-2xl font-bold text-white">{step.id}</span>
        </div>
      </div>
      <h3 className={`${fontHead.className} text-xl md:text-2xl font-semibold text-gray-200 mb-4`}>
        {step.title}
      </h3>
      <p className={`opacity-50 leading-relaxed ${step.className || ""}`}>
        {step.description}
      </p>
    </div>
  );
}

export default function HowItWorksSection() {
  const t = useTranslations("home_page.how_it_works");

  const steps: StepCard[] = [
    {
      id: 1,
      title: t("steps.0.title"),
      description: t("steps.0.description"),
    },
    {
      id: 2,
      title: t("steps.1.title"), 
      description: t("steps.1.description"),
    },
    {
      id: 3,
      title: t("steps.2.title"),
      description: t("steps.2.description"),
    }
  ];

  return (
    <section className="">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 md:mb-20">
          <h2 className={`${fontHead.className} text-3xl md:text-4xl lg:text-5xl font-bold text-gray-200 mb-6 leading-tight`}>
            {t("title")}
          </h2>
          <p className="text-lg opacity-50 max-w-3xl mx-auto leading-relaxed">
            {t("description")}
          </p>
        </div>

        {/* Steps - Horizontal Layout */}
        <div className="grid md:grid-cols-3 gap-8 md:gap-12 mb-16">
          {steps.map((step) => (
            <StepCard key={step.id} step={step} />
          ))}
        </div>
      </div>
    </section>
  );
}
