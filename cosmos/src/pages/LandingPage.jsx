import React, { useState, useEffect } from 'react'
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
  ArrowRight, 
  FileText, 
  TrendingUp, 
  Users, 
  CheckCircle,
  ChevronRight,
  Search,
  Check,
  Calculator,
  Car,
  UserCheck,
  Landmark,
  BadgeCheck,
  Clock,
  FileCheck,
  Headphones,
  Award,
  Lock,
  ArrowRightLeft,
  Stamp,
  Receipt
} from 'lucide-react'
import heroAdvisorChart from '../assets/hero_advisor_chart.png'
import LandingPageHeader from './landing/LandingPageHeader'
import PartnerBrandLogos, { PARTNERS_LIST } from './landing/PartnerBrandLogos'
import CalculatorModal from './landing/CalculatorModal'
import LandingPageFooter from './landing/LandingPageFooter'
import './LandingPage.css'

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
      
      {/* Header & Sticky Navbar */}
      <LandingPageHeader 
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        scrollToSection={scrollToSection}
      />

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

      {/* ── Section 2: OUR BANKING & NBFC PARTNERS ── */}
      <PartnerBrandLogos 
        partnerFilter={partnerFilter}
        setPartnerFilter={setPartnerFilter}
        searchPartner={searchPartner}
        setSearchPartner={setSearchPartner}
        filteredPartners={filteredPartners}
      />

      {/* ── Section 3: Why Choose Cosmos Finserve ── */}
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

        {/* Loan Cards Grid */}
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

      {/* Footer & Floating Actions */}
      <LandingPageFooter scrollToSection={scrollToSection} />

      {/* Interactive Loan Calculator Modal */}
      <CalculatorModal
        calculatorModalOpen={calculatorModalOpen}
        setCalculatorModalOpen={setCalculatorModalOpen}
        calcTitle={calcTitle}
        calcAmount={calcAmount}
        setCalcAmount={setCalcAmount}
        calcRate={calcRate}
        setCalcRate={setCalcRate}
        calcTenure={calcTenure}
        setCalcTenure={setCalcTenure}
        calcResults={calcResults}
        scrollToSection={scrollToSection}
      />

    </div>
  )
}
