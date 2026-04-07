'use client'

import { Languages, MoonStar, SunMedium } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUiPreferences } from '@/lib/ui-context'

export function UiControls() {
  const { language, setLanguage, theme, setTheme } = useUiPreferences()

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="inline-flex items-center gap-1 rounded-full border border-slate-200/50 bg-white/80 p-1 text-xs shadow-sm shadow-slate-100 dark:border-white/10 dark:bg-white/6 dark:shadow-none">
        <span className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 dark:text-slate-300">
          <Languages className="h-4 w-4" />
        </span>
        {(['en', 'th'] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setLanguage(option)}
            className="relative cursor-pointer rounded-full px-3 py-1.5 font-bold uppercase transition-colors"
          >
            <AnimatePresence mode="wait">
              {language === option && (
                <motion.div
                  layoutId="language-pill"
                  className="absolute inset-0 bg-slate-950 dark:bg-white rounded-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
                />
              )}
            </AnimatePresence>
            <span className={`relative z-10 ${
              language === option
                ? 'text-white dark:text-slate-950'
                : 'text-slate-500 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white'
            }`}>
              {option}
            </span>
          </button>
        ))}
      </div>

      <div className="inline-flex items-center gap-1 rounded-full border border-slate-200/50 bg-white/80 p-1 text-xs shadow-sm shadow-slate-100 dark:border-white/10 dark:bg-white/6 dark:shadow-none">
        <button
          type="button"
          onClick={() => setTheme('dark')}
          className="relative inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 font-semibold transition-colors"
        >
          {theme === 'dark' && (
            <motion.div
              layoutId="theme-pill"
              className="absolute inset-0 bg-slate-950 dark:bg-white rounded-full"
              transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
            />
          )}
          <div className={`relative z-10 flex items-center gap-1.5 ${
            theme === 'dark'
              ? 'text-white dark:text-slate-950'
              : 'text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white'
          }`}>
            <MoonStar className="h-3.5 w-3.5" />
            Dark
          </div>
        </button>
        <button
          type="button"
          onClick={() => setTheme('light')}
          className="relative inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 font-semibold transition-colors"
        >
          {theme === 'light' && (
            <motion.div
              layoutId="theme-pill"
              className="absolute inset-0 bg-slate-950 dark:bg-white rounded-full"
              transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
            />
          )}
          <div className={`relative z-10 flex items-center gap-1.5 ${
            theme === 'light'
              ? 'text-white dark:text-slate-950'
              : 'text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white'
          }`}>
            <SunMedium className="h-3.5 w-3.5" />
            Light
          </div>
        </button>
      </div>
    </div>
  )
}
