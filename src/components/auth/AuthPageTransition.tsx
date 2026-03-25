"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef } from "react";

/** Ordem usada só para slide horizontal entre login ↔ registro */
const AUTH_SLIDE_ORDER = ["/login", "/register"] as const;

const SLIDE_PX = 22;

type SlideCustom = { dir: number; rm: boolean };

const variants: Variants = {
  enter: (c: SlideCustom) => ({
    opacity: c.rm ? 1 : 0,
    x: c.rm ? 0 : c.dir === 0 ? 0 : c.dir * SLIDE_PX,
  }),
  center: {
    opacity: 1,
    x: 0,
  },
  exit: (c: SlideCustom) => ({
    opacity: c.rm ? 1 : 0,
    x: c.rm ? 0 : c.dir === 0 ? 0 : -c.dir * SLIDE_PX,
  }),
};

export function AuthPageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const segment = pathname ?? "";
  const reduceMotion = useReducedMotion();
  const prevPathRef = useRef(pathname);

  const p = pathname ?? "";
  const prev = prevPathRef.current ?? "";
  const ia = AUTH_SLIDE_ORDER.indexOf(p as (typeof AUTH_SLIDE_ORDER)[number]);
  const ib = AUTH_SLIDE_ORDER.indexOf(prev as (typeof AUTH_SLIDE_ORDER)[number]);
  const direction =
    ia === -1 || ib === -1 || p === prev ? 0 : ia > ib ? 1 : -1;

  useLayoutEffect(() => {
    prevPathRef.current = pathname ?? "";
  }, [pathname]);

  const rm = !!reduceMotion;
  const custom: SlideCustom = { dir: direction, rm };

  const transition = rm
    ? { duration: 0 }
    : {
        opacity: { duration: 0.18, ease: [0.22, 1, 0.36, 1] as const },
        x: { type: "spring" as const, stiffness: 400, damping: 32, mass: 0.78 },
      };

  return (
    <div className="auth-page-transition-wrap">
      <AnimatePresence mode="wait" initial={false} custom={custom}>
        <motion.div
          key={segment}
          className="auth-page-transition"
          custom={custom}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={transition}
          style={rm ? undefined : { willChange: "transform, opacity" }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
