import React, { useState } from 'react';
import { Link, router } from 'expo-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Screen, Surface } from '@/components/Screen';
import { Heading, Body, Caption } from '@/components/Text';
import { Field } from '@/components/Field';
import { Button } from '@/components/Button';
import { colors, spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { apiMessage } from '@/utils/apiValue';

const schema = z.object({ email: z.email('Enter a valid email address.'), password: z.string().min(8, 'Use at least 8 characters.'), ageBand: z.enum(['UNKNOWN', 'AGE_10_14', 'AGE_15_19', 'AGE_20_24', 'AGE_25_PLUS']), gender: z.enum(['PREFER_NOT_TO_SAY', 'FEMALE', 'MALE', 'OTHER']), district: z.string(), language: z.enum(['EN', 'RW']) });
type Values = z.infer<typeof schema>;
const ages = [['UNKNOWN','Prefer not to say'], ['AGE_10_14','10–14'], ['AGE_15_19','15–19'], ['AGE_20_24','20–24'], ['AGE_25_PLUS','25+']] as const;
const genders = [['PREFER_NOT_TO_SAY','Prefer not to say'], ['FEMALE','Female'], ['MALE','Male'], ['OTHER','Other']] as const;

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: '', password: '', ageBand: 'UNKNOWN', gender: 'PREFER_NOT_TO_SAY', district: '', language: 'EN' } });
  const submit = handleSubmit(async (values) => {
    setSubmitting(true);
    try { await signUp(values); Alert.alert('Account created', 'Sign in with your new account.'); router.replace('/(auth)/login'); }
    catch (error) { Alert.alert('Could not create account', apiMessage(error)); }
    finally { setSubmitting(false); }
  });
  return (
    <Screen>
      <View style={styles.intro}><Caption>JOIN INTYOZA</Caption><Heading>A safer place to learn and connect</Heading><Body>Create an account for community and professional support.</Body></View>
      <Surface style={styles.form}>
        <Controller control={control} name="email" render={({ field: { onChange, value } }) => <Field label="Email address" value={value} onChangeText={onChange} autoCapitalize="none" keyboardType="email-address" error={errors.email?.message} />} />
        <Controller control={control} name="password" render={({ field: { onChange, value } }) => <Field label="Password" value={value} onChangeText={onChange} secureTextEntry error={errors.password?.message} />} />
        <Controller control={control} name="ageBand" render={({ field: { onChange, value } }) => <Choice label="Age range" options={ages} value={value} onChange={onChange} />} />
        <Controller control={control} name="gender" render={({ field: { onChange, value } }) => <Choice label="Gender" options={genders} value={value} onChange={onChange} />} />
        <Controller control={control} name="district" render={({ field: { onChange, value } }) => <Field label="District (optional)" value={value} onChangeText={onChange} autoCapitalize="words" />} />
        <Controller control={control} name="language" render={({ field: { onChange, value } }) => <Choice label="Preferred language" options={[["EN","English"],["RW","Kinyarwanda"]] as const} value={value} onChange={onChange} />} />
        <Button title="Create account" onPress={submit} loading={submitting} />
      </Surface>
      <Body style={styles.note}>Already registered? <Link href="/(auth)/login" style={styles.link}>Sign in</Link></Body>
    </Screen>
  );
}

function Choice<T extends string>({ label, options, value, onChange }: { label: string; options: readonly (readonly [T, string])[]; value: T; onChange: (value: T) => void }) {
  return <View style={styles.choice}><Text style={styles.label}>{label}</Text><View style={styles.row}>{options.map(([key, title]) => <Text key={key} onPress={() => onChange(key)} style={[styles.chip, key === value && styles.selected]}>{title}</Text>)}</View></View>;
}

const styles = StyleSheet.create({ intro: { gap: spacing.sm, marginTop: spacing.md }, form: { gap: spacing.md }, choice: { gap: 7 }, label: { color: colors.ink, fontWeight: '600', fontSize: 13 }, row: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 }, chip: { overflow: 'hidden', borderRadius: 20, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, color: colors.ink, paddingVertical: 9, paddingHorizontal: 12, fontSize: 12 }, selected: { backgroundColor: colors.mint, borderColor: colors.fern, color: colors.forest, fontWeight: '700' }, note: { textAlign: 'center', marginTop: spacing.md }, link: { color: colors.forest, fontWeight: '700' } });
