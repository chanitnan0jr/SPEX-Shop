'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Home, Settings, HelpCircle, LucideIcon, ChevronLeft, PanelLeftClose, PanelLeft, FileText, ShoppingBag, ShoppingCart, User, LayoutGrid, BarChart3, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useUiPreferences } from '@/lib/ui-context'
import { useCart } from '@/lib/cart-context'
import { VisitorCount } from './VisitorCount'
import { pickText } from '@/lib/i18n'

interface NavItemProps {
  icon: LucideIcon
  label: string
  href: string
  isActive?: boolean
  isCollapsed?: boolean
}

function NavItem({ icon: Icon, label, href, isActive, isCollapsed }: NavItemProps) {
  const { itemCount } = (href === '/cart') ? useCart() : { itemCount: 0 }

  return (
    <Link href={href}>
      <motion.div
        whileHover={{ x: isCollapsed ? 0 : 4 }}
        whileTap={{ scale: 0.95 }}
        className={`group relative flex items-center gap-3 rounded-2xl px-3 py-3 transition-all text-sm font-semibold uppercase tracking-wider
          ${isActive
            ? 'bg-sky-500/10 text-sky-400'
            : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
          }`}
      >
        {isActive && (
          <motion.div
            layoutId="active-nav"
            className="absolute left-0 w-1.5 h-1/2 bg-sky-500 rounded-r-lg"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            style={{ left: -16 }} // Aligning with the image's "outside" feel
          />
        )}
        <div className="relative">
          <Icon className={`h-4.5 w-4.5 transition-colors ${isActive ? 'text-sky-400' : 'group-hover:text-slate-300'}`} />
          {href === '/cart' && itemCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[8px] font-black text-white shadow-[0_0_10px_rgba(244,63,94,0.4)]"
            >
              {itemCount}
            </motion.span>
          )}
        </div>
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`text-[11px] font-black uppercase tracking-[0.15em] whitespace-nowrap ${isActive ? 'text-sky-400' : 'text-slate-500 group-hover:text-slate-300'}`}
          >
            {label}
          </motion.span>
        )}
      </motion.div>
    </Link>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const { language } = useUiPreferences()
  const { isSidebarCollapsed, setIsSidebarCollapsed, isMobileMenuOpen, setIsMobileMenuOpen } = useUiPreferences()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const navItems = [
    { icon: Home, label: pickText(language, { en: 'Home', th: 'หน้าหลัก' }), href: '/' },
    { icon: BarChart3, label: pickText(language, { en: 'Compare', th: 'เปรียบเทียบ' }), href: '/compare' },
    { icon: ShoppingBag, label: pickText(language, { en: 'Shop', th: 'สโตร์' }), href: '/shop' },
    { icon: ShoppingCart, label: pickText(language, { en: 'Cart', th: 'ตะกร้าสินค้า' }), href: '/cart' },
    { icon: FileText, label: pickText(language, { en: 'Document', th: 'เอกสาร' }), href: '/doc' },
  ]

  const bottomItems = [
    { icon: User, label: pickText(language, { en: 'User', th: 'ผู้ใช้งาน' }), href: '/profile' },
    { icon: Settings, label: pickText(language, { en: 'Settings', th: 'ตั้งค่า' }), href: '/settings' },
    { icon: HelpCircle, label: pickText(language, { en: 'Support', th: 'ช่วยเหลือ' }), href: '/support' },
  ]

  const isDesktop = mounted && typeof window !== 'undefined' && window.innerWidth >= 1280

  return (
    <>
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 z-55 bg-slate-950/20 backdrop-blur-sm xl:hidden"
          />
        )}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {(isMobileMenuOpen || isDesktop) && (
          <motion.aside
            initial={isMobileMenuOpen ? { x: -300 } : false}
            animate={{ 
              x: 0,
              width: isSidebarCollapsed ? 80 : 256,
              left: 0
            }}
            exit={{ x: -300 }}
            transition={{ 
              x: { type: "spring", stiffness: 300, damping: 30 }
            }}
            className={`fixed top-0 bottom-0 z-60 flex flex-col border-r border-slate-200/50 bg-white/70 dark:border-white/5 dark:bg-slate-950/80 backdrop-blur-3xl pt-8 px-4 pb-8 transition-all duration-300 ease-in-out ${!isMobileMenuOpen && 'hidden xl:flex'}`}
          >
            {/* Desktop Toggle Button */}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="absolute top-4 -right-4 h-10 w-10 hidden xl:flex items-center justify-center rounded-2xl bg-slate-950 text-white shadow-xl dark:bg-white dark:text-slate-950 border border-white/10 dark:border-slate-200/10 hover:scale-110 transition-all z-50 cursor-pointer"
            >
              {isSidebarCollapsed ? <PanelLeft className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
            </button>

            {/* Mobile Close Button */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="xl:hidden absolute top-6 right-4 h-8 w-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 hover:bg-slate-200 dark:hover:bg-white/10 transition-all cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex-1 space-y-2 overflow-hidden">
              <div className={`px-4 mb-8 transition-opacity duration-300 ${isSidebarCollapsed ? 'opacity-0' : 'opacity-100'}`}>
                <p className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-500 opacity-80 whitespace-nowrap">
                  {pickText(language, { en: 'Explorer Menu', th: 'เมนูหลัก' })}
                </p>
              </div>
              {navItems.map((item) => (
                <div key={item.label} onClick={() => setIsMobileMenuOpen(false)}>
                  <NavItem
                    {...item}
                    isCollapsed={isSidebarCollapsed}
                    isActive={pathname === item.href || (item.href === '/compare' && pathname.includes('compare'))}
                  />
                </div>
              ))}
            </div>

            <div className="mt-4 pt-6 border-t border-slate-200/50 dark:border-white/5 overflow-hidden">
              {VisitorCount && (
                <div onClick={() => setIsMobileMenuOpen(false)}>
                  <VisitorCount isCollapsed={isSidebarCollapsed} />
                </div>
              )}
            </div>

            <div className="mt-6 space-y-2 overflow-hidden">
              {bottomItems.map((item) => (
                <div key={item.label} onClick={() => setIsMobileMenuOpen(false)}>
                  <NavItem
                    {...item}
                    isCollapsed={isSidebarCollapsed}
                    isActive={pathname === item.href}
                  />
                </div>
              ))}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}
