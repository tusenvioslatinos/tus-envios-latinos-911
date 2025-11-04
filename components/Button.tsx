import { Pressable, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { getColors } from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import * as Haptics from 'expo-haptics';
import { useMemo } from 'react';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  loading?: boolean;
}

export default function Button({ title, onPress, variant = 'primary', disabled, loading }: ButtonProps) {
  const { theme } = useApp();
  const Colors = getColors(theme);
  const styles = useMemo(() => createStyles(Colors), [Colors]);
  
  const handlePress = () => {
    if (!disabled && !loading) {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
      onPress();
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' && styles.buttonPrimary,
        variant === 'secondary' && styles.buttonSecondary,
        variant === 'outline' && styles.buttonOutline,
        (disabled || loading) && styles.buttonDisabled,
        pressed && !disabled && !loading && styles.buttonPressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? Colors.primary : '#FFFFFF'} />
      ) : (
        <Text
          style={[
            styles.buttonText,
            variant === 'primary' && styles.buttonTextPrimary,
            variant === 'secondary' && styles.buttonTextSecondary,
            variant === 'outline' && styles.buttonTextOutline,
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const createStyles = (Colors: ReturnType<typeof getColors>) => StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  buttonPrimary: {
    backgroundColor: Colors.primary,
  },
  buttonSecondary: {
    backgroundColor: Colors.secondary,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  buttonTextPrimary: {
    color: '#FFFFFF',
  },
  buttonTextSecondary: {
    color: '#FFFFFF',
  },
  buttonTextOutline: {
    color: Colors.primary,
  },
});
