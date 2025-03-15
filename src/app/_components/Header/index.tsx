"use client";

import UIBase from "@/components/ui/ui-base";
import React from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import Tabs from "./Tabs";
const ConnectWalletButton = dynamic(() => import("./ConnectWalletButton"), {
  ssr: false,
});

const Header = () => {
  return (
    <div className="fixed top-2 left-2 right-2 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <UIBase innerClassName="p-2 px-3 flex items-center gap-2">
          <Image
            src="/logo.webp"
            alt="logo"
            width={28}
            height={28}
            className="rounded-full"
          />
          <span className="font-bold text-lg">GainForest</span>
        </UIBase>
        <UIBase innerClassName="p-1">
          <Tabs />
        </UIBase>
      </div>
      <div className="flex items-center gap-2">
        <UIBase innerClassName="p-1">
          <ConnectWalletButton />
        </UIBase>
      </div>
    </div>
  );
};

export default Header;
