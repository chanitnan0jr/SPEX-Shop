import React from 'react'
import { View, Text, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import { Plus, Minus, Trash2 } from 'lucide-react-native'
import { Colors, Fonts, Radius, Spacing } from '../lib/constants'
import { ICartItem } from '../lib/api'

interface CartItemProps {
  item: ICartItem
  onUpdateQuantity: (specId: string, quantity: number) => Promise<any>
  onRemove: (specId: string) => Promise<any>
}

export default function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const [isProcessing, setIsProcessing] = React.useState(false)

  const handleIncrement = async () => {
    setIsProcessing(true)
    try {
      await onUpdateQuantity(item.specId, item.quantity + 1)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDecrement = async () => {
    if (item.quantity <= 1) return
    setIsProcessing(true)
    try {
      await onUpdateQuantity(item.specId, item.quantity - 1)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRemove = async () => {
    setIsProcessing(true)
    try {
      await onRemove(item.specId)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <View style={styles.container}>
      {/* Image */}
      <View style={styles.imageContainer}>
        {item.thumbnail_url ? (
          <Image source={{ uri: item.thumbnail_url }} style={styles.image} resizeMode="contain" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderText}>{item.brand[0]}</Text>
          </View>
        )}
      </View>

      {/* Details */}
      <View style={styles.details}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>{item.brand.toUpperCase()}</Text>
            <Text style={styles.model}>{item.model}</Text>
          </View>
          <TouchableOpacity onPress={handleRemove} disabled={isProcessing}>
            <Trash2 size={18} color="#ef4444" />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.price}>
            ฿{item.price_thb.toLocaleString()}
          </Text>

          <View style={styles.stepper}>
            <TouchableOpacity 
              onPress={handleDecrement} 
              style={[styles.stepBtn, item.quantity <= 1 && styles.stepBtnDisabled]}
              disabled={isProcessing || item.quantity <= 1}
            >
              <Minus size={14} color={item.quantity <= 1 ? Colors.dark.textMuted : Colors.dark.text} />
            </TouchableOpacity>

            {isProcessing ? (
              <ActivityIndicator size="small" color={Colors.primary} style={styles.loader} />
            ) : (
              <Text style={styles.quantity}>{item.quantity}</Text>
            )}

            <TouchableOpacity 
              onPress={handleIncrement} 
              style={styles.stepBtn}
              disabled={isProcessing}
            >
              <Plus size={14} color={Colors.dark.text} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.surface,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  imageContainer: {
    width: 80,
    height: 80,
    backgroundColor: Colors.dark.surfaceStrong,
    borderRadius: Radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  image: {
    width: 60,
    height: 60,
  },
  imagePlaceholder: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: Colors.dark.textMuted,
    fontSize: 24,
    fontWeight: Fonts.weights.bold,
  },
  details: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  brand: {
    fontSize: 9,
    fontWeight: Fonts.weights.black,
    color: Colors.primaryLight,
    letterSpacing: 2,
    marginBottom: 2,
  },
  model: {
    fontSize: 16,
    fontWeight: Fonts.weights.bold,
    color: Colors.dark.text,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  price: {
    fontSize: 14,
    fontWeight: Fonts.weights.bold,
    color: Colors.dark.text,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.surfaceStrong,
    borderRadius: Radius.full,
    padding: 4,
  },
  stepBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepBtnDisabled: {
    opacity: 0.3,
  },
  quantity: {
    minWidth: 20,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: Fonts.weights.bold,
    color: Colors.dark.text,
    marginHorizontal: Spacing.xs,
  },
  loader: {
    marginHorizontal: Spacing.xs,
  }
})
