'use client'

import { Database, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { isDatasetSourceUrl } from '@/lib/api'
import { pickText } from '@/lib/i18n'
import { useUiPreferences } from '@/lib/ui-context'

export function SourceCitation({ brand, model, url }: { brand: string; model: string; url: string }) {
  const { language } = useUiPreferences()
  const isDataset = isDatasetSourceUrl(url)

  if (isDataset) {
    return (
      <span className="inline-flex items-center no-underline">
        <Badge
          variant="outline"
          className="gap-1.5 border-slate-200 bg-white/85 px-3 py-1 text-[11px] font-semibold tracking-wide text-slate-600 dark:border-white/10 dark:bg-white/6 dark:text-slate-200"
        >
          <Database className="h-3 w-3" />
          {brand} {model}
          <span className="opacity-75">{pickText(language, { en: 'Dataset', th: 'Dataset' })}</span>
        </Badge>
      </span>
    )
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center no-underline transition-opacity hover:opacity-80"
    >
      <Badge
        variant="outline"
        className="gap-1.5 border-sky-200 bg-sky-50/80 px-3 py-1 text-[11px] font-semibold tracking-wide text-sky-700 dark:border-sky-400/20 dark:bg-sky-500/12 dark:text-sky-300"
      >
        {brand} {model}
        <span className="opacity-75">{pickText(language, { en: 'Source', th: 'Source' })}</span>
        <ExternalLink className="h-3 w-3" />
      </Badge>
    </a>
  )
}
