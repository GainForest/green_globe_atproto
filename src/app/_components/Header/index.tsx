import UIBase from "@/components/ui/ui-base";
import React from "react";
import Image from "next/image";
import { Layers, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
const Header = () => {
  return (
    <div className="fixed top-2 left-2 flex items-center gap-2">
      <UIBase innerClassName="p-1 pl-2 flex items-center gap-2">
        <Image
          src="/logo.webp"
          alt="logo"
          width={28}
          height={28}
          className="rounded-full"
        />
        <span className="font-bold text-lg">Gainforest</span>
        <div className="w-4" />
        <Button variant="ghost" size="icon">
          <Search />
        </Button>
      </UIBase>
      <UIBase innerClassName="p-1">
        <Button variant="ghost">
          <Layers />
          Explore Layers
        </Button>
      </UIBase>
    </div>
  );
};

export default Header;
