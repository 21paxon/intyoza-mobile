import React, { useCallback, useEffect, useState } from 'react';
import { Link, router } from 'expo-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Screen, Surface } from '@/components/Screen';
import { Heading, Body, Caption } from '@/components/Text';
import { Field } from '@/components/Field';
import { Button } from '@/components/Button';
import { LoadingState } from '@/components/DataStates';
import { colors, spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { authApi } from '@/api/endpoints';
import { apiMessage, recordValue } from '@/utils/apiValue';

const schema = z.object({ alias: z.string(), ageBand: z.string(), gender: z.string(), district: z.string(), language: z.enum(['EN','RW']) });
type Values = z.infer<typeof schema>;

export default function ProfileScreen() {
  const { token, loading: authLoading, signOut } = useAuth();
  const [profile, setProfile] = useState<unknown>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { control, handleSubmit, reset } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { alias: '', ageBand: '', gender: '', district: '', language: 'EN' } });

  const loadProfile = useCallback(async () => {
    try { const response = await authApi.me(); setProfile(response.data); const value = recordValue(response.data); if (value) reset({ alias: String(value.alias ?? ''), ageBand: String(value.ageBand ?? ''), gender: String(value.gender ?? ''), district: String(value.district ?? ''), language: value.language === 'RW' ? 'RW' : 'EN' }); }
    catch (e) { setError(apiMessage(e)); }
    finally { setLoading(false); }
  }, [reset]);
  useEffect(() => {
    if (!token) return;
    let active = true;
    authApi.me().then((response) => {
      if (!active) return;
      setProfile(response.data);
      const value = recordValue(response.data);
      if (value) reset({ alias: String(value.alias ?? ''), ageBand: String(value.ageBand ?? ''), gender: String(value.gender ?? ''), district: String(value.district ?? ''), language: value.language === 'RW' ? 'RW' : 'EN' });
    }).catch((e) => { if (active) setError(apiMessage(e)); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [token, reset]);

  const save = handleSubmit(async (values) => {
    setSaving(true);
    try { const input = Object.fromEntries(Object.entries(values).filter(([, value]) => value !== '')); const response = await authApi.updateProfile(input); setProfile(response.data); Alert.alert('Profile updated', 'Your changes have been saved.'); }
    catch (e) { Alert.alert('Could not update profile', apiMessage(e)); }
    finally { setSaving(false); }
  });

  if (authLoading) return <LoadingState label="Checking your account…" />;
  if (!token) return (
    <Screen>
      <View style={styles.intro}><Caption>YOUR SPACE</Caption><Heading>Make Intyoza yours</Heading><Body>Sign in to manage your profile, join the community, and request professional support.</Body></View>
      <Surface style={styles.card}><Button title="Sign in" onPress={() => router.push('/(auth)/login')} /><Button title="Create an account" secondary onPress={() => router.push('/(auth)/register')} /></Surface>
      <Caption style={styles.privacy}>Your account information is stored securely on this device and managed by the Intyoza backend.</Caption>
    </Screen>
  );

  const profileValues = recordValue(profile);
  return (
    <Screen>
      <View style={styles.intro}><Caption>YOUR SPACE</Caption><Heading>Profile & settings</Heading><Body>Update the details you share with Intyoza.</Body></View>
      {loading ? <LoadingState label="Loading your profile…" /> : error ? <Caption style={styles.error}>{error}</Caption> : null}
      {profileValues ? <Surface style={styles.snapshot}><Caption>ACCOUNT DETAILS FROM INTYOZA</Caption>{Object.entries(profileValues).filter(([key]) => !/token|password|secret/i.test(key)).map(([key, value]) => <View key={key} style={styles.line}><Caption style={styles.key}>{key.replace(/[A-Z]/g, (letter) => ` ${letter.toLowerCase()}`)}</Caption><Body>{typeof value === 'string' || typeof value === 'number' ? String(value) : JSON.stringify(value)}</Body></View>)}</Surface> : null}
      <Surface style={styles.form}>
        <Controller control={control} name="alias" render={({ field: { onChange, value } }) => <Field label="Alias" value={value} onChangeText={onChange} />} />
        <Controller control={control} name="ageBand" render={({ field: { onChange, value } }) => <Field label="Age range code" value={value} onChangeText={onChange} placeholder="AGE_15_19" />} />
        <Controller control={control} name="gender" render={({ field: { onChange, value } }) => <Field label="Gender code" value={value} onChangeText={onChange} placeholder="PREFER_NOT_TO_SAY" />} />
        <Controller control={control} name="district" render={({ field: { onChange, value } }) => <Field label="District" value={value} onChangeText={onChange} />} />
        <Controller control={control} name="language" render={({ field: { onChange, value } }) => <View style={styles.language}><Caption>LANGUAGE</Caption><View style={styles.row}><Text onPress={() => onChange('EN')} style={[styles.chip, value === 'EN' && styles.selected]}>English</Text><Text onPress={() => onChange('RW')} style={[styles.chip, value === 'RW' && styles.selected]}>Kinyarwanda</Text></View></View>} />
        <Button title="Save profile" onPress={save} loading={saving} />
      </Surface>
      <Surface style={styles.links}><Link href="/community" style={styles.link}>Open the community</Link><Link href="/support" style={styles.link}>Professional callback</Link></Surface>
      <Button title="Sign out" secondary onPress={async () => { await signOut(); router.replace('/(tabs)'); }} />
    </Screen>
  );
}

const styles = StyleSheet.create({ intro: { gap: spacing.sm }, card: { gap: spacing.md }, snapshot: { gap: spacing.sm }, line: { gap: 2, borderBottomWidth: 1, borderBottomColor: colors.line, paddingVertical: 5 }, key: { textTransform: 'capitalize' }, form: { gap: spacing.md }, language: { gap: 8 }, row: { flexDirection: 'row', gap: 8 }, chip: { borderRadius: 18, overflow: 'hidden', paddingVertical: 9, paddingHorizontal: 13, borderWidth: 1, borderColor: colors.line, color: colors.ink }, selected: { backgroundColor: colors.mint, borderColor: colors.fern, color: colors.forest, fontWeight: '700' }, links: { gap: spacing.md }, link: { color: colors.forest, fontWeight: '700', fontSize: 15 }, error: { color: colors.danger }, privacy: { textAlign: 'center', padding: spacing.md } });
