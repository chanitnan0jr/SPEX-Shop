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
import { useUiPreferences } from '../../context/ui-context'
import { getFontFamily } from '../../lib/fonts'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

export default function RegisterScreen() {
  const router = useRouter()
  const { signIn } = useAuth()
  const { mergeLocalCart } = useCart()
  const { language, theme } = useUiPreferences()
  const currentColors = theme === 'dark' ? Colors.dark : Colors.light

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

  const shakeX = useSharedValue(0)

  const formStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
  }))

  const shakeStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: shakeX.value },
      { translateY: formTranslateY.value }
    ],
  }))

  const triggerShake = () => {
    shakeX.value = withTiming(-10, { duration: 50 }, () => {
      shakeX.value = withTiming(10, { duration: 50 }, () => {
        shakeX.value = withTiming(-10, { duration: 50 }, () => {
          shakeX.value = withTiming(10, { duration: 50 }, () => {
             shakeX.value = withTiming(0, { duration: 50 });
          });
        });
      });
    });
  }

  const handleRegister = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!name.trim() || !email.trim() || !password) {
      setError('All fields are mandatory.')
      triggerShake()
      return
    }
    if (!emailRegex.test(email.trim())) {
      setError('Invalid identity address format.')
      triggerShake()
      return
    }
    if (password.length < 6) {
      setError('Secure key must be 6+ chars.')
      triggerShake()
      return
    }
    if (password !== confirmPassword) {
      setError('Key disparity detected.')
      triggerShake()
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
    <View style={[styles.container, { backgroundColor: theme === 'dark' ? '#05070a' : '#f8fafc' }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} />
      
      {/* Background Layer: Deep Cyberpunk Architecture */}
      <View style={styles.bgWrapper}>
        <View style={[styles.radialGlow1, { backgroundColor: theme === 'dark' ? 'rgba(20, 104, 255, 0.12)' : 'rgba(20, 104, 255, 0.05)' }]} />
        <View style={[styles.radialGlow2, { backgroundColor: theme === 'dark' ? 'rgba(56, 189, 248, 0.05)' : 'rgba(56, 189, 248, 0.03)' }]} />
      </View>

      <SafeAreaView style={styles.safe}>
        {/* Modern Navbar */}
        <View style={styles.navBar}>
          <TouchableOpacity onPress={() => router.back()} style={StyleSheet.flatten([styles.navBtn, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderColor: currentColors.border }])}>
            <ChevronLeft size={20} color={currentColors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={StyleSheet.flatten([styles.navBtn, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderColor: currentColors.border }])}>
            <Home size={18} color={currentColors.text} />
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
              <View style={[styles.badge, { backgroundColor: theme === 'dark' ? 'rgba(56, 189, 248, 0.1)' : 'rgba(56, 189, 248, 0.05)', borderColor: 'rgba(56, 189, 248, 0.2)' }]}>
                <Text style={[styles.badgeText, { color: Colors.primaryLight, fontFamily: getFontFamily(language, 'black') }]}>SPEX-SHOP REGISTRATION</Text>
              </View>
              <Text style={[styles.title, { color: currentColors.text, fontFamily: getFontFamily(language, 'black') }]}>REGIS<Text style={styles.titleAccent}>TER.</Text></Text>
              <Text style={[styles.subtitle, { color: currentColors.textMuted, fontFamily: getFontFamily(language) }]}>Create your professional account and sync benchmarks.</Text>
            </Animated.View>

            <Animated.View style={[styles.formWrapper, formStyle, shakeStyle]}>
               <BlurView intensity={theme === 'dark' ? 20 : 40} tint={theme === 'dark' ? 'dark' : 'light'} style={StyleSheet.flatten([styles.glassCard, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.6)', borderColor: currentColors.border }])}>
                  {error && (
                    <View style={styles.errorPill}>
                      <Text style={styles.errorText}>{error.toUpperCase()}</Text>
                    </View>
                  )}

                  <View style={styles.inputStack}>
                    <View style={styles.inputBox}>
                      <Text style={[styles.label, { color: currentColors.textMuted, fontFamily: getFontFamily(language, 'black') }]}>FULL NAME</Text>
                      <View style={[styles.inputRow, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', borderColor: currentColors.border }]}>
                        <User size={16} color={Colors.primary} />
                        <TextInput
                          style={[styles.input, { color: currentColors.text, fontFamily: getFontFamily(language, 'semibold') }]}
                          placeholder="Your full name"
                          placeholderTextColor={theme === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
                          value={name}
                          onChangeText={setName}
                          editable={!isLoading}
                        />
                      </View>
                    </View>

                    <View style={styles.inputBox}>
                      <Text style={[styles.label, { color: currentColors.textMuted, fontFamily: getFontFamily(language, 'black') }]}>EMAIL ADDRESS</Text>
                      <View style={[styles.inputRow, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', borderColor: currentColors.border }]}>
                        <Home size={16} color={Colors.primary} />
                        <TextInput
                          style={[styles.input, { color: currentColors.text, fontFamily: getFontFamily(language, 'semibold') }]}
                          placeholder="email@example.com"
                          placeholderTextColor={theme === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
                          value={email}
                          onChangeText={setEmail}
                          autoCapitalize="none"
                          keyboardType="email-address"
                          editable={!isLoading}
                        />
                      </View>
                    </View>

                    <View style={styles.inputBox}>
                      <Text style={[styles.label, { color: currentColors.textMuted, fontFamily: getFontFamily(language, 'black') }]}>PASSWORD</Text>
                      <View style={[styles.inputRow, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', borderColor: currentColors.border }]}>
                        <Lock size={16} color={Colors.primary} />
                        <TextInput
                          style={[styles.input, { color: currentColors.text, fontFamily: getFontFamily(language, 'semibold') }]}
                          placeholder="••••••••"
                          placeholderTextColor={theme === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
                          value={password}
                          onChangeText={setPassword}
                          secureTextEntry
                          editable={!isLoading}
                        />
                      </View>
                    </View>

                    <View style={styles.inputBox}>
                      <Text style={[styles.label, { color: currentColors.textMuted, fontFamily: getFontFamily(language, 'black') }]}>VERIFY PASSWORD</Text>
                      <View style={[styles.inputRow, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', borderColor: currentColors.border }]}>
                        <Lock size={16} color={Colors.primary} />
                        <TextInput
                          style={[styles.input, { color: currentColors.text, fontFamily: getFontFamily(language, 'semibold') }]}
                          placeholder="••••••••"
                          placeholderTextColor={theme === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
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
                        <Text style={[styles.btnText, { fontFamily: getFontFamily(language, 'black') }]}>REGISTER</Text>
                        <CheckCircle size={18} color="#fff" />
                      </>
                    )}
                  </TouchableOpacity>
               </BlurView>

               <View style={styles.loginPrompt}>
                 <Text style={[styles.promptText, { color: currentColors.textMuted, fontFamily: getFontFamily(language, 'bold') }]}>ALREADY HAVE AN ACCOUNT?</Text>
                 <Link href="/auth/login" asChild>
                   <TouchableOpacity style={StyleSheet.flatten([styles.loginBtn, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderColor: currentColors.border }])}>
                     <Text style={[styles.loginBtnText, { color: currentColors.text, fontFamily: getFontFamily(language, 'black') }]}>LOG IN</Text>
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
