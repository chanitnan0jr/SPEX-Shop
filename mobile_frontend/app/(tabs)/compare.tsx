import React, { useState, useCallback, useMemo, memo } from 'react'
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  Modal,
  FlatList,
  TextInput,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'
import { 
  BarChart3, 
  Zap, 
  Plus, 
  X, 
  Search, 
  ChevronRight, 
  Cpu, 
  Monitor, 
  Camera, 
  Battery, 
  Database, 
  Cpu as GpuIcon, 
  Layers, 
  Wifi, 
  Radio,
  Tag,
  ShoppingBag
} from 'lucide-react-native'
import { Colors, Fonts, Spacing, Radius } from '../../lib/constants'
import { getProducts, compareSpecs } from '../../lib/api'
import { RadarFingerprint } from '../../components/RadarFingerprint'
import { useCart } from '../../hooks/useCart'
import type { Spec } from '../../types/spec'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

// Optimized List Item for Device Selection
const DeviceListItem = memo(({ item, onSelect }: { item: Spec; onSelect: (d: Spec) => void }) => (
  <TouchableOpacity 
    style={styles.productItem}
    onPress={() => onSelect(item)}
  >
    <Image 
      source={item.thumbnail_url ? { uri: item.thumbnail_url } : require('../../assets/devices/phone1.png')} 
      style={styles.productThumb} 
    />
    <View style={styles.productInfo}>
      <Text style={styles.productBrand}>{item.brand.toUpperCase()}</Text>
      <Text style={styles.productModel}>{item.model}</Text>
    </View>
    <ChevronRight size={18} color={Colors.dark.textMuted} />
  </TouchableOpacity>
))

