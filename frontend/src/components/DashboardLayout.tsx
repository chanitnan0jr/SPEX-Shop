'use client'

import { useEffect } from 'react'
import { useUiPreferences } from '@/lib/ui-context'
import { Sidebar } from '@/components/Sidebar'
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
      
      <div className="relative z-10 flex min-h-screen">
        <Sidebar />
        <div className={`transition-[padding] duration-300 ease-in-out flex-1 min-h-screen flex flex-col ${isSidebarCollapsed ? 'xl:pl-20' : 'xl:pl-64'}`}>
          {children}
        </div>
      </div>
    </div>
  )
}
