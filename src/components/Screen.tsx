import React from 'react';
import { ScrollView, StyleSheet, View, type ScrollViewProps, type ViewProps } from 'react-native';
import { colors, spacing } from '@/constants/theme';

export function Screen({ children, contentContainerStyle, ...props }: ScrollViewProps) {
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, contentContainerStyle]}
      keyboardShouldPersistTaps="handled"
      {...props}>
      {children}
    </ScrollView>
  );
}

export function Surface({ children, style, ...props }: ViewProps) {
  return <View style={[styles.surface, style]} {...props}>{children}</View>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.paper },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md },
  surface: { backgroundColor: colors.white, borderRadius: 20, padding: spacing.lg, borderWidth: 1, borderColor: colors.line },
});
