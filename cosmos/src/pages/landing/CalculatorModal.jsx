import React from 'react';
import { Calculator, X } from 'lucide-react';

export default function CalculatorModal({
  calculatorModalOpen,
  setCalculatorModalOpen,
  calcTitle,
  calcAmount,
  setCalcAmount,
  calcRate,
  setCalcRate,
  calcTenure,
  setCalcTenure,
  calcResults,
  scrollToSection
}) {
  if (!calculatorModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 relative my-6">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b pb-3 mb-5">
          <div className="flex items-center gap-2">
            <Calculator size={20} className="text-[#800000]" />
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              {calcTitle}
            </h3>
          </div>
          <button 
            onClick={() => setCalculatorModalOpen(false)}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Slider & Input Controls */}
        <div className="space-y-5">
          
          {/* Loan Amount */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase">Loan Amount (₹)</label>
              <span className="text-xs font-black text-[#800000]">₹ {calcAmount.toLocaleString('en-IN')}</span>
            </div>
            <input 
              type="range" 
              min={100000} 
              max={50000000} 
              step={50000}
              value={calcAmount} 
              onChange={(e) => setCalcAmount(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#800000]"
            />
            <div className="flex justify-between text-[9px] text-slate-400 mt-1 font-semibold">
              <span>₹1 Lakh</span>
              <span>₹5 Crores</span>
            </div>
          </div>

          {/* Interest Rate */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase">Interest Rate (% p.a.)</label>
              <span className="text-xs font-black text-[#800000]">{calcRate}%</span>
            </div>
            <input 
              type="range" 
              min={6.5} 
              max={18.0} 
              step={0.1}
              value={calcRate} 
              onChange={(e) => setCalcRate(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#800000]"
            />
            <div className="flex justify-between text-[9px] text-slate-400 mt-1 font-semibold">
              <span>6.5%</span>
              <span>18.0%</span>
            </div>
          </div>

          {/* Tenure */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[11px] font-bold text-slate-700 uppercase">Tenure (Years)</label>
              <span className="text-xs font-black text-[#800000]">{calcTenure} Years</span>
            </div>
            <input 
              type="range" 
              min={1} 
              max={30} 
              step={1}
              value={calcTenure} 
              onChange={(e) => setCalcTenure(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#800000]"
            />
            <div className="flex justify-between text-[9px] text-slate-400 mt-1 font-semibold">
              <span>1 Year</span>
              <span>30 Years</span>
            </div>
          </div>

        </div>

        {/* Results Display Box */}
        <div className="mt-6 bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Monthly EMI</div>
            <div className="text-lg font-black text-[#800000]">₹ {calcResults.emi.toLocaleString('en-IN')}</div>
          </div>
          <div className="border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0">
            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Total Interest</div>
            <div className="text-sm font-bold text-slate-700">₹ {calcResults.totalInterest.toLocaleString('en-IN')}</div>
          </div>
          <div className="border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0">
            <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Total Amount</div>
            <div className="text-sm font-bold text-slate-700">₹ {calcResults.totalPayment.toLocaleString('en-IN')}</div>
          </div>
        </div>

        {/* Apply Button */}
        <div className="mt-5 flex flex-col sm:flex-row gap-2.5">
          <button 
            onClick={() => {
              setCalculatorModalOpen(false);
              scrollToSection('eligibility-form');
            }}
            className="flex-1 py-2.5 rounded-lg text-xs font-bold text-white bg-[#800000] hover:bg-[#660000] transition-all shadow-md uppercase tracking-wider cursor-pointer"
          >
            Apply for Loan with this EMI
          </button>
          <button 
            onClick={() => setCalculatorModalOpen(false)}
            className="px-5 py-2.5 rounded-lg text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all uppercase tracking-wider cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
