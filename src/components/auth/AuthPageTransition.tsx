"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";

const ease = [0.25, 0.1, 0.25, 1] as const;

export function AuthPageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const segment = pathname ?? "";
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={segment}
        className="auth-page-transition"
        initial={
          reduceMotion
            ? { opacity: 1, y: 0 }
            : { opacity: 0, y: 12 }
        }
        animate={{ opacity: 1, y: 0 }}
        exit={
          reduceMotion
            ? { opacity: 1, y: 0 }
            : { opacity: 0, y: -8 }
        }
        transition={{
          duration: reduceMotion ? 0 : 0.32,
          ease,
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
