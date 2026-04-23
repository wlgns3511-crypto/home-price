"use client";
import { useState, useMemo } from "react";

interface Props {
  cityName: string;
  avgPrice: number;
  mortgageRate: number;
}

function fmt(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export function HomeAffordabilityCalc({ cityName, avgPrice, mortgageRate }: Props) {
  const [income, setIncome] = useState(75000);
  const [downPct, setDownPct] = useState(20);

  const result = useMemo(() => {
    // Max affordable: 28% of gross monthly income for PITI
    // Simplified: use 3.5x income rule + DTI cross-check
    const monthlyGross = income / 12;
    const maxMonthlyPayment = monthlyGross * 0.28;

    // Calculate max affordable price from DTI
    const monthlyRate = mortgageRate / 100 / 12;
    const termMonths = 360; // 30 years
    let maxLoanFromPayment: number;
    if (monthlyRate > 0) {
      maxLoanFromPayment = maxMonthlyPayment * (1 - Math.pow(1 + monthlyRate, -termMonths)) / monthlyRate;
    } else {
      maxLoanFromPayment = maxMonthlyPayment * termMonths;
    }
    const maxAffordable = Math.round(maxLoanFromPayment / (1 - downPct / 100));

    // Simple multiplier approach
    const multiplierPrice = Math.round(income * 3.5);

    // Use the lower of the two for conservative estimate
    const affordablePrice = Math.min(maxAffordable, multiplierPrice);

    // Monthly payment for this city's median
    const loanAmount = avgPrice * (1 - downPct / 100);
    let monthlyPayment: number;
    if (monthlyRate > 0) {
      monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1);
    } else {
      monthlyPayment = loanAmount / termMonths;
    }

    const downPaymentAmount = avgPrice * (downPct / 100);
    const gap = avgPrice - affordablePrice;
    const paymentToIncomeRatio = (monthlyPayment / monthlyGross) * 100;

    let verdict: "Affordable" | "Stretch" | "Out of reach";
    if (gap <= 0) {
      verdict = "Affordable";
    } else if (paymentToIncomeRatio <= 35) {
      verdict = "Stretch";
    } else {
      verdict = "Out of reach";
    }

    return {
      affordablePrice,
      monthlyPayment,
      downPaymentAmount,
      gap,
      verdict,
      paymentToIncomeRatio,
      maxMonthlyPayment,
    };
  }, [income, downPct, avgPrice, mortgageRate]);

  const verdictConfig = {
    "Affordable": { bg: "bg-green-50", border: "border-green-200", text: "text-green-800", icon: "OK" },
    "Stretch": { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-800", icon: "!!" },
    "Out of reach": { bg: "bg-red-50", border: "border-red-200", text: "text-red-800", icon: "X" },
  };

  const vc = verdictConfig[result.verdict];

  return (
    <section className="my-8 border border-emerald-200 rounded-xl overflow-hidden">
      <div className="bg-emerald-50 px-5 py-4 border-b border-emerald-200">
        <h2 className="text-lg font-bold text-emerald-900">Home Affordability Calculator</h2>
        <p className="text-xs text-emerald-600">{cityName} — Median home price: {fmt(avgPrice)}</p>
      </div>

      <div className="p-5 space-y-5">
        {/* Inputs */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Annual Income: <span className="font-bold text-emerald-700">{fmt(income)}</span>
            </label>
            <input
              type="range"
              min={30000}
              max={300000}
              step={5000}
              value={income}
              onChange={(e) => setIncome(Number(e.target.value))}
              className="w-full accent-emerald-600"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>$30K</span><span>$300K</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Down Payment: <span className="font-bold text-emerald-700">{downPct}%</span>
            </label>
            <input
              type="range"
              min={3}
              max={30}
              step={1}
              value={downPct}
              onChange={(e) => setDownPct(Number(e.target.value))}
              className="w-full accent-emerald-600"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>3%</span><span>30%</span>
            </div>
          </div>
        </div>

        {/* Verdict */}
        <div className={`${vc.bg} border ${vc.border} rounded-lg p-4`}>
          <div className="flex items-center gap-3 mb-2">
            <span className={`text-2xl font-black ${vc.text}`}>{vc.icon === "OK" ? "[OK]" : vc.icon === "!!" ? "[!!]" : "[X]"}</span>
            <span className={`text-lg font-bold ${vc.text}`}>{result.verdict}</span>
          </div>
          <p className={`text-sm ${vc.text} leading-relaxed`}>
            On <strong>{fmt(income)}</strong> income with <strong>{downPct}%</strong> down, you can afford up to{" "}
            <strong>{fmt(result.affordablePrice)}</strong>.{" "}
            {cityName}&apos;s median of <strong>{fmt(avgPrice)}</strong> is{" "}
            {result.gap <= 0 ? (
              <strong>within your range</strong>
            ) : (
              <><strong>{fmt(result.gap)} above</strong> your comfortable range</>
            )}.
          </p>
        </div>

        {/* Breakdown */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <div className="flex justify-between p-3 border-b border-slate-100 bg-slate-50">
            <span className="text-sm text-slate-600">Max Affordable Price</span>
            <span className="text-sm font-bold text-emerald-700">{fmt(result.affordablePrice)}</span>
          </div>
          <div className="flex justify-between p-3 border-b border-slate-100">
            <span className="text-sm text-slate-600">{cityName} Median Price</span>
            <span className="text-sm font-semibold">{fmt(avgPrice)}</span>
          </div>
          <div className="flex justify-between p-3 border-b border-slate-100 bg-slate-50">
            <span className="text-sm text-slate-600">Down Payment ({downPct}%)</span>
            <span className="text-sm font-semibold">{fmt(result.downPaymentAmount)}</span>
          </div>
          <div className="flex justify-between p-3 border-b border-slate-100">
            <span className="text-sm text-slate-600">Mortgage Rate</span>
            <span className="text-sm font-semibold">{mortgageRate.toFixed(2)}%</span>
          </div>
          <div className="flex justify-between p-3 border-b border-slate-100 bg-slate-50">
            <span className="text-sm text-slate-600">Est. Monthly Payment (median home)</span>
            <span className={`text-sm font-bold ${result.paymentToIncomeRatio > 28 ? "text-red-700" : "text-green-700"}`}>
              {fmt(Math.round(result.monthlyPayment))}/mo
            </span>
          </div>
          <div className="flex justify-between p-3 border-b border-slate-100">
            <span className="text-sm text-slate-600">Payment-to-Income Ratio</span>
            <span className={`text-sm font-bold ${result.paymentToIncomeRatio > 28 ? "text-red-700" : result.paymentToIncomeRatio > 20 ? "text-amber-700" : "text-green-700"}`}>
              {result.paymentToIncomeRatio.toFixed(1)}%
            </span>
          </div>
          <div className="flex justify-between p-3 bg-slate-50">
            <span className="text-sm text-slate-600">Max Comfortable Monthly</span>
            <span className="text-sm font-semibold">{fmt(Math.round(result.maxMonthlyPayment))}/mo</span>
          </div>
        </div>

        {/* Affordability bar visual */}
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-2">Your Budget vs {cityName} Median</p>
          <div className="relative">
            <div className="h-6 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              {/* Affordable range */}
              <div
                className="h-full bg-emerald-400 rounded-full"
                style={{ width: `${Math.min((result.affordablePrice / (avgPrice * 1.5)) * 100, 100)}%` }}
              />
            </div>
            {/* Median marker */}
            <div
              className="absolute top-0 h-6 w-0.5 bg-red-500"
              style={{ left: `${Math.min((avgPrice / (avgPrice * 1.5)) * 100, 100)}%` }}
              title={`Median: ${fmt(avgPrice)}`}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <span className="w-3 h-3 bg-emerald-400 rounded-sm inline-block" /> Your range
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <span className="w-3 h-0.5 bg-red-500 inline-block" /> City median
            </span>
          </div>
        </div>
      </div>

      <div className="px-5 py-3 bg-slate-50 border-t border-slate-200">
        <p className="text-xs text-slate-400">
          Based on the 28% DTI rule and 3.5x income guideline. Assumes a 30-year fixed-rate mortgage.
          Does not include property tax, insurance, or HOA fees. Not financial advice.
        </p>
      </div>
    </section>
  );
}
