'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal, Smartphone, Plus, Cpu, Battery, Camera } from 'lucide-react'
import { compareSpecsApi } from '@/lib/api'
import { pickText } from '@/lib/i18n'
import { useUiPreferences } from '@/lib/ui-context'
import { FilterBar } from '@/components/FilterBar'
import { RadarChart } from '@/components/RadarChart'
import type { Spec } from '@/lib/api'

export function CompareSection() {
  const { language } = useUiPreferences()
  const [selectedModels, setSelectedModels] = useState<string[]>([])

  const { data: specs, isLoading } = useQuery({
    queryKey: ['compare', selectedModels],
    queryFn: () => compareSpecsApi(selectedModels),
    enabled: selectedModels.length >= 1,
  })

  // Ensure exactly 4 slots
  const slots = Array(4).fill(null).map((_, i) => specs?.[i] || null)

  const removeModel = (model: string) => {
    setSelectedModels(selectedModels.filter(m => m !== model))
  }

  return (
    <section className="space-y-16 pb-20">
      {/* 1. Header & Intro */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-sky-500">
             <Terminal className="h-3 w-3" />
             System Alpha
          </div>
          <h2 className="font-heading text-4xl font-black tracking-tighter text-slate-950 dark:text-white uppercase leading-none">
            {pickText(language, { en: 'Compare Smartphones', th: 'เปรียบเทียบสมาร์ทโฟน' })}
          </h2>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            {pickText(language, { en: 'Technical Benchmarking Dashboard', th: 'แดชบอร์ดเปรียบเทียบเชิงเทคนิค' })}
          </p>
        </div>
      </div>

      {/* 2. Device Selection Grid (4 Slots) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
        {slots.map((spec, i) => (
          <div key={i} className="relative group min-h-[320px]">
            {spec ? (
              <motion.div 
                layoutId={`stage-${spec.brand}-${spec.model}`}
                className="relative flex flex-col items-center justify-between rounded-3xl border border-slate-200/50 bg-white/40 p-6 dark:border-white/5 dark:bg-white/5 backdrop-blur-xl h-full shadow-2xl overflow-hidden"
              >
                {/* Remove Button */}
                <button 
                  onClick={() => removeModel(spec.model)}
                  className="absolute top-3 right-3 h-6 w-6 flex items-center justify-center rounded-full bg-slate-950/5 text-slate-400 hover:bg-rose-500 hover:text-white transition-all z-20 cursor-pointer"
                >
                  <Plus className="h-3 w-3 rotate-45" />
                </button>

                <div className="flex flex-col items-center w-full">
                   <div className="mb-4 aspect-square w-full max-w-[140px] flex items-center justify-center relative">
                      <div className="absolute inset-0 bg-sky-500/5 blur-3xl rounded-full" />
                      {spec.thumbnail_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={spec.thumbnail_url} alt={spec.model} className="relative z-10 max-h-full max-w-full object-contain drop-shadow-2xl" />
                      )}
                   </div>
                   <div className="text-center space-y-1">
                      <p className="text-[10px] font-black text-sky-500 uppercase tracking-[0.2em]">{spec.brand}</p>
                      <h4 className="font-heading text-lg font-black text-slate-950 dark:text-white leading-tight">
                        {spec.model}
                      </h4>
                      <div className="flex items-center justify-center gap-2 mt-2">
                         <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                         <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Active</span>
                      </div>
                   </div>
                </div>
              </motion.div>
            ) : (
              <div 
                className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200/50 bg-slate-50/50 dark:border-white/5 dark:bg-white/2 py-12 px-6 h-full text-center transition-all hover:border-sky-500/50 hover:bg-sky-500/2 cursor-pointer"
              >
                <div className="h-12 w-12 rounded-2xl bg-white dark:bg-slate-950/40 border border-slate-200/50 dark:border-white/10 flex items-center justify-center mb-4 text-slate-400">
                  <Plus className="h-5 w-5" />
                </div>
                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  {pickText(language, { en: 'Add Device', th: 'เพิ่มอุปกรณ์' })}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 3. Search Command Bar */}
      <div className="max-w-xl mx-auto px-4">
        <div className="relative group">
           <FilterBar selectedModels={selectedModels} setSelectedModels={setSelectedModels} />
        </div>
      </div>

      {/* 4. Comparison Table (Technical Specs) */}
      <AnimatePresence>
        {specs && specs.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12 px-4"
          >
            {/* The Table Shell */}
            <div className="rounded-[2.5rem] border border-slate-200/50 bg-white/40 dark:border-white/5 dark:bg-white/5 backdrop-blur-3xl shadow-3xl max-h-[80vh] overflow-auto scrollbar-hide">
               <div className="min-w-[900px]">
                 {/* Sticky Header Row */}
                 <div className="sticky top-0 z-40 grid grid-cols-[minmax(140px,1.2fr)_repeat(4,1fr)] items-center p-6 border-b border-slate-200/50 dark:border-white/5 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-3xl shadow-sm">
                    <div className="sticky left-0 z-50 bg-inherit text-[11px] font-black text-slate-950 dark:text-white uppercase tracking-[0.2em]">Technical Specs</div>
                    {slots.map((spec, i) => (
                      <div key={i} className="text-[10px] font-black text-center text-slate-950 dark:text-white uppercase tracking-widest px-2 truncate border-l border-slate-200/30 dark:border-white/5 h-full flex items-center justify-center">
                        {spec?.model || '—'}
                      </div>
                    ))}
                 </div>

                <div className="divide-y divide-slate-200/50 dark:divide-white/5">
                  {/* GENERAL INFO */}
                  <SpecSection 
                    icon={Terminal} 
                    title="General Information" 
                    rows={[
                      { label: 'Price (THB)', key: 'price_thb', isCurrency: true },
                      { label: 'Release Year', section: 'Dataset Info', key: 'Release year' },
                      { label: 'Operating System', key: 'os' },
                    ]} 
                    slots={slots}
                  />
                  {/* DISPLAY SECTION */}
                  <SpecSection 
                    icon={Smartphone} 
                    title="Display Settings" 
                    rows={[
                      { label: 'Panel Type', key: 'display' },
                      { label: 'Screen Size', section: 'Display', key: 'Screen size' },
                      { label: 'Refresh Rate', section: 'Display', key: 'Refresh rate' },
                    ]} 
                    slots={slots}
                  />
                  {/* PROCESSOR SECTION */}
                  <SpecSection 
                    icon={Cpu} 
                    title="Processing Module" 
                    rows={[
                      { label: 'Chipset', key: 'chipset' },
                      { label: 'GPU', section: 'Performance', key: 'GPU' },
                      { label: 'RAM Capacity', key: 'ram' },
                      { label: 'Storage Capacity', key: 'storage' },
                    ]} 
                    slots={slots}
                  />
                  {/* CAMERA SECTION */}
                  <SpecSection 
                    icon={Camera} 
                    title="Optics & Sensors" 
                    rows={[
                      { label: 'Main Resolution', key: 'camera' },
                      { label: 'Rear Details', section: 'Camera', key: 'Rear camera' },
                      { label: 'Front Details', section: 'Camera', key: 'Front camera' },
                    ]} 
                    slots={slots}
                  />
                  {/* BATTERY SECTION */}
                  <SpecSection 
                    icon={Battery} 
                    title="Energy & Power" 
                    rows={[
                      { label: 'Battery Capacity', key: 'battery' },
                      { label: 'Fast Charging', section: 'Battery', key: 'Fast charging' },
                    ]} 
                    slots={slots}
                  />
                  {/* CONNECTIVITY SECTION */}
                  <SpecSection 
                    icon={Plus} 
                    title="Connectivity" 
                    rows={[
                      { label: 'Network Support', section: 'Connectivity', key: 'Network' },
                      { label: 'Dual SIM', section: 'Connectivity', key: 'Dual SIM' },
                      { label: 'Bluetooth', section: 'Connectivity', key: 'Bluetooth' },
                      { label: 'Wi-Fi', section: 'Connectivity', key: 'Wi-Fi' },
                      { label: 'USB Type', section: 'Connectivity', key: 'USB' },
                    ]} 
                    slots={slots}
                  />
                  {/* BUILD SECTION */}
                  <SpecSection 
                    icon={Smartphone} 
                    title="Build & Design" 
                    rows={[
                      { label: 'Weight', section: 'Build', key: 'Weight' },
                      { label: 'Thickness', section: 'Build', key: 'Thickness' },
                      { label: 'Body Material', section: 'Build', key: 'Body material' },
                      { label: 'Biometrics', section: 'Build', key: 'Fingerprint sensor' },
                    ]} 
                    slots={slots}
                  />
                </div>
              </div>
            </div>

            {/* 5. Performance Radar Chart */}
            <div className="pt-8 flex justify-center">
               <div className="w-full max-w-4xl rounded-[2.5rem] border border-slate-200/50 bg-slate-100/50 dark:border-white/5 dark:bg-white/2 p-12 shadow-inner">
                  <RadarChart specs={specs} />
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

function SpecSection({ icon: Icon, title, rows, slots }: { icon: any, title: string, rows: any[], slots: (Spec | null)[] }) {
  return (
    <div className="group/section">
      <div className="sticky left-0 z-30 bg-inherit border-b border-slate-200/50 dark:border-white/5 px-6 py-4 flex items-center gap-3">
         <div className="h-6 w-6 rounded-lg bg-slate-950 dark:bg-white flex items-center justify-center text-white dark:text-slate-950 shadow-md">
            <Icon className="h-3.5 w-3.5" />
         </div>
         <h5 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{title}</h5>
      </div>
      {rows.map((row: any) => (
        <div key={row.label} className="grid grid-cols-[minmax(140px,1.2fr)_repeat(4,1fr)] items-center px-6 py-5 border-b last:border-b-0 border-slate-200/30 dark:border-white/2 hover:bg-sky-500/5 transition-colors group/row cursor-pointer">
          <div className="sticky left-0 z-20 bg-transparent group-hover/row:bg-slate-500/1 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest pr-4">{row.label}</div>
          {slots.map((spec: Spec | null, i: number) => {
            let value: any = '—'
            if (spec) {
              if (row.section) {
                value = (spec.spec_sections as any)?.[row.section]?.[row.key] || '—'
              } else {
                value = (spec.highlights as any)[row.key] || (spec as any)[row.key] || '—'
              }

              if (row.isCurrency && value !== '—' && !isNaN(Number(value))) {
                const numericValue = row.multiplier ? Number(value) * row.multiplier : Number(value)
                value = new Intl.NumberFormat('th-TH', { 
                  style: 'currency', 
                  currency: 'THB', 
                  maximumFractionDigits: 0 
                }).format(numericValue)
              }
            }
            return (
              <div key={i} className="text-[11px] font-semibold text-center text-slate-900 dark:text-slate-200 px-4 leading-relaxed border-l border-slate-200/30 dark:border-white/5 h-full flex flex-col justify-center min-h-[40px]">
                {value}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
