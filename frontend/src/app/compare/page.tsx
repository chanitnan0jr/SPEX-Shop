'use client'

import { motion } from 'framer-motion'
import { CompareSection } from '@/components/CompareSection'
import { ChatPopup } from '@/components/ChatPopup'

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-transparent text-foreground p-8 lg:p-12">
      <div className="max-w-7xl mx-auto">
        <CompareSection />
      </div>
    </div>
  )
}
