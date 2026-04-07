'use client'

import { useDeferredValue, useMemo, useState } from 'react'
import { Check, Search, X } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { getModelsApi } from '@/lib/api'
import { pickText } from '@/lib/i18n'
import { useUiPreferences } from '@/lib/ui-context'

export function FilterBar({
  selectedModels,
  setSelectedModels,
}: {
  selectedModels: string[]
  setSelectedModels: (models: string[]) => void
}) {
  const { language } = useUiPreferences()
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)

  const { data: models, isLoading } = useQuery({
    queryKey: ['models'],
    queryFn: getModelsApi,
  })

  const filteredModels = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase()
    return (models ?? [])
      .filter((model) => model.toLowerCase().includes(query))
      .slice(0, 40)
  }, [deferredSearch, models])

  const toggleModel = (model: string) => {
    if (selectedModels.includes(model)) {
      setSelectedModels(selectedModels.filter((item) => item !== model))
      return
    }

    if (selectedModels.length < 4) {
      setSelectedModels([...selectedModels, model])
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold tracking-[0.16em] text-slate-400 uppercase">
            {pickText(language, { en: 'Selected models', th: 'รุ่นที่เลือก' })}
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-300">
            {pickText(language, {
              en: 'Choose up to 4 phones for side-by-side comparison.',
              th: 'เลือกรุ่นได้สูงสุด 4 รุ่น เพื่อเทียบกันแบบ side-by-side',
            })}
          </p>
        </div>
        <div className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white dark:bg-white dark:text-slate-950">
          {selectedModels.length}/4
        </div>
      </div>

      <div className="min-h-16 rounded-[1.5rem] border border-slate-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-slate-900">
        <div className="flex flex-wrap gap-2">
          {selectedModels.length === 0 ? (
            <div className="px-2 py-2 text-sm text-slate-400 dark:text-slate-500">
              {pickText(language, { en: 'No models selected yet', th: 'ยังไม่ได้เลือกรุ่น' })}
            </div>
          ) : (
            selectedModels.map((model) => (
              <button
                key={model}
                type="button"
                onClick={() => toggleModel(model)}
                className="inline-flex items-center gap-1.5 rounded-full bg-slate-950 px-3 py-2 text-xs font-semibold text-white dark:bg-white dark:text-slate-950"
              >
                {model}
                <X className="h-3.5 w-3.5" />
              </button>
            ))
          )}
        </div>
      </div>

      <div className="relative">
        <div className="flex h-14 items-center gap-3 rounded-[1.6rem] border border-slate-200 bg-white px-4 shadow-sm focus-within:border-sky-300 dark:border-white/10 dark:bg-slate-900">
          <Search className="h-4 w-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder={isLoading
              ? pickText(language, { en: 'Loading model list...', th: 'กำลังโหลดรายชื่อรุ่น...' })
              : pickText(language, { en: 'Search for a model to compare', th: 'ค้นหารุ่นที่ต้องการเปรียบเทียบ' })}
            className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {search.trim() ? (
          <div className="surface-panel hairline absolute inset-x-0 top-[4.2rem] z-20 max-h-88 overflow-y-auto rounded-[1.5rem] border p-2">
            {filteredModels.length === 0 ? (
              <div className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-300">
                {pickText(language, {
                  en: `No models matched “${search}”`,
                  th: `ไม่พบรุ่นที่ตรงกับ “${search}”`,
                })}
              </div>
            ) : (
              filteredModels.map((model) => {
                const isSelected = selectedModels.includes(model)
                const disabled = !isSelected && selectedModels.length >= 4
                return (
                  <button
                    key={model}
                    type="button"
                    onClick={() => {
                      toggleModel(model)
                      setSearch('')
                    }}
                    disabled={disabled}
                    className={`flex w-full items-center justify-between rounded-[1rem] px-4 py-3 text-left text-sm transition-colors ${
                      isSelected
                        ? 'bg-sky-50 text-sky-700 dark:bg-sky-500/14 dark:text-sky-300 cursor-pointer'
                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/6 cursor-pointer'
                    } ${disabled ? 'cursor-not-allowed opacity-40' : ''}`}
                  >
                    <span>{model}</span>
                    {isSelected ? <Check className="h-4 w-4" /> : null}
                  </button>
                )
              })
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}
