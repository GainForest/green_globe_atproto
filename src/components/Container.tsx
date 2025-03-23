import React from "react";
import { cn } from "@/lib/utils";

const Container = ({
  children,
  outerClassName,
  ...props
}: {
  children: React.ReactNode;
  outerClassName?: string;
} & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={cn("w-full flex flex-col items-center", outerClassName)}>
      <div {...props} className={cn("w-full max-w-6xl", props.className)}>
        {children}
      </div>
    </div>
  );
};

export default Container;
