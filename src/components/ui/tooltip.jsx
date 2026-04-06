import * as React from "react";
import { cn } from "@/lib/utils";

const TooltipProvider = ({ children }) => <>{children}</>;

const TooltipContext = React.createContext({
    show: false,
    setShow: () => {},
});

const Tooltip = ({ children, delayDuration = 200 }) => {
    const [show, setShow] = React.useState(false);
    const timeoutRef = React.useRef(null);

    const handleMouseEnter = () => {
        timeoutRef.current = setTimeout(() => {
            setShow(true);
        }, delayDuration);
    };

    const handleMouseLeave = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setShow(false);
    };

    return (
        <TooltipContext.Provider value={{ show, setShow }}>
            <div 
                className="relative inline-block" 
                onMouseEnter={handleMouseEnter} 
                onMouseLeave={handleMouseLeave}
            >
                {children}
            </div>
        </TooltipContext.Provider>
    );
};

const TooltipTrigger = ({ children, asChild }) => {
    return <>{children}</>;
};

const TooltipContent = React.forwardRef(({ className, side = "top", children, ...props }, ref) => {
    const { show } = React.useContext(TooltipContext);
    
    if (!show) return null;

    const positions = {
        top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
        bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
        left: "right-full top-1/2 -translate-y-1/2 mr-2",
        right: "left-full top-1/2 -translate-y-1/2 ml-2",
    };

    return (
        <div
            ref={ref}
            className={cn(
                "absolute z-50 px-2.5 py-1 text-[10px] font-medium bg-slate-900 text-white rounded-md whitespace-nowrap shadow-lg pointer-events-none animate-in fade-in-0 zoom-in-95 transition-all duration-200",
                positions[side],
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
});
TooltipContent.displayName = "TooltipContent";

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };

