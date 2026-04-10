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

export default function OrdersScreen() {
  const router = useRouter()

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
      default: return Colors.dark.textMuted
    }
  }

  const renderOrderItem = ({ item }: { item: IOrder }) => (
    <TouchableOpacity
      style={styles.orderCard}
      onPress={() => router.push({ pathname: '/orders/[id]', params: { id: item._id } })}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderId}>ORDER #{item._id.slice(-6).toUpperCase()}</Text>
          <View style={styles.dateRow}>
            <Clock size={12} color={Colors.dark.textMuted} />
            <Text style={styles.dateText}>
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.itemSummary} numberOfLines={1}>
          {item.items.map(i => `${i.brand} ${i.model}`).join(', ')}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.totalLabel}>Total Amount</Text>
          <Text style={styles.totalPrice}>฿{item.totalAmount.toLocaleString()}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.viewDetail}>View Details</Text>
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.title}>Orders</Text>
        <Text style={styles.subtitle}>Your purchase history</Text>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        renderItem={renderOrderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Package size={64} color={Colors.dark.surfaceStrong} />
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptySubtitle}>
              When you buy a phone, it will appear here.
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
    backgroundColor: Colors.dark.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark.background,
  },
  header: {
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
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 40,
  },
  orderCard: {
    backgroundColor: Colors.dark.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.dark.border,
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
    color: Colors.dark.text,
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
    color: Colors.dark.text,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.surfaceStrong,
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
    color: Colors.dark.text,
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
