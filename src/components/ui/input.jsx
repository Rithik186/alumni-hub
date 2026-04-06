import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef(({ className, type = "text", ...props }, ref) => (
    <input
        type={type}
        ref={ref}
        className={cn(
            "flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 disabled:cursor-not-allowed disabled:opacity-50",
            className
        )}
        {...props}
    />
));
Input.displayName = "Input";

export { Input };
