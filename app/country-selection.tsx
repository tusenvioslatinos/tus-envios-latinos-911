import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';
import { useQuery } from '@tanstack/react-query';
import { fetchCountries } from '@/services/countries';

export default function CountrySelectionScreen() {
  const router = useRouter();
  const { updateUserCountry } = useApp();
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  const { data: countries, isLoading } = useQuery<string[]>({
    queryKey: ['countries'],
    queryFn: fetchCountries,
  });

  const handleSelectCountry = async (country: string) => {
    console.log('[CountrySelection] Selected country:', country);
    setSelectedCountry(country);
    await updateUserCountry(country);
    router.replace('/(tabs)/home');
  };

  return (
    <LinearGradient
      colors={[Colors.gradientStart, Colors.gradientEnd]}
      style={styles.container}
    >
      <View style={[styles.content, { paddingTop: 60 + insets.top, paddingBottom: 32 + insets.bottom }]}>
        <View style={styles.header}>
          <Text style={styles.title}>¿Desde dónde envías?</Text>
          <Text style={styles.subtitle}>
            Selecciona tu país de origen para ajustar la moneda y las tasas de cambio
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.loadingText}>Cargando países...</Text>
          </View>
        ) : (
          <FlatList
            data={countries || []}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handleSelectCountry(item)}
                style={({ pressed }) => [
                  styles.countryCard,
                  pressed && styles.countryCardPressed,
                ]}
              >
                <Text style={styles.countryName}>{item}</Text>
              </Pressable>
            )}
          />
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 16,
  },
  list: {
    paddingBottom: 16,
  },
  countryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  countryCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  countryName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.primary,
    textAlign: 'center',
  },
});
