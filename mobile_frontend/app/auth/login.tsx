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
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from 'react-native'
import { useRouter, Link } from 'expo-router'
import { Colors, Fonts, Spacing, Radius } from '../../lib/constants'
import { authLogin } from '../../lib/api'
import { useAuth } from '../../context/auth'
import { useCart } from '../../hooks/useCart'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

export default function LoginScreen() {
  const router = useRouter()
  const { signIn } = useAuth()
  const { mergeLocalCart } = useCart()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }
    setError(null)
    setIsLoading(true)
    try {
      const { user, accessToken, refreshToken } = await authLogin(email.trim(), password)
      await signIn(accessToken, refreshToken, { id: user.id, email: user.email, name: user.name })
      // Sync guest cart to account
      await mergeLocalCart()
      router.replace('/(tabs)')
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? 'Login failed. Please try again.'
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
        <View style={styles.content}>
          {/* Top Decorative Glow */}
          <View style={styles.topGlow} />

          <View style={styles.header}>
            <Text style={styles.tagline}>SYSTEM ACCESS</Text>
            <Text style={styles.title}>
              Welcome{'\n'}
              <Text style={styles.titleAccent}>Back.</Text>
            </Text>
          </View>

          <View style={styles.form}>
            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

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
                placeholder="••••••••"
                placeholderTextColor={Colors.dark.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!isLoading}
              />
            </View>

            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.dark.background} />
              ) : (
                <Text style={styles.loginButtonText}>SIGN IN</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <Link href="/auth/register" asChild>
                <TouchableOpacity>
                  <Text style={styles.linkText}>Create one</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>

          {/* Bottom subtle glow */}
          <View style={styles.bottomGlow} />
        </View>
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
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
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
    marginBottom: Spacing['4xl'],
  },
  tagline: {
    fontSize: 10,
    fontWeight: Fonts.weights.black,
    color: Colors.primary,
    letterSpacing: 4,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: 48,
    fontWeight: Fonts.weights.bold,
    color: Colors.dark.text,
    lineHeight: 52,
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
  loginButton: {
    backgroundColor: Colors.dark.text,
    borderRadius: Radius.full,
    paddingVertical: 20,
    alignItems: 'center',
    marginTop: Spacing.lg,
    ...Platform.select({
      ios: {
        shadowColor: '#fff',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
    }),
  },
  loginButtonText: {
    color: Colors.dark.background,
    fontWeight: Fonts.weights.black,
    fontSize: 14,
    letterSpacing: 2,
  },
  loginButtonDisabled: {
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
