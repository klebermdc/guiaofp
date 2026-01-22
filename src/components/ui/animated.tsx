import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ReactNode } from 'react';

// Fade In animation variants
export const fadeInVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  exit: { 
    opacity: 0, 
    y: -10,
    transition: { duration: 0.2 }
  }
};

// Slide up animation
export const slideUpVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
  },
  exit: { 
    opacity: 0, 
    y: 20,
    transition: { duration: 0.2 }
  }
};

// Scale animation
export const scaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.3, ease: 'easeOut' }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    transition: { duration: 0.2 }
  }
};

// Stagger children animation
export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: { duration: 0.3, ease: 'easeOut' }
  }
};

// Tap animation for buttons
export const tapAnimation = {
  scale: 0.97,
  transition: { duration: 0.1 }
};

// Hover animation
export const hoverAnimation = {
  scale: 1.02,
  transition: { duration: 0.2 }
};

// Page transition wrapper
interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export const PageTransition = ({ children, className }: PageTransitionProps) => (
  <motion.div
    initial="hidden"
    animate="visible"
    exit="exit"
    variants={fadeInVariants}
    className={className}
  >
    {children}
  </motion.div>
);

// Animated card with stagger
interface AnimatedListProps {
  children: ReactNode;
  className?: string;
}

export const AnimatedList = ({ children, className }: AnimatedListProps) => (
  <motion.div
    initial="hidden"
    animate="visible"
    variants={staggerContainerVariants}
    className={className}
  >
    {children}
  </motion.div>
);

export const AnimatedListItem = ({ children, className }: AnimatedListProps) => (
  <motion.div
    variants={staggerItemVariants}
    className={className}
  >
    {children}
  </motion.div>
);

// Pressable component for touch feedback
interface PressableProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export const Pressable = ({ children, className, onClick, disabled }: PressableProps) => (
  <motion.button
    whileTap={disabled ? undefined : tapAnimation}
    whileHover={disabled ? undefined : hoverAnimation}
    onClick={onClick}
    disabled={disabled}
    className={className}
  >
    {children}
  </motion.button>
);

// Animated presence wrapper
export { motion, AnimatePresence };
