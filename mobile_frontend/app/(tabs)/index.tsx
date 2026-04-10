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
import { Zap, ShieldCheck, BarChart3, Binary, LayoutGrid, ChevronRight, ChevronLeft, Activity, Cpu, Database, Weight, Sparkles, Mail, Phone, CheckCircle2 } from 'lucide-react-native'
import { Colors, Fonts, Spacing, Radius } from '../../lib/constants'
import { RadarFingerprint } from '../../components/RadarFingerprint'
import { getProducts } from '../../lib/api'
import type { Spec } from '../../types/spec'
import { getImageSource } from '../../lib/images'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

const STATIC_SHOWDOWNS = [
  {
    title: 'Flagship Clash',
    version: 'DATA V12.4',
    name1: 'iPhone 15 Pro',
    name2: 'S24 Ultra',
    analyses: '+8,492 ANALYSES',
    img1: require('../../assets/devices/phone1.png'),
    img2: require('../../assets/devices/phone2.png'),
  },
  {
    title: 'Photography War',
    version: 'DATA V12.4',
    name1: 'Pixel 8 Pro',
    name2: 'Xiaomi 14 Ultra',
    analyses: '+5,120 ANALYSES',
    img1: require('../../assets/devices/phone3.png'),
    img2: require('../../assets/devices/phone4.png'),
  },
  {
    title: 'Compact Battle',
    version: 'DATA V12.4',
    name1: 'iPhone 15',
    name2: 'Zenfone 10',
    analyses: '+3,950 ANALYSES',
    img1: require('../../assets/devices/phone5.png'),
    img2: require('../../assets/devices/phone6.png'),
  },
]

