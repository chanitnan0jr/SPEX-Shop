'use client'

import { useEffect } from 'react'
import { useUiPreferences } from '@/lib/ui-context'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { ChatPopup } from '@/components/ChatPopup'
import { LivingBackground } from '@/components/LivingBackground'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isSidebarCollapsed, language } = useUiPreferences()

  useEffect(() => {
    if (language === 'en') {
      document.documentElement.classList.add('language-en')
    } else {
      document.documentElement.classList.remove('language-en')
    }
  }, [language])
  
  return (
    <div className="relative isolate min-h-screen">
      <LivingBackground />
      <Header />
      
      <div className="relative flex min-h-screen">
        <Sidebar />
        <div className={`transition-[padding] duration-300 ease-in-out flex-1 min-h-screen flex flex-col pt-[72px] ${isSidebarCollapsed ? 'xl:pl-20' : 'xl:pl-64'}`}>
          <div className="flex-1">
            {children}
          </div>
          <Footer />
        </div>
      </div>
      <ChatPopup />
    </div>
  )
}
