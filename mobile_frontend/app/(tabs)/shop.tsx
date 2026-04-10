import React, { useState, useCallback, useMemo } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  StatusBar,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { getProducts, getBrands } from '../../lib/api'
import { ProductCard } from '../../components/ProductCard'
import { Colors, Fonts, Spacing, Radius } from '../../lib/constants'
import type { Spec } from '../../types/spec'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const NUM_COLUMNS = 2

export default function ShopScreen() {
  const router = useRouter()
  const [selectedBrand, setSelectedBrand] = useState<string | undefined>(undefined)

  const { data: brands = [] } = useQuery({
    queryKey: ['brands'],
    queryFn: getBrands,
  })

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ['products', selectedBrand],
    queryFn: ({ pageParam = 1 }) => getProducts(pageParam, 20, selectedBrand),
    getNextPageParam: (lastPage: any) =>
      lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
  })

  const products = useMemo(
    () => data?.pages.flatMap((p: any) => p.products) ?? [],
    [data]
  )

  const handleProductPress = useCallback(
    (product: Spec) => {
      router.push(`/product/${product._id}`)
    },
    [router]
  )

  const renderItem = useCallback(
    ({ item }: { item: Spec }) => (
      <View style={styles.cardContainer}>
        <ProductCard product={item} onPress={() => handleProductPress(item)} />
      </View>
    ),
    [handleProductPress]
  )

  const renderHeader = useMemo(
    () => (
      <View style={styles.headerContainer}>
        {/* Top subtle glow */}
        <View style={styles.topGlow} />
        
        <View style={styles.heroSection}>
          <Text style={styles.heroTagline}>PREMIUM SELECTION</Text>
          <Text style={styles.heroTitle}>
            Discover your{'\n'}
            <Text style={styles.heroTitleAccent}>perfect device</Text>
          </Text>
        </View>

        <View style={styles.filterSection}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={['All Brands', ...brands]}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.filterList}
            renderItem={({ item }) => {
              const isAll = item === 'All Brands'
              const isActive = isAll ? !selectedBrand : selectedBrand === item
              return (
                <TouchableOpacity
                  onPress={() => setSelectedBrand(isAll ? undefined : item)}
                  style={[styles.filterChip, isActive && styles.filterChipActive]}
                >
                  <Text style={[styles.filterText, isActive && styles.filterTextActive]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )
            }}
          />
        </View>
      </View>
    ),
    [brands, selectedBrand]
  )

  if (isLoading && !isRefetching) {
    return (
      <View style={styles.loadingFull}>
         <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={styles.scrollContent}
        ListHeaderComponent={renderHeader}
        onEndReached={() => hasNextPage && fetchNextPage()}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={Colors.primary}
          />
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={styles.loadingMore}>
              <ActivityIndicator color={Colors.primary} />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  scrollContent: {
    paddingBottom: 140,
  },
  loadingFull: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.dark.background,
  },
  cardContainer: {
    width: '50%',
  },
  headerContainer: {
    paddingTop: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
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
  heroSection: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  heroTagline: {
    fontSize: 10,
    fontWeight: Fonts.weights.black,
    color: Colors.primary,
    letterSpacing: 3,
    marginBottom: Spacing.sm,
  },
  heroTitle: {
    fontSize: Fonts.sizes['3xl'],
    fontWeight: Fonts.weights.bold,
    color: Colors.dark.text,
    lineHeight: 42,
  },
  heroTitleAccent: {
    color: Colors.primaryLight,
  },
  filterSection: {
    marginTop: Spacing.sm,
  },
  filterList: {
    paddingBottom: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: 10,
    borderRadius: Radius.full,
    backgroundColor: Colors.dark.surfaceStrong,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.dark.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: Fonts.sizes.sm,
    fontWeight: Fonts.weights.semibold,
    color: Colors.dark.textSecondary,
  },
  filterTextActive: {
    color: '#ffffff',
  },
  loadingMore: {
    paddingVertical: Spacing.xl,
  },
})
