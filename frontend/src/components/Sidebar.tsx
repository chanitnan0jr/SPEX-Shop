'use client'

import Link from 'next/link'
import { Home, Radar, Settings, HelpCircle, LucideIcon, ChevronLeft, PanelLeftClose, PanelLeft, FileText } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useUiPreferences } from '@/lib/ui-context'
import { VisitorCount } from './VisitorCount'

interface NavItemProps {
  icon: LucideIcon
  label: string
  href: string
  isActive?: boolean
  isCollapsed?: boolean
}

function NavItem({ icon: Icon, label, href, isActive, isCollapsed }: NavItemProps) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ x: isCollapsed ? 0 : 4 }}
        whileTap={{ scale: 0.95 }}
        className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all text-sm font-semibold uppercase tracking-wider
          ${isActive
            ? 'bg-sky-500/10 text-sky-400 shadow-[0_0_20px_rgba(14,165,233,0.1)]'
            : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
          }`}
      >
        {isActive && (
          <motion.div
            layoutId="active-nav"
            className="absolute left-0 w-1 h-2/3 bg-sky-500 rounded-r-full"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
        <Icon className={`h-4.5 w-4.5 transition-colors ${isActive ? 'text-sky-400' : 'group-hover:text-slate-300'}`} />
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-[10px] whitespace-nowrap"
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
  const { isSidebarCollapsed, setIsSidebarCollapsed } = useUiPreferences()

  const navItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Radar, label: 'Spec Radar', href: '/compare' },
    { icon: FileText, label: 'Doc', href: '/doc' },
  ]

  const bottomItems = [
    { icon: Settings, label: 'Settings', href: '#settings' },
    { icon: HelpCircle, label: 'Support', href: '#support' },
  ]

  return (
    <motion.aside
      initial={false}
      animate={{ width: isSidebarCollapsed ? 80 : 256 }}
      className="fixed left-0 top-0 bottom-0 z-60 hidden xl:flex flex-col border-r border-slate-200/50 bg-white/70 dark:border-white/5 dark:bg-slate-950/80 backdrop-blur-3xl pt-8 px-4 pb-8 transition-all duration-300 ease-in-out"
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        className="absolute top-6 right-0 translate-x-1/2 h-8 w-8 flex items-center justify-center rounded-full bg-white dark:bg-slate-950 border border-slate-200/50 dark:border-white/5 shadow-lg text-slate-400 hover:text-sky-500 hover:scale-110 transition-all z-50 cursor-pointer"
      >
        {isSidebarCollapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
      </button>

      <div className="flex-1 space-y-2 overflow-hidden">
        <div className={`px-3 mb-6 transition-opacity duration-300 ${isSidebarCollapsed ? 'opacity-0' : 'opacity-100'}`}>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 opacity-70 whitespace-nowrap">
            Explorer Menu
          </p>
        </div>
        {navItems.map((item) => (
          <NavItem
            key={item.label}
            {...item}
            isCollapsed={isSidebarCollapsed}
            isActive={pathname === item.href || (item.href === '/compare' && pathname.includes('compare'))}
          />
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-white/5 overflow-hidden">
        {VisitorCount && <VisitorCount isCollapsed={isSidebarCollapsed} />}
      </div>

      <div className="space-y-4 pt-8 border-t border-slate-200/50 dark:border-white/5 overflow-hidden">
        {bottomItems.map((item) => (
          <NavItem
            key={item.label}
            {...item}
            isCollapsed={isSidebarCollapsed}
            isActive={pathname === item.href}
          />
        ))}
      </div>
    </motion.aside>
  )
}
