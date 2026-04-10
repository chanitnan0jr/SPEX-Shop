import React, { useState, memo, useCallback } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { Colors, Fonts, Spacing, Radius } from '../lib/constants'

type SpecSectionProps = {
  title: string
  specs: Record<string, string>
  defaultExpanded?: boolean
}

export const SpecSection = memo(function SpecSection({
  title,
  specs,
  defaultExpanded = false,
}: SpecSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  const toggle = useCallback(() => setExpanded((prev) => !prev), [])

  const entries = Object.entries(specs)
  if (entries.length === 0) return null

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.header}
        onPress={toggle}
        activeOpacity={0.7}
      >
        <Text style={styles.title}>{title.toUpperCase()}</Text>
        <Text style={styles.chevron}>{expanded ? 'REMOVE' : 'VIEW'}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.content}>
          {entries.map(([key, value], index) => (
            <View
              key={key}
              style={[
                styles.row,
                index < entries.length - 1 && styles.rowBorder,
              ]}
            >
              <Text style={styles.specKey}>{key}</Text>
              <Text style={styles.specValue}>
                {value}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  )
})

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.dark.card,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.dark.border,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  title: {
    fontSize: 10,
    fontWeight: Fonts.weights.black,
    color: Colors.dark.text,
    letterSpacing: 2,
  },
  chevron: {
    fontSize: 10,
    fontWeight: Fonts.weights.black,
    color: Colors.primary,
    letterSpacing: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  row: {
    paddingVertical: Spacing.md,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.dark.border,
  },
  specKey: {
    fontSize: 10,
    color: Colors.dark.textMuted,
    fontWeight: Fonts.weights.black,
    letterSpacing: 1,
    marginBottom: 4,
  },
  specValue: {
    fontSize: Fonts.sizes.sm,
    color: Colors.dark.text,
    fontWeight: Fonts.weights.semibold,
    lineHeight: 20,
  },
})
