import { View, StyleSheet, ScrollView, Alert, Text, Pressable, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';
import FormInput from '@/components/FormInput';
import Button from '@/components/Button';
import { CardCurrency } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { fetchLocations } from '@/services/locations';
import { ChevronRight } from 'lucide-react-native';

export default function AddRecipientScreen() {
  const router = useRouter();
  const { addRecipient } = useApp();
  const [loading, setLoading] = useState(false);
  const [showProvinces, setShowProvinces] = useState(false);
  const [showMunicipalities, setShowMunicipalities] = useState(false);

  const { data: locationData, isLoading: locationsLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: fetchLocations,
  });
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    province: '',
    municipality: '',
    cardNumber: '',
    cardType: '',
    cardCurrency: undefined as CardCurrency | undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    } else if (!/^\+?\d{8,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Teléfono inválido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    
    setLoading(true);
    try {
      await addRecipient({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim() || undefined,
        province: formData.province.trim() || undefined,
        municipality: formData.municipality.trim() || undefined,
        cardNumber: formData.cardNumber.trim() || undefined,
        cardType: formData.cardType.trim() || undefined,
        cardCurrency: formData.cardCurrency,
      });
      
      Alert.alert('Éxito', 'Destinatario agregado correctamente');
      router.back();
    } catch {
      Alert.alert('Error', 'No se pudo agregar el destinatario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Nuevo Destinatario' }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <FormInput
          label="Nombre completo"
          placeholder="Juan Pérez"
          value={formData.name}
          onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
          error={errors.name}
          required
        />

        <FormInput
          label="Teléfono"
          placeholder="+53 5234 5678"
          value={formData.phone}
          onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
          keyboardType="phone-pad"
          error={errors.phone}
          required
        />

        <FormInput
          label="Dirección (opcional)"
          placeholder="Calle 23 #456, e/ A y B"
          value={formData.address}
          onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
          multiline
          numberOfLines={2}
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ubicación del Destinatario</Text>
          {locationsLoading ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <>
              <Pressable
                onPress={() => setShowProvinces(!showProvinces)}
                style={({ pressed }) => [
                  styles.selector,
                  pressed && styles.selectorPressed,
                ]}
              >
                <View style={styles.selectorContent}>
                  <Text style={styles.selectorLabel}>Provincia</Text>
                  <Text style={styles.selectorValue}>
                    {formData.province || 'Seleccionar provincia'}
                  </Text>
                </View>
                <ChevronRight color={Colors.textLight} size={20} />
              </Pressable>

              {showProvinces && locationData && (
                <View style={styles.dropdown}>
                  {locationData.provinces.map((province) => (
                    <Pressable
                      key={province}
                      onPress={() => {
                        setFormData(prev => ({ ...prev, province, municipality: '' }));
                        setShowProvinces(false);
                      }}
                      style={({ pressed }) => [
                        styles.dropdownItem,
                        formData.province === province && styles.dropdownItemSelected,
                        pressed && styles.dropdownItemPressed,
                      ]}
                    >
                      <Text style={styles.dropdownText}>{province}</Text>
                    </Pressable>
                  ))}
                </View>
              )}

              {formData.province && (
                <>
                  <Pressable
                    onPress={() => setShowMunicipalities(!showMunicipalities)}
                    style={({ pressed }) => [
                      styles.selector,
                      pressed && styles.selectorPressed,
                    ]}
                  >
                    <View style={styles.selectorContent}>
                      <Text style={styles.selectorLabel}>Municipio</Text>
                      <Text style={styles.selectorValue}>
                        {formData.municipality || 'Seleccionar municipio'}
                      </Text>
                    </View>
                    <ChevronRight color={Colors.textLight} size={20} />
                  </Pressable>

                  {showMunicipalities && locationData && locationData.municipalities[formData.province] && (
                    <View style={styles.dropdown}>
                      {locationData.municipalities[formData.province].map((municipality) => (
                        <Pressable
                          key={municipality}
                          onPress={() => {
                            setFormData(prev => ({ ...prev, municipality }));
                            setShowMunicipalities(false);
                          }}
                          style={({ pressed }) => [
                            styles.dropdownItem,
                            formData.municipality === municipality && styles.dropdownItemSelected,
                            pressed && styles.dropdownItemPressed,
                          ]}
                        >
                          <Text style={styles.dropdownText}>{municipality}</Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </>
              )}
            </>
          )}
        </View>

        <FormInput
          label="Número de Tarjeta (opcional)"
          placeholder="9225 XXXX XXXX XXXX"
          value={formData.cardNumber}
          onChangeText={(text) => setFormData(prev => ({ ...prev, cardNumber: text }))}
          keyboardType="numeric"
        />

        <FormInput
          label="Tipo de Tarjeta (opcional)"
          placeholder="Débito, Crédito, etc."
          value={formData.cardType}
          onChangeText={(text) => setFormData(prev => ({ ...prev, cardType: text }))}
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Moneda de la Tarjeta</Text>
          <Text style={styles.sectionSubtitle}>Selecciona la moneda de la tarjeta del destinatario</Text>
          <View style={styles.currencyButtons}>
            {(['USD', 'MLC', 'CUP'] as CardCurrency[]).map((curr) => (
              <Button
                key={curr}
                title={curr}
                onPress={() => setFormData(prev => ({ ...prev, cardCurrency: curr }))}
                variant={formData.cardCurrency === curr ? 'primary' : 'secondary'}
              />
            ))}
          </View>
        </View>

        <View style={styles.buttons}>
          <Button
            title="Guardar Destinatario"
            onPress={handleSave}
            loading={loading}
          />
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
    marginTop: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 6,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  currencyButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  selector: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  selectorPressed: {
    opacity: 0.7,
  },
  selectorContent: {
    flex: 1,
  },
  selectorLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  selectorValue: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500' as const,
  },
  dropdown: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: 12,
    maxHeight: 250,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dropdownItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dropdownItemSelected: {
    backgroundColor: Colors.primaryLight + '10',
  },
  dropdownItemPressed: {
    opacity: 0.7,
  },
  dropdownText: {
    fontSize: 16,
    color: Colors.text,
  },
  buttons: {
    marginTop: 12,
  },
});
