'use client'

import { CompareSection } from '@/components/CompareSection'
import { ChatPopup } from '@/components/ChatPopup'

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <CompareSection />
      </div>
    </div>
  )
}
