import React from 'react';
import { Text as NativeText, StyleSheet, type TextProps } from 'react-native';
import { colors } from '@/constants/theme';

export function Heading({ style, ...props }: TextProps) {
  return <NativeText {...props} style={[styles.heading, style]} />;
}

export function Body({ style, ...props }: TextProps) {
  return <NativeText {...props} style={[styles.body, style]} />;
}

export function Caption({ style, ...props }: TextProps) {
  return <NativeText {...props} style={[styles.caption, style]} />;
}

const styles = StyleSheet.create({
  heading: { color: colors.ink, fontSize: 27, lineHeight: 33, fontWeight: '700', letterSpacing: -0.5 },
  body: { color: colors.ink, fontSize: 15, lineHeight: 23 },
  caption: { color: colors.muted, fontSize: 12, lineHeight: 17 },
});
