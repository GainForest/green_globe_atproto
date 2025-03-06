import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

const QuickTooltip = ({
  tooltipContent,
  children,
  asChild = true,
}: {
  tooltipContent: React.ReactNode;
  children: React.ReactNode;
  asChild?: boolean;
}) => {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild={asChild}>{children}</TooltipTrigger>
        <TooltipContent>{tooltipContent}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default QuickTooltip;
