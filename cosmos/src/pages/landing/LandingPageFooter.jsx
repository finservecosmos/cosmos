import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, MessageSquare, CheckCircle, ShieldCheck, Percent, Users, MapPin, Mail } from 'lucide-react';
import cosmosLogo from '../../assets/cosmosLogo.webp';

export default function LandingPageFooter({ scrollToSection }) {
  return (
    <>
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
    </>
  );
}
