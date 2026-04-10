'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, ShoppingCart, BarChart2, Zap, Cpu, MousePointer2 } from 'lucide-react'
import { getProductsApi, type Spec } from '@/lib/api'
import { useCart } from '@/lib/cart-context'

export default function ShopPage() {
  const [products, setProducts] = useState<Spec[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [brand, setBrand] = useState('All')
  const { addItem } = useCart()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProductsApi({ brand: brand === 'All' ? undefined : brand })
        setProducts(data.products)
      } catch (err) {
        console.error('Failed to fetch products:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [brand])

  const filtered = products.filter(p => 
    p.model.toLowerCase().includes(search.toLowerCase()) || 
    p.brand.toLowerCase().includes(search.toLowerCase())
  )

  const brands = ['All', 'Apple', 'Samsung', 'Xiaomi', 'Vivo', 'Oppo', 'Google']

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background text-foreground p-6 md:p-12"
    >
      {/* Search & Filter Header */}
      <div className="max-w-7xl mx-auto space-y-8 mb-12">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.3em] text-sky-500">
              <ShoppingBag className="h-3.5 w-3.5" />
              Smartphone Market
            </div>
            <h1 className="text-6xl font-black uppercase tracking-tighter text-slate-950 dark:text-white leading-none">
              Shop
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-2xl">
              Browse and explore the latest authenticated smartphone specifications and availability with precision benchmarking.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-cyan-500 group-focus-within:neon-text-cyan transition-all" />
              <input 
                type="text"
                placeholder="SEARCH ARCHIVE..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-80 bg-muted/50 border border-white/10 dark:border-white/5 rounded-2xl py-4 pl-12 pr-6 text-xs font-black tracking-widest focus:outline-none focus:border-cyan-500/50 transition-all"
              />
            </div>
          </div>
        </header>

        {/* Brand Bar */}
        <div className="flex flex-wrap gap-2 pb-4">
          {brands.map(b => (
            <button
              key={b}
              onClick={() => setBrand(b)}
              className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                brand === b 
                  ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,243,255,0.4)]' 
                  : 'bg-muted border border-white/5 dark:border-white/2 text-slate-500 hover:border-cyan-500/50 hover:text-foreground'
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 space-y-4">
            <Cpu className="h-12 w-12 text-cyan-500 animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-500 animate-pulse">Syncing Inventory...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {filtered.map((product, idx) => (
                <ProductCard 
                  key={product._id || idx} 
                  product={product} 
                  onAdd={() => addItem(product)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-40 bg-slate-900/20 rounded-[3rem] border border-dashed border-white/10">
            <Search className="h-12 w-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-500 font-bold uppercase tracking-widest">No matching hardware found in sector</p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

function ProductCard({ product, onAdd }: { product: Spec, onAdd: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -8 }}
      className="group glass-card rounded-[2.5rem] p-6 hover:border-cyan-500/30 transition-all duration-500 overflow-hidden relative"
    >
      {/* Holographic Background Effect */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {/* Brand Badge */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-[10px] font-black uppercase tracking-widest text-cyan-500 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
          {product.brand}
        </span>
        <div className="flex gap-2">
          <button className="p-2 rounded-lg bg-white/5 border border-white/5 hover:border-magenta-500 hover:text-magenta-400 transition-all group/icon">
            <BarChart2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Image / Thumbnail placeholder */}
      <div className="aspect-square relative mb-6 flex items-center justify-center bg-slate-900/50 rounded-3xl group-hover:bg-slate-900 transition-colors border border-white/5">
        {product.thumbnail_url ? (
          <img src={product.thumbnail_url} className="w-full h-full object-contain p-6 group-hover:scale-110 transition-transform duration-500" alt={product.model} />
        ) : (
          <div className="text-center space-y-2 opacity-20">
            <Cpu className="h-12 w-12 mx-auto" />
            <p className="text-[8px] font-bold uppercase tracking-widest">VISUAL_UNAVAILABLE</p>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="space-y-1 mb-6">
        <h3 className="text-lg font-black tracking-tight group-hover:neon-text-cyan transition-colors truncate">
          {product.model}
        </h3>
        <div className="flex items-center gap-2">
          <Zap className="h-3 w-3 text-cyan-500" />
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">
            {product.highlights.chipset || 'SYSTEM_CORE_ENGAGED'}
          </p>
        </div>
      </div>

      {/* Price & Action */}
      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div>
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Exchange Value</p>
          <p className="text-xl font-black neon-text-magenta">
            {product.price_thb ? `฿${product.price_thb.toLocaleString()}` : 'CONTACT_HQ'}
          </p>
        </div>
        
        <button 
          onClick={onAdd}
          className="h-12 w-12 flex items-center justify-center rounded-2xl cyber-button bg-cyan-500/10 border-cyan-500/30 hover:bg-cyan-500 hover:text-black transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]"
        >
          <ShoppingCart className="h-5 w-5" />
        </button>
      </div>

      {/* Decorative Shimmer */}
      <div className="animate-shimmer" />
    </motion.div>
  )
}

function ShoppingBag(props: any) {
  return (
    <svg 
      {...props} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  )
}
