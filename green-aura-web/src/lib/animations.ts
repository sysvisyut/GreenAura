import { Variants } from "framer-motion";

/**
 * Fade in animation
 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.3 }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

/**
 * Slide up animation
 */
export const slideUp: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { duration: 0.4, ease: "easeOut" }
  },
  exit: { 
    y: 20, 
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

/**
 * Slide in from left animation
 */
export const slideInLeft: Variants = {
  hidden: { x: -20, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { duration: 0.3, ease: "easeOut" }
  },
  exit: { 
    x: -20, 
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

/**
 * Slide in from right animation
 */
export const slideInRight: Variants = {
  hidden: { x: 20, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { duration: 0.3, ease: "easeOut" }
  },
  exit: { 
    x: 20, 
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

/**
 * Scale animation
 */
export const scaleUp: Variants = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { duration: 0.3, ease: "easeOut" }
  },
  exit: { 
    scale: 0.95, 
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

/**
 * Stagger children animations
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

/**
 * Page transition animation
 */
export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.4, 
      ease: "easeOut" 
    }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

/**
 * Cart item animation
 */
export const cartItemAnimation: Variants = {
  hidden: { opacity: 0, height: 0, marginBottom: 0 },
  visible: { 
    opacity: 1, 
    height: "auto", 
    marginBottom: "1rem",
    transition: { duration: 0.3 }
  },
  exit: { 
    opacity: 0, 
    height: 0, 
    marginBottom: 0,
    transition: { duration: 0.2 }
  }
};

/**
 * Modal animation
 */
export const modalAnimation: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.3, ease: "easeOut" }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    transition: { duration: 0.2 }
  }
};

/**
 * Button tap animation
 */
export const buttonTap = {
  scale: 0.95,
  transition: { duration: 0.1 }
};
