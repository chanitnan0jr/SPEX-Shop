import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  StatusBar,
  Platform,
  Linking,
} from 'react-native'
import { useRouter } from 'expo-router'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing
} from 'react-native-reanimated'
import { Zap, ShieldCheck, BarChart3, Binary, LayoutGrid, ChevronRight, ChevronLeft, Sparkles, Mail, Phone, CheckCircle2 } from 'lucide-react-native'
import { Colors, Fonts, Spacing, Radius } from '../../lib/constants'
import { RadarFingerprint } from '../../components/RadarFingerprint'
import { getProducts } from '../../lib/api'
import type { Spec } from '../../types/spec'
import { getImageSource } from '../../lib/images'
import { pickText } from '../../lib/i18n'
import { useUiPreferences } from '../../context/ui-context'
import { getFontFamily } from '../../lib/fonts'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

const STATIC_SHOWDOWNS = [
  {
    title: 'Flagship Clash',
    version: 'DATA V12.4',
    name1: 'iPhone 15 Pro',
    name2: 'S24 Ultra',
    analyses: '+8,492',
    img1: require('../../assets/devices/phone1.png'),
    img2: require('../../assets/devices/phone2.png'),
  },
  {
    title: 'Photography War',
    version: 'DATA V12.4',
    name1: 'Pixel 8 Pro',
    name2: 'Xiaomi 14 Ultra',
    analyses: '+5,120',
    img1: require('../../assets/devices/phone3.png'),
    img2: require('../../assets/devices/phone4.png'),
  },
  {
    title: 'Compact Battle',
    version: 'DATA V12.4',
    name1: 'iPhone 15',
    name2: 'Zenfone 10',
    analyses: '+3,950',
    img1: require('../../assets/devices/phone5.png'),
    img2: require('../../assets/devices/phone6.png'),
  },
]

