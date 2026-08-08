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

          {/* AI Pulsing Glow Core with Custom Infinite Loop SVG */}
          <div className="relative mb-6 flex justify-center items-center">
            <div className="absolute w-36 h-36 bg-purple-500/20 blur-2xl rounded-full scale-125 animate-pulse pointer-events-none" />
            <div className="relative z-10 w-28 h-28 flex items-center justify-center">
              <svg 
                fill="none" 
                viewBox="0 0 1080 1080" 
                className="w-full h-full drop-shadow-[0_0_15px_rgba(168,85,247,0.7)]"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g transform="matrix(1,0,0,1,540,540)" id="i0">
                  <animate repeatCount="indefinite" begin="0s" calcMode="discrete" dur="2.88s" values="visible; hidden; hidden" keyTimes="0; 0.5; 1" attributeName="visibility" />
                  <g strokeDasharray="0 100" pathLength="100" id="i1">
                    <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="24" stroke="#f43f5e" d="M-259.133,-157.152C-22,-157.152,20,172.198,254.118,172.198C372,172.198,427.882,79,427.882,0.282C427.882,-73,358,-157.526,250.096,-157.526C26.322,-157.526,-1,170.526,-252.446,170.526C-362,170.526,-425.209,82.14,-426.851,1.687C-428.432,-75.773,-359,-157.152,-259.133,-157.152Z" />
                    <animate repeatCount="indefinite" fill="freeze" begin="0s" dur="2.88s" calcMode="spline" keySplines="0.606 0 0.256 0.897; 0.606 0 0.256 0.897; 0.617 0.134 0.411 1; 0.606 0 0.256 0.897; 0 0 1 1" keyTimes="0; 0.083333; 0.180556; 0.402778; 0.486111; 1" values="0 100; 27.97 72.03; 48.727 51.273; 5.408 94.592; 0 100; 0 100" attributeName="stroke-dasharray" />
                    <animate repeatCount="indefinite" fill="freeze" begin="0s" dur="2.88s" calcMode="spline" keySplines="0.606 0 0.256 0.897; 0.606 0 0.256 0.897; 0.617 0.134 0.411 1; 0.606 0 0.256 0.897; 0 0 1 1" keyTimes="0; 0.083333; 0.180556; 0.402778; 0.486111; 1" values="0; 0; -7.248; -94.592; 0; 0" attributeName="stroke-dashoffset" />
                  </g>
                </g>
                <g transform="matrix(1,0,0,1,540,540)" id="i2">
                  <animate repeatCount="indefinite" begin="0s" calcMode="discrete" dur="2.88s" values="hidden; visible; hidden; hidden" keyTimes="0; 0.375; 0.875; 1" attributeName="visibility" />
                  <g strokeDasharray="0 100" pathLength="100" id="i1">
                    <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="24" stroke="#f43f5e" d="M-259.133,-157.152C-22,-157.152,20,172.198,254.118,172.198C372,172.198,427.882,79,427.882,0.282C427.882,-73,358,-157.526,250.096,-157.526C26.322,-157.526,-1,170.526,-252.446,170.526C-362,170.526,-425.209,82.14,-426.851,1.687C-428.432,-75.773,-359,-157.152,-259.133,-157.152Z" />
                    <animate repeatCount="indefinite" fill="freeze" begin="0s" dur="2.88s" calcMode="spline" keySplines="0 0 1 1; 0.606 0 0.256 0.897; 0.606 0 0.256 0.897; 0.617 0.134 0.411 1; 0.606 0 0.256 0.897; 0 0 1 1" keyTimes="0; 0.375; 0.458333; 0.555556; 0.777778; 0.861111; 1" values="0 100; 0 100; 27.97 72.03; 48.727 51.273; 5.408 94.592; 0 100; 0 100" attributeName="stroke-dasharray" />
                    <animate repeatCount="indefinite" fill="freeze" begin="0s" dur="2.88s" calcMode="spline" keySplines="0 0 1 1; 0.606 0 0.256 0.897; 0.606 0 0.256 0.897; 0.617 0.134 0.411 1; 0.606 0 0.256 0.897; 0 0 1 1" keyTimes="0; 0.375; 0.458333; 0.555556; 0.777778; 0.861111; 1" values="0; 0; 0; -7.248; -94.592; 0; 0" attributeName="stroke-dashoffset" />
                  </g>
                </g>
                <g transform="matrix(1,0,0,1,540,540)" id="i3">
                  <animate repeatCount="indefinite" begin="0s" calcMode="discrete" dur="2.88s" values="hidden; visible; hidden; hidden" keyTimes="0; 0.042; 0.542; 1" attributeName="visibility" />
                  <g strokeDasharray="0 100" pathLength="100" id="i1">
                    <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="24" stroke="#a855f7" d="M-259.133,-157.152C-22,-157.152,20,172.198,254.118,172.198C372,172.198,427.882,79,427.882,0.282C427.882,-73,358,-157.526,250.096,-157.526C26.322,-157.526,-1,170.526,-252.446,170.526C-362,170.526,-425.209,82.14,-426.851,1.687C-428.432,-75.773,-359,-157.152,-259.133,-157.152Z" />
                    <animate repeatCount="indefinite" fill="freeze" begin="0s" dur="2.88s" calcMode="spline" keySplines="0 0 1 1; 0.606 0 0.256 0.897; 0.606 0 0.256 0.897; 0.617 0.134 0.411 1; 0.606 0 0.256 0.897; 0 0 1 1" keyTimes="0; 0.041667; 0.125; 0.222222; 0.444444; 0.527778; 1" values="0 100; 0 100; 27.97 72.03; 48.727 51.273; 5.408 94.592; 0 100; 0 100" attributeName="stroke-dasharray" />
                    <animate repeatCount="indefinite" fill="freeze" begin="0s" dur="2.88s" calcMode="spline" keySplines="0 0 1 1; 0.606 0 0.256 0.897; 0.606 0 0.256 0.897; 0.617 0.134 0.411 1; 0.606 0 0.256 0.897; 0 0 1 1" keyTimes="0; 0.041667; 0.125; 0.222222; 0.444444; 0.527778; 1" values="0; 0; 0; -7.248; -94.592; 0; 0" attributeName="stroke-dashoffset" />
                  </g>
                </g>
                <g transform="matrix(1,0,0,1,540,540)" id="i4">
                  <animate repeatCount="indefinite" begin="0s" calcMode="discrete" dur="2.88s" values="hidden; visible; hidden; hidden" keyTimes="0; 0.417; 0.917; 1" attributeName="visibility" />
                  <g strokeDasharray="0 100" pathLength="100" id="i1">
                    <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="24" stroke="#a855f7" d="M-259.133,-157.152C-22,-157.152,20,172.198,254.118,172.198C372,172.198,427.882,79,427.882,0.282C427.882,-73,358,-157.526,250.096,-157.526C26.322,-157.526,-1,170.526,-252.446,170.526C-362,170.526,-425.209,82.14,-426.851,1.687C-428.432,-75.773,-359,-157.152,-259.133,-157.152Z" />
                    <animate repeatCount="indefinite" fill="freeze" begin="0s" dur="2.88s" calcMode="spline" keySplines="0 0 1 1; 0.606 0 0.256 0.897; 0.606 0 0.256 0.897; 0.617 0.134 0.411 1; 0.606 0 0.256 0.897; 0 0 1 1" keyTimes="0; 0.416667; 0.5; 0.597222; 0.819444; 0.902778; 1" values="0 100; 0 100; 27.97 72.03; 48.727 51.273; 5.408 94.592; 0 100; 0 100" attributeName="stroke-dasharray" />
                    <animate repeatCount="indefinite" fill="freeze" begin="0s" dur="2.88s" calcMode="spline" keySplines="0 0 1 1; 0.606 0 0.256 0.897; 0.606 0 0.256 0.897; 0.617 0.134 0.411 1; 0.606 0 0.256 0.897; 0 0 1 1" keyTimes="0; 0.416667; 0.5; 0.597222; 0.819444; 0.902778; 1" values="0; 0; 0; -7.248; -94.592; 0; 0" attributeName="stroke-dashoffset" />
                  </g>
                </g>
                <g transform="matrix(1,0,0,1,540,540)" id="i5">
                  <animate repeatCount="indefinite" begin="0s" calcMode="discrete" dur="2.88s" values="hidden; visible; hidden; hidden" keyTimes="0; 0.083; 0.583; 1" attributeName="visibility" />
                  <g strokeDasharray="0 100" pathLength="100" id="i1">
                    <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="24" stroke="#db2777" d="M-259.133,-157.152C-22,-157.152,20,172.198,254.118,172.198C372,172.198,427.882,79,427.882,0.282C427.882,-73,358,-157.526,250.096,-157.526C26.322,-157.526,-1,170.526,-252.446,170.526C-362,170.526,-425.209,82.14,-426.851,1.687C-428.432,-75.773,-359,-157.152,-259.133,-157.152Z" />
                    <animate repeatCount="indefinite" fill="freeze" begin="0s" dur="2.88s" calcMode="spline" keySplines="0 0 1 1; 0.606 0 0.256 0.897; 0.606 0 0.256 0.897; 0.617 0.134 0.411 1; 0.606 0 0.256 0.897; 0 0 1 1" keyTimes="0; 0.083333; 0.166667; 0.263889; 0.486111; 0.569444; 1" values="0 100; 0 100; 27.97 72.03; 48.727 51.273; 5.408 94.592; 0 100; 0 100" attributeName="stroke-dasharray" />
                    <animate repeatCount="indefinite" fill="freeze" begin="0s" dur="2.88s" calcMode="spline" keySplines="0 0 1 1; 0.606 0 0.256 0.897; 0.606 0 0.256 0.897; 0.617 0.134 0.411 1; 0.606 0 0.256 0.897; 0 0 1 1" keyTimes="0; 0.083333; 0.166667; 0.263889; 0.486111; 0.569444; 1" values="0; 0; 0; -7.248; -94.592; 0; 0" attributeName="stroke-dashoffset" />
                  </g>
                </g>
                <g transform="matrix(1,0,0,1,540,540)" id="i6">
                  <animate repeatCount="indefinite" begin="0s" calcMode="discrete" dur="2.88s" values="hidden; visible; hidden; hidden" keyTimes="0; 0.458; 0.958; 1" attributeName="visibility" />
                  <g strokeDasharray="0 100" pathLength="100" id="i1">
                    <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="24" stroke="#db2777" d="M-259.133,-157.152C-22,-157.152,20,172.198,254.118,172.198C372,172.198,427.882,79,427.882,0.282C427.882,-73,358,-157.526,250.096,-157.526C26.322,-157.526,-1,170.526,-252.446,170.526C-362,170.526,-425.209,82.14,-426.851,1.687C-428.432,-75.773,-359,-157.152,-259.133,-157.152Z" />
                    <animate repeatCount="indefinite" fill="freeze" begin="0s" dur="2.88s" calcMode="spline" keySplines="0 0 1 1; 0.606 0 0.256 0.897; 0.606 0 0.256 0.897; 0.617 0.134 0.411 1; 0.606 0 0.256 0.897; 0 0 1 1" keyTimes="0; 0.458333; 0.541667; 0.638889; 0.861111; 0.944444; 1" values="0 100; 0 100; 27.97 72.03; 48.727 51.273; 5.408 94.592; 0 100; 0 100" attributeName="stroke-dasharray" />
                    <animate repeatCount="indefinite" fill="freeze" begin="0s" dur="2.88s" calcMode="spline" keySplines="0 0 1 1; 0.606 0 0.256 0.897; 0.606 0 0.256 0.897; 0.617 0.134 0.411 1; 0.606 0 0.256 0.897; 0 0 1 1" keyTimes="0; 0.458333; 0.541667; 0.638889; 0.861111; 0.944444; 1" values="0; 0; 0; -7.248; -94.592; 0; 0" attributeName="stroke-dashoffset" />
                  </g>
                </g>
                <g transform="matrix(1,0,0,1,540,540)" id="i7">
                  <animate repeatCount="indefinite" begin="0s" calcMode="discrete" dur="2.88s" values="hidden; visible; hidden; hidden" keyTimes="0; 0.125; 0.625; 1" attributeName="visibility" />
                  <g strokeDasharray="0 100" pathLength="100" id="i1">
                    <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="35" stroke="#06b6d4" d="M-259.133,-157.152C-22,-157.152,20,172.198,254.118,172.198C372,172.198,427.882,79,427.882,0.282C427.882,-73,358,-157.526,250.096,-157.526C26.322,-157.526,-1,170.526,-252.446,170.526C-362,170.526,-425.209,82.14,-426.851,1.687C-428.432,-75.773,-359,-157.152,-259.133,-157.152Z" />
                    <animate repeatCount="indefinite" fill="freeze" begin="0s" dur="2.88s" calcMode="spline" keySplines="0 0 1 1; 0.606 0 0.256 0.897; 0.606 0 0.256 0.897; 0.617 0.134 0.411 1; 0.606 0 0.256 0.897; 0 0 1 1" keyTimes="0; 0.125; 0.208333; 0.305556; 0.527778; 0.611111; 1" values="0 100; 0 100; 27.97 72.03; 48.727 51.273; 5.408 94.592; 0 100; 0 100" attributeName="stroke-dasharray" />
                    <animate repeatCount="indefinite" fill="freeze" begin="0s" dur="2.88s" calcMode="spline" keySplines="0 0 1 1; 0.606 0 0.256 0.897; 0.606 0 0.256 0.897; 0.617 0.134 0.411 1; 0.606 0 0.256 0.897; 0 0 1 1" keyTimes="0; 0.125; 0.208333; 0.305556; 0.527778; 0.611111; 1" values="0; 0; 0; -7.248; -94.592; 0; 0" attributeName="stroke-dashoffset" />
                  </g>
                </g>
                <g transform="matrix(1,0,0,1,540,540)" id="i8">
                  <animate repeatCount="indefinite" begin="0s" calcMode="discrete" dur="2.88s" values="hidden; visible; visible" keyTimes="0; 0.5; 1" attributeName="visibility" />
                  <g strokeDasharray="0 100" pathLength="100" id="i1">
                    <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="35" stroke="#06b6d4" d="M-259.133,-157.152C-22,-157.152,20,172.198,254.118,172.198C372,172.198,427.882,79,427.882,0.282C427.882,-73,358,-157.526,250.096,-157.526C26.322,-157.526,-1,170.526,-252.446,170.526C-362,170.526,-425.209,82.14,-426.851,1.687C-428.432,-75.773,-359,-157.152,-259.133,-157.152Z" />
                    <animate repeatCount="indefinite" fill="freeze" begin="0s" dur="2.88s" calcMode="spline" keySplines="0 0 1 1; 0.606 0 0.256 0.897; 0.606 0 0.256 0.897; 0.617 0.134 0.411 1; 0.606 0 0.256 0.897; 0 0 1 1" keyTimes="0; 0.5; 0.583333; 0.680556; 0.902778; 0.986111; 1" values="0 100; 0 100; 27.97 72.03; 48.727 51.273; 5.408 94.592; 0 100; 0 100" attributeName="stroke-dasharray" />
                    <animate repeatCount="indefinite" fill="freeze" begin="0s" dur="2.88s" calcMode="spline" keySplines="0 0 1 1; 0.606 0 0.256 0.897; 0.606 0 0.256 0.897; 0.617 0.134 0.411 1; 0.606 0 0.256 0.897; 0 0 1 1" keyTimes="0; 0.5; 0.583333; 0.680556; 0.902778; 0.986111; 1" values="0; 0; 0; -7.248; -94.592; 0; 0" attributeName="stroke-dashoffset" />
                  </g>
                </g>
              </svg>
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
