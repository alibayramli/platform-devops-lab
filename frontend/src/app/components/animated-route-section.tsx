import type { ReactNode } from "react";
import { motion } from "framer-motion";

import { revealGrid, routeExit } from "../motion";

type AnimatedRouteSectionProps = {
  className?: string;
  children: ReactNode;
};

export function AnimatedRouteSection({
  className = "space-y-4",
  children
}: AnimatedRouteSectionProps) {
  return (
    <motion.section
      className={className}
      variants={revealGrid}
      initial="hidden"
      animate="show"
      exit={routeExit}
    >
      {children}
    </motion.section>
  );
}
