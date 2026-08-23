import React, { useState } from 'react';
import { Search, RotateCcw } from 'lucide-react';

// Imported authentic partner logos uploaded in src/assets/logo
import logoAbCapital from '../../assets/logo/ABCAPITAL.NS_BIG.png';
import logoAuBank from '../../assets/logo/AUBANK.NS_BIG.png';
import logoBajajFinserv from '../../assets/logo/BAJAJFINSV.NS_BIG.png';
import logoBob from '../../assets/logo/Bank_of_Baroda_logo_orange_background.png';
import logoBoi from '../../assets/logo/Bank_of_India_logo_PNG2.png';
import logoChola from '../../assets/logo/CHOLAFIN.NS_BIG.png';
import logoCanara from '../../assets/logo/Canara_Bank_Logo.svg';
import logoCbi from '../../assets/logo/Central_Bank_of_India_Logo.svg';
import logoDcb from '../../assets/logo/Development_Credit_Bank.svg';
import logoFederal from '../../assets/logo/Federal_bank_India.svg';
import logoHdb from '../../assets/logo/HDB_Financial_Services_logo.svg';
import logoIdbi from '../../assets/logo/IDBI.NS_BIG.png';
import logoIndianBank from '../../assets/logo/INDIANB.NS_BIG.png';
import logoIndusind from '../../assets/logo/IndusInd_Bank_SVG_Logo.svg';
import logoKotak from '../../assets/logo/Kotak.png';
import logoLt from '../../assets/logo/L&T finacial.jpg';
import logoIdfc from '../../assets/logo/Logo_of_IDFC_First_Bank.svg';
import logoMuthoot from '../../assets/logo/MUTHOOTFIN.NS_BIG.png';
import logoMahindra from '../../assets/logo/Mahindra-finance-logo.png';
import logoPnb from '../../assets/logo/Punjab_National_Bank_new_logo.svg';
import logoRbl from '../../assets/logo/RBLBANK.NS_BIG.png';
import logoShriram from '../../assets/logo/SHRIRAMFIN.NS_BIG.png';
import logoSundaram from '../../assets/logo/Sundaram_Finance_Limited_Logo.jpg';
import logoTata from '../../assets/logo/Tata_Capital_Logo-01.jpg';
import logoUnion from '../../assets/logo/Union_Bank_of_India_Logo.svg';
import logoPiramal from '../../assets/logo/Piramal.svg';
import logoIkf from '../../assets/logo/ikf.png';
import logoNiva from '../../assets/logo/nivi.png';
import logoEdelweiss from '../../assets/logo/Edelweiss_Group_logo.svg';
import logoMas from '../../assets/logo/masfinancial.jpg';
import logoVivriti from '../../assets/logo/vivriti-65800cd2e6718.webp';
import logoYes from '../../assets/logo/Yes_Bank_Logo_in_2024.png';

export const LOCAL_PARTNER_LOGOS = {
  aditya: logoAbCapital,
  au: logoAuBank,
  bajaj: logoBajajFinserv,
  bob: logoBob,
  boi: logoBoi,
  chola: logoChola,
  canara: logoCanara,
  cbi: logoCbi,
  dcb: logoDcb,
  edelweiss: logoEdelweiss,
  federal: logoFederal,
  hdb: logoHdb,
  idbi: logoIdbi,
  ikf: logoIkf,
  indian: logoIndianBank,
  indusind: logoIndusind,
  kotak: logoKotak,
  lt: logoLt,
  idfc: logoIdfc,
  mas: logoMas,
  muthoot: logoMuthoot,
  mahindra: logoMahindra,
  niva: logoNiva,
  piramal: logoPiramal,
  pnb: logoPnb,
  rbl: logoRbl,
  shriram: logoShriram,
  sundaram: logoSundaram,
  tata: logoTata,
  union: logoUnion,
  vivriti: logoVivriti,
  yes: logoYes
};

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

export function renderPartnerBrandLogo(partner) {
  const id = typeof partner === 'string' ? partner : partner?.id;
  const name = typeof partner === 'string' ? partner : partner?.fullName || partner?.name;

  if (LOCAL_PARTNER_LOGOS[id]) {
    return (
      <img 
        src={LOCAL_PARTNER_LOGOS[id]} 
        alt={`${name} logo`}
        className="max-h-11 sm:max-h-12 max-w-[110px] sm:max-w-[125px] w-auto h-auto object-contain transition-transform duration-200 group-hover:scale-105"
        loading="lazy"
      />
    );
  }

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
    case 'jm':
      return (
        <div className="flex items-center justify-center gap-1.5">
          <div className="px-1.5 py-0.5 bg-[#DC2626] text-white font-black text-[9px] rounded shrink-0">
            JM
          </div>
          <span className="font-black text-xs tracking-tighter text-[#DC2626]">JM FINANCIAL</span>
        </div>
      );
    case 'incred':
      return (
        <div className="flex items-center justify-center gap-1">
          <span className="font-black text-xs text-[#F97316]">InCred <span className="text-[8px] font-bold text-slate-500">finance</span></span>
        </div>
      );
    default:
      return <span className="font-black text-xs text-slate-800">{name || id}</span>;
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
                className="bg-white border border-slate-200/90 rounded-xl px-3 py-2.5 h-[84px] sm:h-[90px] flex flex-col items-center justify-center text-center shadow-sm hover:shadow-lg hover:border-red-300 hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer overflow-hidden"
                title={partner.fullName}
              >
                <div className="w-full h-full flex items-center justify-center">
                  {renderPartnerBrandLogo(partner)}
                </div>
              </div>
            ))}

            <div className="bg-white border-2 border-dashed border-red-200 rounded-xl px-3 py-2.5 h-[84px] sm:h-[90px] flex flex-col items-center justify-center text-center shadow-sm hover:bg-red-50/50 transition-all cursor-pointer">
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
