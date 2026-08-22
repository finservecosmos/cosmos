import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAppState } from '../context/AppStateContext'
import { useToast } from '../context/ToastContext'
import { 
  Home as HomeIcon, 
  Building2, 
  Briefcase, 
  Percent, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Mail, 
  ArrowRight, 
  FileText, 
  TrendingUp, 
  Users, 
  CheckCircle,
  MessageSquare,
  Sparkles,
  ChevronRight,
  Search,
  Check,
  Calculator,
  Car,
  UserCheck,
  Building,
  Landmark,
  BadgeCheck,
  Clock,
  FileCheck,
  Headphones,
  Award,
  Lock,
  Menu,
  X,
  Plus,
  ArrowRightLeft,
  Stamp,
  Receipt,
  HelpCircle,
  RotateCcw
} from 'lucide-react'
import cosmosLogo from '../assets/cosmosLogo.webp'
import heroAdvisorChart from '../assets/hero_advisor_chart.png'
import './LandingPage.css'

// Imported authentic partner logos uploaded in src/assets/logo
import logoAbCapital from '../assets/logo/ABCAPITAL.NS_BIG.png'
import logoAuBank from '../assets/logo/AUBANK.NS_BIG.png'
import logoBajajFinserv from '../assets/logo/BAJAJFINSV.NS_BIG.png'
import logoBob from '../assets/logo/Bank_of_Baroda_logo_orange_background.png'
import logoBoi from '../assets/logo/Bank_of_India_logo_PNG2.png'
import logoChola from '../assets/logo/CHOLAFIN.NS_BIG.png'
import logoCanara from '../assets/logo/Canara_Bank_Logo.svg'
import logoCbi from '../assets/logo/Central_Bank_of_India_Logo.svg'
import logoDcb from '../assets/logo/Development_Credit_Bank.svg'
import logoFederal from '../assets/logo/Federal_bank_India.svg'
import logoHdb from '../assets/logo/HDB_Financial_Services_logo.svg'
import logoIdbi from '../assets/logo/IDBI.NS_BIG.png'
import logoIndianBank from '../assets/logo/INDIANB.NS_BIG.png'
import logoIndusind from '../assets/logo/IndusInd_Bank_SVG_Logo.svg'
import logoKotak from '../assets/logo/Kotak.png'
import logoLt from '../assets/logo/L&T finacial.jpg'
import logoIdfc from '../assets/logo/Logo_of_IDFC_First_Bank.svg'
import logoMuthoot from '../assets/logo/MUTHOOTFIN.NS_BIG.png'
import logoMahindra from '../assets/logo/Mahindra-finance-logo.png'
import logoPnb from '../assets/logo/Punjab_National_Bank_new_logo.svg'
import logoRbl from '../assets/logo/RBLBANK.NS_BIG.png'
import logoShriram from '../assets/logo/SHRIRAMFIN.NS_BIG.png'
import logoSundaram from '../assets/logo/Sundaram_Finance_Limited_Logo.jpg'
import logoTata from '../assets/logo/Tata_Capital_Logo-01.jpg'
import logoUnion from '../assets/logo/Union_Bank_of_India_Logo.svg'
import logoPiramal from '../assets/logo/Piramal.svg'
import logoIkf from '../assets/logo/ikf.png'
import logoNiva from '../assets/logo/nivi.png'
import logoEdelweiss from '../assets/logo/Edelweiss_Group_logo.svg'
import logoMas from '../assets/logo/masfinancial.jpg'
import logoVivriti from '../assets/logo/vivriti-65800cd2e6718.webp'
import logoYes from '../assets/logo/Yes_Bank_Logo_in_2024.png'

const LOCAL_PARTNER_LOGOS = {
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
  yes: logoYes,
}

