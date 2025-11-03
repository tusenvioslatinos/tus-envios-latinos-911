import { View, Text, StyleSheet, Image, Pressable, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import * as Haptics from 'expo-haptics';

export default function WelcomeScreen() {
  const router = useRouter();
  const { isLoading } = useApp();
  const [showContent, setShowContent] = useState(false);
  const insets = useSafeAreaInsets();

  const { hasSelectedCountry } = useApp();

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  useEffect(() => {
    if (!isLoading && showContent) {
      if (!hasSelectedCountry) {
        router.replace('/country-selection');
      }
    }
  }, [isLoading, showContent, hasSelectedCountry, router]);

  const handleContinue = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    router.replace('/(tabs)/home');
  };

  if (isLoading || !showContent) {
    return (
      <LinearGradient
        colors={[Colors.gradientStart, Colors.gradientEnd]}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <Image 
            source={{ uri: 'https://rork.app/pa/34z6c325dcpuojgjmfr7a/logo' }}
            style={styles.logoLarge}
            resizeMode="contain"
          />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientEnd]}
      style={styles.container}
    >
      <View style={[styles.content, { paddingTop: 80 + insets.top, paddingBottom: 48 + insets.bottom }]}>
        <View style={styles.logoContainer}>
          <Image 
            source={{ uri: 'https://rork.app/pa/34z6c325dcpuojgjmfr7a/logo' }}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.welcomeText}>Bienvenido a</Text>
          <Text style={styles.brandText}>Tus Envíos Latinos</Text>
          <Text style={styles.descriptionText}>
            Con más de 6 años en el mercado, ofreciendo servicios tales como envío de dinero, combos de comida y recargas a Cuba, Tus Envíos Latinos, le brinda excelencia y calidad como nuestros clientes merecen.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Pressable
            onPress={handleContinue}
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.buttonText}>Comenzar</Text>
          </Pressable>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  logo: {
    width: 180,
    height: 180,
  },
  logoLarge: {
    width: 200,
    height: 200,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  welcomeText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
    fontWeight: '400' as const,
  },
  brandText: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
  },
  descriptionText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    lineHeight: 24,
  },
  buttonContainer: {
    paddingHorizontal: 12,
  },
  button: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: Colors.primary,
  },
});
