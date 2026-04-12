import React, { useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import Svg, { Polygon, Line, G, Text as SvgText } from 'react-native-svg'
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withDelay,
  Easing,
  type SharedValue,
} from 'react-native-reanimated'
import { Colors, Radius } from '../lib/constants'
import { useUiPreferences } from '../context/ui-context'
import { getFontFamily } from '../lib/fonts'

const AnimatedG = Animated.createAnimatedComponent(G)

const AXES = ['PRICE', 'CPU', 'DISPLAY', 'BATTERY', 'RAM', 'CAMERA']
const SIZE = 240
const CENTER = SIZE / 2
const RADIUS = SIZE * 0.35
const COLORS = ['#38bdf8', '#10b981', '#f59e0b', '#a855f7']

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

// ── Sub-component so useAnimatedProps is called at component level (not inside .map) ──
function DevicePolygon({
  deviceData,
  index,
  scaleValue,
  focusValue,
}: {
  deviceData: number[]
  index: number
  scaleValue: SharedValue<number>
  focusValue: SharedValue<number>
}) {
  const points = AXES.map((_, i) => {
    const p = getPoint(i, deviceData[i], RADIUS)
    return `${p.x},${p.y}`
  }).join(' ')

  const animatedProps = useAnimatedProps(() => ({
    opacity: scaleValue.value * focusValue.value,
    transform: [
      { translateX: CENTER },
      { translateY: CENTER },
      { scale: scaleValue.value * (focusValue.value > 0.5 ? 1 : 0.93) },
      { translateX: -CENTER },
      { translateY: -CENTER },
    ] as any,
  }))

  return (
    <AnimatedG animatedProps={animatedProps}>
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

export const RadarFingerprint = ({ data }: { data: RadarData }) => {
  const { language, theme } = useUiPreferences()
  const currentColors = theme === 'dark' ? Colors.dark : Colors.light
  const [focusMode, setFocusMode] = React.useState<number | 'all'>('all')

  const scales = [useSharedValue(0), useSharedValue(0), useSharedValue(0), useSharedValue(0)]
  const focuses = [useSharedValue(1), useSharedValue(1), useSharedValue(1), useSharedValue(1)]

  // Entrance animation
  useEffect(() => {
    scales.forEach((s, i) => {
      s.value = withDelay(i * 300, withTiming(1, { duration: 1000, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }))
    })
  }, [])

  // Focus animation — focused = full opacity, unfocused = 0.15 opacity
  useEffect(() => {
    focuses.forEach((f, i) => {
      const isFocused = focusMode === 'all' || focusMode === i
      f.value = withTiming(isFocused ? 1 : 0.15, { duration: 300, easing: Easing.bezier(0.25, 0.1, 0.25, 1) })
    })
  }, [focusMode])

  const deviceDataList = [data.device1, data.device2, data.device3, data.device4]
  const labels = [data.label1, data.label2, data.label3, data.label4]

  return (
    <View style={styles.container}>
      {/* Header + Focus Switch */}
      <View style={styles.headerRow}>
        <Text style={[
          styles.cardTitle,
          { color: theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(15,23,42,0.4)', fontFamily: getFontFamily(language, 'black') }
        ]}>
          PERFORMANCE ARCHITECTURE
        </Text>

        <View style={[
          styles.switchContainer,
          { backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderColor: currentColors.border }
        ]}>
          {/* ALL button */}
          <TouchableOpacity
            onPress={() => setFocusMode('all')}
            style={[styles.switchBtn, focusMode === 'all' && styles.switchBtnActive]}
          >
            <Text style={[
              styles.switchText,
              { color: focusMode === 'all' ? Colors.primaryLight : (theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(15,23,42,0.4)') },
              { fontFamily: getFontFamily(language, 'black') },
            ]}>
              ALL
            </Text>
          </TouchableOpacity>

          {/* Per-device buttons — only show for devices that exist */}
          {labels.map((label, i) =>
            !!label ? (
              <TouchableOpacity
                key={i}
                onPress={() => setFocusMode(focusMode === i ? 'all' : i)}
                style={[styles.switchBtn, focusMode === i && styles.switchBtnActive]}
              >
                <View style={[styles.switchDot, { backgroundColor: COLORS[i] }]} />
                <Text
                  numberOfLines={1}
                  style={[
                    styles.switchText,
                    { color: focusMode === i ? Colors.primaryLight : (theme === 'dark' ? 'rgba(255,255,255,0.4)' : 'rgba(15,23,42,0.4)') },
                    { fontFamily: getFontFamily(language, 'black') },
                  ]}
                >
                  {label.split(' ')[0].toUpperCase()}
                </Text>
              </TouchableOpacity>
            ) : null
          )}
        </View>
      </View>

      {/* SVG Radar */}
      <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        {/* Grid rings */}
        {[0.33, 0.66, 1.0].map((step, i) => (
          <Polygon
            key={i}
            points={AXES.map((_, j) => {
              const p = getPoint(j, step, RADIUS)
              return `${p.x},${p.y}`
            }).join(' ')}
            fill="none"
            stroke={theme === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(15,23,42,0.08)'}
            strokeWidth="1"
          />
        ))}

        {/* Axis lines */}
        {AXES.map((_, i) => {
          const p = getPoint(i, 1.0, RADIUS)
          return (
            <Line
              key={i}
              x1={CENTER} y1={CENTER}
              x2={p.x} y2={p.y}
              stroke={theme === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(15,23,42,0.08)'}
              strokeWidth="1"
            />
          )
        })}

        {/* Axis labels */}
        {AXES.map((label, i) => {
          const p = getPoint(i, 1.25, RADIUS)
          return (
            <SvgText
              key={i}
              x={p.x} y={p.y}
              fill={currentColors.textMuted}
              fontSize="8"
              fontFamily={getFontFamily(language, 'bold')}
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {label}
            </SvgText>
          )
        })}

        {/* Device polygons — each is its own component so hooks work correctly */}
        {deviceDataList.map((d, i) =>
          d ? (
            <DevicePolygon
              key={i}
              deviceData={d}
              index={i}
              scaleValue={scales[i]}
              focusValue={focuses[i]}
            />
          ) : null
        )}
      </Svg>

      {/* Legend */}
      <View style={styles.legend}>
        {labels.map((label, i) =>
          !!label ? (
            <TouchableOpacity
              key={i}
              style={[styles.legendItem, focusMode !== 'all' && focusMode !== i && { opacity: 0.3 }]}
              onPress={() => setFocusMode(focusMode === i ? 'all' : i)}
            >
              <View style={[styles.dot, { backgroundColor: COLORS[i], shadowColor: COLORS[i] }]} />
              <Text style={[styles.legendText, { color: currentColors.text, fontFamily: getFontFamily(language, 'black') }]}>
                {label.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ) : null
        )}
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
    letterSpacing: 1.5,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 2,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  switchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  switchBtnActive: {
    backgroundColor: 'rgba(20,104,255,0.2)',
  },
  switchDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  switchText: {
    fontSize: 8,
    letterSpacing: 0.5,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
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
    letterSpacing: 1,
  },
})