export default function MobileHomeScreen() {
  const router = useRouter()
  const { language, theme } = useUiPreferences()
  const currentColors = theme === 'dark' ? Colors.dark : Colors.light
  const scrollRef = React.useRef<ScrollView>(null)
  const [scrollPos, setScrollPos] = React.useState(0)
  const [liveShowdowns, setLiveShowdowns] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function loadData() {
      try {
        const { products } = await getProducts(1, 6)
        const pairs = []
        for (let i = 0; i < products.length; i += 2) {
          if (products[i+1]) {
            pairs.push({
              title: i === 0 ? pickText(language, { en: 'Flagship Clash', th: 'ศึกเรือธงยอดนิยม' }) : i === 2 ? pickText(language, { en: 'Photography War', th: 'มหาสงครามภาพถ่าย' }) : pickText(language, { en: 'Performance Battle', th: 'สมรภูมิความแรง' }),
              version: `DATA V${new Date().getMonth() + 1}.${new Date().getDate()}`,
              name1: products[i].model,
              name2: products[i+1].model,
              analyses: `+${Math.floor(Math.random() * 5000) + 2000}`,
              img1: products[i].thumbnail_url,
              img2: products[i+1].thumbnail_url,
            })
          }
        }
        setLiveShowdowns(pairs)
      } catch (err) {
        console.warn('Failed to fetch showdowns, falling back to static data:', err)
        setLiveShowdowns(STATIC_SHOWDOWNS)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [language])

  const stats = [
    { label: pickText(language, { en: 'DEVICES', th: 'อุปกรณ์' }), value: '1,500+' },
    { label: pickText(language, { en: 'BRANDS', th: 'แบรนด์' }), value: '250+' },
    { label: pickText(language, { en: 'BENCHMARKS', th: 'เบนช์มาร์ก' }), value: '10k+' },
    { label: pickText(language, { en: 'ACCURACY', th: 'ความแม่นยำ' }), value: '100%', subLabel: pickText(language, { en: 'No Hallucinations', th: 'AI ไม่หลอน 100%' }) },
  ]

  const pillars = [
    {
      title: pickText(language, { en: 'VERIFIED DATA', th: 'ข้อมูลที่ตรวจสอบแล้ว' }),
      desc: pickText(language, { en: 'Cross-referenced with manufacturer whitepapers.', th: 'ตรวจสอบย้อนกลับกับข้อมูลผู้ผลิตโดยตรง' }),
      icon: ShieldCheck,
    },
    {
      title: pickText(language, { en: 'SIDE-BY-SIDE', th: 'เปรียบเทียบเคียงข้าง' }),
      desc: pickText(language, { en: 'Intuitive UI highlighting hardware disparities.', th: 'UI เข้าใจง่าย เน้นจุดต่างของฮาร์ดแวร์' }),
      icon: LayoutGrid,
    },
    {
      title: pickText(language, { en: 'AI PERFORMANCE', th: 'ประสิทธิภาพ AI' }),
      desc: pickText(language, { en: 'Proprietary algorithms synthesizing efficiency ratings.', th: 'อัลกอริทึมเฉพาะทางในการวิเคราะห์คะแนน' }),
      icon: Binary,
    },
  ]

  const cardFullWidth = SCREEN_WIDTH * 0.85 + 16

  const handleScroll = (dir: 'next' | 'prev') => {
    const currentIndex = Math.round(scrollPos / cardFullWidth)
    const nextIndex = dir === 'next' ? currentIndex + 1 : currentIndex - 1
    if (nextIndex < 0 || nextIndex >= liveShowdowns.length) return
    const nextPos = nextIndex * cardFullWidth
    scrollRef.current?.scrollTo({ x: nextPos, animated: true })
    setScrollPos(nextPos)
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={[styles.heroGlow, { backgroundColor: theme === 'dark' ? 'rgba(20, 104, 255, 0.05)' : 'rgba(255, 255, 255, 1)' }]} />

          <View style={styles.badgeRow}>
            <View style={[styles.heroBadge, styles.badgeBlue, { backgroundColor: theme === 'dark' ? 'rgba(56, 189, 248, 0.1)' : 'rgba(56, 189, 248, 0.05)', borderColor: theme === 'dark' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(56, 189, 248, 0.15)' }]}>
              <Sparkles size={10} color="#38bdf8" />
              <Text style={[styles.badgeText, { color: '#38bdf8', fontFamily: getFontFamily(language, 'black') }]}>{pickText(language, { en: 'ILLUMINATE DECISIONS', th: 'เจาะลึกทุกการตัดสินใจ' })}</Text>
            </View>
            <View style={[styles.heroBadge, styles.badgeGreen, { backgroundColor: theme === 'dark' ? 'rgba(52, 211, 153, 0.1)' : 'rgba(52, 211, 153, 0.05)', borderColor: theme === 'dark' ? 'rgba(52, 211, 153, 0.2)' : 'rgba(52, 211, 153, 0.15)' }]}>
              <View style={styles.greenDot} />
              <Text style={[styles.badgeText, { color: '#34d399', fontFamily: getFontFamily(language, 'black') }]}>{pickText(language, { en: 'EMPOWERING CHOICE WITH DATA', th: 'ทางเลือกที่ฉลาดด้วยข้อมูล' })}</Text>
            </View>
          </View>

          <Text style={[styles.heroTitle, { color: currentColors.text, fontFamily: getFontFamily(language, 'black') }]}>
            {pickText(language, { en: 'ILLUMINATE YOUR', th: 'ยกระดับการ' })}{'\n'}
            <Text style={[styles.heroTitleAccent, { fontFamily: getFontFamily(language, 'black') }]}>{pickText(language, { en: 'TECH DECISIONS', th: 'เลือกเทคโนโลยี' })}</Text>
          </Text>

          <Text style={[styles.heroSubtitle, { color: currentColors.textSecondary, fontFamily: getFontFamily(language) }]}>
            {pickText(language, { en: 'Exhaustive smartphone comparisons with AI-powered insights and verified hardware benchmarks. Find your next device with professional-grade clarity.', th: 'เปรียบเทียบสมาร์ทโฟนอย่างละเอียดด้วย AI และข้อมูลฮาร์ดแวร์ที่ตรวจสอบแล้ว ค้นหาอุปกรณ์เครื่องถัดไปของคุณด้วยความชัดเจนระดับมืออาชีพ' })}
          </Text>

          <View style={styles.heroActionRow}>
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: currentColors.text, shadowColor: currentColors.text }]}
              onPress={() => router.push('/compare')}
              activeOpacity={0.8}
            >
              <Text style={[styles.primaryBtnText, { color: currentColors.background, fontFamily: getFontFamily(language, 'black') }]}>{pickText(language, { en: 'START COMPARING', th: 'เริ่มเปรียบเทียบ' })}</Text>
              <ChevronRight size={14} color={currentColors.background} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryBtn, { borderColor: currentColors.border }]}
              onPress={() => Linking.openURL('https://localhost-v1.vercel.app/')}
              activeOpacity={0.8}
            >
              <Text style={[styles.secondaryBtnText, { color: currentColors.text, fontFamily: getFontFamily(language, 'black') }]}>{pickText(language, { en: 'VISIT PORTFOLIO', th: 'เยี่ยมชมพอร์ตโฟลิโอ' })}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Row */}
        <View style={[styles.statsRow, { borderBottomColor: currentColors.border }]}>
          {stats.map((stat, idx) => (
            <View key={stat.label} style={styles.statItem}>
              <Text style={[styles.statLabel, { color: currentColors.textMuted, fontFamily: getFontFamily(language, 'black') }]}>{stat.label}</Text>
              <Text style={[styles.statValue, { color: currentColors.text, fontFamily: getFontFamily(language, 'black') }]}>{stat.value}</Text>
              {stat.subLabel && <Text style={[styles.statSubLabel, { color: Colors.success, fontFamily: getFontFamily(language, 'bold') }]}>{stat.subLabel}</Text>}
            </View>
          ))}
        </View>

        {/* Core Architecture */}
        <View style={styles.section}>
          <View style={styles.centeredHeader}>
            <View style={[styles.frameworkBadge, { backgroundColor: theme === 'dark' ? 'rgba(20, 104, 255, 0.1)' : 'rgba(20, 104, 255, 0.05)', borderColor: theme === 'dark' ? 'rgba(20, 104, 255, 0.2)' : 'rgba(20, 104, 255, 0.1)' }]}>
              <BarChart3 size={10} color={Colors.primary} />
              <Text style={[styles.frameworkText, { color: Colors.primary, fontFamily: getFontFamily(language, 'black') }]}>{pickText(language, { en: 'CORE ARCHITECTURE', th: 'สถาปัตยกรรมหลัก' })}</Text>
            </View>
            <Text style={[styles.radarMainTitle, { color: currentColors.text, fontFamily: getFontFamily(language, 'bold') }]}>{pickText(language, { en: 'Precision Engineering', th: 'วิศวกรรมความแม่นยำ' })}</Text>
            <Text style={[styles.radarMainDesc, { color: currentColors.textSecondary, fontFamily: getFontFamily(language) }]}>
              {pickText(language, { en: 'Our foundation is built on three essential pillars of data integrity and analytical precision.', th: 'รากฐานของเราสร้างขึ้นบนเสาหลักสามประการของความถูกต้องของข้อมูลและความแม่นยำในการวิเคราะห์' })}
            </Text>
          </View>

          <View style={styles.pillarContainer}>
            {pillars.map((pillar) => (
              <View key={pillar.title} style={[styles.pillarCard, { backgroundColor: currentColors.surface, borderColor: currentColors.border }]}>
                <View style={styles.pillarIcon}>
                  <pillar.icon size={24} color={Colors.primary} />
                </View>
                <View style={styles.pillarText}>
                  <Text style={[styles.pillarTitle, { color: currentColors.text, fontFamily: getFontFamily(language, 'black') }]}>{pillar.title}</Text>
                  <Text style={[styles.pillarDesc, { color: currentColors.textSecondary, fontFamily: getFontFamily(language) }]}>{pillar.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Radar Map */}
        <View style={styles.section}>
          <View style={styles.radarLayout}>
            <View style={styles.radarLeft}>
              <View style={[styles.frameworkBadge, { backgroundColor: theme === 'dark' ? 'rgba(20, 104, 255, 0.1)' : 'rgba(20, 104, 255, 0.05)', borderColor: theme === 'dark' ? 'rgba(20, 104, 255, 0.2)' : 'rgba(20, 104, 255, 0.1)' }]}>
                <BarChart3 size={10} color={Colors.primary} />
                <Text style={[styles.frameworkText, { color: Colors.primary, fontFamily: getFontFamily(language, 'black') }]}>{pickText(language, { en: 'ARCHITECTURE FRAMEWORK', th: 'โครงสร้างสถาปัตยกรรม' })}</Text>
              </View>
              <Text style={[styles.radarMainTitle, { color: currentColors.text, fontFamily: getFontFamily(language, 'bold') }]}>{pickText(language, { en: 'RADAR FINGERPRINT', th: 'เรดาร์ลายนิ้วมือ' })}</Text>
              <Text style={[styles.radarMainDesc, { color: currentColors.textSecondary, fontFamily: getFontFamily(language) }]}>
                {pickText(language, { en: 'Our advanced engine maps raw hardware specs across six critical performance vectors.', th: 'เครื่องยนต์ขั้นสูงของเราจัดทำแผนภูมังสเปกฮาร์ดแวร์ดิบผ่านหกแกนประสิทธิภาพที่สำคัญ' })}
              </Text>
            </View>
            <View style={[styles.radarCard, { backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)', borderColor: currentColors.border }]}>
              <RadarFingerprint
                data={{
                  device1: [0.7, 0.85, 0.6, 0.75, 0.65, 0.8],
                  device2: [0.9, 0.7, 0.95, 0.85, 0.9, 0.7],
                  label1: 'iPhone 15 Pro',
                  label2: 'Galaxy S24 Ultra'
                }}
              />
            </View>
          </View>
        </View>

        {/* Showdowns */}
        <View style={styles.sectionShowdown}>
          <View style={styles.showdownHeader}>
            <View>
              <Text style={[styles.showdownMainTitle, { color: currentColors.text, fontFamily: getFontFamily(language, 'black') }]}>{pickText(language, { en: 'TRENDING SHOWDOWNS', th: 'การเปรียบเทียบยอดนิยม' })}</Text>
              <Text style={[styles.showdownSubtitle, { color: theme === 'dark' ? Colors.primaryLight : Colors.primary, fontFamily: getFontFamily(language, 'bold') }]}>{pickText(language, { en: 'REAL-TIME DATA ON ACTIVE FLAGSHIP CLASHES', th: 'ข้อมูลเรียลไทม์ของการปะทะระดับเรือธง' })}</Text>
            </View>
          </View>

          <View style={styles.showdownCarouselWrapper}>
            <ScrollView
              ref={scrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.showdownList}
              snapToInterval={cardFullWidth}
              decelerationRate="fast"
              onScroll={(e) => setScrollPos(e.nativeEvent.contentOffset.x)}
              scrollEventThrottle={16}
            >
              {(liveShowdowns.length > 0 ? liveShowdowns : STATIC_SHOWDOWNS).map((battle, idx) => (
                <TouchableOpacity 
                  key={idx} 
                  style={[styles.showdownCard, { backgroundColor: currentColors.surface, borderColor: currentColors.border }]} 
                  activeOpacity={0.9}
                  onPress={() => router.push({ pathname: '/compare', params: { m1: battle.name1, m2: battle.name2 } })}
                >
                  <View style={styles.showdownCardHeader}>
                    <Text style={[styles.cardCatTitle, { color: Colors.primary, fontFamily: getFontFamily(language, 'black') }]}>{battle.title.toUpperCase()}</Text>
                    <Text style={[styles.cardVersion, { color: currentColors.textMuted, fontFamily: getFontFamily(language) }]}>{battle.version}</Text>
                  </View>
                  <View style={styles.battleZone}>
                    <Image source={getImageSource(battle.img1, require('../../assets/devices/phone1.png'))} style={styles.deviceImg} resizeMode="contain" />
                    <View style={[styles.vsBadge, { backgroundColor: currentColors.background, borderColor: currentColors.border }]}><Text style={[styles.vsText, { color: currentColors.text, fontFamily: getFontFamily(language, 'black') }]}>{pickText(language, { en: 'vs', th: 'สู้กับ' })}</Text></View>
                    <Image source={getImageSource(battle.img2, require('../../assets/devices/phone2.png'))} style={styles.deviceImg} resizeMode="contain" />
                  </View>
                  <View style={styles.deviceNamesRow}>
                    <Text style={[styles.deviceName, { color: currentColors.text, fontFamily: getFontFamily(language, 'black') }]}>{battle.name1.toUpperCase()}</Text>
                    <Text style={[styles.deviceName, { color: currentColors.text, fontFamily: getFontFamily(language, 'black') }]}>{battle.name2.toUpperCase()}</Text>
                  </View>
                  <View style={[styles.analysesPill, { backgroundColor: theme === 'dark' ? 'rgba(20, 104, 255, 0.15)' : 'rgba(20, 104, 255, 0.1)' }]}>
                    <Text style={[styles.pillText, { color: Colors.primary, fontFamily: getFontFamily(language, 'black') }]}>{battle.analyses} {pickText(language, { en: 'ANALYSES', th: 'การวิเคราะห์' })}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Internship Section */}
        <View style={styles.internshipSection}>
          <Text style={[styles.internshipTitle, { color: currentColors.text, fontFamily: getFontFamily(language, 'black') }]}>{pickText(language, { en: 'OPEN FOR\nINTERNSHIP 2026', th: 'เปิดรับฝึกงาน' })}</Text>
          <Text style={[styles.internshipTagline, { color: Colors.primary, fontFamily: getFontFamily(language, 'bold') }]}>{pickText(language, { en: 'READY TO COLLABORATE?', th: 'พร้อมที่จะร่วมงานกันหรือยัง?' })}</Text>
          <View style={styles.proficiencyRow}>
            <View style={[styles.proficiencyBadge, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(15, 23, 42, 0.03)', borderColor: currentColors.border }]}>
              <CheckCircle2 size={12} color={Colors.primary} />
              <Text style={[styles.proficiencyText, { color: currentColors.textSecondary, fontFamily: getFontFamily(language, 'black') }]}>{pickText(language, { en: 'AVAILABLE FOR REMOTE', th: 'พร้อมทำงานทางไกล' })}</Text>
            </View>
            <View style={[styles.proficiencyBadge, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(15, 23, 42, 0.03)', borderColor: currentColors.border }]}>
              <CheckCircle2 size={12} color={Colors.primary} />
              <Text style={[styles.proficiencyText, { color: currentColors.textSecondary, fontFamily: getFontFamily(language, 'black') }]}>{pickText(language, { en: 'FULL-STACK PROFICIENCY', th: 'เชี่ยวชาญ Full-stack' })}</Text>
            </View>
          </View>
          <View style={styles.contactCardsArea}>
            {[
              { label: 'EMAIL', value: 'Ch4n1tnan@gmail.com', icon: Mail, color: '#38bdf8', url: 'mailto:Ch4n1tnan@gmail.com' },
              { label: 'CALL', value: '061-390-5655', icon: Phone, color: '#0ea5e9', url: 'tel:0613905655' }
            ].map((contact, idx) => (
              <TouchableOpacity key={idx} style={[styles.contactCard, { backgroundColor: currentColors.surface, borderColor: currentColors.border }]} onPress={() => Linking.openURL(contact.url)}>
                <View style={[styles.contactIconCircle, { backgroundColor: `${contact.color}${theme === 'dark' ? '20' : '15'}` }]}><contact.icon size={20} color={contact.color} /></View>
                <View style={styles.contactInfo}>
                  <Text style={[styles.contactLabel, { color: currentColors.textMuted, fontFamily: getFontFamily(language, 'black') }]}>{pickText(language, { en: contact.label, th: contact.label === 'EMAIL' ? 'อีเมล' : 'โทร' })}</Text>
                  <Text style={[styles.contactValue, { color: currentColors.text, fontFamily: getFontFamily(language, 'bold') }]}>{contact.value}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerLogo, { color: currentColors.text, fontFamily: getFontFamily(language, 'black') }]}>SPECBOT</Text>
          <Text style={[styles.footerCopyright, { color: currentColors.textMuted, fontFamily: getFontFamily(language) }]}>© 2026 SpecBot. {pickText(language, { en: 'All rights reserved.', th: 'สงวนลิขสิทธิ์ทั้งหมด' })}</Text>
          <View style={styles.footerLinks}>
            {['PRIVACY', 'TERMS', 'CONTACT'].map((link) => (
              <TouchableOpacity key={link}><Text style={[styles.footerLink, { color: currentColors.textMuted, fontFamily: getFontFamily(language, 'bold') }]}>{pickText(language, { en: link, th: link === 'PRIVACY' ? 'ความเป็นส่วนตัว' : link === 'TERMS' ? 'ข้อตกลง' : 'ติดต่อ' })}</Text></TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  hero: {
    paddingHorizontal: Spacing.xl,
    paddingTop: 40,
    paddingBottom: 60,
    position: 'relative',
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.5,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  badgeBlue: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
  },
  badgeGreen: {
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: Fonts.weights.black,
    letterSpacing: 0.5,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  heroTitle: {
    fontSize: 44,
    fontWeight: Fonts.weights.black,
    lineHeight: 52,
    letterSpacing: -1.5,
    marginBottom: 24,
  },
  heroTitleAccent: {
    color: Colors.primary,
  },
  heroSubtitle: {
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 40,
    opacity: 0.9,
  },
  heroActionRow: {
    flexDirection: 'row',
    gap: 16,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: Radius.xl,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 5,
  },
  primaryBtnText: {
    fontSize: 13,
    fontWeight: Fonts.weights.black,
    letterSpacing: 1,
  },
  secondaryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: Radius.xl,
    borderWidth: 1,
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontSize: 13,
    fontWeight: Fonts.weights.black,
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: 'row',
    paddingVertical: 32,
    marginHorizontal: Spacing.xl,
    borderBottomWidth: 1,
  },
  statItem: {
    flex: 1,
    gap: 4,
  },
  statLabel: {
    fontSize: 8,
    fontWeight: Fonts.weights.black,
    letterSpacing: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: Fonts.weights.black,
  },
  statSubLabel: {
    fontSize: 8,
    fontWeight: Fonts.weights.bold,
  },
  section: {
    marginTop: 80,
    paddingHorizontal: Spacing.xl,
  },
  centeredHeader: {
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: 48,
  },
  frameworkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
  },
  frameworkText: {
    fontSize: 10,
    fontWeight: Fonts.weights.black,
    letterSpacing: 1.5,
  },
  radarMainTitle: {
    fontSize: 32,
    fontWeight: Fonts.weights.bold,
    letterSpacing: -0.5,
    marginBottom: 16,
    textAlign: 'center',
  },
  radarMainDesc: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 32,
    opacity: 0.8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  pillarContainer: {
    gap: 16,
  },
  pillarCard: {
    flexDirection: 'row',
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    borderWidth: 1,
    alignItems: 'center',
    gap: Spacing.lg,
  },
  pillarIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.lg,
    backgroundColor: 'rgba(20, 104, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillarText: {
    flex: 1,
  },
  pillarTitle: {
    fontSize: 12,
    fontWeight: Fonts.weights.black,
    letterSpacing: 1,
  },
  pillarDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  radarLayout: {
    gap: 40,
    alignItems: 'center',
  },
  radarLeft: {
    width: '100%',
    alignItems: 'center',
  },
  radarCard: {
    borderRadius: Radius['3xl'],
    padding: Spacing.xl,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 320,
    width: '100%',
  },
  sectionShowdown: {
    marginTop: 80,
  },
  showdownHeader: {
    paddingHorizontal: Spacing.xl,
    marginBottom: 32,
  },
  showdownMainTitle: {
    fontSize: 28,
    fontWeight: Fonts.weights.black,
    letterSpacing: 1.5,
  },
  showdownSubtitle: {
    fontSize: 9,
    fontWeight: Fonts.weights.bold,
    letterSpacing: 1,
    marginTop: 4,
    opacity: 0.8,
  },
  showdownCarouselWrapper: {
    position: 'relative',
    width: '100%',
  },
  showdownList: {
    paddingLeft: Spacing.xl,
    paddingRight: Spacing.xl,
  },
  showdownCard: {
    width: SCREEN_WIDTH * 0.85,
    borderRadius: Radius['3xl'],
    padding: 24,
    marginRight: 16,
    borderWidth: 1,
    position: 'relative',
    height: 340,
  },
  showdownCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  cardCatTitle: {
    fontSize: 10,
    fontWeight: Fonts.weights.black,
    letterSpacing: 1,
  },
  cardVersion: {
    fontSize: 9,
    fontWeight: Fonts.weights.bold,
    opacity: 0.6,
  },
  battleZone: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 24,
  },
  deviceImg: {
    width: 80,
    height: 140,
  },
  vsBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  vsText: {
    fontSize: 10,
    fontWeight: Fonts.weights.black,
    color: '#000',
  },
  deviceNamesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
  deviceName: {
    fontSize: 10,
    fontWeight: Fonts.weights.black,
    letterSpacing: 0.5,
    width: 100,
    textAlign: 'center',
  },
  analysesPill: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 9,
    fontWeight: Fonts.weights.black,
    letterSpacing: 1,
  },
  internshipSection: {
    marginTop: 80,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
  },
  internshipTitle: {
    fontSize: 40,
    fontWeight: Fonts.weights.black,
    lineHeight: 46,
    letterSpacing: -1,
    textAlign: 'center',
  },
  internshipTagline: {
    fontSize: 16,
    fontWeight: Fonts.weights.bold,
    marginTop: 12,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  proficiencyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 40,
    justifyContent: 'center',
  },
  proficiencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  proficiencyText: {
    fontSize: 8,
    fontWeight: Fonts.weights.black,
    letterSpacing: 0.5,
  },
  contactCardsArea: {
    marginTop: 40,
    width: '100%',
    gap: 16,
  },
  contactCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    borderRadius: 40,
    borderWidth: 1,
    gap: 20,
  },
  contactIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 9,
    fontWeight: Fonts.weights.black,
    letterSpacing: 1,
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 14,
    fontWeight: Fonts.weights.bold,
    letterSpacing: 0.2,
  },
  footer: {
    marginTop: 80,
    paddingBottom: 40,
    alignItems: 'center',
    gap: 16,
    borderTopWidth: 1,
    paddingTop: 40,
    marginHorizontal: Spacing.xl,
  },
  footerLogo: {
    fontSize: 14,
    fontWeight: Fonts.weights.black,
    letterSpacing: 6,
  },
  footerCopyright: {
    fontSize: 11,
    opacity: 0.7,
  },
  footerLinks: {
    flexDirection: 'row',
    gap: 32,
    marginTop: 20,
  },
  footerLink: {
    fontSize: 11,
    fontWeight: Fonts.weights.bold,
    letterSpacing: 1,
    opacity: 0.6,
  },
})
