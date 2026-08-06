import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Brain, MessageSquare, Network, BarChart3,
  Sparkles, ArrowRight, CheckCircle2, Zap, Star, Github, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Hero3D } from "@/components/Hero3D";
import { toast } from "sonner";
import { api } from "@/lib/api";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0, 0, 0.2, 1] as const }
  })
};

const features = [
  { icon: Brain, title: "AI Topic Roadmap Generator", desc: "Automatically breaks any topic into structured units and lessons." },
  { icon: MessageSquare, title: "AI Tutor Chat", desc: "Ask questions and get explanations from an AI tutor." },
  { icon: Sparkles, title: "Quiz Generator", desc: "Test your understanding with AI-generated quizzes." },
  { icon: Network, title: "Knowledge Graph Mindmaps", desc: "Visualize how concepts connect." },
  { icon: BarChart3, title: "Learning Analytics", desc: "Track progress, quiz scores, and learning streaks." },
];

const steps = [
  { num: "01", title: "Enter any topic", desc: "Type in what you want to learn." },
  { num: "02", title: "AI generates a roadmap", desc: "Get a structured learning path instantly." },
  { num: "03", title: "Study lessons & explore", desc: "Read AI-generated lessons with rich content." },
  { num: "04", title: "Quiz & track progress", desc: "Take quizzes and monitor your growth." },
];

