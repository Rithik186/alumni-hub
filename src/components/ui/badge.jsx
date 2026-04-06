import * as React from "react";
import { cn } from "@/lib/utils";

const Badge = React.forwardRef(({ className, variant = "default", ...props }, ref) => {
    const variants = {
        default: "border-transparent bg-teal-600 text-white",
        secondary: "border-transparent bg-slate-100 text-slate-700",
        destructive: "border-transparent bg-rose-500 text-white",
        outline: "text-slate-700 border-slate-200",
        success: "border-transparent bg-emerald-100 text-emerald-700",
        warning: "border-transparent bg-amber-100 text-amber-700",
        teal: "border-transparent bg-teal-50 text-teal-700",
    };
    return (
        <span
            ref={ref}
            className={cn(
                "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold transition-colors",
                variants[variant] || variants.default,
                className
            )}
            {...props}
        />
    );
});
Badge.displayName = "Badge";

export { Badge };
