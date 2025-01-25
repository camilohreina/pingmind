import MaxWidthWrapper from "@/components/max-width-wrapper";
import { PLANS } from "@/config/pricing";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Check, HelpCircle, Minus } from "lucide-react";
import { getUserServerSession } from "@/lib/auth";
import SignUpButton from "./_components/signup-button";
import Header from "@/components/header";

type Props = {};

const pricingItems = [
  {
    plan: "Starter",
    tagline: "For personal use with basic needs.",
    quota: PLANS.find((p) => p.slug === "starter")!.quota,
    features: [
      { text: "WhatsApp reminders support." },
      {
        text: "Voice recognition",
        footnote: "Transcribe audio content to text with our AI.",
      },
      {
        text: "List creation",
        footnote: "Get list from your reminders.",
      },
      {
        text: "Image recognition",
        footnote: "Extract text from images and manage reminders.",
        negative: true,
      },
      { text: "Early access features", negative: true },
      { text: "Priority support", negative: true },
    ],
  },
  {
    plan: "Pro",
    tagline: "For larger reminders with higher needs.",
    quota: PLANS.find((p) => p.slug === "pro")!.quota,
    features: [
      { text: "WhatsApp reminders support." },
      {
        text: "Voice recognition",
        footnote: "Transcribe audio content to text with our AI.",
      },
      {
        text: "List creation",
        footnote: "Get list from your reminders.",
      },
      {
        text: "Image recognition",
        footnote: "Extract text from images and manage reminders.",
      },
      { text: "Early access features" },
      { text: "Priority support" },
    ],
  },
];

const PlanCard = ({
  plan,
  tagline,
  quota,
  features,
  price,
  isPro,
  user,
}: any) => {
  return (
    <div
      className={cn("relative rounded-2xl shadow-lg", {
        "border-2 border-purple-800 shadow-purple-400": isPro,
        "border border-gray-600": !isPro,
      })}
    >
      {isPro && (
        <div className="absolute -top-5 left-0 right-0 mx-auto w-32 rounded-full bg-gradient-to-r from-purple-600 to-violet-500 px-2 py-2 text-sm font-medium text-white">
          Upgrade Now
        </div>
      )}
      <div className="p-5">
        <h3 className="my-3 text-center text-3xl font-bold">{plan}</h3>
        <p className="text-gray-500">{tagline}</p>
        <p className="my-5 text-6xl font-semibold">${price}</p>
        <p className="text-gray-500">per month</p>
      </div>
      <div className="flex h-20 items-center justify-center border-b border-t border-gray-800">
        <div className="flex items-center space-x-1">
          <p>{isPro ? "Unlimited reminders included" : `${quota.toLocaleString()} reminders included`}</p>
          <Tooltip delayDuration={300}>
            <TooltipTrigger className="cursor-default ml-1.5">
              <HelpCircle className="size-4 text-zinc-500" />
            </TooltipTrigger>
            <TooltipContent className="w-80 p-2">
              {isPro
                ? "No limit on the number of reminders you can create."
                : `You can create up to ${quota.toLocaleString()} reminders per month.`}
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      <ul className="my-10 space-y-5 px-8">
        {features.map(({ text, footnote, negative }: any) => (
          <li key={text} className="flex space-x-5">
            <div className="flex-shrink-0">
              {negative ? (
                <Minus className="size-6 text-gray-300" />
              ) : (
                <Check className="size-6 text-purple-500" />
              )}
            </div>
            {footnote ? (
              <div className="flex items-center space-x-1">
                <p
                  className={cn("text-gray-400", {
                    "text-gray-600": negative,
                  })}
                >
                  {text}
                </p>
                <Tooltip delayDuration={300}>
                  <TooltipTrigger className="cursor-default ml-1.5">
                    <HelpCircle className="size-4 text-zinc-500" />
                  </TooltipTrigger>
                  <TooltipContent className="w-80 p-2">{footnote}</TooltipContent>
                </Tooltip>
              </div>
            ) : (
              <p
                className={cn("text-gray-400", {
                  "text-gray-600": negative,
                })}
              >
                {text}
              </p>
            )}
          </li>
        ))}
      </ul>
      <div className="border-t border-gray-600"></div>
      <div className="p-5">
        <SignUpButton plan={plan} user={user} />
      </div>
    </div>
  );
};

export default async function Page({}: Props) {
  const user = await getUserServerSession();

  return (
    <>
      <Header />
      <MaxWidthWrapper className="mb-8 mt-24 text-center max-w-5xl">
        <div className="mx-auto mb-10 sm:max-w-lg">
          <h1 className="text-6xl font-bold sm:text-7xl">Pricing</h1>
          <p className="mt-5 text-gray-400 sm:text-lg">
            Whether you&apos;re just trying out our service or need more,
            we&apos;ve got you covered.
          </p>
        </div>
        <div className="pt-12 grid grid-cols-1 gap-10 lg:grid-cols-2">
          <TooltipProvider>
            {pricingItems.map(({ plan, tagline, quota, features }) => {
              const price =
                PLANS.find((p) => p.slug === plan.toLowerCase())?.price
                  .amount || 0;
              return (
                <PlanCard
                  key={plan}
                  plan={plan}
                  tagline={tagline}
                  quota={quota}
                  features={features}
                  price={price}
                  isPro={plan === "Pro"}
                  user={user}
                />
              );
            })}
          </TooltipProvider>
        </div>
      </MaxWidthWrapper>
    </>
  );
}
