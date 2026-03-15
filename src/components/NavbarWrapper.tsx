"use client";

import { usePathname } from "next/navigation";
import AppNavbar from "@/components/AppNavbar";

const HIDE_NAVBAR_PATHS = ["/login"];

export default function NavbarWrapper() {
  const pathname = usePathname();
  if (HIDE_NAVBAR_PATHS.includes(pathname)) return null;
  return <AppNavbar />;
}
