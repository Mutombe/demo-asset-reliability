import React from 'react';

/* One primitive: a soft grey block with rounded corners and a slow pulse.
   Composed into the exact shape of the content it stands in for, so the real
   data swaps in without a single pixel shifting. Light-theme greys (the admin
   content area is light). */
export function Skeleton({ className = '', style, rounded = 'rounded-md' }) {
  return <div className={`animate-pulse ${rounded} bg-[#e7e9ee] ${className}`} style={style} aria-hidden="true" />;
}

/* stat tiles row — matches the panel-800 KPI cards */
export function SkeletonStats({ n = 4 }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="panel-800 p-4 sm:p-5">
          <Skeleton className="w-10 h-10 mb-4" />
          <Skeleton className="h-7 w-16 mb-2.5" />
          <Skeleton className="h-2.5 w-24" />
        </div>
      ))}
    </div>
  );
}

/* table — same left media + two-line label + trailing cells as the real rows */
export function SkeletonTable({ rows = 6 }) {
  return (
    <div className="panel overflow-hidden">
      <div className="hidden md:flex gap-4 px-5 py-3 border-b border-[#eceef2]">
        {[3, 2, 1, 1, 1].map((w, i) => <Skeleton key={i} className="h-2.5" style={{ flex: w }} />)}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 px-4 sm:px-5 py-3.5 border-b border-[#f1f2f5] last:border-0">
          <Skeleton className="w-10 h-10 shrink-0" />
          <div className="flex-1 min-w-0 space-y-2"><Skeleton className="h-3.5 w-1/2" /><Skeleton className="h-2.5 w-1/3" /></div>
          <Skeleton className="h-3 w-20 hidden md:block" />
          <Skeleton className="h-3 w-14 hidden md:block" />
          <Skeleton className="h-4 w-4 rounded" />
        </div>
      ))}
    </div>
  );
}

/* card grid — matches the client / content cards */
export function SkeletonCards({ n = 6, cols = 'sm:grid-cols-2 lg:grid-cols-3', lines = 3 }) {
  return (
    <div className={`grid ${cols} gap-4`}>
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="panel p-5">
          <Skeleton className="h-5 w-2/3 mb-2.5" />
          <Skeleton className="h-3 w-1/2 mb-4" />
          {lines > 2 && <Skeleton className="h-12 w-full mb-3" />}
          <Skeleton className="h-9 w-full" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonMap({ height = 460 }) {
  return <div className="panel p-2 mb-4"><Skeleton rounded="rounded-lg" className="w-full" style={{ height }} /></div>;
}

/* project / detail lists */
export function SkeletonList({ n = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="w-7 h-7 rounded shrink-0" />
          <div className="flex-1 space-y-1.5"><Skeleton className="h-3.5 w-2/3" /><Skeleton className="h-2.5 w-1/3" /></div>
        </div>
      ))}
    </div>
  );
}
