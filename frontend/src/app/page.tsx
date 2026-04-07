'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Sparkles, ArrowRight, Zap, Target, BarChart3, Database, ShieldCheck, ArrowLeftRight, BrainCircuit, CheckCircle, Smartphone, Terminal, Globe, Mail, Phone, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { ChatPopup } from '@/components/ChatPopup'
import { pickText } from '@/lib/i18n'
import { useUiPreferences } from '@/lib/ui-context'
import { RadarChart } from '@/components/RadarChart'
import { compareSpecsApi, type Spec } from '@/lib/api'

const LANDING_SPECIMENS: Spec[] = [
  {
    brand: 'Apple',
    model: 'iPhone 15 Pro',
    category: 'smartphone',
    price_thb: 41900,
    source_url: '',
    thumbnail_url: null,
    source: { site: 'apple', slug: 'iphone-15-pro' },
    highlights: {
      display: '6.1" OLED 120Hz',
      chipset: 'Apple A17 Pro',
      ram: '8GB',
      storage: '256GB',
      camera: '48MP Main',
      battery: '3274mAh'
    },
    spec_sections: {},
    search_text: '',
    scraped_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    brand: 'Samsung',
    model: 'Galaxy S24 Ultra',
    category: 'smartphone',
    price_thb: 46900,
    source_url: '',
    thumbnail_url: null,
    source: { site: 'samsung', slug: 's24-ultra' },
    highlights: {
      display: '6.8" AMOLED 120Hz',
      chipset: 'Snapdragon 8 Gen 3',
      ram: '12GB',
      storage: '512GB',
      camera: '200MP Main',
      battery: '5000mAh'
    },
    spec_sections: {},
    search_text: '',
    scraped_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

export default function Home() {
  const { language } = useUiPreferences()
  const [specs, setSpecs] = useState<Spec[]>(LANDING_SPECIMENS)
  const [isSyncing, setIsSyncing] = useState(true)

  useEffect(() => {
    const syncBenchmarks = async () => {
      try {
        // Fetch real flagship data for the live benchmarking dashboard
        const liveSpecs = await compareSpecsApi(['iPhone 15 Pro', 'Galaxy S24 Ultra'])
        if (liveSpecs && liveSpecs.length >= 2) {
          setSpecs(liveSpecs)
        }
      } catch (err) {
        console.error('Benchmarking Sync Failed:', err)
      } finally {
        setIsSyncing(false)
      }
    }
    syncBenchmarks()
  }, [])

  return (
    <div className="flex min-h-screen flex-col overflow-hidden">
      <Header />

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-6 pt-32 pb-12 md:pt-40 md:pb-32 space-y-24">
        {/* 1. Luminary Hero Block */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-[3.5rem] border border-slate-300/40 dark:border-white/5 bg-linear-to-br from-white/90 via-white/50 to-sky-50/30 dark:from-white/5 dark:via-white/2 dark:to-transparent backdrop-blur-4xl overflow-hidden p-12 md:px-24 md:py-32 shadow-2xl shadow-slate-200/50 dark:shadow-none"
        >
          {/* Decorative Hero Elements */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.05] dark:opacity-[0.08]" 
               style={{ backgroundImage: 'radial-gradient(#0ea5e9 0.8px, transparent 0.8px)', backgroundSize: '32px 32px' }} />
          <div className="absolute inset-x-0 bottom-0 h-64 bg-linear-to-t from-sky-100/20 dark:from-sky-500/5 to-transparent pointer-events-none" />

          <section className="relative z-10 text-center space-y-10 max-w-4xl mx-auto">
            {/* Dynamic Badges */}
            <div className="inline-flex flex-wrap items-center justify-center gap-4">
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 rounded-full bg-sky-50 dark:bg-sky-500/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-500/20"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {pickText(language, { en: 'Illuminate Decisions', th: 'เปรียบเทียบอย่างชาญฉลาด' })}
              </motion.div>
              <motion.div 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-500/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {pickText(language, { en: 'Empowering Choice with Data', th: 'ขับเคลื่อนการตัดสินใจด้วยข้อมูล' })}
              </motion.div>
            </div>

            {/* Main Headline */}
            <div className="space-y-6">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-heading text-6xl md:text-[92px] font-black text-slate-950 dark:text-white tracking-tighter leading-[0.85] uppercase"
              >
                {pickText(language, { en: 'Illuminate Your', th: 'สว่างชัดทุก' })}<br />
                <span className="text-transparent bg-clip-text bg-linear-to-r from-sky-600 to-emerald-500 animate-gradient-x">
                  {pickText(language, { en: 'Tech Decisions', th: 'การตัดสินใจเทคโนโลยี' })}
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-lg md:text-xl font-medium text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed"
              >
                {pickText(language, {
                  en: 'Exhaustive smartphone comparisons with AI-powered insights and verified hardware benchmarks. Find your next device with professional-grade clarity.',
                  th: 'แพลตฟอร์มการเปรียบเทียบสมาร์ทโฟนระดับมืออาชีพที่ผสาน AI และข้อมูลทางเทคนิคที่ผ่านการตรวจสอบแล้ว เพื่อความแม่นยำในการเลือกอุปกรณ์ที่ตรงใจคุณ',
                })}
              </motion.p>
            </div>

            {/* Hero CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap items-center justify-center gap-6 pt-4"
            >
              <Link
                href="/compare"
                className="group relative flex items-center gap-4 rounded-3xl bg-slate-950 dark:bg-white px-10 py-5 text-sm font-black uppercase tracking-widest text-white dark:text-slate-950 shadow-2xl shadow-sky-500/30 transition-all hover:-translate-y-1 active:translate-y-0"
              >
                {pickText(language, { en: 'Start Comparing', th: 'เริ่มเปรียบเทียบ' })}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>

              <Link 
                href="https://localhost-v1.vercel.app/projects" 
                target="_blank"
                className="px-10 py-5 rounded-3xl border border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 text-sm font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 backdrop-blur-xl transition-all hover:bg-slate-50 dark:hover:bg-white/10"
              >
                {pickText(language, { en: 'Visit Portfolio', th: 'ดูผลงานของฉัน' })}
              </Link>
            </motion.div>

            {/* Quick Stats Overlay */}
            <div className="pt-16 grid grid-cols-2 md:grid-cols-4 gap-12 border-t border-slate-200/50 dark:border-white/10">
               <Stat label="DEVICES" value="1,500+" />
               <Stat label="BRANDS" value="250+" />
               <Stat label="BENCHMARKS" value="10k+" />
               <Stat label="ACCURACY" value="100%" subtext="AI ไม่หลอน 100% มั้ง" />
            </div>
          </section>
        </motion.div>

        {/* 2. Precision Engineering (Bento Grid) */}
        <section className="space-y-12">
          <div className="text-center space-y-4">
            <h2 className="font-heading text-4xl font-black text-slate-950 dark:text-white uppercase tracking-tighter">
              {pickText(language, { en: 'Precision Engineering', th: 'วิศวกรรมข้อมูลแม่นยำ' })}
            </h2>
            <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">
              {pickText(language, { en: 'The three pillars of Spec Core architecture', th: '3 เสาหลักของสถาปัตยกรรมข้อมูล SpecBot' })}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard 
              icon={ShieldCheck} 
              title={pickText(language, { en: 'Verified Data', th: 'ข้อมูลที่ตรวจสอบแล้ว' })} 
              desc={pickText(language, { en: 'Cross-referenced with manufacturer whitepapers and lab tests for 100% accuracy.', th: 'อ้างอิงจาก Whitepapers ชุดทดสอบจริง เพื่อความแม่นยำ 100%' })}
            />
            <FeatureCard 
              icon={ArrowLeftRight} 
              title={pickText(language, { en: 'Side-by-Side Analysis', th: 'การวิเคราะห์เชิงเปรียบเทียบ' })} 
              desc={pickText(language, { en: 'Our intuitive UI highlights disparities instantly, pinpointing microscopic hardware gaps.', th: 'หน้าจอเปรียบเทียบที่เน้นความแตกต่างทันที เห็นชัดถึงทุกมิติฮาร์ดแวร์' })}
              featured
            />
            <FeatureCard 
              icon={BrainCircuit} 
              title={pickText(language, { en: 'AI Performance Scores', th: 'ผลทดสอบโดย AI' })} 
              desc={pickText(language, { en: 'Proprietary algorithms synthesize thousands of benchmarks into a single efficiency rating.', th: 'อัลกอริทึมเฉพาะตัวที่สังเคราะห์ข้อมูลการทดสอบเป็นคะแนนประสิทธิภาพเดียว' })}
            />
          </div>
        </section>

        {/* 3. Radar Architecture Section */}
        <section className="relative rounded-[3.5rem] border border-slate-300/40 dark:border-white/5 bg-linear-to-br from-white via-slate-50/50 to-white dark:from-white/5 dark:via-white/2 dark:to-transparent backdrop-blur-4xl p-12 md:p-24 overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-transparent via-sky-500/20 to-transparent" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1 space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-sky-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-sky-500 border border-sky-500/20">
                {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <BarChart3 className="h-4 w-4" />}
                {isSyncing ? 'Synchronizing Hardware...' : 'Architecture Framework'}
              </div>
              <h2 className="font-heading text-4xl font-black text-slate-950 dark:text-white uppercase tracking-tighter">
                {pickText(language, { en: 'Radar Fingerprint', th: 'ข้อมูลอัตลักษณ์ประสิทธิภาพ' })}
              </h2>
              <p className="text-lg font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                {pickText(language, { 
                  en: 'Our advanced engine maps raw hardware specs across six critical performance vectors, providing a normalized technical fingerprint of any device.',
                  th: 'ระบบประมวลผลขั้นสูงของเราแปลงข้อมูลฮาร์ดแวร์ดิบเป็นมิติประสิทธิภาพ 6 ด้าน เพื่อระบุอัตลักษณ์ทางเทคนิคของทุกอุปกรณ์ได้อย่างรวดเร็ว' 
                })}
              </p>
              
              <div className="grid grid-cols-2 gap-8 pt-4">
                {[
                  { l: 'CPU Density', v: '98th %' },
                  { l: 'Storage Arch', v: 'UFS 4.0' },
                  { l: 'Energy Flux', v: 'Optimum' },
                  { l: 'Memory Band', v: '8.5GB/s' },
                ].map((s, i) => (
                  <div key={i} className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.l}</p>
                    <p className="text-xl font-black text-slate-950 dark:text-white uppercase tracking-tighter">{s.v}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 w-full bg-slate-950/2 dark:bg-white/2 rounded-[3.5rem] p-12 border border-slate-200 dark:border-white/5">
              <RadarChart specs={specs} />
            </div>
          </div>
        </section>

        {/* 4. Trending Showdowns */}
        <section className="space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
            <div className="space-y-2">
              <h2 className="font-heading text-4xl font-black text-slate-950 dark:text-white uppercase tracking-tighter">
                {pickText(language, { en: 'Trending Showdowns', th: 'การเปรียบเทียบยอดนิยม' })}
              </h2>
              <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                {pickText(language, { en: 'Real-time data on active flagship clashes', th: 'ข้อมูลสดจากคู่ชกสมาร์ทโฟนที่คนให้ความสนใจสูงสุด' })}
              </p>
            </div>
            <Link href="/compare" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-sky-500 hover:text-sky-600 transition-colors">
              View All Analysis <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <ShowdownCard 
                label="Flagship Clash" 
                left={{ name: 'iPhone 15 Pro', img: '/devices/unnamed-removebg-preview.png' }}
                right={{ name: 'S24 Ultra', img: '/devices/unnamed-removebg-preview(1).png' }}
                stats="+8,492 ANALYSES"
             />
             <ShowdownCard 
                label="Photography War" 
                left={{ name: 'Pixel 8 Pro', img: '/devices/unnamed-removebg-preview(2).png' }}
                right={{ name: 'Xiaomi 14 Ultra', img: '/devices/unnamed-removebg-preview(3).png' }}
                stats="+5,120 ANALYSES"
             />
             <ShowdownCard 
                label="Compact Battle" 
                left={{ name: 'iPhone 15', img: '/devices/unnamed-removebg-preview(4).png' }}
                right={{ name: 'Galaxy S24', img: '/devices/unnamed-removebg-preview(5).png' }}
                stats="+4,881 ANALYSES"
             />
          </div>
        </section>

        {/* 5. Internship & Collaboration CTA */}
        <section className="relative rounded-[3.5rem] border border-sky-500/10 dark:border-white/5 bg-sky-50/50 dark:bg-slate-950 p-12 md:p-24 overflow-hidden backdrop-blur-3xl shadow-2xl shadow-sky-500/5 dark:shadow-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-sky-500/8 dark:bg-sky-500/10 rounded-full blur-[120px] -mr-64 -mt-64" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/8 dark:bg-emerald-500/10 rounded-full blur-[120px] -ml-64 -mb-64" />
          
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 items-center gap-12 md:gap-24">
            <div className="space-y-8 text-center md:text-left">
              <div className="space-y-4">
                <h2 className="font-heading text-4xl md:text-7xl font-black text-slate-950 dark:text-white uppercase tracking-tighter leading-[0.85]">
                  {pickText(language, { en: 'Open for Internship 2026', th: 'เปิดรับฝึกงาน 2026' })}
                </h2>
                <p className="text-xl md:text-2xl font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest">
                  {pickText(language, { en: 'Ready to Collaborate?', th: 'พร้อมสำหรับการร่วมงาน' })}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-8 pt-4">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-500">
                  <CheckCircle className="h-4 w-4" /> AVAILABLE FOR REMOTE
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-sky-600 dark:text-sky-500">
                  <CheckCircle className="h-4 w-4" /> FULL-STACK PROFICIENCY
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6 w-full max-w-md mx-auto md:ml-auto md:mr-0">
              <a 
                href="mailto:Ch4n1tnan@gmail.com" 
                className="group flex items-center gap-6 rounded-3xl border border-sky-500/10 dark:border-white/10 bg-white dark:bg-white/5 p-8 text-slate-950 dark:text-white transition-all hover:bg-slate-950 dark:hover:bg-white hover:text-white dark:hover:text-slate-950 hover:translate-x-2 shadow-xl shadow-sky-500/5 dark:shadow-none"
              >
                <div className="h-12 w-12 rounded-2xl bg-sky-500 flex items-center justify-center group-hover:bg-sky-600">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-black uppercase tracking-widest opacity-50 mb-1">Email</p>
                  <p className="text-lg font-black tracking-tight">Ch4n1tnan@gmail.com</p>
                </div>
              </a>

              <a 
                href="tel:0613905655" 
                className="group flex items-center gap-6 rounded-3xl border border-sky-500/10 dark:border-white/10 bg-white dark:bg-white/5 p-8 text-slate-950 dark:text-white transition-all hover:bg-slate-950 dark:hover:bg-white hover:text-white dark:hover:text-slate-950 hover:translate-x-2 shadow-xl shadow-sky-500/5 dark:shadow-none"
              >
                <div className="h-12 w-12 rounded-2xl bg-sky-500 flex items-center justify-center group-hover:bg-sky-600">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-black uppercase tracking-widest opacity-50 mb-1">Call</p>
                  <p className="text-lg font-black tracking-tight">061-390-5655</p>
                </div>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <ChatPopup />
    </div>
  )
}

function Stat({ label, value, subtext }: { label: string, value: string, subtext?: string }) {
  return (
    <div className="space-y-1 text-center md:text-left group">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 transition-colors group-hover:text-sky-500">{label}</p>
      <p className="font-heading text-3xl font-black text-slate-950 dark:text-white leading-none tracking-tighter">{value}</p>
      {subtext && (
        <p className="stat-subtext text-[9px] font-bold text-slate-400 dark:text-slate-500 italic tracking-wider group-hover:text-sky-500/50 transition-colors uppercase mt-0.5">
          {subtext}
        </p>
      )}
    </div>
  )
}

function FeatureCard({ icon: Icon, title, desc, featured = false }: { icon: any, title: string, desc: string, featured?: boolean }) {
  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className={`relative p-10 rounded-[3.5rem] border transition-all duration-500 overflow-hidden ${
        featured 
          ? 'bg-white dark:bg-sky-500/5 text-slate-950 dark:text-white border-sky-500/50 dark:border-sky-500/30 shadow-2xl shadow-sky-500/15 dark:shadow-none' 
          : 'bg-white/50 dark:bg-white/2 border-slate-200 dark:border-white/5 backdrop-blur-3xl hover:border-sky-500/30 shadow-sm'
      }`}
    >
      {/* Featured Background Glow */}
      {featured && (
        <>
          <div className="absolute inset-x-0 -top-px h-px bg-linear-to-r from-transparent via-sky-500 to-transparent" />
          <div className="absolute inset-0 bg-linear-to-b from-sky-50/50 to-transparent dark:from-sky-500/3 pointer-events-none" />
        </>
      )}
      
      <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-10 shadow-xl ${
        featured ? 'bg-sky-500 text-white' : 'bg-slate-950 dark:bg-white text-white dark:text-slate-950'
      }`}>
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-xl font-black uppercase tracking-tight mb-4">{title}</h3>
      <p className={`text-sm font-medium leading-relaxed uppercase tracking-widest opacity-80 ${
        featured ? 'text-slate-600 dark:text-sky-100/60' : 'text-slate-500 dark:text-slate-400'
      }`}>
        {desc}
      </p>
      <div className={`mt-10 h-1.5 w-12 rounded-full ${featured ? 'bg-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.5)]' : 'bg-slate-200 dark:bg-white/10'}`} />
    </motion.div>
  )
}

function ShowdownCard({ label, left, right, stats }: { label: string, left: any, right: any, stats: string }) {
  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className="group relative rounded-[3.5rem] border border-slate-200 dark:border-white/5 bg-white/50 dark:bg-white/2 backdrop-blur-3xl overflow-hidden shadow-xl shadow-slate-200/50 dark:shadow-none hover:shadow-2xl hover:shadow-sky-500/10 transition-all duration-500"
    >
      <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/2">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-500">{label}</span>
        <span className="text-[10px] font-bold text-slate-400">DATA V12.4</span>
      </div>
      
      <div className="p-10 flex items-center justify-between gap-4">
        <div className="flex-1 text-center space-y-4">
          <motion.img 
            whileHover={{ scale: 1.15, rotate: -5 }}
            src={left.img} 
            className="h-32 object-contain mx-auto transition-transform"
            alt={left.name}
          />
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-950 dark:text-white">{left.name}</p>
        </div>
        
        <div className="relative">
          <div className="h-20 w-px bg-slate-200 dark:bg-white/10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-950 text-white dark:bg-white dark:text-slate-950 flex items-center justify-center text-[10px] font-black italic shadow-xl">VS</div>
        </div>

        <div className="flex-1 text-center space-y-4">
          <motion.img 
            whileHover={{ scale: 1.15, rotate: 5 }}
            src={right.img} 
            className="h-32 object-contain mx-auto transition-transform"
            alt={right.name}
          />
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-950 dark:text-white">{right.name}</p>
        </div>
      </div>

      <div className="px-8 pb-8 flex justify-center">
        <div className="bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 text-[10px] px-4 py-2 rounded-full font-black tracking-widest shadow-inner">
          {stats}
        </div>
      </div>
    </motion.div>
  )
}
