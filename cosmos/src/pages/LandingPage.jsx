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
  Facebook,
  Instagram,
  Linkedin,
  Youtube
} from 'lucide-react'
import cosmosLogo from '../assets/cosmosLogo.webp'
import happyFamilyHome from '../assets/happy_family_home.png'
import './LandingPage.css'

// Master list of 38 Banks & NBFCs with categories & styling
const PARTNERS_LIST = [
  { id: 'sbi', name: 'SBI', fullName: 'State Bank of India', type: 'bank', color: '#0083CA', bg: '#E6F4FB', tag: 'Public Sector' },
  { id: 'hdfc', name: 'HDFC BANK', fullName: 'HDFC Bank', type: 'bank', color: '#004B8D', bg: '#E6EEF6', tag: 'Private Bank' },
  { id: 'icici', name: 'ICICI Bank', fullName: 'ICICI Bank', type: 'bank', color: '#F37021', bg: '#FEF1E9', tag: 'Private Bank' },
  { id: 'axis', name: 'AXIS BANK', fullName: 'Axis Bank', type: 'bank', color: '#97144D', bg: '#F8E7EE', tag: 'Private Bank' },
  { id: 'kotak', name: 'kotak', fullName: 'Kotak Mahindra Bank', type: 'bank', color: '#ED1C24', bg: '#FDE8E9', tag: 'Private Bank' },
  { id: 'yes', name: 'YES BANK', fullName: 'Yes Bank', type: 'bank', color: '#005A9C', bg: '#E6EFFA', tag: 'Private Bank' },
  { id: 'idfc', name: 'IDFC FIRST Bank', fullName: 'IDFC FIRST Bank', type: 'bank', color: '#9E1B32', bg: '#F8E8EB', tag: 'Private Bank' },
  { id: 'indusind', name: 'IndusInd Bank', fullName: 'IndusInd Bank', type: 'bank', color: '#941617', bg: '#F8E7E7', tag: 'Private Bank' },
  { id: 'boi', name: 'Bank of India', fullName: 'Bank of India', type: 'bank', color: '#E31837', bg: '#FDE8EB', tag: 'Public Sector' },
  { id: 'pnb', name: 'pnb', fullName: 'Punjab National Bank', type: 'bank', color: '#A00000', bg: '#F9E6E6', tag: 'Public Sector' },
  { id: 'union', name: 'Union Bank of India', fullName: 'Union Bank of India', type: 'bank', color: '#003B73', bg: '#E6EDF5', tag: 'Public Sector' },
  { id: 'indian', name: 'Indian Bank', fullName: 'Indian Bank', type: 'bank', color: '#1F3A60', bg: '#E9ECF2', tag: 'Public Sector' },
  { id: 'canara', name: 'Canara Bank', fullName: 'Canara Bank', type: 'bank', color: '#0069B4', bg: '#E6F1F9', tag: 'Public Sector' },
  { id: 'cbi', name: 'Central Bank of India', fullName: 'Central Bank of India', type: 'bank', color: '#003399', bg: '#E6ECF8', tag: 'Public Sector' },
  { id: 'bob', name: 'Bank of Baroda', fullName: 'Bank of Baroda', type: 'bank', color: '#F26522', bg: '#FEF0E9', tag: 'Public Sector' },
  { id: 'federal', name: 'FEDERAL BANK', fullName: 'Federal Bank', type: 'bank', color: '#004A8F', bg: '#E6EEF7', tag: 'Private Bank' },
  { id: 'idbi', name: 'IDBI BANK', fullName: 'IDBI Bank', type: 'bank', color: '#008751', bg: '#E6F5EE', tag: 'Private Bank' },
  { id: 'dcb', name: 'DCB BANK', fullName: 'DCB Bank', type: 'bank', color: '#00529B', bg: '#E6EFF8', tag: 'Private Bank' },
  { id: 'rbl', name: 'RBL BANK', fullName: 'RBL Bank', type: 'bank', color: '#1A365D', bg: '#E8ECF2', tag: 'Private Bank' },
  { id: 'au', name: 'AU SMALL FINANCE BANK', fullName: 'AU Small Finance Bank', type: 'nbfc', color: '#EE7203', bg: '#FEF1E6', tag: 'Small Finance' },
  { id: 'tata', name: 'TATA CAPITAL', fullName: 'Tata Capital', type: 'nbfc', color: '#005696', bg: '#E6EFF7', tag: 'Premier NBFC' },
  { id: 'lt', name: 'L&T Finance', fullName: 'L&T Finance', type: 'nbfc', color: '#005C9E', bg: '#E6F0F8', tag: 'Premier NBFC' },
  { id: 'bajaj', name: 'BAJAJ FINSERV', fullName: 'Bajaj Finserv', type: 'nbfc', color: '#0066B3', bg: '#E6F0F9', tag: 'Premier NBFC' },
  { id: 'chola', name: 'Chola', fullName: 'Cholamandalam Finance', type: 'nbfc', color: '#E31B23', bg: '#FDE8E9', tag: 'Premier NBFC' },
  { id: 'mahindra', name: 'Mahindra FINANCE', fullName: 'Mahindra Finance', type: 'nbfc', color: '#E31B23', bg: '#FDE8E9', tag: 'Premier NBFC' },
  { id: 'aditya', name: 'ADITYA BIRLA CAPITAL', fullName: 'Aditya Birla Capital', type: 'nbfc', color: '#B91C1C', bg: '#FEE2E2', tag: 'Premier NBFC' },
  { id: 'muthoot', name: 'Muthoot FINCORP', fullName: 'Muthoot Fincorp', type: 'nbfc', color: '#D97706', bg: '#FEF3C7', tag: 'Premier NBFC' },
  { id: 'shriram', name: 'SHRIRAM Finance', fullName: 'Shriram Finance', type: 'nbfc', color: '#B45309', bg: '#FEF3C7', tag: 'Premier NBFC' },
  { id: 'mas', name: 'MAS FINANCIAL SERVICES', fullName: 'MAS Financial Services', type: 'nbfc', color: '#1D4ED8', bg: '#DBEAFE', tag: 'Premier NBFC' },
  { id: 'edelweiss', name: 'Edelweiss', fullName: 'Edelweiss Financial Services', type: 'nbfc', color: '#2563EB', bg: '#DBEAFE', tag: 'Premier NBFC' },
  { id: 'piramal', name: 'Piramal Capital', fullName: 'Piramal Housing Finance', type: 'nbfc', color: '#EA580C', bg: '#FFEDD5', tag: 'Housing Finance' },
  { id: 'jm', name: 'JM FINANCIAL', fullName: 'JM Financial', type: 'nbfc', color: '#DC2626', bg: '#FEE2E2', tag: 'Financial Services' },
  { id: 'hdb', name: 'HDB FINANCIAL SERVICES', fullName: 'HDB Financial Services', type: 'nbfc', color: '#1E40AF', bg: '#DBEAFE', tag: 'HDFC Subsidiary' },
  { id: 'sundaram', name: 'SUNDARAM FINANCE', fullName: 'Sundaram Finance', type: 'nbfc', color: '#1E3A8A', bg: '#DBEAFE', tag: 'Premier NBFC' },
  { id: 'ikf', name: 'IKF FINANCE', fullName: 'IKF Finance', type: 'nbfc', color: '#991B1B', bg: '#FEE2E2', tag: 'Premier NBFC' },
  { id: 'incred', name: 'InCred finance', fullName: 'InCred Finance', type: 'nbfc', color: '#F97316', bg: '#FFEDD5', tag: 'Digital NBFC' },
  { id: 'vivriti', name: 'VIVRITI CAPITAL', fullName: 'Vivriti Capital', type: 'nbfc', color: '#374151', bg: '#F3F4F6', tag: 'Enterprise NBFC' },
  { id: 'niva', name: 'Niva Bupa Health Insurance', fullName: 'Niva Bupa Health Insurance', type: 'nbfc', color: '#0284C7', bg: '#E0F2FE', tag: 'Insurance Partner' },
]

