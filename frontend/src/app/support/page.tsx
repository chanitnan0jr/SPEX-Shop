'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { HelpCircle, Construction, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function SupportPage() {
  return (
    <div className="relative min-h-[calc(100vh-120px)] w-full flex items-center justify-center overflow-hidden px-6">
      {/* Architectural Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <h1 className="text-[12rem] md:text-[20rem] font-black text-slate-900/3 dark:text-white/3 tracking-tighter transition-colors uppercase">
          Support
        </h1>
      </div>

      <div className="relative z-10 text-center space-y-8 max-w-2xl px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-center">
            <div className="h-20 w-20 rounded-[2.5rem] bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <HelpCircle className="h-10 w-10 text-emerald-500" />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/5 dark:bg-white/5 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 border border-slate-200 dark:border-white/10">
              <Construction className="h-3.5 w-3.5" />
              Technical Sector Loading
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-slate-950 dark:text-white uppercase tracking-tighter leading-none">
              Link <span className="text-emerald-500">Pending</span>
            </h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              The neural support uplink is currently undergoing synchronization. Our agents will be available for direct hardware consultation shortly.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center pt-4"
        >
          <Link 
            href="/"
            className="group relative flex items-center gap-4 rounded-3xl bg-slate-950 dark:bg-white px-10 py-5 text-sm font-black uppercase tracking-widest text-white dark:text-slate-950 shadow-2xl shadow-emerald-500/10 transition-all hover:-translate-y-1 active:translate-y-0"
          >
            <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
            Return to Base
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
