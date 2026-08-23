import React, { useState } from 'react';
import { Search, RotateCcw } from 'lucide-react';

// Master list of 38 Banks & NBFCs with authentic brand metadata
export const PARTNERS_LIST = [
  { id: 'sbi', name: 'SBI', fullName: 'State Bank of India', type: 'bank', color: '#0083CA' },
  { id: 'hdfc', name: 'HDFC BANK', fullName: 'HDFC Bank', type: 'bank', color: '#004B8D' },
  { id: 'icici', name: 'ICICI Bank', fullName: 'ICICI Bank', type: 'bank', color: '#F37021' },
  { id: 'axis', name: 'AXIS BANK', fullName: 'Axis Bank', type: 'bank', color: '#97144D' },
  { id: 'kotak', name: 'kotak', fullName: 'Kotak Mahindra Bank', type: 'bank', color: '#ED1C24' },
  { id: 'yes', name: 'YES BANK', fullName: 'Yes Bank', type: 'bank', color: '#005A9C' },
  { id: 'idfc', name: 'IDFC FIRST Bank', fullName: 'IDFC FIRST Bank', type: 'bank', color: '#9E1B32' },
  { id: 'indusind', name: 'IndusInd Bank', fullName: 'IndusInd Bank', type: 'bank', color: '#941617' },
  { id: 'boi', name: 'Bank of India', fullName: 'Bank of India', type: 'bank', color: '#E31837' },
  { id: 'pnb', name: 'pnb', fullName: 'Punjab National Bank', type: 'bank', color: '#A00000' },
  { id: 'union', name: 'Union Bank of India', fullName: 'Union Bank of India', type: 'bank', color: '#003B73' },
  { id: 'indian', name: 'Indian Bank', fullName: 'Indian Bank', type: 'bank', color: '#1F3A60' },
  { id: 'canara', name: 'Canara Bank', fullName: 'Canara Bank', type: 'bank', color: '#0069B4' },
  { id: 'cbi', name: 'Central Bank of India', fullName: 'Central Bank of India', type: 'bank', color: '#003399' },
  { id: 'bob', name: 'Bank of Baroda', fullName: 'Bank of Baroda', type: 'bank', color: '#F26522' },
  { id: 'federal', name: 'FEDERAL BANK', fullName: 'Federal Bank', type: 'bank', color: '#004A8F' },
  { id: 'idbi', name: 'IDBI BANK', fullName: 'IDBI Bank', type: 'bank', color: '#008751' },
  { id: 'dcb', name: 'DCB BANK', fullName: 'DCB Bank', type: 'bank', color: '#00529B' },
  { id: 'rbl', name: 'RBL BANK', fullName: 'RBL Bank', type: 'bank', color: '#1A365D' },
  { id: 'au', name: 'AU SMALL FINANCE BANK', fullName: 'AU Small Finance Bank', type: 'nbfc', color: '#EE7203' },
  { id: 'tata', name: 'TATA CAPITAL', fullName: 'Tata Capital', type: 'nbfc', color: '#005696' },
  { id: 'lt', name: 'L&T Finance', fullName: 'L&T Finance', type: 'nbfc', color: '#005C9E' },
  { id: 'bajaj', name: 'BAJAJ FINSERV', fullName: 'Bajaj Finserv', type: 'nbfc', color: '#0066B3' },
  { id: 'chola', name: 'Chola', fullName: 'Cholamandalam Finance', type: 'nbfc', color: '#E31B23' },
  { id: 'mahindra', name: 'Mahindra FINANCE', fullName: 'Mahindra Finance', type: 'nbfc', color: '#E31B23' },
  { id: 'aditya', name: 'ADITYA BIRLA CAPITAL', fullName: 'Aditya Birla Capital', type: 'nbfc', color: '#B91C1C' },
  { id: 'muthoot', name: 'Muthoot FINCORP', fullName: 'Muthoot Fincorp', type: 'nbfc', color: '#D97706' },
  { id: 'shriram', name: 'SHRIRAM Finance', fullName: 'Shriram Finance', type: 'nbfc', color: '#B45309' },
  { id: 'mas', name: 'MAS FINANCIAL SERVICES', fullName: 'MAS Financial Services', type: 'nbfc', color: '#1D4ED8' },
  { id: 'edelweiss', name: 'Edelweiss', fullName: 'Edelweiss Financial Services', type: 'nbfc', color: '#2563EB' },
  { id: 'piramal', name: 'Piramal Capital', fullName: 'Piramal Housing Finance', type: 'nbfc', color: '#EA580C' },
  { id: 'jm', name: 'JM FINANCIAL', fullName: 'JM Financial', type: 'nbfc', color: '#DC2626' },
  { id: 'hdb', name: 'HDB FINANCIAL SERVICES', fullName: 'HDB Financial Services', type: 'nbfc', color: '#1E40AF' },
  { id: 'sundaram', name: 'SUNDARAM FINANCE', fullName: 'Sundaram Finance', type: 'nbfc', color: '#1E3A8A' },
  { id: 'ikf', name: 'IKF FINANCE', fullName: 'IKF Finance', type: 'nbfc', color: '#991B1B' },
  { id: 'incred', name: 'InCred finance', fullName: 'InCred Finance', type: 'nbfc', color: '#F97316' },
  { id: 'vivriti', name: 'VIVRITI CAPITAL', fullName: 'Vivriti Capital', type: 'nbfc', color: '#374151' },
  { id: 'niva', name: 'Niva Bupa Health Insurance', fullName: 'Niva Bupa Health Insurance', type: 'nbfc', color: '#0284C7' },
];

