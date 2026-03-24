"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AuthModeTabs() {
  const pathname = usePathname();
  const isLogin = pathname.startsWith("/login");
  const isRegister = pathname.startsWith("/register");

  if (!isLogin && !isRegister) {
    return null;
  }

  return (
    <div className="auth-split-tabs" role="tablist" aria-label="Entrar ou criar conta">
      <Link
        href="/login"
        className={`auth-split-tab${isLogin ? " is-active" : ""}`}
        role="tab"
        aria-selected={isLogin}
        scroll={false}
        prefetch
      >
        Entrar
      </Link>
      <Link
        href="/register"
        className={`auth-split-tab${isRegister ? " is-active" : ""}`}
        role="tab"
        aria-selected={isRegister}
        scroll={false}
        prefetch
      >
        Criar conta
      </Link>
    </div>
  );
}
