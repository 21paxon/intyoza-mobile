import React, { useState } from 'react';
import { Link, router } from 'expo-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen, Surface } from '@/components/Screen';
import { Heading, Body, Caption } from '@/components/Text';
import { Field } from '@/components/Field';
import { Button } from '@/components/Button';
import { colors, spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { apiMessage } from '@/utils/apiValue';

const schema = z.object({ email: z.email('Enter a valid email address.'), password: z.string().min(1, 'Enter your password.') });
type Values = z.infer<typeof schema>;

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: '', password: '' } });
  const submit = handleSubmit(async ({ email, password }) => {
    setSubmitting(true);
    try { await signIn(email.trim(), password); router.replace('/(tabs)'); }
    catch (error) { Alert.alert('Could not sign in', apiMessage(error)); }
    finally { setSubmitting(false); }
  });
  return (
    <Screen contentContainerStyle={styles.content}>
      <View style={styles.intro}><View style={styles.mark}><Text style={styles.markText}>I</Text></View><Caption>INTYOZA • YOUR WELLBEING, YOUR WAY</Caption><Heading>Welcome back</Heading><Body>Sign in to reach your community and personal support.</Body></View>
      <Surface style={styles.form}>
        <Controller control={control} name="email" render={({ field: { onChange, value } }) => <Field label="Email address" value={value} onChangeText={onChange} autoCapitalize="none" keyboardType="email-address" autoComplete="email" error={errors.email?.message} />} />
        <Controller control={control} name="password" render={({ field: { onChange, value } }) => <Field label="Password" value={value} onChangeText={onChange} secureTextEntry autoComplete="password" error={errors.password?.message} />} />
        <Button title="Sign in" onPress={submit} loading={submitting} />
      </Surface>
      <Body style={styles.note}>New to Intyoza? <Link href="/(auth)/register" style={styles.link}>Create an account</Link></Body>
      <Pressable onPress={() => router.back()}><Caption style={styles.back}>Continue exploring without an account</Caption></Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({ content: { flexGrow: 1, justifyContent: 'center' }, intro: { gap: spacing.sm, marginBottom: spacing.lg }, mark: { width: 54, height: 54, borderRadius: 19, backgroundColor: colors.forest, alignItems: 'center', justifyContent: 'center' }, markText: { color: colors.white, fontSize: 28, fontWeight: '800' }, form: { gap: spacing.md }, note: { textAlign: 'center', marginTop: spacing.md }, link: { color: colors.forest, fontWeight: '700' }, back: { textAlign: 'center', padding: spacing.md } });
