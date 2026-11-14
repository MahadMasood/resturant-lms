"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface Question {
  id: string;
  questionText: string;
  options: string[];
}

const PASS_THRESHOLD = 90;

function QuizContent() {
  const searchParams = useSearchParams();
  const moduleId = searchParams.get("moduleId") || "module-food-safety";

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(false);
  const [certificateUrl, setCertificateUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/staff/quiz?moduleId=${encodeURIComponent(moduleId)}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setQuestions(data);
        } else {
          setQuestions([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load quiz questions.");
        setLoading(false);
      });
  }, [moduleId]);

  const handleSelect = (qId: string, optIdx: number) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < questions.length) {
      alert("Please answer all questions before submitting.");
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/staff/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleId, answers }),
      });

      if (res.status === 403) {
        setError("You must complete at least 80% of the training video before taking this evaluation.");
        setSubmitting(false);
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit quiz.");
      }

      setScore(data.score ?? 0);
      setPassed(data.passed ?? false);
      setCertificateUrl(data.certificateUrl ?? null);
      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-neutral-400 text-sm">
          <svg className="w-5 h-5 animate-spin text-indigo-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Loading evaluation questions...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 px-4 py-10">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div>
          <Link
            href="/dashboard/staff"
            className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 transition"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to dashboard
          </Link>
          <h1 className="mt-3 text-2xl font-bold text-white tracking-tight">
            Accreditation Quiz Evaluation
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            Answer all {questions.length} questions. You need{" "}
            <span className="text-white font-semibold">90%</span> or above to pass and earn your certificate.
          </p>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-500/40 bg-red-950/40 p-4">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {questions.length === 0 && !error && (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-8 text-center text-sm text-neutral-400">
            No questions configured for this module yet.
          </div>
        )}

        {/* Questions */}
        {!submitted &&
          questions.map((q, qi) => (
            <div key={q.id} className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 space-y-4">
              <p className="text-sm font-semibold text-white leading-relaxed">
                <span className="text-neutral-500 mr-2 font-mono">Q{qi + 1}.</span>
                {q.questionText}
              </p>
              <div className="space-y-2">
                {(q.options as string[]).map((opt, oi) => {
                  const selected = answers[q.id] === oi;
                  return (
                    <button
                      key={oi}
                      onClick={() => handleSelect(q.id, oi)}
                      className={`w-full rounded-xl border px-4 py-3 text-left text-sm transition flex items-center justify-between
                        ${
                          selected
                            ? "border-indigo-500 bg-indigo-600/20 text-indigo-200"
                            : "border-neutral-800 bg-neutral-800/80 text-neutral-300 hover:border-neutral-600 hover:bg-neutral-800"
                        }`}
                    >
                      <span>{opt}</span>
                      <span
                        className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                          selected ? "border-indigo-500 bg-indigo-600" : "border-neutral-600"
                        }`}
                      >
                        {selected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

        {/* Result screen */}
        {submitted && (
          <div
            className={`rounded-3xl border p-8 text-center space-y-5 shadow-2xl ${
              passed
                ? "border-emerald-500/40 bg-gradient-to-b from-emerald-950/40 to-neutral-900"
                : "border-red-500/40 bg-gradient-to-b from-red-950/40 to-neutral-900"
            }`}
          >
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

            <div>
              <h2 className="text-4xl font-extrabold text-white tracking-tight">{score}%</h2>
              <p className={`text-lg font-bold mt-1 ${passed ? "text-emerald-400" : "text-red-400"}`}>
                {passed ? "Accreditation Passed" : "Passing Threshold Not Reached"}
              </p>
              <p className="text-xs md:text-sm text-neutral-400 mt-2 max-w-md mx-auto">
                {passed
                  ? "Your evaluation meets the strict 90% compliance threshold. Your digital certificate has been issued."
                  : `A minimum score of ${PASS_THRESHOLD}% is required to earn certification. Review the training video and try again.`}
              </p>
            </div>

            {passed && certificateUrl && (
              <div className="pt-2">
                <a
                  href={certificateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-xs font-semibold text-white hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/30"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  View / Download Certificate
                </a>
              </div>
            )}

            <div className="flex justify-center gap-3 pt-3 border-t border-neutral-800">
              <Link
                href="/dashboard/staff"
                className="rounded-xl border border-neutral-700 px-5 py-2.5 text-xs font-semibold text-neutral-300 hover:bg-neutral-800 transition"
              >
                Return to Dashboard
              </Link>
              {!passed && (
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setAnswers({});
                    setScore(0);
                    setError(null);
                  }}
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 transition"
                >
                  Retake Evaluation
                </button>
              )}
            </div>
          </div>
        )}

        {/* Submit button */}
        {!submitted && questions.length > 0 && (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full rounded-2xl bg-indigo-600 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50 shadow-lg shadow-indigo-600/25"
          >
            {submitting
              ? "Grading Submission..."
              : `Submit Evaluation (${Object.keys(answers).length}/${questions.length} answered)`}
          </button>
        )}
      </div>
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-neutral-500 text-sm">
          Loading...
        </div>
      }
    >
      <QuizContent />
    </Suspense>
  );
}
