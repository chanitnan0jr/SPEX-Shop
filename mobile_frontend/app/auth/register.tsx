import React, { useState, useEffect } from 'react'
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
  Dimensions,
} from 'react-native'
import { useRouter, Link } from 'expo-router'
import { ChevronLeft, Home, User, Mail, Lock, CheckCircle } from 'lucide-react-native'
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay, 
  Easing 
} from 'react-native-reanimated'
import { BlurView } from 'expo-blur'
import { Colors, Fonts, Spacing, Radius } from '../../lib/constants'
import { authRegister } from '../../lib/api'
import { useAuth } from '../../context/auth'
import { useCart } from '../../hooks/useCart'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

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

  // Animation values
  const formOpacity = useSharedValue(0)
  const formTranslateY = useSharedValue(30)
  const headerOpacity = useSharedValue(0)

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 800 })
    formOpacity.value = withDelay(300, withTiming(1, { duration: 800 }))
    formTranslateY.value = withDelay(300, withTiming(0, { 
      duration: 800, 
      easing: Easing.out(Easing.back(1.5)) 
    }))
  }, [])

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
  }))

  const formStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formTranslateY.value }],
  }))

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      setError('All fields are mandatory.')
      return
    }
    if (password.length < 6) {
      setError('Secure key must be 6+ chars.')
      return
    }
    if (password !== confirmPassword) {
      setError('Key disparity detected.')
      return
    }
    setError(null)
    setIsLoading(true)
    try {
      const { user, accessToken, refreshToken } = await authRegister(name.trim(), email.trim(), password)
      await signIn(accessToken, refreshToken, { id: user.id, email: user.email, name: user.name })
      await mergeLocalCart()
      router.replace('/(tabs)')
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? 'Access generation failed.'
      setError(msg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Background Layer: Deep Cyberpunk Architecture */}
      <View style={styles.bgWrapper}>
        <View style={styles.radialGlow1} />
        <View style={styles.radialGlow2} />
      </View>

      <SafeAreaView style={styles.safe}>
        {/* Modern Navbar */}
        <View style={styles.navBar}>
          <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
            <ChevronLeft size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.navBtn}>
            <Home size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent} 
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <Animated.View style={[styles.header, headerStyle]}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>DATA PROVISIONING V1.0</Text>
              </View>
              <Text style={styles.title}>REGIS<Text style={styles.titleAccent}>TER.</Text></Text>
              <Text style={styles.subtitle}>Initialize your professional profile and sync benchmarks.</Text>
            </Animated.View>

            <Animated.View style={[styles.formWrapper, formStyle]}>
               <BlurView intensity={20} tint="dark" style={styles.glassCard}>
                  {error && (
                    <View style={styles.errorPill}>
                      <Text style={styles.errorText}>{error.toUpperCase()}</Text>
                    </View>
                  )}

                  <View style={styles.inputStack}>
                    <View style={styles.inputBox}>
                      <Text style={styles.label}>FULL IDENTITY</Text>
                      <View style={styles.inputRow}>
                        <User size={16} color={Colors.primary} />
                        <TextInput
                          style={styles.input}
                          placeholder="AGENT_NAME"
                          placeholderTextColor="rgba(255,255,255,0.3)"
                          value={name}
                          onChangeText={setName}
                          editable={!isLoading}
                        />
                      </View>
                    </View>

                    <View style={styles.inputBox}>
                      <Text style={styles.label}>TERMINAL_ID</Text>
                      <View style={styles.inputRow}>
                        <Mail size={16} color={Colors.primary} />
                        <TextInput
                          style={styles.input}
                          placeholder="name@example.com"
                          placeholderTextColor="rgba(255,255,255,0.3)"
                          value={email}
                          onChangeText={setEmail}
                          autoCapitalize="none"
                          keyboardType="email-address"
                          editable={!isLoading}
                        />
                      </View>
                    </View>

                    <View style={styles.inputBox}>
                      <Text style={styles.label}>SECURE ACCESS KEY</Text>
                      <View style={styles.inputRow}>
                        <Lock size={16} color={Colors.primary} />
                        <TextInput
                          style={styles.input}
                          placeholder="••••••••"
                          placeholderTextColor="rgba(255,255,255,0.3)"
                          value={password}
                          onChangeText={setPassword}
                          secureTextEntry
                          editable={!isLoading}
                        />
                      </View>
                    </View>

                    <View style={styles.inputBox}>
                      <Text style={styles.label}>VERIFY KEY</Text>
                      <View style={styles.inputRow}>
                        <Lock size={16} color={Colors.primary} />
                        <TextInput
                          style={styles.input}
                          placeholder="••••••••"
                          placeholderTextColor="rgba(255,255,255,0.3)"
                          value={confirmPassword}
                          onChangeText={setConfirmPassword}
                          secureTextEntry
                          editable={!isLoading}
                        />
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.actionBtn, isLoading && styles.btnDisabled]}
                    onPress={handleRegister}
                    activeOpacity={0.8}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <Text style={styles.btnText}>REGISTER</Text>
                        <CheckCircle size={18} color="#fff" />
                      </>
                    )}
                  </TouchableOpacity>
               </BlurView>

               <View style={styles.loginPrompt}>
                 <Text style={styles.promptText}>ALREADY REGISTERED?</Text>
                 <Link href="/auth/login" asChild>
                   <TouchableOpacity style={styles.loginBtn}>
                     <Text style={styles.loginBtnText}>SIGN IN TO TERMINAL</Text>
                   </TouchableOpacity>
                 </Link>
               </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05070a',
  },
  bgWrapper: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  radialGlow1: {
    position: 'absolute',
    top: -150,
    right: -100,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(20, 104, 255, 0.12)',
  },
  radialGlow2: {
    position: 'absolute',
    bottom: -100,
    left: -100,
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: 'rgba(56, 189, 248, 0.05)',
  },
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: 10,
    height: 60,
    alignItems: 'center',
  },
  navBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: 20,
    paddingBottom: 60,
  },
  header: {
    marginBottom: 40,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 8,
    fontWeight: Fonts.weights.black,
    color: '#38bdf8',
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 50,
    fontWeight: Fonts.weights.black,
    color: '#fff',
    letterSpacing: -2,
    lineHeight: 56,
  },
  titleAccent: {
    color: Colors.primary,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.dark.textSecondary,
    marginTop: 16,
    lineHeight: 22,
    maxWidth: 280,
    opacity: 0.7,
  },
  formWrapper: {
    flex: 1,
  },
  glassCard: {
    borderRadius: Radius['3xl'],
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  errorPill: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 9,
    fontWeight: Fonts.weights.black,
    color: '#ef4444',
    letterSpacing: 1,
  },
  inputStack: {
    gap: 16,
    marginBottom: 32,
  },
  inputBox: {
    gap: 8,
  },
  label: {
    fontSize: 8,
    fontWeight: Fonts.weights.black,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1.5,
    paddingLeft: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    color: '#fff',
    fontSize: 15,
    fontWeight: Fonts.weights.semibold,
  },
  actionBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 18,
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  btnText: {
    color: '#fff',
    fontWeight: Fonts.weights.black,
    fontSize: 12,
    letterSpacing: 1,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  loginPrompt: {
    marginTop: 32,
    alignItems: 'center',
  },
  promptText: {
    fontSize: 9,
    fontWeight: Fonts.weights.bold,
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 1,
    marginBottom: 12,
  },
  loginBtn: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  loginBtnText: {
    color: '#fff',
    fontWeight: Fonts.weights.black,
    fontSize: 10,
    letterSpacing: 1,
  },
})
