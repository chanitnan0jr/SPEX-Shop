'use client'

import { motion } from 'framer-motion'
import type { Spec } from '@/lib/api'

interface RadarChartProps {
  specs: Spec[]
  focusedModel?: string | null
}

const METRICS = [
  { key: 'price', label: 'Value' },
  { key: 'cpu', label: 'CPU' },
  { key: 'gpu', label: 'GPU' },
  { key: 'battery', label: 'Battery' },
  { key: 'storage', label: 'ROM' },
  { key: 'ram', label: 'RAM' },
]

const getScore = (spec: Spec, metric: string): number => {
  const highlights = spec.highlights
  
  switch (metric) {
    case 'price':
      const price = spec.price_thb || 30000
      return Math.max(20, 100 - (price / 80000) * 100)
    case 'cpu':
      const chipset = highlights.chipset?.toLowerCase() || ''
      if (chipset.includes('a18 pro') || chipset.includes('9400')) return 100
      if (chipset.includes('a18') || chipset.includes('gen 3')) return 98
      if (chipset.includes('a17') || chipset.includes('gen 2')) return 88
      if (chipset.includes('dimensity 9') || chipset.includes('a16')) return 82
      return 60
    case 'gpu':
      const gpu = spec.highlights.chipset?.toLowerCase() || '' // Often GPU is not a top-level highlight, derive from chipset
      if (gpu.includes('gen 3') || gpu.includes('a18 pro')) return 100
      if (gpu.includes('a18') || gpu.includes('gen 2')) return 95
      return 75
    case 'battery':
      const mah = parseInt(highlights.battery?.match(/\d+/)?.[0] || '4500')
      return Math.min(100, (mah / 5500) * 100)
    case 'storage':
      const rom = parseInt(highlights.storage?.match(/\d+/)?.[0] || '128')
      return Math.min(100, (rom / 1024) * 100 + 30)
    case 'ram':
      const ramValue = parseInt(highlights.ram?.match(/\d+/)?.[0] || '8')
      return Math.min(100, (ramValue / 24) * 100 + 40)
    default:
      return 50
  }
}

export function RadarChart({ specs, focusedModel }: RadarChartProps) {
  const size = 400
  const center = size / 2
  const radius = size * 0.4
  const angleStep = (Math.PI * 2) / METRICS.length

  const getPoints = (spec: Spec) => {
    return METRICS.map((_, i) => {
      const score = getScore(spec, METRICS[i].key)
      const r = (score / 100) * radius
      const angle = i * angleStep - Math.PI / 2
      const x = center + r * Math.cos(angle)
      const y = center + r * Math.sin(angle)
      return `${x},${y}`
    }).join(' ')
  }

  const colors = [
    { fill: 'rgba(14, 165, 233, 0.4)', stroke: '#38bdf8', glow: 'shadow-sky-500/50' }, // Sky
    { fill: 'rgba(16, 185, 129, 0.4)', stroke: '#34d399', glow: 'shadow-emerald-500/50' }, // Emerald
    { fill: 'rgba(139, 92, 246, 0.4)', stroke: '#a78bfa', glow: 'shadow-violet-500/50' }, // Violet
    { fill: 'rgba(244, 63, 94, 0.4)', stroke: '#fb7185', glow: 'shadow-rose-500/50' }, // Rose
  ]

  return (
    <div className="relative flex flex-col items-center">
      {/* Background Glow Hub */}
      <div className="absolute inset-0 flex items-center justify-center opacity-30 dark:opacity-50 pointer-events-none">
        <div className="w-1/2 aspect-square rounded-full bg-sky-500/10 blur-[100px]" />
      </div>

      <div className="text-center mb-10 px-4 relative z-10">
          <h3 className="font-heading text-lg font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600">
            Performance Architecture
          </h3>
      </div>
      
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        {/* Background Grid */}
        {[0.2, 0.4, 0.6, 0.8, 1].map((step) => (
          <polygon
            key={step}
            points={METRICS.map((_, i) => {
              const r = radius * step
              const angle = i * angleStep - Math.PI / 2
              return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`
            }).join(' ')}
            className="fill-none stroke-slate-950/20 dark:stroke-white/10"
            strokeWidth="1.5"
            strokeDasharray={step === 1 ? "0" : "4 4"}
          />
        ))}

        {/* Axis Lines */}
        {METRICS.map((_, i) => {
            const angle = i * angleStep - Math.PI / 2
            const x2 = center + radius * Math.cos(angle)
            const y2 = center + radius * Math.sin(angle)
            return (
                <line 
                    key={i}
                    x1={center} y1={center} x2={x2} y2={y2}
                    className="stroke-slate-950/30 dark:stroke-white/10"
                    strokeWidth="1.5"
                />
            )
        })}

        {/* Axis Labels */}
        {METRICS.map((metric, i) => {
          const angle = i * angleStep - Math.PI / 2
          const x = center + (radius + 28) * Math.cos(angle)
          const y = center + (radius + 28) * Math.sin(angle)
          return (
            <text
              key={metric.key}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[10px] font-black fill-slate-950 dark:fill-slate-400 uppercase tracking-widest"
            >
              {metric.label}
            </text>
          )
        })}

        {/* Data Polygons */}
        {specs.map((spec, i) => {
          const isFocused = focusedModel === spec.model
          const isAnyFocused = focusedModel !== null
          
          return (
            <motion.polygon
              key={`${spec.brand}-${spec.model}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: isAnyFocused ? (isFocused ? 1 : 0.1) : 1, 
                scale: 1,
                strokeWidth: isFocused ? 5 : 3
              }}
              points={getPoints(spec)}
              fill={colors[i % colors.length].fill}
              stroke={colors[i % colors.length].stroke}
              strokeLinejoin="round"
              transition={{ duration: 0.5, ease: "circOut" }}
              className="transition-all duration-300 pointer-events-none"
            />
          )
        })}
      </svg>
      
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-6 mt-8">
        {specs.map((spec, i) => (
          <div key={`${spec.brand}-${spec.model}`} className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full border-2 border-white dark:border-slate-800 shadow-[0_0_10px_currentColor]`} 
                 style={{ backgroundColor: colors[i % colors.length].stroke, color: colors[i % colors.length].stroke }} />
            <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{spec.model}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
