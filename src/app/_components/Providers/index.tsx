"use client";
import React from "react";
import PrivyProvider from "./PrivyProvider";
import AtprotoProvider from "./AtprotoProvider";
import { DialogProvider } from "../dialogs";
import QueryClientProvider from "./QueryClientProvider";
import { UserProvider } from "@/app/_contexts/User";
const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider>
      <PrivyProvider>
        <AtprotoProvider>
          <UserProvider>
            <DialogProvider>{children}</DialogProvider>
          </UserProvider>
        </AtprotoProvider>
      </PrivyProvider>
    </QueryClientProvider>
  );
};

export default Providers;
