'use client'

import { useState } from 'react'
import { MessagesSquare, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChatBox } from './ChatBox'
import { Button } from './ui/button'

export function ChatPopup() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
            className="mb-6 w-[min(440px,calc(100vw-3rem))] max-h-[min(740px,82vh)] shadow-[0_32px_80px_rgba(0,0,0,0.18)] dark:shadow-[0_32px_80px_rgba(0,0,0,0.48)] rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-white/10 flex flex-col"
          >
            <div className="relative flex-1 overflow-hidden flex flex-col">
              <ChatBox />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative group">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.92 }}
          className="relative flex cursor-pointer h-16 w-16 items-center justify-center rounded-full bg-slate-950 shadow-xl text-white dark:bg-white dark:text-slate-950"
        >
          <MessagesSquare className="h-7 w-7" />
        </motion.button>
      </div>
    </div>
  )
}
