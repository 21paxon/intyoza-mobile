import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Screen, Surface } from '@/components/Screen';
import { Heading, Body, Caption } from '@/components/Text';
import { LoadingState, EmptyState } from '@/components/DataStates';
import { colors, spacing } from '@/constants/theme';
import { mythsApi } from '@/api/endpoints';
import type { Myth } from '@/types/api';
import { apiMessage } from '@/utils/apiValue';

export default function MythsScreen() {
  const [language, setLanguage] = useState<'EN' | 'RW'>('EN');
  const [myths, setMyths] = useState<Myth[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    mythsApi.list(language).then((response) => { if (active) setMyths(response.data.myths ?? []); })
      .catch((e) => { if (active) setError(apiMessage(e)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [language]);
  const selectLanguage = (value: 'EN' | 'RW') => {
    if (value !== language) { setLoading(true); setError(''); setLanguage(value); }
  };
  return (
    <Screen>
      <View style={styles.intro}><Caption>MYTH BUSTER</Caption><Heading>Facts you can trust</Heading><Body>Explore common beliefs and the facts shared by the Intyoza health content team.</Body></View>
      <View style={styles.languages}><LanguageButton title="English" selected={language === 'EN'} onPress={() => selectLanguage('EN')} /><LanguageButton title="Kinyarwanda" selected={language === 'RW'} onPress={() => selectLanguage('RW')} /></View>
      {loading ? <LoadingState label="Loading facts…" /> : error ? <EmptyState title="Could not load facts" detail={error} /> : myths.length === 0 ? <EmptyState title="No facts available" detail="Try the other language or check back later." /> : myths.map((item) => <Surface key={item.id} style={styles.card}>
        <Caption style={styles.mythTag}>THE MYTH</Caption><Heading style={styles.myth}>{item.mythText}</Heading>
        <View style={styles.divider} />
        <Caption style={styles.factTag}>THE FACT</Caption><Body style={styles.fact}>{item.factText}</Body>
        {item.sources.length ? <Caption>Sources: {item.sources.join(', ')}</Caption> : null}
      </Surface>)}
    </Screen>
  );
}

function LanguageButton({ title, selected, onPress }: { title: string; selected: boolean; onPress: () => void }) {
  return <Pressable accessibilityRole="button" onPress={onPress} style={[styles.language, selected && styles.selected]}><Caption style={selected ? styles.selectedText : undefined}>{title}</Caption></Pressable>;
}

const styles = StyleSheet.create({ intro: { gap: spacing.sm }, languages: { flexDirection: 'row', gap: 8 }, language: { paddingVertical: 9, paddingHorizontal: 13, borderRadius: 18, backgroundColor: colors.white, borderColor: colors.line, borderWidth: 1 }, selected: { backgroundColor: colors.forest, borderColor: colors.forest }, selectedText: { color: colors.white, fontWeight: '700' }, card: { gap: spacing.sm }, mythTag: { color: colors.coral, fontWeight: '700', letterSpacing: 1 }, myth: { fontSize: 19, lineHeight: 26 }, divider: { height: 1, backgroundColor: colors.line, marginVertical: 2 }, factTag: { color: colors.forest, fontWeight: '700', letterSpacing: 1 }, fact: { fontWeight: '600' } });
