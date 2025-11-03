import { View, StyleSheet, ScrollView, Alert, Text, Pressable, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Check } from 'lucide-react-native';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';
import FormInput from '@/components/FormInput';
import Button from '@/components/Button';
import RecipientSelector from '@/components/RecipientSelector';
import { Recipient } from '@/types';
import { sendOrderViaWhatsApp } from '@/utils/whatsapp';
import { CURRENCY_SYMBOLS } from '@/constants/data';
import { useQuery } from '@tanstack/react-query';
import { fetchFoodCombos, getComboPriceForCurrency } from '@/services/foodCombos';

export default function FoodComboScreen() {
  const router = useRouter();
  const { currency, userCountry, addOrder } = useApp();
  const [loading, setLoading] = useState(false);
  
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [selectedCombo, setSelectedCombo] = useState<string | null>(null);
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [senderEmail, setSenderEmail] = useState('');

  const { data: combos, isLoading: combosLoading } = useQuery({
    queryKey: ['foodCombos'],
    queryFn: fetchFoodCombos,
  });

  const currencySymbol = CURRENCY_SYMBOLS[currency];
  const combo = combos?.find(c => c.id === selectedCombo);
  const comboPrice = combo ? getComboPriceForCurrency(combo, currency) : 0;

  const validate = () => {
    if (!recipient) {
      Alert.alert('Error', 'Selecciona un destinatario');
      return false;
    }
    if (!selectedCombo) {
      Alert.alert('Error', 'Selecciona un combo de comida');
      return false;
    }
    if (!senderName.trim()) {
      Alert.alert('Error', 'Ingresa tu nombre');
      return false;
    }
    if (!senderPhone.trim()) {
      Alert.alert('Error', 'Ingresa tu teléfono');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate() || !recipient || !combo) return;
    
    setLoading(true);
    try {
      const order = await addOrder({
        type: 'food-combo',
        recipient,
        amount: comboPrice,
        currency,
        senderName: senderName.trim(),
        senderPhone: senderPhone.trim(),
        senderEmail: senderEmail.trim() || undefined,
        senderCountry: userCountry || 'United States',
        details: {
          comboName: combo.name,
          comboDescription: combo.description,
        },
      });

      await sendOrderViaWhatsApp(order);
      
      Alert.alert(
        '¡Orden Enviada!',
        'Tu orden ha sido enviada por WhatsApp. Recibirás las instrucciones de pago.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch {
      Alert.alert('Error', 'No se pudo enviar la orden. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Combos de Comida' }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Combos de Alimentos</Text>
          <Text style={styles.infoText}>
            Envía alimentos de calidad a tu familia en Cuba. Entrega a domicilio.
          </Text>
        </View>

        <RecipientSelector
          label="Destinatario"
          value={recipient}
          onChange={setRecipient}
        />

        {combosLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Cargando combos...</Text>
          </View>
        ) : combos && combos.length > 0 ? (
          <>
            <Text style={styles.sectionLabel}>Selecciona un Combo</Text>
            {combos.map((item) => {
              const price = getComboPriceForCurrency(item, currency);
              return (
                <Pressable
                  key={item.id}
                  onPress={() => setSelectedCombo(item.id)}
                  style={({ pressed }) => [
                    styles.comboCard,
                    selectedCombo === item.id && styles.comboCardSelected,
                    pressed && styles.comboCardPressed,
                  ]}
                >
                  <View style={styles.comboHeader}>
                    <View style={styles.comboInfo}>
                      <Text style={styles.comboName}>{item.name}</Text>
                      <Text style={styles.comboDescription}>{item.description}</Text>
                    </View>
                    <View style={styles.comboPrice}>
                      <Text style={styles.comboPriceText}>{currencySymbol}{price.toFixed(2)}</Text>
                    </View>
                    {selectedCombo === item.id && (
                      <View style={styles.checkIcon}>
                        <Check color={Colors.primary} size={24} />
                      </View>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay combos disponibles</Text>
          </View>
        )}

        <View style={styles.divider} />

        <FormInput
          label="Tu nombre"
          placeholder="María González"
          value={senderName}
          onChangeText={setSenderName}
          required
        />

        <FormInput
          label="Tu teléfono"
          placeholder="+1 555 123 4567"
          value={senderPhone}
          onChangeText={setSenderPhone}
          keyboardType="phone-pad"
          required
        />

        <FormInput
          label="Tu email (opcional)"
          placeholder="maria@example.com"
          value={senderEmail}
          onChangeText={setSenderEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {combo && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total:</Text>
              <Text style={styles.summaryValue}>
                {currencySymbol}{comboPrice.toFixed(2)} {currency}
              </Text>
            </View>
          </View>
        )}

        <Button
          title="Enviar Pedido"
          onPress={handleSubmit}
          loading={loading}
          disabled={!selectedCombo || combosLoading}
        />
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
  infoCard: {
    backgroundColor: Colors.secondary + '15',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: Colors.secondary,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  comboCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  comboCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight + '10',
  },
  comboCardPressed: {
    opacity: 0.7,
  },
  comboHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    position: 'relative' as const,
  },
  comboInfo: {
    flex: 1,
    marginRight: 8,
  },
  comboName: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  comboDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  comboPrice: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  comboPriceText: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
  },
  checkIcon: {
    position: 'absolute' as const,
    top: -4,
    right: -4,
    backgroundColor: Colors.surface,
    borderRadius: 12,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center' as const,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 24,
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: Colors.secondary,
  },
});