export function renderPartnerBrandLogo(id) {
  switch (id) {
    case 'sbi':
      return (
        <div className="flex items-center justify-center gap-1.5">
          <svg className="w-6 h-6 shrink-0" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="#0083CA" />
            <circle cx="50" cy="35" r="15" fill="#FFFFFF" />
            <rect x="44" y="35" width="12" height="40" fill="#FFFFFF" />
          </svg>
          <span className="font-black text-sm tracking-tight text-[#0083CA]">SBI</span>
        </div>
      );
    case 'hdfc':
      return (
        <div className="flex items-center justify-center gap-1.5">
          <div className="w-5 h-5 bg-[#004B8D] relative shrink-0 p-0.5 flex items-center justify-center rounded-sm">
            <div className="w-2.5 h-2.5 bg-[#E31B23]"></div>
            <div className="absolute top-0 left-0 w-2 h-2 bg-white"></div>
            <div className="absolute top-0 right-0 w-2 h-2 bg-white"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 bg-white"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 bg-white"></div>
          </div>
          <span className="font-black text-xs sm:text-sm tracking-tighter text-[#004B8D]">HDFC BANK</span>
        </div>
      );
    case 'icici':
      return (
        <div className="flex items-center justify-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-[#F37021] text-white font-black text-[10px] flex items-center justify-center shrink-0 shadow-sm">
            i
          </div>
          <span className="font-black text-xs sm:text-sm tracking-tight text-[#004B8D]">
            ICICI <span className="text-[#F37021]">Bank</span>
          </span>
        </div>
      );
    case 'axis':
      return (
        <div className="flex items-center justify-center gap-1.5">
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 100 100">
            <polygon points="50,10 90,90 65,90 50,55 35,90 10,90" fill="#97144D" />
          </svg>
          <span className="font-black text-xs sm:text-sm tracking-tighter text-[#97144D]">AXIS BANK</span>
        </div>
      );
    case 'kotak':
      return (
        <div className="flex items-center justify-center gap-1">
          <div className="h-5 w-5 rounded bg-[#ED1C24] text-white font-extrabold text-[11px] flex items-center justify-center shrink-0">
            k
          </div>
          <div className="flex flex-col text-left leading-none">
            <span className="font-black text-xs text-[#ED1C24] lowercase">kotak</span>
            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">Kotak Mahindra Bank</span>
          </div>
        </div>
      );
    case 'yes':
      return (
        <div className="flex items-center justify-center gap-1.5">
          <div className="h-5 w-5 bg-[#005A9C] rounded shrink-0 flex items-center justify-center relative">
            <div className="text-white font-black text-[10px] stroke-red-600">✓</div>
          </div>
          <span className="font-black text-xs sm:text-sm tracking-tight text-[#005A9C]">
            YES <span className="text-[#E31B23]">BANK</span>
          </span>
        </div>
      );
    case 'idfc':
      return (
        <div className="flex items-center justify-center gap-1.5">
          <div className="px-1.5 py-0.5 bg-[#9E1B32] text-white font-black text-[9px] rounded shrink-0 uppercase tracking-tighter">
            FIRST
          </div>
          <span className="font-black text-xs sm:text-sm tracking-tighter text-[#9E1B32]">IDFC FIRST Bank</span>
        </div>
      );
    case 'indusind':
      return (
        <div className="flex items-center justify-center gap-1">
          <span className="font-black text-xs sm:text-sm tracking-tight text-[#941617]">IndusInd Bank</span>
        </div>
      );
    case 'boi':
      return (
        <div className="flex items-center justify-center gap-1.5">
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 100 100">
            <polygon points="50,5 64,36 98,36 70,57 81,91 50,70 19,91 30,57 2,36 36,36" fill="#E31837" />
          </svg>
          <span className="font-black text-xs text-[#E31837]">Bank of India</span>
        </div>
      );
    case 'pnb':
      return (
        <div className="flex items-center justify-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-[#A00000] text-amber-300 font-black text-[9px] flex items-center justify-center shrink-0">
            pnb
          </div>
          <div className="flex flex-col text-left leading-none">
            <span className="font-black text-xs text-[#A00000] lowercase">pnb</span>
            <span className="text-[7px] font-bold text-slate-400 uppercase">punjab national bank</span>
          </div>
        </div>
      );
    case 'union':
      return (
        <div className="flex items-center justify-center gap-1.5">
          <div className="flex items-center shrink-0">
            <span className="text-[#003B73] font-black text-xs">U</span>
            <span className="text-[#E31B23] font-black text-xs -ml-1">B</span>
          </div>
          <span className="font-black text-xs tracking-tight text-[#003B73]">Union Bank <span className="text-slate-500 text-[9px] font-bold">of India</span></span>
        </div>
      );
    case 'indian':
      return (
        <div className="flex items-center justify-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-[#1F3A60] text-white font-black text-[9px] flex items-center justify-center shrink-0">
            IB
          </div>
          <span className="font-black text-xs text-[#1F3A60]">Indian Bank</span>
        </div>
      );
    case 'canara':
      return (
        <div className="flex items-center justify-center gap-1.5">
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 100 100">
            <polygon points="20,80 50,20 80,80" fill="#0069B4" />
            <polygon points="35,80 50,45 65,80" fill="#F59E0B" />
          </svg>
          <span className="font-black text-xs text-[#0069B4]">Canara Bank</span>
        </div>
      );
    case 'cbi':
      return (
        <div className="flex items-center justify-center gap-1.5">
          <div className="w-5 h-5 bg-[#003399] text-white font-black text-[9px] rounded-full flex items-center justify-center shrink-0">
            C
          </div>
          <span className="font-black text-xs text-[#003399]">Central Bank <span className="text-[8px] font-semibold text-slate-500">of India</span></span>
        </div>
      );
    case 'bob':
      return (
        <div className="flex items-center justify-center gap-1.5">
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="#F26522" />
            <path d="M30 65 L50 25 L70 65 Z" fill="#FFFFFF" />
          </svg>
          <span className="font-black text-xs text-[#F26522]">Bank of Baroda</span>
        </div>
      );
    case 'federal':
      return (
        <div className="flex items-center justify-center gap-1.5">
          <div className="px-1 py-0.5 bg-[#004A8F] text-amber-400 font-black text-[8px] rounded shrink-0">
            FED
          </div>
          <span className="font-black text-xs tracking-tighter text-[#004A8F]">FEDERAL BANK</span>
        </div>
      );
    case 'idbi':
      return (
        <div className="flex items-center justify-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-[#008751] text-white font-black text-[9px] flex items-center justify-center shrink-0">
            i
          </div>
          <span className="font-black text-xs tracking-tighter text-[#008751]">IDBI BANK</span>
        </div>
      );
    case 'dcb':
      return (
        <div className="flex items-center justify-center gap-1.5">
          <span className="font-black text-xs tracking-tighter text-[#00529B]">DCB BANK</span>
        </div>
      );
    case 'rbl':
      return (
        <div className="flex items-center justify-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-[#1A365D] shrink-0 border border-red-500"></div>
          <span className="font-black text-xs tracking-tighter text-[#1A365D]">RBLBANK</span>
        </div>
      );
    case 'au':
      return (
        <div className="flex items-center justify-center gap-1">
          <div className="px-1 py-0.5 bg-[#EE7203] text-white font-black text-[9px] rounded shrink-0">
            AU
          </div>
          <div className="flex flex-col text-left leading-none">
            <span className="font-black text-[10px] text-[#EE7203]">AU SMALL</span>
            <span className="text-[7px] font-bold text-slate-400">FINANCE BANK</span>
          </div>
        </div>
      );
    case 'tata':
      return (
        <div className="flex items-center justify-center gap-1.5">
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 100 100">
            <polygon points="50,10 90,50 50,90 10,50" fill="#005696" />
          </svg>
          <span className="font-black text-xs tracking-tighter text-[#005696]">TATA CAPITAL</span>
        </div>
      );
    case 'lt':
      return (
        <div className="flex items-center justify-center gap-1.5">
          <div className="px-1 py-0.5 bg-[#005C9E] text-white font-black text-[9px] rounded shrink-0">
            L&amp;T
          </div>
          <span className="font-black text-xs text-[#005C9E]">L&amp;T Finance</span>
        </div>
      );
    case 'bajaj':
      return (
        <div className="flex items-center justify-center gap-1.5">
          <div className="w-5 h-5 bg-[#0066B3] text-white font-black text-[11px] rounded flex items-center justify-center shrink-0">
            B
          </div>
          <span className="font-black text-xs tracking-tighter text-[#0066B3]">BAJAJ FINSERV</span>
        </div>
      );
    case 'chola':
      return (
        <div className="flex items-center justify-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-[#E31B23] border border-green-600 shrink-0"></div>
          <div className="flex flex-col text-left leading-none">
            <span className="font-black text-xs text-[#E31B23]">Chola</span>
            <span className="text-[6px] font-bold text-slate-400">Enter a better life</span>
          </div>
        </div>
      );
    case 'mahindra':
      return (
        <div className="flex items-center justify-center gap-1.5">
          <span className="font-black text-xs text-[#E31B23]">Mahindra</span>
          <span className="text-[9px] font-bold text-slate-500 uppercase">FINANCE</span>
        </div>
      );
    case 'aditya':
      return (
        <div className="flex items-center justify-center gap-1.5">
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 100 100">
            <polygon points="50,10 90,90 10,90" fill="#B91C1C" />
          </svg>
          <span className="font-black text-[10px] tracking-tighter text-[#B91C1C]">ADITYA BIRLA CAPITAL</span>
        </div>
      );
    case 'muthoot':
      return (
        <div className="flex items-center justify-center gap-1">
          <div className="w-5 h-5 rounded bg-[#D97706] text-white font-black text-[10px] flex items-center justify-center shrink-0">
            M
          </div>
          <span className="font-black text-xs text-[#D97706]">Muthoot <span className="text-[9px] font-bold text-slate-600">FINCORP</span></span>
        </div>
      );
    case 'shriram':
      return (
        <div className="flex items-center justify-center gap-1.5">
          <div className="px-1 py-0.5 bg-[#B45309] text-white font-black text-[8px] rounded shrink-0">
            SHRIRAM
          </div>
          <span className="font-black text-xs text-[#B45309]">Shriram <span className="text-[8px] font-bold text-slate-400">Finance</span></span>
        </div>
      );
    case 'mas':
      return (
        <div className="flex items-center justify-center gap-1.5">
          <div className="px-1.5 py-0.5 bg-[#1D4ED8] text-white font-black text-[9px] rounded shrink-0">
            MAS
          </div>
          <span className="font-black text-[9px] tracking-tighter text-[#1D4ED8]">FINANCIAL SERVICES</span>
        </div>
      );
    case 'edelweiss':
      return (
        <div className="flex items-center justify-center gap-1.5">
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="#2563EB" />
          </svg>
          <span className="font-black text-xs text-[#2563EB]">Edelweiss</span>
        </div>
      );
    case 'piramal':
      return (
        <div className="flex items-center justify-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-[#EA580C] shrink-0"></div>
          <span className="font-black text-xs text-[#EA580C]">Piramal <span className="text-[8px] font-semibold text-slate-500">Capital</span></span>
        </div>
      );
    case 'jm':
      return (
        <div className="flex items-center justify-center gap-1.5">
          <div className="px-1.5 py-0.5 bg-[#DC2626] text-white font-black text-[9px] rounded shrink-0">
            JM
          </div>
          <span className="font-black text-xs tracking-tighter text-[#DC2626]">JM FINANCIAL</span>
        </div>
      );
    case 'hdb':
      return (
        <div className="flex items-center justify-center gap-1.5">
          <div className="px-1.5 py-0.5 bg-[#1E40AF] text-white font-black text-[9px] rounded shrink-0">
            HDB
          </div>
          <span className="font-black text-[9px] tracking-tighter text-[#1E40AF]">FINANCIAL SERVICES</span>
        </div>
      );
    case 'sundaram':
      return (
        <div className="flex items-center justify-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-[#1E3A8A] text-white font-black text-[8px] flex items-center justify-center shrink-0">
            S
          </div>
          <span className="font-black text-[9px] tracking-tighter text-[#1E3A8A]">SUNDARAM FINANCE</span>
        </div>
      );
    case 'ikf':
      return (
        <div className="flex items-center justify-center gap-1.5">
          <span className="font-black text-xs tracking-tighter text-[#991B1B]">IKF FINANCE</span>
        </div>
      );
    case 'incred':
      return (
        <div className="flex items-center justify-center gap-1">
          <span className="font-black text-xs text-[#F97316]">InCred <span className="text-[8px] font-bold text-slate-500">finance</span></span>
        </div>
      );
    case 'vivriti':
      return (
        <div className="flex items-center justify-center gap-1.5">
          <span className="font-black text-xs tracking-tighter text-[#374151]">VIVRITI CAPITAL</span>
        </div>
      );
    case 'niva':
      return (
        <div className="flex items-center justify-center gap-1">
          <div className="w-4 h-4 rounded-full bg-[#0284C7] shrink-0"></div>
          <div className="flex flex-col text-left leading-none">
            <span className="font-black text-xs text-[#0284C7]">niva</span>
            <span className="text-[6px] font-bold text-slate-500">Health Insurance</span>
          </div>
        </div>
      );
    default:
      return <span className="font-black text-xs text-slate-800">{id}</span>;
  }
}

