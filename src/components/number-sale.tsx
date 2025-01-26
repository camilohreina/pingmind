"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { CheckIcon, Files } from "lucide-react";
import { WhatsApp } from "./icons";
import { Link } from "@/i18n/routing";

type Props = {};

export async function copyToClipboardWithMeta(value: string) {
  navigator.clipboard.writeText(value);
}

const PHONE_NUMBER = "+44 7908 679639";

export default function NumberSale({}: Props) {
  const [hasCopied, setHasCopied] = React.useState(false);

  React.useEffect(() => {
    setTimeout(() => {
      setHasCopied(false);
    }, 2000);
  }, [hasCopied]);

  return (
    <div className="flex flex-col gap-4 my-3 max-w-md mx-auto">
      <Button
        asChild
        className="px-12 py-4 rounded-full bg-green-600 font-bold text-white tracking-widest uppercase transform hover:scale-105 hover:bg-[#21e065] duration-200 transition-transform"
      >
        <Link
          href="https://wa.me/447908679639?text=Hello!"
          target="_blank"
          rel="noopener noreferrer"
        >
          Start with whatsapp
          <WhatsApp />
        </Link>
      </Button>
      <p className="text-gray-400 text-sm">or add contact manually</p>

      <Button
        variant="ghost"
        className="flex cursor-pointer justify-center items-center border border-dashed border-gray-600 p-2 rounded-md transform hover:scale-105 duration-300 transition-all"
        onClick={() => {
          copyToClipboardWithMeta(PHONE_NUMBER);
          setHasCopied(true);
        }}
      >
        {PHONE_NUMBER}
        {hasCopied ? <CheckIcon /> : <Files />}
      </Button>
    </div>
  );
}
