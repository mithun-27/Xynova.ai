import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

interface AiLoaderProps {
  title?: string;
  subtitle?: string;
}

const loadingSteps = [
  "Analyzing learning goals & syllabus scope...",
  "Structuring custom educational modules...",
  "Synthesizing detailed concepts & explanations...",
  "Crafting interactive quiz checkpoints...",
  "Polishing code snippets and visual formatting...",
  "Finalizing your personalized workspace..."
];

export const AiLoader = ({ 
  title = "Generating your lesson...", 
  subtitle = "Usually takes 10-30 seconds" 
}: AiLoaderProps) => {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-4 min-h-[300px] w-full">
      {/* Premium Ai Generating Card with Animated Rotating Gradient Border */}
      <div className="relative w-full max-w-md p-[2px] rounded-3xl overflow-hidden bg-neutral-900/40 border border-neutral-800/40 shadow-2xl">
        {/* Neon Rotating Gradient Border (spin-slow) - Centered aspect-square to cover corners */}
        <div 
          style={{
            backgroundImage: 'conic-gradient(from 0deg, #3b82f6, #a855f7, #ec4899, #3b82f6)'
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[180%] aspect-square -z-10 opacity-80 blur-[2px] animate-spin-slow" 
        />
        
        {/* Inner Dark Card Body */}
        <div className="relative z-10 w-full bg-neutral-950/95 rounded-[22px] p-8 flex flex-col items-center justify-center text-center overflow-hidden">
          {/* Conical scan beam projecting from bottom */}
          <div 
            style={{
              backgroundImage: 'conic-gradient(from -68deg at 50% 100%, rgba(168,85,247,0.3) 136deg, transparent 0turn)',
              transformOrigin: "top"
            }}
            className="absolute inset-x-0 bottom-0 h-full blur-2xl animate-scan-beam pointer-events-none -z-10"
          />

          {/* AI Pulsing Glow Core */}
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-purple-500/30 blur-2xl rounded-full scale-125 animate-pulse" />
            <div className="relative w-16 h-16 rounded-2xl bg-neutral-900 border border-purple-500/20 flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-purple-400 animate-pulse" />
            </div>
          </div>

          {/* Static Title & Subtitle */}
          <h2 className="text-xl font-bold tracking-tight text-white mb-2">{title}</h2>
          
          {/* Dynamic Steps Status */}
          <div className="h-6 overflow-hidden relative w-full mb-3">
            <AnimatePresence mode="wait">
              <motion.p
                key={stepIndex}
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -15, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="text-sm font-semibold text-purple-400"
              >
                {loadingSteps[stepIndex]}
              </motion.p>
            </AnimatePresence>
          </div>

          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};
