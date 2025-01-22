import { TRIGGER_REGISTER_WORDS } from "@/config/constants";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const shouldReplyToMessage = (message: string): boolean => {
  const normalizedMessage = message.toLowerCase();
  return TRIGGER_REGISTER_WORDS.some((word) =>
    normalizedMessage.includes(word),
  );
};
