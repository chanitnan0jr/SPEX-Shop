import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Image,
  Alert,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, MapPin, Package, Calendar, Tag } from 'lucide-react-native'
import { Colors, Fonts, Radius, Spacing } from '../../lib/constants'
import { getOrderById, IOrder } from '../../lib/api'

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['order', id],
    queryFn: () => getOrderById(id!),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    )
  }

  if (isError || !order) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: '#fff' }}>Order not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: Colors.primary, marginTop: 20 }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={Colors.dark.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Order Receipt</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Status Hub */}
        <View style={styles.statusCard}>
          <View style={styles.statusInfo}>
             <Text style={styles.statusLabel}>Current Status</Text>
             <Text style={styles.statusValue}>{order.status.toUpperCase()}</Text>
          </View>
          <View style={styles.statusBadge}>
            <Package size={32} color={Colors.primary} />
          </View>
        </View>

        {/* Info Grid */}
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Calendar size={16} color={Colors.dark.textMuted} />
            <View>
              <Text style={styles.infoLabel}>DATE</Text>
              <Text style={styles.infoValue}>
                {new Date(order.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Tag size={16} color={Colors.dark.textMuted} />
            <View>
              <Text style={styles.infoLabel}>ORDER ID</Text>
              <Text style={styles.infoValue}>#{order._id.slice(-8).toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* Address */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin size={18} color={Colors.primary} />
            <Text style={styles.sectionTitle}>SHIPPING TO</Text>
          </View>
          <View style={styles.addressBox}>
            <Text style={styles.addressName}>{order.shippingAddress.name}</Text>
            <Text style={styles.addressText}>{order.shippingAddress.address}</Text>
            <Text style={styles.addressText}>
              {order.shippingAddress.province}, {order.shippingAddress.zip}
            </Text>
            <Text style={styles.addressPhone}>{order.shippingAddress.phone}</Text>
          </View>
        </View>

        {/* Items List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ITEMS PURCHASED</Text>
          {order.items.map((item: any, idx: number) => (
            <View key={idx} style={styles.itemRow}>
              <View style={styles.itemImageContainer}>
                {item.thumbnail_url ? (
                  <Image source={{ uri: item.thumbnail_url }} style={styles.itemThumb} />
                ) : (
                  <Package size={24} color={Colors.dark.textMuted} />
                )}
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemBrand}>{item.brand.toUpperCase()}</Text>
                <Text style={styles.itemModel}>{item.model}</Text>
                <Text style={styles.itemQty}>Quantity: {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>
                ฿{(item.price_thb * item.quantity).toLocaleString()}
              </Text>
            </View>
          ))}
        </View>

        {/* Total Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryLine}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>฿{order.totalAmount.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryLine}>
            <Text style={styles.summaryLabel}>Shipping</Text>
            <Text style={styles.summaryValue}>FREE</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.totalLine}>
            <Text style={styles.totalLabel}>TOTAL PAID</Text>
            <Text style={styles.totalValue}>฿{order.totalAmount.toLocaleString()}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.helpBtn}
          onPress={() => Alert.alert('Support', 'Contacting SPEX support...')}
        >
          <Text style={styles.helpBtnText}>Need help with this order?</Text>
        </TouchableOpacity>
      </ScrollView>
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
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: Fonts.weights.bold,
    color: Colors.dark.text,
  },
  scrollContent: {
    padding: Spacing.xl,
    paddingBottom: 60,
  },
  statusCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.dark.surface,
    padding: Spacing.xl,
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    borderColor: Colors.primary,
    marginBottom: Spacing.lg,
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    fontWeight: Fonts.weights.bold,
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 24,
    fontWeight: Fonts.weights.black,
    color: Colors.primaryLight,
  },
  statusBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(20, 104, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing['2xl'],
  },
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.surface,
    padding: Spacing.md,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    gap: 12,
  },
  infoLabel: {
    fontSize: 8,
    fontWeight: Fonts.weights.black,
    color: Colors.dark.textMuted,
    letterSpacing: 1,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: Fonts.weights.bold,
    color: Colors.dark.text,
  },
  section: {
    marginBottom: Spacing['2xl'],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: Fonts.weights.black,
    color: Colors.dark.textMuted,
    letterSpacing: 2,
  },
  addressBox: {
    backgroundColor: Colors.dark.surface,
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  addressName: {
    fontSize: 16,
    fontWeight: Fonts.weights.bold,
    color: Colors.dark.text,
    marginBottom: 8,
  },
  addressText: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginBottom: 4,
  },
  addressPhone: {
    fontSize: 14,
    color: Colors.primaryLight,
    marginTop: 8,
    fontWeight: Fonts.weights.bold,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.surface,
    padding: Spacing.md,
    borderRadius: Radius.xl,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  itemImageContainer: {
    width: 50,
    height: 50,
    borderRadius: Radius.lg,
    backgroundColor: Colors.dark.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  itemThumb: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  itemInfo: {
    flex: 1,
  },
  itemBrand: {
    fontSize: 9,
    fontWeight: Fonts.weights.black,
    color: Colors.primary,
    letterSpacing: 1,
  },
  itemModel: {
    fontSize: 14,
    fontWeight: Fonts.weights.bold,
    color: Colors.dark.text,
  },
  itemQty: {
    fontSize: 11,
    color: Colors.dark.textMuted,
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: Fonts.weights.bold,
    color: Colors.dark.text,
  },
  summaryCard: {
    backgroundColor: Colors.dark.surfaceStrong,
    padding: Spacing.xl,
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  summaryLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.dark.textMuted,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: Fonts.weights.bold,
    color: Colors.dark.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.dark.border,
    marginVertical: Spacing.md,
  },
  totalLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: Fonts.weights.black,
    color: Colors.dark.text,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: Fonts.weights.black,
    color: Colors.primaryLight,
  },
  helpBtn: {
    marginTop: Spacing['3xl'],
    alignItems: 'center',
  },
  helpBtnText: {
    color: Colors.dark.textMuted,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
})
