import {ReactNode} from "react";

import {cn} from "@/lib/utils";

export default function MaxWidthWrapper({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-screen-xl px-4 md:px-30", className)}>
      {children}
    </div>
  );
}