export default function PartnerBrandLogos({
  partnerFilter,
  setPartnerFilter,
  searchPartner,
  setSearchPartner,
  filteredPartners
}) {
  return (
    <section id="banks-nbfc" className="py-16 bg-slate-50 border-t border-b border-slate-200">
      <div className="bg-[#800000] text-white py-8 px-4 mb-10 text-center shadow-md">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider mb-1 text-white">
            OUR BANKING &amp; NBFC PARTNERS
          </h2>
          <p className="text-xs text-slate-200 font-medium">
            We are tied up with 40+ leading Banks &amp; NBFCs to provide you the best loan solutions.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 rounded-lg w-full sm:w-auto">
            <button
              onClick={() => setPartnerFilter('all')}
              className={`px-4 py-1.5 rounded-md text-[11px] font-bold uppercase transition-all cursor-pointer ${
                partnerFilter === 'all'
                  ? 'bg-[#800000] text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-300/50'
              }`}
            >
              All ({PARTNERS_LIST.length})
            </button>
            <button
              onClick={() => setPartnerFilter('bank')}
              className={`px-4 py-1.5 rounded-md text-[11px] font-bold uppercase transition-all cursor-pointer ${
                partnerFilter === 'bank'
                  ? 'bg-[#800000] text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-300/50'
              }`}
            >
              Banks ({PARTNERS_LIST.filter(p => p.type === 'bank').length})
            </button>
            <button
              onClick={() => setPartnerFilter('nbfc')}
              className={`px-4 py-1.5 rounded-md text-[11px] font-bold uppercase transition-all cursor-pointer ${
                partnerFilter === 'nbfc'
                  ? 'bg-[#800000] text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-300/50'
              }`}
            >
              NBFCs ({PARTNERS_LIST.filter(p => p.type === 'nbfc').length})
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <input 
              type="text"
              placeholder="Search Bank or NBFC"
              value={searchPartner}
              onChange={(e) => setSearchPartner(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#800000]/20 focus:border-[#800000] shadow-sm"
            />
            <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
            {searchPartner && (
              <button 
                onClick={() => setSearchPartner('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {filteredPartners.length === 0 ? (
          <div className="py-12 bg-white rounded-2xl border border-dashed border-slate-300 text-center flex flex-col items-center">
            <Search size={36} className="text-slate-300 mb-2" />
            <div className="text-sm font-bold text-slate-700 mb-1">No partner found matching "{searchPartner}"</div>
            <button 
              onClick={() => { setSearchPartner(''); setPartnerFilter('all'); }}
              className="inline-flex items-center gap-1 text-xs font-bold text-[#800000] hover:underline uppercase tracking-wider"
            >
              <RotateCcw size={12} /> Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
            {filteredPartners.map((partner) => (
              <div 
                key={partner.id}
                className="bg-white border border-slate-200/90 rounded-xl px-3 py-2.5 h-[76px] sm:h-[80px] flex items-center justify-center text-center shadow-sm hover:shadow-lg hover:border-red-300 hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer overflow-hidden"
                title={partner.fullName}
              >
                <div className="w-full h-full flex items-center justify-center">
                  {renderPartnerBrandLogo(partner.id)}
                </div>
              </div>
            ))}

            <div className="bg-white border-2 border-dashed border-red-200 rounded-xl px-3 py-2.5 h-[76px] sm:h-[80px] flex flex-col items-center justify-center text-center shadow-sm hover:bg-red-50/50 transition-all cursor-pointer">
              <div className="font-extrabold text-xs text-[#800000] mb-0.5">
                &amp; Many More...
              </div>
              <div className="text-[9px] font-bold text-slate-500">
                Partners
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
