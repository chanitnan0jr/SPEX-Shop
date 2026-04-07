'use client'

import Link from 'next/link'
import { Bot, Sparkles } from 'lucide-react'
import { motion, useScroll, useSpring } from 'framer-motion'
import { UiControls } from './UiControls'
import { pickText } from '@/lib/i18n'
import { useUiPreferences } from '@/lib/ui-context'

export function Header() {
  const { language } = useUiPreferences()
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  })

  const { isSidebarCollapsed } = useUiPreferences()

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-[padding] duration-500 ease-in-out border-b border-slate-300/35 bg-white/60 backdrop-blur-3xl dark:border-white/5 dark:bg-slate-950/80 ${isSidebarCollapsed ? 'xl:pl-20' : 'xl:pl-64'}`}>
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative w-full h-[72px] px-6 flex items-center md:px-10"
      >
        <div className="grid grid-cols-3 items-center gap-4 relative z-10 w-full">
          {/* Left: Logo Command */}
          <div className="flex items-center gap-4 w-fit">
            <Link href="/" className="group flex items-center gap-3">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-xl transition-all group-hover:shadow-sky-500/20 dark:bg-white dark:text-slate-950"
              >
                <Sparkles className="h-5 w-5 animate-pulse" />
              </motion.div>
              <div className="hidden sm:block">
                <p className="font-heading text-xs font-black uppercase tracking-[0.25em] text-slate-950 dark:text-white leading-none">SpecBot</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {pickText(language, { en: 'AI Active', th: 'เปรียบเทียบ AI' })}
                  </p>
                </div>
              </div>
            </Link>
          </div>

          {/* Middle: Control Island */}
          <div className="flex justify-center">
            <UiControls />
          </div>

          {/* Right: Repository Command */}
          <div className="flex justify-end gap-3">
            <motion.a
              whileHover={{ x: -4 }}
              href="https://github.com/chanitnan0jr/SpecBot-"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-3 py-1.5 text-slate-500 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-950 dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
            >
              <div className="hidden lg:block text-[10px] font-black uppercase tracking-widest opacity-70">
                Source
              </div>
              <div className="h-3 w-px bg-slate-200 dark:bg-white/10 hidden lg:block" />
              <svg
                viewBox="0 0 24 24"
                className="h-4.5 w-4.5 fill-current"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
            </motion.a>
          </div>
        </div>

        {/* Scroll Progress Bar */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-sky-500 origin-left z-20"
          style={{ scaleX }}
        />
      </motion.div>
    </header>
  )
}
