'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="relative min-h-[calc(100vh-72px)] w-full flex items-center justify-center overflow-hidden px-6">
      {/* Massive Architectural 404 Watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <h1 className="text-[20rem] md:text-[32rem] font-black text-slate-200/40 dark:text-white/3 tracking-tighter">
          404
        </h1>
      </div>

      <div className="relative z-10 text-center space-y-8 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h2 className="text-4xl md:text-6xl font-black text-slate-950 dark:text-white uppercase tracking-tighter leading-none">
            You&apos;re in <span className="text-sky-500">uncharted</span> territory!
          </h2>
          <p className="text-lg font-medium text-slate-500 dark:text-slate-400">
            Looks like you took a wrong turn into a non-existent sector. But don&apos;t worry, even the best tech explorers get lost sometimes.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap items-center justify-center gap-4 pt-4"
        >
          <Link 
            href="/"
            className="group relative flex items-center gap-4 rounded-3xl bg-slate-950 dark:bg-white px-10 py-5 text-sm font-black uppercase tracking-widest text-white dark:text-slate-950 shadow-2xl shadow-sky-500/20 transition-all hover:-translate-y-1 active:translate-y-0"
          >
            <Home className="h-5 w-5" />
            Return home
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
