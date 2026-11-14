"use client";

import { useState, useEffect } from "react";

export interface QuestionDraft {
  id?: string;
  questionText: string;
  options: string[];
  correctAnswer: number;
}

export interface ModuleDraft {
  id?: string;
  title: string;
  description: string | null;
  videoUrl: string;
  questions?: QuestionDraft[];
}

interface ModuleEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialModule?: ModuleDraft | null;
}

export default function ModuleEditorModal({
  isOpen,
  onClose,
  onSaved,
  initialModule,
}: ModuleEditorModalProps) {
  const isEditing = Boolean(initialModule?.id);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoSourceType, setVideoSourceType] = useState<"file" | "url">("url");
  const [videoUrl, setVideoUrl] = useState("/videos/module1-safety-protocols.mp4");
  const [file, setFile] = useState<File | null>(null);
  const [uploadingProgress, setUploadingProgress] = useState<number | null>(null);

  const [questions, setQuestions] = useState<QuestionDraft[]>([
    {
      questionText: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
    },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialModule) {
      setTitle(initialModule.title || "");
      setDescription(initialModule.description || "");
      setVideoUrl(initialModule.videoUrl || "/videos/module1-safety-protocols.mp4");
      setVideoSourceType("url");

      if (initialModule.questions && initialModule.questions.length > 0) {
        setQuestions(
          initialModule.questions.map((q) => ({
            id: q.id,
            questionText: q.questionText,
            options: Array.isArray(q.options) ? [...q.options] : ["", "", "", ""],
            correctAnswer: q.correctAnswer ?? 0,
          }))
        );
      } else {
        setQuestions([
          {
            questionText: "",
            options: ["", "", "", ""],
            correctAnswer: 0,
          },
        ]);
      }
    } else {
      setTitle("");
      setDescription("");
      setVideoUrl("/videos/module1-safety-protocols.mp4");
      setFile(null);
      setQuestions([
        {
          questionText: "",
          options: ["", "", "", ""],
          correctAnswer: 0,
        },
      ]);
    }
    setError(null);
  }, [initialModule, isOpen]);

  if (!isOpen) return null;

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        questionText: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
      },
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleQuestionTextChange = (index: number, text: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, questionText: text } : q))
    );
  };

  const handleOptionChange = (qIndex: number, optIndex: number, text: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        const newOptions = [...q.options];
        newOptions[optIndex] = text;
        return { ...q, options: newOptions };
      })
    );
  };

  const handleAddOption = (qIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        if (q.options.length >= 5) return q;
        return { ...q, options: [...q.options, ""] };
      })
    );
  };

  const handleRemoveOption = (qIndex: number, optIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        if (q.options.length <= 2) return q;
        const newOptions = q.options.filter((_, idx) => idx !== optIndex);
        const newCorrect =
          q.correctAnswer === optIndex
            ? 0
            : q.correctAnswer > optIndex
            ? q.correctAnswer - 1
            : q.correctAnswer;
        return { ...q, options: newOptions, correctAnswer: newCorrect };
      })
    );
  };

  const handleCorrectAnswerChange = (qIndex: number, optIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === qIndex ? { ...q, correctAnswer: optIndex } : q))
    );
  };

  const uploadVideoFile = async (videoFile: File): Promise<string> => {
    // 1. Try S3/R2 presigned URL first
    try {
      const presignedRes = await fetch("/api/manager/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: videoFile.name,
          contentType: videoFile.type || "video/mp4",
        }),
      });

      if (presignedRes.ok) {
        const presignedData = await presignedRes.json();
        if (presignedData.configured && presignedData.presignedUrl) {
          // Direct upload to S3/R2
          setUploadingProgress(10);
          const s3Upload = await fetch(presignedData.presignedUrl, {
            method: "PUT",
            headers: { "Content-Type": videoFile.type || "video/mp4" },
            body: videoFile,
          });
          if (s3Upload.ok) {
            setUploadingProgress(100);
            return presignedData.publicUrl;
          }
        }
      }
    } catch {
      // Fallback to local upload
    }

    // 2. Local multipart upload fallback
    setUploadingProgress(30);
    const formData = new FormData();
    formData.append("file", videoFile);
    const uploadRes = await fetch("/api/manager/upload-video", {
      method: "POST",
      body: formData,
    });

    if (!uploadRes.ok) {
      throw new Error("Video file upload failed.");
    }
    const uploadData = await uploadRes.json();
    setUploadingProgress(100);
    return uploadData.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Please provide a module title.");
      return;
    }

    let finalVideoUrl = videoUrl.trim();

    if (videoSourceType === "file") {
      if (!file && !finalVideoUrl) {
        setError("Please choose a video file or provide a video URL.");
        return;
      }
      if (file) {
        setSubmitting(true);
        try {
          finalVideoUrl = await uploadVideoFile(file);
        } catch (err: unknown) {
          setError(err instanceof Error ? err.message : "Video upload failed");
          setSubmitting(false);
          return;
        }
      }
    }

    if (!finalVideoUrl) {
      setError("Video source is required.");
      return;
    }

    // Validate questions
    const validQuestions = questions.filter(
      (q) => q.questionText.trim() && q.options.some((o) => o.trim())
    );

    if (validQuestions.length === 0) {
      setError("Please add at least one complete evaluation question.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        videoUrl: finalVideoUrl,
        questions: validQuestions.map((q) => ({
          questionText: q.questionText.trim(),
          options: q.options.map((o) => o.trim() || "Option"),
          correctAnswer: q.correctAnswer,
        })),
      };

      const url = isEditing
        ? `/api/manager/modules/${initialModule?.id}`
        : "/api/manager/modules";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save module.");
      }

      onSaved();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error saving module");
    } finally {
      setSubmitting(false);
      setUploadingProgress(null);
    }
  };

  const handleDelete = async () => {
    if (!initialModule?.id) return;
    if (!confirm(`Are you sure you want to delete "${initialModule.title}"? This will delete all associated quiz records.`)) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/manager/modules/${initialModule.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Failed to delete module.");
      }
      onSaved();
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Delete error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-neutral-800 bg-neutral-900 p-6 md:p-8 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {isEditing ? "Edit Training Module" : "Create Training Module"}
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Configure curriculum video and compliance evaluation questions.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white transition"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/40 bg-red-950/40 p-3.5 text-xs text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Module Basics */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                Module Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Allergen Control & Cross-Contact Prevention"
                className="w-full rounded-xl border border-neutral-700 bg-neutral-800/80 px-4 py-2.5 text-sm text-white placeholder-neutral-500 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                Description
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of kitchen procedures, safety rules, and compliance criteria."
                className="w-full rounded-xl border border-neutral-700 bg-neutral-800/80 px-4 py-2 text-sm text-white placeholder-neutral-500 outline-none focus:border-indigo-500"
              />
            </div>

            {/* Video Source */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Video Source
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setVideoSourceType("url")}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                      videoSourceType === "url"
                        ? "bg-indigo-600 text-white"
                        : "bg-neutral-800 text-neutral-400 hover:text-white"
                    }`}
                  >
                    Direct URL / Preset
                  </button>
                  <button
                    type="button"
                    onClick={() => setVideoSourceType("file")}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                      videoSourceType === "file"
                        ? "bg-indigo-600 text-white"
                        : "bg-neutral-800 text-neutral-400 hover:text-white"
                    }`}
                  >
                    Upload Video File
                  </button>
                </div>
              </div>

              {videoSourceType === "url" ? (
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="/videos/module1-safety-protocols.mp4"
                  className="w-full rounded-xl border border-neutral-700 bg-neutral-800/80 px-4 py-2.5 text-sm text-white placeholder-neutral-500 outline-none focus:border-indigo-500"
                />
              ) : (
                <div className="rounded-xl border border-dashed border-neutral-700 bg-neutral-800/40 p-4 text-center">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="block w-full text-xs text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
                  />
                  {file && (
                    <p className="mt-2 text-xs text-emerald-400">
                      Selected: {file.name} ({(file.size / (1024 * 1024)).toFixed(1)} MB)
                    </p>
                  )}
                  {uploadingProgress !== null && (
                    <div className="mt-3 space-y-1">
                      <div className="h-1.5 w-full bg-neutral-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-500 transition-all duration-300"
                          style={{ width: `${uploadingProgress}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-neutral-400">Uploading: {uploadingProgress}%</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Quiz Builder */}
          <div className="border-t border-neutral-800 pt-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                  Accreditation Questions ({questions.length})
                </h3>
                <p className="text-xs text-neutral-400">
                  Select the radio button next to the single correct answer.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="flex items-center gap-1.5 rounded-lg bg-neutral-800 px-3 py-1.5 text-xs font-semibold text-neutral-200 hover:bg-neutral-700 transition"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Question
              </button>
            </div>

            <div className="space-y-4">
              {questions.map((q, qIndex) => (
                <div
                  key={qIndex}
                  className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-4 space-y-3 relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-400">
                      Question {qIndex + 1}
                    </span>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(qIndex)}
                        className="text-neutral-500 hover:text-red-400 text-xs flex items-center gap-1 transition"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        Remove
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    required
                    value={q.questionText}
                    onChange={(e) => handleQuestionTextChange(qIndex, e.target.value)}
                    placeholder="Enter question text here..."
                    className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3.5 py-2 text-xs text-white placeholder-neutral-500 outline-none focus:border-indigo-500"
                  />

                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] text-neutral-500 uppercase tracking-wider font-semibold">
                        Answers (select correct radio)
                      </p>
                      {q.options.length < 5 && (
                        <button
                          type="button"
                          onClick={() => handleAddOption(qIndex)}
                          className="text-[11px] text-indigo-400 hover:underline"
                        >
                          + Add Option
                        </button>
                      )}
                    </div>

                    {q.options.map((opt, optIndex) => (
                      <div key={optIndex} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-answer-${qIndex}`}
                          checked={q.correctAnswer === optIndex}
                          onChange={() => handleCorrectAnswerChange(qIndex, optIndex)}
                          className="h-4 w-4 text-emerald-500 focus:ring-emerald-400 cursor-pointer accent-emerald-500"
                        />
                        <input
                          type="text"
                          required
                          value={opt}
                          onChange={(e) => handleOptionChange(qIndex, optIndex, e.target.value)}
                          placeholder={`Option ${optIndex + 1}`}
                          className="flex-1 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-200 placeholder-neutral-600 outline-none focus:border-indigo-500"
                        />
                        {q.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(qIndex, optIndex)}
                            className="text-neutral-600 hover:text-red-400 text-xs px-1"
                            title="Remove option"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-between border-t border-neutral-800 pt-4">
            {isEditing ? (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting || submitting}
                className="text-xs text-red-400 hover:text-red-300 font-medium transition"
              >
                {deleting ? "Deleting..." : "Delete Module"}
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting || deleting}
                className="rounded-xl border border-neutral-700 px-5 py-2.5 text-xs font-semibold text-neutral-300 hover:bg-neutral-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || deleting}
                className="rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {submitting ? "Saving Changes..." : isEditing ? "Update Module" : "Publish Module"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

