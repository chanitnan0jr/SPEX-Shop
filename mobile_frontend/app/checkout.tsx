import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
  Alert,
} from 'react-native'
import { useRouter } from 'expo-router'
import { ChevronLeft, MapPin, Phone, User, CreditCard } from 'lucide-react-native'
import { Colors, Fonts, Radius, Spacing } from '../lib/constants'
import { useCart } from '../hooks/useCart'
import { createOrder, IShippingAddress } from '../lib/api'

export default function CheckoutScreen() {
  const router = useRouter()
  const { items, totalPrice, clearCart } = useCart()
  const [isLoading, setIsLoading] = useState(false)

  const [form, setForm] = useState<IShippingAddress>({
    name: '',
    phone: '',
    address: '',
    province: '',
    zip: '',
  })

  const handlePlaceOrder = async () => {
    // Validation
    if (!form.name || !form.phone || !form.address || !form.province || !form.zip) {
      Alert.alert('Missing Info', 'Please fill in all shipping details.')
      return
    }

    setIsLoading(true)
    try {
      const order = await createOrder(form)
      // Success! Cart is cleared on backend, but we also want to refresh local state if needed
      // Our useCart hook uses TanStack Query which will be invalidated by the API call or manually here
      
      Alert.alert(
        'Order Placed!',
        'Your order has been successfully created. You can track it in your profile.',
        [{ text: 'View Order', onPress: () => router.replace(`/(tabs)/cart`) }] // For now go back or to home
      )
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? 'Failed to place order.'
      Alert.alert('Error', msg)
    } finally {
      setIsLoading(false)
    }
  }

  const updateForm = (key: keyof IShippingAddress, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={Colors.dark.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Section: Shipping Info */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MapPin size={18} color={Colors.primary} />
              <Text style={styles.sectionTitle}>SHIPPING ADDRESS</Text>
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputWrapper}>
                <User size={16} color={Colors.dark.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  placeholderTextColor={Colors.dark.textMuted}
                  value={form.name}
                  onChangeText={(val) => updateForm('name', val)}
                />
              </View>

              <View style={styles.inputWrapper}>
                <Phone size={16} color={Colors.dark.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Phone Number"
                  placeholderTextColor={Colors.dark.textMuted}
                  value={form.phone}
                  onChangeText={(val) => updateForm('phone', val)}
                  keyboardType="phone-pad"
                />
              </View>

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Full Address (House No, Street, District)"
                placeholderTextColor={Colors.dark.textMuted}
                value={form.address}
                onChangeText={(val) => updateForm('address', val)}
                multiline
                numberOfLines={3}
              />

              <View style={styles.row}>
                <TextInput
                  style={[styles.input, { flex: 1, marginRight: Spacing.sm }]}
                  placeholder="Province"
                  placeholderTextColor={Colors.dark.textMuted}
                  value={form.province}
                  onChangeText={(val) => updateForm('province', val)}
                />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Zip Code"
                  placeholderTextColor={Colors.dark.textMuted}
                  value={form.zip}
                  onChangeText={(val) => updateForm('zip', val)}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Section: Payment Method (Locked to Simulated for now) */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <CreditCard size={18} color={Colors.primary} />
              <Text style={styles.sectionTitle}>PAYMENT METHOD</Text>
            </View>
            <View style={styles.paymentCard}>
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentName}>Simulated Payment</Text>
                <Text style={styles.paymentStatus}>Phase 5 Testing Only</Text>
              </View>
              <View style={styles.radioActive} />
            </View>
          </View>

          {/* Section: Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ORDER SUMMARY</Text>
            <View style={styles.summaryBox}>
              {items.map((item) => (
                <View key={item.specId} style={styles.summaryRow}>
                  <Text style={styles.summaryItem} numberOfLines={1}>
                    {item.brand} {item.model} x {item.quantity}
                  </Text>
                  <Text style={styles.summaryPrice}>
                    ฿{(item.price_thb * item.quantity).toLocaleString()}
                  </Text>
                </View>
              ))}
              <View style={styles.divider} />
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalAmount}>฿{totalPrice.toLocaleString()}</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.placeOrderBtn, isLoading && styles.btnDisabled]}
          onPress={handlePlaceOrder}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.dark.background} />
          ) : (
            <Text style={styles.placeOrderText}>PLACE ORDER</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.dark.border,
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
    paddingBottom: 120,
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
  inputGroup: {
    gap: Spacing.md,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dark.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    paddingHorizontal: Spacing.md,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    color: Colors.dark.text,
    fontSize: 16,
    backgroundColor: Colors.dark.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    paddingHorizontal: Spacing.md,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  row: {
    flexDirection: 'row',
  },
  paymentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.dark.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentName: {
    fontSize: 16,
    fontWeight: Fonts.weights.bold,
    color: Colors.dark.text,
  },
  paymentStatus: {
    fontSize: 12,
    color: Colors.primaryLight,
    marginTop: 2,
  },
  radioActive: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    borderWidth: 4,
    borderColor: Colors.dark.surfaceStrong,
  },
  summaryBox: {
    backgroundColor: Colors.dark.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  summaryItem: {
    flex: 1,
    color: Colors.dark.textMuted,
    fontSize: 14,
  },
  summaryPrice: {
    color: Colors.dark.text,
    fontSize: 14,
    fontWeight: Fonts.weights.semibold,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.dark.border,
    marginVertical: Spacing.md,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: Fonts.weights.bold,
    color: Colors.dark.text,
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: Fonts.weights.black,
    color: Colors.primaryLight,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.dark.background,
    padding: Spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    borderTopWidth: 1,
    borderTopColor: Colors.dark.border,
  },
  placeOrderBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingVertical: 18,
    alignItems: 'center',
  },
  placeOrderText: {
    color: Colors.dark.background,
    fontWeight: Fonts.weights.black,
    fontSize: 14,
    letterSpacing: 2,
  },
  btnDisabled: {
    opacity: 0.6,
  },
})
