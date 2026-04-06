import * as React from "react";
import { cn } from "@/lib/utils";

const buttonVariants = {
    default: "bg-teal-600 text-white shadow-sm hover:bg-teal-700",
    destructive: "bg-rose-500 text-white shadow-sm hover:bg-rose-600",
    outline: "border border-slate-200 bg-white shadow-sm hover:bg-slate-50 text-slate-700",
    secondary: "bg-slate-100 text-slate-800 shadow-sm hover:bg-slate-200",
    ghost: "hover:bg-slate-100 text-slate-700",
    link: "text-teal-600 underline-offset-4 hover:underline",
};

const buttonSizes = {
    default: "h-9 px-4 py-2",
    sm: "h-8 rounded-md px-3 text-xs",
    lg: "h-10 rounded-md px-6",
    icon: "h-9 w-9",
};

const Button = React.forwardRef(({ className, variant = "default", size = "default", ...props }, ref) => (
    <button
        ref={ref}
        className={cn(
            "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-xs font-semibold transition-all disabled:pointer-events-none disabled:opacity-50",
            buttonVariants[variant],
            buttonSizes[size],
            className
        )}
        {...props}
    />
));
Button.displayName = "Button";

export { Button, buttonVariants };
