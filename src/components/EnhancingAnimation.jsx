import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

const STEPS = [
  "Analyzing image data…",
  "Removing background…",
  "Applying AI enhancement…",
  "Optimizing details…",
  "Finalizing variants…",
];

export default function EnhancingAnimation() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((i) => (i + 1) % STEPS.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-8 bg-background p-8">
      {/* Animated grid of glowing cells */}
      <div className="relative w-48 h-48">
        {/* Scanning line */}
        <motion.div
          className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent z-10"
          animate={{ top: ["0%", "100%", "0%"] }}
          transition={{ duration: 2.4, ease: "linear", repeat: Infinity }}
        />

        {/* Grid cells */}
        <div className="grid grid-cols-6 grid-rows-6 gap-1 w-full h-full">
          {Array.from({ length: 36 }).map((_, i) => (
            <motion.div
              key={i}
              className="rounded-sm bg-primary/10"
              animate={{
                opacity: [0.1, 1, 0.1],
                backgroundColor: [
                  "hsl(var(--primary) / 0.08)",
                  "hsl(var(--primary) / 0.7)",
                  "hsl(var(--primary) / 0.08)",
                ],
              }}
              transition={{
                duration: 1.6,
                delay: (i * 0.07) % 1.6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="bg-primary rounded-xl p-3 shadow-lg"
            animate={{ scale: [1, 1.12, 1], rotate: [0, 8, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </motion.div>
        </div>
      </div>

      {/* Orbiting dots */}
      <div className="relative w-16 h-4 flex items-center justify-center gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-primary"
            animate={{ y: [0, -8, 0], opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 0.9,
              delay: i * 0.3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Step text */}
      <div className="h-6 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={stepIndex}
            className="text-sm text-muted-foreground text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
          >
            {STEPS[stepIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      <p className="text-xs text-muted-foreground/50">Generating 3 enhanced variants</p>
    </div>
  );
}