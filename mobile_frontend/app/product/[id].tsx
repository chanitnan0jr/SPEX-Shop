import React from 'react'
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Dimensions,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { getProductById } from '../../lib/api'
import { SpecSection } from '../../components/SpecSection'
import { Colors, Fonts, Spacing, Radius } from '../../lib/constants'
import { getImageSource } from '../../lib/images'
import { useCart } from '../../hooks/useCart'

import { Monitor, Zap, Camera, Battery } from 'lucide-react-native'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { addToCart } = useCart()

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProductById(id!),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <View style={styles.loadingFull}>
         <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    )
  }

  if (isError || !product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Information unavailable</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>GO BACK</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  const highlightItems = [
    { label: 'Display', value: product.highlights.display, Icon: Monitor },
    { label: 'Chipset', value: product.highlights.chipset, Icon: Zap },
    { label: 'Camera', value: product.highlights.camera, Icon: Camera },
    { label: 'Battery', value: product.highlights.battery, Icon: Battery },
  ].filter(i => i.value)

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        {/* Editorial Hero Header */}
        <View style={styles.heroHeader}>
          <View style={styles.glowBg} />
          
          <TouchableOpacity style={styles.absBack} onPress={() => router.back()}>
            <Text style={styles.absBackText}>✕</Text>
          </TouchableOpacity>

          <View style={styles.imageWrapper}>
             {product.thumbnail_url && (
               <Image 
                 source={getImageSource(product.thumbnail_url, null)} 
                 style={styles.heroImage} 
                 resizeMode="contain" 
               />
             )}
          </View>

          <View style={styles.titleArea}>
            <Text style={styles.brandTitle}>{product.brand.toUpperCase()}</Text>
            <Text style={styles.modelTitle}>{product.model}</Text>
            <View style={styles.priceTag}>
               <Text style={styles.priceValue}>
                 {product.price_thb ? `฿${product.price_thb.toLocaleString('th-TH')}` : 'Price TBA'}
               </Text>
            </View>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsSection}>
           <Text style={styles.sectionTitle}>KEY SPECIFICATIONS</Text>
           <View style={styles.statsGrid}>
             {highlightItems.map(item => (
               <View key={item.label} style={styles.statCard}>
                 <item.Icon size={24} color={Colors.primary} style={{ marginBottom: Spacing.sm }} />
                 <Text style={styles.statLabel}>{item.label}</Text>
                 <Text style={styles.statValue} numberOfLines={2}>{item.value}</Text>
               </View>
             ))}
           </View>
        </View>

        {/* Spec Sections */}
        <View style={styles.specsSection}>
           <Text style={styles.sectionTitle}>TECHNICAL DETAILS</Text>
           {Object.entries(product.spec_sections).map(([title, specs], index) => (
             <SpecSection 
               key={title} 
               title={title} 
               specs={specs as Record<string, string>} 
               defaultExpanded={index === 0} 
             />
           ))}
        </View>
      </ScrollView>

      {/* Persistent Buy/Cart Bar */}
      <SafeAreaView style={styles.bottomBar}>
         <TouchableOpacity 
           style={styles.primaryBtn} 
           activeOpacity={0.8}
           onPress={() => {
             addToCart({
               specId: (product as any)._id || id!,
               brand: product.brand,
               model: product.model,
               price_thb: product.price_thb || 0,
               thumbnail_url: product.thumbnail_url
             })
           }}
          >
           <Text style={styles.primaryBtnText}>ADD TO CART</Text>
         </TouchableOpacity>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  loadingFull: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark.background,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  heroHeader: {
    width: '100%',
    paddingTop: 60,
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: Colors.dark.surface,
    borderBottomLeftRadius: Radius['2xl'],
    borderBottomRightRadius: Radius['2xl'],
  },
  glowBg: {
    position: 'absolute',
    top: -150,
    width: SCREEN_WIDTH * 1.5,
    height: SCREEN_WIDTH * 1.5,
    backgroundColor: 'rgba(20, 104, 255, 0.05)',
    borderRadius: SCREEN_WIDTH,
  },
  absBack: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  absBackText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  imageWrapper: {
    width: SCREEN_WIDTH * 0.7,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.3,
        shadowRadius: 30,
      },
    }),
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  titleArea: {
    alignItems: 'center',
    paddingBottom: Spacing['2xl'],
  },
  brandTitle: {
    fontSize: 12,
    fontWeight: Fonts.weights.black,
    color: Colors.primaryLight,
    letterSpacing: 4,
    marginBottom: 4,
  },
  modelTitle: {
    fontSize: Fonts.sizes['3xl'],
    fontWeight: Fonts.weights.bold,
    color: Colors.dark.text,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  priceTag: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 8,
    borderRadius: Radius.full,
  },
  priceValue: {
    color: '#fff',
    fontWeight: Fonts.weights.black,
    fontSize: Fonts.sizes.xl,
  },
  statsSection: {
    padding: Spacing.lg,
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: Fonts.weights.black,
    color: Colors.dark.textMuted,
    letterSpacing: 2,
    marginBottom: Spacing.lg,
    marginLeft: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  statCard: {
    width: (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.sm) / 2,
    backgroundColor: Colors.dark.card,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: Fonts.weights.black,
    color: Colors.dark.textMuted,
    marginBottom: 4,
  },
  statValue: {
    fontSize: Fonts.sizes.sm,
    fontWeight: Fonts.weights.semibold,
    color: Colors.dark.text,
    textAlign: 'center',
  },
  specsSection: {
    padding: Spacing.lg,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: Colors.dark.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
    padding: Spacing.lg,
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: Fonts.weights.black,
    fontSize: Fonts.sizes.md,
    letterSpacing: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing['3xl'],
  },
  errorText: {
    color: Colors.dark.textSecondary,
    fontSize: Fonts.sizes.lg,
    marginBottom: Spacing.xl,
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing['3xl'],
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: Fonts.weights.bold,
  },
})
