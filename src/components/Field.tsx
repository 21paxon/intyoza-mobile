import React from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { colors, spacing } from '@/constants/theme';

type Props = TextInputProps & { label: string; error?: string };

export function Field({ label, error, ...props }: Props) {
  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.muted}
        style={[styles.input, error && styles.inputError]}
        accessibilityLabel={label}
        {...props}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: 7 },
  label: { color: colors.ink, fontSize: 13, fontWeight: '600' },
  input: { minHeight: 50, borderRadius: 14, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white, paddingHorizontal: spacing.md, color: colors.ink, fontSize: 15 },
  inputError: { borderColor: colors.danger },
  error: { color: colors.danger, fontSize: 12 },
});
