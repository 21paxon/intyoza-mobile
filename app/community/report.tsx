import React, { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Alert, StyleSheet, View } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Screen, Surface } from '@/components/Screen';
import { Heading, Body, Caption } from '@/components/Text';
import { Field } from '@/components/Field';
import { Button } from '@/components/Button';
import { colors, spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { communityApi } from '@/api/endpoints';
import { apiMessage } from '@/utils/apiValue';

const schema = z.object({ reason: z.string().trim().min(3, 'Please add a short reason.').max(500, 'Please keep the report under 500 characters.') });
type Values = z.infer<typeof schema>;

export default function ReportScreen() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const { token } = useAuth();
  const [sending, setSending] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { reason: '' } });
  const submit = handleSubmit(async ({ reason }) => {
    if (!token || !postId) return;
    setSending(true);
    try { await communityApi.report({ postId, reason }); Alert.alert('Report sent', 'Thank you for helping keep the community safe.'); router.back(); }
    catch (e) { Alert.alert('Could not send report', apiMessage(e)); }
    finally { setSending(false); }
  });
  return (
    <Screen>
      <View style={styles.intro}><Caption>COMMUNITY SAFETY</Caption><Heading>Report this post</Heading><Body>Explain what concerns you. Your report will be sent to the Intyoza moderation team.</Body></View>
      <Surface style={styles.form}><Controller control={control} name="reason" render={({ field: { onChange, value } }) => <Field label="Reason for report" value={value} onChangeText={onChange} placeholder="Describe your concern" multiline maxLength={500} error={errors.reason?.message} />} /><Button title="Send report" onPress={submit} loading={sending} /></Surface>
    </Screen>
  );
}

const styles = StyleSheet.create({ intro: { gap: spacing.sm }, form: { gap: spacing.md }, });
