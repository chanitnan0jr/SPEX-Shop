import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Image,
} from 'react-native'
import { useRouter } from 'expo-router'
import { 
  User as UserIcon, 
  Settings, 
  LogOut, 
  ShieldCheck, 
  CircleUser,
  ChevronRight,
  ShoppingBag
} from 'lucide-react-native'
import { Colors, Fonts, Radius, Spacing } from '../../lib/constants'
import { useAuth } from '../../context/auth'

export default function ProfileScreen() {
  const router = useRouter()
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    router.replace('/auth/login')
  }

  const renderGuestState = () => (
    <View style={styles.guestContainer}>
      <View style={styles.guestIconContainer}>
        <UserIcon size={48} color={Colors.dark.textMuted} />
      </View>
      <Text style={styles.guestTitle}>Welcome to SPEX</Text>
      <Text style={styles.guestSubtitle}>
        Sign in to save your preferences, sync your cart, and manage your orders.
      </Text>
      <TouchableOpacity
        style={styles.loginBtn}
        onPress={() => router.push('/auth/login')}
      >
        <Text style={styles.loginBtnText}>SIGN IN / SIGN UP</Text>
      </TouchableOpacity>
    </View>
  )

  const renderProfileState = () => (
    <View style={styles.profileSection}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>
        <View style={styles.badge}>
          <ShieldCheck size={12} color="#fff" />
        </View>
      </View>
      
      <Text style={styles.userName}>{user?.name}</Text>
      <Text style={styles.userEmail}>{user?.email}</Text>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>12</Text>
          <Text style={styles.statLabel}>Orders</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>5</Text>
          <Text style={styles.statLabel}>Saved</Text>
        </View>
      </View>
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Account</Text>
          <TouchableOpacity style={styles.settingsBtn}>
            <Settings size={22} color={Colors.dark.text} />
          </TouchableOpacity>
        </View>

        {user ? renderProfileState() : renderGuestState()}

        <View style={styles.menuSection}>
          <Text style={styles.menuTitle}>ACTIVITY</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/orders')}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(20, 104, 255, 0.1)' }]}>
                <ShoppingBag size={20} color={Colors.primary} />
              </View>
              <Text style={styles.menuItemText}>My Orders</Text>
            </View>
            <ChevronRight size={18} color={Colors.dark.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                <CircleUser size={20} color="#10b981" />
              </View>
              <Text style={styles.menuItemText}>Edit Profile</Text>
            </View>
            <ChevronRight size={18} color={Colors.dark.textMuted} />
          </TouchableOpacity>
        </View>

        {user && (
          <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
            <LogOut size={20} color="#ef4444" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.versionText}>SPEX MOBILE v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.lg,
  },
  title: {
    fontSize: 32,
    fontWeight: Fonts.weights.bold,
    color: Colors.dark.text,
    letterSpacing: -1,
  },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.dark.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  guestContainer: {
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: Spacing['2xl'],
  },
  guestIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.dark.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  guestTitle: {
    fontSize: 24,
    fontWeight: Fonts.weights.bold,
    color: Colors.dark.text,
    marginBottom: Spacing.sm,
  },
  guestSubtitle: {
    fontSize: 14,
    color: Colors.dark.textMuted,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  loginBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingVertical: 18,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
  },
  loginBtnText: {
    color: Colors.dark.background,
    fontWeight: Fonts.weights.black,
    fontSize: 14,
    letterSpacing: 2,
  },
  profileSection: {
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: Spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: Colors.dark.surface,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: Fonts.weights.bold,
    color: Colors.dark.text,
  },
  badge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.dark.background,
  },
  userName: {
    fontSize: 24,
    fontWeight: Fonts.weights.bold,
    color: Colors.dark.text,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.dark.textMuted,
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.dark.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginTop: Spacing.xl,
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: Fonts.weights.bold,
    color: Colors.dark.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: Colors.dark.border,
  },
  menuSection: {
    marginTop: Spacing['3xl'],
    paddingHorizontal: Spacing.xl,
  },
  menuTitle: {
    fontSize: 10,
    fontWeight: Fonts.weights.black,
    color: Colors.dark.textMuted,
    letterSpacing: 2,
    marginBottom: Spacing.md,
    paddingLeft: 4,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.dark.surface,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: Fonts.weights.semibold,
    color: Colors.dark.text,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing['3xl'],
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  signOutText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: Fonts.weights.bold,
  },
  versionText: {
    textAlign: 'center',
    color: Colors.dark.textMuted,
    fontSize: 10,
    marginTop: Spacing.xl,
    letterSpacing: 1,
  },
})
