/**
 * PageSkeleton — loading fallback cho lazy routes (dark theme)
 * Match với bg-app-bg của toàn bộ app, không còn nháy trắng
 */

interface PageSkeletonProps {
  variant?: "dashboard" | "full" | "vocab" | "exam" | "flashcard";
}

function SkeletonBlock({ className }: { className: string }) {
  return (
    <div className={`bg-app-card/50 rounded-xl animate-pulse ${className}`} />
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex min-h-screen bg-[#13151c]">
      {/* Sidebar skeleton */}
      <div className="hidden md:flex flex-col w-60 bg-app-bg border-r border-app-border p-4 gap-3 flex-shrink-0">
        <SkeletonBlock className="h-9 w-32 mb-4" />
        {[...Array(8)].map((_, i) => (
          <SkeletonBlock key={i} className="h-8 w-full" />
        ))}
      </div>

      {/* Main content skeleton */}
      <div className="flex-1 p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <SkeletonBlock className="h-6 w-48 mb-2" />
            <SkeletonBlock className="h-3 w-64" />
          </div>
          <div className="flex gap-2">
            <SkeletonBlock className="h-9 w-24" />
            <SkeletonBlock className="h-9 w-32" />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-app-bg rounded-2xl p-4 border border-app-border">
              <SkeletonBlock className="h-4 w-20 mb-3" />
              <SkeletonBlock className="h-8 w-16 mb-1" />
              <SkeletonBlock className="h-3 w-24" />
            </div>
          ))}
        </div>

        {/* Content blocks */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-app-bg rounded-2xl p-5 border border-app-border">
            <SkeletonBlock className="h-5 w-36 mb-4" />
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <SkeletonBlock className="h-10 w-10 rounded-xl flex-shrink-0" />
                  <div className="flex-1">
                    <SkeletonBlock className="h-4 w-3/4 mb-1.5" />
                    <SkeletonBlock className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-app-bg rounded-2xl p-5 border border-app-border">
            <SkeletonBlock className="h-5 w-28 mb-4" />
            <SkeletonBlock className="h-32 w-full mb-3" />
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <SkeletonBlock key={i} className="h-4 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Skeleton cho trang từ vựng (grid 3 cột) */
function VocabSkeleton() {
  return (
    <div className="flex min-h-screen bg-[#13151c]">
      {/* Sidebar */}
      <div className="hidden md:flex flex-col w-60 bg-app-bg border-r border-app-border p-4 gap-3 flex-shrink-0">
        <SkeletonBlock className="h-9 w-32 mb-4" />
        {[...Array(10)].map((_, i) => (
          <SkeletonBlock key={i} className="h-8 w-full" />
        ))}
      </div>

      <div className="flex-1 p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <SkeletonBlock className="h-6 w-52 mb-2" />
            <SkeletonBlock className="h-3 w-80" />
          </div>
          <div className="flex gap-2">
            <SkeletonBlock className="h-9 w-24" />
            <SkeletonBlock className="h-9 w-36" />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4 mb-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-app-bg rounded-xl p-4 border border-app-border flex items-center gap-3">
              <SkeletonBlock className="h-10 w-10 rounded-xl flex-shrink-0" />
              <div className="flex-1">
                <SkeletonBlock className="h-6 w-12 mb-1" />
                <SkeletonBlock className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>

        {/* Topic chips */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {[...Array(8)].map((_, i) => (
            <SkeletonBlock key={i} className={`h-7 rounded-xl ${i === 0 ? "w-20" : "w-28"}`} />
          ))}
        </div>

        {/* Filter bar */}
        <div className="flex gap-3 mb-5">
          <SkeletonBlock className="h-9 w-48 rounded-xl" />
          <SkeletonBlock className="h-9 w-36 rounded-xl" />
          <SkeletonBlock className="h-9 flex-1 rounded-xl" />
        </div>

        {/* Vocab grid 3 cols */}
        <div className="grid grid-cols-3 gap-3">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="bg-app-bg border border-app-border rounded-xl p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <SkeletonBlock className="h-7 w-24 mb-1.5" />
                  <SkeletonBlock className="h-3 w-16" />
                </div>
                <div className="flex gap-1">
                  <SkeletonBlock className="h-7 w-7 rounded-lg" />
                  <SkeletonBlock className="h-7 w-7 rounded-lg" />
                  <SkeletonBlock className="h-7 w-7 rounded-lg" />
                </div>
              </div>
              <SkeletonBlock className="h-4 w-32 mb-2" />
              <SkeletonBlock className="h-3 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Skeleton cho trang thi / quiz */
function ExamSkeleton() {
  return (
    <div className="flex min-h-screen bg-[#13151c]">
      <div className="hidden md:flex flex-col w-60 bg-app-bg border-r border-app-border p-4 gap-3 flex-shrink-0">
        <SkeletonBlock className="h-9 w-32 mb-4" />
        {[...Array(8)].map((_, i) => (
          <SkeletonBlock key={i} className="h-8 w-full" />
        ))}
      </div>
      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <SkeletonBlock className="h-6 w-48" />
          <SkeletonBlock className="h-9 w-28" />
        </div>
        <div className="max-w-2xl mx-auto">
          <SkeletonBlock className="h-3 w-full rounded-full mb-6" />
          <div className="bg-app-bg border border-app-border rounded-2xl p-8 mb-5">
            <SkeletonBlock className="h-5 w-24 mb-4" />
            <SkeletonBlock className="h-8 w-full mb-2" />
            <SkeletonBlock className="h-8 w-3/4" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <SkeletonBlock key={i} className="h-14 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Skeleton cho trang flashcard */
function FlashcardSkeleton() {
  return (
    <div className="flex min-h-screen bg-[#13151c]">
      <div className="hidden md:flex flex-col w-60 bg-app-bg border-r border-app-border p-4 gap-3 flex-shrink-0">
        <SkeletonBlock className="h-9 w-32 mb-4" />
        {[...Array(8)].map((_, i) => (
          <SkeletonBlock key={i} className="h-8 w-full" />
        ))}
      </div>
      <div className="flex-1 p-6 flex flex-col items-center justify-center">
        <SkeletonBlock className="h-3 w-64 rounded-full mb-8" />
        <SkeletonBlock className="h-64 w-full max-w-md rounded-2xl mb-6" />
        <div className="flex gap-3 w-full max-w-md">
          <SkeletonBlock className="h-12 flex-1 rounded-xl" />
          <SkeletonBlock className="h-12 flex-1 rounded-xl" />
          <SkeletonBlock className="h-12 flex-1 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

function FullPageSkeleton() {
  return (
    <div className="min-h-screen bg-app-bg flex flex-col items-center justify-center px-6">
      <SkeletonBlock className="h-16 w-16 rounded-2xl mb-6" />
      <SkeletonBlock className="h-7 w-56 mb-3" />
      <SkeletonBlock className="h-4 w-72 mb-2" />
      <SkeletonBlock className="h-4 w-48 mb-8" />
      <div className="w-full max-w-sm space-y-3">
        {[...Array(4)].map((_, i) => (
          <SkeletonBlock key={i} className="h-14 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export default function PageSkeleton({ variant = "dashboard" }: PageSkeletonProps) {
  if (variant === "full") return <FullPageSkeleton />;
  if (variant === "vocab") return <VocabSkeleton />;
  if (variant === "exam") return <ExamSkeleton />;
  if (variant === "flashcard") return <FlashcardSkeleton />;
  return <DashboardSkeleton />;
}
