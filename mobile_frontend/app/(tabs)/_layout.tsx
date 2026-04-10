import React, { useEffect, useState } from 'react'
import { Tabs } from 'expo-router'
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
  ShoppingCart
} from 'lucide-react-native'
import { Colors, Fonts, Radius, Spacing } from '../../lib/constants'
import ChatbotPopup from '../../components/ChatbotPopup'
import { useCart } from '../../hooks/useCart'

type TabIconProps = {
  focused: boolean
  label: string
  Icon: any
  isCenter?: boolean
  badgeCount?: number
}

function TabIcon({ focused, label, Icon, isCenter, badgeCount }: TabIconProps) {
  const scale = useSharedValue(1)
  const opacity = useSharedValue(focused ? 1 : 0.6)

  useEffect(() => {
    if (focused) {
      scale.value = withSequence(
        withSpring(1.15, { damping: 10, stiffness: 100 }),
        withSpring(1)
      )
      opacity.value = withTiming(1, { duration: 200 })
    } else {
      opacity.value = withTiming(0.6, { duration: 200 })
    }
  }, [focused])

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    }
  }, [focused])

  if (isCenter) {
    return (
      <View style={styles.centerTabContainer}>
        <View style={[styles.centerIconBg, focused && styles.centerIconBgActive]}>
          <Icon 
            size={28} 
            color="#fff" 
            strokeWidth={focused ? 2.5 : 2}
          />
          {focused && <View style={styles.centerGlow} />}
        </View>
        <Text
          style={[
            styles.tabLabel,
            focused ? styles.tabLabelActive : styles.tabLabelInactive,
            { marginTop: 6 }
          ]}
        >
          {label}
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.tabIconContainer}>
      <Animated.View style={animatedStyle}>
        <Icon 
          size={22} 
          color={focused ? Colors.primary : Colors.dark.textMuted} 
          strokeWidth={focused ? 2.2 : 1.8}
        />
      </Animated.View>
      <Text
        style={[
          styles.tabLabel,
          focused ? styles.tabLabelActive : styles.tabLabelInactive,
        ]}
      >
        {label}
      </Text>
      {focused && <Animated.View style={styles.tabIndicator} />}
      
      {badgeCount !== undefined && badgeCount > 0 && (
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>{badgeCount > 9 ? '9+' : badgeCount}</Text>
        </View>
      )}
    </View>
  )
}

export default function TabsLayout() {
  const [chatbotVisible, setChatbotVisible] = useState(false)
  const { totalCount } = useCart()

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
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.dark.textMuted,
        tabBarBackground: () => (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(15, 15, 20, 0.98)' }]} />
        ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} Icon={LayoutGrid} label="HOME" />
          ),
        }}
        listeners={{
          tabPress: handleTabPress,
        }}
      />
      <Tabs.Screen
        name="compare"
        options={{
          title: 'Compare',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} Icon={BarChart3} label="COMPARE" />
          ),
        }}
        listeners={{
          tabPress: handleTabPress,
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Shop',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} Icon={ShoppingBag} label="SHOP" isCenter />
          ),
        }}
        listeners={{
          tabPress: handleTabPress,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} Icon={ShoppingCart} label="CART" badgeCount={totalCount} />
          ),
        }}
        listeners={{
          tabPress: handleTabPress,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'User',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} Icon={UserIcon} label="USER" />
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

    {/* Floating Chatbot Toggle */}
    <TouchableOpacity 
      style={styles.floatingChatBtn}
      onPress={() => setChatbotVisible(true)}
      activeOpacity={0.8}
    >
      <MessagesSquare size={28} color="#fff" />
      <View style={styles.floatingChatGlow} />
    </TouchableOpacity>

    <ChatbotPopup 
      visible={chatbotVisible} 
      onClose={() => setChatbotVisible(false)} 
    />
    </>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    height: Platform.OS === 'ios' ? 88 : 68,
    borderRadius: 0,
    overflow: 'visible',
    elevation: 10,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    ...Platform.select({
      web: {
        backgroundColor: 'rgba(15, 15, 20, 0.98)',
      }
    })
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: '100%',
    paddingTop: 16,
  },
  centerTabContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    bottom: 4,
    zIndex: 1001,
  },
  centerIconBg: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.dark.surfaceStrong,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  centerIconBgActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryLight,
    shadowOpacity: 0.5,
  },
  centerGlow: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    opacity: 0.15,
  },
  tabLabel: {
    fontSize: 8,
    fontWeight: Fonts.weights.black,
    letterSpacing: 1.2,
  },
  tabLabelActive: {
    color: Colors.primary,
  },
  tabLabelInactive: {
    color: Colors.dark.textMuted,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -10,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  floatingChatBtn: {
    position: 'absolute',
    right: 20,
    bottom: Platform.OS === 'ios' ? 100 : 80,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3000,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 12,
  },
  floatingChatGlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 28,
    backgroundColor: Colors.primary,
    opacity: 0.3,
    transform: [{ scale: 1.2 }],
    zIndex: -1,
  },
  badgeContainer: {
    position: 'absolute',
    top: 10,
    right: -6,
    backgroundColor: '#ef4444',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
    borderWidth: 1,
    borderColor: 'rgba(15, 15, 20, 1)',
  },
  badgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: Fonts.weights.black,
  },
})
