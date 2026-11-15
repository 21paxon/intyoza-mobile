import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  type ScrollViewInstance,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { Body, Caption, Heading } from '@/components/Text';
import { colors, spacing } from '@/constants/theme';
import { chatApi } from '@/api/endpoints';
import { apiMessage } from '@/utils/apiValue';

type Turn = { role: 'you' | 'intyoza'; value: string };

const starterQuestions = [
  'What is a condom?',
  'What is family planning?',
  'How does pregnancy happen?',
  'Quiz: myth or fact?',
];

export default function AskScreen() {
  const [draft, setDraft] = useState('');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const voiceDraftBase = useRef('');
  const threadRef = useRef<ScrollViewInstance>(null);

  useSpeechRecognitionEvent('start', () => setListening(true));
  useSpeechRecognitionEvent('end', () => setListening(false));
  useSpeechRecognitionEvent('result', (event) => {
    const transcript = event.results[0]?.transcript?.trim();
    if (!transcript) return;
    const existingText = voiceDraftBase.current;
    setDraft(existingText ? `${existingText} ${transcript}` : transcript);
  });
  useSpeechRecognitionEvent('error', (event) => {
    setListening(false);
    if (event.error === 'aborted') return;

    const message = event.error === 'no-speech' || event.error === 'speech-timeout'
      ? 'We didn’t hear any speech. Tap the microphone and try again.'
      : event.error === 'not-allowed'
        ? 'Allow microphone and speech recognition access in your device settings to use voice input.'
        : 'Voice input is unavailable right now. Check your device’s speech recognition settings and try again.';
    Alert.alert('Voice input unavailable', message);
  });

  const sendMessage = async (value: string) => {
    const message = value.trim();
    if (!message || loading) return;

    setDraft('');
    setTurns((current) => [...current, { role: 'you', value: message }]);
    setLoading(true);

    try {
      const response = await chatApi.send(message);
      const data = response.data as { reply?: unknown } | string;
      const reply = typeof data === 'object' && typeof data.reply === 'string'
        ? data.reply
        : typeof data === 'string'
          ? data
          : 'I could not prepare a response. Please try again.';
      setTurns((current) => [...current, { role: 'intyoza', value: reply }]);
    } catch (error) {
      const code = (error as { code?: string } | null)?.code;
      const messageError = code === 'ECONNABORTED' || code === 'ETIMEDOUT'
        ? 'Intyoza is taking longer than usual to respond. Please try again.'
        : apiMessage(error);
      Alert.alert('Message not sent', messageError);
      setDraft(message);
    } finally {
      setLoading(false);
    }
  };

  const sendDraft = () => sendMessage(draft);

  const toggleVoiceInput = async () => {
    if (listening) {
      ExpoSpeechRecognitionModule.stop();
      return;
    }
    if (loading) return;

    try {
      if (!ExpoSpeechRecognitionModule.isRecognitionAvailable()) {
        Alert.alert('Voice input unavailable', 'Speech recognition is not available on this device.');
        return;
      }

      const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Microphone access needed', 'Allow microphone and speech recognition access to dictate a question.');
        return;
      }

      voiceDraftBase.current = draft.trim();
      ExpoSpeechRecognitionModule.start({ interimResults: true, continuous: false, maxAlternatives: 1 });
    } catch {
      setListening(false);
      Alert.alert('Voice input unavailable', 'Could not start speech recognition. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <KeyboardAvoidingView
        style={styles.keyboardArea}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.page}>
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <Ionicons name="chatbubble-ellipses" size={21} color={colors.white} />
            </View>
            <View style={styles.headerCopy}>
              <Caption style={styles.eyebrow}>YOUR HEALTH COMPANION</Caption>
              <Heading style={styles.title}>Ask Intyoza</Heading>
            </View>
            <View style={styles.privateBadge}>
              <Ionicons name="lock-closed" size={12} color={colors.forest} />
              <Caption style={styles.privateText}>PRIVATE</Caption>
            </View>
          </View>

          <View style={styles.emergencyNote}>
            <Ionicons name="information-circle-outline" size={18} color="#9B6823" />
            <Body style={styles.emergencyText}>
              For emergencies, contact local emergency services or a health professional.
            </Body>
          </View>

          <ScrollView
            ref={threadRef}
            style={styles.thread}
            contentContainerStyle={turns.length === 0 ? styles.emptyThread : styles.threadContent}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => threadRef.current?.scrollToEnd({ animated: true })}>
            {turns.length === 0 ? (
              <View style={styles.welcome}>
                <View style={styles.welcomeIcon}>
                  <Ionicons name="sparkles" size={22} color={colors.forest} />
                </View>
                <Caption style={styles.welcomeEyebrow}>A SAFE SPACE TO ASK</Caption>
                <Heading style={styles.welcomeTitle}>What’s on your mind?</Heading>
                <Body style={styles.welcomeBody}>
                  Get clear, supportive information about your body, relationships, and wellbeing.
                </Body>

                <View style={styles.suggestionHeader}>
                  <Caption style={styles.suggestionHeading}>TRY ASKING</Caption>
                  <View style={styles.suggestionRule} />
                </View>
                <View style={styles.suggestions}>
                  {starterQuestions.map((question) => (
                    <Pressable
                      key={question}
                      accessibilityRole="button"
                      accessibilityLabel={`Ask: ${question}`}
                      disabled={loading}
                      onPress={() => sendMessage(question)}
                      style={({ pressed }) => [styles.suggestion, pressed && styles.pressed]}>
                      <Body style={styles.suggestionText}>{question}</Body>
                      <Ionicons name="arrow-up" size={15} color={colors.fern} />
                    </Pressable>
                  ))}
                </View>
              </View>
            ) : (
              turns.map((turn, index) => (
                turn.role === 'you' ? (
                  <View key={`${index}-${turn.role}`} style={styles.userRow}>
                    <View style={styles.userBubble}>
                      <Body style={styles.userText}>{turn.value}</Body>
                    </View>
                  </View>
                ) : (
                  <View key={`${index}-${turn.role}`} style={styles.assistantRow}>
                    <View style={styles.assistantAvatar}>
                      <Ionicons name="sparkles" size={15} color={colors.forest} />
                    </View>
                    <View style={styles.assistantMessage}>
                      <Caption style={styles.assistantLabel}>INTYOZA</Caption>
                      <View style={styles.assistantBubble}>
                        <Body style={styles.assistantText}>{turn.value}</Body>
                      </View>
                    </View>
                  </View>
                )
              ))
            )}

            {loading ? (
              <View style={styles.loadingRow}>
                <View style={styles.assistantAvatar}>
                  <Ionicons name="sparkles" size={15} color={colors.forest} />
                </View>
                <View style={styles.loadingBubble}>
                  <ActivityIndicator size="small" color={colors.forest} />
                  <Caption style={styles.loadingText}>Intyoza is responding…</Caption>
                </View>
              </View>
            ) : null}
          </ScrollView>

          <View style={styles.composerArea}>
            <View style={styles.composer}>
              <TextInput
                accessibilityLabel="Your message"
                placeholder="Ask anything…"
                placeholderTextColor={colors.muted}
                value={draft}
                onChangeText={setDraft}
                multiline
                maxLength={2000}
                editable={!loading && !listening}
                style={styles.input}
                textAlignVertical="center"
                returnKeyType="send"
                onSubmitEditing={sendDraft}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={listening ? 'Stop voice input' : 'Start voice input'}
                disabled={loading}
                onPress={toggleVoiceInput}
                style={({ pressed }) => [
                  styles.voiceButton,
                  listening && styles.voiceButtonActive,
                  pressed && styles.pressed,
                ]}>
                <Ionicons name={listening ? 'stop' : 'mic'} size={19} color={listening ? colors.white : colors.forest} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Send message"
                disabled={!draft.trim() || loading || listening}
                onPress={sendDraft}
                style={({ pressed }) => [
                  styles.sendButton,
                  (!draft.trim() || loading || listening) && styles.sendButtonDisabled,
                  pressed && styles.pressed,
                ]}>
                {loading ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Ionicons name="arrow-up" size={21} color={colors.white} />
                )}
              </Pressable>
            </View>
            <View style={styles.composerFooter}>
              <Ionicons name={listening ? 'radio' : 'mic-outline'} size={12} color={listening ? colors.coral : colors.muted} />
              <Caption style={[styles.footerText, listening && styles.listeningText]}>
                {listening ? 'Listening… tap the mic when you’re done' : 'Voice is transcribed by your device’s speech service'}
              </Caption>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.paper },
  keyboardArea: { flex: 1 },
  page: { flex: 1, paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.sm },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingBottom: spacing.md },
  headerIcon: { width: 44, height: 44, borderRadius: 15, backgroundColor: colors.forest, alignItems: 'center', justifyContent: 'center' },
  headerCopy: { flex: 1, gap: 1 },
  eyebrow: { color: colors.fern, fontSize: 9, lineHeight: 13, fontWeight: '800', letterSpacing: 1.1 },
  title: { fontSize: 23, lineHeight: 28, letterSpacing: -0.5 },
  privateBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 7, backgroundColor: colors.mint },
  privateText: { color: colors.forest, fontSize: 9, lineHeight: 12, fontWeight: '800', letterSpacing: 0.7 },
  emergencyNote: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 14, borderWidth: 1, borderColor: '#F0E2C5', backgroundColor: '#FFF8EC', paddingHorizontal: 12, paddingVertical: 10 },
  emergencyText: { flex: 1, color: '#775426', fontSize: 12, lineHeight: 17 },
  thread: { flex: 1, marginTop: spacing.sm },
  emptyThread: { flexGrow: 1, justifyContent: 'center', paddingVertical: spacing.md },
  threadContent: { gap: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.lg },
  welcome: { borderRadius: 24, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, padding: spacing.lg, shadowColor: '#18332E', shadowOpacity: 0.04, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 2 },
  welcomeIcon: { width: 46, height: 46, borderRadius: 16, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  welcomeEyebrow: { color: colors.fern, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  welcomeTitle: { marginTop: 5, fontSize: 24, lineHeight: 30 },
  welcomeBody: { marginTop: 7, color: colors.muted, fontSize: 14, lineHeight: 21 },
  suggestionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: spacing.lg, marginBottom: spacing.sm },
  suggestionHeading: { color: colors.muted, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  suggestionRule: { flex: 1, height: StyleSheet.hairlineWidth, backgroundColor: colors.line },
  suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  suggestion: { width: '48%', minHeight: 52, flexGrow: 1, flexBasis: '46%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, borderWidth: 1, borderColor: colors.line, borderRadius: 14, paddingHorizontal: 11, paddingVertical: 9, backgroundColor: '#FCFDFC' },
  suggestionText: { flex: 1, fontSize: 12, lineHeight: 17, fontWeight: '600' },
  userRow: { alignItems: 'flex-end' },
  userBubble: { maxWidth: '86%', borderTopLeftRadius: 20, borderTopRightRadius: 20, borderBottomLeftRadius: 20, borderBottomRightRadius: 6, backgroundColor: colors.forest, paddingHorizontal: 15, paddingVertical: 12 },
  userText: { color: colors.white, fontSize: 15, lineHeight: 22 },
  assistantRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 9 },
  assistantAvatar: { width: 30, height: 30, borderRadius: 11, backgroundColor: colors.mint, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  assistantMessage: { flex: 1, gap: 5, alignItems: 'flex-start' },
  assistantLabel: { color: colors.fern, fontSize: 9, lineHeight: 12, fontWeight: '800', letterSpacing: 1 },
  assistantBubble: { maxWidth: '100%', borderRadius: 18, borderTopLeftRadius: 5, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, paddingHorizontal: 15, paddingVertical: 12 },
  assistantText: { fontSize: 15, lineHeight: 23 },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  loadingBubble: { flexDirection: 'row', alignItems: 'center', gap: 9, borderRadius: 18, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, paddingHorizontal: 13, paddingVertical: 11 },
  loadingText: { color: colors.muted, fontSize: 12 },
  composerArea: { paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.line },
  composer: { minHeight: 54, flexDirection: 'row', alignItems: 'flex-end', gap: 8, borderRadius: 18, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, paddingLeft: 15, paddingRight: 6, paddingVertical: 6 },
  input: { flex: 1, maxHeight: 112, minHeight: 40, paddingTop: 9, paddingBottom: 9, color: colors.ink, fontSize: 15, lineHeight: 21 },
  voiceButton: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.mint },
  voiceButtonActive: { backgroundColor: colors.coral },
  sendButton: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.forest },
  sendButtonDisabled: { backgroundColor: '#9BB5AA' },
  pressed: { opacity: 0.75 },
  composerFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingTop: 8 },
  footerText: { color: colors.muted, fontSize: 10, lineHeight: 14 },
  listeningText: { color: colors.coral },
});
