import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import SignUpButton from "./signup-button";
import { Check, HelpCircle, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import LocalPricing from "./local-pricing";

const PlanCard = ({
  plan,
  tagline,
  quota,
  features,
  price,
  isPro,
  user,
  t,
}: any) => {
  return (
    <div
      className={cn("relative rounded-2xl shadow-lg", {
        "border-2 border-green-800 shadow-green-400": isPro,
        "border border-gray-600": !isPro,
      })}
    >
      {isPro && (
        <div className="absolute -top-5 left-0 right-0 mx-auto w-32 rounded-full bg-gradient-to-r from-green-600 to-green-500 px-2 py-2 text-sm font-medium text-white">
          {t("plans.tooltips.upgrade_now")}
        </div>
      )}
      <div className="p-5">
        <h3 className="my-3 text-center text-3xl font-bold">{plan}</h3>
        <p className="text-gray-500">{tagline}</p>
        <p className="mt-5 text-4xl font-semibold">USD ${price} </p>
        <p className=" text-gray-500"> {t("plans.tooltips.due_time")}</p>
        <LocalPricing price={price} className="flex my-3 items-center flex-col" />
      </div>
      <div className="flex h-20 items-center justify-center border-b border-t border-gray-800">
        <div className="flex items-center space-x-1">
          <p>
            {t("plans.tooltips.reminders_included.limited", {
              quota: quota.toLocaleString(),
            })}
          </p>
        </div>
      </div>
      <ul className="my-10 space-y-5 px-8">
        {features.map(({ text, footnote, negative }: any) => (
          <li key={text} className="flex space-x-5">
            <div className="flex-shrink-0">
              {negative ? (
                <Minus className="size-6 text-gray-300" />
              ) : (
                <Check className="size-6 text-green-500" />
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
                  <TooltipContent className="w-80 p-2">
                    {footnote}
                  </TooltipContent>
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

export default PlanCard;
