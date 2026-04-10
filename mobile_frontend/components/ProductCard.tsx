import React, { memo } from 'react'
import { View, Text, Image, TouchableOpacity, StyleSheet, Platform } from 'react-native'
import { Plus, ShoppingCart, ShoppingBag, Smartphone } from 'lucide-react-native'
import { Colors, Fonts, Spacing, Radius } from '../lib/constants'
import type { Spec } from '../types/spec'
import { getImageSource } from '../lib/images'
import { useCart } from '../hooks/useCart'

type ProductCardProps = {
  product: Spec
  onPress: () => void
}

export const ProductCard = memo(function ProductCard({
  product,
  onPress,
}: ProductCardProps) {
  const { addToCart } = useCart()
  const brandDisplay = product.brand.toUpperCase()

  const handleAddToCart = (e: any) => {
    // Prevent navigating to detail when clicking add button
    e.stopPropagation()
    addToCart({
      specId: (product as any)._id || product.model, // fallback id
      brand: product.brand,
      model: product.model,
      price_thb: product.price_thb || 0,
      thumbnail_url: product.thumbnail_url
    })
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.card}>
        {/* Header: Brand & Model */}
        <View style={styles.header}>
          <Text style={styles.brandText}>{brandDisplay}</Text>
          <Text style={styles.modelName} numberOfLines={1}>{product.model}</Text>
        </View>

        {/* Product Image Stage */}
        <View style={styles.imageStage}>
          {/* Subtle Radial Gradient Glow Effect */}
          <View style={styles.glow} />
          
          <Image
            source={getImageSource(product.thumbnail_url, null)}
            style={styles.productImage}
            resizeMode="contain"
          />
          {!product.thumbnail_url && (
            <View style={[styles.placeholderContainer, { position: 'absolute' }]}>
              <Smartphone size={32} color={Colors.dark.textMuted} strokeWidth={1} />
            </View>
          )}
        </View>

        {/* Pricing & Footer */}
        <View style={styles.footer}>
           <View style={styles.priceContainer}>
             <Text style={styles.priceThb}>
               {product.price_thb ? `฿${product.price_thb.toLocaleString('th-TH')}` : '—'}
             </Text>
             <Text style={styles.estimatedLabel}>ESTIMATED PRICE</Text>
           </View>

           <TouchableOpacity 
             style={styles.addToCartBtn} 
             onPress={handleAddToCart}
             activeOpacity={0.7}
           >
             <ShoppingCart size={18} color={Colors.dark.background} />
           </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  )
})

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.xs,
  },
  card: {
    backgroundColor: Colors.dark.card,
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    borderColor: Colors.dark.border,
    padding: Spacing.lg,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.md,
    width: '100%',
  },
  brandText: {
    fontSize: 10,
    fontWeight: Fonts.weights.black,
    color: Colors.dark.textMuted,
    letterSpacing: 2,
    marginBottom: 2,
  },
  modelName: {
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.bold,
    color: Colors.dark.text,
    textAlign: 'center',
  },
  imageStage: {
    width: '100%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
    position: 'relative',
    marginBottom: Spacing.sm,
  },
  glow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: Radius.full,
  },
  productImage: {
    width: '85%',
    height: '85%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
    }),
  },
  placeholderContainer: {
    width: 60,
    height: 60,
    borderRadius: Radius.lg,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  priceContainer: {
    alignItems: 'flex-start',
  },
  priceThb: {
    fontSize: 18,
    fontWeight: Fonts.weights.black,
    color: Colors.dark.text,
    letterSpacing: -0.5,
  },
  estimatedLabel: {
    fontSize: 8,
    fontWeight: Fonts.weights.black,
    color: Colors.dark.textMuted,
    letterSpacing: 1,
    marginTop: 1,
  },
  addToCartBtn: {
    backgroundColor: Colors.primary,
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
})