// Master list of 38 Banks & NBFCs with authentic brand metadata
const PARTNERS_LIST = [
  { id: 'sbi', name: 'SBI', fullName: 'State Bank of India', type: 'bank', color: '#00A5EC', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/cc/State_Bank_of_India_logo.svg' },
  { id: 'hdfc', name: 'HDFC BANK', fullName: 'HDFC Bank', type: 'bank', color: '#004B8D', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/28/HDFC_Bank_Logo.svg' },
  { id: 'icici', name: 'ICICI Bank', fullName: 'ICICI Bank', type: 'bank', color: '#F37021', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/12/ICICI_Bank_Logo.svg' },
  { id: 'axis', name: 'AXIS BANK', fullName: 'Axis Bank', type: 'bank', color: '#97144D', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1a/Axis_Bank_logo.svg' },
  { id: 'kotak', name: 'kotak', fullName: 'Kotak Mahindra Bank', type: 'bank', color: '#ED1C24', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/af/Kotak_Mahindra_Bank_logo.svg' },
  { id: 'yes', name: 'YES BANK', fullName: 'Yes Bank', type: 'bank', color: '#005A9C', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/YES_Bank_logo.svg' },
  { id: 'idfc', name: 'IDFC FIRST Bank', fullName: 'IDFC FIRST Bank', type: 'bank', color: '#9E1B32', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/dc/IDFC_First_Bank_logo.svg' },
  { id: 'indusind', name: 'IndusInd Bank', fullName: 'IndusInd Bank', type: 'bank', color: '#941617', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a2/IndusInd_Bank_logo.svg' },
  { id: 'boi', name: 'Bank of India', fullName: 'Bank of India', type: 'bank', color: '#E31837', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/36/Bank_of_India_logo.svg' },
  { id: 'pnb', name: 'pnb', fullName: 'Punjab National Bank', type: 'bank', color: '#A00000', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Punjab_National_Bank_Logo.svg' },
  { id: 'union', name: 'Union Bank of India', fullName: 'Union Bank of India', type: 'bank', color: '#003B73', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/ab/Union_Bank_of_India_Logo.svg' },
  { id: 'indian', name: 'Indian Bank', fullName: 'Indian Bank', type: 'bank', color: '#1F3A60' },
  { id: 'canara', name: 'Canara Bank', fullName: 'Canara Bank', type: 'bank', color: '#0069B4', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/94/Canara_Bank_Logo.svg' },
  { id: 'cbi', name: 'Central Bank of India', fullName: 'Central Bank of India', type: 'bank', color: '#003399' },
  { id: 'bob', name: 'Bank of Baroda', fullName: 'Bank of Baroda', type: 'bank', color: '#F26522', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Bank_of_Baroda_logo.svg' },
  { id: 'federal', name: 'FEDERAL BANK', fullName: 'Federal Bank', type: 'bank', color: '#004A8F', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/52/Federal_Bank_Logo.svg' },
  { id: 'idbi', name: 'IDBI BANK', fullName: 'IDBI Bank', type: 'bank', color: '#008751' },
  { id: 'dcb', name: 'DCB BANK', fullName: 'DCB Bank', type: 'bank', color: '#00529B' },
  { id: 'rbl', name: 'RBL BANK', fullName: 'RBL Bank', type: 'bank', color: '#1A365D' },
  { id: 'au', name: 'AU SMALL FINANCE BANK', fullName: 'AU Small Finance Bank', type: 'nbfc', color: '#EE7203' },
  { id: 'tata', name: 'TATA CAPITAL', fullName: 'Tata Capital', type: 'nbfc', color: '#005696', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Tata_Capital_logo.svg' },
  { id: 'lt', name: 'L&T Finance', fullName: 'L&T Finance', type: 'nbfc', color: '#005C9E', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/eb/L%26T_Finance_Holdings_logo.svg' },
  { id: 'bajaj', name: 'BAJAJ FINSERV', fullName: 'Bajaj Finserv', type: 'nbfc', color: '#0066B3', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/99/Bajaj_Finserv_logo.svg' },
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
]

// Render authentic brand logo graphics matching exact bank identity
function renderPartnerBrandLogo(id) {
  switch (id) {
    case 'sbi':
      return (
        <div className="flex items-center justify-center gap-2">
          <svg className="w-7 h-7 shrink-0" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="#00A5EC" />
            <circle cx="50" cy="50" r="14" fill="#FFFFFF" />
            <rect x="44" y="50" width="12" height="46" fill="#FFFFFF" />
          </svg>
          <span className="font-black text-base sm:text-lg tracking-tighter text-[#1C1765]">SBI</span>
        </div>
      )
    case 'hdfc':
      return (
        <div className="flex items-center justify-center rounded overflow-hidden shadow-xs">
          <div className="w-7 h-7 bg-[#E31B23] flex items-center justify-center shrink-0">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <rect width="100" height="100" fill="#E31B23" />
              <rect x="15" y="15" width="70" height="70" fill="#FFFFFF" />
              <rect x="42" y="0" width="16" height="100" fill="#FFFFFF" />
              <rect x="0" y="42" width="100" height="16" fill="#FFFFFF" />
              <rect x="30" y="30" width="40" height="40" fill="#004B8D" />
            </svg>
          </div>
          <div className="bg-[#004B8D] text-white font-black text-xs sm:text-sm tracking-tight px-2.5 py-1 flex items-center h-7">
            HDFC BANK
          </div>
        </div>
      )
    case 'icici':
      return (
        <div className="flex items-center justify-center gap-1.5">
          <svg className="w-7 h-7 shrink-0" viewBox="0 0 100 100">
            {/* Orange swoosh background */}
            <ellipse cx="44" cy="54" rx="38" ry="44" fill="#F58220" transform="rotate(-22 44 54)" />
            {/* Maroon main oval */}
            <ellipse cx="50" cy="48" rx="36" ry="42" fill="#B02A1E" transform="rotate(-22 50 48)" />
            {/* White 'i' dot */}
            <circle cx="60" cy="24" r="7.5" fill="#FFFFFF" />
            {/* White 'i' stem */}
            <path d="M 28 72 C 32 58 45 42 54 36 C 50 34 44 38 40 42 C 32 54 24 64 22 68 Z" fill="#FFFFFF" />
          </svg>
          <span className="font-black text-sm sm:text-base italic tracking-tight text-[#024785]">
            ICICI Bank
          </span>
        </div>
      )
    case 'axis':
      return (
        <div className="flex items-center justify-center gap-1.5">
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 100 100">
            <polygon points="50,10 90,90 65,90 50,55 35,90 10,90" fill="#97144D" />
          </svg>
          <span className="font-black text-xs sm:text-sm tracking-tighter text-[#97144D]">AXIS BANK</span>
        </div>
      )
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
      )
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
      )
    case 'idfc':
      return (
        <div className="flex items-center justify-center gap-1.5">
          <div className="px-1.5 py-0.5 bg-[#9E1B32] text-white font-black text-[9px] rounded shrink-0 uppercase tracking-tighter">
            FIRST
          </div>
          <span className="font-black text-xs sm:text-sm tracking-tighter text-[#9E1B32]">IDFC FIRST Bank</span>
        </div>
      )
    case 'indusind':
      return (
        <div className="flex items-center justify-center gap-1">
          <span className="font-black text-xs sm:text-sm tracking-tight text-[#941617]">IndusInd Bank</span>
        </div>
      )
    case 'boi':
      return (
        <div className="flex items-center justify-center gap-1.5">
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 100 100">
            <polygon points="50,5 64,36 98,36 70,57 81,91 50,70 19,91 30,57 2,36 36,36" fill="#E31837" />
          </svg>
          <span className="font-black text-xs text-[#E31837]">Bank of India</span>
        </div>
      )
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
      )
    case 'union':
      return (
        <div className="flex items-center justify-center gap-1.5">
          <div className="flex items-center shrink-0">
            <span className="text-[#003B73] font-black text-xs">U</span>
            <span className="text-[#E31B23] font-black text-xs -ml-1">B</span>
          </div>
          <span className="font-black text-xs tracking-tight text-[#003B73]">Union Bank <span className="text-slate-500 text-[9px] font-bold">of India</span></span>
        </div>
      )
    case 'indian':
      return (
        <div className="flex items-center justify-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-[#1F3A60] text-white font-black text-[9px] flex items-center justify-center shrink-0">
            IB
          </div>
          <span className="font-black text-xs text-[#1F3A60]">Indian Bank</span>
        </div>
      )
    case 'canara':
      return (
        <div className="flex items-center justify-center gap-1.5">
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 100 100">
            <polygon points="20,80 50,20 80,80" fill="#0069B4" />
            <polygon points="35,80 50,45 65,80" fill="#F59E0B" />
          </svg>
          <span className="font-black text-xs text-[#0069B4]">Canara Bank</span>
        </div>
      )
    case 'cbi':
      return (
        <div className="flex items-center justify-center gap-1.5">
          <div className="w-5 h-5 bg-[#003399] text-white font-black text-[9px] rounded-full flex items-center justify-center shrink-0">
            C
          </div>
          <span className="font-black text-xs text-[#003399]">Central Bank <span className="text-[8px] font-semibold text-slate-500">of India</span></span>
        </div>
      )
    case 'bob':
      return (
        <div className="flex items-center justify-center gap-1.5">
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="#F26522" />
            <path d="M30 65 L50 25 L70 65 Z" fill="#FFFFFF" />
          </svg>
          <span className="font-black text-xs text-[#F26522]">Bank of Baroda</span>
        </div>
      )
    case 'federal':
      return (
        <div className="flex items-center justify-center gap-1.5">
          <div className="px-1 py-0.5 bg-[#004A8F] text-amber-400 font-black text-[8px] rounded shrink-0">
            FED
          </div>
          <span className="font-black text-xs tracking-tighter text-[#004A8F]">FEDERAL BANK</span>
        </div>
      )
    case 'idbi':
      return (
        <div className="flex items-center justify-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-[#008751] text-white font-black text-[9px] flex items-center justify-center shrink-0">
            i
          </div>
          <span className="font-black text-xs tracking-tighter text-[#008751]">IDBI BANK</span>
        </div>
      )
    case 'dcb':
      return (
        <div className="flex items-center justify-center gap-1.5">
          <span className="font-black text-xs tracking-tighter text-[#00529B]">DCB BANK</span>
        </div>
      )
    case 'rbl':
      return (
        <div className="flex items-center justify-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-[#1A365D] shrink-0 border border-red-500"></div>
          <span className="font-black text-xs tracking-tighter text-[#1A365D]">RBLBANK</span>
        </div>
      )
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
      )
    case 'tata':
      return (
        <div className="flex items-center justify-center gap-1.5">
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 100 100">
            <polygon points="50,10 90,50 50,90 10,50" fill="#005696" />
          </svg>
          <span className="font-black text-xs tracking-tighter text-[#005696]">TATA CAPITAL</span>
        </div>
      )
    case 'lt':
      return (
        <div className="flex items-center justify-center gap-1.5">
          <div className="px-1 py-0.5 bg-[#005C9E] text-white font-black text-[9px] rounded shrink-0">
            L&amp;T
          </div>
          <span className="font-black text-xs text-[#005C9E]">L&amp;T Finance</span>
        </div>
      )
    case 'bajaj':
      return (
        <div className="flex items-center justify-center gap-1.5">
          <div className="w-5 h-5 bg-[#0066B3] text-white font-black text-[11px] rounded flex items-center justify-center shrink-0">
            B
          </div>
          <span className="font-black text-xs tracking-tighter text-[#0066B3]">BAJAJ FINSERV</span>
        </div>
      )
    case 'chola':
      return (
        <div className="flex items-center justify-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-[#E31B23] border border-green-600 shrink-0"></div>
          <div className="flex flex-col text-left leading-none">
            <span className="font-black text-xs text-[#E31B23]">Chola</span>
            <span className="text-[6px] font-bold text-slate-400">Enter a better life</span>
          </div>
        </div>
      )
    case 'mahindra':
      return (
        <div className="flex items-center justify-center gap-1.5">
          <span className="font-black text-xs text-[#E31B23]">Mahindra</span>
          <span className="text-[9px] font-bold text-slate-500 uppercase">FINANCE</span>
        </div>
      )
    case 'aditya':
      return (
        <div className="flex items-center justify-center gap-1.5">
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 100 100">
            <polygon points="50,10 90,90 10,90" fill="#B91C1C" />
          </svg>
          <span className="font-black text-[10px] tracking-tighter text-[#B91C1C]">ADITYA BIRLA CAPITAL</span>
        </div>
      )
    case 'muthoot':
      return (
        <div className="flex items-center justify-center gap-1">
          <div className="w-5 h-5 rounded bg-[#D97706] text-white font-black text-[10px] flex items-center justify-center shrink-0">
            M
          </div>
          <span className="font-black text-xs text-[#D97706]">Muthoot <span className="text-[9px] font-bold text-slate-600">FINCORP</span></span>
        </div>
      )
    case 'shriram':
      return (
        <div className="flex items-center justify-center gap-1.5">
          <div className="px-1 py-0.5 bg-[#B45309] text-white font-black text-[8px] rounded shrink-0">
            SHRIRAM
          </div>
          <span className="font-black text-xs text-[#B45309]">Shriram <span className="text-[8px] font-bold text-slate-400">Finance</span></span>
        </div>
      )
    case 'mas':
      return (
        <div className="flex items-center justify-center gap-1.5">
          <div className="px-1.5 py-0.5 bg-[#1D4ED8] text-white font-black text-[9px] rounded shrink-0">
            MAS
          </div>
          <span className="font-black text-[9px] tracking-tighter text-[#1D4ED8]">FINANCIAL SERVICES</span>
        </div>
      )
    case 'edelweiss':
      return (
        <div className="flex items-center justify-center gap-1.5">
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="#2563EB" />
          </svg>
          <span className="font-black text-xs text-[#2563EB]">Edelweiss</span>
        </div>
      )
    case 'piramal':
      return (
        <div className="flex items-center justify-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-[#EA580C] shrink-0"></div>
          <span className="font-black text-xs text-[#EA580C]">Piramal <span className="text-[8px] font-semibold text-slate-500">Capital</span></span>
        </div>
      )
    case 'jm':
      return (
        <div className="flex items-center justify-center gap-1.5">
          <div className="px-1.5 py-0.5 bg-[#DC2626] text-white font-black text-[9px] rounded shrink-0">
            JM
          </div>
          <span className="font-black text-xs tracking-tighter text-[#DC2626]">JM FINANCIAL</span>
        </div>
      )
    case 'hdb':
      return (
        <div className="flex items-center justify-center gap-1.5">
          <div className="px-1.5 py-0.5 bg-[#1E40AF] text-white font-black text-[9px] rounded shrink-0">
            HDB
          </div>
          <span className="font-black text-[9px] tracking-tighter text-[#1E40AF]">FINANCIAL SERVICES</span>
        </div>
      )
    case 'sundaram':
      return (
        <div className="flex items-center justify-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-[#1E3A8A] text-white font-black text-[8px] flex items-center justify-center shrink-0">
            S
          </div>
          <span className="font-black text-[9px] tracking-tighter text-[#1E3A8A]">SUNDARAM FINANCE</span>
        </div>
      )
    case 'ikf':
      return (
        <div className="flex items-center justify-center gap-1.5">
          <span className="font-black text-xs tracking-tighter text-[#991B1B]">IKF FINANCE</span>
        </div>
      )
    case 'incred':
      return (
        <div className="flex items-center justify-center gap-1">
          <span className="font-black text-xs text-[#F97316]">InCred <span className="text-[8px] font-bold text-slate-500">finance</span></span>
        </div>
      )
    case 'vivriti':
      return (
        <div className="flex items-center justify-center gap-1.5">
          <span className="font-black text-xs tracking-tighter text-[#374151]">VIVRITI CAPITAL</span>
        </div>
      )
    case 'niva':
      return (
        <div className="flex items-center justify-center gap-1">
          <div className="w-4 h-4 rounded-full bg-[#0284C7] shrink-0"></div>
          <div className="flex flex-col text-left leading-none">
            <span className="font-black text-xs text-[#0284C7]">niva</span>
            <span className="text-[6px] font-bold text-slate-500">Health Insurance</span>
          </div>
        </div>
      )
    case 'lt':
      return (
        <div className="flex items-center justify-center gap-1.5">
          <svg className="w-6 h-6 shrink-0" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" fill="none" stroke="#000000" strokeWidth="8" />
            <path d="M 28 28 L 38 28 L 32 64 L 54 64 L 52 72 L 22 72 Z" fill="#000000" />
            <path d="M 36 36 L 76 36 L 73 44 L 58 44 L 51 72 L 42 72 L 49 44 L 33 44 Z" fill="#000000" />
          </svg>
          <span className="font-black text-xs sm:text-sm italic tracking-tight text-slate-900">
            L&amp;T Financial Services
          </span>
        </div>
      )
    default:
      return <span className="font-black text-xs text-slate-800">{id}</span>
  }
}

// Smart Partner Logo Renderer: Prioritizes local uploaded asset images, then logoUrl, then custom vector logo
function PartnerBrandLogo({ partner }) {
  const [imgError, setImgError] = useState(false)
  const localLogo = LOCAL_PARTNER_LOGOS[partner.id]
  const logoSrc = localLogo || partner.logoUrl

  // Custom zoom scaling for logos with tight margins or padded image borders
  let sizeClass = 'max-h-8 sm:max-h-9'
  if (partner.id === 'cbi') {
    sizeClass = 'scale-[1.25] max-h-9 sm:max-h-10'
  } else if (partner.id === 'vivriti') {
    sizeClass = 'scale-[1.4] max-h-9 sm:max-h-10'
  } else if (partner.id === 'ikf') {
    sizeClass = 'scale-[1.2] max-h-9'
  }

  if (logoSrc && !imgError) {
    return (
      <img
        src={logoSrc}
        alt={partner.fullName || partner.name}
        className={`${sizeClass} max-w-[150px] w-auto object-contain transition-transform duration-200 group-hover:scale-[2.3]`}
        loading="lazy"
        onError={() => setImgError(true)}
      />
    )
  }

  return renderPartnerBrandLogo(partner.id)
}

export default function LandingPage() {
  const { addEnquiry } = useAppState()
  const { addToast } = useToast()
  
  useEffect(() => {
    document.title = "Cosmos Finserve | 40+ Banks & NBFC Loan Advisory";
  }, []);

  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Partner search & filter
  const [partnerFilter, setPartnerFilter] = useState('all')
  const [searchPartner, setSearchPartner] = useState('')

  // Eligibility Form
  const [eligibilityForm, setEligibilityForm] = useState({
    name: '',
    mobile: '',
    loanType: 'Home Loan',
    city: 'Tiruppur'
  })
  const [submittingEligibility, setSubmittingEligibility] = useState(false)
  const [eligibilitySubmitted, setEligibilitySubmitted] = useState(false)

  // Calculator Modal
  const [calculatorModalOpen, setCalculatorModalOpen] = useState(false)
  const [calcTitle, setCalcTitle] = useState('Home Loan EMI Calculator')
  const [calcAmount, setCalcAmount] = useState(2500000)
  const [calcRate, setCalcRate] = useState(8.5)
  const [calcTenure, setCalcTenure] = useState(20)

  // Smooth scroll helper
  const scrollToSection = (id) => {
    setMobileMenuOpen(false)
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Filter partners
  const filteredPartners = PARTNERS_LIST.filter(p => {
    const matchesType = partnerFilter === 'all' || p.type === partnerFilter
    const matchesSearch = p.name.toLowerCase().includes(searchPartner.toLowerCase()) || 
                          p.fullName.toLowerCase().includes(searchPartner.toLowerCase())
    return matchesType && matchesSearch
  })

  // Submit eligibility request
  const handleEligibilitySubmit = async (e) => {
    e.preventDefault()
    
    if (!eligibilityForm.name || !eligibilityForm.mobile) {
      addToast('Please enter your full name and mobile number', 'error')
      return
    }

    const cleanMobile = eligibilityForm.mobile.replace(/\D/g, '')
    if (cleanMobile.length < 10) {
      addToast('Please enter a valid 10-digit mobile number', 'error')
      return
    }

    setSubmittingEligibility(true)
    try {
      let mappedLoanType = 'Housing'
      if (eligibilityForm.loanType.includes('Business') || eligibilityForm.loanType.includes('Working')) mappedLoanType = 'Business OD/CC'
      else if (eligibilityForm.loanType.includes('Property')) mappedLoanType = 'Loan Against Property'
      else if (eligibilityForm.loanType.includes('Personal') || eligibilityForm.loanType.includes('Vehicle')) mappedLoanType = 'Others'

      const payload = {
        client_name: eligibilityForm.name,
        co_applicate_name: '',
        client_mobile_number: Number(cleanMobile),
        loan_type: mappedLoanType,
        loan_amount: 0,
        associate_name: 'Unassigned',
        status: 'New',
        note: `Eligibility Enquiry: ${eligibilityForm.loanType} in ${eligibilityForm.city}`,
        google_drive_link: ''
      }

      await addEnquiry(payload)
      setEligibilitySubmitted(true)
      addToast('Eligibility check request submitted successfully!', 'success')
      setEligibilityForm({
        name: '',
        mobile: '',
        loanType: 'Home Loan',
        city: 'Tiruppur'
      })
    } catch (err) {
      console.error(err)
      addToast('Failed to submit request. Please try again.', 'error')
    } finally {
      setSubmittingEligibility(false)
    }
  }

  // EMI Calculator logic
  const calculateEMI = () => {
    const P = calcAmount
    const r = calcRate / 12 / 100
    const n = calcTenure * 12

    if (P <= 0 || r <= 0 || n <= 0) return { emi: 0, totalInterest: 0, totalPayment: 0 }

    const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
    const totalPayment = emi * n
    const totalInterest = totalPayment - P

    return {
      emi: Math.round(emi),
      totalInterest: Math.round(totalInterest),
      totalPayment: Math.round(totalPayment)
    }
  }

  const calcResults = calculateEMI()

  const openCalculatorModal = (titleName, defaultAmount = 2500000, defaultRate = 8.5, defaultTenure = 20) => {
    setCalcTitle(titleName)
    setCalcAmount(defaultAmount)
    setCalcRate(defaultRate)
    setCalcTenure(defaultTenure)
    setCalculatorModalOpen(true)
  }

  return (
    <div className="landing-layout selection:bg-red-900 selection:text-white">
      
      {/* ── Top Announcement Strip ── */}
      <div className="bg-[#800000] text-white py-1.5 px-4 text-[11px] font-semibold border-b border-red-900/60">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-1.5">
          
          <div className="flex items-center gap-1.5 flex-wrap justify-center sm:justify-start">
            <MapPin size={13} className="text-amber-300 shrink-0" />
            <span className="text-slate-100 tracking-wide">
              Tiruppur | Coimbatore | Erode | Pollachi | <strong className="text-amber-300">PAN India</strong>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-amber-200/90 text-[10px] font-bold uppercase tracking-wider hidden md:inline">Follow Us:</span>
            <div className="flex items-center gap-3 text-white">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-amber-300 transition-colors" aria-label="Facebook">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-amber-300 transition-colors" aria-label="Instagram">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="https://wa.me/919003635556" target="_blank" rel="noreferrer" className="hover:text-amber-300 transition-colors" aria-label="WhatsApp">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-amber-300 transition-colors" aria-label="LinkedIn">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-amber-300 transition-colors" aria-label="YouTube">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* ── Main Sticky Navbar ── */}
      <header className="landing-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 lg:h-18 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => scrollToSection('home')}>
            <img src={cosmosLogo} alt="Cosmos Finserve Logo" className="h-9 lg:h-10 w-auto object-contain" />
            <div className="flex flex-col">
              <span className="text-lg lg:text-xl font-black tracking-tight text-[#800000] leading-none">
                COSMOS <span className="text-[#C59B27] font-black">FINSERVE</span>
              </span>
              <span className="text-[8px] sm:text-[9px] font-black tracking-wider text-slate-500 uppercase mt-0.5">
                TRUST BANKING. LOANS SERVED.
              </span>
            </div>
          </div>

          {/* Desktop Nav Links (EXACT ORDER REQUESTED BY USER) */}
          <nav className="hidden xl:flex items-center gap-5 lg:gap-6 text-[11px] lg:text-xs font-bold uppercase tracking-wider text-slate-700">
            <button onClick={() => scrollToSection('home')} className="hover:text-[#800000] transition-colors cursor-pointer">Home</button>
            <button onClick={() => scrollToSection('banks-nbfc')} className="hover:text-[#800000] transition-colors cursor-pointer">Banks &amp; NBFC</button>
            <button onClick={() => scrollToSection('loans')} className="hover:text-[#800000] transition-colors cursor-pointer">Loans</button>
            <button onClick={() => scrollToSection('how-it-works')} className="hover:text-[#800000] transition-colors cursor-pointer">How It Works</button>
            <button onClick={() => scrollToSection('calculators')} className="hover:text-[#800000] transition-colors cursor-pointer">Calculators</button>
            <button onClick={() => scrollToSection('about')} className="hover:text-[#800000] transition-colors cursor-pointer">About Us</button>
            <button onClick={() => scrollToSection('contact')} className="hover:text-[#800000] transition-colors cursor-pointer">Contact Us</button>
          </nav>

          {/* Action Buttons */}
          <div className="hidden lg:flex items-center gap-2.5">
            <button 
              onClick={() => scrollToSection('eligibility-form')}
              className="px-3.5 py-2 rounded-lg text-[11px] font-black text-white bg-[#800000] hover:bg-[#660000] transition-all shadow-md uppercase tracking-wider cursor-pointer whitespace-nowrap"
            >
              Check Eligibility
            </button>

            <Link 
              to="/login" 
              className="px-3.5 py-2 rounded-lg text-[11px] font-black text-[#800000] bg-white border border-[#800000] hover:bg-[#800000] hover:text-white transition-all shadow-sm uppercase tracking-wider whitespace-nowrap"
            >
              Sign In
            </Link>
          </div>

          {/* Mobile hamburger */}
          <div className="xl:hidden flex items-center gap-2">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-[#800000] focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-white border-b border-slate-200 px-6 py-5 space-y-4 shadow-xl">
            <nav className="flex flex-col space-y-3 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <button onClick={() => scrollToSection('home')} className="text-left py-1 hover:text-[#800000]">Home</button>
              <button onClick={() => scrollToSection('banks-nbfc')} className="text-left py-1 hover:text-[#800000]">Banks &amp; NBFC</button>
              <button onClick={() => scrollToSection('loans')} className="text-left py-1 hover:text-[#800000]">Loans</button>
              <button onClick={() => scrollToSection('how-it-works')} className="text-left py-1 hover:text-[#800000]">How It Works</button>
              <button onClick={() => scrollToSection('calculators')} className="text-left py-1 hover:text-[#800000]">Calculators</button>
              <button onClick={() => scrollToSection('about')} className="text-left py-1 hover:text-[#800000]">About Us</button>
              <button onClick={() => scrollToSection('contact')} className="text-left py-1 hover:text-[#800000]">Contact Us</button>
            </nav>
            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
              <button 
                onClick={() => scrollToSection('eligibility-form')}
                className="w-full py-2.5 rounded-lg text-center text-xs font-black text-white bg-[#800000] uppercase tracking-wider shadow-sm"
              >
                Check Eligibility
              </button>
              <Link 
                to="/login" 
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 rounded-lg text-center text-xs font-black text-[#800000] border border-[#800000] uppercase tracking-wider shadow-sm"
              >
                Sign In
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── Section 1: Hero Section ── */}
      <section id="home" className="hero-section pt-24 lg:pt-28 pb-16 bg-gradient-to-b from-red-50/40 via-white to-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-[1.15] mb-3 tracking-tight">
              YOUR TRUSTED <br />
              <span className="text-[#800000]">FINANCIAL PARTNER</span>
            </h1>

            <p className="text-[11px] sm:text-xs font-bold text-[#800000] bg-red-100/60 px-3 py-1.5 rounded-md mb-6 border-l-4 border-[#800000]">
              40+ Banks &amp; NBFCs | One Stop Solution for All Your Loan Needs
            </p>

            {/* Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-8 w-full">
              <div className="flex items-center gap-2 text-slate-700 text-xs sm:text-[13px] font-semibold">
                <div className="h-4 w-4 rounded-full bg-[#C59B27] text-white flex items-center justify-center shrink-0">
                  <Check size={11} strokeWidth={3} />
                </div>
                <span>Best Interest Rates</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 text-xs sm:text-[13px] font-semibold">
                <div className="h-4 w-4 rounded-full bg-[#C59B27] text-white flex items-center justify-center shrink-0">
                  <Check size={11} strokeWidth={3} />
                </div>
                <span>Quick Approvals</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 text-xs sm:text-[13px] font-semibold">
                <div className="h-4 w-4 rounded-full bg-[#C59B27] text-white flex items-center justify-center shrink-0">
                  <Check size={11} strokeWidth={3} />
                </div>
                <span>Doorstep Loans</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 text-xs sm:text-[13px] font-semibold">
                <div className="h-4 w-4 rounded-full bg-[#C59B27] text-white flex items-center justify-center shrink-0">
                  <Check size={11} strokeWidth={3} />
                </div>
                <span>End to End Support</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 text-xs sm:text-[13px] font-semibold sm:col-span-2">
                <div className="h-4 w-4 rounded-full bg-[#C59B27] text-white flex items-center justify-center shrink-0">
                  <Check size={11} strokeWidth={3} />
                </div>
                <span>Minimal Documentation</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto">
              <button 
                onClick={() => scrollToSection('eligibility-form')}
                className="px-6 py-3 rounded-lg text-xs font-black text-white bg-[#800000] hover:bg-[#660000] shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer"
              >
                Check Eligibility <ChevronRight size={16} />
              </button>
              <a 
                href="tel:+919003635556"
                className="px-6 py-3 rounded-lg text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Phone size={15} className="text-[#800000]" /> Talk to Expert
              </a>
            </div>
          </div>

          {/* Right Hero Image */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-white">
              <img 
                src={heroAdvisorChart} 
                alt="Cosmos Finserve Loan Advisory" 
                className="w-full h-auto object-cover aspect-[4/3]"
              />
            </div>
          </div>

        </div>
      </section>

      {/* ── Section 2: OUR BANKING & NBFC PARTNERS (BRAND LOGOS GRID) ── */}
      <section id="banks-nbfc" className="py-16 bg-slate-50 border-t border-b border-slate-200">
        
        {/* Maroon Banner Header */}
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
          
          {/* Search & Filter Toolbar */}
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

          {/* Grid of Authentic Brand Logo Cards */}
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
                  className="bg-white border border-slate-200/90 rounded-xl p-2.5 h-[92px] sm:h-[98px] flex flex-col items-center justify-between text-center shadow-sm hover:shadow-lg hover:border-red-300 hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer overflow-hidden"
                  title={partner.fullName}
                >
                  <div className="w-full flex-1 flex items-center justify-center min-h-0">
                    <PartnerBrandLogo partner={partner} />
                  </div>
                  <div className="w-full pt-1 border-t border-slate-100 text-[9.5px] sm:text-[10.5px] font-semibold text-slate-700 group-hover:text-[#800000] transition-colors leading-tight min-h-[22px] flex items-center justify-center text-center line-clamp-2 relative z-10 bg-white">
                    {partner.fullName || partner.name}
                  </div>
                </div>
              ))}

              <div className="bg-white border-2 border-dashed border-red-200 rounded-xl p-2.5 h-[92px] sm:h-[98px] flex flex-col items-center justify-center text-center shadow-sm hover:bg-red-50/50 transition-all cursor-pointer">
                <div className="font-extrabold text-xs text-[#800000] mb-0.5">
                  &amp; Many More...
                </div>
                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                  Partners
                </div>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* ── Section 3: Why Choose Cosmos Finserve (Navy Dark Mode Banner) ── */}
      <section id="about" className="py-14 bg-[#0B192C] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-10">
          <h2 className="text-xl sm:text-2xl font-black tracking-wider uppercase mb-2 text-white">
            WHY CHOOSE COSMOS FINSERVE?
          </h2>
          <div className="w-16 h-1 bg-[#C59B27] mx-auto rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 text-center">
          
          <div className="flex flex-col items-center p-3 rounded-lg hover:bg-slate-800/60 transition-colors">
            <div className="h-12 w-12 rounded-full bg-[#1E293B] border border-slate-700 text-[#C59B27] flex items-center justify-center mb-2.5">
              <Landmark size={22} />
            </div>
            <div className="text-[11px] font-bold text-slate-200">40+ Banks &amp; NBFC Options</div>
          </div>

          <div className="flex flex-col items-center p-3 rounded-lg hover:bg-slate-800/60 transition-colors">
            <div className="h-12 w-12 rounded-full bg-[#1E293B] border border-slate-700 text-[#C59B27] flex items-center justify-center mb-2.5">
              <Percent size={22} />
            </div>
            <div className="text-[11px] font-bold text-slate-200">Lowest Interest Rates</div>
          </div>

          <div className="flex flex-col items-center p-3 rounded-lg hover:bg-slate-800/60 transition-colors">
            <div className="h-12 w-12 rounded-full bg-[#1E293B] border border-slate-700 text-[#C59B27] flex items-center justify-center mb-2.5">
              <Clock size={22} />
            </div>
            <div className="text-[11px] font-bold text-slate-200">Quick Loan Approval</div>
          </div>

          <div className="flex flex-col items-center p-3 rounded-lg hover:bg-slate-800/60 transition-colors">
            <div className="h-12 w-12 rounded-full bg-[#1E293B] border border-slate-700 text-[#C59B27] flex items-center justify-center mb-2.5">
              <FileCheck size={22} />
            </div>
            <div className="text-[11px] font-bold text-slate-200">Minimal Documentation</div>
          </div>

          <div className="flex flex-col items-center p-3 rounded-lg hover:bg-slate-800/60 transition-colors">
            <div className="h-12 w-12 rounded-full bg-[#1E293B] border border-slate-700 text-[#C59B27] flex items-center justify-center mb-2.5">
              <ArrowRightLeft size={22} />
            </div>
            <div className="text-[11px] font-bold text-slate-200">Top-up &amp; BT Available</div>
          </div>

          <div className="flex flex-col items-center p-3 rounded-lg hover:bg-slate-800/60 transition-colors">
            <div className="h-12 w-12 rounded-full bg-[#1E293B] border border-slate-700 text-[#C59B27] flex items-center justify-center mb-2.5">
              <BadgeCheck size={22} />
            </div>
            <div className="text-[11px] font-bold text-slate-200">Zero Foreclosure Charges*</div>
          </div>

          <div className="flex flex-col items-center p-3 rounded-lg hover:bg-slate-800/60 transition-colors col-span-2 sm:col-span-1">
            <div className="h-12 w-12 rounded-full bg-[#1E293B] border border-slate-700 text-[#C59B27] flex items-center justify-center mb-2.5">
              <Headphones size={22} />
            </div>
            <div className="text-[11px] font-bold text-slate-200">Expert Guidance End to End</div>
          </div>

        </div>
      </section>

      {/* ── Section 4: Eligibility Form + Service Areas + Calculators ── */}
      <section id="eligibility-form" className="py-16 bg-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Block 1: Check Loan Eligibility Form */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden">
            <div className="bg-[#0B192C] text-white p-4 text-center">
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider mb-0.5">
                CHECK YOUR LOAN ELIGIBILITY
              </h3>
              <p className="text-[11px] text-slate-300 font-medium">
                Get Best Loan Offers from 40+ Banks &amp; NBFCs
              </p>
            </div>

            <div className="p-5">
              {eligibilitySubmitted ? (
                <div className="py-6 text-center flex flex-col items-center">
                  <div className="h-14 w-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-3">
                    <CheckCircle size={30} />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mb-1">Request Submitted!</h4>
                  <p className="text-xs text-slate-500 mb-5">
                    Our loan advisor will contact you with curated loan offers shortly.
                  </p>
                  <button 
                    onClick={() => setEligibilitySubmitted(false)}
                    className="text-xs font-bold text-[#800000] uppercase hover:underline"
                  >
                    Check Another Eligibility
                  </button>
                </div>
              ) : (
                <form onSubmit={handleEligibilitySubmit} className="space-y-3.5">
                  <div>
                    <label htmlFor="eligibility-name" className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Full Name
                    </label>
                    <input 
                      id="eligibility-name"
                      type="text"
                      placeholder="Enter Your Name"
                      value={eligibilityForm.name}
                      onChange={(e) => setEligibilityForm({ ...eligibilityForm, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#800000]/20 focus:border-[#800000]"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="eligibility-mobile" className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Mobile Number
                    </label>
                    <input 
                      id="eligibility-mobile"
                      type="tel"
                      placeholder="Enter Mobile Number"
                      value={eligibilityForm.mobile}
                      onChange={(e) => setEligibilityForm({ ...eligibilityForm, mobile: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#800000]/20 focus:border-[#800000]"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="eligibility-loantype" className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Loan Type
                    </label>
                    <select 
                      id="eligibility-loantype"
                      value={eligibilityForm.loanType}
                      onChange={(e) => setEligibilityForm({ ...eligibilityForm, loanType: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#800000]/20 focus:border-[#800000] cursor-pointer"
                    >
                      <option value="Home Loan">Home Loan</option>
                      <option value="Loan Against Property">Loan Against Property</option>
                      <option value="Business Loan">Business Loan (OD/CC)</option>
                      <option value="Personal Loan">Personal Loan</option>
                      <option value="Vehicle Loan">Vehicle Loan</option>
                      <option value="Working Capital Loan">Working Capital Loan</option>
                      <option value="Balance Transfer & Top-up">Balance Transfer &amp; Top-up</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="eligibility-city" className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      City
                    </label>
                    <select 
                      id="eligibility-city"
                      value={eligibilityForm.city}
                      onChange={(e) => setEligibilityForm({ ...eligibilityForm, city: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#800000]/20 focus:border-[#800000] cursor-pointer"
                    >
                      <option value="Tiruppur">Tiruppur</option>
                      <option value="Coimbatore">Coimbatore</option>
                      <option value="Erode">Erode</option>
                      <option value="Pollachi">Pollachi</option>
                      <option value="Other">Other Locations (PAN India)</option>
                    </select>
                  </div>

                  <button 
                    type="submit"
                    disabled={submittingEligibility}
                    className="w-full py-2.5 mt-1 rounded-lg text-xs font-bold text-white bg-[#800000] hover:bg-[#660000] transition-all shadow-md uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    {submittingEligibility ? 'Submitting...' : 'Check Eligibility'} <ChevronRight size={15} />
                  </button>

                  <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 font-semibold pt-0.5">
                    <Lock size={11} className="text-emerald-600" />
                    <span>It's Free &amp; Secure</span>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Block 2: Our Service Areas */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-5">
            <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider mb-5 text-center border-b pb-2.5 border-slate-100">
              OUR SERVICE AREAS
            </h3>

            <div className="grid grid-cols-2 gap-3 items-center">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <MapPin size={15} className="text-[#800000] shrink-0" />
                  <span>Tiruppur</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <MapPin size={15} className="text-[#800000] shrink-0" />
                  <span>Coimbatore</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <MapPin size={15} className="text-[#800000] shrink-0" />
                  <span>Erode</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <MapPin size={15} className="text-[#800000] shrink-0" />
                  <span>Pollachi</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <MapPin size={15} className="text-[#800000] shrink-0" />
                  <span>PAN India</span>
                </div>
                <div className="text-[10px] font-semibold text-slate-400 pl-5">
                  and more...
                </div>
              </div>

              {/* Vector Map Graphic */}
              <div className="relative bg-red-50/50 rounded-xl p-3 border border-red-100 flex items-center justify-center min-h-[170px]">
                <svg viewBox="0 0 200 220" className="w-full h-auto max-h-[160px] filter drop-shadow">
                  <path 
                    d="M30 20 Q100 10 170 30 Q180 80 160 120 Q120 190 90 210 Q60 170 40 110 Z" 
                    fill="#FEE2E2" 
                    stroke="#800000" 
                    strokeWidth="2"
                    strokeDasharray="4 2"
                  />
                  <g className="animate-pulse">
                    <circle cx="80" cy="90" r="5" fill="#800000" />
                    <circle cx="80" cy="90" r="9" fill="#800000" opacity="0.3" />
                  </g>
                  <g className="animate-pulse" style={{ animationDelay: '0.3s' }}>
                    <circle cx="65" cy="105" r="5" fill="#800000" />
                    <circle cx="65" cy="105" r="9" fill="#800000" opacity="0.3" />
                  </g>
                  <g className="animate-pulse" style={{ animationDelay: '0.6s' }}>
                    <circle cx="105" cy="85" r="5" fill="#800000" />
                    <circle cx="105" cy="85" r="9" fill="#800000" opacity="0.3" />
                  </g>
                  <g className="animate-pulse" style={{ animationDelay: '0.9s' }}>
                    <circle cx="60" cy="125" r="5" fill="#800000" />
                    <circle cx="60" cy="125" r="9" fill="#800000" opacity="0.3" />
                  </g>
                </svg>
              </div>
            </div>
          </div>

          {/* Block 3: Loan Calculators */}
          <div id="calculators" className="bg-white rounded-xl border border-slate-200 shadow-lg p-5">
            <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider mb-4 text-center border-b pb-2.5 border-slate-100">
              LOAN CALCULATORS
            </h3>

            <div className="space-y-1.5 mb-5">
              <button 
                onClick={() => openCalculatorModal('Home Loan EMI Calculator', 3000000, 8.5, 20)}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-red-50 text-left transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 group-hover:text-[#800000]">
                  <HomeIcon size={15} className="text-[#800000]" />
                  <span>Home Loan EMI Calculator</span>
                </div>
                <ChevronRight size={13} className="text-slate-400 group-hover:text-[#800000]" />
              </button>

              <button 
                onClick={() => openCalculatorModal('Personal Loan EMI Calculator', 500000, 10.5, 5)}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-red-50 text-left transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 group-hover:text-[#800000]">
                  <UserCheck size={15} className="text-[#800000]" />
                  <span>Personal Loan EMI Calculator</span>
                </div>
                <ChevronRight size={13} className="text-slate-400 group-hover:text-[#800000]" />
              </button>

              <button 
                onClick={() => openCalculatorModal('Business Loan EMI Calculator', 2000000, 9.25, 7)}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-red-50 text-left transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 group-hover:text-[#800000]">
                  <Briefcase size={15} className="text-[#800000]" />
                  <span>Business Loan EMI Calculator</span>
                </div>
                <ChevronRight size={13} className="text-slate-400 group-hover:text-[#800000]" />
              </button>

              <button 
                onClick={() => openCalculatorModal('Loan Against Property Calculator', 5000000, 8.75, 15)}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-red-50 text-left transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 group-hover:text-[#800000]">
                  <Building2 size={15} className="text-[#800000]" />
                  <span>Loan Against Property Calculator</span>
                </div>
                <ChevronRight size={13} className="text-slate-400 group-hover:text-[#800000]" />
              </button>

              <button 
                onClick={() => openCalculatorModal('Balance Transfer Savings Calculator', 2500000, 8.4, 15)}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-red-50 text-left transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 group-hover:text-[#800000]">
                  <ArrowRightLeft size={15} className="text-[#800000]" />
                  <span>Balance Transfer Calculator</span>
                </div>
                <ChevronRight size={13} className="text-slate-400 group-hover:text-[#800000]" />
              </button>

              <button 
                onClick={() => openCalculatorModal('Stamp Duty Calculator', 4000000, 7.0, 1)}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-red-50 text-left transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 group-hover:text-[#800000]">
                  <Stamp size={15} className="text-[#800000]" />
                  <span>Stamp Duty Calculator</span>
                </div>
                <ChevronRight size={13} className="text-slate-400 group-hover:text-[#800000]" />
              </button>

              <button 
                onClick={() => openCalculatorModal('Processing Fee + GST Calculator', 2000000, 0.5, 1)}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-red-50 text-left transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 group-hover:text-[#800000]">
                  <Receipt size={15} className="text-[#800000]" />
                  <span>Processing Fee + GST Calculator</span>
                </div>
                <ChevronRight size={13} className="text-slate-400 group-hover:text-[#800000]" />
              </button>

              <button 
                onClick={() => openCalculatorModal('Eligibility Calculator', 3500000, 8.5, 25)}
                className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-red-50 text-left transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 group-hover:text-[#800000]">
                  <Calculator size={15} className="text-[#800000]" />
                  <span>Eligibility Calculator</span>
                </div>
                <ChevronRight size={13} className="text-slate-400 group-hover:text-[#800000]" />
              </button>
            </div>

            <button 
              onClick={() => openCalculatorModal('Loan EMI Calculator Advisor', 2500000, 8.5, 20)}
              className="w-full py-2.5 rounded-lg text-xs font-bold text-white bg-[#800000] hover:bg-[#660000] transition-all shadow-md uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer"
            >
              View All Calculators <ChevronRight size={15} />
            </button>
          </div>

        </div>
      </section>

      {/* ── Section 5: LOANS WE OFFER (7 Cards Grid) ── */}
      <section id="loans" className="py-16 bg-white border-t border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-1.5">
            <span className="h-[2px] w-10 bg-gradient-to-r from-transparent to-[#C59B27]"></span>
            <h2 className="text-xl sm:text-2xl font-black text-[#800000] uppercase tracking-wider">
              LOANS WE OFFER
            </h2>
            <span className="h-[2px] w-10 bg-gradient-to-l from-transparent to-[#C59B27]"></span>
          </div>
          <p className="text-xs text-slate-500 max-w-lg mx-auto">
            Wide portfolio of loan products with competitive interest rates and hassle-free processing.
          </p>
        </div>

        {/* Loan Cards Grid (7 Cards Matching Image 2) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3.5">
          
          {/* Card 1: Home Loan */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 hover:shadow-lg hover:-translate-y-1 transition-all text-center flex flex-col justify-between group">
            <div>
              <div className="h-12 w-12 rounded-full bg-red-50 text-[#800000] mx-auto flex items-center justify-center mb-3 group-hover:bg-[#800000] group-hover:text-white transition-colors">
                <HomeIcon size={22} />
              </div>
              <h3 className="text-xs font-black text-slate-900 mb-1">Home Loan</h3>
              <div className="text-[10px] text-slate-500 font-semibold mb-0.5">ROI Starting From</div>
              <div className="text-base font-black text-[#800000] mb-3">7.50%*</div>
            </div>
            <button 
              onClick={() => scrollToSection('eligibility-form')}
              className="w-full py-2 rounded-md text-[11px] font-bold text-[#800000] bg-white border border-[#800000] hover:bg-[#800000] hover:text-white transition-all uppercase tracking-wider cursor-pointer"
            >
              Apply Now
            </button>
          </div>

          {/* Card 2: Loan Against Property */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 hover:shadow-lg hover:-translate-y-1 transition-all text-center flex flex-col justify-between group">
            <div>
              <div className="h-12 w-12 rounded-full bg-red-50 text-[#800000] mx-auto flex items-center justify-center mb-3 group-hover:bg-[#800000] group-hover:text-white transition-colors">
                <Building2 size={22} />
              </div>
              <h3 className="text-xs font-black text-slate-900 mb-1">Loan Against Property</h3>
              <div className="text-[10px] text-slate-500 font-semibold mb-0.5">ROI Starting From</div>
              <div className="text-base font-black text-[#800000] mb-3">8.75%*</div>
            </div>
            <button 
              onClick={() => scrollToSection('eligibility-form')}
              className="w-full py-2 rounded-md text-[11px] font-bold text-[#800000] bg-white border border-[#800000] hover:bg-[#800000] hover:text-white transition-all uppercase tracking-wider cursor-pointer"
            >
              Apply Now
            </button>
          </div>

          {/* Card 3: Business Loan */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 hover:shadow-lg hover:-translate-y-1 transition-all text-center flex flex-col justify-between group">
            <div>
              <div className="h-12 w-12 rounded-full bg-red-50 text-[#800000] mx-auto flex items-center justify-center mb-3 group-hover:bg-[#800000] group-hover:text-white transition-colors">
                <Briefcase size={22} />
              </div>
              <h3 className="text-xs font-black text-slate-900 mb-0.5">Business Loan</h3>
              <div className="text-[9px] font-semibold text-slate-400 mb-1">(OD/CC/Term Loan)</div>
              <div className="text-[10px] text-slate-500 font-semibold mb-0.5">ROI Starting From</div>
              <div className="text-base font-black text-[#800000] mb-3">8.50%*</div>
            </div>
            <button 
              onClick={() => scrollToSection('eligibility-form')}
              className="w-full py-2 rounded-md text-[11px] font-bold text-[#800000] bg-white border border-[#800000] hover:bg-[#800000] hover:text-white transition-all uppercase tracking-wider cursor-pointer"
            >
              Apply Now
            </button>
          </div>

          {/* Card 4: Personal Loan */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 hover:shadow-lg hover:-translate-y-1 transition-all text-center flex flex-col justify-between group">
            <div>
              <div className="h-12 w-12 rounded-full bg-red-50 text-[#800000] mx-auto flex items-center justify-center mb-3 group-hover:bg-[#800000] group-hover:text-white transition-colors">
                <UserCheck size={22} />
              </div>
              <h3 className="text-xs font-black text-slate-900 mb-1">Personal Loan</h3>
              <div className="text-[10px] text-slate-500 font-semibold mb-0.5">ROI Starting From</div>
              <div className="text-base font-black text-[#800000] mb-3">10.50%*</div>
            </div>
            <button 
              onClick={() => scrollToSection('eligibility-form')}
              className="w-full py-2 rounded-md text-[11px] font-bold text-[#800000] bg-white border border-[#800000] hover:bg-[#800000] hover:text-white transition-all uppercase tracking-wider cursor-pointer"
            >
              Apply Now
            </button>
          </div>

          {/* Card 5: Vehicle Loan */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 hover:shadow-lg hover:-translate-y-1 transition-all text-center flex flex-col justify-between group">
            <div>
              <div className="h-12 w-12 rounded-full bg-red-50 text-[#800000] mx-auto flex items-center justify-center mb-3 group-hover:bg-[#800000] group-hover:text-white transition-colors">
                <Car size={22} />
              </div>
              <h3 className="text-xs font-black text-slate-900 mb-1">Vehicle Loan</h3>
              <div className="text-[10px] text-slate-500 font-semibold mb-0.5">ROI Starting From</div>
              <div className="text-base font-black text-[#800000] mb-3">10.50%*</div>
            </div>
            <button 
              onClick={() => scrollToSection('eligibility-form')}
              className="w-full py-2 rounded-md text-[11px] font-bold text-[#800000] bg-white border border-[#800000] hover:bg-[#800000] hover:text-white transition-all uppercase tracking-wider cursor-pointer"
            >
              Apply Now
            </button>
          </div>

          {/* Card 6: Working Capital Loan */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 hover:shadow-lg hover:-translate-y-1 transition-all text-center flex flex-col justify-between group">
            <div>
              <div className="h-12 w-12 rounded-full bg-red-50 text-[#800000] mx-auto flex items-center justify-center mb-3 group-hover:bg-[#800000] group-hover:text-white transition-colors">
                <TrendingUp size={22} />
              </div>
              <h3 className="text-xs font-black text-slate-900 mb-1">Working Capital</h3>
              <div className="text-[10px] text-slate-500 font-semibold mb-0.5">ROI Starting From</div>
              <div className="text-base font-black text-[#800000] mb-3">8.75%*</div>
            </div>
            <button 
              onClick={() => scrollToSection('eligibility-form')}
              className="w-full py-2 rounded-md text-[11px] font-bold text-[#800000] bg-white border border-[#800000] hover:bg-[#800000] hover:text-white transition-all uppercase tracking-wider cursor-pointer"
            >
              Apply Now
            </button>
          </div>

          {/* Card 7: Balance Transfer & Top-up Loan */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 hover:shadow-lg hover:-translate-y-1 transition-all text-center flex flex-col justify-between group col-span-2 sm:col-span-1">
            <div>
              <div className="h-12 w-12 rounded-full bg-red-50 text-[#800000] mx-auto flex items-center justify-center mb-3 group-hover:bg-[#800000] group-hover:text-white transition-colors">
                <ArrowRightLeft size={22} />
              </div>
              <h3 className="text-xs font-black text-slate-900 mb-1">BT &amp; Top-up Loan</h3>
              <div className="text-[10px] text-slate-500 font-semibold mb-0.5">ROI Starting From</div>
              <div className="text-base font-black text-[#800000] mb-3">8.75%*</div>
            </div>
            <button 
              onClick={() => scrollToSection('eligibility-form')}
              className="w-full py-2 rounded-md text-[11px] font-bold text-[#800000] bg-white border border-[#800000] hover:bg-[#800000] hover:text-white transition-all uppercase tracking-wider cursor-pointer"
            >
              Apply Now
            </button>
          </div>

        </div>

        <div className="text-center mt-8">
          <button 
            onClick={() => scrollToSection('eligibility-form')}
            className="px-6 py-2.5 rounded-lg text-xs font-bold text-white bg-[#800000] hover:bg-[#660000] shadow-md hover:shadow-lg transition-all uppercase tracking-wider cursor-pointer"
          >
            View All Loan Products
          </button>
        </div>
      </section>

      {/* ── Section 6: Our Loan Process Roadmap (01 to 09 Stepper) ── */}
      <section id="how-it-works" className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-1.5">
            <span className="h-[2px] w-10 bg-gradient-to-r from-transparent to-[#C59B27]"></span>
            <h2 className="text-xl sm:text-2xl font-black text-[#800000] uppercase tracking-wider">
              OUR LOAN PROCESS ROADMAP
            </h2>
            <span className="h-[2px] w-10 bg-gradient-to-l from-transparent to-[#C59B27]"></span>
          </div>
          <p className="text-xs text-slate-500 max-w-lg mx-auto">
            From loan enquiry to direct bank account disbursal – 9 clear steps.
          </p>
        </div>

        {/* 9 Step Roadmap Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3 text-center">
            
            {/* Step 01 */}
            <div className="flex flex-col items-center bg-slate-50 p-3 rounded-xl border border-slate-200/60 hover:shadow-md transition-shadow">
              <div className="h-8 w-8 rounded-full bg-[#800000] text-white font-black text-[11px] flex items-center justify-center mb-2 shadow-sm">
                01
              </div>
              <div className="h-8 w-8 text-slate-700 flex items-center justify-center mb-1">
                <FileText size={20} />
              </div>
              <h3 className="text-[11px] font-bold text-slate-900 mb-0.5">Requirement</h3>
              <p className="text-[9px] text-slate-500 leading-tight">
                Share requirement
              </p>
            </div>

            {/* Step 02 */}
            <div className="flex flex-col items-center bg-slate-50 p-3 rounded-xl border border-slate-200/60 hover:shadow-md transition-shadow">
              <div className="h-8 w-8 rounded-full bg-[#D97706] text-white font-black text-[11px] flex items-center justify-center mb-2 shadow-sm">
                02
              </div>
              <div className="h-8 w-8 text-slate-700 flex items-center justify-center mb-1">
                <FileCheck size={20} />
              </div>
              <h3 className="text-[11px] font-bold text-slate-900 mb-0.5">Eligibility Check</h3>
              <p className="text-[9px] text-slate-500 leading-tight">
                Eligibility verification
              </p>
            </div>

            {/* Step 03 */}
            <div className="flex flex-col items-center bg-slate-50 p-3 rounded-xl border border-slate-200/60 hover:shadow-md transition-shadow">
              <div className="h-8 w-8 rounded-full bg-[#C59B27] text-white font-black text-[11px] flex items-center justify-center mb-2 shadow-sm">
                03
              </div>
              <div className="h-8 w-8 text-slate-700 flex items-center justify-center mb-1">
                <FileText size={20} />
              </div>
              <h3 className="text-[11px] font-bold text-slate-900 mb-0.5">Document Collection</h3>
              <p className="text-[9px] text-slate-500 leading-tight">
                Collect documents
              </p>
            </div>

            {/* Step 04 */}
            <div className="flex flex-col items-center bg-slate-50 p-3 rounded-xl border border-slate-200/60 hover:shadow-md transition-shadow">
              <div className="h-8 w-8 rounded-full bg-[#16A34A] text-white font-black text-[11px] flex items-center justify-center mb-2 shadow-sm">
                04
              </div>
              <div className="h-8 w-8 text-slate-700 flex items-center justify-center mb-1">
                <Landmark size={20} />
              </div>
              <h3 className="text-[11px] font-bold text-slate-900 mb-0.5">Bank Matching</h3>
              <p className="text-[9px] text-slate-500 leading-tight">
                Match with best lenders
              </p>
            </div>

            {/* Step 05 */}
            <div className="flex flex-col items-center bg-slate-50 p-3 rounded-xl border border-slate-200/60 hover:shadow-md transition-shadow">
              <div className="h-8 w-8 rounded-full bg-[#0D9488] text-white font-black text-[11px] flex items-center justify-center mb-2 shadow-sm">
                05
              </div>
              <div className="h-8 w-8 text-slate-700 flex items-center justify-center mb-1">
                <ArrowRight size={20} />
              </div>
              <h3 className="text-[11px] font-bold text-slate-900 mb-0.5">Application Submission</h3>
              <p className="text-[9px] text-slate-500 leading-tight">
                Submit to bank
              </p>
            </div>

            {/* Step 06 */}
            <div className="flex flex-col items-center bg-slate-50 p-3 rounded-xl border border-slate-200/60 hover:shadow-md transition-shadow">
              <div className="h-8 w-8 rounded-full bg-[#2563EB] text-white font-black text-[11px] flex items-center justify-center mb-2 shadow-sm">
                06
              </div>
              <div className="h-8 w-8 text-slate-700 flex items-center justify-center mb-1">
                <Search size={20} />
              </div>
              <h3 className="text-[11px] font-bold text-slate-900 mb-0.5">Verification</h3>
              <p className="text-[9px] text-slate-500 leading-tight">
                Bank verification
              </p>
            </div>

            {/* Step 07 */}
            <div className="flex flex-col items-center bg-slate-50 p-3 rounded-xl border border-slate-200/60 hover:shadow-md transition-shadow">
              <div className="h-8 w-8 rounded-full bg-[#4F46E5] text-white font-black text-[11px] flex items-center justify-center mb-2 shadow-sm">
                07
              </div>
              <div className="h-8 w-8 text-slate-700 flex items-center justify-center mb-1">
                <CheckCircle size={20} />
              </div>
              <h3 className="text-[11px] font-bold text-slate-900 mb-0.5">Approval</h3>
              <p className="text-[9px] text-slate-500 leading-tight">
                Sanctioned letter
              </p>
            </div>

            {/* Step 08 */}
            <div className="flex flex-col items-center bg-slate-50 p-3 rounded-xl border border-slate-200/60 hover:shadow-md transition-shadow">
              <div className="h-8 w-8 rounded-full bg-[#9333EA] text-white font-black text-[11px] flex items-center justify-center mb-2 shadow-sm">
                08
              </div>
              <div className="h-8 w-8 text-slate-700 flex items-center justify-center mb-1">
                <Award size={20} />
              </div>
              <h3 className="text-[11px] font-bold text-slate-900 mb-0.5">Disbursement</h3>
              <p className="text-[9px] text-slate-500 leading-tight">
                Funds in account
              </p>
            </div>

            {/* Step 09 */}
            <div className="flex flex-col items-center bg-slate-50 p-3 rounded-xl border border-slate-200/60 hover:shadow-md transition-shadow col-span-3 sm:col-span-1 lg:col-span-1">
              <div className="h-8 w-8 rounded-full bg-[#BE185D] text-white font-black text-[11px] flex items-center justify-center mb-2 shadow-sm">
                09
              </div>
              <div className="h-8 w-8 text-slate-700 flex items-center justify-center mb-1">
                <Headphones size={20} />
              </div>
              <h3 className="text-[11px] font-bold text-slate-900 mb-0.5">Post Support</h3>
              <p className="text-[9px] text-slate-500 leading-tight">
                Lifetime assistance
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── Section 7: Stat Counter Bar (Maroon Red) ── */}
      <section className="bg-[#800000] text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-red-900/60">
            
            <div className="flex flex-col items-center p-2">
              <div className="flex items-center gap-2 mb-1">
                <Building size={28} className="text-amber-300" />
                <span className="text-2xl sm:text-3xl font-black text-white">40+</span>
              </div>
              <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-200">Banks &amp; NBFCs</div>
            </div>

            <div className="flex flex-col items-center p-2 pt-4 md:pt-2">
              <div className="flex items-center gap-2 mb-1">
                <Users size={28} className="text-amber-300" />
                <span className="text-2xl sm:text-3xl font-black text-white">1000+</span>
              </div>
              <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-200">Happy Clients</div>
            </div>

            <div className="flex flex-col items-center p-2 pt-4 md:pt-2">
              <div className="flex items-center gap-2 mb-1">
                <Clock size={28} className="text-amber-300" />
                <span className="text-2xl sm:text-3xl font-black text-white">15+</span>
              </div>
              <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-200">Years of Experience</div>
            </div>

            <div className="flex flex-col items-center p-2 pt-4 md:pt-2">
              <div className="flex items-center gap-2 mb-1">
                <Award size={28} className="text-amber-300" />
                <span className="text-2xl sm:text-3xl font-black text-white">100%</span>
              </div>
              <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-200">Customer Satisfaction</div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Section 8: Ready to Take Next Step CTA ── */}
      <section id="contact" className="bg-[#700000] text-white py-10 border-t border-red-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-5 text-center md:text-left">
          
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-full bg-white/10 text-white flex items-center justify-center shrink-0 hidden sm:flex">
              <Phone size={24} />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black tracking-tight mb-0.5">
                READY TO TAKE THE NEXT STEP?
              </h3>
              <p className="text-xs text-slate-200 max-w-xl">
                Talk to our loan experts and get the best loan solution for your needs.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <a 
              href="tel:+919003635556" 
              className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-white text-slate-900 hover:bg-slate-100 font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <Phone size={15} className="text-[#800000]" /> 90036 35556
            </a>
            <a 
              href="https://wa.me/919003635556" 
              target="_blank" 
              rel="noreferrer"
              className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#25D366] text-white hover:bg-[#20ba59] font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
            >
              <MessageSquare size={15} fill="white" /> WhatsApp Us
            </a>
          </div>

        </div>
      </section>

      {/* ── Section 9: Trust Badges Strip ── */}
      <section className="bg-[#0B192C] text-slate-300 py-5 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-[10px] sm:text-xs font-bold uppercase tracking-wider">
          <div className="flex items-center justify-center gap-1.5">
            <CheckCircle size={15} className="text-emerald-400" />
            <span>Verified Partners</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <ShieldCheck size={15} className="text-amber-400" />
            <span>Secure Process</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <Percent size={15} className="text-sky-400" />
            <span>Best Interest Rates</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <Users size={15} className="text-purple-400" />
            <span>Customer First</span>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-slate-950 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-10">
            
            <div className="md:col-span-5 text-left">
              <div className="flex items-center gap-2.5 mb-3">
                <img src={cosmosLogo} alt="Cosmos Finserve Logo" className="h-8 w-auto object-contain bg-white rounded p-1" />
                <span className="text-white text-lg font-black tracking-tight">COSMOS <span className="text-[#C59B27]">FINSERVE</span></span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm mb-4">
                Premier wealth &amp; loan advisory partner across Tiruppur, Coimbatore, Erode, Pollachi, and PAN India. Tied up with 40+ top banks and NBFCs.
              </p>
              <div className="text-xs text-slate-300 space-y-1.5">
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="text-[#C59B27] shrink-0 mt-0.5" />
                  <span>Avinashi Main Rd, Tiruppur, Tamil Nadu 641603, India</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-[#C59B27] shrink-0" />
                  <span>+91 90036 35556</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-[#C59B27] shrink-0" />
                  <span>cosmosfinserve@gmail.com</span>
                </div>
              </div>
            </div>

            {/* Quick Links in requested order */}
            <div className="md:col-span-4 text-left">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 border-l-2 border-[#800000] pl-2">
                QUICK NAVIGATION
              </h4>
              <ul className="grid grid-cols-2 gap-2 text-xs">
                <li><button onClick={() => scrollToSection('home')} className="hover:text-white transition-colors cursor-pointer">Home</button></li>
                <li><button onClick={() => scrollToSection('banks-nbfc')} className="hover:text-white transition-colors cursor-pointer">Banks &amp; NBFC</button></li>
                <li><button onClick={() => scrollToSection('loans')} className="hover:text-white transition-colors cursor-pointer">Loans</button></li>
                <li><button onClick={() => scrollToSection('how-it-works')} className="hover:text-white transition-colors cursor-pointer">How It Works</button></li>
                <li><button onClick={() => scrollToSection('calculators')} className="hover:text-[#800000] transition-colors cursor-pointer">Calculators</button></li>
                <li><button onClick={() => scrollToSection('about')} className="hover:text-white transition-colors cursor-pointer">About Us</button></li>
                <li><button onClick={() => scrollToSection('contact')} className="hover:text-white transition-colors cursor-pointer">Contact Us</button></li>
                <li><Link to="/login" className="hover:text-amber-400 font-bold transition-colors">Sign In</Link></li>
              </ul>
            </div>

            <div className="md:col-span-3 text-left">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 border-l-2 border-[#800000] pl-2">
                SERVICES
              </h4>
              <ul className="space-y-2 text-xs">
                <li><button onClick={() => scrollToSection('loans')} className="hover:text-white transition-colors cursor-pointer">Housing &amp; Home Finance</button></li>
                <li><button onClick={() => scrollToSection('loans')} className="hover:text-white transition-colors cursor-pointer">Loan Against Property (LAP)</button></li>
                <li><button onClick={() => scrollToSection('loans')} className="hover:text-white transition-colors cursor-pointer">Business OD / CC Credit</button></li>
                <li><button onClick={() => scrollToSection('loans')} className="hover:text-white transition-colors cursor-pointer">Personal &amp; Vehicle Loans</button></li>
                <li><button onClick={() => scrollToSection('loans')} className="hover:text-white transition-colors cursor-pointer">Balance Transfer &amp; Top-up</button></li>
              </ul>
            </div>

          </div>

          <div className="border-t border-slate-900 pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
            <p>© {new Date().getFullYear()} Cosmos Finserve. All rights reserved.</p>
            <div className="flex items-center gap-4 mt-3 md:mt-0">
              <span className="hover:text-slate-300 cursor-pointer">Privacy Policy</span>
              <span>·</span>
              <span className="hover:text-slate-300 cursor-pointer">Terms of Service</span>
              <span>·</span>
              <span className="hover:text-slate-300 cursor-pointer">Disclaimer</span>
            </div>
          </div>

        </div>
      </footer>

      {/* Floating Bottom Quick Contacts */}
      <div className="fixed bottom-5 right-5 flex flex-col gap-2.5 z-40">
        <a 
          href="https://wa.me/919003635556" 
          target="_blank" 
          rel="noopener noreferrer"
          className="h-11 w-11 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          aria-label="Contact on WhatsApp"
        >
          <MessageSquare size={20} fill="white" stroke="none" />
        </a>
        <a 
          href="tel:+919003635556" 
          className="h-11 w-11 bg-[#800000] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          aria-label="Call Direct Advisor"
        >
          <Phone size={18} />
        </a>
      </div>

      {/* ── Interactive Loan Calculator Modal ── */}
      {calculatorModalOpen && (
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
                  setCalculatorModalOpen(false)
                  scrollToSection('eligibility-form')
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
      )}

    </div>
  )
}
