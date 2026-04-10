import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from 'react-native'
import { useRouter } from 'expo-router'
import { ChevronLeft, Languages, Moon, Sun, Monitor, CircleCheck } from 'lucide-react-native'
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated'
import { Colors, Fonts, Radius, Spacing } from '../lib/constants'
import { useUiPreferences } from '../context/ui-context'
import { pickText } from '../lib/i18n'

export default function SettingsScreen() {
  const router = useRouter()
  const { language, setLanguage, theme, setTheme } = useUiPreferences()
  const currentColors = theme === 'dark' ? Colors.dark : Colors.light

  const languages = [
    { id: 'en', label: 'English', sub: 'English Language' },
    { id: 'th', label: 'ไทย', sub: 'ภาษาไทย' },
  ] as const

  const themes = [
    { id: 'dark', label: pickText(language, { en: 'Dark', th: 'มืด' }), icon: Moon },
    { id: 'light', label: pickText(language, { en: 'Light', th: 'สว่าง' }), icon: Sun },
  ] as const

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      <View style={[styles.header, { borderBottomColor: currentColors.border }]}>
        <TouchableOpacity 
          style={styles.backBtn} 
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color={currentColors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: currentColors.text }]}>
          {pickText(language, { en: 'Settings', th: 'ตั้งค่า' })}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Language Section */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <View style={styles.sectionHeader}>
            <Languages size={18} color={Colors.primary} />
            <Text style={[styles.sectionTitle, { color: currentColors.textSecondary }]}>
              {pickText(language, { en: 'LANGUAGE', th: 'ภาษา' })}
            </Text>
          </View>
          
          <View style={[styles.card, { backgroundColor: currentColors.surface, borderColor: currentColors.border }]}>
            {languages.map((lang, idx) => (
              <TouchableOpacity
                key={lang.id}
                style={[
                  styles.optionItem,
                  idx !== languages.length - 1 && { borderBottomWidth: 1, borderBottomColor: currentColors.border }
                ]}
                onPress={() => setLanguage(lang.id)}
                activeOpacity={0.7}
              >
                <View>
                  <Text style={[styles.optionLabel, { color: currentColors.text }]}>{lang.label}</Text>
                  <Text style={[styles.optionSub, { color: currentColors.textMuted }]}>{lang.sub}</Text>
                </View>
                {language === lang.id && (
                  <CircleCheck size={20} color={Colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* Theme Section */}
        <Animated.View entering={FadeInDown.delay(200).duration(400)} style={{ marginTop: Spacing['2xl'] }}>
          <View style={styles.sectionHeader}>
            <Monitor size={18} color={Colors.primary} />
            <Text style={[styles.sectionTitle, { color: currentColors.textSecondary }]}>
              {pickText(language, { en: 'APPEARANCE', th: 'การแสดงผล' })}
            </Text>
          </View>
          
          <View style={styles.themeRow}>
            {themes.map((t) => (
              <TouchableOpacity
                key={t.id}
                style={[
                  styles.themeCard,
                  { backgroundColor: currentColors.surface, borderColor: currentColors.border },
                  theme === t.id && { borderColor: Colors.primary, borderWidth: 2 }
                ]}
                onPress={() => setTheme(t.id)}
                activeOpacity={0.8}
              >
                <t.icon size={24} color={theme === t.id ? Colors.primary : currentColors.textMuted} />
                <Text style={[
                  styles.themeLabel, 
                  { color: theme === t.id ? currentColors.text : currentColors.textMuted }
                ]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        <View style={styles.infoBox}>
          <Text style={[styles.infoText, { color: currentColors.textMuted }]}>
            {pickText(language, { 
              en: 'Visual and linguistic preferences are synchronized platform-wide.', 
              th: 'การตั้งค่าภาษาและการแสดงผลจะถูกซิงค์กับทุกส่วนของระบบ' 
            })}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: Fonts.weights.bold,
    letterSpacing: -0.5,
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingBottom: 60,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.md,
    paddingLeft: 4,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: Fonts.weights.black,
    letterSpacing: 2,
  },
  card: {
    borderRadius: Radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: Fonts.weights.semibold,
  },
  optionSub: {
    fontSize: 12,
    marginTop: 2,
  },
  themeRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  themeCard: {
    flex: 1,
    height: 100,
    borderRadius: Radius.xl,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  themeLabel: {
    fontSize: 13,
    fontWeight: Fonts.weights.bold,
  },
  infoBox: {
    marginTop: 40,
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  infoText: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 18,
    opacity: 0.7,
    fontStyle: 'italic',
  },
})
