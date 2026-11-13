import React, { useCallback, useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Alert, StyleSheet, View } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Screen, Surface } from '@/components/Screen';
import { Heading, Body, Caption } from '@/components/Text';
import { Field } from '@/components/Field';
import { Button } from '@/components/Button';
import { LoadingState, EmptyState } from '@/components/DataStates';
import { colors, spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { referralsApi } from '@/api/endpoints';
import { apiMessage, collectionFrom } from '@/utils/apiValue';

const schema = z.object({ contactMethod: z.string().trim().min(1, 'Tell us how the professional can contact you.'), topic: z.string().trim().min(1, 'Share the topic you would like help with.') });
type Values = z.infer<typeof schema>;

export default function SupportScreen() {
  const { token } = useAuth();
  const [requests, setRequests] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const { control, handleSubmit, reset, formState: { errors } } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { contactMethod: '', topic: '' } });
  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true); setError('');
    try { const response = await referralsApi.mine(); setRequests(collectionFrom(response.data)); }
    catch (e) { setError(apiMessage(e)); }
    finally { setLoading(false); }
  }, [token]);
  useEffect(() => { load(); }, [load]);
  const submit = handleSubmit(async ({ contactMethod, topic }) => {
    setSending(true);
    try { await referralsApi.create(contactMethod, topic); reset(); Alert.alert('Request sent', 'A health professional will follow up using the contact method you provided.'); await load(); }
    catch (e) { Alert.alert('Request not sent', apiMessage(e)); }
    finally { setSending(false); }
  });

  if (!token) return <Screen><View style={styles.intro}><Caption>PROFESSIONAL SUPPORT</Caption><Heading>Speak with a professional</Heading><Body>Sign in to request a callback and review your requests.</Body></View><Button title="Sign in to continue" onPress={() => router.push('/(auth)/login')} /></Screen>;
  return (
    <Screen>
      <View style={styles.intro}><Caption>PROFESSIONAL SUPPORT</Caption><Heading>Talk to someone</Heading><Body>Request a callback from a nurse or counselor. Share only what you’re comfortable with.</Body></View>
      <Surface style={styles.form}>
        <Controller control={control} name="contactMethod" render={({ field: { onChange, value } }) => <Field label="How can they reach you?" placeholder="Phone number or another contact method" value={value} onChangeText={onChange} autoCapitalize="none" error={errors.contactMethod?.message} />} />
        <Controller control={control} name="topic" render={({ field: { onChange, value } }) => <Field label="What would you like to discuss?" placeholder="A short topic is enough" value={value} onChangeText={onChange} multiline maxLength={500} error={errors.topic?.message} />} />
        <Button title="Request a callback" onPress={submit} loading={sending} />
      </Surface>
      <Heading style={styles.subheading}>Your requests</Heading>
      {loading ? <LoadingState label="Loading your requests…" /> : error ? <EmptyState title="Could not load requests" detail={error} /> : requests.length === 0 ? <EmptyState title="No requests yet" /> : requests.map((request, index) => <Surface key={index} style={styles.request}><Caption>YOUR REQUEST</Caption><Body>{typeof request === 'string' ? request : JSON.stringify(request, null, 2)}</Body></Surface>)}
    </Screen>
  );
}

const styles = StyleSheet.create({ intro: { gap: spacing.sm }, form: { gap: spacing.md }, subheading: { fontSize: 20, lineHeight: 26, marginTop: spacing.sm }, request: { gap: spacing.sm }, });
