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
import { useUiPreferences } from '../../context/ui-context'
import { getFontFamily } from '../../lib/fonts'

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const { language, theme } = useUiPreferences()
  const currentColors = theme === 'dark' ? Colors.dark : Colors.light

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
      <View style={[styles.centered, { backgroundColor: currentColors.background }]}>
        <Text style={{ color: currentColors.text, fontFamily: getFontFamily(language) }}>Order not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: Colors.primary, marginTop: 20 }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      <View style={[styles.header, { borderBottomColor: currentColors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={currentColors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: currentColors.text, fontFamily: getFontFamily(language, 'black') }]}>Order Receipt</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Status Hub */}
        <View style={[styles.statusCard, { backgroundColor: currentColors.surface, borderColor: Colors.primary }]}>
          <View style={styles.statusInfo}>
             <Text style={[styles.statusLabel, { color: currentColors.textMuted, fontFamily: getFontFamily(language, 'black') }]}>Current Status</Text>
             <Text style={[styles.statusValue, { fontFamily: getFontFamily(language, 'black') }]}>{order.status.toUpperCase()}</Text>
          </View>
          <View style={styles.statusBadge}>
            <Package size={32} color={Colors.primary} />
          </View>
        </View>

        {/* Info Grid */}
        <View style={styles.infoGrid}>
          <View style={[styles.infoItem, { backgroundColor: currentColors.surface, borderColor: currentColors.border }]}>
            <Calendar size={16} color={currentColors.textMuted} />
            <View>
              <Text style={[styles.infoLabel, { color: currentColors.textMuted, fontFamily: getFontFamily(language, 'black') }]}>DATE</Text>
              <Text style={[styles.infoValue, { color: currentColors.text, fontFamily: getFontFamily(language, 'bold') }]}>
                {new Date(order.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </View>
          </View>

          <View style={[styles.infoItem, { backgroundColor: currentColors.surface, borderColor: currentColors.border }]}>
            <Tag size={16} color={currentColors.textMuted} />
            <View>
              <Text style={[styles.infoLabel, { color: currentColors.textMuted, fontFamily: getFontFamily(language, 'black') }]}>ORDER ID</Text>
              <Text style={[styles.infoValue, { color: currentColors.text, fontFamily: getFontFamily(language, 'bold') }]}>#{order._id.slice(-8).toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* Address */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MapPin size={18} color={Colors.primary} />
            <Text style={styles.sectionTitle}>SHIPPING TO</Text>
          </View>
          <View style={[styles.addressBox, { backgroundColor: currentColors.surface, borderColor: currentColors.border }]}>
            <Text style={[styles.addressName, { color: currentColors.text, fontFamily: getFontFamily(language, 'bold') }]}>{order.shippingAddress.name}</Text>
            <Text style={[styles.addressText, { color: currentColors.textSecondary, fontFamily: getFontFamily(language) }]}>{order.shippingAddress.address}</Text>
            <Text style={[styles.addressText, { color: currentColors.textSecondary, fontFamily: getFontFamily(language) }]}>
              {order.shippingAddress.province}, {order.shippingAddress.zip}
            </Text>
            <Text style={[styles.addressPhone, { fontFamily: getFontFamily(language, 'bold') }]}>{order.shippingAddress.phone}</Text>
          </View>
        </View>

        {/* Items List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ITEMS PURCHASED</Text>
          {order.items.map((item: any, idx: number) => (
            <View key={idx} style={[styles.itemRow, { backgroundColor: currentColors.surface, borderColor: currentColors.border }]}>
              <View style={[styles.itemImageContainer, { backgroundColor: theme === 'dark' ? Colors.dark.background : 'rgba(0,0,0,0.02)' }]}>
                {item.thumbnail_url ? (
                  <Image source={{ uri: item.thumbnail_url }} style={styles.itemThumb} />
                ) : (
                  <Package size={24} color={currentColors.textMuted} />
                )}
              </View>
              <View style={styles.itemInfo}>
                <Text style={[styles.itemBrand, { fontFamily: getFontFamily(language, 'black') }]}>{item.brand.toUpperCase()}</Text>
                <Text style={[styles.itemModel, { color: currentColors.text, fontFamily: getFontFamily(language, 'bold') }]}>{item.model}</Text>
                <Text style={[styles.itemQty, { color: currentColors.textMuted, fontFamily: getFontFamily(language) }]}>Quantity: {item.quantity}</Text>
              </View>
              <Text style={[styles.itemPrice, { color: currentColors.text, fontFamily: getFontFamily(language, 'black') }]}>
                ฿{(item.price_thb * item.quantity).toLocaleString()}
              </Text>
            </View>
          ))}
        </View>

        {/* Total Summary */}
        <View style={[styles.summaryCard, { backgroundColor: currentColors.surfaceStrong, borderColor: currentColors.border }]}>
          <View style={styles.summaryLine}>
            <Text style={[styles.summaryLabel, { color: currentColors.textMuted, fontFamily: getFontFamily(language) }]}>Subtotal</Text>
            <Text style={[styles.summaryValue, { color: currentColors.text, fontFamily: getFontFamily(language, 'bold') }]}>฿{order.totalAmount.toLocaleString()}</Text>
          </View>
          <View style={styles.summaryLine}>
            <Text style={[styles.summaryLabel, { color: currentColors.textMuted, fontFamily: getFontFamily(language) }]}>Shipping</Text>
            <Text style={[styles.summaryValue, { color: '#10b981', fontFamily: getFontFamily(language, 'bold') }]}>FREE</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: currentColors.border }]} />
          <View style={styles.totalLine}>
            <Text style={[styles.totalLabel, { color: currentColors.text, fontFamily: getFontFamily(language, 'black') }]}>TOTAL PAID</Text>
            <Text style={[styles.totalValue, { fontFamily: getFontFamily(language, 'black') }]}>฿{order.totalAmount.toLocaleString()}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.helpBtn}
          onPress={() => Alert.alert('Support', 'Contacting SPEX support...')}
        >
          <Text style={[styles.helpBtnText, { color: currentColors.textMuted, fontFamily: getFontFamily(language) }]}>Need help with this order?</Text>
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
