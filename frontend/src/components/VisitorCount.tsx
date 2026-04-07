'use client'

import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { Users } from 'lucide-react'
import { motion } from 'framer-motion'

interface Stats {
  total: number
  today: number
}

export function VisitorCount({ isCollapsed }: { isCollapsed: boolean }) {
  const { data, isLoading } = useQuery<Stats>({
    queryKey: ['visitor-stats'],
    queryFn: async () => {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const res = await fetch(`${baseUrl}/api/track/count`)
      if (!res.ok) throw new Error('Failed to fetch stats')
      return res.json()
    },
    refetchInterval: 30000, // Refresh every 30s
  })

  if (isLoading || !data) return null

  return (
    <div className={`mt-2 px-3 transition-opacity duration-300 ${isCollapsed ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}`}>
      <div className="flex items-center gap-3 py-2 px-1 text-slate-400">
        <Users className="h-4 w-4 shrink-0" />
        <div className="flex items-center gap-3 overflow-hidden">
          <span className="text-[10px] font-black uppercase tracking-wider whitespace-nowrap">
            Users: {data.total.toLocaleString()}
          </span>
          <span className="text-[10px] font-black text-sky-500 uppercase tracking-wider whitespace-nowrap">
            Today: +{data.today.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  )
}
