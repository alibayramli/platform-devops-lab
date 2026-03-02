export const revealGrid = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05
    }
  }
};

export const revealItem = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

export const routeExit = { opacity: 0, y: -8, transition: { duration: 0.2 } };
export const revealItemTransition = { duration: 0.3 };
