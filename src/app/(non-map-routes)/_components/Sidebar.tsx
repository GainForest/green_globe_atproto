"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { blo } from "blo";
import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { truncateAddress } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MapPinned, Settings2 } from "lucide-react";
import Image from "next/image";
export function AppSidebar() {
  const { address } = useAppKitAccount();
  const { open } = useAppKit();

  return (
    <Sidebar className="border-r-transparent">
      <SidebarHeader>
        <div className="flex items-center gap-2 p-1">
          <Image
            src="/assets/logo.webp"
            className="border border-border rounded-md"
            alt="logo"
            width={32}
            height={32}
          />
          <span className="font-bold">GainForest</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <Button
              variant={"secondary"}
              size={"sm"}
              className="w-full justify-start"
            >
              <MapPinned className="w-4 h-4" />
              My Projects
            </Button>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {address && (
          <ul className="w-full rounded-xl p-2 py-4 bg-muted/50 border border-border transition-all duration-300 flex flex-col items-center gap-2">
            <li className="flex flex-col items-center gap-2">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={blo(address as `0x${string}`)}
                  alt="avatar"
                  width={20}
                  height={20}
                />
              </Avatar>
              <span className="text-sm font-bold">
                {truncateAddress(address as `0x${string}`)}
              </span>
            </li>
            <li>
              <Button variant={"outline"} size={"sm"} onClick={() => open()}>
                <Settings2 className="w-4 h-4" />
                Account Options
              </Button>
            </li>
          </ul>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
