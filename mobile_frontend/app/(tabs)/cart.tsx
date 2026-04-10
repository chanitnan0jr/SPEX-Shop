import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native'
import { useRouter } from 'expo-router'
import { ShoppingCart, ArrowRight, ShoppingBag } from 'lucide-react-native'
import { Colors, Fonts, Radius, Spacing } from '../../lib/constants'
import { useCart } from '../../hooks/useCart'
import { useAuth } from '../../context/auth'
import CartItem from '../../components/CartItem'
import { pickText } from '../../lib/i18n'
import { useUiPreferences } from '../../context/ui-context'
import { getFontFamily } from '../../lib/fonts'

export default function CartScreen() {
  const router = useRouter()
  const { language, theme } = useUiPreferences()
  const currentColors = theme === 'dark' ? Colors.dark : Colors.light
  const { token } = useAuth()
  const { 
    items, 
    totalPrice, 
    totalCount, 
    isLoading, 
    updateQuantity, 
    removeItem, 
    clearCart 
  } = useCart()

  const handleCheckout = () => {
    if (!token) {
      router.push('/auth/login')
      return
    }
    if (items.length > 0) {
      router.push('/checkout')
    }
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    )
  }

  const renderEmptyCart = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIconContainer, { backgroundColor: currentColors.surface }]}>
        <ShoppingBag size={48} color={currentColors.textMuted} />
      </View>
      <Text style={[styles.emptyTitle, { color: currentColors.text, fontFamily: getFontFamily(language, 'black') }]}>{pickText(language, { en: 'Your cart is empty', th: 'ตะกร้าของคุณว่างเปล่า' })}</Text>
      <Text style={[styles.emptySubtitle, { color: currentColors.textMuted, fontFamily: getFontFamily(language) }]}>
        {pickText(language, { en: "Looks like you haven't added any phones yet.", th: 'ดูเหมือนว่าคุณจะยังไม่ได้เพิ่มโทรศัพท์เครื่องใดเลย' })}
      </Text>
      <TouchableOpacity
        style={[styles.startShoppingBtn, { borderColor: currentColors.border, backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }]}
        onPress={() => router.push('/(tabs)/shop')}
      >
        <Text style={[styles.startShoppingText, { color: currentColors.text, fontFamily: getFontFamily(language, 'black') }]}>{pickText(language, { en: 'START SHOPPING', th: 'เริ่มช้อปปิ้ง' })}</Text>
      </TouchableOpacity>
    </View>
  )

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: currentColors.text, fontFamily: getFontFamily(language, 'black') }]}>{pickText(language, { en: 'My Cart', th: 'ตะกร้าของฉัน' })}</Text>
          <Text style={[styles.subtitle, { color: currentColors.textMuted, fontFamily: getFontFamily(language) }]}>{totalCount} {pickText(language, { en: 'items in your bag', th: 'รายการในตะกร้า' })}</Text>
        </View>
        {items.length > 0 && (
          <TouchableOpacity onPress={() => clearCart()} style={styles.clearBtn}>
            <Text style={[styles.clearBtnText, { fontFamily: getFontFamily(language, 'bold') }]}>{pickText(language, { en: 'Clear All', th: 'ล้างทั้งหมด' })}</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.specId}
        renderItem={({ item }) => (
          <CartItem 
            item={item} 
            onUpdateQuantity={updateQuantity} 
            onRemove={removeItem} 
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyCart}
        showsVerticalScrollIndicator={false}
      />

      {items.length > 0 && (
        <View style={[styles.footer, { backgroundColor: currentColors.surface, borderColor: currentColors.border, shadowColor: theme === 'dark' ? '#000' : 'rgba(0,0,0,0.1)' }]}>
          <View style={styles.priceRow}>
            <Text style={[styles.totalLabel, { color: currentColors.textMuted, fontFamily: getFontFamily(language, 'bold') }]}>{pickText(language, { en: 'Total Price', th: 'ราคารวม' })}</Text>
            <Text style={[styles.totalValue, { color: currentColors.text, fontFamily: getFontFamily(language, 'black') }]}>฿{totalPrice.toLocaleString()}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.checkoutBtn} 
            onPress={handleCheckout}
            activeOpacity={0.8}
          >
            <Text style={[styles.checkoutBtnText, { color: '#fff', fontFamily: getFontFamily(language, 'black') }]}>
              {token ? (totalCount > 0 ? pickText(language, { en: 'PROCEED TO CHECKOUT', th: 'ไปที่หน้าชำระเงิน' }) : pickText(language, { en: 'BAG IS EMPTY', th: 'ตะกร้าว่างเปล่า' })) : pickText(language, { en: 'SIGN IN TO PURCHASE', th: 'เข้าสู่ระบบเพื่อซื้อสินค้า' })}
            </Text>
            <ArrowRight size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  title: {
    fontSize: 32,
    fontWeight: Fonts.weights.bold,
    color: Colors.dark.text,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.dark.textMuted,
    marginTop: 4,
  },
  clearBtn: {
    paddingBottom: 4,
  },
  clearBtnText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: Fonts.weights.bold,
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 120, // Space for footer
  },
  footer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 88 : 68, // Above tab bar
    left: 0,
    right: 0,
    backgroundColor: Colors.dark.surface,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderColor: Colors.dark.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 20,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  totalLabel: {
    fontSize: 14,
    color: Colors.dark.textMuted,
    fontWeight: Fonts.weights.semibold,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: Fonts.weights.bold,
    color: Colors.dark.text,
  },
  checkoutBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  checkoutBtnText: {
    color: Colors.dark.background,
    fontWeight: Fonts.weights.black,
    fontSize: 14,
    letterSpacing: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.dark.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: Fonts.weights.bold,
    color: Colors.dark.text,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.dark.textMuted,
    textAlign: 'center',
    paddingHorizontal: 40,
    marginBottom: Spacing.xl,
    lineHeight: 20,
  },
  startShoppingBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: Radius.full,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  startShoppingText: {
    color: '#fff',
    fontWeight: Fonts.weights.black,
    fontSize: 10,
    letterSpacing: 1.5,
  },
})
