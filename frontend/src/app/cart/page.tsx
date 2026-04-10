'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Trash2, ArrowRight, CreditCard, ChevronLeft, Package, Trash } from 'lucide-react'
import Link from 'next/link'
import { useCart } from '@/lib/cart-context'
import { createOrderApi } from '@/lib/api'

export default function CartPage() {
  const { cart, removeItem, itemCount } = useCart()
  const [isCheckingOut, setIsCheckingOut] = React.useState(false)
  const [ordered, setOrdered] = React.useState(false)

  const total = cart.reduce((sum, item) => sum + (item.product.price_thb || 0) * item.quantity, 0)

  const handleCheckout = async () => {
    setIsCheckingOut(true)
    try {
      await createOrderApi({
        items: cart.map(item => ({ product: item.product._id, quantity: item.quantity })),
        totalAmount: total
      })
      setOrdered(true)
      // Clear cart would happen here in a real app
    } catch (err) {
      alert('Neural payment failed. Please check your credit.')
    } finally {
      setIsCheckingOut(false)
    }
  }

  if (ordered) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-card p-12 rounded-[3.5rem] max-w-lg w-full space-y-8">
          <div className="h-24 w-24 bg-cyan-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(0,243,255,0.6)]">
            <Package className="h-12 w-12 text-black" />
          </div>
          <div className="space-y-2">
            <h1 className="text-4xl font-black uppercase tracking-tighter neon-text-cyan">Order Dispatched</h1>
            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">Awaiting hardware translocation</p>
          </div>
          <Link href="/shop" className="block w-full py-4 rounded-2xl cyber-button">
            BACK TO INVENTORY
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-background text-foreground p-6 md:p-12"
    >
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 space-y-6">
          <div className="space-y-4 px-4">
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.3em] text-sky-500">
              <ShoppingCart className="h-3.5 w-3.5" />
              Checkout System
            </div>
            <h1 className="text-6xl font-black uppercase tracking-tighter text-slate-950 dark:text-white leading-none">
              Your Cart
            </h1>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-2xl">
              {itemCount} {itemCount === 1 ? 'device' : 'devices'} selected for review. Manage your inventory and finalize your order within our secure transaction gateway.
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence mode="popLayout">
              {cart.length > 0 ? (
                cart.map((item) => (
                  <motion.div
                    key={item.product._id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="glass-card p-6 rounded-[2rem] flex items-center gap-6 group hover:border-magenta-500/30 transition-all"
                  >
                    <div className="h-24 w-24 bg-slate-900 rounded-2xl overflow-hidden border border-white/5 flex items-center justify-center">
                      {item.product.thumbnail_url ? (
                        <img src={item.product.thumbnail_url} className="w-16 h-16 object-contain" alt={item.product.model} />
                      ) : (
                        <Package className="h-8 w-8 text-slate-700" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-magenta-500 mb-1">{item.product.brand}</p>
                          <h3 className="text-xl font-black tracking-tight group-hover:neon-text-magenta transition-colors">{item.product.model}</h3>
                        </div>
                        <button 
                          onClick={() => removeItem(item.product._id!)}
                          className="p-2 text-slate-600 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-4 p-1 rounded-xl bg-muted border border-white/5 dark:border-white/2">
                           <span className="px-4 text-xs font-black text-cyan-400 tracking-widest">QTY: {item.quantity}</span>
                        </div>
                        <p className="text-lg font-black neon-text-cyan">
                          ฿{((item.product.price_thb || 0) * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="py-40 text-center border border-dashed border-white/10 rounded-[3rem]">
                  <Package className="h-16 w-16 text-slate-800 mx-auto mb-6" />
                  <p className="text-slate-500 font-bold uppercase tracking-[0.3em]">Manifest is currently empty</p>
                  <Link 
                    href="/shop" 
                    className="mt-8 group relative inline-flex items-center gap-4 rounded-3xl bg-slate-950 dark:bg-white px-10 py-5 text-sm font-black uppercase tracking-widest text-white dark:text-slate-950 shadow-2xl shadow-sky-500/20 transition-all hover:-translate-y-1 active:translate-y-0"
                  >
                    BROWSE INVENTORY
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Cart Summary Header */}
          <div className="lg:col-span-1">
            <div className="glass-card p-8 rounded-[3rem] space-y-8 sticky top-32">
              <h2 className="text-2xl font-black uppercase tracking-tighter">Budget Summary</h2>
              
              <div className="space-y-4 border-b border-white/5 pb-8">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
                  <span>Subtotal</span>
                  <span className="text-white">฿{total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-slate-400">
                  <span>Transport</span>
                  <span className="text-cyan-500">FREE_ALLOCATION</span>
                </div>
              </div>

              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total Credits</p>
                  <p className="text-3xl font-black neon-text-cyan">฿{total.toLocaleString()}</p>
                </div>
              </div>

              <button 
                onClick={handleCheckout}
                disabled={cart.length === 0 || isCheckingOut}
                className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 text-sm font-black uppercase tracking-[0.2em] transition-all ${
                  cart.length === 0 || isCheckingOut
                    ? 'opacity-50 cursor-not-allowed bg-slate-800 text-slate-600'
                    : 'bg-magenta-500 text-white shadow-[0_0_20px_rgba(255,0,255,0.4)] hover:shadow-[0_0_40px_rgba(255,0,255,0.6)] hover:-translate-y-1'
                }`}
              >
                {isCheckingOut ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full" />
                ) : (
                  <>
                    AUTHORIZE EXCHANGE
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-4 grayscale opacity-30">
                <CreditCard className="h-5 w-5" />
                <span className="text-[8px] font-bold tracking-[0.5em] uppercase">Secured Neural Gateway</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
