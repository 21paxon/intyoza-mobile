import React, { useEffect, useState } from 'react';
import { Link } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Screen, Surface } from '@/components/Screen';
import { Heading, Body, Caption } from '@/components/Text';
import { Button } from '@/components/Button';
import { colors, spacing } from '@/constants/theme';
import { mythsApi } from '@/api/endpoints';
import type { Myth } from '@/types/api';
import { apiMessage } from '@/utils/apiValue';

export default function HomeScreen() {
  const [myth, setMyth] = useState<Myth | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => { mythsApi.list('EN').then((r) => setMyth(r.data.myths?.[0] ?? null)).catch((e) => setError(apiMessage(e))).finally(() => setLoading(false)); }, []);

  return (
    <Screen contentContainerStyle={styles.content}>
      <View style={styles.top}><View><Caption>INTYOZA • RWANDA</Caption><Heading>Space to grow.</Heading></View><View style={styles.sun} /></View>
      <Surface style={styles.hero}>
        <Caption style={styles.kicker}>YOUR HEALTH, YOUR QUESTIONS</Caption>
        <Heading style={styles.heroTitle}>Knowledge helps you choose what feels right.</Heading>
        <Body style={styles.heroCopy}>Explore trusted learning, find youth-friendly care, or ask a private question.</Body>
        <Link href="/(tabs)/learn" asChild><Button title="Explore learning" onPress={() => {}} /></Link>
      </Surface>
      <View style={styles.sectionHeader}><Heading style={styles.sectionTitle}>Explore Intyoza</Heading><Caption>Here when you need us</Caption></View>
      <View style={styles.grid}>
        <Feature href="/(tabs)/care" icon="⌖" title="Find care" detail="Youth-friendly services near you" tone={colors.mint} />
        <Feature href="/(tabs)/ask" icon="✳" title="Ask privately" detail="Chat with the SRH assistant" tone="#F7EED9" />
        <Feature href="/myths" icon="✦" title="Myth Buster" detail="Separate facts from myths" tone="#E9EAF6" />
        <Feature href="/community" icon="◌" title="Community" detail="Learn alongside your peers" tone="#F5E4E0" />
        <Feature href="/support" icon="♡" title="Talk to someone" detail="Request a professional callback" tone="#E9EAF6" />
      </View>
      <Surface style={styles.mythCard}>
        <Caption style={styles.kicker}>MYTH BUSTER</Caption>
        {loading ? <ActivityIndicator color={colors.forest} /> : error ? <Body>{error}</Body> : myth ? <><Body style={styles.myth}>{myth.mythText}</Body><Caption>THE FACT</Caption><Body>{myth.factText}</Body></> : <Caption>No facts are available right now.</Caption>}
      </Surface>
      <Caption style={styles.privacy}>Your questions are personal. We’re here to help you make informed choices.</Caption>
    </Screen>
  );
}

function Feature({ href, icon, title, detail, tone }: { href: '/(tabs)/care' | '/(tabs)/ask' | '/myths' | '/community' | '/support'; icon: string; title: string; detail: string; tone: string }) {
  return <Link href={href} asChild><Pressable style={({ pressed }) => [styles.feature, pressed && { opacity: 0.8 }]}><View style={[styles.featureIcon, { backgroundColor: tone }]}><Body style={styles.iconText}>{icon}</Body></View><Body style={styles.featureTitle}>{title}</Body><Caption>{detail}</Caption></Pressable></Link>;
}

const styles = StyleSheet.create({ content: { paddingTop: spacing.lg }, top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, sun: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.sun }, hero: { backgroundColor: colors.forest, borderColor: colors.forest, padding: spacing.xl, gap: spacing.md }, kicker: { color: '#C8E2D3', letterSpacing: 1.1, fontWeight: '700' }, heroTitle: { color: colors.white, fontSize: 28, lineHeight: 34 }, heroCopy: { color: '#D9E9E1' }, sectionHeader: { gap: 3, marginTop: spacing.sm }, sectionTitle: { fontSize: 20, lineHeight: 26 }, grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }, feature: { width: '48%', minHeight: 150, flexGrow: 1, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line, borderRadius: 18, padding: spacing.md, gap: 7 }, featureIcon: { height: 38, width: 38, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginBottom: 2 }, iconText: { color: colors.forest, fontSize: 23, lineHeight: 27 }, featureTitle: { fontWeight: '700' }, mythCard: { gap: spacing.sm }, myth: { fontWeight: '700', fontSize: 17 }, privacy: { textAlign: 'center', paddingHorizontal: spacing.md } });
