"use client";

import { usePathname } from "next/navigation";
import { LoginShowcasePanel } from "./LoginShowcasePanel";
import { AuthShowcasePanel } from "./AuthShowcasePanel";

export function AuthPanelRouter() {
  const pathname = usePathname();
  const isLogin = pathname.includes("/login") || pathname.includes("/forgot-password") || pathname.includes("/reset-password");
  return isLogin ? <LoginShowcasePanel /> : <AuthShowcasePanel />;
}