export default function MobileHomeScreen() {
  const router = useRouter()
  const scrollRef = React.useRef<ScrollView>(null)
  const [scrollPos, setScrollPos] = React.useState(0)
  const [liveShowdowns, setLiveShowdowns] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function loadData() {
      try {
        const { products } = await getProducts(1, 6)
        // Pair products to create battle cards
        const pairs = []
        for (let i = 0; i < products.length; i += 2) {
          if (products[i+1]) {
            pairs.push({
              title: i === 0 ? 'Flagship Clash' : i === 2 ? 'Photography War' : 'Performance Battle',
              version: `DATA V${new Date().getMonth() + 1}.${new Date().getDate()}`,
              name1: products[i].model,
              name2: products[i+1].model,
              analyses: `+${Math.floor(Math.random() * 5000) + 2000} ANALYSES`,
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
  }, [])

  const stats = [
    { label: 'DEVICES', value: '1,500+' },
    { label: 'BRANDS', value: '250+' },
    { label: 'BENCHMARKS', value: '10k+' },
    { label: 'ACCURACY', value: '100%', subLabel: 'AI ไม่หลอน 100% มั้ง' },
  ]

  const pillars = [
    {
      title: 'VERIFIED DATA',
      desc: 'Cross-referenced with manufacturer whitepapers.',
      icon: ShieldCheck,
    },
    {
      title: 'SIDE-BY-SIDE',
      desc: 'Intuitive UI highlighting hardware disparities.',
      icon: LayoutGrid,
    },
    {
      title: 'AI PERFORMANCE',
      desc: 'Proprietary algorithms synthesizing efficiency ratings.',
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.heroGlow} />

          {/* Top Badges */}
          <View style={styles.badgeRow}>
            <View style={[styles.heroBadge, styles.badgeBlue]}>
              <Sparkles size={10} color="#38bdf8" />
              <Text style={styles.badgeText}>ILLUMINATE DECISIONS</Text>
            </View>
            <View style={[styles.heroBadge, styles.badgeGreen]}>
              <View style={styles.greenDot} />
              <Text style={styles.badgeText}>EMPOWERING CHOICE WITH DATA</Text>
            </View>
          </View>

          <Text style={styles.heroTitle}>
            ILLUMINATE YOUR{'\n'}
            <Text style={styles.heroTitleAccent}>TECH DECISIONS</Text>
          </Text>

          <Text style={styles.heroSubtitle}>
            Exhaustive smartphone comparisons with AI-powered insights and verified hardware benchmarks. Find your next device with professional-grade clarity.
          </Text>

          <View style={styles.heroActionRow}>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => router.push('/compare')}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryBtnText}>START COMPARING</Text>
              <ChevronRight size={14} color="#000" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => Linking.openURL('https://localhost-v1.vercel.app/')}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryBtnText}>VISIT PORTFOLIO</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {stats.map((stat, idx) => (
            <View key={stat.label} style={styles.statItem}>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
              {stat.subLabel && <Text style={styles.statSubLabel}>{stat.subLabel}</Text>}
            </View>
          ))}
        </View>

        {/* Core Architecture Section (Refined Pattern) */}
        <View style={styles.section}>
          <View style={styles.centeredHeader}>
            <View style={styles.frameworkBadge}>
              <BarChart3 size={10} color={Colors.primary} />
              <Text style={styles.frameworkText}>CORE ARCHITECTURE</Text>
            </View>
            <Text style={styles.radarMainTitle}>Precision Engineering</Text>
            <Text style={styles.radarMainDesc}>
              Our foundation is built on three essential pillars of data integrity and analytical precision.
            </Text>
          </View>

          <View style={styles.pillarContainer}>
            {pillars.map((pillar) => (
              <View key={pillar.title} style={styles.pillarCard}>
                <View style={styles.pillarIcon}>
                  <pillar.icon size={24} color={Colors.primary} />
                </View>
                <View style={styles.pillarText}>
                  <Text style={styles.pillarTitle}>{pillar.title}</Text>
                  <Text style={styles.pillarDesc}>{pillar.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Radar Section Refined */}
        <View style={styles.section}>
          <View style={styles.radarLayout}>
            {/* Left Column: Metadata & Stats */}
            <View style={styles.radarLeft}>
              <View style={styles.frameworkBadge}>
                <BarChart3 size={10} color={Colors.primary} />
                <Text style={styles.frameworkText}>ARCHITECTURE FRAMEWORK</Text>
              </View>
              <Text style={styles.radarMainTitle}>RADAR FINGERPRINT</Text>
              <Text style={styles.radarMainDesc}>
                Our advanced engine maps raw hardware specs across six critical performance vectors.
              </Text>

              <View style={styles.miniStatsGrid}>
                <View style={styles.miniStat}>
                  <Text style={styles.miniStatLabel}>CPU DENSITY</Text>
                  <Text style={styles.miniStatValue}>98TH %</Text>
                </View>
                <View style={styles.miniStat}>
                  <Text style={styles.miniStatLabel}>STORAGE ARCH</Text>
                  <Text style={styles.miniStatValue}>UFS 4.0</Text>
                </View>
                <View style={styles.miniStat}>
                  <Text style={styles.miniStatLabel}>ENERGY FLUX</Text>
                  <Text style={styles.miniStatValue}>OPTIMUM</Text>
                </View>
                <View style={styles.miniStat}>
                  <Text style={styles.miniStatLabel}>MEMORY BAND</Text>
                  <Text style={styles.miniStatValue}>8.5GB/S</Text>
                </View>
              </View>
            </View>

            {/* Right Column: Radar Chart (Informational) */}
            <View style={styles.radarCard}>
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

        {/* Trending Showdowns - Web Parity */}
        <View style={styles.sectionShowdown}>
          <View style={styles.showdownHeader}>
            <View>
              <Text style={styles.showdownMainTitle}>TRENDING SHOWDOWNS</Text>
              <Text style={styles.showdownSubtitle}>REAL-TIME DATA ON ACTIVE FLAGSHIP CLASHES</Text>
            </View>
            <View style={styles.headerRight}>
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
              onScroll={(e) => {
                setScrollPos(e.nativeEvent.contentOffset.x)
              }}
              onMomentumScrollEnd={(e) => {
                setScrollPos(e.nativeEvent.contentOffset.x)
              }}
              scrollEventThrottle={16}
            >
              {liveShowdowns.map((battle) => (
                <TouchableOpacity 
                  key={battle.name1 + battle.name2} 
                  style={styles.showdownCard} 
                  activeOpacity={0.9}
                  onPress={() => {
                    router.push({
                      pathname: '/compare',
                      params: { m1: battle.name1, m2: battle.name2 }
                    })
                  }}
                >
                  <View style={styles.showdownCardHeader}>
                    <Text style={styles.cardCatTitle}>{battle.title.toUpperCase()}</Text>
                    <Text style={styles.cardVersion}>{battle.version}</Text>
                  </View>

                  <View style={styles.battleZone}>
                    <Image 
                      source={getImageSource(battle.img1, require('../../assets/devices/phone1.png'))} 
                      style={styles.deviceImg} 
                      resizeMode="contain" 
                    />
                    <View style={styles.vsBadge}>
                      <Text style={styles.vsText}>vs</Text>
                    </View>
                    <Image 
                      source={getImageSource(battle.img2, require('../../assets/devices/phone2.png'))} 
                      style={styles.deviceImg} 
                      resizeMode="contain" 
                    />
                  </View>

                  <View style={styles.deviceNamesRow}>
                    <Text style={styles.deviceName}>{battle.name1.toUpperCase()}</Text>
                    <Text style={styles.deviceName}>{battle.name2.toUpperCase()}</Text>
                  </View>

                  <View style={styles.analysesPill}>
                    <Text style={styles.pillText}>{battle.analyses}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Floating Arrows - Highly Visible */}
            <TouchableOpacity
              style={[styles.floatingArrow, styles.arrowLeft, scrollPos <= 10 && { opacity: 0.4 }]}
              onPress={() => handleScroll('prev')}
              disabled={scrollPos <= 10}
            >
              <ChevronLeft size={24} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.floatingArrow, styles.arrowRight, scrollPos >= cardFullWidth * (liveShowdowns.length - 1.2) && { opacity: 0.4 }]}
              onPress={() => handleScroll('next')}
              disabled={scrollPos >= cardFullWidth * (liveShowdowns.length - 1.2)}
            >
              <ChevronRight size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Internship 2026 Section */}
        <View style={styles.internshipSection}>
          <Text style={styles.internshipTitle}>OPEN FOR{'\n'}INTERNSHIP 2026</Text>
          <Text style={styles.internshipTagline}>READY TO COLLABORATE?</Text>

          <View style={styles.proficiencyRow}>
            <View style={styles.proficiencyBadge}>
              <CheckCircle2 size={12} color={Colors.primary} />
              <Text style={styles.proficiencyText}>AVAILABLE FOR REMOTE</Text>
            </View>
            <View style={styles.proficiencyBadge}>
              <CheckCircle2 size={12} color={Colors.primary} />
              <Text style={styles.proficiencyText}>FULL-STACK PROFICIENCY</Text>
            </View>
          </View>

          <View style={styles.contactCardsArea}>
            <TouchableOpacity
              style={styles.contactCard}
              onPress={() => Linking.openURL('mailto:Ch4n1tnan@gmail.com')}
              activeOpacity={0.7}
            >
              <View style={[styles.contactIconCircle, { backgroundColor: 'rgba(56, 189, 248, 0.15)' }]}>
                <Mail size={20} color="#38bdf8" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>EMAIL</Text>
                <Text style={styles.contactValue}>Ch4n1tnan@gmail.com</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactCard}
              onPress={() => Linking.openURL('tel:0613905655')}
              activeOpacity={0.7}
            >
              <View style={[styles.contactIconCircle, { backgroundColor: 'rgba(14, 165, 233, 0.15)' }]}>
                <Phone size={20} color="#0ea5e9" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>CALL</Text>
                <Text style={styles.contactValue}>061-390-5655</Text>
              </View>
            </TouchableOpacity>
           </View>
        </View>

        {/* Footer Section */}
        <View style={styles.footer}>
           <Text style={styles.footerLogo}>SPECBOT</Text>
           <Text style={styles.footerCopyright}>© 2026 SpecBot. All rights reserved.</Text>
           
           <View style={styles.footerLinks}>
              <TouchableOpacity onPress={() => {}}><Text style={styles.footerLink}>PRIVACY</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => {}}><Text style={styles.footerLink}>TERMS</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => {}}><Text style={styles.footerLink}>CONTACT</Text></TouchableOpacity>
           </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scrollContent: {
    paddingBottom: 60,
  },
  heroTagline: {
    fontSize: 10,
    fontWeight: Fonts.weights.black,
    color: Colors.primary,
    letterSpacing: 4,
    marginBottom: Spacing.md,
  },
  hero: {
    paddingTop: 80,
    paddingBottom: 60,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  heroGlow: {
    position: 'absolute',
    top: -100,
    width: SCREEN_WIDTH * 1.5,
    height: SCREEN_WIDTH * 1.5,
    backgroundColor: 'rgba(20, 104, 255, 0.05)',
    borderRadius: SCREEN_WIDTH,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 40,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  badgeBlue: {
    backgroundColor: 'rgba(56, 189, 248, 0.05)',
    borderColor: 'rgba(56, 189, 248, 0.2)',
  },
  badgeGreen: {
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: Fonts.weights.black,
    color: '#fff',
    letterSpacing: 1,
    opacity: 0.9,
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
    color: '#fff',
    lineHeight: 52,
    letterSpacing: -1,
    textAlign: 'center',
  },
  heroTitleAccent: {
    color: '#38bdf8', // Gradient effect can be emulated or use solid
  },
  heroSubtitle: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginTop: 32,
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: 320,
    opacity: 0.8,
  },
  heroActionRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 48,
    width: '100%',
    justifyContent: 'center',
  },
  primaryBtn: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: Radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    elevation: 10,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  primaryBtnText: {
    color: '#000',
    fontWeight: Fonts.weights.black,
    fontSize: 11,
    letterSpacing: 1,
  },
  secondaryBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: '#fff',
    fontWeight: Fonts.weights.black,
    fontSize: 11,
    letterSpacing: 1,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: 40,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    flexWrap: 'wrap',
    gap: 20,
  },
  statItem: {
    alignItems: 'flex-start',
    minWidth: 70,
  },
  statValue: {
    fontSize: 22,
    fontWeight: Fonts.weights.bold,
    color: '#fff',
  },
  statLabel: {
    fontSize: 8,
    fontWeight: Fonts.weights.black,
    color: Colors.dark.textMuted,
    letterSpacing: 1,
    marginBottom: 4,
  },
  statSubLabel: {
    fontSize: 8,
    color: Colors.primaryLight,
    marginTop: 4,
    fontStyle: 'italic',
    opacity: 0.6,
  },

  section: {
    marginTop: 40,
    paddingHorizontal: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: Spacing.xl,
  },
  sectionTagline: {
    fontSize: 9,
    fontWeight: Fonts.weights.black,
    color: Colors.primary,
    letterSpacing: 3,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: Fonts.weights.bold,
    color: Colors.dark.text,
  },

  centeredHeader: {
    alignItems: 'center',
    marginBottom: 10,
  },
  pillarContainer: {
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
  pillarCard: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.card,
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.dark.border,
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
    color: Colors.dark.text,
    letterSpacing: 1,
  },
  pillarDesc: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
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
  frameworkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(20, 104, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(20, 104, 255, 0.2)',
  },
  frameworkText: {
    fontSize: 10,
    fontWeight: Fonts.weights.black,
    color: Colors.primaryLight,
    letterSpacing: 1.5,
  },
  radarMainTitle: {
    fontSize: 32,
    fontWeight: Fonts.weights.bold,
    color: '#fff',
    letterSpacing: -0.5,
    marginBottom: 16,
    textAlign: 'center',
  },
  radarMainDesc: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    lineHeight: 22,
    marginBottom: 32,
    opacity: 0.8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  miniStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
    justifyContent: 'center',
    width: '100%',
    marginBottom: 8,
  },
  miniStat: {
    width: '42%',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 12,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  miniStatLabel: {
    fontSize: 8,
    fontWeight: Fonts.weights.black,
    color: Colors.dark.textMuted,
    letterSpacing: 1,
    marginBottom: 6,
    textAlign: 'center',
  },
  miniStatValue: {
    fontSize: 15,
    fontWeight: Fonts.weights.bold,
    color: '#fff',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  radarCard: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: Radius['3xl'],
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 320,
  },

  sectionShowdown: {
    marginTop: 60,
  },
  showdownHeader: {
    paddingHorizontal: Spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  showdownMainTitle: {
    fontSize: 28,
    fontWeight: Fonts.weights.black,
    color: '#fff',
    letterSpacing: 1.5,
  },
  showdownSubtitle: {
    fontSize: 9,
    fontWeight: Fonts.weights.bold,
    color: Colors.primaryLight,
    letterSpacing: 1,
    marginTop: 4,
    opacity: 0.8,
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: 16,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 9,
    fontWeight: Fonts.weights.black,
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  showdownCarouselWrapper: {
    position: 'relative',
    width: '100%',
  },
  floatingArrow: {
    position: 'absolute',
    top: '40%',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    zIndex: 999,
  },
  arrowLeft: {
    left: 8,
  },
  arrowRight: {
    right: 8,
  },
  showdownList: {
    paddingLeft: Spacing.xl,
    paddingRight: Spacing.xl,
  },
  showdownCard: {
    width: SCREEN_WIDTH * 0.85,
    backgroundColor: '#0d1117',
    borderRadius: Radius['3xl'],
    padding: 24,
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
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
    color: Colors.primary,
    letterSpacing: 1,
  },
  cardVersion: {
    fontSize: 9,
    fontWeight: Fonts.weights.bold,
    color: Colors.dark.textMuted,
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
    color: '#fff',
    letterSpacing: 0.5,
    width: 100,
    textAlign: 'center',
  },
  analysesPill: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    backgroundColor: 'rgba(20, 104, 255, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(20, 104, 255, 0.3)',
  },
  pillText: {
    fontSize: 9,
    fontWeight: Fonts.weights.black,
    color: Colors.primaryLight,
    letterSpacing: 1,
  },

  // Internship Section Styles
  internshipSection: {
    marginTop: 80,
    marginBottom: 0,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
  },
  internshipTitle: {
    fontSize: 40,
    fontWeight: Fonts.weights.black,
    color: '#fff',
    lineHeight: 46,
    letterSpacing: -1,
    textAlign: 'center',
  },
  internshipTagline: {
    fontSize: 16,
    fontWeight: Fonts.weights.bold,
    color: Colors.primary,
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
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  proficiencyText: {
    fontSize: 8,
    fontWeight: Fonts.weights.black,
    color: Colors.dark.textSecondary,
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
    backgroundColor: '#0d1117',
    padding: 24,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
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
    color: Colors.dark.textMuted,
    letterSpacing: 1,
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 14,
    fontWeight: Fonts.weights.bold,
    color: '#fff',
    letterSpacing: 0.2,
  },

  footer: {
    marginTop: 80,
    paddingBottom: 40,
    alignItems: 'center',
    gap: 16,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    paddingTop: 40,
    marginHorizontal: Spacing.xl,
  },
  footerLogo: {
    fontSize: 14,
    fontWeight: Fonts.weights.black,
    color: '#fff',
    letterSpacing: 6,
  },
  footerCopyright: {
    fontSize: 11,
    color: Colors.dark.textMuted,
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
    color: Colors.dark.textMuted,
    letterSpacing: 1,
    opacity: 0.6,
  },
})
