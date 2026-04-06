import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef(({ className, ...props }, ref) => (
    <textarea
        ref={ref}
        className={cn(
            "flex min-h-[80px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-400 disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-colors",
            className
        )}
        {...props}
    />
));
Textarea.displayName = "Textarea";

export { Textarea };
