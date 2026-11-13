import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Screen, Surface } from '@/components/Screen';
import { Heading, Body, Caption } from '@/components/Text';
import { Field } from '@/components/Field';
import { Button } from '@/components/Button';
import { colors, spacing } from '@/constants/theme';
import { chatApi } from '@/api/endpoints';
import { apiMessage } from '@/utils/apiValue';

type Turn = { role: 'you' | 'intyoza'; value: string };

export default function AskScreen() {
  const [draft, setDraft] = useState('');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [loading, setLoading] = useState(false);
  const send = async () => {
    const message = draft.trim();
    if (!message || loading) return;
    setDraft(''); setTurns((current) => [...current, { role: 'you', value: message }]); setLoading(true);
    try {
      const response = await chatApi.send(message);
      const value = typeof response.data === 'string' ? response.data : JSON.stringify(response.data, null, 2);
      setTurns((current) => [...current, { role: 'intyoza', value }]);
    } catch (error) {
      Alert.alert('Message not sent', apiMessage(error));
      setDraft(message);
    } finally { setLoading(false); }
  };

  return (
    <Screen contentContainerStyle={styles.page}>
      <View style={styles.intro}><Caption>INTYOZA ASSISTANT</Caption><Heading>Ask what’s on your mind</Heading><Body>A private, judgment-free space for sexual and reproductive health questions.</Body></View>
      <Surface style={styles.notice}><Caption>For health emergencies, contact local emergency services or a health professional directly.</Caption></Surface>
      <ScrollView style={styles.thread} contentContainerStyle={styles.threadContent} keyboardShouldPersistTaps="handled">
        {turns.length === 0 ? <View style={styles.welcome}><View style={styles.spark}><Body style={styles.sparkText}>✳</Body></View><Body style={styles.welcomeText}>Hi, I’m here to help you find clear information. What would you like to know?</Body></View> : null}
        {turns.map((turn, index) => <View key={`${index}-${turn.role}`} style={[styles.bubble, turn.role === 'you' ? styles.userBubble : styles.assistantBubble]}><Caption style={turn.role === 'you' ? styles.userLabel : styles.assistantLabel}>{turn.role === 'you' ? 'YOU' : 'INTYOZA'}</Caption><Body style={turn.role === 'you' ? styles.userText : undefined}>{turn.value}</Body></View>)}
        {loading ? <View style={styles.thinking}><ActivityIndicator color={colors.forest} /><Caption>Preparing a response…</Caption></View> : null}
      </ScrollView>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.composer}><Field label="Your message" placeholder="Write a question…" value={draft} onChangeText={setDraft} multiline maxLength={2000} /><Button title="Send question" onPress={send} loading={loading} disabled={!draft.trim()} /></View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({ page: { flexGrow: 1, paddingBottom: spacing.md }, intro: { gap: spacing.sm }, notice: { backgroundColor: '#FFF7E8', borderColor: '#F0E2C5', padding: spacing.md }, thread: { flex: 1, minHeight: 180 }, threadContent: { gap: spacing.md, paddingVertical: spacing.md }, welcome: { borderRadius: 20, backgroundColor: colors.mint, padding: spacing.lg, gap: spacing.sm }, spark: { width: 34, height: 34, borderRadius: 12, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' }, sparkText: { color: colors.forest, fontSize: 20 }, welcomeText: { fontWeight: '600' }, bubble: { borderRadius: 18, padding: spacing.md, gap: 6, maxWidth: '93%' }, userBubble: { alignSelf: 'flex-end', backgroundColor: colors.forest }, assistantBubble: { alignSelf: 'flex-start', backgroundColor: colors.white, borderColor: colors.line, borderWidth: 1 }, userLabel: { color: '#C8E2D3', fontSize: 10, fontWeight: '700', letterSpacing: 1 }, assistantLabel: { color: colors.fern, fontSize: 10, fontWeight: '700', letterSpacing: 1 }, userText: { color: colors.white }, thinking: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: spacing.md }, composer: { gap: spacing.sm } });
