import React, { useState, useCallback, useEffect, useRef } from 'react'
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Modal,
  Dimensions,
  LayoutAnimation,
  UIManager,
  ScrollView,
} from 'react-native'
import Animated from 'react-native-reanimated'
import { useMutation } from '@tanstack/react-query'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'
import { 
  Bot, 
  MessagesSquare,
  Zap, 
  Search, 
  History, 
  Trash2, 
  BarChart3, 
  ChevronUp, 
  ChevronDown,
  ThumbsUp,
  ThumbsDown,
  ArrowRight,
  User as UserIcon,
  X,
  Plus,
  Sparkles,
  Edit2,
  Check,
} from 'lucide-react-native'
import { Colors, Fonts, Spacing, Radius } from '../lib/constants'
import { searchProducts } from '../lib/api'
import type { SearchResponse, SearchSource } from '../types/spec'
import { useUiPreferences } from '../context/ui-context'
import { getFontFamily } from '../lib/fonts'

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true)
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window')
const SEARCH_HISTORY_KEY = '@spex_search_history'
const ACTIVE_CHAT_KEY = '@spex_active_chat'
const SAVED_SESSIONS_KEY = '@spex_saved_sessions'
const SUGGESTED_QUERIES = [
  'Phones with strong battery life at a mid-range price',
  'Compare Galaxy S21 and Galaxy S22',
  'Which models have 12 GB RAM?',
]

interface Message {
  id: string
  role: 'user' | 'bot'
  text: string
  sources?: SearchSource[]
  isPending?: boolean
  feedback?: 'like' | 'dislike'
}

interface ChatSession {
  id: string
  title: string
  timestamp: string
  messages: Message[]
}

interface ChatbotPopupProps {
  visible: boolean
  onClose: () => void
}

