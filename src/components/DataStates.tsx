import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Body, Caption } from './Text';
import { colors, spacing } from '@/constants/theme';

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return <View style={styles.state}><ActivityIndicator color={colors.forest} /><Caption>{label}</Caption></View>;
}

export function EmptyState({ title, detail }: { title: string; detail?: string }) {
  return <View style={styles.state}><Body style={styles.title}>{title}</Body>{detail ? <Caption style={styles.detail}>{detail}</Caption> : null}</View>;
}

const styles = StyleSheet.create({ state: { padding: spacing.xl, alignItems: 'center', gap: spacing.sm }, title: { fontWeight: '700', textAlign: 'center' }, detail: { textAlign: 'center' } });
