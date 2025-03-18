import { CircleAlert } from "lucide-react";
import React from "react";

const Observations = () => {
  return (
    <div>
      <div className="flex flex-col items-center justify-center w-full p-4 gap-2 bg-muted rounded-xl">
        <CircleAlert size={36} className="text-muted-foreground/50" />
        <span className="text-muted-foreground text-sm">
          This section is under development
        </span>
      </div>
    </div>
  );
};

export default Observations;
