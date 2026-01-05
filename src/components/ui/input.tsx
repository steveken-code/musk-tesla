import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-[#888] placeholder:font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-500/30 focus-visible:border-slate-500 disabled:cursor-not-allowed md:text-sm shadow-sm [color:#ffffff_!important] [opacity:1_!important] [font-weight:500_!important] [-webkit-text-fill-color:#ffffff_!important]",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
