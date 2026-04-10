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
  Dimensions,
  StatusBar,
  ActivityIndicator,
} from 'react-native'
import { useRouter, Link } from 'expo-router'
import { ChevronLeft, Home, Mail, Lock, ArrowRight } from 'lucide-react-native'
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay, 
  Easing 
} from 'react-native-reanimated'
import { BlurView } from 'expo-blur'
import { Colors, Fonts, Spacing, Radius } from '../../lib/constants'
import { authLogin } from '../../lib/api'
import { useAuth } from '../../context/auth'
import { useCart } from '../../hooks/useCart'
import { useUiPreferences } from '../../context/ui-context'
import { getFontFamily } from '../../lib/fonts'

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window')

export default function LoginScreen() {
  const router = useRouter()
  const { signIn } = useAuth()
  const { mergeLocalCart } = useCart()
  const { language, theme } = useUiPreferences()
  const currentColors = theme === 'dark' ? Colors.dark : Colors.light
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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

  const shakeY = useSharedValue(0)
  const shakeX = useSharedValue(0)

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

  const handleLogin = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    
    if (!email.trim() || !password) {
      setError('Credentials required.')
      triggerShake()
      return
    }

    if (!emailRegex.test(email.trim())) {
      setError('Invalid terminal address format.')
      triggerShake()
      return
    }

    setError(null)
    setIsLoading(true)
    try {
      const { user, accessToken, refreshToken } = await authLogin(email.trim(), password)
      await signIn(accessToken, refreshToken, { id: user.id, email: user.email, name: user.name })
      await mergeLocalCart()
      router.replace('/(tabs)')
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? 'Access denied. Verify credentials.'
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
        <View style={[styles.radialGlow1, { backgroundColor: theme === 'dark' ? 'rgba(20, 104, 255, 0.15)' : 'rgba(20, 104, 255, 0.05)' }]} />
        <View style={[styles.radialGlow2, { backgroundColor: theme === 'dark' ? 'rgba(20, 104, 255, 0.08)' : 'rgba(20, 104, 255, 0.03)' }]} />
        <View style={[styles.gridOverlay, { borderColor: theme === 'dark' ? '#fff' : '#000', opacity: theme === 'dark' ? 0.03 : 0.015 }]} />
      </View>

      <SafeAreaView style={styles.safe}>
        {/* Modern Navbar */}
        <View style={styles.navBar}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.navBtn, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderColor: currentColors.border }]}>
            <ChevronLeft size={20} color={currentColors.text} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={[styles.navBtn, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderColor: currentColors.border }]}>
            <Home size={18} color={currentColors.text} />
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.content}>
            <Animated.View style={[styles.header, headerStyle]}>
              <View style={[styles.badge, { backgroundColor: theme === 'dark' ? 'rgba(20, 104, 255, 0.1)' : 'rgba(20, 104, 255, 0.05)', borderColor: 'rgba(20, 104, 255, 0.2)' }]}>
                <Text style={[styles.badgeText, { color: Colors.primary, fontFamily: getFontFamily(language, 'black') }]}>SPEX-SHOP SECURE</Text>
              </View>
              <Text style={[styles.title, { color: currentColors.text, fontFamily: getFontFamily(language, 'black') }]}>LOG <Text style={styles.titleAccent}>IN.</Text></Text>
              <Text style={[styles.subtitle, { color: currentColors.textMuted, fontFamily: getFontFamily(language) }]}>Access your professional hardware analytics and marketplace.</Text>
            </Animated.View>

            <Animated.View style={[styles.formWrapper, formStyle, shakeStyle]}>
               <BlurView intensity={theme === 'dark' ? 20 : 40} tint={theme === 'dark' ? 'dark' : 'light'} style={StyleSheet.flatten([styles.glassCard, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.6)', borderColor: currentColors.border }])}>
                  {error && (
                    <View style={styles.errorPill}>
                      <Text style={styles.errorText}>{error.toUpperCase()}</Text>
                    </View>
                  )}

                  <View style={styles.inputStack}>
                    <View style={[styles.inputRow, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', borderColor: currentColors.border }]}>
                      <Mail size={16} color={Colors.primary} />
                      <TextInput
                        style={[styles.input, { color: currentColors.text, fontFamily: getFontFamily(language, 'semibold') }]}
                        placeholder="EMAIL ADDRESS"
                        placeholderTextColor={theme === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'}
                        value={email}
                        onChangeText={setEmail}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        editable={!isLoading}
                      />
                    </View>

                    <View style={styles.inputRowHeader}>
                       <Text style={[styles.label, { color: currentColors.textMuted, fontFamily: getFontFamily(language, 'black') }]}>PASSWORD</Text>
                       <TouchableOpacity><Text style={[styles.forgotText, { fontFamily: getFontFamily(language, 'bold') }]}>FORGOT?</Text></TouchableOpacity>
                    </View>
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

                  <TouchableOpacity
                    style={[styles.actionBtn, isLoading && styles.btnDisabled]}
                    onPress={handleLogin}
                    activeOpacity={0.8}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <Text style={[styles.btnText, { fontFamily: getFontFamily(language, 'black') }]}>LOG IN</Text>
                        <ArrowRight size={18} color="#fff" />
                      </>
                    )}
                  </TouchableOpacity>
               </BlurView>

               <View style={styles.registerPrompt}>
                 <Text style={[styles.promptText, { color: currentColors.textMuted, fontFamily: getFontFamily(language, 'bold') }]}>DON'T HAVE AN ACCOUNT?</Text>
                 <Link href="/auth/register" asChild>
                   <TouchableOpacity style={StyleSheet.flatten([styles.registerBtn, { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', borderColor: currentColors.border }])}>
                     <Text style={[styles.registerBtnText, { color: currentColors.text, fontFamily: getFontFamily(language, 'black') }]}>REGISTER</Text>
                   </TouchableOpacity>
                 </Link>
               </View>
            </Animated.View>
          </View>
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
    backgroundColor: 'rgba(20, 104, 255, 0.15)',
    filter: Platform.OS === 'web' ? 'blur(100px)' : undefined, // Native uses blur radius in another way but we can simulate with layers
  },
  radialGlow2: {
    position: 'absolute',
    bottom: -100,
    left: -100,
    width: 350,
    height: 350,
    borderRadius: 175,
    backgroundColor: 'rgba(20, 104, 255, 0.08)',
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.03,
    // Grid pattern simulation
    borderWidth: 0.5,
    borderColor: '#fff',
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
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: 20,
  },
  header: {
    marginBottom: 40,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(20, 104, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(20, 104, 255, 0.2)',
    marginBottom: 16,
  },
  badgeText: {
    fontSize: 8,
    fontWeight: Fonts.weights.black,
    color: Colors.primaryLight,
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 56,
    fontWeight: Fonts.weights.black,
    color: '#fff',
    letterSpacing: -2,
    lineHeight: 60,
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
    gap: 20,
    marginBottom: 32,
  },
  inputRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: -12,
  },
  label: {
    fontSize: 9,
    fontWeight: Fonts.weights.black,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1.5,
    paddingLeft: 4,
  },
  forgotText: {
    fontSize: 9,
    fontWeight: Fonts.weights.bold,
    color: Colors.primaryLight,
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
    paddingVertical: 18,
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
  registerPrompt: {
    marginTop: 40,
    alignItems: 'center',
  },
  promptText: {
    fontSize: 10,
    fontWeight: Fonts.weights.bold,
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 1,
    marginBottom: 12,
  },
  registerBtn: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  registerBtnText: {
    color: '#fff',
    fontWeight: Fonts.weights.black,
    fontSize: 11,
    letterSpacing: 1,
  },
})
