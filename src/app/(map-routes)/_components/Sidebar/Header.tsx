"use client";

import React from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
const WalletButton = dynamic(() => import("@/app/_components/WalletButton"), {
  ssr: false,
});

const Header = () => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Image
          src="/logo.webp"
          alt="logo"
          width={28}
          height={28}
          className="rounded-full"
        />
        <span className="font-bold text-lg">GainForest</span>
      </div>
      <WalletButton />
    </div>
  );
};

export default Header;
