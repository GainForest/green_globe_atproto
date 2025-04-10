"use client";

import { useRouter } from "next/navigation";

export type NavigationOptions = {
  projectId?: string;
  siteId?: string;
};

const useNavigation = () => {
  const router = useRouter();

  return () => {
    router.push("/");
  };
};

export default useNavigation;
