import React, { useEffect, useState } from 'react'
import { Tabs, usePathname } from 'expo-router'
import { Platform, StyleSheet, View, Text, TouchableOpacity } from 'react-native'
import * as Haptics from 'expo-haptics'
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withSequence,
  withTiming
} from 'react-native-reanimated'
import { BlurView } from 'expo-blur'
import { 
  ShoppingBag,
  Package,
  User as UserIcon,
  LayoutGrid,
  BarChart3,
  Bot,
  MessagesSquare,
  ShoppingCart,
  Home
} from 'lucide-react-native'
import { Colors, Fonts, Radius, Spacing } from '../../lib/constants'
import ChatbotPopup from '../../components/ChatbotPopup'
import { useCart } from '../../hooks/useCart'
import { pickText } from '../../lib/i18n'
import { useUiPreferences } from '../../context/ui-context'
import { getFontFamily } from '../../lib/fonts'

type TabIconProps = {
  focused: boolean
  label: string
  Icon: any
  isCenter?: boolean
  badgeCount?: number
}

function TabIcon({ focused, label, Icon, badgeCount }: TabIconProps) {
  const { language, theme } = useUiPreferences()
  const currentColors = theme === 'dark' ? Colors.dark : Colors.light
  const scale = useSharedValue(1)
  const opacity = useSharedValue(focused ? 1 : 0.6)

  useEffect(() => {
    if (focused) {
      scale.value = withSpring(1.1, { damping: 15, stiffness: 100 })
      opacity.value = withTiming(1, { duration: 200 })
    } else {
      scale.value = withSpring(1, { damping: 15, stiffness: 100 })
      opacity.value = withTiming(0.6, { duration: 200 })
    }
  }, [focused])

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }))

  return (
    <View style={styles.tabIconContainer}>
      <Animated.View style={[animatedStyle, styles.iconUnit]}>
        <View style={styles.iconContainer}>
          <Icon 
            size={24} 
            color={focused ? Colors.primary : currentColors.textMuted} 
            strokeWidth={focused ? 2 : 1.5}
          />
          {badgeCount !== undefined && badgeCount > 0 && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{badgeCount > 9 ? '9+' : badgeCount}</Text>
            </View>
          )}
        </View>
        <Text
          numberOfLines={1}
          style={[
            styles.tabLabel,
            { color: focused ? Colors.primary : currentColors.textMuted }
          ]}
        >
          {label.toUpperCase()}
        </Text>
      </Animated.View>
    </View>
  )
}

export default function TabsLayout() {
  const [chatbotVisible, setChatbotVisible] = useState(false)
  const { totalCount } = useCart()
  const pathname = usePathname()
  const { language, theme } = useUiPreferences()
  const currentColors = theme === 'dark' ? Colors.dark : Colors.light

  const isCartPage = pathname === '/cart' || pathname === '/(tabs)/cart'

  const handleTabPress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    }
  }

  return (
    <>
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: [
          styles.tabBar,
          {
            shadowColor: theme === 'dark' ? '#000' : 'rgba(0, 0, 0, 0.4)',
            shadowOpacity: theme === 'dark' ? 0.4 : 0.15,
          }
        ],
        tabBarShowLabel: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: theme === 'dark' ? currentColors.textMuted : 'rgba(255, 255, 255, 0.4)',
        tabBarBackground: () => (
          <BlurView
            intensity={theme === 'dark' ? 80 : 90}
            tint="dark"
            style={StyleSheet.flatten([
              styles.tabBarBackground,
              {
                borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
                backgroundColor: 'rgba(5, 5, 10, 0.96)',
              }
            ])}
          />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: pickText(language, { en: 'Home', th: 'หน้าหลัก' }),
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} Icon={Home} label={pickText(language, { en: 'HOME', th: 'หน้าหลัก' })} />
          ),
        }}
        listeners={{
          tabPress: handleTabPress,
        }}
      />
      <Tabs.Screen
        name="compare"
        options={{
          title: pickText(language, { en: 'Compare', th: 'เปรียบเทียบ' }),
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} Icon={BarChart3} label={pickText(language, { en: 'COMPARE', th: 'เปรียบเทียบ' })} />
          ),
        }}
        listeners={{
          tabPress: handleTabPress,
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: pickText(language, { en: 'Shop', th: 'สโตร์' }),
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} Icon={ShoppingBag} label={pickText(language, { en: 'SHOP', th: 'สโตร์' })} />
          ),
        }}
        listeners={{
          tabPress: handleTabPress,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: pickText(language, { en: 'Cart', th: 'ตะกร้า' }),
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} Icon={ShoppingCart} label={pickText(language, { en: 'CART', th: 'ตะกร้า' })} badgeCount={totalCount} />
          ),
        }}
        listeners={{
          tabPress: handleTabPress,
        }}
      />
      <Tabs.Screen
        name="chatbot"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: pickText(language, { en: 'User', th: 'ผู้ใช้' }),
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} Icon={UserIcon} label={pickText(language, { en: 'USER', th: 'ผู้ใช้' })} />
          ),
        }}
        listeners={{
          tabPress: handleTabPress,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          href: null,
        }}
      />
    </Tabs>

    <TouchableOpacity 
      style={styles.floatingChatBtn}
      onPress={() => setChatbotVisible(true)}
      activeOpacity={0.8}
    >
      <MessagesSquare color="#fff" size={26} />
      <View style={styles.floatingChatGlow} />
    </TouchableOpacity>

    {/* Floating Chatbot Toggle - Hidden on Cart page to avoid blocking price */}

    <ChatbotPopup 
      visible={chatbotVisible} 
      onClose={() => setChatbotVisible(false)} 
    />
    </>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    height: Platform.OS === 'ios' ? 88 : 70,
    elevation: 0,
  },
  tabBarBackground: {
    ...StyleSheet.absoluteFillObject,
    borderTopWidth: 0.5,
  },
  tabIconContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  iconUnit: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Platform.OS === 'ios' ? 40 : 25,
  },
  iconContainer: {
    position: 'relative',
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 10,
    fontFamily: 'Prompt-Regular',
    marginTop: 6,
    letterSpacing: 0.5,
  },
  floatingChatBtn: {
    position: 'absolute',
    right: 20,
    bottom: Platform.OS === 'ios' ? 110 : 90,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3000,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingChatGlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 28,
    backgroundColor: Colors.primary,
    opacity: 0.2,
    transform: [{ scale: 1.2 }],
    zIndex: -1,
  },
  badgeContainer: {
    position: 'absolute',
    bottom: -4,
    right: -8,
    backgroundColor: '#ef4444',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
    borderWidth: 1.5,
    borderColor: 'rgba(5, 5, 10, 1)',
  },
  badgeText: {
    color: '#fff',
    fontSize: 8,
    fontFamily: 'Prompt-Bold',
  },
})
