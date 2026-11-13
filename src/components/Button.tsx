import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors, spacing } from '@/constants/theme';

type Props = { title: string; onPress: () => void; loading?: boolean; disabled?: boolean; secondary?: boolean };

export function Button({ title, onPress, loading = false, disabled = false, secondary = false }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [styles.button, secondary && styles.secondary, (disabled || loading) && styles.disabled, pressed && styles.pressed]}>
      {loading ? <ActivityIndicator color={secondary ? colors.forest : colors.white} /> : (
        <Text style={[styles.label, secondary && styles.secondaryLabel]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { minHeight: 52, paddingHorizontal: spacing.lg, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.forest },
  secondary: { backgroundColor: colors.mint },
  label: { color: colors.white, fontSize: 15, fontWeight: '700' },
  secondaryLabel: { color: colors.forest },
  disabled: { opacity: 0.55 },
  pressed: { opacity: 0.8 },
});
