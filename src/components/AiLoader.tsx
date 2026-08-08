import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, MousePointerClick } from "lucide-react";

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

// Fixed background floating particle seeds
const PARTICLE_COUNT = 15;
const PARTICLES = Array.from({ length: PARTICLE_COUNT }).map((_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 6 + 4,
  duration: Math.random() * 4 + 3,
  delay: Math.random() * 2,
  color: i % 3 === 0 ? "rgba(168, 85, 247, 0.6)" : i % 3 === 1 ? "rgba(244, 63, 94, 0.6)" : "rgba(6, 182, 212, 0.6)"
}));

interface ClickRipple {
  id: number;
  x: number;
  y: number;
}

export const AiLoader = ({ 
  title = "Generating your lesson...", 
  subtitle 
}: AiLoaderProps) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [ripples, setRipples] = useState<ClickRipple[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const newRipple: ClickRipple = {
      id: Date.now() + Math.random(),
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    setRipples((prev) => [...prev.slice(-5), newRipple]);
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onClick={handleContainerClick}
      className="relative flex flex-col items-center justify-center p-8 w-full max-w-xl mx-auto select-none overflow-hidden rounded-3xl border border-primary/10 bg-card/30 backdrop-blur-xl shadow-2xl cursor-crosshair min-h-[420px]"
    >
      {/* Interactive Mouse Spotlight Glow */}
      <div 
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20 blur-3xl transition-transform duration-75 ease-out"
        style={{
          left: `${mousePos.x}px`,
          top: `${mousePos.y}px`,
        }}
      />

      {/* Floating Interactive Background Particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {PARTICLES.map((p) => {
          // Slight shift toward mouse position for parallax effect
          const offsetX = (mousePos.x - 250) * 0.03 * (p.id % 2 === 0 ? 1 : -1);
          const offsetY = (mousePos.y - 200) * 0.03 * (p.id % 2 === 0 ? 1 : -1);

          return (
            <motion.div
              key={p.id}
              className="absolute rounded-full shadow-lg"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: `${p.size}px`,
                height: `${p.size}px`,
                backgroundColor: p.color,
                boxShadow: `0 0 10px ${p.color}`
              }}
              animate={{
                y: [0, -15, 0],
                x: [0, 10, 0],
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.8, 0.3],
                transform: `translate(${offsetX}px, ${offsetY}px)`
              }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                ease: "easeInOut",
                delay: p.delay
              }}
            />
          );
        })}
      </div>

      {/* Click Sparkle Ripples */}
      {ripples.map((r) => (
        <motion.div
          key={r.id}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 2.5, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary/60 bg-primary/10 pointer-events-none w-16 h-16"
          style={{ left: `${r.x}px`, top: `${r.y}px` }}
        />
      ))}

      {/* Lottie Player Container with Animated Glow Ring */}
      <div className="relative mb-2 pointer-events-none">
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 opacity-20 blur-xl animate-pulse" />
        <div 
          className="w-60 h-60 flex items-center justify-center overflow-hidden relative z-10"
          dangerouslySetInnerHTML={{
            __html: `<dotlottie-wc src="https://lottie.host/aa3094a8-5590-41b7-b7bb-c6e6614e93e4/kEoF9fgeyl.lottie" style="width: 280px; height: 280px;" autoplay loop></dotlottie-wc>`
          }}
        />
      </div>

      {/* Title */}
      <h2 className="text-2xl font-extrabold tracking-tight text-white mb-2 mt-[-20px] relative z-10 text-center">
        {title}
      </h2>
      
      {/* Dynamic Status Steps */}
      <div className="h-7 overflow-hidden relative w-full mb-4 text-center z-10">
        <AnimatePresence mode="wait">
          <motion.p
            key={stepIndex}
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -15, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="text-base font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-teal-300 bg-clip-text text-transparent px-4"
          >
            {loadingSteps[stepIndex]}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Step Progress Dots */}
      <div className="flex items-center gap-2 mb-4 z-10">
        {loadingSteps.map((_, idx) => (
          <div
            key={idx}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              idx === stepIndex
                ? "w-6 bg-gradient-to-r from-purple-500 to-pink-500 shadow-md shadow-purple-500/50"
                : idx < stepIndex
                ? "w-1.5 bg-primary/60"
                : "w-1.5 bg-muted/40"
            }`}
          />
        ))}
      </div>

      {/* Interactive Micro-Hint */}
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[11px] text-primary/80 font-medium z-10 backdrop-blur-md">
        <MousePointerClick className="h-3 w-3 animate-bounce text-pink-400" />
        <span>Move cursor or click to spawn glowing energy</span>
      </div>

      {/* Optional Custom Subtitle (if explicitly passed and not default time string) */}
      {subtitle && !subtitle.includes("10-30") && (
        <p className="text-xs text-muted-foreground/70 mt-2 z-10">{subtitle}</p>
      )}
    </div>
  );
};

