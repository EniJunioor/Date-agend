"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";

export function AuthModeTabs() {
  const pathname = usePathname();
  const isLogin = pathname.startsWith("/login");
  const isRegister = pathname.startsWith("/register");
  const reduceMotion = useReducedMotion();

  if (!isLogin && !isRegister) {
    return null;
  }

  const spring = reduceMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 420, damping: 36, mass: 0.75 };

  return (
    <div className="auth-split-tabs" role="tablist" aria-label="Entrar ou criar conta">
      <div className="auth-split-tabs-track">
        <motion.div
          className="auth-split-tab-pill"
          aria-hidden
          initial={false}
          animate={{
            left: isLogin ? "0px" : "calc(50% + 2px)",
          }}
          transition={spring}
        />
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
    </div>
  );
}
