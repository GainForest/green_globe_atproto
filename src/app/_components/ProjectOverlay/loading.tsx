import { Loader2 } from "lucide-react";
import React from "react";

const Loading = () => {
  return (
    <div className="w-full h-full flex flex-col gap-2 items-center justify-center">
      <Loader2 className="w-4 h-4 animate-spin" size={24} />
      <span className="text-muted-foreground">Loading project details...</span>
    </div>
  );
};

export default Loading;
