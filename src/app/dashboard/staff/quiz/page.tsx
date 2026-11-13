"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const QUESTIONS = [
  {
    id: 1,
    question: "What is the minimum safe internal temperature for cooked poultry?",
    options: ["145°F (63°C)", "160°F (71°C)", "165°F (74°C)", "180°F (82°C)"],
    correct: 2,
  },
  {
    id: 2,
    question: "How often should food contact surfaces be sanitized during service?",
    options: ["Once a day", "Every 4 hours", "Every hour", "Only when visibly dirty"],
    correct: 1,
  },
  {
    id: 3,
    question: "Which of the following is NOT a correct handwashing procedure?",
    options: [
      "Wash for at least 20 seconds",
      "Use warm water and soap",
      "Rinse hands with cold water only",
      "Dry with a clean paper towel",
    ],
    correct: 2,
  },
];

const PASS_THRESHOLD = 90;

export default function QuizPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleSelect = (qId: number, optIdx: number) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < QUESTIONS.length) {
      alert("Please answer all questions before submitting.");
      return;
    }
    const correct = QUESTIONS.filter((q) => answers[q.id] === q.correct).length;
    const pct = Math.round((correct / QUESTIONS.length) * 100);
    setScore(pct);
    setSubmitted(true);

    try {
      await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleId: "module-1", score: pct }),
      });
    } catch {
      /* ignore network error */
    }
  };

  const passed = score >= PASS_THRESHOLD;

  return (
    <div className="min-h-screen bg-neutral-950 px-4 py-10">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div>
          <Link href="/dashboard/staff" className="text-xs text-indigo-400 hover:underline">← Back to dashboard</Link>
          <h1 className="mt-3 text-2xl font-bold text-white">Module 1: Safety Protocols Quiz</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Answer all 3 questions. You need <span className="text-white font-semibold">90%</span> or above to pass.
          </p>
        </div>

        {/* Questions */}
        {!submitted && QUESTIONS.map((q, qi) => (
          <div key={q.id} className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5 space-y-3">
            <p className="text-sm font-semibold text-white">
              <span className="text-neutral-500 mr-2">Q{qi + 1}.</span>{q.question}
            </p>
            <div className="space-y-2">
              {q.options.map((opt, oi) => {
                const selected = answers[q.id] === oi;
                return (
                  <button
                    key={oi}
                    onClick={() => handleSelect(q.id, oi)}
                    className={`w-full rounded-lg border px-4 py-2.5 text-left text-sm transition
                      ${selected
                        ? "border-indigo-500 bg-indigo-600/20 text-indigo-300"
                        : "border-neutral-700 bg-neutral-800 text-neutral-300 hover:border-neutral-500 hover:bg-neutral-700"
                      }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Result screen */}
        {submitted && (
          <div className={`rounded-2xl border p-8 text-center space-y-4 ${passed ? "border-emerald-500/40 bg-emerald-900/10" : "border-red-500/40 bg-red-900/10"}`}>
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-900 border border-neutral-800">
              {passed ? (
                <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">{score}%</h2>
            <p className={`text-lg font-semibold ${passed ? "text-emerald-400" : "text-red-400"}`}>
              {passed ? "Evaluation Passed" : "Passing Threshold Not Reached"}
            </p>
            <p className="text-sm text-neutral-400">
              {passed
                ? "Your score meets the 90% accreditation threshold. Your certificate will be issued."
                : `A minimum score of ${PASS_THRESHOLD}% is required to earn certification. Review the video and retry.`}
            </p>
            {passed && (
              <div className="rounded-xl border border-emerald-700/40 bg-emerald-900/20 p-4">
                <p className="text-xs text-emerald-300 font-medium">
                  Certificate generation via PDFKit/Puppeteer — Phase 4 deliverable
                </p>
              </div>
            )}
            <div className="flex justify-center gap-3 pt-2">
              <Link href="/dashboard/staff" className="rounded-lg border border-neutral-700 px-5 py-2.5 text-sm font-medium text-neutral-300 hover:bg-neutral-800 transition">
                Back to Dashboard
              </Link>
              {!passed && (
                <button
                  onClick={() => { setSubmitted(false); setAnswers({}); setScore(0); }}
                  className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 transition"
                >
                  Retake Quiz
                </button>
              )}
            </div>
          </div>
        )}

        {/* Submit button */}
        {!submitted && (
          <button
            onClick={handleSubmit}
            className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Submit Quiz ({Object.keys(answers).length}/{QUESTIONS.length} answered)
          </button>
        )}
      </div>
    </div>
  );
}