export default function LandingPage() {
  const { addEnquiry } = useAppState()
  const { addToast } = useToast()
  
  useEffect(() => {
    document.title = "Cosmos Finserve | 40+ Banks & NBFC Loan Solutions";
  }, []);

  // Navigation Mobile Menu State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Partner Section State
  const [partnerFilter, setPartnerFilter] = useState('all') // 'all' | 'bank' | 'nbfc'
  const [searchPartner, setSearchPartner] = useState('')

  // Eligibility Form State
  const [eligibilityForm, setEligibilityForm] = useState({
    name: '',
    mobile: '',
    loanType: 'Home Loan',
    city: 'Tiruppur'
  })
  const [submittingEligibility, setSubmittingEligibility] = useState(false)
  const [eligibilitySubmitted, setEligibilitySubmitted] = useState(false)

  // Calculators Modal State
  const [calculatorModalOpen, setCalculatorModalOpen] = useState(false)
  const [activeCalcTab, setActiveCalcTab] = useState('home-emi')
  const [calcAmount, setCalcAmount] = useState(2500000)
  const [calcRate, setCalcRate] = useState(8.5)
  const [calcTenure, setCalcTenure] = useState(20) // years

  // Scroll helper
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

  // Handle Eligibility Form Submit
  const handleEligibilitySubmit = async (e) => {
    e.preventDefault()
    
    if (!eligibilityForm.name || !eligibilityForm.mobile) {
      addToast('Please fill in your name and mobile number', 'error')
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
        note: `Eligibility Request: ${eligibilityForm.loanType} in ${eligibilityForm.city}`,
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

  // EMI Calculator Calculation
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

  const openCalculatorWithTab = (tabKey) => {
    setActiveCalcTab(tabKey)
    setCalculatorModalOpen(true)
  }

  return (
    <div className="landing-layout">
      
      {/* ── Top Announcement Strip ── */}
      <div className="top-header-strip bg-[#800000] text-white py-2 px-4 text-xs font-semibold">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-1.5 flex-wrap justify-center sm:justify-start tracking-wide text-slate-100">
            <MapPin size={14} className="text-amber-400 shrink-0" />
            <span>Tiruppur | Coimbatore | Erode | Pollachi | PAN India</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-amber-200 text-[11px] font-medium uppercase tracking-wider hidden md:inline">Follow Us:</span>
            <div className="flex items-center gap-3 text-white">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-amber-300 transition-colors" aria-label="Facebook"><Facebook size={14} /></a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-amber-300 transition-colors" aria-label="Instagram"><Instagram size={14} /></a>
              <a href="https://wa.me/919003635556" target="_blank" rel="noreferrer" className="hover:text-amber-300 transition-colors" aria-label="WhatsApp"><MessageSquare size={14} /></a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-amber-300 transition-colors" aria-label="LinkedIn"><Linkedin size={14} /></a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-amber-300 transition-colors" aria-label="YouTube"><Youtube size={14} /></a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Sticky Navbar ── */}
      <header className="landing-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollToSection('home')}>
            <img src={cosmosLogo} alt="Cosmos Finserve Logo" className="h-11 w-auto object-contain" />
            <div className="flex flex-col">
              <span className="brand-logo-text text-xl font-black tracking-tight text-[#800000] leading-none">
                COSMOS <span className="text-[#C59B27]">FINSERVE</span>
              </span>
              <span className="text-[9px] font-extrabold tracking-widest text-slate-500 uppercase mt-0.5">
                TRUST BANKING. LOANS SERVED.
              </span>
            </div>
          </div>

          {/* Desktop Nav Links (EXACT ORDER REQUESTED BY USER) */}
          <nav className="hidden xl:flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-slate-700">
            <button onClick={() => scrollToSection('home')} className="hover:text-[#800000] transition-colors cursor-pointer">Home</button>
            <button onClick={() => scrollToSection('banks-nbfc')} className="hover:text-[#800000] transition-colors cursor-pointer">Banks & NBFC</button>
            <button onClick={() => scrollToSection('loans')} className="hover:text-[#800000] transition-colors cursor-pointer">Loans</button>
            <button onClick={() => scrollToSection('how-it-works')} className="hover:text-[#800000] transition-colors cursor-pointer">How It Works</button>
            <button onClick={() => scrollToSection('calculators')} className="hover:text-[#800000] transition-colors cursor-pointer">Calculators</button>
            <button onClick={() => scrollToSection('about')} className="hover:text-[#800000] transition-colors cursor-pointer">About Us</button>
            <button onClick={() => scrollToSection('contact')} className="hover:text-[#800000] transition-colors cursor-pointer">Contact Us</button>
          </nav>

          {/* Action Buttons: Check Eligibility (Button) + Sign In (Button) */}
          <div className="hidden lg:flex items-center gap-3">
            <button 
              onClick={() => scrollToSection('eligibility-form')}
              className="px-4 py-2.5 rounded-lg text-xs font-bold text-white bg-[#800000] hover:bg-[#660000] transition-all shadow-md hover:shadow-lg uppercase tracking-wider cursor-pointer"
            >
              Check Eligibility
            </button>

            <Link 
              to="/login" 
              className="px-4 py-2.5 rounded-lg text-xs font-bold text-[#800000] bg-white border border-[#800000] hover:bg-[#800000] hover:text-white transition-all shadow-sm uppercase tracking-wider whitespace-nowrap"
            >
              Sign In
            </Link>
          </div>

          {/* Mobile menu toggle button */}
          <div className="xl:hidden flex items-center gap-2">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-[#800000] focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden bg-white border-b border-slate-200 px-6 py-5 space-y-4 shadow-xl">
            <nav className="flex flex-col space-y-3 text-sm font-bold text-slate-800 uppercase tracking-wider">
              <button onClick={() => scrollToSection('home')} className="text-left py-1 hover:text-[#800000]">Home</button>
              <button onClick={() => scrollToSection('banks-nbfc')} className="text-left py-1 hover:text-[#800000]">Banks & NBFC</button>
              <button onClick={() => scrollToSection('loans')} className="text-left py-1 hover:text-[#800000]">Loans</button>
              <button onClick={() => scrollToSection('how-it-works')} className="text-left py-1 hover:text-[#800000]">How It Works</button>
              <button onClick={() => scrollToSection('calculators')} className="text-left py-1 hover:text-[#800000]">Calculators</button>
              <button onClick={() => scrollToSection('about')} className="text-left py-1 hover:text-[#800000]">About Us</button>
              <button onClick={() => scrollToSection('contact')} className="text-left py-1 hover:text-[#800000]">Contact Us</button>
            </nav>
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
              <button 
                onClick={() => scrollToSection('eligibility-form')}
                className="w-full py-3 rounded-lg text-center text-xs font-bold text-white bg-[#800000] uppercase tracking-wider shadow-sm"
              >
                Check Eligibility
              </button>
              <Link 
                to="/login" 
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3 rounded-lg text-center text-xs font-bold text-[#800000] border border-[#800000] uppercase tracking-wider shadow-sm"
              >
                Sign In
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── Section 1: Hero Section ── */}
      <section id="home" className="hero-section pt-32 pb-16 bg-gradient-to-b from-red-50/40 via-white to-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            <h1 className="hero-heading text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1] mb-4">
              YOUR TRUSTED <br />
              <span className="text-[#800000]">FINANCIAL PARTNER</span>
            </h1>

            <p className="text-sm sm:text-base font-bold text-[#800000] bg-red-100/60 px-3.5 py-1.5 rounded-md mb-6 border-l-4 border-[#800000]">
              40+ Banks & NBFCs | One Stop Solution for All Your Loan Needs
            </p>

            {/* Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 w-full">
              <div className="flex items-center gap-2 text-slate-700 text-sm font-semibold">
                <div className="h-5 w-5 rounded-full bg-[#C59B27] text-white flex items-center justify-center shrink-0">
                  <Check size={13} strokeWidth={3} />
                </div>
                <span>Best Interest Rates</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 text-sm font-semibold">
                <div className="h-5 w-5 rounded-full bg-[#C59B27] text-white flex items-center justify-center shrink-0">
                  <Check size={13} strokeWidth={3} />
                </div>
                <span>Quick Approvals</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 text-sm font-semibold">
                <div className="h-5 w-5 rounded-full bg-[#C59B27] text-white flex items-center justify-center shrink-0">
                  <Check size={13} strokeWidth={3} />
                </div>
                <span>Doorstep Loans</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 text-sm font-semibold">
                <div className="h-5 w-5 rounded-full bg-[#C59B27] text-white flex items-center justify-center shrink-0">
                  <Check size={13} strokeWidth={3} />
                </div>
                <span>End to End Support</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 text-sm font-semibold sm:col-span-2">
                <div className="h-5 w-5 rounded-full bg-[#C59B27] text-white flex items-center justify-center shrink-0">
                  <Check size={13} strokeWidth={3} />
                </div>
                <span>Minimal Documentation</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
              <button 
                onClick={() => scrollToSection('eligibility-form')}
                className="px-7 py-3.5 rounded-lg text-sm font-bold text-white bg-[#800000] hover:bg-[#660000] shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 uppercase tracking-wider cursor-pointer"
              >
                Check Eligibility <ChevronRight size={18} />
              </button>
              <a 
                href="tel:+919003635556"
                className="px-7 py-3.5 rounded-lg text-sm font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Phone size={16} className="text-[#800000]" /> Talk to Expert
              </a>
            </div>
          </div>

          {/* Right Image + Gold Badge */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-lg lg:max-w-none rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-white">
              <img 
                src={happyFamilyHome} 
                alt="Happy Indian Family holding keys to new home" 
                className="w-full h-auto object-cover aspect-[4/3]"
              />
              
              {/* ROI Golden Seal Overlay Badge */}
              <div className="absolute -bottom-2 -right-2 sm:bottom-4 sm:right-4 bg-gradient-to-br from-[#800000] via-[#590000] to-[#3d0000] text-white p-5 rounded-full border-4 border-[#C59B27] shadow-2xl flex flex-col items-center justify-center text-center w-36 h-36 sm:w-44 sm:h-44 transform hover:scale-105 transition-transform">
                <div className="text-amber-300 text-xs tracking-widest mb-0.5">★ ★ ★</div>
                <div className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-200">ROI STARTING FROM</div>
                <div className="text-2xl sm:text-3xl font-black text-amber-300 tracking-tight my-0.5">7.50%*</div>
                <div className="text-amber-300 text-xs tracking-widest mt-0.5">★ ★ ★</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Section 2: Loans We Offer ── */}
      <section id="loans" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-14">
          <div className="flex items-center justify-center gap-4 mb-2">
            <span className="h-[2px] w-12 bg-gradient-to-r from-transparent to-[#C59B27]"></span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#800000] uppercase tracking-wider">
              LOANS WE OFFER
            </h2>
            <span className="h-[2px] w-12 bg-gradient-to-l from-transparent to-[#C59B27]"></span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            Explore our wide portfolio of tailored loan products with competitive interest rates and hassle-free processing.
          </p>
        </div>

        {/* Loan Cards Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Home Loan */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center flex flex-col justify-between group">
            <div>
              <div className="h-14 w-14 rounded-full bg-red-50 text-[#800000] mx-auto flex items-center justify-center mb-4 group-hover:bg-[#800000] group-hover:text-white transition-colors">
                <HomeIcon size={28} />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-2">Home Loan</h3>
              <div className="text-xs text-slate-500 font-semibold mb-1">ROI Starting From</div>
              <div className="text-xl font-black text-[#800000] mb-4">7.50%*</div>
            </div>
            <button 
              onClick={() => scrollToSection('eligibility-form')}
              className="w-full py-2.5 rounded-lg text-xs font-bold text-[#800000] bg-white border border-[#800000] hover:bg-[#800000] hover:text-white transition-all uppercase tracking-wider cursor-pointer"
            >
              Apply Now
            </button>
          </div>

          {/* Card 2: Loan Against Property */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center flex flex-col justify-between group">
            <div>
              <div className="h-14 w-14 rounded-full bg-red-50 text-[#800000] mx-auto flex items-center justify-center mb-4 group-hover:bg-[#800000] group-hover:text-white transition-colors">
                <Building2 size={28} />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-2">Loan Against Property</h3>
              <div className="text-xs text-slate-500 font-semibold mb-1">ROI Starting From</div>
              <div className="text-xl font-black text-[#800000] mb-4">8.75%*</div>
            </div>
            <button 
              onClick={() => scrollToSection('eligibility-form')}
              className="w-full py-2.5 rounded-lg text-xs font-bold text-[#800000] bg-white border border-[#800000] hover:bg-[#800000] hover:text-white transition-all uppercase tracking-wider cursor-pointer"
            >
              Apply Now
            </button>
          </div>

          {/* Card 3: Business Loan */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center flex flex-col justify-between group">
            <div>
              <div className="h-14 w-14 rounded-full bg-red-50 text-[#800000] mx-auto flex items-center justify-center mb-4 group-hover:bg-[#800000] group-hover:text-white transition-colors">
                <Briefcase size={28} />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-1">Business Loan</h3>
              <div className="text-[11px] font-semibold text-slate-400 mb-2">(OD/CC/Term Loan)</div>
              <div className="text-xs text-slate-500 font-semibold mb-1">ROI Starting From</div>
              <div className="text-xl font-black text-[#800000] mb-4">8.50%*</div>
            </div>
            <button 
              onClick={() => scrollToSection('eligibility-form')}
              className="w-full py-2.5 rounded-lg text-xs font-bold text-[#800000] bg-white border border-[#800000] hover:bg-[#800000] hover:text-white transition-all uppercase tracking-wider cursor-pointer"
            >
              Apply Now
            </button>
          </div>

          {/* Card 4: Personal Loan */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center flex flex-col justify-between group">
            <div>
              <div className="h-14 w-14 rounded-full bg-red-50 text-[#800000] mx-auto flex items-center justify-center mb-4 group-hover:bg-[#800000] group-hover:text-white transition-colors">
                <UserCheck size={28} />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-2">Personal Loan</h3>
              <div className="text-xs text-slate-500 font-semibold mb-1">ROI Starting From</div>
              <div className="text-xl font-black text-[#800000] mb-4">10.50%*</div>
            </div>
            <button 
              onClick={() => scrollToSection('eligibility-form')}
              className="w-full py-2.5 rounded-lg text-xs font-bold text-[#800000] bg-white border border-[#800000] hover:bg-[#800000] hover:text-white transition-all uppercase tracking-wider cursor-pointer"
            >
              Apply Now
            </button>
          </div>

          {/* Card 5: Vehicle Loan */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center flex flex-col justify-between group">
            <div>
              <div className="h-14 w-14 rounded-full bg-red-50 text-[#800000] mx-auto flex items-center justify-center mb-4 group-hover:bg-[#800000] group-hover:text-white transition-colors">
                <Car size={28} />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-2">Vehicle Loan</h3>
              <div className="text-xs text-slate-500 font-semibold mb-1">ROI Starting From</div>
              <div className="text-xl font-black text-[#800000] mb-4">10.50%*</div>
            </div>
            <button 
              onClick={() => scrollToSection('eligibility-form')}
              className="w-full py-2.5 rounded-lg text-xs font-bold text-[#800000] bg-white border border-[#800000] hover:bg-[#800000] hover:text-white transition-all uppercase tracking-wider cursor-pointer"
            >
              Apply Now
            </button>
          </div>

          {/* Card 6: Working Capital Loan */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center flex flex-col justify-between group">
            <div>
              <div className="h-14 w-14 rounded-full bg-red-50 text-[#800000] mx-auto flex items-center justify-center mb-4 group-hover:bg-[#800000] group-hover:text-white transition-colors">
                <TrendingUp size={28} />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-2">Working Capital Loan</h3>
              <div className="text-xs text-slate-500 font-semibold mb-1">ROI Starting From</div>
              <div className="text-xl font-black text-[#800000] mb-4">8.75%*</div>
            </div>
            <button 
              onClick={() => scrollToSection('eligibility-form')}
              className="w-full py-2.5 rounded-lg text-xs font-bold text-[#800000] bg-white border border-[#800000] hover:bg-[#800000] hover:text-white transition-all uppercase tracking-wider cursor-pointer"
            >
              Apply Now
            </button>
          </div>

          {/* Card 7: Balance Transfer & Top-up Loan */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center flex flex-col justify-between group sm:col-span-2 md:col-span-1 lg:col-span-2">
            <div>
              <div className="h-14 w-14 rounded-full bg-red-50 text-[#800000] mx-auto flex items-center justify-center mb-4 group-hover:bg-[#800000] group-hover:text-white transition-colors">
                <ArrowRightLeft size={28} />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-2">Balance Transfer & Top-up Loan</h3>
              <div className="text-xs text-slate-500 font-semibold mb-1">ROI Starting From</div>
              <div className="text-xl font-black text-[#800000] mb-4">8.75%*</div>
            </div>
            <button 
              onClick={() => scrollToSection('eligibility-form')}
              className="w-full py-2.5 rounded-lg text-xs font-bold text-[#800000] bg-white border border-[#800000] hover:bg-[#800000] hover:text-white transition-all uppercase tracking-wider cursor-pointer"
            >
              Apply Now
            </button>
          </div>

        </div>

        <div className="text-center mt-10">
          <button 
            onClick={() => scrollToSection('eligibility-form')}
            className="px-8 py-3.5 rounded-lg text-xs font-bold text-white bg-[#800000] hover:bg-[#660000] shadow-md hover:shadow-lg transition-all uppercase tracking-wider cursor-pointer"
          >
            View All Loan Products
          </button>
        </div>
      </section>

      {/* ── Section 3: Why Choose Cosmos Finserve? ── */}
      <section id="about" className="py-16 bg-[#0B192C] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-black tracking-wider uppercase mb-3 text-white">
            WHY CHOOSE COSMOS FINSERVE?
          </h2>
          <div className="w-20 h-1 bg-[#C59B27] mx-auto rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-6 text-center">
          
          <div className="flex flex-col items-center p-3 rounded-lg hover:bg-slate-800/50 transition-colors">
            <div className="h-12 w-12 rounded-full bg-[#1E293B] border border-slate-700 text-[#C59B27] flex items-center justify-center mb-3">
              <Landmark size={24} />
            </div>
            <div className="text-xs font-bold text-slate-200">40+ Banks & NBFC Options</div>
          </div>

          <div className="flex flex-col items-center p-3 rounded-lg hover:bg-slate-800/50 transition-colors">
            <div className="h-12 w-12 rounded-full bg-[#1E293B] border border-slate-700 text-[#C59B27] flex items-center justify-center mb-3">
              <Percent size={24} />
            </div>
            <div className="text-xs font-bold text-slate-200">Lowest Interest Rates</div>
          </div>

          <div className="flex flex-col items-center p-3 rounded-lg hover:bg-slate-800/50 transition-colors">
            <div className="h-12 w-12 rounded-full bg-[#1E293B] border border-slate-700 text-[#C59B27] flex items-center justify-center mb-3">
              <Clock size={24} />
            </div>
            <div className="text-xs font-bold text-slate-200">Quick Loan Approval</div>
          </div>

          <div className="flex flex-col items-center p-3 rounded-lg hover:bg-slate-800/50 transition-colors">
            <div className="h-12 w-12 rounded-full bg-[#1E293B] border border-slate-700 text-[#C59B27] flex items-center justify-center mb-3">
              <FileCheck size={24} />
            </div>
            <div className="text-xs font-bold text-slate-200">Minimal Documentation</div>
          </div>

          <div className="flex flex-col items-center p-3 rounded-lg hover:bg-slate-800/50 transition-colors">
            <div className="h-12 w-12 rounded-full bg-[#1E293B] border border-slate-700 text-[#C59B27] flex items-center justify-center mb-3">
              <ArrowRightLeft size={24} />
            </div>
            <div className="text-xs font-bold text-slate-200">Top-up & BT Available</div>
          </div>

          <div className="flex flex-col items-center p-3 rounded-lg hover:bg-slate-800/50 transition-colors">
            <div className="h-12 w-12 rounded-full bg-[#1E293B] border border-slate-700 text-[#C59B27] flex items-center justify-center mb-3">
              <BadgeCheck size={24} />
            </div>
            <div className="text-xs font-bold text-slate-200">Zero Foreclosure Charges*</div>
          </div>

          <div className="flex flex-col items-center p-3 rounded-lg hover:bg-slate-800/50 transition-colors col-span-2 sm:col-span-1">
            <div className="h-12 w-12 rounded-full bg-[#1E293B] border border-slate-700 text-[#C59B27] flex items-center justify-center mb-3">
              <Headphones size={24} />
            </div>
            <div className="text-xs font-bold text-slate-200">Expert Guidance End to End</div>
          </div>

        </div>
      </section>

      {/* ── Section 4: Eligibility Form + Service Areas + Calculators Grid ── */}
      <section id="eligibility-form" className="py-20 bg-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Card 1: Check Loan Eligibility Form */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
            <div className="bg-[#0B192C] text-white p-5 text-center">
              <h3 className="text-base font-extrabold uppercase tracking-wider mb-1">
                CHECK YOUR LOAN ELIGIBILITY
              </h3>
              <p className="text-xs text-slate-300">
                Get Best Loan Offers from 40+ Banks & NBFCs
              </p>
            </div>

            <div className="p-6">
              {eligibilitySubmitted ? (
                <div className="py-8 text-center flex flex-col items-center">
                  <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle size={36} />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">Request Submitted!</h4>
                  <p className="text-xs text-slate-500 mb-6">
                    Our loan specialist will verify your details and get back to you with the best loan options within 2 hours.
                  </p>
                  <button 
                    onClick={() => setEligibilitySubmitted(false)}
                    className="text-xs font-bold text-[#800000] uppercase hover:underline"
                  >
                    Check Another Eligibility
                  </button>
                </div>
              ) : (
                <form onSubmit={handleEligibilitySubmit} className="space-y-4">
                  <div>
                    <label htmlFor="eligibility-name" className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Full Name
                    </label>
                    <input 
                      id="eligibility-name"
                      type="text"
                      placeholder="Enter Your Name"
                      value={eligibilityForm.name}
                      onChange={(e) => setEligibilityForm({ ...eligibilityForm, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#800000]/20 focus:border-[#800000]"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="eligibility-mobile" className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Mobile Number
                    </label>
                    <input 
                      id="eligibility-mobile"
                      type="tel"
                      placeholder="Enter Mobile Number"
                      value={eligibilityForm.mobile}
                      onChange={(e) => setEligibilityForm({ ...eligibilityForm, mobile: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#800000]/20 focus:border-[#800000]"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="eligibility-loantype" className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      Loan Type
                    </label>
                    <select 
                      id="eligibility-loantype"
                      value={eligibilityForm.loanType}
                      onChange={(e) => setEligibilityForm({ ...eligibilityForm, loanType: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#800000]/20 focus:border-[#800000] cursor-pointer"
                    >
                      <option value="Home Loan">Home Loan</option>
                      <option value="Loan Against Property">Loan Against Property</option>
                      <option value="Business Loan">Business Loan (OD/CC)</option>
                      <option value="Personal Loan">Personal Loan</option>
                      <option value="Vehicle Loan">Vehicle Loan</option>
                      <option value="Working Capital Loan">Working Capital Loan</option>
                      <option value="Balance Transfer & Top-up">Balance Transfer & Top-up</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="eligibility-city" className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                      City
                    </label>
                    <select 
                      id="eligibility-city"
                      value={eligibilityForm.city}
                      onChange={(e) => setEligibilityForm({ ...eligibilityForm, city: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-800 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#800000]/20 focus:border-[#800000] cursor-pointer"
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
                    className="w-full py-3 mt-2 rounded-lg text-xs font-bold text-white bg-[#800000] hover:bg-[#660000] transition-all shadow-md uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    {submittingEligibility ? 'Submitting...' : 'Check Eligibility'} <ChevronRight size={16} />
                  </button>

                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-semibold pt-1">
                    <Lock size={12} className="text-emerald-600" />
                    <span>It's Free & Secure</span>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Card 2: Our Service Areas */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xl p-6">
            <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-wider mb-6 text-center border-b pb-3 border-slate-100">
              OUR SERVICE AREAS
            </h3>

            <div className="grid grid-cols-2 gap-4 items-center">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <MapPin size={16} className="text-[#800000] shrink-0" />
                  <span>Tiruppur</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <MapPin size={16} className="text-[#800000] shrink-0" />
                  <span>Coimbatore</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <MapPin size={16} className="text-[#800000] shrink-0" />
                  <span>Erode</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <MapPin size={16} className="text-[#800000] shrink-0" />
                  <span>Pollachi</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                  <MapPin size={16} className="text-[#800000] shrink-0" />
                  <span>PAN India</span>
                </div>
                <div className="text-[11px] font-semibold text-slate-400 pl-6">
                  and more...
                </div>
              </div>

              {/* Vector Map Illustration */}
              <div className="relative bg-red-50/50 rounded-xl p-4 border border-red-100 flex items-center justify-center min-h-[180px]">
                <svg viewBox="0 0 200 220" className="w-full h-auto max-h-[180px] filter drop-shadow">
                  {/* Stylized South India Map path */}
                  <path 
                    d="M30 20 Q100 10 170 30 Q180 80 160 120 Q120 190 90 210 Q60 170 40 110 Z" 
                    fill="#FEE2E2" 
                    stroke="#800000" 
                    strokeWidth="2"
                    strokeDasharray="4 2"
                  />
                  {/* Pin Markers */}
                  <g className="animate-pulse">
                    <circle cx="80" cy="90" r="6" fill="#800000" />
                    <circle cx="80" cy="90" r="10" fill="#800000" opacity="0.3" />
                  </g>
                  <g className="animate-pulse" style={{ animationDelay: '0.3s' }}>
                    <circle cx="65" cy="105" r="6" fill="#800000" />
                    <circle cx="65" cy="105" r="10" fill="#800000" opacity="0.3" />
                  </g>
                  <g className="animate-pulse" style={{ animationDelay: '0.6s' }}>
                    <circle cx="105" cy="85" r="6" fill="#800000" />
                    <circle cx="105" cy="85" r="10" fill="#800000" opacity="0.3" />
                  </g>
                  <g className="animate-pulse" style={{ animationDelay: '0.9s' }}>
                    <circle cx="60" cy="125" r="6" fill="#800000" />
                    <circle cx="60" cy="125" r="10" fill="#800000" opacity="0.3" />
                  </g>
                </svg>
              </div>
            </div>
          </div>

          {/* Card 3: Loan Calculators List */}
          <div id="calculators" className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xl p-6">
            <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-wider mb-6 text-center border-b pb-3 border-slate-100">
              LOAN CALCULATORS
            </h3>

            <div className="space-y-2.5 mb-6">
              <button 
                onClick={() => openCalculatorWithTab('home-emi')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-red-50 text-left transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700 group-hover:text-[#800000]">
                  <HomeIcon size={16} className="text-[#800000]" />
                  <span>Home Loan EMI Calculator</span>
                </div>
                <ChevronRight size={14} className="text-slate-400 group-hover:text-[#800000]" />
              </button>

              <button 
                onClick={() => openCalculatorWithTab('personal-emi')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-red-50 text-left transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700 group-hover:text-[#800000]">
                  <UserCheck size={16} className="text-[#800000]" />
                  <span>Personal Loan EMI Calculator</span>
                </div>
                <ChevronRight size={14} className="text-slate-400 group-hover:text-[#800000]" />
              </button>

              <button 
                onClick={() => openCalculatorWithTab('business-emi')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-red-50 text-left transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700 group-hover:text-[#800000]">
                  <Briefcase size={16} className="text-[#800000]" />
                  <span>Business Loan EMI Calculator</span>
                </div>
                <ChevronRight size={14} className="text-slate-400 group-hover:text-[#800000]" />
              </button>

              <button 
                onClick={() => openCalculatorWithTab('lap-emi')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-red-50 text-left transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700 group-hover:text-[#800000]">
                  <Building2 size={16} className="text-[#800000]" />
                  <span>Loan Against Property Calculator</span>
                </div>
                <ChevronRight size={14} className="text-slate-400 group-hover:text-[#800000]" />
              </button>

              <button 
                onClick={() => openCalculatorWithTab('bt-savings')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-red-50 text-left transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700 group-hover:text-[#800000]">
                  <ArrowRightLeft size={16} className="text-[#800000]" />
                  <span>Balance Transfer Calculator</span>
                </div>
                <ChevronRight size={14} className="text-slate-400 group-hover:text-[#800000]" />
              </button>

              <button 
                onClick={() => openCalculatorWithTab('stamp-duty')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-red-50 text-left transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700 group-hover:text-[#800000]">
                  <Stamp size={16} className="text-[#800000]" />
                  <span>Stamp Duty Calculator</span>
                </div>
                <ChevronRight size={14} className="text-slate-400 group-hover:text-[#800000]" />
              </button>

              <button 
                onClick={() => openCalculatorWithTab('gst-fee')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-red-50 text-left transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700 group-hover:text-[#800000]">
                  <Receipt size={16} className="text-[#800000]" />
                  <span>Processing Fee + GST Calculator</span>
                </div>
                <ChevronRight size={14} className="text-slate-400 group-hover:text-[#800000]" />
              </button>

              <button 
                onClick={() => openCalculatorWithTab('eligibility-calc')}
                className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-red-50 text-left transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700 group-hover:text-[#800000]">
                  <Calculator size={16} className="text-[#800000]" />
                  <span>Eligibility Calculator</span>
                </div>
                <ChevronRight size={14} className="text-slate-400 group-hover:text-[#800000]" />
              </button>
            </div>

            <button 
              onClick={() => openCalculatorWithTab('home-emi')}
              className="w-full py-3 rounded-lg text-xs font-bold text-white bg-[#800000] hover:bg-[#660000] transition-all shadow-md uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer"
            >
              View All Calculators <ChevronRight size={16} />
            </button>
          </div>

        </div>
      </section>

      {/* ── Section 5: Banking & NBFC Partners ── */}
      <section id="banks-nbfc" className="py-20 bg-slate-50 border-t border-slate-200">
        
        {/* Maroon Header Banner */}
        <div className="bg-[#800000] text-white py-10 px-4 mb-12 text-center shadow-lg">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-wider mb-2">
              OUR BANKING & NBFC PARTNERS
            </h2>
            <p className="text-xs sm:text-sm text-slate-200">
              We are tied up with 40+ leading Banks & NBFCs to provide you the best loan solutions.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
            {/* Filter Tabs */}
            <div className="flex items-center gap-2 p-1.5 bg-slate-200/80 rounded-xl w-full sm:w-auto">
              <button
                onClick={() => setPartnerFilter('all')}
                className={`px-5 py-2 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                  partnerFilter === 'all'
                    ? 'bg-[#800000] text-white shadow-md'
                    : 'text-slate-700 hover:bg-slate-300/50'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setPartnerFilter('bank')}
                className={`px-5 py-2 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                  partnerFilter === 'bank'
                    ? 'bg-[#800000] text-white shadow-md'
                    : 'text-slate-700 hover:bg-slate-300/50'
                }`}
              >
                Banks
              </button>
              <button
                onClick={() => setPartnerFilter('nbfc')}
                className={`px-5 py-2 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                  partnerFilter === 'nbfc'
                    ? 'bg-[#800000] text-white shadow-md'
                    : 'text-slate-700 hover:bg-slate-300/50'
                }`}
              >
                NBFCs
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative w-full sm:w-80">
              <input 
                type="text"
                placeholder="Search Bank or NBFC"
                value={searchPartner}
                onChange={(e) => setSearchPartner(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#800000]/20 focus:border-[#800000] shadow-sm"
              />
              <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
            </div>
          </div>

          {/* Grid of Bank & NBFC Logos / Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredPartners.map((partner) => (
              <div 
                key={partner.id}
                className="bg-white border border-slate-200 rounded-xl p-4 h-24 flex flex-col items-center justify-center text-center shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
              >
                <div 
                  className="font-black text-sm tracking-tight mb-1"
                  style={{ color: partner.color }}
                >
                  {partner.name}
                </div>
                <div className="text-[9px] font-semibold text-slate-400 truncate max-w-[120px]">
                  {partner.fullName}
                </div>
              </div>
            ))}

            {/* Always visible "& Many More... Partners" card */}
            <div className="bg-white border-2 border-dashed border-red-200 rounded-xl p-4 h-24 flex flex-col items-center justify-center text-center shadow-sm hover:bg-red-50/50 transition-all cursor-pointer">
              <div className="font-extrabold text-xs text-[#800000] mb-0.5">
                & Many More...
              </div>
              <div className="text-[10px] font-bold text-slate-500">
                Partners
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Section 6: Our Loan Process Roadmap ── */}
      <section id="how-it-works" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-2">
            <span className="h-[2px] w-12 bg-gradient-to-r from-transparent to-[#C59B27]"></span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#800000] uppercase tracking-wider">
              OUR LOAN PROCESS ROADMAP
            </h2>
            <span className="h-[2px] w-12 bg-gradient-to-l from-transparent to-[#C59B27]"></span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
            From initial enquiry to money disbursal in your bank account – transparent 9-step hassle-free journey.
          </p>
        </div>

        {/* 9 Step Roadmap Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-9 gap-4 text-center">
            
            {/* Step 01 */}
            <div className="flex flex-col items-center bg-slate-50 p-4 rounded-xl border border-slate-200/60 relative group hover:shadow-md transition-shadow">
              <div className="h-9 w-9 rounded-full bg-[#800000] text-white font-black text-xs flex items-center justify-center mb-3 shadow-md">
                01
              </div>
              <div className="h-10 w-10 text-slate-700 flex items-center justify-center mb-2">
                <FileText size={24} />
              </div>
              <h3 className="text-xs font-bold text-slate-900 mb-1">Requirement</h3>
              <p className="text-[10px] text-slate-500 leading-tight">
                Share your loan requirement with us
              </p>
            </div>

            {/* Step 02 */}
            <div className="flex flex-col items-center bg-slate-50 p-4 rounded-xl border border-slate-200/60 relative group hover:shadow-md transition-shadow">
              <div className="h-9 w-9 rounded-full bg-[#D97706] text-white font-black text-xs flex items-center justify-center mb-3 shadow-md">
                02
              </div>
              <div className="h-10 w-10 text-slate-700 flex items-center justify-center mb-2">
                <FileCheck size={24} />
              </div>
              <h3 className="text-xs font-bold text-slate-900 mb-1">Eligibility Check</h3>
              <p className="text-[10px] text-slate-500 leading-tight">
                We check your eligibility with multiple lenders
              </p>
            </div>

            {/* Step 03 */}
            <div className="flex flex-col items-center bg-slate-50 p-4 rounded-xl border border-slate-200/60 relative group hover:shadow-md transition-shadow">
              <div className="h-9 w-9 rounded-full bg-[#C59B27] text-white font-black text-xs flex items-center justify-center mb-3 shadow-md">
                03
              </div>
              <div className="h-10 w-10 text-slate-700 flex items-center justify-center mb-2">
                <FileText size={24} />
              </div>
              <h3 className="text-xs font-bold text-slate-900 mb-1">Document Collection</h3>
              <p className="text-[10px] text-slate-500 leading-tight">
                We assist in collecting the required documents
              </p>
            </div>

            {/* Step 04 */}
            <div className="flex flex-col items-center bg-slate-50 p-4 rounded-xl border border-slate-200/60 relative group hover:shadow-md transition-shadow">
              <div className="h-9 w-9 rounded-full bg-[#16A34A] text-white font-black text-xs flex items-center justify-center mb-3 shadow-md">
                04
              </div>
              <div className="h-10 w-10 text-slate-700 flex items-center justify-center mb-2">
                <Landmark size={24} />
              </div>
              <h3 className="text-xs font-bold text-slate-900 mb-1">Bank / NBFC Matching</h3>
              <p className="text-[10px] text-slate-500 leading-tight">
                We match with the best suitable Banks / NBFCs
              </p>
            </div>

            {/* Step 05 */}
            <div className="flex flex-col items-center bg-slate-50 p-4 rounded-xl border border-slate-200/60 relative group hover:shadow-md transition-shadow">
              <div className="h-9 w-9 rounded-full bg-[#0D9488] text-white font-black text-xs flex items-center justify-center mb-3 shadow-md">
                05
              </div>
              <div className="h-10 w-10 text-slate-700 flex items-center justify-center mb-2">
                <ArrowRight size={24} />
              </div>
              <h3 className="text-xs font-bold text-slate-900 mb-1">Application Submission</h3>
              <p className="text-[10px] text-slate-500 leading-tight">
                We submit your application to selected lender(s)
              </p>
            </div>

            {/* Step 06 */}
            <div className="flex flex-col items-center bg-slate-50 p-4 rounded-xl border border-slate-200/60 relative group hover:shadow-md transition-shadow">
              <div className="h-9 w-9 rounded-full bg-[#2563EB] text-white font-black text-xs flex items-center justify-center mb-3 shadow-md">
                06
              </div>
              <div className="h-10 w-10 text-slate-700 flex items-center justify-center mb-2">
                <Search size={24} />
              </div>
              <h3 className="text-xs font-bold text-slate-900 mb-1">Verification</h3>
              <p className="text-[10px] text-slate-500 leading-tight">
                Bank verifies your details & property/business
              </p>
            </div>

            {/* Step 07 */}
            <div className="flex flex-col items-center bg-slate-50 p-4 rounded-xl border border-slate-200/60 relative group hover:shadow-md transition-shadow">
              <div className="h-9 w-9 rounded-full bg-[#4F46E5] text-white font-black text-xs flex items-center justify-center mb-3 shadow-md">
                07
              </div>
              <div className="h-10 w-10 text-slate-700 flex items-center justify-center mb-2">
                <CheckCircle size={24} />
              </div>
              <h3 className="text-xs font-bold text-slate-900 mb-1">Approval</h3>
              <p className="text-[10px] text-slate-500 leading-tight">
                Loan is approved as per lender policy
              </p>
            </div>

            {/* Step 08 */}
            <div className="flex flex-col items-center bg-slate-50 p-4 rounded-xl border border-slate-200/60 relative group hover:shadow-md transition-shadow">
              <div className="h-9 w-9 rounded-full bg-[#9333EA] text-white font-black text-xs flex items-center justify-center mb-3 shadow-md">
                08
              </div>
              <div className="h-10 w-10 text-slate-700 flex items-center justify-center mb-2">
                <Award size={24} />
              </div>
              <h3 className="text-xs font-bold text-slate-900 mb-1">Disbursement</h3>
              <p className="text-[10px] text-slate-500 leading-tight">
                Loan amount is disbursed to your account
              </p>
            </div>

            {/* Step 09 */}
            <div className="flex flex-col items-center bg-slate-50 p-4 rounded-xl border border-slate-200/60 relative group hover:shadow-md transition-shadow">
              <div className="h-9 w-9 rounded-full bg-[#BE185D] text-white font-black text-xs flex items-center justify-center mb-3 shadow-md">
                09
              </div>
              <div className="h-10 w-10 text-slate-700 flex items-center justify-center mb-2">
                <Headphones size={24} />
              </div>
              <h3 className="text-xs font-bold text-slate-900 mb-1">Post Loan Support</h3>
              <p className="text-[10px] text-slate-500 leading-tight">
                We assist you even after loan for any support
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── Section 7: Stat Counter Bar ── */}
      <section className="bg-[#800000] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-red-900/60">
            
            <div className="flex flex-col items-center p-2">
              <div className="flex items-center gap-2 mb-1">
                <Building size={32} className="text-amber-300" />
                <span className="text-3xl sm:text-4xl font-black text-white">40+</span>
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-200">Banks & NBFCs</div>
            </div>

            <div className="flex flex-col items-center p-2 pt-6 md:pt-2">
              <div className="flex items-center gap-2 mb-1">
                <Users size={32} className="text-amber-300" />
                <span className="text-3xl sm:text-4xl font-black text-white">1000+</span>
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-200">Happy Clients</div>
            </div>

            <div className="flex flex-col items-center p-2 pt-6 md:pt-2">
              <div className="flex items-center gap-2 mb-1">
                <Clock size={32} className="text-amber-300" />
                <span className="text-3xl sm:text-4xl font-black text-white">15+</span>
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-200">Years of Experience</div>
            </div>

            <div className="flex flex-col items-center p-2 pt-6 md:pt-2">
              <div className="flex items-center gap-2 mb-1">
                <Award size={32} className="text-amber-300" />
                <span className="text-3xl sm:text-4xl font-black text-white">100%</span>
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-200">Customer Satisfaction</div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Section 8: Ready to Take the Next Step? Banner ── */}
      <section id="contact" className="bg-[#700000] text-white py-12 border-t border-red-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-white/10 text-white flex items-center justify-center shrink-0 hidden sm:flex">
              <Phone size={28} />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight mb-1">
                READY TO TAKE THE NEXT STEP?
              </h3>
              <p className="text-xs sm:text-sm text-slate-200 max-w-xl">
                Talk to our loan experts and get the best loan solution for your needs.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <a 
              href="tel:+919003635556" 
              className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-white text-slate-900 hover:bg-slate-100 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <Phone size={18} className="text-[#800000]" /> 90036 35556
            </a>
            <a 
              href="https://wa.me/919003635556" 
              target="_blank" 
              rel="noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-[#25D366] text-white hover:bg-[#20ba59] font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <MessageSquare size={18} fill="white" /> WhatsApp Us
            </a>
          </div>

        </div>
      </section>

      {/* ── Section 9: Trust Badges Strip ── */}
      <section className="bg-[#0B192C] text-slate-300 py-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-xs font-bold uppercase tracking-wider">
          <div className="flex items-center justify-center gap-2">
            <CheckCircle size={16} className="text-emerald-400" />
            <span>Verified Partners</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <ShieldCheck size={16} className="text-amber-400" />
            <span>Secure Process</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Percent size={16} className="text-sky-400" />
            <span>Best Interest Rates</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Users size={16} className="text-purple-400" />
            <span>Customer First</span>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-slate-950 text-slate-400 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-12">
            
            <div className="md:col-span-5 text-left">
              <div className="flex items-center gap-3 mb-4">
                <img src={cosmosLogo} alt="Cosmos Finserve Logo" className="h-9 w-auto object-contain bg-white rounded p-1" />
                <span className="text-white text-xl font-black tracking-tight">COSMOS <span className="text-[#C59B27]">FINSERVE</span></span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm mb-6">
                Your premier wealth & loan advisory partner across Tiruppur, Coimbatore, Erode, Pollachi, and PAN India. Tied up with 40+ top banks and NBFCs for instant loan disbursals.
              </p>
              <div className="text-xs text-slate-300 space-y-2">
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
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-[#800000] pl-2">
                QUICK NAVIGATION
              </h4>
              <ul className="grid grid-cols-2 gap-2 text-xs">
                <li><button onClick={() => scrollToSection('home')} className="hover:text-white transition-colors cursor-pointer">Home</button></li>
                <li><button onClick={() => scrollToSection('banks-nbfc')} className="hover:text-white transition-colors cursor-pointer">Banks & NBFC</button></li>
                <li><button onClick={() => scrollToSection('loans')} className="hover:text-white transition-colors cursor-pointer">Loans</button></li>
                <li><button onClick={() => scrollToSection('how-it-works')} className="hover:text-white transition-colors cursor-pointer">How It Works</button></li>
                <li><button onClick={() => scrollToSection('calculators')} className="hover:text-white transition-colors cursor-pointer">Calculators</button></li>
                <li><button onClick={() => scrollToSection('about')} className="hover:text-white transition-colors cursor-pointer">About Us</button></li>
                <li><button onClick={() => scrollToSection('contact')} className="hover:text-white transition-colors cursor-pointer">Contact Us</button></li>
                <li><Link to="/login" className="hover:text-amber-400 font-bold transition-colors">Sign In</Link></li>
              </ul>
            </div>

            <div className="md:col-span-3 text-left">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-4 border-l-2 border-[#800000] pl-2">
                SERVICES
              </h4>
              <ul className="space-y-2 text-xs">
                <li><button onClick={() => scrollToSection('loans')} className="hover:text-white transition-colors cursor-pointer">Housing & Home Finance</button></li>
                <li><button onClick={() => scrollToSection('loans')} className="hover:text-white transition-colors cursor-pointer">Loan Against Property (LAP)</button></li>
                <li><button onClick={() => scrollToSection('loans')} className="hover:text-white transition-colors cursor-pointer">Business OD / CC Credit</button></li>
                <li><button onClick={() => scrollToSection('loans')} className="hover:text-white transition-colors cursor-pointer">Personal & Vehicle Loans</button></li>
                <li><button onClick={() => scrollToSection('loans')} className="hover:text-white transition-colors cursor-pointer">Balance Transfer & Top-up</button></li>
              </ul>
            </div>

          </div>

          <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
            <p>© {new Date().getFullYear()} Cosmos Finserve. All rights reserved.</p>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
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
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-40">
        <a 
          href="https://wa.me/919003635556" 
          target="_blank" 
          rel="noopener noreferrer"
          className="h-12 w-12 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
          aria-label="Contact on WhatsApp"
        >
          <MessageSquare size={22} fill="white" stroke="none" />
        </a>
        <a 
          href="tel:+919003635556" 
          className="h-12 w-12 bg-[#800000] text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
          aria-label="Call Direct Advisor"
        >
          <Phone size={20} />
        </a>
      </div>

      {/* ── Interactive EMI & Loan Calculator Modal ── */}
      {calculatorModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative my-8">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-4 mb-6">
              <div className="flex items-center gap-2">
                <Calculator size={24} className="text-[#800000]" />
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider">
                  LOAN CALCULATOR ADVISOR
                </h3>
              </div>
              <button 
                onClick={() => setCalculatorModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Slider & Input Controls */}
            <div className="space-y-6">
              
              {/* Loan Amount Slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase">Loan Amount (₹)</label>
                  <span className="text-sm font-black text-[#800000]">₹ {calcAmount.toLocaleString('en-IN')}</span>
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
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-semibold">
                  <span>₹1 Lakh</span>
                  <span>₹5 Crores</span>
                </div>
              </div>

              {/* Interest Rate Slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase">Interest Rate (% p.a.)</label>
                  <span className="text-sm font-black text-[#800000]">{calcRate}%</span>
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
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-semibold">
                  <span>6.5%</span>
                  <span>18.0%</span>
                </div>
              </div>

              {/* Tenure Slider */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase">Tenure (Years)</label>
                  <span className="text-sm font-black text-[#800000]">{calcTenure} Years</span>
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
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-semibold">
                  <span>1 Year</span>
                  <span>30 Years</span>
                </div>
              </div>

            </div>

            {/* Results Display Box */}
            <div className="mt-8 bg-slate-50 border border-slate-200 rounded-xl p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Monthly EMI</div>
                <div className="text-xl font-black text-[#800000]">₹ {calcResults.emi.toLocaleString('en-IN')}</div>
              </div>
              <div className="border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Interest</div>
                <div className="text-lg font-bold text-slate-700">₹ {calcResults.totalInterest.toLocaleString('en-IN')}</div>
              </div>
              <div className="border-t sm:border-t-0 sm:border-l border-slate-200 pt-3 sm:pt-0">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total Amount</div>
                <div className="text-lg font-bold text-slate-700">₹ {calcResults.totalPayment.toLocaleString('en-IN')}</div>
              </div>
            </div>

            {/* Apply Button */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button 
                onClick={() => {
                  setCalculatorModalOpen(false)
                  scrollToSection('eligibility-form')
                }}
                className="flex-1 py-3 rounded-lg text-xs font-bold text-white bg-[#800000] hover:bg-[#660000] transition-all shadow-md uppercase tracking-wider cursor-pointer"
              >
                Apply for Loan with this EMI
              </button>
              <button 
                onClick={() => setCalculatorModalOpen(false)}
                className="px-6 py-3 rounded-lg text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all uppercase tracking-wider cursor-pointer"
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
