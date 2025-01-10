import React from "react";

import {fontHead} from "@/ui/fonts";
import {cn} from "@/lib/utils";

export default function Title() {
  return (
    <h1
      className={cn(
        "inline-block w-full px-3 text-center text-3xl font-bold md:max-w-4xl md:text-6xl lg:text-6xl",
        fontHead.className,
      )}
    >
      Pequeños
      <span className="text-purple-400"> recordatorios</span>, grandes soluciones.
    </h1>
  );
}
