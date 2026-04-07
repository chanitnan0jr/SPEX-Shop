'use client'

import { useUiPreferences } from '@/lib/ui-context'
import { pickText } from '@/lib/i18n'

export function Footer() {
  const { language } = useUiPreferences()
  const year = new Date().getFullYear()

  return (
    <footer className="mt-16 border-t border-slate-200/80 bg-white/40 pb-12 pt-10 backdrop-blur-md dark:border-white/10 dark:bg-black/20">
      <div className="mx-auto max-w-[1440px] px-6 text-center md:px-8">
        <p className="font-heading text-sm font-extrabold tracking-[0.2em] text-slate-900 uppercase dark:text-white leading-none">SpecBot</p>
        <p className="mt-4 text-xs font-medium text-slate-500 dark:text-slate-400">
          © {year} SpecBot. {pickText(language, { 
            en: 'All rights reserved.', 
            th: 'สงวนลิขสิทธิ์ทั้งหมด' 
          })}
        </p>
        <div className="mt-6 flex justify-center gap-6 text-[11px] font-semibold tracking-[0.14em] uppercase text-slate-400 dark:text-slate-500">
          <a href="#" className="hover:text-slate-950 dark:hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-slate-950 dark:hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-slate-950 dark:hover:text-white transition-colors">Contact</a>
        </div>
      </div>
    </footer>
  )
}
