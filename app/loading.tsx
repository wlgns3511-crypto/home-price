export default function Loading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-slate-200 rounded w-2/3" />
      <div className="h-4 bg-slate-200 rounded w-full" />
      <div className="h-4 bg-slate-200 rounded w-5/6" />
      <div className="h-64 bg-slate-100 rounded-lg mt-6" />
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="h-24 bg-slate-100 rounded-lg" />
        <div className="h-24 bg-slate-100 rounded-lg" />
        <div className="h-24 bg-slate-100 rounded-lg" />
      </div>
    </div>
  );
}
