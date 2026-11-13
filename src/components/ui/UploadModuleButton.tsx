"use client";

export default function UploadModuleButton() {
  return (
    <div className="flex items-center gap-3">
      <label className="cursor-pointer rounded-lg border border-dashed border-indigo-500/50 bg-indigo-600/10 px-4 py-3 text-sm text-indigo-400 transition hover:bg-indigo-600/20 flex items-center gap-2">
        <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        <span>Upload New Training Module</span>
        <input
          type="file"
          accept="video/*"
          className="hidden"
          onChange={() =>
            alert("(Prototype) File upload pipeline — AWS S3/R2 in Phase 2")
          }
        />
      </label>
      <span className="text-xs text-neutral-500">
        MP4, MOV up to 2GB (Phase 2: streamed to S3/R2)
      </span>
    </div>
  );
}

