import { motion } from 'framer-motion';
import { Plane, MapPin, Sparkles } from 'lucide-react';
import logo from '@/assets/logo.png';

export const AuthLoadingScreen = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 gradient-magic opacity-10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 gradient-gold opacity-10 rounded-full blur-3xl" />
      </div>

      {/* Floating icons */}
      <motion.div
        className="absolute top-20 right-20 text-primary/20"
        animate={{ 
          y: [0, -10, 0],
          rotate: [0, 10, 0]
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <Plane className="w-12 h-12" />
      </motion.div>

      <motion.div
        className="absolute bottom-32 left-16 text-accent/20"
        animate={{ 
          y: [0, 10, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <MapPin className="w-10 h-10" />
      </motion.div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-6 relative z-10"
      >
        {/* Logo */}
        <motion.img
          src={logo}
          alt="Orlando Fast Pass"
          className="w-48 h-auto"
          animate={{ 
            scale: [1, 1.02, 1],
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        />

        {/* Loading animation */}
        <div className="flex flex-col items-center gap-4 mt-4">
          {/* Animated dots */}
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 rounded-full bg-gradient-to-r from-primary to-accent"
                animate={{
                  y: [0, -8, 0],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                  delay: i * 0.15,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          {/* Text */}
          <motion.p
            className="text-muted-foreground text-sm font-medium flex items-center gap-2"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Sparkles className="w-4 h-4 text-accent" />
            Preparando sua experiência mágica...
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
};
