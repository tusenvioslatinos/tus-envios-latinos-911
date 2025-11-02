import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';
import FormInput from '@/components/FormInput';
import Button from '@/components/Button';

export default function AddRecipientScreen() {
  const router = useRouter();
  const { addRecipient } = useApp();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    province: '',
    municipality: '',
    cardNumber: '',
    cardType: '',
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
      });
      
      Alert.alert('Éxito', 'Destinatario agregado correctamente');
      router.back();
    } catch (error) {
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

        <FormInput
          label="Provincia (opcional)"
          placeholder="La Habana"
          value={formData.province}
          onChangeText={(text) => setFormData(prev => ({ ...prev, province: text }))}
        />

        <FormInput
          label="Municipio (opcional)"
          placeholder="Plaza de la Revolución"
          value={formData.municipality}
          onChangeText={(text) => setFormData(prev => ({ ...prev, municipality: text }))}
        />

        <FormInput
          label="Número de Tarjeta (opcional)"
          placeholder="9225 XXXX XXXX XXXX"
          value={formData.cardNumber}
          onChangeText={(text) => setFormData(prev => ({ ...prev, cardNumber: text }))}
          keyboardType="numeric"
        />

        <FormInput
          label="Tipo de Tarjeta (opcional)"
          placeholder="MLC, CUP, etc."
          value={formData.cardType}
          onChangeText={(text) => setFormData(prev => ({ ...prev, cardType: text }))}
        />

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
  buttons: {
    marginTop: 12,
  },
});
