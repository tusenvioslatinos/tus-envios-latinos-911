import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { Globe, ChevronRight } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchCountries } from '@/services/countries';

export default function SettingsScreen() {
  const { userCountry, updateUserCountry } = useApp();
  const [showCountries, setShowCountries] = useState(false);

  const { data: countries, isLoading: countriesLoading } = useQuery<string[]>({
    queryKey: ['countries'],
    queryFn: fetchCountries,
  });

  const handleCountrySelect = async (country: string) => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    await updateUserCountry(country);
    setShowCountries(false);
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Ajustes' }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tu Ubicación</Text>
          
          <Pressable
            onPress={() => setShowCountries(!showCountries)}
            style={({ pressed }) => [
              styles.settingItem,
              pressed && styles.settingItemPressed,
            ]}
          >
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Globe color={Colors.primary} size={20} />
              </View>
              <View>
                <Text style={styles.settingLabel}>País</Text>
                <Text style={styles.settingValue}>{userCountry}</Text>
              </View>
            </View>
            <ChevronRight color={Colors.textLight} size={20} />
          </Pressable>

          {showCountries && (
            <View style={styles.countriesContainer}>
              {countriesLoading ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Cargando países...</Text>
                </View>
              ) : (
                countries?.map((country) => (
                  <Pressable
                    key={country}
                    onPress={() => handleCountrySelect(country)}
                    style={({ pressed }) => [
                      styles.countryItem,
                      userCountry === country && styles.countryItemSelected,
                      pressed && styles.countryItemPressed,
                    ]}
                  >
                    <Text style={styles.countryName}>{country}</Text>
                  </Pressable>
                ))
              )}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acerca de</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Tus Envíos Latinos</Text>
            <Text style={styles.infoText}>
              Con más de 6 años de experiencia enviando remesas, combos de comida y recargas a Cuba.
            </Text>
            <Text style={styles.versionText}>Versión 1.0.0</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Soporte</Text>
          <Text style={styles.supportText}>
            Para cualquier consulta, envía tu pedido por WhatsApp y recibirás instrucciones de pago.
          </Text>
          <Text style={styles.phoneText}>+1 (402) 313-1333</Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  settingItem: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  settingItemPressed: {
    opacity: 0.7,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  settingValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  countriesContainer: {
    marginTop: 12,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  countryItemSelected: {
    backgroundColor: Colors.primaryLight + '10',
  },
  countryItemPressed: {
    opacity: 0.7,
  },
  countryName: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  versionText: {
    fontSize: 12,
    color: Colors.textLight,
  },
  supportText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  phoneText: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: Colors.primary,
  },
});
