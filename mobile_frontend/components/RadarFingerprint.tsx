import React, { useEffect, useMemo } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import Svg, { Polygon, Line, G, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg'
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withDelay, 
  Easing, 
  useDerivedValue,
  useAnimatedProps
} from 'react-native-reanimated'
import { Colors, Fonts, Radius } from '../lib/constants'

const AnimatedG = Animated.createAnimatedComponent(G)


const AXES = ['PRICE', 'CPU', 'DISPLAY', 'BATTERY', 'RAM', 'CAMERA']
const SIZE = 240
const CENTER = SIZE / 2
const RADIUS = SIZE * 0.35

const getPoint = (index: number, value: number, radius: number) => {
  const angle = (index * 60 - 90) * (Math.PI / 180)
  return {
    x: CENTER + radius * value * Math.cos(angle),
    y: CENTER + radius * value * Math.sin(angle),
  }
}

interface RadarData {
  device1: number[]
  device2?: number[]
  device3?: number[]
  device4?: number[]
  label1: string
  label2?: string
  label3?: string
  label4?: string
}

interface RadarFingerprintProps {
  data: RadarData
}

const COLORS = ['#38bdf8', '#10b981', '#f59e0b', '#a855f7']


export const RadarFingerprint = ({ data }: RadarFingerprintProps) => {
  const [focusMode, setFocusMode] = React.useState<number | 'all'>('all')
  
  // Animation values for up to 4 devices
  const scales = [useSharedValue(0), useSharedValue(0), useSharedValue(0), useSharedValue(0)]
  const focuses = [useSharedValue(1), useSharedValue(1), useSharedValue(1), useSharedValue(1)]

  useEffect(() => {
    scales.forEach((s, i) => {
      s.value = withDelay(i * 300, withTiming(1, { duration: 1000, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }))
    })
  }, [])

  useEffect(() => {
    focuses.forEach((f, i) => {
      const isFocused = focusMode === 'all' || focusMode === i
      f.value = withTiming(isFocused ? 1 : 0.15, { duration: 300, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })
    })
  }, [focusMode])

  const renderPolygon = (deviceData: number[] | undefined, index: number) => {
    if (!deviceData) return null

    const points = AXES.map((_, i) => {
      const p = getPoint(i, deviceData[i], RADIUS)
      return `${p.x},${p.y}`
    }).join(' ')

    const animatedProps = useAnimatedProps(() => {
      const s = scales[index].value * (focuses[index].value === 1 ? 1 : 0.95);
      return {
        opacity: scales[index].value * focuses[index].value,
        transform: [
          { translateX: CENTER },
          { translateY: CENTER },
          { scale: s },
          { translateX: -CENTER },
          { translateY: -CENTER },
        ] as any,
      };
    });

    return (
      <AnimatedG key={index} animatedProps={animatedProps}>
        <Polygon
          points={points}
          fill={COLORS[index]}
          fillOpacity={0.15}
          stroke={COLORS[index]}
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </AnimatedG>
    )
  }

  const deviceDataList = [data.device1, data.device2, data.device3, data.device4]
  const labels = [data.label1, data.label2, data.label3, data.label4]

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.cardTitle}>PERFORMANCE ARCHITECTURE</Text>
        
        {/* Focus Switch */}
        <View style={styles.switchContainer}>
          <TouchableOpacity 
            onPress={() => setFocusMode('all')}
            style={[styles.switchBtn, focusMode === 'all' && styles.switchBtnActive]}
          >
            <Text style={[styles.switchText, focusMode === 'all' && styles.switchTextActive]}>ALL</Text>
          </TouchableOpacity>
          {labels.map((label, i) => !!label && (
            <TouchableOpacity 
              key={i}
              onPress={() => setFocusMode(i)}
              style={[styles.switchBtn, focusMode === i && styles.switchBtnActive]}
            >
              <Text numberOfLines={1} style={[styles.switchText, focusMode === i && styles.switchTextActive]}>
                {label.split(' ')[0].toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {/* Background Grids */}
        {[0.33, 0.66, 1.0].map((step, i) => (
          <Polygon
            key={i}
            points={AXES.map((_, j) => {
              const p = getPoint(j, step, RADIUS)
              return `${p.x},${p.y}`
            }).join(' ')}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="1"
          />
        ))}

        {AXES.map((_, i) => {
          const p = getPoint(i, 1.0, RADIUS)
          return (
            <Line
              key={i}
              x1={CENTER}
              y1={CENTER}
              x2={p.x}
              y2={p.y}
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
            />
          )
        })}

        {AXES.map((label, i) => {
          const p = getPoint(i, 1.25, RADIUS)
          return (
            <SvgText
              key={i}
              x={p.x}
              y={p.y}
              fill={Colors.dark.textMuted}
              fontSize="8"
              fontWeight="bold"
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {label}
            </SvgText>
          )
        })}

        {/* Polygons */}
        {deviceDataList.map((d, i) => renderPolygon(d, i))}
      </Svg>

      {/* Legend */}
      <View style={styles.legend}>
        {labels.map((label, i) => !!label && (
          <TouchableOpacity 
            key={i}
            style={[styles.legendItem, focusMode !== 'all' && focusMode !== i && { opacity: 0.3 }]}
            onPress={() => setFocusMode(i)}
          >
            <View style={[styles.dot, { backgroundColor: COLORS[i], shadowColor: COLORS[i] }]} />
            <Text style={styles.legendText}>{label.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  headerRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 9,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1.5,
  },
  switchContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 2,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  switchBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  switchBtnActive: {
    backgroundColor: 'rgba(20, 104, 255, 0.2)',
  },
  switchText: {
    fontSize: 8,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 0.5,
  },
  switchTextActive: {
    color: Colors.primaryLight,
  },
  legend: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 4,
  },
  legendText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1,
  },
})
