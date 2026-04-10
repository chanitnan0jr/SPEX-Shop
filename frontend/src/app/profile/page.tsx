'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, LogIn, UserPlus, LogOut, Package, ShieldCheck, Mail, ShieldAlert } from 'lucide-react'
import { useAuth } from '@/lib/auth-context'

export default function ProfilePage() {
  const { user, login, register, logout, isAuthenticated } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [isShaking, setIsShaking] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!isLogin && !form.name.trim()) {
      newErrors.name = 'Identity name required'
    }

    if (!form.email.trim()) {
      newErrors.email = 'Account email required'
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = 'Invalid email format'
    }

    if (!form.password) {
      newErrors.password = 'Access code required'
    } else if (form.password.length < 6) {
      newErrors.password = 'Short keys are insecure (min 6 chars)'
    }

    if (!isLogin && form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Access key disparity detected'
    }

    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) {
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 500)
    }
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setGlobalError(null)
    if (!validateForm()) return

    setLoading(true)
    try {
      if (isLogin) {
        await login({ email: form.email, password: form.password })
      } else {
        await register(form)
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? 'Access denied. Verify your credentials.'
      setGlobalError(msg)
      setIsShaking(true)
      setTimeout(() => setIsShaking(false), 500)
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-background text-foreground">
        <motion.div 
          initial={{ opacity: 0, y: 60, scale: 0.8, rotate: -2 }}
          animate={isShaking ? { x: [0, -10, 10, -10, 10, 0] } : { opacity: 1, y: 0, scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 120,
            damping: 14,
            mass: 0.8,
            duration: isShaking ? 0.4 : undefined 
          }}
          className="glass-card p-12 rounded-[3.5rem] max-w-md w-full border border-slate-200 dark:border-white/5 relative overflow-hidden shadow-2xl shadow-slate-300/50 dark:shadow-none bg-white/95 dark:bg-white/5 backdrop-blur-3xl"
        >
          {/* Animated Background Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 dark:bg-cyan-500/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-fuchsia-500/10 dark:bg-magenta-500/5 rounded-full blur-[100px]" />

          <div className="relative text-center mb-10 space-y-2">
            <h1 className="text-4xl font-black uppercase tracking-tighter neon-text-cyan flex items-center justify-center gap-3">
              {isLogin ? <LogIn className="h-8 w-8" /> : <UserPlus className="h-8 w-8" />}
              {isLogin ? 'Log In' : 'Register'}
            </h1>
            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px]">
              </p>
          </div>

          <form onSubmit={handleSubmit} className="relative space-y-6">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={isLogin ? 'login-fields' : 'register-fields'}
                initial={{ opacity: 0, x: isLogin ? -10 : 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isLogin ? 10 : -10 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className="space-y-6"
              >
                <AnimatePresence>
                  {globalError && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-[10px] font-black text-red-500 uppercase tracking-widest text-center flex items-center justify-center gap-2 mb-6"
                    >
                      <ShieldAlert className="h-3.5 w-3.5" />
                      {globalError}
                    </motion.div>
                  )}
                </AnimatePresence>

                {!isLogin && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Full Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Enter your name"
                      className={`w-full bg-slate-50 dark:bg-slate-900 border rounded-2xl py-4 px-6 text-xs font-black tracking-widest text-slate-950 dark:text-white transition-all focus:outline-none focus:ring-4 ${
                        errors.name 
                          ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/10' 
                          : 'border-slate-200 dark:border-white/10 focus:border-sky-500 dark:focus:border-cyan-500/50 focus:ring-sky-500/5'
                      }`}
                      value={form.name}
                      onChange={(e) => {
                        setForm({...form, name: e.target.value})
                        if (errors.name) setErrors({...errors, name: ''})
                      }}
                    />
                    {errors.name && <p className="text-[9px] font-black text-red-500 uppercase tracking-widest ml-4 mt-1">{errors.name}</p>}
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Email Address</label>
                  <input 
                    type="email" 
                    required
                    placeholder="USER@NETWORK.NET"
                    className={`w-full bg-slate-50 dark:bg-slate-900 border rounded-2xl py-4 px-6 text-xs font-black tracking-widest text-slate-950 dark:text-white transition-all focus:outline-none focus:ring-4 ${
                      errors.email 
                        ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/10' 
                        : 'border-slate-200 dark:border-white/10 focus:border-sky-500 dark:focus:border-cyan-500/50 focus:ring-sky-500/5'
                    }`}
                    value={form.email}
                    onChange={(e) => {
                      setForm({...form, email: e.target.value})
                      if (errors.email) setErrors({...errors, email: ''})
                    }}
                  />
                  {errors.email && <p className="text-[9px] font-black text-red-500 uppercase tracking-widest ml-4 mt-1">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Password</label>
                  <input 
                    type="password" 
                    required
                    placeholder="••••••••"
                    className={`w-full bg-slate-50 dark:bg-slate-900 border rounded-2xl py-4 px-6 text-xs font-black tracking-widest text-slate-950 dark:text-white transition-all focus:outline-none focus:ring-4 ${
                      errors.password 
                        ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/10' 
                        : 'border-slate-200 dark:border-white/10 focus:border-sky-500 dark:focus:border-cyan-500/50 focus:ring-sky-500/5'
                    }`}
                    value={form.password}
                    onChange={(e) => {
                      setForm({...form, password: e.target.value})
                      if (errors.password) setErrors({...errors, password: ''})
                    }}
                  />
                  {errors.password && <p className="text-[9px] font-black text-red-500 uppercase tracking-widest ml-4 mt-1">{errors.password}</p>}
                </div>

                {!isLogin && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-4">Verify Password</label>
                    <input 
                      type="password" 
                      required
                      placeholder="••••••••"
                      className={`w-full bg-slate-50 dark:bg-slate-900 border rounded-2xl py-4 px-6 text-xs font-black tracking-widest text-slate-950 dark:text-white transition-all focus:outline-none focus:ring-4 ${
                        errors.confirmPassword 
                          ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/10' 
                          : 'border-slate-200 dark:border-white/10 focus:border-sky-500 dark:focus:border-cyan-500/50 focus:ring-sky-500/5'
                      }`}
                      value={form.confirmPassword}
                      onChange={(e) => {
                        setForm({...form, confirmPassword: e.target.value})
                        if (errors.confirmPassword) setErrors({...errors, confirmPassword: ''})
                      }}
                    />
                    {errors.confirmPassword && <p className="text-[9px] font-black text-red-500 uppercase tracking-widest ml-4 mt-1">{errors.confirmPassword}</p>}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-5 rounded-2xl bg-slate-950 dark:bg-cyan-500/10 border-2 border-slate-950 dark:border-cyan-500/30 text-white dark:text-cyan-400 hover:bg-slate-800 dark:hover:bg-cyan-500 dark:hover:text-black font-black uppercase tracking-widest shadow-2xl shadow-slate-950/40 dark:shadow-[0_0_20px_rgba(0,243,255,0.2)] transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden"
            >
              {loading ? 'Processing...' : isLogin ? 'Log In' : 'Register'}
            </button>
          </form>

          <div className="relative z-20 mt-10 text-center">
            <button 
              onClick={() => {
                setIsLogin(!isLogin)
                setErrors({})
                setForm({ ...form, confirmPassword: '' })
              }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-950 dark:hover:text-white hover:border-sky-500/30 dark:hover:border-cyan-500/30 hover:bg-white dark:hover:bg-white/10 transition-all cursor-pointer shadow-sm hover:shadow-md"
            >
              <UserPlus className="h-3.5 w-3.5" />
              {isLogin ? "New to SPEX-Shop? Create Account" : "Existing User? Log In Here"}
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left: User Profile Info */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: -50, scale: 0.95 }} 
            animate={{ opacity: 1, x: 0, scale: 1 }} 
            transition={{ type: "spring", stiffness: 120, damping: 14, mass: 0.8 }}
            className="glass-card p-10 rounded-[3.5rem] border border-sky-500/20 dark:border-cyan-500/20 shadow-2xl shadow-slate-200/40 dark:shadow-[0_0_30px_rgba(0,243,255,0.05)] bg-white/70 dark:bg-white/5 backdrop-blur-3xl"
          >
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="h-24 w-24 bg-slate-50 dark:bg-slate-900 rounded-[2rem] flex items-center justify-center border-2 border-sky-500/30 dark:border-cyan-500/30 shadow-xl shadow-sky-500/10 dark:shadow-[0_0_20px_rgba(0,243,255,0.2)]">
                <User className="h-10 w-10 text-sky-600 dark:text-cyan-400" />
              </div>
              <div>
                <h1 className="text-3xl font-black uppercase tracking-tighter neon-text-cyan">{user?.name}</h1>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-center gap-2 mt-1">
                  <Mail className="h-3.5 w-3.5" /> {user?.email}
                </p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Neural Link Verified</span>
              </div>
              
              <button 
                onClick={logout}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-red-500 transition-colors pt-4 cursor-pointer"
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            </div>
          </motion.div>

          {/* Security Status */}
          <div className="glass-card p-8 rounded-[3rem] space-y-4">
             <h3 className="text-xs font-black uppercase tracking-widest neon-text-magenta">Hardware Security</h3>
             <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">2FA STATUS</span>
                <span className="text-[10px] font-black text-sky-600 dark:text-cyan-400">ACTIVE</span>
             </div>
             <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/5 shadow-sm">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">ENCRYPTION</span>
                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-500">AES-256-NEURAL</span>
             </div>
          </div>
        </div>

        {/* Right: Order History (Simulated for parity) */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-end justify-between px-6">
             <div className="space-y-1">
               <h2 className="text-4xl font-black uppercase tracking-tighter text-slate-950 dark:text-white">Allocation History</h2>
               <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Previous hardware translocations</p>
             </div>
             <Package className="h-8 w-8 text-slate-700" />
          </div>

          <div className="space-y-4">
            {/* Simulated History Items */}
            {[1, 2].map((i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 50, scale: 0.9 }} 
                animate={{ opacity: 1, y: 0, scale: 1 }} 
                transition={{ 
                  type: "spring", 
                  stiffness: 120, 
                  damping: 14, 
                  mass: 0.8,
                  delay: i * 0.1 
                }}
                className="glass-card p-8 rounded-[3rem] group hover:border-cyan-500/20 transition-all"
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.2em] mb-1">ALLOCATION #829{i}-ZX</p>
                    <p className="text-xs font-bold text-slate-400">TIMESTAMP: 2026-04-10 12:0{i}:24</p>
                  </div>
                  <div className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-500 tracking-widest">
                    DELIVERED
                  </div>
                </div>

                <div className="flex items-center gap-12">
                   <div className="flex -space-x-4">
                     <div className="h-16 w-16 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center">
                        <User className="h-6 w-6 text-slate-500" />
                     </div>
                     <div className="h-16 w-16 rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-center shadow-xl">
                        <Package className="h-6 w-6 text-cyan-500" />
                     </div>
                   </div>
                   
                   <div className="flex-1">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">TOTAL CREDITS</p>
                      <p className="text-2xl font-black text-slate-950 dark:text-white">฿{(45900 + (i * 12800)).toLocaleString()}</p>
                   </div>

                   <button className="px-6 py-3 rounded-xl border border-slate-200 dark:border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-slate-950 dark:hover:bg-white hover:text-white dark:hover:text-slate-950 transition-all cursor-pointer">
                     View Manifest
                   </button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="p-12 text-center bg-slate-900/10 rounded-[3rem] border border-dashed border-white/5">
             <ShieldAlert className="h-10 w-10 text-slate-700 mx-auto mb-4" />
             <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Access legacy data through the neural console</p>
          </div>
        </div>
      </div>
    </div>
  )
}
