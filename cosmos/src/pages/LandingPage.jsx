import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAppState } from '../context/AppStateContext'
import { useToast } from '../context/ToastContext'
import { 
  Home, 
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
  Globe, 
  CheckCircle,
  MessageSquare,
  Sparkles,
  ChevronRight
} from 'lucide-react'
import cosmosLogo from '../assets/cosmosLogo.webp'
import heroAdvisorChart from '../assets/hero_advisor_chart.png'
import handshakeDeal from '../assets/handshake_deal.png'
import modernBuildingDusk from '../assets/modern_building_dusk.png'
import citySkylineRiver from '../assets/city_skyline_river.png'
import './LandingPage.css'

export default function LandingPage() {
  const { addEnquiry } = useAppState()
  const { addToast } = useToast()
  
  useEffect(() => {
    document.title = "Cosmos Finserve | Institutional Wealth, Loan & Payment Advisory";
  }, []);

  // Tab state for Precision Lending Instruments
  const [activeTab, setActiveTab] = useState('home-loan')
  
  // Contact form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    service: 'Home Finance',
    message: ''
  })
  
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const contactFormRef = useRef(null)

  // Lending Instruments details dictionary
  const lendingData = {
    'home-loan': {
      title: 'Home Loan',
      rate: '8.40% - 9.15% p.a.',
      tenure: 'Up to 30 Years',
      processingFee: '0.50% of loan amount',
      ltv: 'Up to 90% of property value',
      features: [
        'Zero prepayment penalties for floating rate loans',
        'Special interest concessions for women applicants',
        'Quick document checks and fast-track approval processing',
        'Top-up loan facility available for renovation needs'
      ],
      dbValue: 'Housing'
    },
    'personal-loan': {
      title: 'Personal Loan',
      rate: '10.50% - 14.00% p.a.',
      tenure: 'Up to 7 Years',
      processingFee: '1.00% - 1.50%',
      ltv: 'Based on income capability',
      features: [
        'No security or collateral required',
        'Minimal documentation with instant eligibility check',
        'Flexible repayment tenures to fit monthly budgets',
        'Funds can be used for travel, medical, or marriage costs'
      ],
      dbValue: 'Others'
    },
    'business-loan': {
      title: 'Business Loan',
      rate: '11.25% - 15.50% p.a.',
      tenure: 'Up to 5 Years',
      processingFee: '1.25%',
      ltv: 'Up to 75% of asset value',
      features: [
        'Collateral-free loans up to ₹50 Lakhs',
        'Customized terms based on company vintage and cashflows',
        'Flexible drawdowns and interest-only period options',
        'Fast disbursal within 72 hours of approval verification'
      ],
      dbValue: 'Business OD/CC'
    },
    'vehicle-loan': {
      title: 'Vehicle Loan',
      rate: '8.75% - 9.50% p.a.',
      tenure: 'Up to 8 Years',
      processingFee: 'Flat ₹2,500',
      ltv: 'Up to 100% on-road funding',
      features: [
        'Attractive rates for Electric Vehicles (EVs)',
        'Tie-ups with leading automobile dealerships worldwide',
        'No salary-transfer requirement for salaried individuals',
        'Bespoke luxury car finance configurations'
      ],
      dbValue: 'Others'
    },
    'commercial-loan': {
      title: 'Commercial Loan',
      rate: '9.20% - 11.50% p.a.',
      tenure: 'Up to 15 Years',
      processingFee: '0.75%',
      ltv: 'Up to 70% of commercial asset value',
      features: [
        'Structured funding for office spaces, warehouses, and shops',
        'Lending options for retail commercial properties',
        'Refinance options for active commercial real estate',
        'Flexible repayment lease rental discounting (LRD)'
      ],
      dbValue: 'Others'
    },
    'custom-debt': {
      title: 'Custom Debt',
      rate: 'Bespoke / Custom structured',
      tenure: 'Flexible Structured Terms',
      processingFee: 'Custom terms',
      ltv: 'Bespoke collateral structure',
      features: [
        'Mezzanine financing and bridge loan facilities',
        'Acquisition debt and expansion project capital',
        'Tailored covenants matching operational cashflows',
        'Dedicated corporate advisory team for loan design'
      ],
      dbValue: 'Others'
    }
  }

  // Smooth scroll helper
  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Handle Tab apply action
  const handleApplyTab = (loanKey) => {
    const loanInfo = lendingData[loanKey]
    const mappedService = 
      loanInfo.dbValue === 'Housing' ? 'Home Finance' :
      loanInfo.dbValue === 'Business OD/CC' ? 'Corporate Credit' :
      loanInfo.dbValue === 'Loan Against Property' ? 'Asset Liquidity' : 'Wealth Advisory'

    setFormData(prev => ({
      ...prev,
      service: mappedService,
      message: `Hi, I am interested in applying for a ${loanInfo.title}. Please provide more details.`
    }))
    
    scrollToSection('contact')
    addToast(`Selected ${loanInfo.title} for advisory request!`, 'info')
  }

  // Handle Form Input change
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle Form Submit
  const handleFormSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.phone) {
      addToast('Full Name and Phone Number are required', 'error')
      return
    }

    if (formData.phone.replace(/\D/g, '').length < 10) {
      addToast('Please enter a valid 10-digit mobile number', 'error')
      return
    }

    setSubmitting(true)
    try {
      // Map service back to standard loan_type expected by EnquiryStatus
      let mappedLoanType = 'Others'
      if (formData.service === 'Home Finance') mappedLoanType = 'Housing'
      else if (formData.service === 'Corporate Credit') mappedLoanType = 'Business OD/CC'
      else if (formData.service === 'Asset Liquidity') mappedLoanType = 'Loan Against Property'
      
      const payload = {
        client_name: formData.name,
        co_applicate_name: '',
        client_mobile_number: Number(formData.phone.replace(/\D/g, '')),
        loan_type: mappedLoanType,
        loan_amount: 0, // Not provided directly, default to 0
        associate_name: 'Unassigned',
        status: 'New',
        note: formData.message || `Interest in ${formData.service}`,
        google_drive_link: ''
      }

      await addEnquiry(payload)
      setSubmitted(true)
      addToast('Advisory session requested successfully!', 'success')
      setFormData({
        name: '',
        phone: '',
        service: 'Home Finance',
        message: ''
      })
    } catch (err) {
      console.error(err)
      addToast('Failed to submit request. Please try again.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="landing-layout">
      {/* ── Navbar ── */}
      <header className="landing-header">
        <div className="nav-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollToSection('home')}>
            <img src={cosmosLogo} alt="Cosmos Finserve - Premium Wealth and Loan Advisory Logo" className="h-10 w-auto object-contain" />
            <span className="brand-logo-text text-xl font-bold tracking-tight text-slate-900">
              Cosmos<span className="text-accent">Finserv</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <button onClick={() => scrollToSection('home')} className="hover:text-accent transition-colors">HOME</button>
            <button onClick={() => scrollToSection('services')} className="hover:text-accent transition-colors">SERVICES</button>
            <button onClick={() => scrollToSection('loans')} className="hover:text-accent transition-colors">LOANS</button>
            <button onClick={() => scrollToSection('about')} className="hover:text-accent transition-colors">ABOUT</button>
            <button onClick={() => scrollToSection('contact')} className="hover:text-accent transition-colors">CONTACT</button>
          </nav>

          <div>
            <Link 
              to="/login" 
              className="dashboard-login-btn inline-flex items-center justify-center px-3 py-1.5 md:px-5 md:py-2.5 rounded-md md:rounded-lg text-[10px] md:text-sm font-bold text-white bg-accent hover:bg-accentHover transition-all shadow-md hover:shadow-lg whitespace-nowrap"
            >
              DASHBOARD LOGIN
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero Section ── */}
      <section id="home" className="hero-section pt-32 pb-20 overflow-hidden bg-gradient-to-b from-red-50/30 via-white to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <div className="badge-excellence mb-6 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-red-200 bg-red-50 text-xs font-bold text-accent tracking-wider uppercase">
              <Sparkles size={12} /> GLOBAL FINANCIAL EXCELLENCE
            </div>

            <h1 className="hero-title text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.15] mb-6">
              Elite Banking <br />
              <span className="text-accent font-black">& Loan</span> Solutions
            </h1>

            <p className="hero-subtitle text-lg text-slate-600 mb-8 max-w-2xl leading-relaxed">
              Bridging the gap between your financial aspirations and reality. We deliver premium, bespoke expert advisory for Home Loans, Commercial Loans, and Strategic Wealth Planning.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-10 w-full sm:w-auto">
              <button 
                onClick={() => scrollToSection('services')} 
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-lg text-sm font-bold text-white bg-accent hover:bg-accentHover shadow-lg hover:shadow-xl transition-all gap-2"
              >
                Explore Solutions <ArrowRight size={16} />
              </button>
              <button 
                onClick={() => scrollToSection('about')} 
                className="inline-flex items-center justify-center px-8 py-3.5 rounded-lg text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-sm transition-all"
              >
                Read testimonials
              </button>
            </div>


          </div>

          <div className="lg:col-span-5 relative">
            {/* Visual Laptop Mockup */}
            <div className="relative mx-auto max-w-[500px] lg:max-w-none rounded-2xl overflow-hidden shadow-2xl border border-slate-100 bg-white p-3 transform hover:scale-[1.02] transition-transform duration-500">
              <div className="bg-slate-800 text-slate-400 text-[10px] px-3 py-1 flex items-center justify-between rounded-t-lg">
                <span className="font-mono">PREMIER FINANCIAL ADVISORY. TRUSTED FUTURES.</span>
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block"></span>
                </div>
              </div>
              <img 
                src={heroAdvisorChart} 
                alt="Cosmos Finserve - Premium Wealth Management Dashboard and Capital Growth Charts" 
                className="w-full h-auto object-cover rounded-b-lg aspect-[4/3]"
              />
              
              {/* Overlapping stat card */}
              <div className="absolute -bottom-6 -left-6 bg-white p-5 rounded-xl shadow-xl border border-slate-100 max-w-[240px] flex items-start gap-3 transform hover:translate-y-[-4px] transition-transform duration-300">
                <div className="p-3 bg-red-50 text-accent rounded-lg">
                  <Percent size={20} className="font-bold" />
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 tracking-tight">9.5%</div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Avg. Loan Rate</div>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    Secure the best deal for your dream property, business or expansion plans.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stat Bar (Dark Strip) ── */}
      <section className="bg-slate-950 text-white py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-800 text-center">
            <div className="p-4">
              <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">50+</div>
              <div className="text-xs sm:text-sm font-medium text-slate-400 uppercase tracking-wider mt-2">LEADING PARTNERS</div>
            </div>
            <div className="p-4 pt-8 md:pt-4">
              <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">₹100Cr+</div>
              <div className="text-xs sm:text-sm font-medium text-slate-400 uppercase tracking-wider mt-2">CAPITAL DISBURSED</div>
            </div>
            <div className="p-4 pt-8 md:pt-4">
              <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">12</div>
              <div className="text-xs sm:text-sm font-medium text-slate-400 uppercase tracking-wider mt-2">COUNTRIES SERVED</div>
            </div>
            <div className="p-4 pt-8 md:pt-4">
              <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">99%</div>
              <div className="text-xs sm:text-sm font-medium text-slate-400 uppercase tracking-wider mt-2">APPROVAL RATE</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Services Section ── */}
      <section id="services" className="services-section py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
          <span className="text-xs font-bold text-accent uppercase tracking-widest block mb-3">SERVICE ECOSYSTEM</span>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">
            Strategic Financial Architecture
          </h2>
          <p className="text-base text-slate-500 max-w-2xl mx-auto leading-relaxed">
            The right advisor and financial structures can turn your financial aspirations into a well-crafted, secure, and thriving legacy.
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Card 1: Home Finance */}
          <div className="service-card bg-white p-8 rounded-xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="icon-box h-12 w-12 bg-red-50 text-accent rounded-lg flex items-center justify-center mb-6">
                <Home size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Home Finance</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-6">
                Bespoke mortgage structures tailored to family legacy, residential funding, and high-value refinancing options.
              </p>
            </div>
            <button onClick={() => handleApplyTab('home-loan')} className="card-link inline-flex items-center text-xs font-bold text-accent hover:text-accentHover gap-1">
              Explore More <ChevronRight size={14} />
            </button>
          </div>

          {/* Card 2: Corporate Credit */}
          <div className="service-card bg-white p-8 rounded-xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="icon-box h-12 w-12 bg-red-50 text-accent rounded-lg flex items-center justify-center mb-6">
                <Briefcase size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Corporate Credit</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-6">
                Leverage capital, mezzanine funding configurations, cashflow credit models, and machinery asset acquisition loans.
              </p>
            </div>
            <button onClick={() => handleApplyTab('business-loan')} className="card-link inline-flex items-center text-xs font-bold text-accent hover:text-accentHover gap-1">
              Explore More <ChevronRight size={14} />
            </button>
          </div>

          {/* Card 3: Asset Liquidity */}
          <div className="service-card bg-white p-8 rounded-xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="icon-box h-12 w-12 bg-red-50 text-accent rounded-lg flex items-center justify-center mb-6">
                <Percent size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Asset Liquidity</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-6">
                Unlock cash value without liquidating asset holdings; credit line facilities against high-yield equities and funds.
              </p>
            </div>
            <button onClick={() => handleApplyTab('commercial-loan')} className="card-link inline-flex items-center text-xs font-bold text-accent hover:text-accentHover gap-1">
              Explore More <ChevronRight size={14} />
            </button>
          </div>

          {/* Card 4: Wealth Advisory */}
          <div className="service-card bg-white p-8 rounded-xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="icon-box h-12 w-12 bg-red-50 text-accent rounded-lg flex items-center justify-center mb-6">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Wealth Advisory</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-6">
                Actively structured portfolios targeting capital preservation, long-term legacy yields, and tax transition.
              </p>
            </div>
            <button onClick={() => handleApplyTab('custom-debt')} className="card-link inline-flex items-center text-xs font-bold text-accent hover:text-accentHover gap-1">
              Explore More <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* ── Feature Section ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            {/* Image handshake with border highlight */}
            <div className="relative rounded-2xl overflow-hidden border-[6px] border-amber-400 shadow-xl max-w-[540px] mx-auto">
              <img src={handshakeDeal} alt="Cosmos Finserve - Corporate Lending Deal and Client Partnership Handshake" className="w-full h-auto aspect-[4/3] object-cover" />
              <div className="absolute bottom-6 left-6 right-6 bg-slate-950/95 backdrop-blur-sm p-6 rounded-lg text-white text-left border-l-4 border-amber-400">
                <p className="italic text-sm text-slate-200 mb-3">
                  "Your financial freedom isn't just about spreadsheets or numbers; it's about securing peace of mind for your legacy."
                </p>
                <div className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  — PRINCIPAL STRATEGIST, COSMOS
                </div>
              </div>
            </div>
          </div>

          <div className="text-left">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-snug mb-8">
              Elite Guidance,<br />
              <span className="text-accent">Personalized Vision</span>
            </h2>

            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0 h-10 w-10 bg-red-50 text-accent rounded-lg flex items-center justify-center font-bold">
                  01
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Uncompromising Compliance</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Adhering strictly to local banking norms and sovereign regulations, securing your funds with institutional-grade protocols.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 h-10 w-10 bg-red-50 text-accent rounded-lg flex items-center justify-center font-bold">
                  02
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Premier Partner Ecosystem</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    Direct syndication with top-tier global banking partners, private credit desks, and niche capital institutions.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 h-10 w-10 bg-red-50 text-accent rounded-lg flex items-center justify-center font-bold">
                  03
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">24/7 Dedicated Advisory Access</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    A personalized portfolio officer assigned to manage your file lifecycle, available round-the-clock to guide your milestones.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Precision Lending Instruments (Tabs) ── */}
      <section id="loans" className="py-24 bg-slate-50 border-t border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-4">
            Precision Lending Instruments
          </h2>
          <p className="text-base text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Explore our comprehensive lending modules structured to align with your personal milestones and commercial expansion goals.
          </p>
        </div>

        <div className="max-w-5xl mx-auto px-4">
          {/* Tabs header */}
          <div className="flex overflow-x-auto gap-2 p-1.5 bg-slate-200/60 rounded-xl mb-12 scrollbar-hide">
            {Object.keys(lendingData).map((key) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex-1 min-w-[120px] py-3 text-center text-xs font-bold rounded-lg uppercase tracking-wider transition-all ${
                  activeTab === key
                    ? 'bg-accent text-white shadow-md'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {lendingData[key].title}
              </button>
            ))}
          </div>

          {/* Tab content panel */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xl p-8 sm:p-12 text-left">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              <div className="md:col-span-7">
                <span className="text-[10px] font-bold tracking-widest text-accent uppercase mb-2 block">INSTRUMENT HIGHLIGHT</span>
                <h3 className="text-2xl font-bold text-slate-900 mb-6">{lendingData[activeTab].title} Features</h3>
                
                <ul className="space-y-4 mb-8">
                  {lendingData[activeTab].features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-600 leading-relaxed">
                      <span className="mt-1 h-2 w-2 rounded-full bg-accent flex-shrink-0"></span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  onClick={() => handleApplyTab(activeTab)} 
                  className="inline-flex items-center px-6 py-3 bg-accent hover:bg-accentHover text-white text-xs font-bold rounded-lg uppercase tracking-wider transition-all gap-1.5 shadow-md hover:shadow-lg"
                >
                  Apply for {lendingData[activeTab].title} <ArrowRight size={14} />
                </button>
              </div>

              <div className="md:col-span-5 bg-slate-50 p-6 rounded-xl border border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">PORTFOLIO OVERVIEW</h4>
                
                <div className="space-y-5">
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">INTEREST RATE</div>
                    <div className="text-lg font-black text-slate-900">{lendingData[activeTab].rate}</div>
                  </div>
                  <div className="border-t border-slate-200/70 pt-4">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">MAX TENURE</div>
                    <div className="text-lg font-black text-slate-900">{lendingData[activeTab].tenure}</div>
                  </div>
                  <div className="border-t border-slate-200/70 pt-4">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">PROCESSING CHARGE</div>
                    <div className="text-lg font-black text-slate-900">{lendingData[activeTab].processingFee}</div>
                  </div>
                  <div className="border-t border-slate-200/70 pt-4">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">LOAN-TO-VALUE (LTV) LIMIT</div>
                    <div className="text-lg font-black text-slate-900">{lendingData[activeTab].ltv}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <button onClick={() => scrollToSection('contact')} className="text-xs font-semibold text-slate-400 hover:text-accent underline transition-colors cursor-pointer">
              View all Institutional Portfolio Rates
            </button>
          </div>
        </div>
      </section>

      {/* ── Legacy Section ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 text-white rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 lg:grid-cols-2">
            <div className="p-10 sm:p-16 flex flex-col justify-center text-left">
              <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase mb-3 block">THE LEGACY</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-6">
                Redefining the Standard of Advice
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed mb-10 max-w-lg">
                Founded on the principles of trust and absolute confidentiality, Cosmos Finserv has served as a pioneering force in regional and international capital access. We don't just act as financial brokers; we commit to your lifetime growth index.
              </p>

              <div className="grid grid-cols-2 gap-6 mb-10 border-t border-slate-800 pt-8">
                <div>
                  <div className="text-3xl font-extrabold text-amber-400">100%</div>
                  <div className="text-xs text-slate-400 uppercase mt-1">CLIENT TRUST INDEX</div>
                </div>
                <div>
                  <div className="text-3xl font-extrabold text-amber-400">12+</div>
                  <div className="text-xs text-slate-400 uppercase mt-1">YEARS OF EXCELLENCE</div>
                </div>
              </div>

              <div>
                <button 
                  onClick={() => scrollToSection('contact')} 
                  className="inline-flex items-center px-6 py-3 border border-slate-700 hover:border-white text-white text-xs font-bold rounded-lg uppercase tracking-wider transition-all"
                >
                  Meet Our Advisors
                </button>
              </div>
            </div>
            
            <div className="relative min-h-[350px] lg:min-h-none">
              <img 
                src={modernBuildingDusk} 
                alt="Modern skyscraper office lights at dusk" 
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Initiate Your Next Milestone (Contact Form) ── */}
      <section id="contact" className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          <div className="lg:col-span-5 text-left">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-8">
              Initiate Your Next Milestone
            </h2>
            
            <div className="space-y-6 mb-12">
              <div className="flex gap-4 p-5 bg-white rounded-xl border border-slate-100 shadow-sm">
                <div className="flex-shrink-0 h-10 w-10 bg-red-50 text-accent rounded-lg flex items-center justify-center">
                  <MapPin size={20} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase mb-0.5">OFFICE LOCATION</div>
                  <div className="text-sm font-semibold text-slate-700">Avinashi Main Rd, Tiruppur, Tamil Nadu 641603, India</div>
                </div>
              </div>

              <div className="flex gap-4 p-5 bg-white rounded-xl border border-slate-100 shadow-sm">
                <div className="flex-shrink-0 h-10 w-10 bg-red-50 text-accent rounded-lg flex items-center justify-center">
                  <Phone size={20} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase mb-0.5">DIRECT LINE</div>
                  <div className="text-sm font-semibold text-slate-700">+91 90036 35556</div>
                </div>
              </div>

              <div className="flex gap-4 p-5 bg-white rounded-xl border border-slate-100 shadow-sm">
                <div className="flex-shrink-0 h-10 w-10 bg-red-50 text-accent rounded-lg flex items-center justify-center">
                  <Mail size={20} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase mb-0.5">SECURE EMAIL</div>
                  <div className="text-sm font-semibold text-slate-700">cosmosfinserve@gmail.com</div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-100">
              <img src={citySkylineRiver} alt="Cosmos Finserve Regional Financial Hub City Skyline" className="w-full h-auto aspect-[16/10] object-cover" />
            </div>
          </div>

          <div ref={contactFormRef} className="lg:col-span-7">
            <div className="bg-white p-8 sm:p-10 rounded-2xl border border-slate-100 shadow-xl text-left">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Request Advisory Session</h3>
              <p className="text-sm text-slate-500 mb-8">
                Submit your credentials and one of our relationship officers will contact you within 24 hours.
              </p>

              {submitted ? (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-8 text-center flex flex-col items-center">
                  <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle size={32} />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">Session Requested Successfully</h4>
                  <p className="text-sm text-slate-500 max-w-sm mb-6">
                    Thank you! Your details have been submitted. An institutional advisor will call or email you shortly.
                  </p>
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="text-xs font-bold text-accent hover:underline uppercase tracking-wider"
                  >
                    Submit Another Request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="form-name" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">YOUR FULL NAME</label>
                      <input 
                        id="form-name"
                        type="text" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleInputChange} 
                        placeholder="e.g. John Doe"
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-sm text-slate-700 bg-slate-50"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="form-phone" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">PHONE NUMBER</label>
                      <input 
                        id="form-phone"
                        type="tel" 
                        name="phone" 
                        value={formData.phone} 
                        onChange={handleInputChange} 
                        placeholder="e.g. +919003635556" 
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-sm text-slate-700 bg-slate-50"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="form-service" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">SERVICE INTERESTED</label>
                    <select 
                      id="form-service"
                      name="service" 
                      value={formData.service} 
                      onChange={handleInputChange} 
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-sm text-slate-700 bg-slate-50 cursor-pointer"
                    >
                      <option value="Home Finance">Home Finance (Housing)</option>
                      <option value="Corporate Credit">Corporate Credit (Business Debt)</option>
                      <option value="Asset Liquidity">Asset Liquidity (Lien Loan)</option>
                      <option value="Wealth Advisory">Wealth Advisory (Other Capital Portfolio)</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="form-message" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">BRIEF NOTES / MESSAGE</label>
                    <textarea 
                      id="form-message"
                      name="message" 
                      value={formData.message} 
                      onChange={handleInputChange} 
                      rows="4" 
                      placeholder="Share details regarding your funding requirement..."
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-sm text-slate-700 bg-slate-50 resize-none"
                    ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="w-full py-4 bg-accent hover:bg-accentHover text-white text-sm font-bold rounded-lg uppercase tracking-wider transition-all shadow-md disabled:opacity-50"
                  >
                    {submitting ? 'SUBMITTING REQUEST...' : 'SUBMIT ADVISORY REQUEST'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-slate-950 text-slate-400 py-16 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-12">
            <div className="md:col-span-6 text-left">
              <div className="flex items-center gap-3 mb-6">
                <img src={cosmosLogo} alt="Cosmos Finserve - Institutional Wealth and Loan Advisory Logo" className="h-8 w-auto object-contain brightness-0 invert" />
                <span className="text-white text-lg font-bold">CosmosFinserv</span>
              </div>
              <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
                Redefining the architecture of wealth management and debt allocation. Committed to preserving legacy and driving liquidity.
              </p>
            </div>

            <div className="md:col-span-3 text-left">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-6">LINKS</h4>
              <ul className="space-y-3 text-sm">
                <li><button onClick={() => scrollToSection('home')} className="hover:text-white transition-colors">Home</button></li>
                <li><button onClick={() => scrollToSection('services')} className="hover:text-white transition-colors">Services</button></li>
                <li><button onClick={() => scrollToSection('loans')} className="hover:text-white transition-colors">Loans & Credit</button></li>
                <li><button onClick={() => scrollToSection('about')} className="hover:text-white transition-colors">About Us</button></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Dashboard Login</Link></li>
              </ul>
            </div>

            <div className="md:col-span-3 text-left">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-6">SUPPORT</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#privacy" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#terms" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#terms" className="hover:text-white transition-colors">Institutional Disclosures</a></li>
                <li><button onClick={() => scrollToSection('contact')} className="hover:text-white transition-colors">Advisory Support</button></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
            <p>© {new Date().getFullYear()} Cosmos Finserv. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#sec" className="hover:text-slate-300">Security Protocols</a>
              <span>·</span>
              <a href="#terms" className="hover:text-slate-300">Regulatory Certs</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Bottom Quick Contacts */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-40">
        <a 
          href="https://wa.me/9003635556" 
          target="_blank" 
          rel="noopener noreferrer"
          className="h-12 w-12 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          aria-label="Contact on WhatsApp"
        >
          <MessageSquare size={22} fill="white" stroke="none" />
        </a>
        <a 
          href="tel:+919003635556" 
          className="h-12 w-12 bg-accent text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          aria-label="Call Direct Advisor"
        >
          <Phone size={20} />
        </a>
      </div>
    </div>
  )
}
