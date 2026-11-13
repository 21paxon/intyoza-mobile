import React from 'react';
import { Link } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/theme';

export default function NotFoundScreen() {
  return <View style={styles.container}><Text style={styles.title}>This page isn’t here</Text><Link href="/" style={styles.link}>Return to Intyoza</Link></View>;
}

const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: colors.paper, alignItems: 'center', justifyContent: 'center', gap: 18 }, title: { color: colors.ink, fontSize: 22, fontWeight: '700' }, link: { color: colors.forest, fontWeight: '700' } });
