import React, { useCallback, useEffect, useState } from 'react';
import { Link, router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { Screen, Surface } from '@/components/Screen';
import { Heading, Body, Caption } from '@/components/Text';
import { Button } from '@/components/Button';
import { LoadingState, EmptyState } from '@/components/DataStates';
import { colors, spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { communityApi } from '@/api/endpoints';
import { apiMessage, collectionFrom, recordValue } from '@/utils/apiValue';

export default function CommunityScreen() {
  const { token } = useAuth();
  const [spaces, setSpaces] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true); setError('');
    try { const response = await communityApi.spaces(); setSpaces(collectionFrom(response.data)); }
    catch (e) { setError(apiMessage(e)); }
    finally { setLoading(false); }
  }, [token]);
  useEffect(() => { load(); }, [load]);

  if (!token) return <Screen><View style={styles.intro}><Caption>COMMUNITY</Caption><Heading>Good conversations start here</Heading><Body>Sign in to explore community spaces and take part in peer support.</Body></View><Surface style={styles.card}><Button title="Sign in to continue" onPress={() => router.push('/(auth)/login')} /><Button title="Create an account" onPress={() => router.push('/(auth)/register')} secondary /></Surface></Screen>;

  return (
    <Screen>
      <View style={styles.intro}><Caption>COMMUNITY</Caption><Heading>Find your space</Heading><Body>Supportive spaces for learning and sharing with peers.</Body></View>
      {loading ? <LoadingState label="Loading community spaces…" /> : error ? <EmptyState title="Could not load community spaces" detail={error} /> : spaces.length === 0 ? <EmptyState title="No community spaces available" detail="Please check back later." /> : spaces.map((space, index) => {
        const record = recordValue(space);
        const idEntry = record && Object.entries(record).find(([key, value]) => /(^id$|spaceid$)/i.test(key) && typeof value === 'string');
        const heading = record && Object.entries(record).find(([key, value]) => !/id|url|date|time/i.test(key) && typeof value === 'string');
        return <Link key={String(idEntry?.[1] ?? index)} href={idEntry ? { pathname: '/community/[spaceId]', params: { spaceId: String(idEntry[1]) } } : '/community'} asChild><Pressable style={styles.space}><Surface style={styles.spaceCard}><View style={styles.spaceIcon}><Body style={styles.symbol}>◌</Body></View><Heading style={styles.spaceTitle}>{heading ? String(heading[1]) : 'Community space'}</Heading><Caption>{record ? Object.entries(record).filter(([key, value]) => !/id|url|date|time/i.test(key) && typeof value === 'string').slice(1, 2).map(([, value]) => String(value))[0] ?? 'Open this space to view recent posts.' : 'Open this space to view recent posts.'}</Caption></Surface></Pressable></Link>;
      })}
      <Caption style={styles.note}>Community posts should be respectful and protect personal information. Use the report feature if something feels unsafe.</Caption>
    </Screen>
  );
}

const styles = StyleSheet.create({ intro: { gap: spacing.sm }, card: { gap: spacing.md }, space: { width: '100%' }, spaceCard: { gap: spacing.sm }, spaceIcon: { backgroundColor: colors.mint, borderRadius: 14, width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }, symbol: { color: colors.forest, fontSize: 23 }, spaceTitle: { fontSize: 19, lineHeight: 25 }, note: { textAlign: 'center', padding: spacing.md } });
