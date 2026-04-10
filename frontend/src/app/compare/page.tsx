'use client'

import { motion } from 'framer-motion'
import { CompareSection } from '@/components/CompareSection'
import { ChatPopup } from '@/components/ChatPopup'

export default function ComparePage() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background text-foreground p-6 md:p-12"
    >
      <div className="max-w-7xl mx-auto">
        <CompareSection />
      </div>
    </motion.div>
  )
}
