'use client'

import { useEffect, useRef, useState, startTransition } from 'react'
import { useMutation } from '@tanstack/react-query'
import { ArrowUpRight, Bot, Check, ChevronDown, ChevronUp, Edit2, History, Loader2, MessagesSquare, PlusCircle, Sparkles, ThumbsDown, ThumbsUp, Trash2, User, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { searchApi, submitFeedbackApi, getChatHistoryApi, deleteChatHistoryApi, type SearchResponse } from '@/lib/api'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { pickText } from '@/lib/i18n'
import { useUiPreferences } from '@/lib/ui-context'
import { SourceCitation } from './SourceCitation'

interface Message {
  id: string
  role: 'user' | 'bot'
  content: string
  response?: SearchResponse
  rating?: number
}

interface ChatSession {
  id: string
  title: string
  createdAt: number
}

export function ChatBox() {
  const { language } = useUiPreferences()
  const quickPrompts = language === 'en'
    ? [
      'Strong battery mid-range',
      'Compare S21 vs S22',
      '12GB RAM models',
    ]
    : [
      'แบตอึด ราคากลางๆ',
      'เทียบ S21 vs S22',
      'รุ่นที่มี RAM 12GB',
    ]

  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [input, setInput] = useState('')
  const [recentQueries, setRecentQueries] = useState<string[]>([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showNewChatConfirm, setShowNewChatConfirm] = useState(false)
  const [showSessionList, setShowSessionList] = useState(false)
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null)
  const [tempTitle, setTempTitle] = useState('')
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Initialize sessions and active session and recent queries
  useEffect(() => {
    const savedSessions = localStorage.getItem('specbot_sessions')
    const savedRecent = localStorage.getItem('specbot_recent_queries')
    let currentSessions: ChatSession[] = []

    if (savedRecent) {
      try {
        setRecentQueries(JSON.parse(savedRecent))
      } catch (e) {
        console.error('Failed to parse recent queries', e)
      }
    }

    if (savedSessions) {
      try {
        currentSessions = JSON.parse(savedSessions)
        setSessions(currentSessions)
      } catch (e) {
        console.error('Failed to parse sessions', e)
      }
    }

    if (currentSessions.length > 0) {
      setActiveSessionId(currentSessions[0].id)
    } else {
      // Create first session if none exists
      const newId = Date.now().toString().slice(-6)
      const firstSession: ChatSession = {
        id: newId,
        title: `SID-${newId}`,
        createdAt: Date.now(),
      }
      setSessions([firstSession])
      setActiveSessionId(newId)
      localStorage.setItem('specbot_sessions', JSON.stringify([firstSession]))
    }
    setIsLoaded(true)
  }, [])

  // Load messages whenever activeSessionId changes — backend is source of truth
  useEffect(() => {
    if (!isLoaded || !activeSessionId) return

    const initMsg: Message = { id: 'init', role: 'bot', content: '' }

    getChatHistoryApi(activeSessionId)
      .then((history) => {
        if (history.length === 0) {
          setMessages([initMsg])
          return
        }
        const hydrated: Message[] = [initMsg]
        for (const entry of history) {
          hydrated.push({ id: `${entry._id}-user`, role: 'user', content: entry.query })
          hydrated.push({
            id: `${entry._id}-bot`,
            role: 'bot',
            content: entry.answer,
            response: { answer: entry.answer, sources: entry.sources },
          })
        }
        setMessages(hydrated)
      })
      .catch(() => {
        // Backend unreachable — fall back to localStorage
        const savedMessages = localStorage.getItem(`specbot_messages_${activeSessionId}`)
        if (savedMessages) {
          try {
            setMessages(JSON.parse(savedMessages))
          } catch {
            setMessages([initMsg])
          }
        } else {
          setMessages([initMsg])
        }
      })
  }, [activeSessionId, isLoaded])

  // Auto-collapse header when messages start flowing
  useEffect(() => {
    if (messages.length > 1 && isHeaderExpanded) {
      setIsHeaderExpanded(false)
    }
  }, [messages.length])

  // Save messages to current session storage
  useEffect(() => {
    if (isLoaded && activeSessionId && messages.length > 0) {
      localStorage.setItem(`specbot_messages_${activeSessionId}`, JSON.stringify(messages))

      // Update session title if it's still default
      const session = sessions.find(s => s.id === activeSessionId)
      const firstUserMsg = messages.find(m => m.role === 'user')

      if (session && firstUserMsg && session.title.includes(pickText(language, { en: 'Conversation', th: 'การสนทนา' }))) {
        const newTitle = firstUserMsg.content.slice(0, 30) + (firstUserMsg.content.length > 30 ? '...' : '')
        const updatedSessions = sessions.map(s => s.id === activeSessionId ? { ...s, title: newTitle } : s)
        setSessions(updatedSessions)
        localStorage.setItem('specbot_sessions', JSON.stringify(updatedSessions))
      }
    }
  }, [messages, activeSessionId, isLoaded, sessions, language])

  const handleCreateSession = () => {
    const newId = Date.now().toString().slice(-6)
    const newSession: ChatSession = {
      id: newId,
      title: `SID-${newId}`,
      createdAt: Date.now(),
    }
    const updatedSessions = [newSession, ...sessions]
    setSessions(updatedSessions)
    setActiveSessionId(newId)
    setMessages([{ id: 'init', role: 'bot', content: '' }])
    localStorage.setItem('specbot_sessions', JSON.stringify(updatedSessions))
  }

  const handleDeleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    const updatedSessions = sessions.filter(s => s.id !== id)
    localStorage.removeItem(`specbot_messages_${id}`)
    deleteChatHistoryApi(id).catch(err => console.error('[chat] delete history error:', err))

    if (updatedSessions.length === 0) {
      // Re-initialize if all deleted
      const newId = Date.now().toString()
      const firstSession: ChatSession = {
        id: newId,
        title: pickText(language, { en: 'New Conversation', th: 'การสนทนาใหม่' }),
        createdAt: Date.now(),
      }
      setSessions([firstSession])
      setActiveSessionId(newId)
      localStorage.setItem('specbot_sessions', JSON.stringify([firstSession]))
    } else {
      setSessions(updatedSessions)
      if (activeSessionId === id) {
        setActiveSessionId(updatedSessions[0].id)
      }
      localStorage.setItem('specbot_sessions', JSON.stringify(updatedSessions))
    }
  }

  const handleUpdateTitle = (id: string, newTitle: string) => {
    const trimmed = newTitle.trim()
    if (!trimmed) return
    const updatedSessions = sessions.map(s => s.id === id ? { ...s, title: trimmed } : s)
    setSessions(updatedSessions)
    localStorage.setItem('specbot_sessions', JSON.stringify(updatedSessions))
    setEditingSessionId(null)
  }

  const mutation = useMutation({
    mutationFn: (query: string) => searchApi({ query, sessionId: activeSessionId ?? undefined }),
    onSuccess: (data) => {
      startTransition(() => {
        setMessages((prev) => [
          ...prev,
          { id: Date.now().toString(), role: 'bot', content: data.answer, response: data },
        ])
      })
    },
    onError: () => {
      startTransition(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: 'bot',
            content: pickText(language, {
              en: 'Search is temporarily unavailable. Please try again, or use the compare section while the answer service recovers.',
              th: 'ระบบค้นหายังตอบกลับไม่ได้ในตอนนี้ ลองถามใหม่อีกครั้ง หรือเลือกใช้ส่วน Compare แทนชั่วคราว',
            }),
          },
        ])
      })
    },
  })

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, mutation.isPending])

  const handleFeedback = async (messageId: string, rating: number) => {
    if (!activeSessionId) return
    const msg = messages.find(m => m.id === messageId)
    if (!msg || msg.role !== 'bot' || !msg.response) return

    // Pessimistic UI update: update only if message found
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, rating } : m))

    try {
      await submitFeedbackApi({
        sessionId: activeSessionId,
        messageId: messageId,
        query: messages.find((m, idx) => messages[idx + 1]?.id === messageId)?.content || '',
        answer: msg.content,
        rating: rating
      })
    } catch (e) {
      console.error('Feedback failed', e)
    }
  }

  const submitQuery = (query: string) => {
    const trimmed = query.trim()
    if (!trimmed || mutation.isPending) return

    // Add to recent queries (unique, max 10)
    const updatedRecent = [trimmed, ...recentQueries.filter(q => q !== trimmed)].slice(0, 10)
    setRecentQueries(updatedRecent)
    localStorage.setItem('specbot_recent_queries', JSON.stringify(updatedRecent))

    startTransition(() => {
      setMessages((prev) => [
        ...prev,
        { id: `${Date.now()}-user`, role: 'user', content: trimmed },
      ])
    })
    mutation.mutate(trimmed)
    setInput('')
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submitQuery(input)
  }

  return (
    <section className="relative bg-white dark:bg-slate-950 overflow-hidden flex-1 flex flex-col h-full rounded-none border-0 ring-0 pb-safe">
      <div className="surface-panel border-b border-slate-200/50 dark:border-white/5 text-slate-900 dark:text-white">
        <div className="flex items-center justify-between px-5 pt-8 pb-4 md:px-6">
          <button
            onClick={() => setIsHeaderExpanded(!isHeaderExpanded)}
            className="flex items-center gap-3 transition-colors hover:text-sky-500 text-left cursor-pointer group"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400">
              <MessagesSquare className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-black tracking-tight leading-none text-slate-950 dark:text-white">
                {pickText(language, {
                  en: 'SPEX AI Assistant',
                  th: 'ผู้ช่วย Specbot AI',
                })}
              </h2>
              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-sky-500 transition-colors">
                {isHeaderExpanded
                  ? pickText(language, { en: 'Click to collapse', th: 'คลิกเพื่อย่อควิกเมนู' })
                  : pickText(language, { en: 'Click to expand tools', th: 'คลิกเพื่อขยายเครื่องมือ' })
                }
              </p>
            </div>
          </button>

          <button
            onClick={() => setIsHeaderExpanded(!isHeaderExpanded)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-sky-100 hover:text-sky-600 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-sky-400 transition-all shadow-sm cursor-pointer"
          >
            {isHeaderExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>

        <AnimatePresence>
          {isHeaderExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-6 md:px-6 space-y-5">
                <div className="flex flex-wrap gap-1.5 pl-11">
                  {['Kaggle_Data', 'RAG', 'Typhoon'].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md border border-slate-200 bg-slate-50/50 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {quickPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => submitQuery(prompt)}
                        className="rounded-full border border-slate-200 bg-slate-50 px-3.5 py-2 text-left text-xs font-semibold text-slate-700 transition-all hover:bg-slate-100 dark:border-white/12 dark:bg-white/8 dark:text-slate-100 dark:hover:bg-white/14 shadow-sm cursor-pointer"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>

                  {recentQueries.length > 0 && (
                    <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-500">
                      <div className="flex items-center gap-2 mb-2 px-1">
                        <History className="h-3 w-3 text-slate-400" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                          {pickText(language, { en: 'Recent Searches', th: 'การค้นหาล่าสุด' })}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {recentQueries.map((q) => (
                          <button
                            key={q}
                            type="button"
                            onClick={() => submitQuery(q)}
                            className="group rounded-full border border-slate-200/50 bg-white px-3 py-1.5 text-xs font-bold text-slate-500 transition-all hover:border-sky-500/30 hover:bg-sky-50 dark:border-white/5 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10 shadow-sm cursor-pointer"
                          >
                            <span className="truncate max-w-[120px] inline-block">{q}</span>
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            setRecentQueries([])
                            localStorage.removeItem('specbot_recent_queries')
                          }}
                          className="rounded-full px-2 py-1.5 text-[10px] font-black text-rose-500/50 hover:text-rose-500 transition-colors uppercase tracking-tight"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-60 bg-white/98 backdrop-blur-md px-5 py-6 flex flex-col justify-center dark:bg-slate-950/98 md:px-6"
          >
            <motion.div
              initial={{ y: 20, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 20, scale: 0.95 }}
              className="space-y-6"
            >
              <div className="space-y-2 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400">
                  <Trash2 className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-black uppercase tracking-widest text-rose-600 dark:text-rose-400">
                    {pickText(language, { en: 'Final Confirmation', th: 'ยืนยันขั้นตอนสุดท้าย' })}
                  </p>
                  <p className="text-base font-bold leading-relaxed text-slate-900 dark:text-white">
                    {pickText(language, {
                      en: 'Delete this conversation permanently?',
                      th: 'คุณแน่ใจว่าต้องการลบแชทนี้ถาวรใช่หรือไม่?',
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 rounded-2xl border border-slate-200 bg-slate-100 py-4 text-xs font-black uppercase tracking-wider text-slate-600 transition-all hover:bg-slate-200 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                >
                  {pickText(language, { en: 'No, Keep it', th: 'ยกเลิก' })}
                </button>
                <button
                  onClick={(e) => {
                    activeSessionId && handleDeleteSession(e, activeSessionId)
                    setShowDeleteConfirm(false)
                  }}
                  className="flex-1 rounded-2xl bg-rose-600 py-4 text-xs font-black uppercase tracking-wider text-white shadow-xl shadow-rose-500/25 transition-all hover:bg-rose-700 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {pickText(language, { en: 'Yes, Delete', th: 'ตกลง (ลบข้อมูล)' })}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNewChatConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-white/95 backdrop-blur-md px-5 py-6 flex flex-col justify-center dark:bg-slate-950/95 md:px-6"
          >
            <motion.div
              initial={{ y: 20, scale: 0.95 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 20, scale: 0.95 }}
              className="space-y-6"
            >
              <div className="space-y-2 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400">
                  <Sparkles className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-black uppercase tracking-widest text-sky-600 dark:text-sky-400">
                    {pickText(language, { en: 'Action Required', th: 'เริ่มแชทใหม่' })}
                  </p>
                  <p className="text-sm font-bold leading-relaxed text-slate-900 dark:text-white">
                    {pickText(language, {
                      en: 'Start a new research conversation?',
                      th: 'ต้องการเริ่มการสนทนาใหม่หรือไม่?',
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowNewChatConfirm(false)}
                  className="flex-1 rounded-2xl border border-slate-200 bg-slate-100 py-4 text-xs font-black uppercase tracking-wider text-slate-600 transition-all hover:bg-slate-200 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
                >
                  {pickText(language, { en: 'No, Back', th: 'ยกเลิก' })}
                </button>
                <button
                  onClick={() => {
                    handleCreateSession()
                    setShowNewChatConfirm(false)
                  }}
                  className="flex-1 rounded-2xl bg-sky-600 py-4 text-xs font-black uppercase tracking-wider text-white shadow-xl shadow-sky-500/25 transition-all hover:bg-sky-700 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {pickText(language, { en: 'Yes, Start', th: 'เริ่มแชทใหม่' })}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSessionList && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-white/95 backdrop-blur-md px-5 py-10 flex flex-col justify-start dark:bg-slate-950/95 md:px-6"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400">
                  <History className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">
                    {pickText(language, { en: 'Sessions Explorer', th: 'รายการสนทนาของคุณ' })}
                  </h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    {sessions.length} {pickText(language, { en: 'Saved Conversations', th: 'บทสนทนาที่บันทึกไว้' })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSessionList(false)}
                className="group flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition-all hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
              >
                <X className="h-5 w-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-white transition-colors" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3 pb-8">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className={`group relative rounded-3xl border p-4.5 transition-all ${activeSessionId === s.id
                      ? 'border-indigo-200 bg-indigo-50/50 shadow-md dark:border-indigo-500/30 dark:bg-indigo-500/10'
                      : 'border-slate-200 bg-white hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20'
                    }`}
                >
                  {editingSessionId === s.id ? (
                    <div className="flex items-center gap-3">
                      <input
                        autoFocus
                        value={tempTitle}
                        onChange={(e) => setTempTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleUpdateTitle(s.id, tempTitle)
                          if (e.key === 'Escape') setEditingSessionId(null)
                        }}
                        className="flex-1 bg-transparent text-sm font-bold text-slate-900 outline-none dark:text-white ring-0 border-0"
                      />
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleUpdateTitle(s.id, tempTitle)}
                          className="rounded-full bg-emerald-500 p-2 text-white shadow-sm hover:bg-emerald-600 transition-colors"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingSessionId(null)}
                          className="rounded-full bg-slate-200 p-2 text-slate-500 hover:bg-slate-300 dark:bg-white/10 dark:text-slate-400 transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-4">
                      <button
                        onClick={() => {
                          setActiveSessionId(s.id)
                          setShowSessionList(false)
                        }}
                        className="flex-1 text-left cursor-pointer"
                      >
                        <p className={`text-sm font-black truncate mb-1 ${activeSessionId === s.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>
                          {s.title}
                        </p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          {new Date(s.createdAt).toLocaleDateString(language === 'en' ? 'en-US' : 'th-TH', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </button>
                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingSessionId(s.id)
                            setTempTitle(s.title)
                          }}
                          className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:bg-sky-50 hover:text-sky-500 dark:hover:bg-white/10 transition-all"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setActiveSessionId(s.id)
                            setShowDeleteConfirm(true)
                          }}
                          className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-white/10 transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-6 md:px-6 custom-scrollbar">
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.24, ease: 'easeOut' }}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'bot' && (
                    <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-sm">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}

                  <div className={`max-w-[88%] space-y-2 ${message.role === 'user' ? 'items-end' : ''}`}>
                    <div
                      className={
                        message.role === 'user'
                          ? 'rounded-[1.5rem] rounded-tr-lg bg-slate-950 px-4.5 py-3.5 text-sm leading-relaxed text-white shadow-md dark:bg-white dark:text-slate-950 font-medium'
                          : 'rounded-[1.5rem] rounded-tl-lg bg-slate-100 px-4.5 py-3.5 text-sm leading-relaxed text-slate-800 border border-slate-200/50 dark:border-white/5 dark:bg-white/5 dark:text-slate-100 font-medium'
                      }
                    >
                      {message.role === 'bot' && index === messages.length - 1 && index !== 0 ? (
                        <TypewriterText text={message.content} />
                      ) : (
                        <p className="whitespace-pre-wrap">
                          {message.id === 'init'
                            ? pickText(language, {
                              en: 'SpecBot is ready to help you discover and compare smartphones. Start with a natural-language question or tap one of the prompts below.',
                              th: 'SpecBot พร้อมช่วยคุณหาและเทียบสเปคมือถือ ลองพิมพ์คำถาม หรือกดตัวอย่างด้านล่างเพื่อเริ่มต้นได้เลย',
                            })
                            : message.content}
                        </p>
                      )}
                    </div>

                    {message.role === 'bot' && message.response?.sources && message.response.sources.length > 0 && (
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-wrap gap-2">
                          {message.response.sources.map((source) => (
                            <SourceCitation
                              key={`${message.id}-${source.brand}-${source.model}-${source.source_url}`}
                              brand={source.brand}
                              model={source.model}
                              url={source.source_url}
                            />
                          ))}
                        </div>

                        {/* Feedback Actions */}
                        <div className="flex items-center gap-4 pl-1">
                          <button
                            onClick={() => handleFeedback(message.id, 1)}
                            className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${message.rating === 1 ? 'text-emerald-500 scale-110' : 'text-slate-400 hover:text-emerald-500'}`}
                          >
                            <ThumbsUp className={`h-3 w-3 ${message.rating === 1 ? 'fill-emerald-500' : ''}`} />
                            {message.rating === 1 ? 'Helpful' : 'Like'}
                          </button>
                          <button
                            onClick={() => handleFeedback(message.id, -1)}
                            className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-all ${message.rating === -1 ? 'text-rose-500 scale-110' : 'text-slate-400 hover:text-rose-500'}`}
                          >
                            <ThumbsDown className={`h-3 w-3 ${message.rating === -1 ? 'fill-rose-500' : ''}`} />
                            {message.rating === -1 ? 'Not Helpful' : 'Unlike'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {message.role === 'user' && (
                    <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {mutation.isPending && (
              <div className="flex gap-3">
                <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-sm">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="rounded-[1.5rem] rounded-tl-lg bg-slate-100 px-4.5 py-3.5 text-sm font-medium text-slate-600 border border-slate-200/50 dark:border-white/5 dark:bg-white/5 dark:text-slate-200">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {pickText(language, { en: 'Searching relevant specs...', th: 'กำลังค้นหาสเปคที่เกี่ยวข้อง...' })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="relative border-t border-slate-200/80 bg-white/80 px-5 py-5 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/80 md:px-6">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="flex items-center gap-3">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={pickText(language, {
                  en: 'e.g. Samsung under 20k + Good Camera',
                  th: 'เช่น Samsung ไม่เกิน 20k + กล้องสวย',
                })}
                className="h-14 rounded-full border-slate-200 bg-white px-6 text-sm font-medium text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:border-sky-500 focus-visible:ring-sky-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500"
                disabled={mutation.isPending}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || mutation.isPending}
                className="h-14 w-14 shrink-0 rounded-full bg-slate-950 text-white shadow-lg hover:scale-105 active:scale-95 transition-all dark:bg-white dark:text-slate-950 cursor-pointer"
              >
                <ArrowUpRight className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex items-center justify-between gap-4 pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowSessionList(true)}
                  className="group relative flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50/50 px-4 py-2 text-left transition-all hover:bg-slate-100 hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/8 cursor-pointer"
                >
                  <History className="h-3.5 w-3.5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                  <span className="max-w-[120px] truncate text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    {sessions.find((s) => s.id === activeSessionId)?.title ||
                      pickText(language, { en: 'Select Session', th: 'เลือกบทสนทนา' })}
                  </span>
                  <ChevronUp className="h-3 w-3 text-slate-400 group-hover:text-indigo-500 transition-transform group-hover:-translate-y-0.5" />
                </button>

                <button
                  type="button"
                  onClick={() => setShowNewChatConfirm(true)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-all hover:bg-slate-50 hover:text-sky-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-sky-400 cursor-pointer shadow-sm"
                  title={pickText(language, { en: 'New Conversation', th: 'เริ่มแชทใหม่' })}
                >
                  <PlusCircle className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center gap-2 px-2">
                <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400/80">
                  Neural Engine v1.1
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}

function TypewriterText({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState('')

  useEffect(() => {
    let buffer = ''
    let index = 0
    const interval = window.setInterval(() => {
      buffer += text.charAt(index)
      setDisplayed(buffer)
      index += 1
      if (index >= text.length) {
        window.clearInterval(interval)
      }
    }, 10)

    return () => window.clearInterval(interval)
  }, [text])

  return <p className="whitespace-pre-wrap">{displayed}</p>
}
