'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Home, ShoppingBag, BarChart2, ShoppingCart, User, Cpu } from 'lucide-react'
import { UiControls } from '../UiControls'
import { useCart } from '@/lib/cart-context'
import { useUiPreferences } from '@/lib/ui-context'
import { pickText } from '@/lib/i18n'

export function Navbar() {
  const pathname = usePathname()
  const { itemCount } = useCart()
  const { language } = useUiPreferences()

  const navLinks = [
    { href: '/', label: pickText(language, { en: 'Home', th: 'หน้าแรก' }), icon: Home },
    { href: '/shop', label: pickText(language, { en: 'Shop', th: 'ร้านค้า' }), icon: ShoppingBag },
    { href: '/compare', label: pickText(language, { en: 'Compare', th: 'เปรียบเทียบ' }), icon: BarChart2 },
    { href: '/cart', label: pickText(language, { en: 'Cart', th: 'รถเข็น' }), icon: ShoppingCart },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 z-100 h-20 px-6 flex items-center justify-between border-b border-white/10 glass-card">
      {/* Logo Section */}
      <Link href="/" className="flex items-center gap-3 group">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white shadow-xl group-hover:shadow-cyan-500/20 transition-all neon-border">
          <Cpu className="h-5 w-5 animate-pulse text-cyan-400" />
        </div>
        <div>
          <span className="block text-sm font-black uppercase tracking-widest neon-text-cyan">SpecBot</span>
          <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">{pickText(language, { en: 'Web Edition', th: 'เวอร์ชันเว็บ' })}</span>
        </div>
      </Link>

      {/* Nav Links */}
      <div className="hidden md:flex items-center gap-2 p-1 rounded-2xl bg-slate-900/50 border border-white/5">
        {navLinks.map((link) => {
          const isActive = pathname === link.href
          const Icon = link.icon

          return (
            <Link
              key={link.href}
              href={link.href}
              className="relative px-4 py-2 rounded-xl transition-all"
            >
              {isActive && (
                <motion.div
                  layoutId="active-nav"
                  className="absolute inset-0 bg-cyan-500/10 border border-cyan-500/30 rounded-xl"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <div className={`relative z-10 flex items-center gap-2 text-sm font-bold uppercase tracking-wider ${isActive ? 'text-cyan-400' : 'text-slate-400 hover:text-white'
                }`}>
                <div className="relative">
                  <Icon className="h-4 w-4" />
                  {link.label === 'Cart' && itemCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-magenta-500 text-[8px] font-black text-white shadow-[0_0_8px_rgba(255,0,255,0.6)]"
                    >
                      {itemCount}
                    </motion.span>
                  )}
                </div>
                {link.label}
              </div>
            </Link>
          )
        })}
      </div>

      {/* Right Side Controls */}
      <div className="flex items-center gap-4">
        <div className="hidden lg:block">
          <UiControls />
        </div>

        <Link href="/profile" className="flex items-center gap-2 p-2 rounded-xl h-10 w-10 bg-slate-900 border border-white/10 hover:border-magenta-500 hover:shadow-magenta-500/20 transition-all">
          <User className="h-5 w-5 text-magenta-400" />
        </Link>
      </div>
    </nav>
  )
}