export default function ChatbotPopup({ visible, onClose }: ChatbotPopupProps) {
  const router = useRouter()
  const { language, theme } = useUiPreferences()
  const currentColors = theme === 'dark' ? Colors.dark : Colors.light
  const [query, setQuery] = useState('')
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [history, setHistory] = useState<string[]>([])
  const [savedSessions, setSavedSessions] = useState<ChatSession[]>([])
  const flatListRef = useRef<FlatList>(null)
  const [activeOverlay, setActiveOverlay] = useState<'none' | 'history' | 'new_chat' | 'delete'>('none')
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null)
  const [tempTitle, setTempTitle] = useState('')
  
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [activeSessionTitle, setActiveSessionTitle] = useState<string | null>(null)
  const [activeSessionTimestamp, setActiveSessionTimestamp] = useState<string | null>(null)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  

  useEffect(() => {
    if (visible) {
      // Load Query History
      AsyncStorage.getItem(SEARCH_HISTORY_KEY).then((data: any) => {
        if (data) setHistory(JSON.parse(data))
      })
      // Load Active Chat
      AsyncStorage.getItem(ACTIVE_CHAT_KEY).then((data: any) => {
        if (data) setMessages(JSON.parse(data))
      })
      // Load Active Metadata
      AsyncStorage.getItem('@spex_active_metadata').then((data: any) => {
        if (data) {
          const meta = JSON.parse(data)
          setActiveSessionId(meta.id)
          setActiveSessionTitle(meta.title)
          setActiveSessionTimestamp(meta.timestamp)
        }
      })
      // Load Saved Sessions
      AsyncStorage.getItem(SAVED_SESSIONS_KEY).then((data: any) => {
        if (data) setSavedSessions(JSON.parse(data))
      })
    }
  }, [visible])

  // Auto-save active chat & metadata
  useEffect(() => {
    if (messages.length > 0) {
      AsyncStorage.setItem(ACTIVE_CHAT_KEY, JSON.stringify(messages))
      
      if (activeSessionId) {
        AsyncStorage.setItem('@spex_active_metadata', JSON.stringify({
          id: activeSessionId,
          title: activeSessionTitle || activeSessionId,
          timestamp: activeSessionTimestamp
        }))
      }
    }
  }, [messages, activeSessionId, activeSessionTitle, activeSessionTimestamp])

  const toggleHeader = () => {
    setIsHeaderExpanded(prev => !prev)
  }

  const chevronStyle = { transform: [{ rotate: isHeaderExpanded ? '180deg' : '0deg' }] }

  const saveToHistory = async (q: string) => {
    const updated = [q, ...history.filter((h) => h !== q)].slice(0, 10)
    setHistory(updated)
    await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated))
  }

  const searchMutation = useMutation({
    mutationFn: (q: string) => searchProducts(q),
    onSuccess: (data: SearchResponse, q: string) => {
      setMessages(prev => prev.map(msg => 
        msg.isPending ? { ...msg, text: data.answer, sources: data.sources, isPending: false } : msg
      ))
      saveToHistory(q)
    },
    onError: () => {
      setMessages(prev => prev.map(msg => 
        msg.isPending ? { ...msg, text: "Sorry, I encountered an error. Please try again.", isPending: false } : msg
      ))
    }
  })

  const handleSearch = useCallback((q: string = query) => {
    const trimmed = q.trim()
    if (!trimmed || searchMutation.isPending) return
    
    setQuery('')
    Keyboard.dismiss()
    if (isHeaderExpanded) toggleHeader()

    if (messages.length === 0 && !activeSessionId) {
      const sId = `SID-${Date.now().toString().slice(-6)}`
      setActiveSessionId(sId)
      setActiveSessionTitle(sId)
      setActiveSessionTimestamp(new Date().toLocaleString('en-US', { 
        weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
      }).toUpperCase())
    }

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: trimmed }
    const botMsg: Message = { id: (Date.now() + 1).toString(), role: 'bot', text: '', isPending: true }
    
    setMessages(prev => [...prev, userMsg, botMsg])
    searchMutation.mutate(trimmed)
  }, [query, searchMutation, isHeaderExpanded])

  const clearHistory = async () => {
    setHistory([])
    await AsyncStorage.removeItem(SEARCH_HISTORY_KEY)
  }

  const handleFeedback = (msgId: string, type: 'like' | 'dislike') => {
    setMessages(prev => prev.map(msg => 
      msg.id === msgId ? { ...msg, feedback: type } : msg
    ))
  }

  const handleStartNewChat = async () => {
    if (messages.length > 0 && activeSessionId) {
      const newSession: ChatSession = {
        id: activeSessionId,
        title: activeSessionTitle || activeSessionId,
        timestamp: activeSessionTimestamp || '',
        messages: messages
      }
      const updatedSessions = [newSession, ...savedSessions]
      setSavedSessions(updatedSessions)
      await AsyncStorage.setItem(SAVED_SESSIONS_KEY, JSON.stringify(updatedSessions))
    }
    
    setMessages([])
    setActiveSessionId(null)
    setActiveSessionTitle(null)
    setActiveSessionTimestamp(null)
    await AsyncStorage.removeItem(ACTIVE_CHAT_KEY)
    await AsyncStorage.removeItem('@spex_active_metadata')
    setActiveOverlay('none')
    if (!isHeaderExpanded) toggleHeader()
  }

  const handleConfirmDelete = async () => {
    if (!pendingDeleteId) return
    
    if (pendingDeleteId === activeSessionId) {
      setMessages([])
      setActiveSessionId(null)
      setActiveSessionTitle(null)
      setActiveSessionTimestamp(null)
      await AsyncStorage.removeItem(ACTIVE_CHAT_KEY)
      await AsyncStorage.removeItem('@spex_active_metadata')
    } else {
      const updated = savedSessions.filter(s => s.id !== pendingDeleteId)
      setSavedSessions(updated)
      await AsyncStorage.setItem(SAVED_SESSIONS_KEY, JSON.stringify(updated))
    }
    
    setPendingDeleteId(null)
    setActiveOverlay('none')
  }

  const handleResumeSession = (session: ChatSession) => {
    setMessages(session.messages)
    setActiveOverlay('none')
    if (isHeaderExpanded) toggleHeader()
  }

  const handleDeleteSession = async (id: string) => {
    if (id === activeSessionId) {
      setMessages([])
      setActiveSessionId(null)
      setActiveSessionTitle(null)
      setActiveSessionTimestamp(null)
      await AsyncStorage.removeItem(ACTIVE_CHAT_KEY)
      await AsyncStorage.removeItem('@spex_active_metadata')
    } else {
      const updated = savedSessions.filter(s => s.id !== id)
      setSavedSessions(updated)
      await AsyncStorage.setItem(SAVED_SESSIONS_KEY, JSON.stringify(updated))
    }
  }

  const handleStartRename = (session: ChatSession | { id: string, title: string }) => {
    setEditingSessionId(session.id)
    setTempTitle(session.title)
  }

  const handleSaveRename = async () => {
    if (!editingSessionId) return
    
    if (editingSessionId === activeSessionId) {
      setActiveSessionTitle(tempTitle)
    } else {
      const updated = savedSessions.map(s => 
        s.id === editingSessionId ? { ...s, title: tempTitle } : s
      )
      setSavedSessions(updated)
      await AsyncStorage.setItem(SAVED_SESSIONS_KEY, JSON.stringify(updated))
    }
    setEditingSessionId(null)
  }

  const renderSourceCard = ({ item }: { item: SearchSource }) => (
    <View style={[styles.sourceCardMini, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderColor: currentColors.border }]}>
      <View style={styles.sourceHeaderMini}>
        <BarChart3 size={10} color={Colors.primary} />
        <Text style={[styles.sourceBrandMini, { color: Colors.primary, fontFamily: getFontFamily(language, 'black') }]}>{item.brand.toUpperCase()}</Text>
      </View>
      <Text style={[styles.sourceModelMini, { color: currentColors.text, fontFamily: getFontFamily(language, 'bold') }]} numberOfLines={1}>{item.model}</Text>
      <Text style={[styles.sourceTagMini, { color: currentColors.textMuted, fontFamily: getFontFamily(language) }]}>Dataset</Text>
    </View>
  )

  const renderMessage = ({ item }: { item: Message }) => {
    if (item.role === 'user') {
      return (
        <View style={styles.userMsgContainer}>
          <View style={styles.userRow}>
            <View style={[styles.userBubble, { borderColor: theme === 'dark' ? 'transparent' : 'rgba(0,0,0,0.05)', borderWidth: theme === 'dark' ? 0 : 1 }]}>
              <Text style={[styles.userText, { color: '#0a0d14', fontFamily: getFontFamily(language, 'medium') }]}>{item.text}</Text>
            </View>
            <View style={styles.userIconCircle}>
              <UserIcon size={16} color="#fff" />
            </View>
          </View>
        </View>
      )
    }

    return (
      <View style={styles.botMsgContainer}>
        <View style={styles.botRow}>
          <View style={[styles.botIconCircleSmall, { backgroundColor: currentColors.surfaceStrong }]}>
            <Bot size={16} color={Colors.primary} />
          </View>
          <View style={[styles.botBubble, { backgroundColor: currentColors.surfaceStrong }]}>
            {item.isPending ? (
              <ActivityIndicator size="small" color={Colors.primary} style={{ alignSelf: 'flex-start' }} />
            ) : (
              <>
                <Text style={[styles.botText, { color: currentColors.text, fontFamily: getFontFamily(language) }]}>{item.text}</Text>
                {item.sources && item.sources.length > 0 && (
                  <FlatList
                    data={item.sources}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(src, i) => `${src.model}-${i}`}
                    renderItem={renderSourceCard}
                    contentContainerStyle={styles.messageSourceList}
                  />
                )}
                <View style={styles.feedbackRow}>
                  <TouchableOpacity 
                    style={[styles.feedbackBtn, item.feedback === 'like' && styles.feedbackBtnActive]}
                    onPress={() => handleFeedback(item.id, 'like')}
                  >
                    <ThumbsUp size={12} color={item.feedback === 'like' ? '#fff' : Colors.dark.textMuted} />
                    <Text style={[styles.feedbackText, item.feedback === 'like' && styles.feedbackTextActive]}>LIKE</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.feedbackBtn, item.feedback === 'dislike' && styles.feedbackBtnActive]}
                    onPress={() => handleFeedback(item.id, 'dislike')}
                  >
                    <ThumbsDown size={12} color={item.feedback === 'dislike' ? '#ef4444' : currentColors.textMuted} />
                    <Text style={[styles.feedbackText, { color: item.feedback === 'dislike' ? '#ef4444' : currentColors.textMuted, fontFamily: getFontFamily(language, 'black') }]}>UNLIKE</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </View>
    )
  }

  return (
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        style={styles.overlay}
        keyboardVerticalOffset={Platform.OS === 'android' ? 0 : 0}
      >
        <TouchableOpacity style={styles.dismissArea} activeOpacity={1} onPress={onClose} />
        <View style={[styles.popupContainer, { backgroundColor: currentColors.surface, borderColor: currentColors.border }]}
        >
          
          {/* SECTION 1: COLLAPSIBLE HEADER */}
          <View style={styles.sectionHeader}>
            <TouchableOpacity onPress={toggleHeader} activeOpacity={0.9} style={styles.mainTitleBar}>
              <View style={styles.titleLeft}>
                <View style={styles.botIconCircle}>
                  <MessagesSquare size={20} color={Colors.primary} />
                </View>
                <View>
                  <Text style={[styles.headerTitle, { color: currentColors.text, fontFamily: getFontFamily(language, 'bold') }]}>SPEX-Shop AI Assistant</Text>
                  <Text style={[styles.headerSubtitle, { color: currentColors.textMuted, fontFamily: getFontFamily(language, 'black') }]}>CLICK TO {isHeaderExpanded ? 'COLLAPSE' : 'EXPAND'}</Text>
                </View>
              </View>
              <View style={[styles.titleRight, chevronStyle]}>
                <ChevronDown size={20} color={currentColors.textMuted} />
              </View>
            </TouchableOpacity>

            {isHeaderExpanded && (
              <View style={styles.expandedContent}>
                <View style={styles.badgeRow}>
                  <View style={[styles.badge, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderColor: currentColors.border }]}>
                    <Text style={[styles.badgeText, { color: currentColors.textMuted, fontFamily: getFontFamily(language, 'black') }]}>KAGGLE_DATA</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderColor: currentColors.border }]}>
                    <Text style={[styles.badgeText, { color: currentColors.textMuted, fontFamily: getFontFamily(language, 'black') }]}>RAG</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderColor: currentColors.border }]}>
                    <Text style={[styles.badgeText, { color: currentColors.textMuted, fontFamily: getFontFamily(language, 'black') }]}>SCBX10_TYPHOON</Text>
                  </View>
                </View>

                <View style={styles.examplesContainer}>
                  {SUGGESTED_QUERIES.map(q => (
                    <TouchableOpacity 
                      key={q} 
                      style={[styles.exampleBtn, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderColor: currentColors.border }]} 
                      onPress={() => handleSearch(q)}
                    >
                      <Text style={[styles.exampleText, { color: currentColors.text, fontFamily: getFontFamily(language, 'semibold') }]}>{q}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {history.length > 0 && (
                  <View style={styles.recentContainer}>
                    <View style={styles.recentHeader}>
                       <View style={styles.recentIconRow}>
                          <History size={12} color={currentColors.textMuted} />
                          <Text style={[styles.recentLabel, { color: currentColors.textMuted, fontFamily: getFontFamily(language, 'black') }]}>RECENT SEARCHES</Text>
                       </View>
                       <TouchableOpacity onPress={clearHistory}><Text style={[styles.clearText, { fontFamily: getFontFamily(language, 'black') }]}>CLEAR</Text></TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentList}>
                      {history.map(h => (
                        <TouchableOpacity 
                          key={h} 
                          style={[styles.recentChip, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderColor: currentColors.border }]} 
                          onPress={() => handleSearch(h)}
                        >
                          <Text style={[styles.recentChipText, { color: currentColors.textSecondary, fontFamily: getFontFamily(language) }]} numberOfLines={1}>{h}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* SECTION 2: CHAT HISTORY */}
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={item => item.id}
            renderItem={renderMessage}
            style={styles.chatList}
            contentContainerStyle={styles.chatContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            ListEmptyComponent={
              !isHeaderExpanded ? (
                <View style={styles.emptyContainer}>
                  <Bot size={48} color={Colors.dark.surfaceStrong} />
                  <Text style={styles.emptyText}>How can I help you today?</Text>
                </View>
              ) : null
            }
          />

          {/* SECTION 3: TEXT BAR */}
           <View style={[styles.textBarSection, { borderTopColor: currentColors.border }]}>
            <View style={[styles.inputWrapper, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderColor: currentColors.border }]}>
              <TextInput
                style={[styles.input, { maxHeight: 100, color: currentColors.text, fontFamily: getFontFamily(language) }]}
                value={query}
                onChangeText={setQuery}
                placeholder="Ask about smartphones..."
                placeholderTextColor={currentColors.textMuted}
                onSubmitEditing={() => handleSearch()}
                multiline
              />
              <TouchableOpacity
                style={[styles.submitBtn, searchMutation.isPending && styles.submitBtnDisabled, { backgroundColor: theme === 'dark' ? currentColors.textSecondary : Colors.primary }]}
                onPress={() => handleSearch()}
                disabled={searchMutation.isPending}
              >
                {searchMutation.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <ArrowRight size={20} color={theme === 'dark' ? Colors.dark.background : '#fff'} />
                )}
              </TouchableOpacity>
            </View>
            <View style={styles.textBarFooter}>
               <TouchableOpacity 
                style={[styles.footerBtn, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderColor: currentColors.border }]} 
                onPress={() => setActiveOverlay('history')}
              >
                  <History size={16} color={currentColors.text} />
                  <Text style={[styles.footerBtnText, { color: currentColors.text, fontFamily: getFontFamily(language, 'black') }]}>SESSIONS EXPLORER</Text>
                  <ChevronUp size={14} color={currentColors.text} />
               </TouchableOpacity>
               <View style={styles.footerIcons}>
                  <TouchableOpacity 
                    style={[styles.iconCircle, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderColor: currentColors.border }]}
                    onPress={() => setActiveOverlay('new_chat')}
                  >
                    <Plus size={18} color={currentColors.textMuted} />
                  </TouchableOpacity>
               </View>
            </View>
          </View>

          {/* OVERLAYS */}
           {activeOverlay === 'history' && (
            <Animated.View style={[styles.overlayContainer, { backgroundColor: currentColors.background }]}>
              <View style={styles.overlayHeader}>
                <View style={styles.overlayTitleRow}>
                  <View style={styles.overlayIconCircle}>
                    <History size={18} color="#fff" />
                  </View>
                  <View>
                    <Text style={[styles.overlayTitleText, { color: currentColors.text, fontFamily: getFontFamily(language, 'black') }]}>SESSIONS EXPLORER</Text>
                    <Text style={[styles.overlaySubtitleText, { color: currentColors.textMuted, fontFamily: getFontFamily(language, 'bold') }]}>{savedSessions.length} SAVED CONVERSATIONS</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => setActiveOverlay('none')}>
                  <X size={20} color={currentColors.textMuted} />
                </TouchableOpacity>
              </View>
              <ScrollView contentContainerStyle={styles.overlayScroll}>
                {/* ACTIVE SESSION CARD */}
                {messages.length > 0 && activeSessionId && (
                  <View style={[styles.historyCard, styles.activeHistoryCard, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)', borderColor: currentColors.border }]}>
                    <View style={styles.historyCardHeader}>
                      <Text style={styles.activeTag}>Current Session</Text>
                      <View style={styles.cardActions}>
                        <TouchableOpacity style={styles.editBtn} onPress={() => editingSessionId === activeSessionId ? handleSaveRename() : handleStartRename({ id: activeSessionId, title: activeSessionTitle || activeSessionId })}>
                          {editingSessionId === activeSessionId ? <Check size={16} color={Colors.primary} /> : <Edit2 size={14} color={currentColors.textMuted} />}
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.editBtn} onPress={() => {
                          setPendingDeleteId(activeSessionId)
                          setActiveOverlay('delete')
                        }}>
                          <Trash2 size={14} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                    
                    {editingSessionId === activeSessionId ? (
                      <TextInput
                        style={[styles.renameInput, { color: currentColors.text, borderBottomColor: Colors.primary }]}
                        value={tempTitle}
                        onChangeText={setTempTitle}
                        autoFocus
                        onBlur={handleSaveRename}
                        onSubmitEditing={handleSaveRename}
                      />
                    ) : (
                      <TouchableOpacity style={{ flex: 1 }} onPress={() => setActiveOverlay('none')}>
                        <Text style={[styles.historyCardTitle, { color: currentColors.text, fontFamily: getFontFamily(language, 'bold') }]}>
                          {activeSessionTitle || activeSessionId}
                        </Text>
                      </TouchableOpacity>
                    )}
                    
                    <Text style={[styles.historyCardMeta, { color: currentColors.textMuted, fontFamily: getFontFamily(language, 'bold') }]}>{activeSessionTimestamp}</Text>
                  </View>
                )}

                {/* ARCHIVED SESSIONS */}
                {savedSessions.map(session => (
                  <View key={session.id} style={[styles.historyCard, { backgroundColor: 'rgba(20, 104, 255, 0.05)', borderColor: 'rgba(20, 104, 255, 0.2)' }]}>
                    <View style={styles.historyCardHeader}>
                      {editingSessionId === session.id ? (
                        <TextInput
                          style={[styles.renameInput, { color: currentColors.text, borderBottomColor: Colors.primary }]}
                          value={tempTitle}
                          onChangeText={setTempTitle}
                          autoFocus
                          onBlur={handleSaveRename}
                          onSubmitEditing={handleSaveRename}
                        />
                      ) : (
                        <TouchableOpacity 
                          style={{ flex: 1 }} 
                          onPress={() => handleResumeSession(session)}
                        >
                          <Text style={[styles.historyCardTitle, { color: Colors.primary, fontFamily: getFontFamily(language, 'bold') }]} numberOfLines={1}>
                            {session.title}
                          </Text>
                        </TouchableOpacity>
                      )}
                      
                      <View style={styles.cardActions}>
                        <TouchableOpacity 
                          onPress={() => editingSessionId === session.id ? handleSaveRename() : handleStartRename(session)}
                          style={styles.editBtn}
                        >
                          {editingSessionId === session.id ? (
                            <Check size={16} color={Colors.primary} />
                          ) : (
                            <Edit2 size={14} color={currentColors.textMuted} />
                          )}
                        </TouchableOpacity>
                        <TouchableOpacity 
                          onPress={() => {
                            setPendingDeleteId(session.id)
                            setActiveOverlay('delete')
                          }}
                          style={styles.editBtn}
                        >
                          <Trash2 size={14} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <Text style={[styles.historyCardMeta, { color: currentColors.textMuted, fontFamily: getFontFamily(language, 'bold') }]}>{session.timestamp}</Text>
                  </View>
                ))}
                
                {savedSessions.length === 0 && messages.length === 0 && (
                  <View style={styles.emptyContainer}>
                    <History size={48} color={currentColors.surfaceStrong} />
                    <Text style={[styles.emptyText, { color: currentColors.textMuted, fontFamily: getFontFamily(language) }]}>No saved sessions found.</Text>
                  </View>
                )}
              </ScrollView>
            </Animated.View>
          )}

          {(activeOverlay === 'new_chat' || activeOverlay === 'delete') && (
            <View style={styles.confirmOverlay}>
              <View style={styles.confirmContent}>
                <View style={[styles.confirmIconCircle, activeOverlay === 'delete' && { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                  {activeOverlay === 'new_chat' ? (
                    <Sparkles size={24} color={Colors.primary} />
                  ) : (
                    <Trash2 size={24} color="#ef4444" />
                  )}
                </View>
                <Text style={[styles.confirmLabel, activeOverlay === 'delete' && { color: '#ef4444' }]}>
                  {activeOverlay === 'new_chat' ? 'ACTION REQUIRED' : 'FINAL CONFIRMATION'}
                </Text>
                <Text style={styles.confirmPrompt}>
                  {activeOverlay === 'new_chat' 
                    ? 'Start a new research conversation?' 
                    : 'Delete this conversation permanently?'}
                </Text>
                <View style={styles.confirmBtnRow}>
                  <TouchableOpacity 
                    style={[styles.confirmBtnSecondary, { borderColor: currentColors.border }]} 
                    onPress={() => setActiveOverlay('none')}
                  >
                    <Text style={[styles.confirmBtnTextSecondary, { color: currentColors.textSecondary, fontFamily: getFontFamily(language, 'black') }]}>
                      {activeOverlay === 'new_chat' ? 'NO, BACK' : 'NO, KEEP IT'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.confirmBtnPrimary, activeOverlay === 'delete' && { backgroundColor: '#ef4444' }]}
                    onPress={activeOverlay === 'new_chat' ? handleStartNewChat : handleConfirmDelete}
                  >
                    <Text style={[styles.confirmBtnTextPrimary, { fontFamily: getFontFamily(language, 'black') }]}>
                      {activeOverlay === 'new_chat' ? 'YES, START' : 'YES, DELETE'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  dismissArea: { ...StyleSheet.absoluteFillObject },
  popupContainer: {
    backgroundColor: Colors.dark.background,
    borderRadius: Radius['3xl'],
    width: '100%',
    maxHeight: SCREEN_HEIGHT * 0.85,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.5, shadowRadius: 16 },
      android: { elevation: 20 },
    }),
  },

  /* SECTION 1 Styles */
  sectionHeader: { borderBottomWidth: 1, borderBottomColor: Colors.dark.border },
  mainTitleBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.xl },
  titleLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  botIconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(20, 104, 255, 0.1)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: Fonts.weights.bold, color: '#fff' },
  headerSubtitle: { fontSize: 9, fontWeight: Fonts.weights.black, color: Colors.dark.textMuted, letterSpacing: 1 },
  titleRight: { padding: 4 },
  expandedContent: { paddingBottom: Spacing.lg },
  badgeRow: { flexDirection: 'row', paddingHorizontal: Spacing.xl, gap: 8, marginBottom: Spacing.lg },
  badge: { backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  badgeText: { fontSize: 8, fontWeight: Fonts.weights.black, color: Colors.dark.textSecondary },
  examplesContainer: { paddingHorizontal: Spacing.xl, gap: 8, marginBottom: Spacing.xl },
  exampleBtn: { backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 16, paddingVertical: 12, borderRadius: Radius.xl, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  exampleText: { color: '#fff', fontSize: 13, fontWeight: Fonts.weights.semibold },
  recentContainer: { paddingHorizontal: Spacing.xl },
  recentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  recentIconRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  recentLabel: { fontSize: 10, fontWeight: Fonts.weights.black, color: Colors.dark.textMuted, letterSpacing: 1 },
  clearText: { fontSize: 10, fontWeight: Fonts.weights.black, color: '#ef4444' },
  recentList: { gap: 8 },
  recentChip: { backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.full, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', maxWidth: 150 },
  recentChipText: { color: Colors.dark.textSecondary, fontSize: 12 },

  /* SECTION 2 Styles */
  chatList: { flex: 1 },
  chatContent: { padding: Spacing.xl, gap: 12 },
  userMsgContainer: { alignItems: 'flex-end', marginBottom: 12 },
  userRow: { flexDirection: 'row', gap: 12, maxWidth: '90%' },
  userIconCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', marginTop: 4 },
  userBubble: { backgroundColor: '#fff', padding: 14, borderRadius: 20, borderTopRightRadius: 4, flexShrink: 1, marginTop: 4 },
  userText: { color: Colors.dark.background, fontSize: 15, fontWeight: Fonts.weights.medium },
  botMsgContainer: { alignItems: 'flex-start', marginBottom: 16 },
  botRow: { flexDirection: 'row', gap: 12, maxWidth: '100%' },
  botIconCircleSmall: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.dark.surfaceStrong, justifyContent: 'center', alignItems: 'center', marginTop: 4 },
  botBubble: { 
    backgroundColor: Colors.dark.surfaceStrong, 
    padding: 14,
    borderRadius: 20, 
    borderTopLeftRadius: 4, 
    gap: 12, 
    flexShrink: 1, 
    marginTop: 4 
  },
  botText: { color: Colors.dark.text, fontSize: 15, lineHeight: 22 },
  messageSourceList: { gap: 8, marginTop: 4 },
  sourceCardMini: { backgroundColor: 'rgba(255,255,255,0.05)', padding: 10, borderRadius: 12, width: 140, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  sourceHeaderMini: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  sourceBrandMini: { fontSize: 8, fontWeight: Fonts.weights.black, color: Colors.primaryLight },
  sourceModelMini: { fontSize: 11, fontWeight: Fonts.weights.bold, color: '#fff' },
  sourceTagMini: { fontSize: 8, color: Colors.dark.textMuted, marginTop: 2 },
  feedbackRow: { flexDirection: 'row', gap: 16, marginTop: 4 },
  feedbackBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, opacity: 0.8 },
  feedbackBtnActive: { opacity: 1 },
  feedbackText: { fontSize: 10, fontWeight: Fonts.weights.black, color: Colors.dark.textMuted },
  feedbackTextActive: { color: '#fff' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, opacity: 0.5 },
  emptyText: { color: Colors.dark.textMuted, marginTop: 16, fontSize: 14 },

  /* SECTION 3 Styles */
  textBarSection: { padding: Spacing.xl, borderTopWidth: 1, borderTopColor: Colors.dark.border },
  inputWrapper: { 
    flexDirection: 'row', 
    backgroundColor: 'rgba(255,255,255,0.05)', 
    borderRadius: Radius.lg, 
    paddingLeft: 16, 
    paddingRight: 6, 
    paddingVertical: 2, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.1)' 
  },
  input: { flex: 1, color: '#fff', fontSize: 14, paddingVertical: 8 },
  submitBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.dark.textSecondary, justifyContent: 'center', alignItems: 'center' },
  submitBtnDisabled: { opacity: 0.5 },
  textBarFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  footerBtn: { 
    flex: 1,
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    gap: 8, 
    backgroundColor: 'rgba(255,255,255,0.05)', 
    paddingVertical: 12, 
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)'
  },
  footerBtnText: { fontSize: 11, fontWeight: Fonts.weights.black, color: '#fff', letterSpacing: 0.5 },
  footerIcons: { flexDirection: 'row', marginLeft: 12 },
  iconCircle: { 
    width: 48, 
    height: 48, 
    borderRadius: Radius.lg, 
    backgroundColor: 'rgba(255,255,255,0.05)', 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)'
  },
  iconPlus: { color: Colors.dark.textMuted, fontSize: 18 },
  aiSourceText: { fontSize: 8, fontWeight: Fonts.weights.black, color: Colors.dark.textMuted },

  /* OVERLAY Styles */
  overlayContainer: { ...StyleSheet.absoluteFillObject, backgroundColor: Colors.dark.background, zIndex: 100, padding: Spacing.xl },
  overlayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xl },
  overlayTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  overlayIconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(20, 104, 255, 0.2)', justifyContent: 'center', alignItems: 'center' },
  overlayTitleText: { fontSize: 16, fontWeight: Fonts.weights.black, color: '#fff', letterSpacing: 0.5 },
  overlaySubtitleText: { fontSize: 10, fontWeight: Fonts.weights.bold, color: Colors.dark.textMuted },
  overlayScroll: { gap: 12 },
  historyCard: { backgroundColor: 'rgba(20, 104, 255, 0.05)', padding: 16, borderRadius: Radius['xl'], borderWidth: 1, borderColor: 'rgba(20, 104, 255, 0.2)' },
  activeHistoryCard: { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' },
  historyCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  activeTag: { fontSize: 8, fontWeight: Fonts.weights.black, color: Colors.primary, letterSpacing: 1 },
  cardActions: { flexDirection: 'row', gap: 8 },
  historyCardTitle: { color: Colors.primaryLight, fontWeight: Fonts.weights.bold, fontSize: 14, marginBottom: 2 },
  historyCardMeta: { color: Colors.dark.textMuted, fontSize: 9, fontWeight: Fonts.weights.bold },
  renameInput: { flex: 1, color: '#fff', fontSize: 14, fontWeight: Fonts.weights.bold, padding: 0, borderBottomWidth: 1, borderBottomColor: Colors.primary },
  editBtn: { padding: 4 },

  confirmOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', zIndex: 101, padding: Spacing.xl },
  confirmContent: { alignItems: 'center', width: '100%', gap: 16 },
  confirmIconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(20, 104, 255, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  confirmLabel: { fontSize: 10, fontWeight: Fonts.weights.black, color: Colors.primary, letterSpacing: 1.5 },
  confirmPrompt: { fontSize: 18, fontWeight: Fonts.weights.bold, color: '#fff', textAlign: 'center', marginBottom: 8 },
  confirmBtnRow: { flexDirection: 'row', gap: 12, width: '100%' },
  confirmBtnSecondary: { flex: 1, height: 54, borderRadius: Radius.xl, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  confirmBtnTextSecondary: { color: '#fff', fontSize: 12, fontWeight: Fonts.weights.black },
  confirmBtnPrimary: { flex: 1, height: 54, borderRadius: Radius.xl, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  confirmBtnTextPrimary: { color: '#fff', fontSize: 12, fontWeight: Fonts.weights.black },
})
