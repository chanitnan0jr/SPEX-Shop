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
import { BarChart3, Zap, Plus, X, Search, ChevronRight } from 'lucide-react-native'
import { Colors, Fonts, Spacing, Radius } from '../../lib/constants'
import { getProducts, compareSpecs } from '../../lib/api'
import { RadarFingerprint } from '../../components/RadarFingerprint'
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
    // Check if device is already in any other slot
    if (selectedDevices.find(d => d?._id === device._id)) {
       setIsModalVisible(false)
       return
    }
    
    setSelectedDevices(prev => {
      const next = [...prev]
      if (activeSlotIndex !== null) {
        next[activeSlotIndex] = device
      } else {
        // Fallback to first empty slot if index somehow missing
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

  // Radar Mapping Logic: Hardware to Normalized Scores (0.0 - 1.0)
  // Aligned with AXES: ['VALUE', 'CPU', 'DISPLAY', 'BATTERY', 'MEMORY', 'CAMERA']
  const radarChartData = useMemo(() => {
    const activeDevices = comparisonData.filter((d): d is Spec => d !== null)
    if (activeDevices.length === 0) return null

    const mapSpecToScore = (spec: Spec | null) => {
      if (!spec) return [0, 0, 0, 0, 0, 0]
      const h = spec.highlights
      
      // 1. VALUE (Price based - lower is better for value score)
      const price = spec.price_thb || 30000
      const value = Math.max(0.2, Math.min(1.0, 1 - (price / 60000))) // Simple heuristic
      
      // 2. CPU (Chipset performance)
      const cpu = h.chipset?.match(/A17|Gen 3|D9300/i) ? 0.98 : 
                  h.chipset?.match(/A16|Gen 2|D9200/i) ? 0.88 : 
                  h.chipset?.match(/Gen 1|D9000/i) ? 0.78 : 0.6
      
      // 3. DISPLAY
      const display = h.display?.match(/LTPO/i) ? 0.95 : 
                      h.display?.match(/120Hz/i) ? 0.85 : 
                      h.display?.match(/OLED|AMOLED/i) ? 0.75 : 0.6
      
      // 4. BATTERY (Capacity based)
      const mah = parseInt(h.battery?.replace(/[^0-9]/g, '') || '4500')
      const battery = Math.max(0.4, Math.min(1.0, mah / 5500))
      
      // 5. MEMORY (RAM based)
      const ram = parseInt(h.ram?.replace(/[^0-9]/g, '') || '8')
      const memory = Math.max(0.4, Math.min(1.0, ram / 16))
      
      // 6. CAMERA
      const camera = h.camera?.match(/200MP|Leica|Hasselblad|Zeiss/i) ? 0.96 : 
                     h.camera?.match(/108MP|50MP/i) ? 0.86 : 0.75

      return [value, cpu, display, battery, memory, camera]
    }

    return {
      device1: mapSpecToScore(comparisonData[0]),
      device2: mapSpecToScore(comparisonData[1]),
      device3: mapSpecToScore(comparisonData[2]),
      device4: mapSpecToScore(comparisonData[3]),
      label1: comparisonData[0]?.model || '',
      label2: comparisonData[1]?.model || '',
      label3: comparisonData[2]?.model || '',
      label4: comparisonData[3]?.model || '',
    }
  }, [comparisonData])

  const renderComparisonTable = () => {
    const activeDevices = comparisonData.filter((d): d is Spec => d !== null)
    if (activeDevices.length < 1) return null

    const features = [
       { key: 'CHIPSET', label: 'CHIPSET' },
       { key: 'DISPLAY', label: 'DISPLAY' },
       { key: 'RAM', label: 'MEMORY' },
       { key: 'BATTERY', label: 'BATTERY' },
       { key: 'CAMERA', label: 'CAMERA' },
    ]

    return (
      <View style={styles.tableCard}>
        <View style={styles.tableHeader}>
           <Text style={[styles.headerLabel, { textAlign: 'left', flex: 1.2 }]}>FEATURE</Text>
           {comparisonData.map((d, i) => d && (
             <Text key={d._id} numberOfLines={1} style={styles.headerLabel}>{d.model.split(' ')[0]}</Text>
           ))}
        </View>
        {features.map((f, idx) => (
          <View key={f.key} style={[styles.tableRow, idx === features.length - 1 && styles.noBorder]}>
             <Text style={styles.featureName}>{f.label}</Text>
             {comparisonData.map((d, i) => {
               if (!d) return <Text key={i + f.key} style={styles.featureValue}>-</Text>
               const val = f.key === 'CHIPSET' ? d.highlights.chipset : 
                           f.key === 'DISPLAY' ? d.highlights.display : 
                           f.key === 'RAM' ? d.highlights.ram : 
                           f.key === 'BATTERY' ? d.highlights.battery : 
                           d.highlights.camera
               return (
                 <Text key={d._id + f.key} numberOfLines={2} style={styles.featureValue}>{val || '-'}</Text>
               )
             })}
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
          <Text style={styles.title}>COMPARE SMARTPHONES</Text>
          <Text style={styles.subtitle}>TECHNICAL BENCHMARKING DASHBOARD</Text>
        </View>

        {/* Device Selection Slots - 4 Slots Grid */}
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
                    <Text style={styles.deviceName} numberOfLines={2}>{device.model}</Text>
                    <TouchableOpacity 
                       onPress={() => {
                         const next = [...selectedDevices]
                         next[index] = null
                         setSelectedDevices(next)
                       }}
                       style={styles.removeBtn}
                    >
                      <X size={12} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.addPlaceholder}>
                    <Plus size={18} color={Colors.primary} />
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
             <Text style={styles.summaryLabel}>SELECTED MODELS</Text>
             <Text style={styles.summaryInstructions}>Choose up to 4 phones for side-by-side comparison.</Text>
          </View>
          <View style={styles.countBadge}>
             <Text style={styles.countText}>{selectedDevices.filter(d => d !== null).length}/4</Text>
          </View>
        </View>

        {/* Action Area */}
        <View style={styles.actionArea}>
           {selectedDevices.filter(d => d !== null).length === 0 && (
             <View style={styles.emptySelectionBox}>
                <Text style={styles.emptyText}>No models selected yet</Text>
             </View>
           )}
           
           <TouchableOpacity 
             style={styles.searchBar} 
             onPress={() => {
                const firstEmpty = selectedDevices.findIndex(d => d === null)
                setActiveSlotIndex(firstEmpty !== -1 ? firstEmpty : 0)
                setIsModalVisible(true)
             }}
           >
              <Search size={16} color={Colors.dark.textMuted} />
              <Text style={styles.searchText}>
                {isLoading ? 'Loading catalog...' : 'Search for a device...'}
              </Text>
           </TouchableOpacity>
        </View>

        {/* Device Selection Modal */}
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
               <View style={styles.modalHeader}>
                 <Text style={styles.modalTitle}>
                   {activeSlotIndex !== null ? `SLOT ${activeSlotIndex + 1}` : 'SELECT DEVICE'} ({selectedDevices.filter(d => d !== null).length}/4)
                 </Text>
                 <TouchableOpacity onPress={() => {
                   setIsModalVisible(false)
                   setActiveSlotIndex(null)
                 }}>
                   <X size={24} color="#fff" />
                 </TouchableOpacity>
               </View>

              <View style={styles.modalSearch}>
                <Search size={18} color={Colors.dark.textMuted} />
                <TextInput
                  style={styles.modalInput}
                  placeholder="Search models or brands..."
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
                  removeClippedSubviews
                  maxToRenderPerBatch={10}
                  windowSize={5}
                  ListEmptyComponent={
                    <Text style={styles.emptySearchText}>No devices found matching "{searchQuery}"</Text>
                  }
                />
              )}
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Radar Chart Section */}
        <View style={styles.radarSection}>
          <Text style={styles.sectionTitle}>PERFORMANCE FINGERPRINT</Text>
          <View style={styles.radarCard}>
            <View style={styles.radarGlow} />
            {radarChartData ? (
               <RadarFingerprint data={radarChartData} />
            ) : (
              <View style={styles.radarContainer}>
                 <BarChart3 size={160} color={Colors.primary} strokeWidth={0.5} opacity={0.3} />
                 <View style={styles.radarOverlay}>
                    <Text style={styles.radarLabel}>ANALYTICS ENGINE STANDBY</Text>
                    <Zap size={14} color={Colors.primary} />
                 </View>
              </View>
            )}
            
            {!radarChartData && (
              <View style={styles.radarLegend}>
                 <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: Colors.primary }]} /><Text style={styles.legendText}>HARDWARE SCORE</Text></View>
                 <View style={styles.legendItem}><View style={[styles.dot, { backgroundColor: 'rgba(255,255,255,0.1)' }]} /><Text style={styles.legendText}>REFERENCE BASELINE</Text></View>
              </View>
            )}
          </View>
        </View>

        {/* Comparison Table Section */}
        <View style={styles.tableSection}>
           <Text style={styles.sectionTitle}>HARDWARE COMPARISON</Text>
           {renderComparisonTable() || (
             <View style={styles.tableCard}>
                <Text style={styles.emptyText}>Select devices to see hardware disparities</Text>
             </View>
           )}
        </View>
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
    paddingBottom: 140,
  },
  header: {
    padding: Spacing.xl,
    paddingTop: 40,
    alignItems: 'flex-start',
  },
  tagline: {
    fontSize: 9,
    fontWeight: Fonts.weights.black,
    color: Colors.primary,
    letterSpacing: 2,
    marginBottom: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: Fonts.weights.black,
    color: '#fff',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    fontWeight: Fonts.weights.bold,
    color: Colors.dark.textMuted,
    letterSpacing: 1,
  },
  deviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.xl,
    gap: 12,
    marginTop: 20,
    marginBottom: 40,
  },
  slot: {
    width: (SCREEN_WIDTH - Spacing.xl * 2 - 12 * 3) / 4,
    aspectRatio: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  slotEmpty: {
    borderStyle: 'dashed',
    borderColor: 'rgba(20, 104, 255, 0.3)',
    backgroundColor: 'rgba(20, 104, 255, 0.02)',
  },
  deviceInfo: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  deviceImage: {
    width: '60%',
    height: '60%',
    resizeMode: 'contain',
    marginBottom: 4,
  },
  deviceName: {
    fontSize: 8,
    color: '#fff',
    textAlign: 'center',
    fontWeight: Fonts.weights.bold,
  },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255, 59, 48, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  addPlaceholder: {
    alignItems: 'center',
    gap: 4,
  },
  addText: {
    fontSize: 7,
    fontWeight: Fonts.weights.black,
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    marginBottom: 24,
  },
  summaryLabelGroup: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: Fonts.weights.black,
    color: '#fff',
    letterSpacing: 1,
  },
  summaryInstructions: {
    fontSize: 9,
    color: Colors.dark.textMuted,
    marginTop: 2,
  },
  countBadge: {
    backgroundColor: 'rgba(20, 104, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
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
  emptySelectionBox: {
    padding: 24,
    borderRadius: Radius.xl,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 12,
    color: Colors.dark.textMuted,
    fontWeight: Fonts.weights.medium,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: Radius.xl,
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  searchText: {
    fontSize: 14,
    color: Colors.dark.textMuted,
  },
  radarSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: Fonts.weights.black,
    color: '#fff',
    letterSpacing: 1.5,
    marginBottom: 16,
    paddingHorizontal: Spacing.xl,
    opacity: 0.9,
  },
  radarCard: {
    marginHorizontal: Spacing.xl,
    backgroundColor: 'rgba(10, 10, 15, 0.8)',
    borderRadius: Radius.xxl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 20,
    minHeight: 340,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  radarGlow: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.primary,
    opacity: 0.05,
    filter: 'blur(60px)',
  },
  radarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarOverlay: {
    position: 'absolute',
    alignItems: 'center',
    gap: 6,
  },
  radarLabel: {
    fontSize: 10,
    fontWeight: Fonts.weights.black,
    color: Colors.primary,
    letterSpacing: 1,
    opacity: 0.6,
  },
  radarLegend: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 9,
    fontWeight: Fonts.weights.bold,
    color: Colors.dark.textMuted,
    letterSpacing: 0.5,
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
  tableHeader: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderBottomWidth:1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  headerLabel: {
    flex: 1,
    fontSize: 8,
    fontWeight: Fonts.weights.black,
    color: Colors.primary,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.02)',
    alignItems: 'center',
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  featureName: {
    flex: 1.2,
    fontSize: 9,
    fontWeight: Fonts.weights.bold,
    color: Colors.dark.textMuted,
  },
  featureValue: {
    flex: 1,
    fontSize: 8,
    color: '#fff',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#121218',
    borderTopLeftRadius: Radius.xxxl,
    borderTopRightRadius: Radius.xxxl,
    height: '85%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalHeader: {
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
    letterSpacing: 1,
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
    fontSize: 15,
  },
  modalLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    width: 60,
    height: 60,
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
  emptySearchText: {
    textAlign: 'center',
    color: Colors.dark.textMuted,
    marginTop: 40,
    paddingHorizontal: 40,
  },
})
