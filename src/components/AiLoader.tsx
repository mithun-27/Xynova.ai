import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
    <div className="flex flex-col items-center justify-center p-4 w-full select-none">
      {/* Lottie Animation Web Component (Transparent native rendering) */}
      <div 
        className="w-64 h-64 flex items-center justify-center mb-2 overflow-hidden pointer-events-none"
        dangerouslySetInnerHTML={{
          __html: `<dotlottie-wc src="https://lottie.host/aa3094a8-5590-41b7-b7bb-c6e6614e93e4/kEoF9fgeyl.lottie" style="width: 300px; height: 300px;" autoplay loop></dotlottie-wc>`
        }}
      />

      {/* Title */}
      <h2 className="text-2xl font-extrabold tracking-tight text-white mb-3 mt-[-30px]">{title}</h2>
      
      {/* Dynamic Status Steps */}
      <div className="h-6 overflow-hidden relative w-full mb-3 text-center">
        <AnimatePresence mode="wait">
          <motion.p
            key={stepIndex}
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -15, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="text-base font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
          >
            {loadingSteps[stepIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Subtitle */}
      <p className="text-xs text-muted-foreground/60">{subtitle}</p>
    </div>
  );
};
