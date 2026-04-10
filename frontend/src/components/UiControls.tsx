'use client'

import { Languages, MoonStar, SunMedium } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUiPreferences } from '@/lib/ui-context'

export function UiControls() {
  const { language, setLanguage, theme, setTheme } = useUiPreferences()

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Language Toggle */}
      <div className="inline-flex items-center gap-1 rounded-full border border-slate-200/50 bg-white/80 p-1 text-xs shadow-sm shadow-slate-100 dark:border-white/10 dark:bg-white/6 dark:shadow-none">
        <span className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 dark:text-slate-300">
          <Languages className="h-4 w-4" />
        </span>
        {(['en', 'th'] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setLanguage(option)}
            className="relative h-8 min-w-[36px] cursor-pointer rounded-full px-3 font-bold uppercase transition-colors"
          >
            {language === option && (
              <motion.div
                layoutId="language-pill"
                className="absolute inset-0 bg-slate-950 dark:bg-white transition-colors duration-300"
                style={{ borderRadius: 999 }}
                transition={{ type: 'spring', bounce: 0.1, duration: 0.4 }}
              />
            )}
            <span className={`relative z-10 transition-colors duration-300 ${
              language === option
                ? 'text-white dark:text-slate-950'
                : 'text-slate-500 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white'
            }`}>
              {option}
            </span>
          </button>
        ))}
      </div>

      {/* Theme Toggle */}
      <div className="inline-flex items-center gap-1 rounded-full border border-slate-200/50 bg-white/80 p-1 text-xs shadow-sm shadow-slate-100 dark:border-white/10 dark:bg-white/6 dark:shadow-none">
        {(['dark', 'light'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTheme(t)}
            className="relative h-8 min-w-[70px] inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full px-3 font-semibold transition-colors"
          >
            {theme === t && (
              <motion.div
                layoutId="theme-pill"
                className="absolute inset-0 bg-slate-950 dark:bg-white transition-colors duration-300"
                style={{ borderRadius: 999 }}
                transition={{ type: 'spring', bounce: 0.1, duration: 0.4 }}
              />
            )}
            <div className={`relative z-10 flex items-center gap-1.5 transition-colors duration-300 ${
              theme === t
                ? 'text-white dark:text-slate-950'
                : 'text-slate-600 hover:text-slate-100 dark:text-slate-300 dark:hover:text-white'
            }`}>
              {t === 'dark' ? <MoonStar className="h-3.5 w-3.5" /> : <SunMedium className="h-3.5 w-3.5" />}
              <span className="capitalize">{t}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
