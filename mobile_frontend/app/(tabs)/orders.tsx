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
} from 'react-native'
import { useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { Package, ChevronRight, Clock } from 'lucide-react-native'
import { Colors, Fonts, Radius, Spacing } from '../../lib/constants'
import { getOrders, IOrder } from '../../lib/api'
import { pickText } from '../../lib/i18n'
import { useUiPreferences } from '../../context/ui-context'
import { getFontFamily } from '../../lib/fonts'

export default function OrdersScreen() {
  const router = useRouter()
  const { language, theme } = useUiPreferences()
  const currentColors = theme === 'dark' ? Colors.dark : Colors.light

  const { data: orders, isLoading, isError, refetch } = useQuery({
    queryKey: ['orders'],
    queryFn: getOrders,
  })

  const getStatusColor = (status: IOrder['status']) => {
    switch (status) {
      case 'paid': return '#10b981'
      case 'shipped': return Colors.primaryLight
      case 'delivered': return Colors.primary
      case 'cancelled': return '#ef4444'
      default: return currentColors.textMuted
    }
  }

  const renderOrderItem = ({ item }: { item: IOrder }) => (
    <TouchableOpacity
      style={[styles.orderCard, { backgroundColor: currentColors.surface, borderColor: currentColors.border }]}
      onPress={() => router.push({ pathname: '/orders/[id]', params: { id: item._id } })}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.orderInfo}>
          <Text style={[styles.orderId, { color: currentColors.text, fontFamily: getFontFamily(language, 'black') }]}>ORDER #{item._id.slice(-6).toUpperCase()}</Text>
          <View style={styles.dateRow}>
            <Clock size={12} color={Colors.dark.textMuted} />
            <Text style={[styles.dateText, { color: currentColors.textMuted, fontFamily: getFontFamily(language) }]}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}15` }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status), fontFamily: getFontFamily(language, 'black') }]}>
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={[styles.itemSummary, { color: currentColors.textSecondary, fontFamily: getFontFamily(language, 'bold') }]} numberOfLines={1}>
          {item.items.map(i => `${i.brand} ${i.model}`).join(', ')}
        </Text>
        <View style={styles.priceRow}>
          <Text style={[styles.totalLabel, { color: currentColors.textMuted, fontFamily: getFontFamily(language) }]}>Total Amount</Text>
          <Text style={[styles.totalPrice, { color: currentColors.text, fontFamily: getFontFamily(language, 'black') }]}>฿{item.totalAmount.toLocaleString()}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={[styles.viewDetail, { color: Colors.primary, fontFamily: getFontFamily(language, 'bold') }]}>View Details</Text>
        <ChevronRight size={16} color={Colors.primary} />
      </View>
    </TouchableOpacity>
  )

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      <View style={styles.header}>
        <Text style={[styles.title, { color: currentColors.text, fontFamily: getFontFamily(language, 'black') }]}>{pickText(language, { en: 'Orders', th: 'คำสั่งซื้อ' })}</Text>
        <Text style={[styles.subtitle, { color: currentColors.textMuted, fontFamily: getFontFamily(language) }]}>{pickText(language, { en: 'Your purchase history', th: 'ประวัติการสั่งซื้อของคุณ' })}</Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        renderItem={renderOrderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Package size={64} color={currentColors.border} />
            <Text style={[styles.emptyTitle, { color: currentColors.text, fontFamily: getFontFamily(language, 'black') }]}>{pickText(language, { en: 'No orders yet', th: 'ยังไม่มีคำสั่งซื้อ' })}</Text>
            <Text style={[styles.emptySubtitle, { color: currentColors.textMuted, fontFamily: getFontFamily(language) }]}>
              {pickText(language, { en: 'When you buy a phone, it will appear here.', th: 'เมื่อคุณซื้อโทรศัพท์ รายการจะปรากฏที่นี่' })}
            </Text>
          </View>
        )}
        onRefresh={refetch}
        refreshing={isLoading}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  title: {
    fontSize: 32,
    fontWeight: Fonts.weights.bold,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 40,
  },
  orderCard: {
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 14,
    fontWeight: Fonts.weights.black,
    letterSpacing: 1,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    color: Colors.dark.textMuted,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: Radius.md,
  },
  statusText: {
    fontSize: 10,
    fontWeight: Fonts.weights.black,
    letterSpacing: 1,
  },
  cardBody: {
    marginBottom: Spacing.md,
  },
  itemSummary: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 12,
    color: Colors.dark.textMuted,
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: Fonts.weights.bold,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    gap: 4,
  },
  viewDetail: {
    fontSize: 12,
    fontWeight: Fonts.weights.bold,
    color: Colors.primary,
  },
  emptyContainer: {
    marginTop: 100,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: Fonts.weights.bold,
    marginTop: Spacing.lg,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.dark.textMuted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
})
