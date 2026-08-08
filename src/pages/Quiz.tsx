import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, Trophy, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import DashboardLayout from "@/components/DashboardLayout";
import { useSearchParams, useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { AiLoader } from "@/components/AiLoader";

const Quiz = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const lessonId = parseInt(searchParams.get("lessonId") || "0");
  const lessonTitle = searchParams.get("lessonTitle") || "Lesson Module";

  const [quizId, setQuizId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [savingScore, setSavingScore] = useState(false);

  const fetchQuiz = async () => {
    if (!lessonId) {
      setError("No lesson context provided. Please choose a lesson first.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await api.getQuiz(lessonId);
      if (data && data.questions && data.questions.length > 0) {
        setQuizId(data.id);
        setQuestions(data.questions);
      } else {
        setError("Failed to generate or load quiz questions for this lesson.");
      }
    } catch (err: any) {
      console.error("Quiz load failed", err);
      setError(err?.message || "Failed to generate quiz. The AI model might be busy. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuiz();
  }, [lessonId]);

  const getCorrectIndex = (qObj: any) => {
    if (!qObj) return 0;
    const ans = qObj.correct_answer;
    if (ans === "A") return 0;
    if (ans === "B") return 1;
    if (ans === "C") return 2;
    if (ans === "D") return 3;
    const idx = qObj.options.indexOf(ans);
    if (idx !== -1) return idx;
    const parsed = parseInt(ans);
    if (!isNaN(parsed) && parsed >= 0 && parsed < qObj.options.length) {
      return parsed;
    }
    return 0;
  };

  const handleSelect = (idx: number) => {
    if (submitted) return;
    setSelected(idx);
  };

  const handleNext = async () => {
    if (selected === null) return;
    if (!submitted) {
      setSubmitted(true);
      return;
    }

    const newAnswers = [...answers, selected];
    setAnswers(newAnswers);

    if (current === questions.length - 1) {
      setShowResult(true);
      // Submit score to backend
      if (quizId) {
        setSavingScore(true);
        const finalScore = newAnswers.filter((a, i) => a === getCorrectIndex(questions[i])).length;
        try {
          await api.submitQuizScore(quizId, finalScore, questions.length);
          toast.success("Score recorded successfully! 🏆");
        } catch (err) {
          console.error("Failed to submit score", err);
          toast.error("Failed to save score on server.");
        } finally {
          setSavingScore(false);
        }
      }
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setSubmitted(false);
    }
  };

  const restart = () => {
    setCurrent(0);
    setSelected(null);
    setAnswers([]);
    setShowResult(false);
    setSubmitted(false);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-[calc(100vh-3.5rem)] w-full flex items-center justify-center">
          <AiLoader title="Generating your lesson quiz..." />
        </div>
      </DashboardLayout>
    );
  }

  if (error || questions.length === 0) {
    return (
      <DashboardLayout>
        <div className="h-screen w-full flex flex-col items-center justify-center space-y-6 px-4">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <Trophy className="h-7 w-7 text-destructive" />
            </div>
            <h2 className="text-lg font-bold">Quiz Generation Unavailable</h2>
            <p className="text-sm text-muted-foreground max-w-md">
              {error || "The AI tutor model is busy. Please try again."}
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={fetchQuiz} className="bg-gradient-to-r from-purple-600 to-violet-600 text-white font-bold rounded-xl shadow-lg">
              Try Again
            </Button>
            <Button variant="outline" onClick={() => navigate(-1)} className="rounded-xl">
              <ArrowLeft className="h-4 w-4 mr-2" /> Go Back
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const q = questions[current];
  const isLast = current === questions.length - 1;
  const score = answers.filter((a, i) => a === getCorrectIndex(questions[i])).length;
  const correctIdx = getCorrectIndex(q);

  const getDifficultyColor = (diff?: string) => {
    if (!diff) return "bg-primary/10 text-primary border-primary/10";
    const d = diff.toLowerCase();
    if (d === "easy") return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    if (d === "medium") return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    if (d === "hard") return "bg-rose-500/10 text-rose-500 border-rose-500/20";
    return "bg-primary/10 text-primary border-primary/10";
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-2xl mx-auto h-[calc(100vh-3.5rem)] flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {showResult ? (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-8 text-center"
            >
              <div className="gradient-bg rounded-full p-4 w-fit mx-auto mb-4 shadow-lg shadow-purple-500/20">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Quiz Complete!</h2>
              <p className="text-sm text-muted-foreground mb-4 font-medium truncate max-w-md mx-auto">{lessonTitle}</p>
              <p className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-violet-600 mb-4">{score}/{questions.length}</p>
              <p className="text-muted-foreground mb-6 font-medium">
                {score === questions.length ? "Perfect score! 🎉" : score >= questions.length / 2 ? "Good job! Keep learning." : "Keep practicing!"}
              </p>

              <div className="space-y-3 text-left mb-6 max-h-[300px] overflow-y-auto pr-1">
                {questions.map((item, i) => {
                  const correctIdxVal = getCorrectIndex(item);
                  const isCorrect = answers[i] === correctIdxVal;
                  return (
                    <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border/50">
                      {isCorrect
                        ? <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        : <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                      }
                      <div>
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${getDifficultyColor(item.difficulty)}`}>
                            {item.difficulty || "General"}
                          </span>
                          <span className="text-xs text-muted-foreground font-semibold">Question {i + 1}</span>
                        </div>
                        <p className="text-sm font-bold text-foreground mb-1 leading-snug">{item.question}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{item.explanation}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3 justify-center">
                <Button onClick={restart} className="gradient-bg border-0 text-white font-bold rounded-xl shadow-lg">
                  <RotateCcw className="h-4 w-4 mr-2" /> Retake Quiz
                </Button>
                <Button variant="outline" onClick={() => navigate(-1)} className="rounded-xl border-border/60">
                  Back to Lesson
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div key={current} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              {/* Progress Header */}
              <div className="mb-6">
                <div className="flex justify-between items-center text-xs text-muted-foreground mb-2">
                  <span className="font-semibold">Question {current + 1} of {questions.length}</span>
                  <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${getDifficultyColor(q.difficulty)}`}>
                    {q.difficulty || "General"}
                  </span>
                </div>
                <Progress value={((current) / questions.length) * 100} className="h-2" />
              </div>

              <div className="glass-card p-6 border border-border/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl pointer-events-none" />
                <h2 className="text-lg font-bold mb-6 text-foreground leading-relaxed">{q.question}</h2>
                <div className="space-y-3">
                  {q.options.map((opt: string, i: number) => {
                    let style = "border border-border/50 hover:border-primary/50 hover:bg-muted/50 bg-background/40";
                    if (selected === i && !submitted) style = "border-2 border-primary bg-primary/5 shadow-md shadow-primary/5";
                    if (submitted && i === correctIdx) style = "border-2 border-green-500 bg-green-500/5";
                    if (submitted && selected === i && i !== correctIdx) style = "border-2 border-red-500 bg-red-500/5";

                    return (
                      <button
                        key={i}
                        disabled={submitted}
                        onClick={() => handleSelect(i)}
                        className={`w-full text-left p-4 rounded-xl transition-all duration-150 text-sm font-medium ${style}`}
                      >
                        <span className="font-bold text-muted-foreground mr-2">{String.fromCharCode(65 + i)}.</span> {opt}
                      </button>
                    );
                  })}
                </div>

                {submitted && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 rounded-xl bg-muted/50 border border-border/50 text-xs text-muted-foreground leading-relaxed"
                  >
                    <span className="font-bold text-foreground block mb-1">Explanation:</span>
                    {q.explanation}
                  </motion.div>
                )}

                <div className="mt-6 flex justify-between items-center gap-3">
                  <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-xs text-muted-foreground">
                    Exit Quiz
                  </Button>
                  <Button onClick={handleNext} disabled={selected === null || savingScore} className="gradient-bg border-0 text-white font-bold rounded-xl shadow-lg">
                    {savingScore ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : !submitted ? (
                      "Check Answer"
                    ) : isLast ? (
                      "See Results"
                    ) : (
                      <>Next Question <ArrowRight className="ml-1.5 h-4 w-4" /></>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default Quiz;