const Landing = () => {
  const navigate = useNavigate();
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [email, setEmail] = useState("");
  const [notified, setNotified] = useState(false);

  const handleNotify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success("Thank you! We will notify you when Premium is live. 🚀");
    setNotified(true);
    setEmail("");
  };

  const triggerCheckout = async (amountPaise: number) => {
    try {
      const order = await api.createPaymentOrder(amountPaise);
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_TMXzAdBCc0Phv0",
        amount: order.amount,
        currency: order.currency,
        name: "Xynova AI Premium",
        description: "Unlock unlimited learning roadmaps, adaptive quizzes, and chat.",
        image: "/logo.png",
        order_id: order.order_id,
        handler: async (response: any) => {
          try {
            toast.info("Verifying transaction...");
            const verifyResult = await api.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            if (verifyResult.is_premium) {
              toast.success("Successfully upgraded to Premium! Welcome aboard! 🚀");
              navigate("/dashboard");
            }
          } catch (err: any) {
            toast.error(err.message || "Failed to verify payment signature");
          }
        },
        prefill: {
          name: "",
          email: "",
        },
        theme: {
          color: "#a855f7",
        },
        modal: {
          ondismiss: function () {
            toast.warning("Payment cancelled by user.");
          }
        }
      };
      
      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (resp: any) {
        toast.error(resp.error.description || "Payment failed");
      });
      rzp.open();
    } catch (err: any) {
      console.error("Checkout initiation failed", err);
      toast.error(err.message || "Failed to start checkout. Please try again.");
    }
  };

  const handleUpgradeClick = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.info("Please log in or sign up first to upgrade! 🚀");
      navigate("/auth");
      return;
    }
    triggerCheckout(99900);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png?v=4" alt="Logo" className="h-7 w-7 object-contain shrink-0" />
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">Xynova.ai</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm">Log In</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="gradient-bg border-0 text-primary-foreground">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen pt-32 pb-20 relative overflow-hidden flex items-center">
        {/* 3D Background */}
        <Hero3D />

        {/* Dark overlay to ensure text readability against the 3D model */}
        <div className="absolute inset-0 bg-black/40 z-10 pointer-events-none" />

        <div className="container mx-auto px-4 relative z-20 w-full">
          <motion.div
            className="w-full text-center max-w-3xl mx-auto"
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={fadeUp} custom={0}
              className="inline-flex items-center gap-2 bg-white/10 text-white rounded-full px-4 py-1.5 text-sm font-medium mb-6 backdrop-blur-sm border border-white/20"
            >
              <Sparkles className="h-4 w-4" /> Powered by AI
            </motion.div>
            <motion.h1 variants={fadeUp} custom={1}
              className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight text-white"
            >
              Master Any Concept{" "}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">with AI</span>
            </motion.h1>
            <motion.p variants={fadeUp} custom={2}
              className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto drop-shadow-md"
            >
              Generate structured learning roadmaps, read lessons, take quizzes,
              and track your progress using AI.
            </motion.p>
            <motion.div variants={fadeUp} custom={3} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth">
                <Button size="lg" className="bg-white text-black hover:bg-white/95 px-8 h-12 text-base rounded-lg font-bold hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] hover:scale-105 transition-all duration-300">
                  Start Learning <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/auth">
                <Button size="lg" variant="outline" className="px-8 h-12 text-base text-white border-white/50 hover:border-purple-400 hover:text-purple-400 hover:bg-purple-500/10 backdrop-blur-sm rounded-lg font-bold hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all duration-300">
                  Try Demo
                </Button>
              </Link>
            </motion.div>
          </motion.div>

        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-28 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-4 relative">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="text-center mb-20"
          >
            <motion.p variants={fadeUp} custom={0} className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-400 mb-4">
              What We Offer
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-bold mb-5 leading-tight">
              Tools crafted for{" "}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">
                deep learning
              </span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground text-lg max-w-xl mx-auto">
              Not another generic dashboard. Every feature is designed to make knowledge truly stick.
            </motion.p>
          </motion.div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-5 max-w-6xl mx-auto">
            {/* Card 1 — Large (spans 3 cols) */}
            <motion.div
              variants={fadeUp} custom={0}
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="md:col-span-3 group relative rounded-2xl p-[1px] bg-gradient-to-br from-purple-500/40 via-transparent to-pink-500/40 hover:from-purple-500/70 hover:to-pink-500/70 transition-all duration-500"
            >
              <div className="bg-background/95 backdrop-blur-xl rounded-2xl p-8 h-full">
                <div className="flex items-center gap-4 mb-5">
                  <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-3.5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-purple-500/20">
                    <Brain className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold">AI Topic Roadmap Generator</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed text-[15px]">
                  Enter any topic — from quantum physics to watercolor painting — and our AI instantly architects a complete, structured learning path with units, lessons, and prerequisites mapped out.
                </p>
                <div className="mt-6 flex gap-2 flex-wrap">
                  {["Auto-structured", "Prerequisite mapping", "Adaptive depth"].map(tag => (
                    <span key={tag} className="text-xs px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Card 2 — Medium (spans 3 cols) */}
            <motion.div
              variants={fadeUp} custom={1}
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="md:col-span-3 group relative rounded-2xl p-[1px] bg-gradient-to-br from-blue-500/40 via-transparent to-cyan-500/40 hover:from-blue-500/70 hover:to-cyan-500/70 transition-all duration-500"
            >
              <div className="bg-background/95 backdrop-blur-xl rounded-2xl p-8 h-full">
                <div className="flex items-center gap-4 mb-5">
                  <div className="bg-gradient-to-br from-blue-500 to-cyan-400 rounded-2xl p-3.5 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-300 shadow-lg shadow-blue-500/20">
                    <MessageSquare className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold">AI Tutor Chat</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed text-[15px]">
                  Your personal tutor that never gets tired. Ask complex questions, request explanations at different levels, and dive deep into any concept with context-aware conversations.
                </p>
                <div className="mt-6 flex gap-2 flex-wrap">
                  {["Context-aware", "Multi-level explanations", "24/7 available"].map(tag => (
                    <span key={tag} className="text-xs px-3 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Card 3 — Small (spans 2 cols) */}
            <motion.div
              variants={fadeUp} custom={2}
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="md:col-span-2 group relative rounded-2xl p-[1px] bg-gradient-to-br from-amber-500/40 via-transparent to-orange-500/40 hover:from-amber-500/70 hover:to-orange-500/70 transition-all duration-500"
            >
              <div className="bg-background/95 backdrop-blur-xl rounded-2xl p-7 h-full">
                <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-3 w-fit mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg shadow-amber-500/20">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2">Quiz Generator</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  AI-generated quizzes that adapt to your understanding, ensuring you truly grasp every concept.
                </p>
              </div>
            </motion.div>

            {/* Card 4 — Small (spans 2 cols) */}
            <motion.div
              variants={fadeUp} custom={3}
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="md:col-span-2 group relative rounded-2xl p-[1px] bg-gradient-to-br from-emerald-500/40 via-transparent to-teal-500/40 hover:from-emerald-500/70 hover:to-teal-500/70 transition-all duration-500"
            >
              <div className="bg-background/95 backdrop-blur-xl rounded-2xl p-7 h-full">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl p-3 w-fit mb-4 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300 shadow-lg shadow-emerald-500/20">
                  <Network className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2">Knowledge Graph</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Interactive mind maps that reveal hidden connections between concepts.
                </p>
              </div>
            </motion.div>

            {/* Card 5 — Small (spans 2 cols) */}
            <motion.div
              variants={fadeUp} custom={4}
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="md:col-span-2 group relative rounded-2xl p-[1px] bg-gradient-to-br from-rose-500/40 via-transparent to-pink-500/40 hover:from-rose-500/70 hover:to-pink-500/70 transition-all duration-500"
            >
              <div className="bg-background/95 backdrop-blur-xl rounded-2xl p-7 h-full">
                <div className="bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl p-3 w-fit mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg shadow-rose-500/20">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-2">Learning Analytics</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Track your streaks, quiz performance, and mastery levels across every topic.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-28 relative overflow-hidden">
        {/* Background accent */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-4 relative">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-20">
            <motion.p variants={fadeUp} custom={0} className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-400 mb-4">
              Getting Started
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-bold mb-5">
              Four steps to{" "}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                mastery
              </span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground text-lg max-w-lg mx-auto">
              From curiosity to expertise in minutes, not months.
            </motion.p>
          </motion.div>

          {/* Timeline */}
          <div className="max-w-3xl mx-auto relative">
            {/* Vertical gradient line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-blue-500/60 via-purple-500/60 to-emerald-500/60 -translate-x-1/2 hidden md:block" />
            <div className="absolute left-8 top-0 bottom-0 w-[2px] bg-gradient-to-b from-blue-500/60 via-purple-500/60 to-emerald-500/60 md:hidden" />

            {steps.map((s, i) => {
              const colors = [
                { gradient: "from-blue-500 to-cyan-500", ring: "ring-blue-500/30", text: "text-blue-400" },
                { gradient: "from-purple-500 to-pink-500", ring: "ring-purple-500/30", text: "text-purple-400" },
                { gradient: "from-amber-500 to-orange-500", ring: "ring-amber-500/30", text: "text-amber-400" },
                { gradient: "from-emerald-500 to-teal-500", ring: "ring-emerald-500/30", text: "text-emerald-400" },
              ][i];
              const isLeft = i % 2 === 0;

              return (
                <motion.div
                  key={s.num}
                  variants={fadeUp} custom={i}
                  initial="hidden" whileInView="visible" viewport={{ once: true }}
                  className={`relative flex items-start gap-6 mb-14 last:mb-0 md:gap-0 ${isLeft ? "md:flex-row" : "md:flex-row-reverse"}`}
                >
                  {/* Content card */}
                  <div className={`flex-1 ml-16 md:ml-0 ${isLeft ? "md:pr-12 md:text-right" : "md:pl-12 md:text-left"}`}>
                    <div className="group rounded-2xl p-[1px] bg-gradient-to-br from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 transition-all duration-500">
                      <div className="bg-background/90 backdrop-blur-xl rounded-2xl p-6">
                        <span className={`text-xs font-bold uppercase tracking-widest ${colors.text} mb-2 block`}>
                          Step {s.num}
                        </span>
                        <h3 className="text-lg font-bold mb-2">{s.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                      </div>
                    </div>
                  </div>

                  {/* Node on timeline */}
                  <div className={`absolute left-8 md:left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-gradient-to-br ${colors.gradient} flex items-center justify-center ring-4 ${colors.ring} ring-offset-2 ring-offset-background shadow-lg z-10`}>
                    <span className="text-white text-sm font-bold">{s.num}</span>
                  </div>

                  {/* Spacer for the other side */}
                  <div className="hidden md:block flex-1" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-28 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-rose-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="container mx-auto px-4 relative">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="text-center mb-20">
            <motion.p variants={fadeUp} custom={0} className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-400 mb-4">
              Pricing
            </motion.p>
            <motion.h2 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-bold mb-5">
              Invest in your{" "}
              <span className="bg-gradient-to-r from-rose-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                growth
              </span>
            </motion.h2>
            <motion.p variants={fadeUp} custom={2} className="text-muted-foreground text-lg max-w-lg mx-auto">
              Start free. Upgrade when you're ready to go unlimited.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <motion.div variants={fadeUp} custom={0} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="group rounded-2xl p-[1px] bg-gradient-to-br from-white/15 via-transparent to-white/10 hover:from-white/25 hover:to-white/15 transition-all duration-500"
            >
              <div className="bg-background/95 backdrop-blur-xl rounded-2xl p-8 h-full flex flex-col">
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-muted-foreground mb-1">Starter</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black">$0</span>
                    <span className="text-muted-foreground text-sm">/month</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">Perfect for exploring and getting started with AI-powered learning.</p>
                </div>

                <div className="h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6" />

                <ul className="space-y-4 mb-10 flex-1">
                  {[
                    "5 topics per month",
                    "Limited AI tutor conversations",
                    "Basic quiz generation",
                    "Study checklist tracking",
                  ].map(f => (
                    <li key={f} className="flex items-center gap-3 text-sm">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>

                <Link to="/dashboard">
                  <Button variant="outline" className="w-full h-12 text-base rounded-xl border-white/15 hover:bg-white/5 font-semibold">
                    Get Started Free
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Premium Plan */}
            <motion.div variants={fadeUp} custom={1} initial="hidden" whileInView="visible" viewport={{ once: true }}
              className="group relative rounded-2xl p-[1px] bg-gradient-to-br from-purple-500/60 via-pink-500/40 to-rose-500/60 hover:from-purple-500/80 hover:via-pink-500/60 hover:to-rose-500/80 transition-all duration-500 shadow-xl shadow-purple-500/10"
            >
              {/* Popular badge */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold uppercase tracking-wider px-5 py-1.5 rounded-full shadow-lg shadow-purple-500/30">
                  ✦ Most Popular
                </div>
              </div>

              <div className="bg-background/95 backdrop-blur-xl rounded-2xl p-8 h-full flex flex-col">
                <div className="mb-8">
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-1">Premium</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black">$12</span>
                    <span className="text-muted-foreground text-sm">/month</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">Unlock the full power of AI-driven deep learning and analytics.</p>
                </div>

                <div className="h-[1px] bg-gradient-to-r from-transparent via-purple-500/30 to-transparent mb-6" />

                <ul className="space-y-4 mb-10 flex-1">
                  {[
                    "Unlimited topics & roadmaps",
                    "Unlimited AI tutor conversations",
                    "Advanced adaptive quizzes",
                    "Interactive knowledge graphs",
                    "Full learning analytics dashboard",
                    "Priority AI response speed",
                  ].map(f => (
                    <li key={f} className="flex items-center gap-3 text-sm">
                      <div className="w-5 h-5 rounded-full bg-purple-500/15 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="h-3.5 w-3.5 text-purple-400" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>

                <Button 
                  onClick={handleUpgradeClick}
                  className="w-full h-12 text-base rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 border-0 text-white font-semibold shadow-lg shadow-purple-500/20"
                >
                  Upgrade Now <Star className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="gradient-bg rounded-lg p-1.5">
                <Zap className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400 bg-clip-text text-transparent">Xynova.ai</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">About</a>
              <a href="#features" className="hover:text-foreground transition-colors">Features</a>
              <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact</a>
              <a href="#" className="hover:text-foreground transition-colors"><Github className="h-4 w-4" /></a>
            </div>
            <p className="text-xs text-muted-foreground">© 2026 Xynova.ai. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {showComingSoon && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md overflow-hidden glass-card p-8 rounded-3xl border border-white/10 shadow-2xl bg-background/90"
            >
              {/* Glow effect */}
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-pink-500/20 rounded-full blur-2xl pointer-events-none" />

              <button
                onClick={() => setShowComingSoon(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="text-center space-y-4">
                <div className="inline-flex p-3 rounded-2xl bg-purple-500/10 text-purple-400 mb-2">
                  <Sparkles className="h-8 w-8 animate-pulse" />
                </div>
                <h3 className="text-2xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Premium Coming Soon!
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We are currently integrating Stripe payment infrastructure. Soon you'll be able to unlock unlimited topics, adaptive quizzes, mind maps, and full analytics.
                </p>

                {notified ? (
                  <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20 text-xs text-green-400 font-medium">
                    🎉 You've been added to the early access list!
                  </div>
                ) : (
                  <form onSubmit={handleNotify} className="space-y-3 pt-2">
                    <input
                      type="email"
                      required
                      placeholder="Enter your email for early access"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl border border-white/10 bg-background/50 text-sm focus:outline-none focus:border-purple-500/50 transition-colors"
                    />
                    <Button type="submit" className="w-full h-11 bg-gradient-to-r from-purple-500 to-pink-500 border-0 text-white font-bold rounded-xl shadow-lg">
                      Notify Me
                    </Button>
                  </form>
                )}

                <div className="pt-2">
                  <button
                    onClick={() => setShowComingSoon(false)}
                    className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-4"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Landing;
