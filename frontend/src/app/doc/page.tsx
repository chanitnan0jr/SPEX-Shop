'use client'

import React from 'react'
import { FileText, Cpu, Smartphone, Database, Shield, Globe } from 'lucide-react'
import { motion } from 'framer-motion'
import { useUiPreferences } from '@/lib/ui-context'
import { pickText } from '@/lib/i18n'

export default function DocPage() {
  const { language } = useUiPreferences()
  
  const sections = [
    {
      title: pickText(language, { en: 'Tech Stack', th: 'เทคโนโลยีที่ใช้' }),
      icon: Cpu,
      content: pickText(language, { 
        en: 'SpecBot is built with Next.js 15, Tailwind CSS 4, and Framer Motion for a premium, high-performance frontend. The backend is powered by Express and MongoDB with Atlas Vector Search for AI capabilities.',
        th: 'SpecBot สร้างขึ้นด้วย Next.js 15, Tailwind CSS 4 และ Framer Motion เพื่อฟรอนต์เอนด์ระดับพรีเมียมและประสิทธิภาพสูง แบ็คเอนด์ขับเคลื่อนด้วย Express และ MongoDB พร้อม Atlas Vector Search สำหรับความสามารถทาง AI'
      })
    },
    {
      title: pickText(language, { en: 'Hardware Intelligence', th: 'ความชาญฉลาดของฮาร์ดแวร์' }),
      icon: Smartphone,
      content: pickText(language, {
        en: 'We use a normalization engine to map raw hardware specifications from various sources into a 0-100 scoring scale for objective smartphone comparisons.',
        th: 'เราใช้เครื่องมือปรับบรรทัดฐาน (Normalization) เพื่อแมปข้อมูลจำเพาะฮาร์ดแวร์ดิบจากแหล่งต่างๆ ให้เป็นมาตราส่วนคะแนน 0-100 สำหรับการเปรียบเทียบสมาร์ทโฟนที่เที่ยงธรรม'
      })
    },
    {
      title: pickText(language, { en: 'AI Search (RAG)', th: 'การค้นหาด้วย AI (RAG)' }),
      icon: Database,
      content: pickText(language, {
        en: 'Our chatbot uses Retrieval-Augmented Generation (RAG) to provide accurate answers based on the latest smartphone datasets, ensuring you get facts, not hallucinations.',
        th: 'แชทบอทของเราใช้ Retrieval-Augmented Generation (RAG) เพื่อให้คำตอบที่ถูกต้องตามชุดข้อมูลสมาร์ทโฟนล่าสุด เพื่อให้แน่ใจว่าคุณจะได้รับข้อเท็จจริง ไม่ใช่การประมวลผลที่ผิดพลาด'
      })
    },
    {
      title: pickText(language, { en: 'Currency & Data', th: 'สกุลเงินและข้อมูล' }),
      icon: Globe,
      content: pickText(language, {
        en: 'Datasets are pre-normalized to Thai Baht at the database level using a 0.2625 multiplier, ensuring accurate and consistent pricing across the entire platform.',
        th: 'ชุดข้อมูลจะถูกปรับเป็นเงินบาทไทยในระดับฐานข้อมูล โดยใช้ตัวคูณ 0.2625 เพื่อให้แน่ใจว่าการกำหนดราคาจะถูกต้องและสอดคล้องกันทั่วทั้งแพลตฟอร์ม'
      })
    }
  ]

  return (
    <div className="min-h-screen p-8 lg:p-12 max-w-4xl mx-auto space-y-12">
      <header className="space-y-4">
        <div className="flex items-center gap-3 text-sky-500">
          <FileText className="h-6 w-6" />
          <h1 className="text-sm font-black uppercase tracking-[0.3em]">{pickText(language, { en: 'Documentation', th: 'เอกสารโครงการ' })}</h1>
        </div>
        <h2 className="text-4xl lg:text-5xl font-black tracking-tighter text-slate-900 dark:text-white leading-none uppercase">
          {pickText(language, { en: 'SpecBot Technical Guidelines', th: 'แนวทางทางเทคนิคของ SpecBot' })}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium text-lg leading-relaxed max-w-2xl">
          {pickText(language, { en: 'Complete architectural overview and user guide for the SpecBot platform.', th: 'ภาพรวมสถาปัตยกรรมฉบับสมบูรณ์และคู่มือผู้ใช้สำหรับแพลตฟอร์ม SpecBot' })}
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
        {sections.map((section, i) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-8 rounded-3xl border border-slate-200/50 bg-white/50 dark:border-white/5 dark:bg-white/5 backdrop-blur-xl shadow-xl space-y-4"
          >
            <div className="h-12 w-12 rounded-2xl bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900">
              <section.icon className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">{section.title}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              {section.content}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-white/5 shadow-inner">
        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4 uppercase tracking-widest">
          {pickText(language, { en: 'Core Principles', th: 'หลักการสำคัญ' })}
        </h3>
        <ul className="space-y-3">
          {[
            { icon: Globe, text: pickText(language, { en: 'Global Hardware Normalization', th: 'การปรับบรรทัดฐานฮาร์ดแวร์ทั่วโลก' }) },
            { icon: Shield, text: pickText(language, { en: 'Fact-Checked AI Responses', th: 'การตอบสนองของ AI ที่ผ่านการตรวจสอบข้อเท็จจริง' }) },
            { icon: Smartphone, text: pickText(language, { en: 'Real-time Spec Comparison', th: 'การเปรียบเทียบข้อมูลจำเพาะแบบเรียลไทม์' }) }
          ].map((item, i) => (
            <li key={i} className="flex items-center gap-3 text-slate-600 dark:text-slate-400 text-sm font-semibold">
              <item.icon className="h-4 w-4 text-sky-500" />
              {item.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
