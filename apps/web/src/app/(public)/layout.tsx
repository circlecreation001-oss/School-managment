'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const SOLUTIONS = [
  { label: 'School ERP', desc: 'K-12 school management', href: '/home#solutions' },
  { label: 'College ERP', desc: 'Higher education', href: '/home#solutions' },
  { label: 'Coaching ERP', desc: 'Coaching & test prep', href: '/home#solutions' },
  { label: 'University ERP', desc: 'Multi-campus', href: '/home#solutions' },
  { label: 'Training Institute', desc: 'Skill development', href: '/home#solutions' },
  { label: 'Computer Institute', desc: 'IT & vocational', href: '/home#solutions' },
];

const RESOURCES = [
  { label: 'Blog', href: '/blog' },
  { label: 'Downloads', href: '/downloads' },
  { label: 'FAQ', href: '/home#faq' },
  { label: 'Contact Support', href: '/contact' },
];

const NAV_LINKS = [
  { label: 'About', href: '/about' },
  { label: 'Admissions', href: '/apply' },
  { label: 'Faculty', href: '/faculty' },
  { label: 'Results', href: '/results' },
  { label: 'Gallery', href: '/gallery' },
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState<string | null>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Sticky Navbar */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-white/95 backdrop-blur-2xl border-b border-slate-200/60 shadow-[0_1px_3px_rgba(0,0,0,0.05)]' : 'bg-transparent'}`}>
        <nav className="mx-auto max-w-7xl flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 lg:h-[72px]">
          <Link href="/home" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
              <span className="text-white font-bold text-sm">E</span>
            </div>
            <span className={`text-xl font-bold transition-colors ${scrolled ? 'text-slate-900' : 'text-white'}`}>EduERP</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {/* Solutions Mega Menu */}
            <div className="relative" onMouseEnter={() => setMegaOpen('solutions')} onMouseLeave={() => setMegaOpen(null)}>
              <button className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${scrolled ? 'text-slate-600 hover:text-blue-600 hover:bg-blue-50' : 'text-white/80 hover:text-white'}`}>
                Solutions <span className="text-[10px] ml-0.5">▼</span>
              </button>
              <AnimatePresence>
                {megaOpen === 'solutions' && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-1 w-[480px] rounded-2xl bg-white border border-slate-200 shadow-2xl shadow-slate-200/50 p-5 grid grid-cols-2 gap-2">
                    {SOLUTIONS.map(s => (
                      <Link key={s.label} href={s.href} className="flex flex-col p-3 rounded-xl hover:bg-slate-50 transition-colors">
                        <span className="text-sm font-medium text-slate-900">{s.label}</span>
                        <span className="text-xs text-slate-500 mt-0.5">{s.desc}</span>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {NAV_LINKS.map(link => (
              <Link key={link.href} href={link.href} className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${scrolled ? 'text-slate-600 hover:text-blue-600 hover:bg-blue-50' : 'text-white/80 hover:text-white'}`}>{link.label}</Link>
            ))}

            {/* Resources Menu */}
            <div className="relative" onMouseEnter={() => setMegaOpen('resources')} onMouseLeave={() => setMegaOpen(null)}>
              <button className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${scrolled ? 'text-slate-600 hover:text-blue-600 hover:bg-blue-50' : 'text-white/80 hover:text-white'}`}>
                Resources <span className="text-[10px] ml-0.5">▼</span>
              </button>
              <AnimatePresence>
                {megaOpen === 'resources' && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.15 }}
                    className="absolute top-full right-0 mt-1 w-52 rounded-xl bg-white border border-slate-200 shadow-xl p-2">
                    {RESOURCES.map(r => (
                      <Link key={r.label} href={r.href} className="block px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors">{r.label}</Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <Link href="/login" className={`text-sm font-medium px-4 py-2 rounded-lg transition-all ${scrolled ? 'text-slate-700 hover:text-blue-600 hover:bg-blue-50' : 'text-white/90 hover:text-white hover:bg-white/10'}`}>
              Login →
            </Link>
            <Link href="/contact" className="text-sm font-semibold px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-300">
              Book Free Demo
            </Link>
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 rounded-lg" aria-label="Toggle menu">
            <div className={`w-5 h-0.5 transition-all duration-300 ${scrolled ? 'bg-slate-900' : 'bg-white'} ${mobileOpen ? 'rotate-45 translate-y-[6px]' : ''}`} />
            <div className={`w-5 h-0.5 mt-1.5 transition-all duration-300 ${scrolled ? 'bg-slate-900' : 'bg-white'} ${mobileOpen ? 'opacity-0 scale-0' : ''}`} />
            <div className={`w-5 h-0.5 mt-1.5 transition-all duration-300 ${scrolled ? 'bg-slate-900' : 'bg-white'} ${mobileOpen ? '-rotate-45 -translate-y-[6px]' : ''}`} />
          </button>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="lg:hidden bg-white border-b border-slate-200 shadow-xl overflow-hidden">
              <div className="p-4 space-y-1">
                <p className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Solutions</p>
                {SOLUTIONS.slice(0, 4).map(s => (
                  <Link key={s.label} href={s.href} onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-slate-700 py-2 px-3 rounded-lg hover:bg-slate-50">{s.label}</Link>
                ))}
                <div className="my-2 border-t border-slate-100" />
                {NAV_LINKS.map(link => (
                  <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-slate-700 py-2 px-3 rounded-lg hover:bg-slate-50">{link.label}</Link>
                ))}
                <div className="my-2 border-t border-slate-100" />
                {RESOURCES.map(r => (
                  <Link key={r.label} href={r.href} onClick={() => setMobileOpen(false)} className="block text-sm text-slate-600 py-2 px-3 rounded-lg hover:bg-slate-50">{r.label}</Link>
                ))}
                <div className="pt-3 space-y-2">
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="block text-center text-sm font-medium py-2.5 rounded-xl border border-slate-200 text-slate-700">Login →</Link>
                  <Link href="/contact" onClick={() => setMobileOpen(false)} className="block text-center text-sm font-semibold px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white">Book Free Demo</Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Content */}
      <main className="flex-1">{children}</main>

      {/* WhatsApp Chat */}
      <a href="https://wa.me/919999999999?text=Hi%20%F0%9F%91%8B%20Need%20help%20choosing%20the%20right%20ERP%3F" target="_blank" rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-full bg-green-500 pl-4 pr-5 py-3 text-white shadow-lg shadow-green-500/25 hover:bg-green-600 hover:shadow-xl hover:-translate-y-1 transition-all duration-300" aria-label="Chat on WhatsApp">
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        <span className="text-sm font-medium hidden sm:inline">Chat with us</span>
      </a>

      {/* Footer */}
      <footer className="bg-slate-950 text-white pt-16 pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 pb-12 border-b border-slate-800/60">
            <div className="col-span-2 lg:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center"><span className="text-white font-bold text-xs">E</span></div>
                <span className="text-lg font-bold">EduERP</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">Complete Education Management Platform for schools, colleges, and coaching institutes.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4 text-slate-200">Solutions</h4>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li><Link href="/home#solutions" className="hover:text-white transition-colors">School ERP</Link></li>
                <li><Link href="/home#solutions" className="hover:text-white transition-colors">College ERP</Link></li>
                <li><Link href="/home#solutions" className="hover:text-white transition-colors">Coaching ERP</Link></li>
                <li><Link href="/home#solutions" className="hover:text-white transition-colors">University ERP</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4 text-slate-200">Product</h4>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li><Link href="/home#features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/home#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/results" className="hover:text-white transition-colors">Results</Link></li>
                <li><Link href="/downloads" className="hover:text-white transition-colors">Downloads</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4 text-slate-200">Resources</h4>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="/home#faq" className="hover:text-white transition-colors">FAQ</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Support</Link></li>
                <li><Link href="/gallery" className="hover:text-white transition-colors">Gallery</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4 text-slate-200">Company</h4>
              <ul className="space-y-2.5 text-sm text-slate-400">
                <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/apply" className="hover:text-white transition-colors">Admissions</Link></li>
                <li><Link href="/faculty" className="hover:text-white transition-colors">Faculty</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500">© {new Date().getFullYear()} EduERP by HimanshiTech. All rights reserved.</p>
            <div className="flex items-center gap-6 text-xs text-slate-500">
              <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-white transition-colors">Terms & Conditions</Link>
              <Link href="#" className="hover:text-white transition-colors">Refund Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
