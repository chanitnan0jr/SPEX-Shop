import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native'
import { useRouter, Link } from 'expo-router'
import { Colors, Fonts, Spacing, Radius } from '../../lib/constants'
import { authRegister } from '../../lib/api'
import { useAuth } from '../../context/auth'
import { useCart } from '../../hooks/useCart'

export default function RegisterScreen() {
  const router = useRouter()
  const { signIn } = useAuth()
  const { mergeLocalCart } = useCart()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      setError('All fields are required.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setError(null)
    setIsLoading(true)
    try {
      const { user, accessToken, refreshToken } = await authRegister(name.trim(), email.trim(), password)
      await signIn(accessToken, refreshToken, { id: user.id, email: user.email, name: user.name })
      // Sync guest cart to account
      await mergeLocalCart()
      router.replace('/(tabs)')
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? 'Registration failed. Please try again.'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Top Decorative Glow */}
          <View style={styles.topGlow} />

          <View style={styles.header}>
            <Text style={styles.tagline}>NEW REGISTRATION</Text>
            <Text style={styles.title}>
              Create{'\n'}
              <Text style={styles.titleAccent}>Account.</Text>
            </Text>
          </View>

          <View style={styles.form}>
            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>FULL NAME</Text>
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                placeholderTextColor={Colors.dark.textMuted}
                value={name}
                onChangeText={setName}
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
              <TextInput
                style={styles.input}
                placeholder="name@example.com"
                placeholderTextColor={Colors.dark.textMuted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>PASSWORD</Text>
              <TextInput
                style={styles.input}
                placeholder="Min. 6 characters"
                placeholderTextColor={Colors.dark.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>CONFIRM PASSWORD</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={Colors.dark.textMuted}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                editable={!isLoading}
              />
            </View>

            <TouchableOpacity
              style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.dark.background} />
              ) : (
                <Text style={styles.registerButtonText}>SIGN UP</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Link href="/auth/login" asChild>
                <TouchableOpacity>
                  <Text style={styles.linkText}>Sign In</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>

          {/* Bottom subtle glow */}
          <View style={styles.bottomGlow} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: 60,
    paddingBottom: 40,
    position: 'relative',
  },
  topGlow: {
    position: 'absolute',
    top: -100,
    right: -50,
    width: 300,
    height: 300,
    backgroundColor: 'rgba(20, 104, 255, 0.1)',
    borderRadius: Radius.full,
  },
  bottomGlow: {
    position: 'absolute',
    bottom: -150,
    left: -100,
    width: 400,
    height: 400,
    backgroundColor: 'rgba(16, 185, 129, 0.05)',
    borderRadius: Radius.full,
  },
  header: {
    marginBottom: Spacing['3xl'],
  },
  tagline: {
    fontSize: 10,
    fontWeight: Fonts.weights.black,
    color: Colors.primary,
    letterSpacing: 4,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: 42,
    fontWeight: Fonts.weights.bold,
    color: Colors.dark.text,
    lineHeight: 48,
    letterSpacing: -1.5,
  },
  titleAccent: {
    color: Colors.primaryLight,
  },
  form: {
    width: '100%',
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: Radius.lg,
    paddingVertical: 12,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  errorText: {
    color: '#ef4444',
    fontSize: Fonts.sizes.sm,
    fontWeight: Fonts.weights.medium,
  },
  inputContainer: {
    marginBottom: Spacing.xl,
  },
  inputLabel: {
    fontSize: 9,
    fontWeight: Fonts.weights.black,
    color: Colors.dark.textMuted,
    letterSpacing: 2,
    marginBottom: Spacing.sm,
    paddingLeft: 4,
  },
  input: {
    backgroundColor: Colors.dark.surfaceStrong,
    borderRadius: Radius.xl,
    paddingVertical: 16,
    paddingHorizontal: Spacing.lg,
    color: Colors.dark.text,
    fontSize: Fonts.sizes.md,
    fontWeight: Fonts.weights.semibold,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  registerButton: {
    backgroundColor: Colors.dark.text,
    borderRadius: Radius.full,
    paddingVertical: 20,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  registerButtonText: {
    color: Colors.dark.background,
    fontWeight: Fonts.weights.black,
    fontSize: 14,
    letterSpacing: 2,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing['2xl'],
    alignItems: 'center',
  },
  footerText: {
    color: Colors.dark.textMuted,
    fontSize: Fonts.sizes.sm,
  },
  linkText: {
    color: Colors.primaryLight,
    fontWeight: Fonts.weights.bold,
    fontSize: Fonts.sizes.sm,
  },
})
