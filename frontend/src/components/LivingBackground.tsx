'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion'

interface ClickEffect {
  id: number;
  x: number;
  y: number;
}

export function LivingBackground() {
  const [isMounted, setIsMounted] = useState(false)
  const [effects, setEffects] = useState<ClickEffect[]>([])
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Spring configurations for smooth parallax
  const springConfig = { damping: 25, stiffness: 150 }
  const smoothX = useSpring(mouseX, springConfig)
  const smoothY = useSpring(mouseY, springConfig)

  const addEffect = useCallback((e: MouseEvent) => {
    // Only trigger if clicking directly or if it's a global aesthetic
    // For now, let's trigger on all clicks to make the workspace feel "alive"
    const newEffect = {
      id: Date.now(),
      x: e.clientX,
      y: e.clientY,
    }
    setEffects(prev => [...prev, newEffect])

    // Cleanup after animation
    setTimeout(() => {
      setEffects(prev => prev.filter(eff => eff.id !== newEffect.id))
    }, 1000)
  }, [])

  useEffect(() => {
    setIsMounted(true)
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mousedown', addEffect)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mousedown', addEffect)
    }
  }, [mouseX, mouseY, addEffect])

  // Parallax transforms for different layers
  const blob1X = useTransform(smoothX, (x) => x * 0.05 - 100)
  const blob1Y = useTransform(smoothY, (y) => y * 0.05 - 100)
  
  const blob2X = useTransform(smoothX, (x) => x * -0.03 + 200)
  const blob2Y = useTransform(smoothY, (y) => y * -0.03 + 200)

  const gridX = useTransform(smoothX, (x) => x * 0.01)
  const gridY = useTransform(smoothY, (y) => y * 0.01)

  return (
    <>
      {/* Background Parallax Layers */}
      <div className="fixed inset-0 -z-10 overflow-hidden bg-background">
        <div className="absolute inset-0 transition-opacity duration-1000">
          {/* 1. Counter-Parallax Glow (Sky) */}
          <motion.div 
            style={{ 
              top: 100,
              left: 100,
              x: blob1X,
              y: blob1Y,
            }}
            className="absolute w-[800px] h-[800px] rounded-full bg-sky-500/15 dark:bg-sky-500/5 blur-[120px]"
          />

          {/* 2. Counter-Parallax Glow (Emerald) */}
          <motion.div 
            style={{ 
              x: blob2X,
              y: blob2Y,
              bottom: 100,
              right: 100,
            }}
            className="absolute w-[600px] h-[600px] rounded-full bg-emerald-500/12 dark:bg-emerald-500/5 blur-[100px]"
          />

          {/* 3. Blueprint Grid Parallax */}
          <motion.div 
            style={{ 
              x: gridX, 
              y: gridY,
              backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
              backgroundSize: '48px 48px',
              color: 'var(--ink-soft)'
            }}
            className="absolute inset-[-5%] opacity-[0.06] dark:opacity-[0.05]"
          />

          {/* 4. Drifting Technical Nodes */}
          <div className="absolute inset-0">
            {isMounted && [...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: [0.1, 0.3, 0.1],
                  scale: [1, 1.2, 1],
                  x: [0, Math.random() * 50 - 25, 0],
                  y: [0, Math.random() * 50 - 25, 0]
                }}
                transition={{
                  duration: 10 + i * 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                }}
              >
                <div className="w-1 h-1 rounded-full bg-sky-400 dark:bg-sky-600 shadow-[0_0_10px_rgba(56,189,248,0.5)]" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Surge Overlay (Elevated for visibility across themes) */}
      <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
        <AnimatePresence>
          {effects.map((eff) => (
            <TechnicalSurge key={eff.id} x={eff.x} y={eff.y} />
          ))}
        </AnimatePresence>
      </div>
    </>
  )
}

function TechnicalSurge({ x, y }: { x: number, y: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.5 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="absolute pointer-events-none z-20"
      style={{ left: x, top: y, translateX: '-50%', translateY: '-50%' }}
    >
      {/* Central Flash */}
      <motion.div 
        initial={{ opacity: 1, scale: 1 }}
        animate={{ opacity: 0, scale: 2 }}
        transition={{ duration: 0.4 }}
        className="absolute w-4 h-4 rounded-full blur-[2px] bg-sky-900 dark:bg-white shadow-[0_0_15px_rgba(12,74,110,0.4)] dark:shadow-[0_0_15px_rgba(255,255,255,0.4)]"
      />

      {/* Expanding Ring 1 */}
      <motion.div 
        initial={{ width: 0, height: 0, opacity: 0.8 }}
        animate={{ width: 120, height: 120, opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="absolute border rounded-full blur-[1.5px] border-sky-900/30 dark:border-white/40"
        style={{ left: '50%', top: '50%', translateX: '-50%', translateY: '-50%' }}
      />

      {/* Expanding Ring 2 (Secondary) */}
      <motion.div 
        initial={{ width: 0, height: 0, opacity: 0.4 }}
        animate={{ width: 80, height: 80, opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
        className="absolute border rounded-full blur-[2px] border-sky-800/20 dark:border-white/20"
        style={{ left: '50%', top: '50%', translateX: '-50%', translateY: '-50%' }}
      />

      {/* Cross Flares */}
      {[0, 90, 180, 270].map((rotation) => (
        <motion.div
          key={rotation}
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{ scaleX: 1, opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          style={{ 
            rotate: rotation,
            left: 'calc(50% - 1px)',
            top: '50%',
            originX: 0,
            width: '40px',
            height: '1px'
          }}
          className="absolute bg-linear-to-r from-sky-900 dark:from-white to-transparent blur-[0.5px]"
        />
      ))}
    </motion.div>
  )
}
