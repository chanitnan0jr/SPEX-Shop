'use client'

import { useQuery } from '@tanstack/react-query'
import { Battery, Camera, Cpu, ExternalLink, HardDrive, Smartphone } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { getOfficialImageApi, isDatasetSourceUrl, type Spec } from '@/lib/api'
import { pickText } from '@/lib/i18n'
import { useUiPreferences } from '@/lib/ui-context'

const iconMap = {
  display: Smartphone,
  chipset: Cpu,
  storage: HardDrive,
  battery: Battery,
  camera: Camera,
} as const

const labelMap = {
  display: 'Display',
  chipset: 'Chipset',
  storage: 'Memory',
  battery: 'Battery',
  camera: 'Camera',
} as const

export function SpecCard({ spec }: { spec: Spec }) {
  const { language } = useUiPreferences()
  const { data: officialImageUrl } = useQuery({
    queryKey: ['officialImage', spec.brand, spec.model],
    queryFn: () => getOfficialImageApi(spec.brand, spec.model),
    staleTime: 1000 * 60 * 60 * 24,
    retry: 1,
    enabled: !isDatasetSourceUrl(spec.source_url),
  })

  const imageUrl = officialImageUrl || spec.thumbnail_url
  const isDataset = isDatasetSourceUrl(spec.source_url)
  const releaseYear = spec.spec_sections['Dataset Info']?.['Release year']
  const summaryKeys = ['display', 'chipset', 'storage', 'battery', 'camera'] as const

  return (
    <Card className="surface-panel hairline h-full rounded-[2.5rem] border-0 bg-transparent text-slate-900 shadow-none dark:text-white">
      <CardHeader className="flex flex-col items-center gap-6 px-6 py-8 text-center bg-white/40 dark:bg-white/5 rounded-[2.5rem] mb-6 ring-1 ring-slate-200/50 dark:ring-white/10 shadow-sm backdrop-blur-sm">
        {/* Model Identifier Dropdown Mockup (Samsung Style) */}
        <div className="flex flex-col items-center w-full">
          <div className="flex items-center gap-1.5 mb-2">
             <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold tracking-widest text-slate-500 uppercase dark:bg-slate-800 dark:text-slate-400">
                {spec.brand}
             </span>
             {releaseYear && (
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{releaseYear}</span>
             )}
          </div>
          <h3 className="font-heading text-2xl font-black tracking-tight text-slate-950 dark:text-white max-w-full truncate">
            {spec.model}
          </h3>
        </div>

        {/* Product Image Stage */}
        <div className="relative aspect-square w-full max-w-[200px] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-radial-[circle_at_center,rgba(215,225,235,0.4),transparent] dark:bg-radial-[circle_at_center,rgba(255,255,255,0.05),transparent]" />
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={imageUrl} 
              alt={spec.model} 
              className="relative z-10 max-h-full max-w-full object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.1)] transition-transform hover:scale-105 duration-500" 
            />
          ) : (
            <div className="flex h-40 w-40 items-center justify-center rounded-3xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
              <Smartphone className="h-10 w-10 opacity-30" />
            </div>
          )}
        </div>

        {/* Price Tag */}
        <div className="mt-2 text-center">
          <p className="font-heading text-3xl font-black tracking-tighter text-slate-950 dark:text-white">
            {spec.price_thb ? `฿${spec.price_thb.toLocaleString('th-TH')}` : '—'}
          </p>
          <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
             {pickText(language, { en: 'Estimated price', th: 'ราคาโดยประมาณ' })}
          </p>
        </div>

        {!isDataset && (
          <a
            href={spec.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-2 text-xs font-bold text-white transition-all hover:bg-slate-800 dark:bg-white dark:text-slate-950 shadow-lg mt-2"
          >
            {pickText(language, { en: 'View More', th: 'ดูเพิ่มเติม' })}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </CardHeader>

      <CardContent className="space-y-4 px-2">
        {summaryKeys.map((key) => {
          const value =
            key === 'storage'
              ? [spec.highlights.ram ? `RAM ${spec.highlights.ram}` : null, spec.highlights.storage ? `ROM ${spec.highlights.storage}` : null]
                  .filter(Boolean)
                  .join(' · ')
              : spec.highlights[key]

          if (!value) return null

          const Icon = iconMap[key]
          return (
            <div key={key} className="flex flex-col items-center text-center p-5 rounded-[2rem] bg-white/30 dark:bg-white/5 border border-slate-100 dark:border-white/5 shadow-sm">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-md">
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase mb-1.5">{labelMap[key]}</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-snug">{value}</p>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
