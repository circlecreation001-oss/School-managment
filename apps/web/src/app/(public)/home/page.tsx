'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[100vh] flex items-center overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent" />
        <div className="absolute top-20 right-20 w-[500px] h-[500px] bg-blue-500/8 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-10 w-[400px] h-[400px] bg-indigo-500/8 rounded-full blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-32 pb-20 w-full">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="text-center max-w-5xl mx-auto">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 backdrop-blur-sm mb-8">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-medium text-blue-200">Built for Schools, Colleges and Coaching Institutes</span>
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.08] tracking-tight">
              Complete{' '}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400 bg-clip-text text-transparent">Website + ERP + Apps</span>
              <br />for Every Institute
            </motion.h1>

            <motion.p variants={fadeUp} className="mt-6 text-base sm:text-lg lg:text-xl text-slate-300/90 max-w-3xl mx-auto leading-relaxed">
              One platform to manage admissions, academics, finance, communication, website, and operations - for schools, colleges, coaching institutes, and universities.
            </motion.p>

            <motion.div variants={fadeUp} className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm shadow-xl shadow-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all duration-300">
                Book Free Demo
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </Link>
              <Link href="#features" className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-white/15 text-white font-semibold text-sm backdrop-blur-sm hover:bg-white/5 hover:border-white/25 transition-all duration-300">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                Watch Demo
              </Link>
            </motion.div>

            <motion.div variants={fadeUp} className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {[{ value: '2,500+', label: 'Institutes' }, { value: '15L+', label: 'Students' }, { value: '99.9%', label: 'Uptime' }, { value: '500+', label: 'Cities' }].map((s) => (
                <div key={s.label} className="text-center p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                  <p className="text-2xl sm:text-3xl font-bold text-white">{s.value}</p>
                  <p className="text-xs text-slate-400 mt-1">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Dashboard Preview */}
          <motion.div initial={{ opacity: 0, y: 80 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.8 }} className="mt-20 mx-auto max-w-5xl">
            <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-sm p-3 shadow-2xl shadow-black/20">
              <div className="rounded-2xl bg-slate-900/80 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700/50">
                  <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-400/80"/><div className="w-3 h-3 rounded-full bg-yellow-400/80"/><div className="w-3 h-3 rounded-full bg-green-400/80"/></div>
                  <div className="flex-1 flex justify-center"><div className="px-4 py-1 rounded-lg bg-slate-800 text-xs text-slate-400">app.schoolnex.in/dashboard</div></div>
                </div>
                <div className="h-72 sm:h-80 lg:h-[420px] bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 flex items-center justify-center relative">
                  <div className="absolute inset-0 grid grid-cols-4 grid-rows-3 gap-3 p-6 opacity-60">
                    {Array.from({length:12}).map((_,i)=><div key={i} className="rounded-xl bg-slate-700/30 animate-pulse" style={{animationDelay:`${i*0.2}s`}}/>)}
                  </div>
                  <div className="relative z-10 text-center">
                    <p className="text-4xl mb-3">&#128202;</p>
                    <p className="text-white font-semibold">Admin Dashboard</p>
                    <p className="text-slate-400 text-xs mt-1">Real-time analytics - Live attendance - Fee collection</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SUPPORTED INSTITUTES */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.p variants={fadeUp} className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Solutions for Every Institute</motion.p>
            <motion.h2 variants={fadeUp} className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900">One Platform. Every Institute Type.</motion.h2>
            <motion.p variants={fadeUp} className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">From K-12 schools to competitive coaching centers - SchoolNex adapts to your workflow.</motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { icon: '&#127979;', name: 'School ERP', desc: 'K-12 management' },
              { icon: '&#127891;', name: 'College ERP', desc: 'Higher education' },
              { icon: '&#127963;', name: 'University ERP', desc: 'Multi-campus' },
              { icon: '&#128218;', name: 'Coaching Institute', desc: 'Batch & test series' },
              { icon: '&#128221;', name: 'SSC Coaching', desc: 'Government exams' },
              { icon: '&#128642;', name: 'Railway Coaching', desc: 'RRB preparation' },
              { icon: '&#127974;', name: 'Banking Coaching', desc: 'IBPS & SBI prep' },
              { icon: '&#128110;', name: 'Police & Defence', desc: 'Physical + written' },
              { icon: '&#9878;', name: 'UPSC / BPSC', desc: 'Civil services prep' },
              { icon: '&#129658;', name: 'NEET Coaching', desc: 'Medical entrance' },
              { icon: '&#9881;', name: 'JEE Coaching', desc: 'Engineering entrance' },
              { icon: '&#128188;', name: 'Commerce Coaching', desc: 'CA, CS, CMA, B.Com' },
              { icon: '&#128187;', name: 'Computer Institute', desc: 'IT courses & certs' },
              { icon: '&#127760;', name: 'Spoken English', desc: 'Language training' },
              { icon: '&#127919;', name: 'Skill Development', desc: 'Vocational training' },
            ].map((inst) => (
              <motion.div key={inst.name} variants={fadeUp} className="group p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-300 cursor-pointer text-center">
                <span className="text-2xl block mb-2" dangerouslySetInnerHTML={{ __html: inst.icon }} />
                <h3 className="text-sm font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{inst.name}</h3>
                <p className="text-xs text-slate-500 mt-1">{inst.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* WEBSITE FEATURES */}
      <section className="py-24 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.p variants={fadeUp} className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Institutional Website</motion.p>
            <motion.h2 variants={fadeUp} className="mt-3 text-3xl sm:text-4xl font-bold text-slate-900">Professional Website Included</motion.h2>
            <motion.p variants={fadeUp} className="mt-4 text-lg text-slate-600">Every SchoolNex plan includes a modern, SEO-optimized institution website.</motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {['Responsive Website','Online Admission','Course Pages','Faculty Profiles','Online Fee Payment','Student Portal','Test Series Portal','Study Material','Blog & News','Photo Gallery','Video Gallery','Contact Form','Google Maps','WhatsApp Chat','SEO Optimized','Custom Domain','Fast Loading','Mobile Friendly','SSL Security','Analytics'].map((f) => (
              <motion.div key={f} variants={fadeUp} className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all duration-300">
                <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                <span className="text-sm font-medium text-slate-700">{f}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ERP FEATURES */}
      <section id="features" className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.p variants={fadeUp} className="text-sm font-semibold text-blue-600 uppercase tracking-wider">50+ Modules</motion.p>
            <motion.h2 variants={fadeUp} className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900">Complete Education ERP</motion.h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="space-y-12">
            {[
              { cat: 'Academic', items: ['Student Management','Teacher Management','Parent Management','Admissions','Batch Management','Attendance','Timetable','Homework','Assignments','Study Material','Library','Certificates','Transfer Certificate','ID Cards'] },
              { cat: 'Finance', items: ['Fee Management','Online Payments','Payroll','Accounting','Expense Management','Scholarships','Receipts','Due Reports'] },
              { cat: 'Examination', items: ['Online Exams','Offline Exams','MCQ Tests','Subjective Exams','OMR Support','Question Bank','Results','Report Card','Rank List','Test Series'] },
              { cat: 'Communication', items: ['SMS Notifications','WhatsApp Notifications','Email Notifications','Parent App','Student App','Teacher App','Broadcast','Templates'] },
              { cat: 'Administration', items: ['Dashboard','Reports','Analytics','Role Management','Permissions','Multi Branch','Cloud Backup','Security','Audit Logs','Website Builder'] },
            ].map((group) => (
              <motion.div key={group.cat} variants={fadeUp}>
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500" />
                  {group.cat}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {group.items.map((item) => (
                    <div key={item} className="px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 text-sm font-medium text-slate-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all duration-200">
                      {item}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* COMPARISON */}
      <section className="py-24 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-slate-900">Why Institutes Choose SchoolNex</motion.h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-red-600 uppercase tracking-wider mb-4">Without SchoolNex</h3>
              {['Manual attendance on registers','Excel-based fee records','Paper report cards','No automated notifications','Manual admission process','Paper-based examinations','No parent communication app','Multiple disconnected software','No real-time analytics','Risk of data loss'].map((item) => (
                <motion.div key={item} variants={fadeUp} className="flex items-center gap-3 p-3.5 rounded-xl bg-red-50 border border-red-100">
                  <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  <span className="text-sm text-slate-700">{item}</span>
                </motion.div>
              ))}
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-4">With SchoolNex</h3>
              {['One-click digital attendance','Online fee collection & receipts','Digital report cards & transcripts','SMS & WhatsApp automation','Online admission portal','Online examination system','Parent & Teacher mobile apps','One integrated platform','Real-time dashboard & analytics','Automatic cloud backup'].map((item) => (
                <motion.div key={item} variants={fadeUp} className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-100">
                  <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                  <span className="text-sm text-slate-700">{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* WHY CHOOSE */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-slate-900">Why Choose SchoolNex?</motion.h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
            {[
              { icon: '&#9729;', title: 'Cloud Based' },
              { icon: '&#128274;', title: 'Highly Secure' },
              { icon: '&#9889;', title: 'Lightning Fast' },
              { icon: '&#128200;', title: 'Scalable' },
              { icon: '&#128241;', title: 'Mobile Apps' },
              { icon: '&#128190;', title: 'Auto Backup' },
              { icon: '&#127970;', title: 'Multi Branch' },
              { icon: '&#128101;', title: 'Role Based Access' },
              { icon: '&#128172;', title: 'WhatsApp API' },
              { icon: '&#127919;', title: 'Expert Support' },
            ].map((f) => (
              <motion.div key={f.title} variants={fadeUp} className="text-center p-5 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                <span className="text-2xl block mb-2" dangerouslySetInnerHTML={{ __html: f.icon }} />
                <p className="text-sm font-semibold text-slate-900">{f.title}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.p variants={fadeUp} className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Pricing</motion.p>
            <motion.h2 variants={fadeUp} className="mt-3 text-3xl sm:text-4xl font-bold text-slate-900">Simple, Transparent Pricing</motion.h2>
            <motion.p variants={fadeUp} className="mt-4 text-slate-600">Choose the perfect plan for your institution.</motion.p>
            <motion.div variants={fadeUp} className="mt-4 flex flex-wrap justify-center gap-4 text-xs text-slate-500">
              <span>&#10003; 7-Day Free Trial</span>
              <span>&#10003; No Credit Card Required</span>
              <span>&#10003; Cancel Anytime</span>
            </motion.div>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { name: 'Starter', price: '4,999', period: '/mo', desc: 'For small institutes up to 500 students', features: ['500 Students','5 Staff Logins','Professional Website','Basic ERP Modules','Email Support','Cloud Backup'] },
              { name: 'Professional', price: '9,999', period: '/mo', desc: 'For growing institutes up to 2000 students', popular: true, features: ['2,000 Students','Unlimited Staff','Website + SEO','All Core ERP Modules','WhatsApp + SMS','Mobile Apps','Priority Support','Multi Branch'] },
              { name: 'Enterprise', price: 'Custom', period: '', desc: 'For large organizations and universities', features: ['Unlimited Students','Unlimited Branches','Custom Domain','Dedicated Server','API Access','Custom Implementation','Dedicated Account Manager','Priority Support'] },
            ].map((plan) => (
              <motion.div key={plan.name} variants={fadeUp} className={`relative p-8 rounded-3xl border ${plan.popular ? 'border-blue-200 bg-gradient-to-b from-blue-50/50 to-white shadow-xl ring-1 ring-blue-100' : 'border-slate-200 bg-white hover:shadow-lg'} transition-all duration-300`}>
                {plan.popular && <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg">Most Popular</span>}
                <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                <p className="text-sm text-slate-500 mt-1">{plan.desc}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  {plan.price !== 'Custom' && <span className="text-lg text-slate-500">&#8377;</span>}
                  <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                  <span className="text-sm text-slate-500">{plan.period}</span>
                </div>
                <ul className="mt-8 space-y-3">
                  {plan.features.map((f) => (<li key={f} className="flex items-center gap-2.5 text-sm text-slate-600"><svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>{f}</li>))}
                </ul>
                <Link href={plan.price === 'Custom' ? 'https://wa.me/919572495969?text=Hello%20SchoolNex%20Team,%20I%20am%20interested%20in%20the%20Enterprise%20plan.%20Please%20share%20more%20details.' : '/signup'} target={plan.price === 'Custom' ? '_blank' : undefined} rel={plan.price === 'Custom' ? 'noopener noreferrer' : undefined} className={`mt-8 block text-center text-sm font-semibold py-3.5 rounded-2xl transition-all duration-300 ${plan.popular ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 hover:shadow-xl hover:-translate-y-0.5' : 'border border-slate-200 text-slate-700 hover:border-blue-300 hover:text-blue-600'}`}>
                  {plan.price === 'Custom' ? 'Contact Sales' : 'Start Free Trial'}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 bg-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-12">
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-slate-900">Frequently Asked Questions</motion.h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="space-y-3">
            {[
              ['What is SchoolNex?','SchoolNex is a complete cloud-based Education ERP platform that provides website, student management, fee collection, attendance, examinations, communication, and mobile apps for schools, colleges, and coaching institutes.'],
              ['Which types of institutes can use SchoolNex?','SchoolNex is designed for schools, colleges, universities, coaching institutes (SSC, Railway, Banking, UPSC, NEET, JEE), computer institutes, spoken English centers, and skill development institutes.'],
              ['Is there a free trial available?','Yes, we offer a 7-day free trial with full access to all features. No credit card required.'],
              ['Does SchoolNex include a website?','Yes, every subscription includes a professional, SEO-optimized, mobile-responsive website with custom domain support.'],
              ['Can parents and students access the platform?','Yes, SchoolNex includes dedicated mobile apps and web portals for parents, students, and teachers.'],
              ['Is WhatsApp integration included?','Yes, SchoolNex integrates with WhatsApp Business API for automated notifications about attendance, fees, exams, and announcements.'],
              ['Can I manage multiple branches?','Yes, the Professional and Enterprise plans support unlimited multi-branch management from a single dashboard.'],
              ['Is my data secure?','Absolutely. SchoolNex uses enterprise-grade encryption, automatic daily backups, and secure cloud infrastructure.'],
              ['Can I migrate from my current software?','Yes, our team provides data migration assistance from any existing system including Excel sheets.'],
              ['What payment methods are supported for fee collection?','SchoolNex supports UPI, credit/debit cards, net banking, wallets, and QR code payments via Razorpay integration.'],
            ].map(([q, a]) => (
              <motion.details key={q} variants={fadeUp} className="group p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors cursor-pointer">
                <summary className="flex items-center justify-between text-sm font-semibold text-slate-900 list-none">
                  {q}
                  <span className="text-slate-400 group-open:rotate-45 transition-transform text-lg">+</span>
                </summary>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">{a}</p>
              </motion.details>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent" />
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="relative mx-auto max-w-3xl px-4 text-center">
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">Ready to Digitize Your Institute?</motion.h2>
          <motion.p variants={fadeUp} className="mt-5 text-lg text-slate-300">Join 2,500+ institutes already using SchoolNex to streamline their operations.</motion.p>
          <motion.div variants={fadeUp} className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="px-8 py-4 rounded-2xl bg-white text-slate-900 font-semibold text-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">Book Free Demo</Link>
            <Link href="/contact" className="px-8 py-4 rounded-2xl border border-white/20 text-white font-semibold text-sm hover:bg-white/5 transition-all duration-300">Talk to Sales</Link>
          </motion.div>
        </motion.div>
      </section>
    </>
  );
}
