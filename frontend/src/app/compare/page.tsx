'use client'

import { CompareSection } from '@/components/CompareSection'
import { ChatPopup } from '@/components/ChatPopup'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

export default function ComparePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-6 pt-32 pb-12 md:pt-40 md:pb-20">
        {/* The Dedicated Spec Radar Hub */}
        <CompareSection />
      </main>

      <Footer />
      <ChatPopup />
    </div>
  )
}
