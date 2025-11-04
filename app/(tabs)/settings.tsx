import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Switch } from 'react-native';
import { Stack } from 'expo-router';
import { Globe, ChevronRight, Sun, Moon } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import { getColors } from '@/constants/colors';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchCountries } from '@/services/countries';

export default function SettingsScreen() {
  const { userCountry, updateUserCountry, theme, updateTheme } = useApp();
  const [showCountries, setShowCountries] = useState(false);
  const Colors = getColors(theme);

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

  const handleThemeToggle = async (value: boolean) => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    await updateTheme(value ? 'dark' : 'light');
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Ajustes' }} />
      <ScrollView style={[styles.container, { backgroundColor: Colors.background }]} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors.text }]}>Apariencia</Text>
          
          <View style={[styles.settingItem, { backgroundColor: Colors.surface }]}>
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: Colors.primaryLight + '20' }]}>
                {theme === 'dark' ? (
                  <Moon color={Colors.primary} size={20} />
                ) : (
                  <Sun color={Colors.primary} size={20} />
                )}
              </View>
              <View>
                <Text style={[styles.settingLabel, { color: Colors.textSecondary }]}>Tema Oscuro</Text>
                <Text style={[styles.settingValue, { color: Colors.text }]}>
                  {theme === 'dark' ? 'Activado' : 'Desactivado'}
                </Text>
              </View>
            </View>
            <Switch
              value={theme === 'dark'}
              onValueChange={handleThemeToggle}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.surface}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors.text }]}>Tu Ubicación</Text>
          
          <Pressable
            onPress={() => setShowCountries(!showCountries)}
            style={({ pressed }) => [
              styles.settingItem,
              { backgroundColor: Colors.surface },
              pressed && styles.settingItemPressed,
            ]}
          >
            <View style={styles.settingLeft}>
              <View style={[styles.iconContainer, { backgroundColor: Colors.primaryLight + '20' }]}>
                <Globe color={Colors.primary} size={20} />
              </View>
              <View>
                <Text style={[styles.settingLabel, { color: Colors.textSecondary }]}>País</Text>
                <Text style={[styles.settingValue, { color: Colors.text }]}>{userCountry}</Text>
              </View>
            </View>
            <ChevronRight color={Colors.textLight} size={20} />
          </Pressable>

          {showCountries && (
            <View style={[styles.countriesContainer, { backgroundColor: Colors.surface, borderColor: Colors.border }]}>
              {countriesLoading ? (
                <View style={styles.loadingContainer}>
                  <Text style={[styles.loadingText, { color: Colors.textSecondary }]}>Cargando países...</Text>
                </View>
              ) : (
                countries?.map((country) => (
                  <Pressable
                    key={country}
                    onPress={() => handleCountrySelect(country)}
                    style={({ pressed }) => [
                      styles.countryItem,
                      { borderBottomColor: Colors.border },
                      userCountry === country && { backgroundColor: Colors.primaryLight + '10' },
                      pressed && styles.countryItemPressed,
                    ]}
                  >
                    <Text style={[styles.countryName, { color: Colors.text }]}>{country}</Text>
                  </Pressable>
                ))
              )}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors.text }]}>Acerca de</Text>
          <View style={[styles.infoCard, { backgroundColor: Colors.surface }]}>
            <Text style={[styles.infoTitle, { color: Colors.text }]}>Tus Envíos Latinos</Text>
            <Text style={[styles.infoText, { color: Colors.textSecondary }]}>
              Con más de 6 años de experiencia enviando remesas, combos de comida y recargas a Cuba.
            </Text>
            <Text style={[styles.versionText, { color: Colors.textLight }]}>Versión 1.0.0</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors.text }]}>Soporte</Text>
          <Text style={[styles.supportText, { color: Colors.textSecondary }]}>
            Para cualquier consulta, envía tu pedido por WhatsApp y recibirás instrucciones de pago.
          </Text>
          <Text style={[styles.phoneText, { color: Colors.primary }]}>+1 (402) 313-1333</Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginBottom: 12,
  },
  settingItem: {
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabel: {
    fontSize: 14,
    marginBottom: 2,
  },
  settingValue: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  countriesContainer: {
    marginTop: 12,
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
  },
  countryItemPressed: {
    opacity: 0.7,
  },
  countryName: {
    flex: 1,
    fontSize: 16,
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
  },
  infoCard: {
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
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  versionText: {
    fontSize: 12,
  },
  supportText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  phoneText: {
    fontSize: 18,
    fontWeight: 'bold' as const,
  },
});