export default function CompareTabScreen() {
  const router = useRouter()
  const { addToCart } = useCart()
  // Fixed 4-slot system to prevent shifting
  const [selectedDevices, setSelectedDevices] = useState<(Spec | null)[]>([null, null, null, null])
  const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [allProducts, setAllProducts] = useState<Spec[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [comparisonData, setComparisonData] = useState<(Spec | null)[]>([null, null, null, null])

  const { m1, m2, m3, m4 } = useLocalSearchParams()
  const initialLoadHandled = React.useRef(false)

  // Table Structure Definition - Simplified for robustness
  const TABLE_STRUCTURE = [
    {
      title: 'PERFORMANCE',
      icon: <Cpu size={14} color={Colors.primary} />,
      features: [
        { label: 'OS', keys: ['Operating system', 'OS', 'Platform OS'] },
        { label: 'CHIPSET', keys: ['Chipset', 'Processor'] },
        { label: 'GPU', keys: ['GPU', 'Graphics'] },
        { label: 'RAM', keys: ['RAM', 'Memory'] },
        { label: 'STORAGE', keys: ['Storage', 'Internal Storage', 'ROM'] },
      ]
    },
    {
      title: 'DISPLAY',
      icon: <Monitor size={14} color={Colors.primary} />,
      features: [
        { label: 'SIZE', keys: ['Screen size', 'Size', 'Display Size'] },
        { label: 'RESOLUTION', keys: ['Resolution', 'Screen resolution', 'Display Resolution', 'Pixel density', 'Res'] },
        { label: 'REFRESH', keys: ['Refresh rate', 'Hz', 'Display Refresh', 'Refresh'] },
      ]
    },
    {
      title: 'CAMERA',
      icon: <Camera size={14} color={Colors.primary} />,
      features: [
        { label: 'MAIN', keys: ['Rear camera', 'Main Camera', 'Triple', 'Dual'] },
        { label: 'SELFIE', keys: ['Front camera', 'Selfie camera', 'Single'] },
      ]
    },
    {
      title: 'POWER',
      icon: <Battery size={14} color={Colors.primary} />,
      features: [
        { label: 'CAPACITY', keys: ['Battery capacity', 'Capacity', 'Battery'] },
        { label: 'CHARGING', keys: ['Fast charging', 'Charging', 'Speed'] },
      ]
    },
    {
      title: 'CONNECTIVITY',
      icon: <Wifi size={14} color={Colors.primary} />,
      features: [
        { label: 'NETWORK', keys: ['Network', 'Technology', 'Bands'] },
        { label: 'USB', keys: ['USB', 'USB Type', 'Port'] },
        { label: 'BLUETOOTH', keys: ['Bluetooth', 'BT'] },
      ]
    },
    {
      title: 'BUILD',
      icon: <Layers size={14} color={Colors.primary} />,
      features: [
        { label: 'WEIGHT', keys: ['Weight', 'Body Weight'] },
        { label: 'THICKNESS', keys: ['Thickness', 'Dimensions'] },
        { label: 'MATERIAL', keys: ['Body material', 'Build'] },
      ]
    },
    {
      title: 'PRICING',
      icon: <Tag size={14} color={Colors.primary} />,
      features: [
        { label: 'PRICE', keys: ['price_thb', 'Price'] },
      ]
    }
  ]

  // Helper to find spec value across multiple possible keys/sections
  function getSpecValue(d: Spec | null, featureKeys: string[], label: string): string {
    if (!d) return '-'
    
    // Special case for Price
    if (label === 'PRICE' || featureKeys.includes('price_thb')) {
      return d.price_thb ? `฿${d.price_thb.toLocaleString('th-TH')}` : '—'
    }

    const keysToSearch = [...(featureKeys || [])]
    if (label) keysToSearch.push(label)

    // Search through all sections and keys
    for (const sectionName in d.spec_sections) {
      const section = d.spec_sections[sectionName]
      if (typeof section !== 'object' || section === null) continue
      
      for (const key in section) {
        const lowerKey = key.toLowerCase()
        if (keysToSearch.some(fk => lowerKey.includes(fk.toLowerCase()) || fk.toLowerCase().includes(lowerKey))) {
          return section[key]
        }
      }
    }
    
    // Fallback to highlights
    for (const fk of keysToSearch) {
      const lowerFk = fk.toLowerCase()
      const highlightVal = (d.highlights as any)?.[lowerFk]
      if (highlightVal) return highlightVal
    }

    return '-'
  }

  // Load deep-linked devices on mount
  React.useEffect(() => {
    if (initialLoadHandled.current) return
    
    const models = [m1, m2, m3, m4].filter((m): m is string => typeof m === 'string' && m.length > 0)
    if (models.length > 0) {
      setIsLoading(true)
      compareSpecs(models).then(specs => {
        const next = [null, null, null, null] as (Spec | null)[]
        models.forEach((model, i) => {
          const found = specs.find(s => s.model === model)
          if (found) next[i] = found
        })
        setSelectedDevices(next)
        initialLoadHandled.current = true
      }).finally(() => setIsLoading(false))
    }
  }, [m1, m2, m3, m4])

  // Load products for selection
  React.useEffect(() => {
    if (isModalVisible && allProducts.length === 0) {
      loadProducts()
    }
  }, [isModalVisible])

  // Load detailed comparison when selections change
  React.useEffect(() => {
    const activeDevices = selectedDevices.filter((d): d is Spec => d !== null)
    if (activeDevices.length >= 1) {
      const models = activeDevices.map(d => d.model)
      compareSpecs(models).then(specs => {
        // Map fetched specs back to their original slots by model
        const newComparisonData = selectedDevices.map(selected => {
          if (!selected) return null
          return specs.find(s => s.model === selected.model) || null
        })
        setComparisonData(newComparisonData)
      })
    } else {
      setComparisonData([null, null, null, null])
    }
  }, [selectedDevices])

  async function loadProducts() {
    setIsLoading(true)
    try {
      const { products } = await getProducts(1, 50)
      setAllProducts(products)
    } catch (e) {
      console.error('Failed to load products', e)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectDevice = useCallback((device: Spec) => {
    if (selectedDevices.find(d => d?._id === device._id)) {
       setIsModalVisible(false)
       return
    }
    
    setSelectedDevices(prev => {
      const next = [...prev]
      if (activeSlotIndex !== null) {
        next[activeSlotIndex] = device
      } else {
        const emptyIdx = next.findIndex(s => s === null)
        if (emptyIdx !== -1) next[emptyIdx] = device
      }
      return next
    })
    
    setIsModalVisible(false)
    setSearchQuery('')
    setActiveSlotIndex(null)
  }, [selectedDevices, activeSlotIndex])

  const filteredProducts = useMemo(() => {
    return allProducts.filter(p => 
      p.model.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.brand.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [allProducts, searchQuery])

  // Radar Mapping Logic (Relative Comparison Mode)
  const radarChartData = useMemo(() => {
    const activeDevices = comparisonData.filter((d): d is Spec => d !== null)
    if (activeDevices.length === 0) return null

    // Step 1: Extract Raw Metrics for all comparison slots
    const deviceMetrics = comparisonData.map(d => {
      if (!d) return [0, 0, 0, 0, 0, 0]
      const h = d.highlights
      
      // PRICE (฿)
      const price = d.price_thb || 0
      
      // CPU (Score 0-1)
      let cpu = 0.4
      const chipset = h.chipset?.toUpperCase() || ''
      if (chipset.match(/A1[78]|GEN 3|D9300|D9400/)) cpu = 0.98
      else if (chipset.match(/A1[56]|GEN 2|D9200/)) cpu = 0.92
      else if (chipset.match(/GEN 1|D9000|888|870|A14/)) cpu = 0.85
      else if (chipset.match(/7+ GEN|D8000|865|A13/)) cpu = 0.78
      else if (chipset.match(/6 GEN|D7000|G99|HELIOT/)) cpu = 0.68
      else if (chipset.match(/4 GEN|D6000|SNAPDRAGON/)) cpu = 0.58
      
      // DISPLAY (Score 0-1)
      let display = 0.4
      const displayStr = h.display?.toUpperCase() || ''
      if (displayStr.includes('LTPO')) display = 0.95
      else if (displayStr.includes('144HZ')) display = 0.92
      else if (displayStr.includes('120HZ') || displayStr.includes('AMOLED') || displayStr.includes('OLED')) {
        display = displayStr.includes('120HZ') ? 0.88 : 0.82
      } else if (displayStr.includes('90HZ')) display = 0.72
      else if (displayStr.includes('IPS') || displayStr.includes('LCD')) display = 0.62

      // BATTERY (mAh)
      const mahStr = h.battery?.split('|')[0] || ''
      const battery = parseInt(mahStr.replace(/[^0-9]/g, '') || '4500')

      // RAM (GB)
      const ram = parseInt(h.ram?.replace(/[^0-9]/g, '') || '8')

      // CAMERA (Score 0-1)
      let camera = 0.4
      const cameraStr = h.camera?.toUpperCase() || ''
      if (cameraStr.match(/200MP|LEICA|HASSELBLAD|ZEISS/)) camera = 0.98
      else if (cameraStr.match(/108MP|50MP/)) camera = 0.88
      else if (cameraStr.match(/64MP|48MP/)) camera = 0.78
      else if (cameraStr.includes('MP')) camera = 0.68

      return [price, cpu, display, battery, ram, camera]
    })

    // Step 2: Find Maximum for each axis in the current set for normalization
    const maxVals = [0, 1, 2, 3, 4, 5].map(axisIdx => {
      const axisValues = deviceMetrics.map(m => m[axisIdx])
      const max = Math.max(...axisValues)
      return max > 0 ? max : 1 // Avoid division by zero
    })

    // Step 3: Map to normalized 0.0 - 1.0 scores
    const normalize = (metrics: number[]) => {
      return metrics.map((val, i) => Math.min(1.0, val / maxVals[i]))
    }

    return {
      device1: normalize(deviceMetrics[0]),
      device2: normalize(deviceMetrics[1]),
      device3: normalize(deviceMetrics[2]),
      device4: normalize(deviceMetrics[3]),
      label1: comparisonData[0]?.model || '',
      label2: comparisonData[1]?.model || '',
      label3: comparisonData[2]?.model || '',
      label4: comparisonData[3]?.model || '',
    }
  }, [comparisonData])

  const renderComparisonTable = () => {
    const activeDevices = comparisonData.filter((d): d is Spec => d !== null)
    if (activeDevices.length < 1) return null

    return (
      <View style={styles.tableCard}>
        {/* Sticky-like Header */}
        <View style={styles.tableHeader}>
           <View style={styles.featureColumnHeader}>
              <Text style={styles.headerLabel}>SPECIFICATION</Text>
           </View>
           {comparisonData.map((d, i) => (
             <View key={d?._id || `empty-header-${i}`} style={styles.valueColumnHeader}>
               {d ? (
                 <Text numberOfLines={2} style={styles.headerValue}>{d.model}</Text>
               ) : (
                 <Text style={[styles.headerValue, { opacity: 0.2 }]}>-</Text>
               )}
             </View>
           ))}
        </View>

        {/* Categories */}
        {TABLE_STRUCTURE.map((section, sIdx) => (
          <View key={section.title}>
            <View style={styles.categoryRow}>
               <View style={styles.categoryIcon}>{section.icon}</View>
               <Text style={styles.categoryTitle}>{section.title}</Text>
            </View>
            
            {section.features.map((f, fIdx) => (
              <View key={f.label} style={styles.tableRow}>
                <View style={styles.featureNameCol}>
                   <Text style={styles.featureName}>{f.label}</Text>
                </View>
                {comparisonData.map((d, dIdx) => {
                  const val = getSpecValue(d, f.keys, f.label)
                  
                  return (
                    <View key={d?._id ? d._id + f.label : `empty-${dIdx}-${f.label}`} style={styles.valueCol}>
                       <Text numberOfLines={4} style={styles.featureValue}>{val}</Text>
                    </View>
                  )
                })}
              </View>
            ))}
          </View>
        ))}
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.tagline}>{'>_ SYSTEM ALPHA'}</Text>
          <Text style={styles.title}>COMPARE DEVICES</Text>
          <Text style={styles.subtitle}>HIGH-FIDELITY HARDWARE ANALYTICS</Text>
        </View>

        {/* Device Selection Slots */}
        <View style={styles.deviceGrid}>
          {[0, 1, 2, 3].map((index) => {
            const device = selectedDevices[index]
            return (
              <TouchableOpacity
                key={index}
                style={[styles.slot, !device && styles.slotEmpty]}
                activeOpacity={0.7}
                onPress={() => {
                  setActiveSlotIndex(index)
                  setIsModalVisible(true)
                }}
              >
                {device ? (
                  <View style={styles.deviceInfo}>
                    <Image source={device.thumbnail_url ? { uri: device.thumbnail_url } : require('../../assets/devices/phone1.png')} style={styles.deviceImage} />
                    <Text style={styles.deviceName} numberOfLines={1}>{device.model}</Text>
                    <Text style={styles.devicePrice}>
                      {device.price_thb ? `฿${device.price_thb.toLocaleString('th-TH')}` : '—'}
                    </Text>
                    
                    {/* Add to Cart Shortcut */}
                    <TouchableOpacity 
                       onPress={() => addToCart({
                         specId: (device as any)._id || device.model,
                         brand: device.brand,
                         model: device.model,
                         price_thb: device.price_thb || 0,
                         thumbnail_url: device.thumbnail_url
                       })}
                       style={styles.addToCartMini}
                       activeOpacity={0.7}
                    >
                       <ShoppingBag size={12} color="#fff" />
                    </TouchableOpacity>

                    <TouchableOpacity 
                       onPress={() => {
                         const next = [...selectedDevices]
                         next[index] = null
                         setSelectedDevices(next)
                       }}
                       style={styles.removeBtn}
                    >
                      <X size={10} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.addPlaceholder}>
                    <Plus size={16} color={Colors.primary} />
                    <Text style={styles.addText}>ADD</Text>
                  </View>
                )}
              </TouchableOpacity>
            )
          })}
        </View>

        {/* Selection Summary */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryLabelGroup}>
             <Text style={styles.summaryLabel}>HARDWARE STACK</Text>
             <Text style={styles.summaryInstructions}>Comparing up to 4 models concurrently.</Text>
          </View>
          <View style={styles.countBadge}>
             <Text style={styles.countText}>{selectedDevices.filter(d => d !== null).length}/4</Text>
          </View>
        </View>

        {/* Target Action Bar */}
        <View style={styles.actionArea}>
           <TouchableOpacity 
             style={styles.searchBar} 
             onPress={() => {
                const firstEmpty = selectedDevices.findIndex(d => d === null)
                setActiveSlotIndex(firstEmpty !== -1 ? firstEmpty : 0)
                setIsModalVisible(true)
             }}
           >
              <Search size={16} color={Colors.primary} />
              <Text style={styles.searchText}>
                {isLoading ? 'SYNCING DATABASE...' : 'SELECT DEVICE FOR COMPARISON'}
              </Text>
           </TouchableOpacity>
        </View>

        {/* Radar Chart Section */}
        <View style={styles.radarSection}>
          <Text style={styles.sectionTitle}>PERFORMANCE FINGERPRINT</Text>
          <View style={styles.radarCard}>
            <View style={styles.radarGlow} />
            {radarChartData ? (
               <RadarFingerprint data={radarChartData} />
            ) : (
              <View style={styles.radarPlaceholder}>
                 <BarChart3 size={120} color={Colors.primary} strokeWidth={0.5} opacity={0.2} />
                 <Text style={styles.radarLabel}>ANALYTICS ENGINE STANDBY</Text>
              </View>
            )}
          </View>
        </View>

        {/* Comparison Table Section */}
        <View style={styles.tableSection}>
           <Text style={styles.sectionTitle}>TECHNICAL DATASHEET</Text>
           {renderComparisonTable() || (
             <View style={styles.tableCardEmpty}>
                <Text style={styles.emptyText}>Select devices to initialize hardware comparison</Text>
             </View>
           )}
        </View>
      </ScrollView>

      {/* Selection Modal */}
      <Modal
          visible={isModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsModalVisible(false)}
        >
          <KeyboardAvoidingView
             style={styles.modalOverlay}
             behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
             <View style={styles.modalContent}>
               <View style={styles.modalHeaderUnderline}>
                 <Text style={styles.modalTitle}>
                   {activeSlotIndex !== null ? `SLOT ${activeSlotIndex + 1}` : 'SELECT DEVICE'}
                 </Text>
                 <TouchableOpacity onPress={() => {
                   setIsModalVisible(false)
                   setActiveSlotIndex(null)
                 }}>
                   <X size={24} color="#fff" />
                 </TouchableOpacity>
               </View>

              <View style={styles.modalSearch}>
                <Search size={18} color={Colors.primary} />
                <TextInput
                  style={styles.modalInput}
                  placeholder="Filter models..."
                  placeholderTextColor={Colors.dark.textMuted}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus
                />
              </View>

              {isLoading ? (
                <View style={styles.modalLoading}>
                  <ActivityIndicator color={Colors.primary} />
                </View>
              ) : (
                <FlatList
                  data={filteredProducts}
                  keyExtractor={(item) => item._id}
                  renderItem={({ item }) => (
                    <DeviceListItem item={item} onSelect={handleSelectDevice} />
                  )}
                  style={styles.modalList}
                  removeClippedSubviews
                />
              )}
            </View>
          </KeyboardAvoidingView>
      </Modal>
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
  header: {
    padding: Spacing.xl,
    paddingTop: 40,
  },
  tagline: {
    fontSize: 9,
    fontWeight: Fonts.weights.black,
    color: Colors.primary,
    letterSpacing: 2,
    marginBottom: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: Fonts.weights.black,
    color: '#fff',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 10,
    fontWeight: Fonts.weights.bold,
    color: Colors.dark.textMuted,
    letterSpacing: 1,
    marginTop: 4,
  },
  deviceGrid: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    gap: 10,
    marginBottom: 30,
  },
  slot: {
    flex: 1,
    aspectRatio: 0.85,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  slotEmpty: {
    borderStyle: 'dashed',
    borderColor: 'rgba(20, 104, 255, 0.2)',
  },
  deviceInfo: {
    flex: 1,
    width: '100%',
    padding: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceImage: {
    width: '70%',
    height: '60%',
    resizeMode: 'contain',
    marginBottom: 6,
  },
  deviceName: {
    fontSize: 8,
    fontWeight: Fonts.weights.bold,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 2,
  },
  devicePrice: {
    fontSize: 9,
    fontWeight: Fonts.weights.black,
    color: Colors.primary,
    textAlign: 'center',
  },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255,59,48,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addToCartMini: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  addPlaceholder: {
    alignItems: 'center',
    gap: 4,
  },
  addText: {
    fontSize: 8,
    fontWeight: Fonts.weights.black,
    color: Colors.dark.textMuted,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginBottom: 20,
  },
  summaryLabelGroup: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: Fonts.weights.black,
    color: '#fff',
  },
  summaryInstructions: {
    fontSize: 9,
    color: Colors.dark.textMuted,
    marginTop: 2,
  },
  countBadge: {
    backgroundColor: 'rgba(20, 104, 255, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(20, 104, 255, 0.3)',
  },
  countText: {
    fontSize: 10,
    fontWeight: Fonts.weights.bold,
    color: Colors.primary,
  },
  actionArea: {
    paddingHorizontal: Spacing.xl,
    marginBottom: 40,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 18,
    borderRadius: Radius.xl,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  searchText: {
    fontSize: 11,
    fontWeight: Fonts.weights.black,
    color: '#fff',
    letterSpacing: 0.5,
  },
  radarSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: Fonts.weights.black,
    color: '#fff',
    letterSpacing: 1.5,
    marginBottom: 16,
    paddingHorizontal: Spacing.xl,
  },
  radarCard: {
    marginHorizontal: Spacing.xl,
    backgroundColor: 'rgba(10, 14, 24, 0.9)',
    borderRadius: Radius['2xl'],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 24,
    minHeight: 320,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarGlow: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: Colors.primary,
    opacity: 0.02,
    borderRadius: Radius['2xl'],
  },
  radarPlaceholder: {
    alignItems: 'center',
    gap: 12,
  },
  radarLabel: {
    fontSize: 9,
    fontWeight: Fonts.weights.black,
    color: Colors.primary,
    letterSpacing: 1,
  },
  tableSection: {
    marginBottom: 60,
  },
  tableCard: {
    marginHorizontal: Spacing.xl,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
  tableCardEmpty: {
    marginHorizontal: Spacing.xl,
    padding: 40,
    backgroundColor: 'rgba(255,255,255,0.01)',
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    textAlign: 'center',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: 'rgba(20, 104, 255, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(20, 104, 255, 0.2)',
  },
  featureColumnHeader: {
    flex: 1.2,
    padding: 12,
    justifyContent: 'center',
  },
  valueColumnHeader: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.05)',
  },
  headerLabel: {
    fontSize: 9,
    fontWeight: Fonts.weights.black,
    color: Colors.primary,
  },
  headerValue: {
    fontSize: 10,
    fontWeight: Fonts.weights.black,
    color: '#fff',
    textAlign: 'center',
  },
  categoryRow: {
    flexDirection: 'row',
    padding: 14,
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center',
    gap: 8,
  },
  categoryIcon: {
    opacity: 0.8,
  },
  categoryTitle: {
    fontSize: 10,
    fontWeight: Fonts.weights.black,
    color: Colors.primaryLight,
    letterSpacing: 1,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.02)',
  },
  featureNameCol: {
    flex: 1.2,
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.01)',
  },
  featureName: {
    fontSize: 9,
    fontWeight: Fonts.weights.bold,
    color: Colors.dark.textMuted,
  },
  valueCol: {
    flex: 1,
    padding: 12,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.03)',
  },
  featureValue: {
    fontSize: 9,
    color: '#fff',
    lineHeight: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0d1117',
    borderTopLeftRadius: Radius['3xl'],
    borderTopRightRadius: Radius['3xl'],
    height: '85%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalHeaderUnderline: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: Fonts.weights.black,
    color: '#fff',
  },
  modalSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    margin: 20,
    padding: 14,
    borderRadius: Radius.xl,
    gap: 12,
  },
  modalInput: {
    flex: 1,
    color: '#fff',
    fontSize: 14,
  },
  modalLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalList: {
    flex: 1,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)',
  },
  productThumb: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
    marginRight: 16,
  },
  productInfo: {
    flex: 1,
  },
  productBrand: {
    fontSize: 9,
    fontWeight: Fonts.weights.black,
    color: Colors.primary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  productModel: {
    fontSize: 14,
    fontWeight: Fonts.weights.bold,
    color: '#fff',
  },
})
