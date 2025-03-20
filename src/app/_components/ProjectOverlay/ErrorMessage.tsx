import { CircleAlert } from "lucide-react";
import React from "react";

const ErrorMessage = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full p-4 gap-2 bg-muted rounded-xl">
      <CircleAlert size={36} className="text-muted-foreground/50" />
      <span className="text-muted-foreground text-sm">
        Something went wrong...
      </span>
    </div>
  );
};

export default ErrorMessage;
