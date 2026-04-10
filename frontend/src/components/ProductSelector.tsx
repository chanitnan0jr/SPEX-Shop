'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Smartphone, ShoppingBag, Loader2 } from 'lucide-react'
import { getProductsApi } from '@/lib/api'
import { pickText } from '@/lib/i18n'
import { useUiPreferences } from '@/lib/ui-context'

interface ProductSelectorProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (model: string) => void
  title?: string
}

export function ProductSelector({ isOpen, onClose, onSelect, title }: ProductSelectorProps) {
  const { language } = useUiPreferences()
  const [searchQuery, setSearchQuery] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['selector-products'],
    queryFn: () => getProductsApi({ limit: 100 }),
    enabled: isOpen,
  })

  const filteredProducts = data?.products.filter(p => 
    p.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-100 bg-slate-950/60 backdrop-blur-xl"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-101 flex items-center justify-center pointer-events-none p-4 md:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="pointer-events-auto relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-[2.5rem] border border-white/10 bg-slate-900/90 shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="relative p-6 border-b border-white/5 bg-white/2">
                <div className="flex items-center justify-between mb-4">
                  <div className="space-y-1">
                    <h3 className="font-heading text-xl font-black text-white uppercase tracking-tight">
                      {title || pickText(language, { en: 'Select Device', th: 'เลือกอุปกรณ์' })}
                    </h3>
                    <p className="text-[10px] font-bold text-sky-500 uppercase tracking-widest">
                      Hardware Database v2.4
                    </p>
                  </div>
                  <button 
                    onClick={onClose}
                    className="h-10 w-10 flex items-center justify-center rounded-full bg-white/5 text-slate-400 hover:bg-rose-500 hover:text-white transition-all cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Search Bar */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-sky-500/10 blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                  <div className="relative flex items-center bg-slate-950/50 border border-white/5 rounded-2xl p-1 focus-within:border-sky-500/50 transition-all">
                    <div className="flex h-10 w-10 items-center justify-center text-slate-500">
                      <Search className="h-4 w-4" />
                    </div>
                    <input
                      autoFocus
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={pickText(language, { en: 'Filter by model or brand...', th: 'ค้นหาตามรุ่นหรือแบรนด์...' })}
                      className="flex-1 bg-transparent px-2 text-sm font-bold text-white placeholder:text-slate-600 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-500">
                    <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">Syncing Neural Database...</p>
                  </div>
                ) : filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredProducts.map((p) => (
                      <button
                        key={p._id}
                        onClick={() => {
                          onSelect(p.model)
                          onClose()
                        }}
                        className="group relative flex items-center gap-4 p-3 rounded-2xl bg-white/2 border border-white/5 hover:bg-sky-500/10 hover:border-sky-500/30 transition-all text-left cursor-pointer"
                      >
                        <div className="relative h-14 w-14 shrink-0 flex items-center justify-center rounded-xl bg-slate-950/50 group-hover:bg-slate-950 transition-colors">
                          <div className="absolute inset-0 bg-sky-500/5 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                          {p.thumbnail_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.thumbnail_url} alt={p.model} className="relative z-10 max-h-full max-w-full object-contain" />
                          ) : (
                            <Smartphone className="relative z-10 h-6 w-6 text-slate-700" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-black text-sky-500 uppercase tracking-widest leading-none mb-1">{p.brand}</p>
                          <h4 className="font-heading text-sm font-black text-white truncate">{p.model}</h4>
                          <p className="text-[10px] font-bold text-slate-500 mt-1">
                            {p.price_thb ? `฿${p.price_thb.toLocaleString()}` : '—'}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-600 italic">
                    <ShoppingBag className="h-12 w-12 mb-4 opacity-20" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Zero Results Found</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-white/5 bg-slate-950/30 text-center">
                <p className="text-[9px] font-bold text-slate-600 uppercase tracking-[0.3em]">
                  {pickText(language, { en: 'Database synchronization active', th: 'ซิงค์ข้อมูลเรียบร้อยแล้ว' })}
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
