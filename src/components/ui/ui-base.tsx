import React, { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
const UIBase = ({
  children,
  className,
  innerClassName,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  innerClassName?: string;
}) => {
  return (
    <div
      className={cn(
        "bg-background/80 border border-black/20 backdrop-blur-lg rounded-xl shadow-xl",
        className
      )}
      {...props}
    >
      <div
        className={cn("rounded-xl border border-white/20 p-2", innerClassName)}
      >
        {children}
      </div>
    </div>
  );
};

export default UIBase;
