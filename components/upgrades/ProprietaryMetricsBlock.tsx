import { JSX } from "react";

interface ProprietaryMetricsBlockProps {
  pirIndex: number;
  mortgageBurden: number;
  rentToBuyGrade: string;
  commentary: string;
}

function getMortgageBurdenLevel(score: number): { label: string; color: string; ringColor: string; bg: string } {
  if (score >= 35) {
    return { label: "High Housing Burden", color: "text-rose-700", ringColor: "stroke-rose-500", bg: "bg-rose-50" };
  }
  if (score >= 28) {
    return { label: "Moderate Burden", color: "text-amber-700", ringColor: "stroke-amber-500", bg: "bg-amber-50" };
  }
  return { label: "Healthy Mortgage Load", color: "text-emerald-700", ringColor: "stroke-emerald-500", bg: "bg-emerald-50" };
}

function getGradeStyles(grade: string): { badge: string; border: string; bg: string } {
  const cleanGrade = grade.charAt(0);
  switch (cleanGrade) {
    case "A":
      return { badge: "text-emerald-800 bg-emerald-100", border: "border-emerald-200", bg: "bg-emerald-50/30" };
    case "B":
    case "C":
      return { badge: "text-teal-800 bg-teal-100", border: "border-teal-200", bg: "bg-teal-50/30" };
    case "D":
    case "F":
    default:
      return { badge: "text-rose-800 bg-rose-100", border: "border-rose-200", bg: "bg-rose-50/30" };
  }
}

export function ProprietaryMetricsBlock({
  pirIndex,
  mortgageBurden,
  rentToBuyGrade,
  commentary,
}: ProprietaryMetricsBlockProps): JSX.Element {
  const mortgageLevel = getMortgageBurdenLevel(mortgageBurden);
  const gradeStyles = getGradeStyles(rentToBuyGrade);

  // SVG Circle parameters for progress gauge
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const pirDashoffset = circumference - (pirIndex / 100) * circumference;
  const mortgageDashoffset = circumference - (Math.min(100, mortgageBurden) / 100) * circumference;

  return (
    <section
      data-upgrade="proprietary-metrics"
      aria-label="HomePricePeek Proprietary Affordability and Rent-to-Buy Ratings"
      className="not-prose my-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">
        <svg
          aria-hidden="true"
          className="h-4.5 w-4.5 text-teal-600"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.746 3.746 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
          />
        </svg>
        HomePricePeek Market Analysis
      </h3>

      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Metric Gauges Row */}
        <div className="flex flex-row items-center gap-6 flex-shrink-0">
          {/* PIR Affordability Ring */}
          <div className="flex flex-col items-center">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 96 96">
                {/* Background Ring */}
                <circle
                  className="text-slate-100"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r={radius}
                  cx="48"
                  cy="48"
                />
                {/* Active Ring */}
                <circle
                  className="text-teal-500 stroke-teal-500 transition-all duration-500"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={pirDashoffset}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r={radius}
                  cx="48"
                  cy="48"
                />
              </svg>
              {/* Score Text */}
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-slate-800">{pirIndex}</span>
                <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">PIR Index</span>
              </div>
            </div>
            <span className="text-xs font-bold mt-2 text-teal-700">Affordability</span>
          </div>

          {/* Mortgage Burden Ring */}
          <div className="flex flex-col items-center">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 96 96">
                {/* Background Ring */}
                <circle
                  className="text-slate-100"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r={radius}
                  cx="48"
                  cy="48"
                />
                {/* Active Ring */}
                <circle
                  className={`${mortgageLevel.ringColor} transition-all duration-500`}
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={mortgageDashoffset}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r={radius}
                  cx="48"
                  cy="48"
                />
              </svg>
              {/* Score Text */}
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-slate-800">{mortgageBurden}%</span>
                <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">DTI Load</span>
              </div>
            </div>
            <span className={`text-xs font-bold mt-2 ${mortgageLevel.color}`}>{mortgageLevel.label}</span>
          </div>

          {/* Rent-to-Buy Grade Badge */}
          <div className="flex flex-col items-center">
            <div className={`w-24 h-24 rounded-full border-2 ${gradeStyles.border} ${gradeStyles.bg} flex items-center justify-center`}>
              <div className={`w-18 h-18 rounded-full flex items-center justify-center font-black text-3xl shadow-sm ${gradeStyles.badge}`}>
                {rentToBuyGrade}
              </div>
            </div>
            <span className="text-xs font-bold text-slate-700 mt-2">Rent vs. Buy</span>
          </div>
        </div>

        {/* Dynamic Commentary Text */}
        <div className="flex-1 bg-slate-50 border border-slate-100 rounded-xl p-4.5">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Expert Market Interpretation</h4>
          <p className="text-sm text-slate-700 leading-relaxed font-normal">
            {commentary}
          </p>
        </div>
      </div>

      <div className="mt-4 border-t border-slate-100 pt-3 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-slate-400">
        <span>* PIR Index measures home price to median household income ratio scaled to 100 (higher means more affordable).</span>
        <span>* DTI Load is the percentage of gross median monthly income consumed by estimated mortgage payments.</span>
        <span>* Rent vs. Buy Grade rates the efficiency of buying based on the Price-to-Rent Ratio (PRR).</span>
      </div>
    </section>
  );
}
