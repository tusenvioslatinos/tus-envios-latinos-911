import { View, StyleSheet, ScrollView, Alert, Text, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';
import FormInput from '@/components/FormInput';
import Button from '@/components/Button';
import RecipientSelector from '@/components/RecipientSelector';
import { Recipient } from '@/types';
import { sendOrderViaWhatsApp } from '@/utils/whatsapp';
import { CURRENCY_SYMBOLS } from '@/constants/data';
import { useQuery } from '@tanstack/react-query';
import { fetchExchangeRates, getExchangeRate } from '@/services/exchangeRates';
import { fetchLocations, getDeliveryCost } from '@/services/locations';

export default function RemittanceCardScreen() {
  const router = useRouter();
  const { currency, userCountry, addOrder } = useApp();
  const [loading, setLoading] = useState(false);
  
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [amount, setAmount] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [senderEmail, setSenderEmail] = useState('');

  const currencySymbol = CURRENCY_SYMBOLS[currency];

  const { data: exchangeRates, isLoading: ratesLoading } = useQuery({
    queryKey: ['exchangeRates'],
    queryFn: fetchExchangeRates,
  });

  const { data: locationData, isLoading: locationsLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: fetchLocations,
  });

  const cardCurrency = recipient?.cardCurrency || 'MLC';

  const deliveryCost = recipient && locationData && recipient.province && recipient.municipality
    ? getDeliveryCost(recipient.province, recipient.municipality, userCountry || '', locationData)
    : 0;

  const amountToReceive = amount ? parseFloat(amount) : 0;
  const totalToSend = amountToReceive && exchangeRates && userCountry
    ? amountToReceive / getExchangeRate(userCountry, cardCurrency, exchangeRates)
    : 0;
  const totalAmount = totalToSend + deliveryCost;

  const validate = () => {
    if (!recipient) {
      Alert.alert('Error', 'Selecciona un destinatario');
      return false;
    }
    if (!recipient.cardNumber) {
      Alert.alert('Error', 'El destinatario debe tener número de tarjeta');
      return false;
    }
    if (!recipient.cardCurrency) {
      Alert.alert('Error', 'El destinatario debe tener moneda de tarjeta seleccionada');
      return false;
    }
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Ingresa un monto válido');
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
    if (!validate() || !recipient) return;
    
    setLoading(true);
    try {
      const order = await addOrder({
        type: 'remittance-card',
        recipient,
        amount: parseFloat(amount),
        currency,
        senderName: senderName.trim(),
        senderPhone: senderPhone.trim(),
        senderEmail: senderEmail.trim() || undefined,
        senderCountry: userCountry || 'United States',
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
      <Stack.Screen options={{ title: 'Envío a Tarjeta' }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Recarga a Tarjeta</Text>
          <Text style={styles.infoText}>
            El dinero será depositado instantáneamente en la tarjeta bancaria del destinatario.
          </Text>
        </View>

        <RecipientSelector
          label="Destinatario"
          value={recipient}
          onChange={setRecipient}
        />

        {recipient?.cardNumber && (
          <View style={styles.cardInfo}>
            <View style={styles.cardRow}>
              <View>
                <Text style={styles.cardLabel}>Tarjeta:</Text>
                <Text style={styles.cardNumber}>{recipient.cardNumber}</Text>
              </View>
              {recipient.cardCurrency && (
                <View style={styles.currencyBadge}>
                  <Text style={styles.currencyBadgeText}>{recipient.cardCurrency}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        <FormInput
          label="Monto a recibir"
          placeholder={`100.00 ${cardCurrency}`}
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          required
        />

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

        <View style={styles.summaryCard}>
          {ratesLoading || locationsLoading ? (
            <View style={styles.rateLoading}>
              <ActivityIndicator size="small" color="#7C3AED" />
              <Text style={styles.rateLoadingText}>Cargando tasas...</Text>
            </View>
          ) : (
            <>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Monto a recibir:</Text>
                <Text style={styles.summaryValueReceive}>
                  {amountToReceive.toFixed(2)} {cardCurrency}
                </Text>
              </View>
              {deliveryCost > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Costo de mensajería:</Text>
                  <Text style={styles.summaryValue}>
                    {currencySymbol}{deliveryCost.toFixed(2)} {currency}
                  </Text>
                </View>
              )}
              <View style={styles.dividerSmall} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total a pagar:</Text>
                <Text style={styles.summaryValue}>
                  {currencySymbol}{totalAmount.toFixed(2)} {currency}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total a enviar:</Text>
                <Text style={styles.summaryValueLarge}>
                  {(amountToReceive + (deliveryCost * (exchangeRates && userCountry ? getExchangeRate(userCountry, cardCurrency, exchangeRates) : 1))).toFixed(2)} {cardCurrency}
                </Text>
              </View>
            </>
          )}
        </View>

        <Button
          title="Enviar por WhatsApp"
          onPress={handleSubmit}
          loading={loading}
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
    backgroundColor: '#7C3AED' + '15',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: '#7C3AED',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  cardInfo: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  cardNumber: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  currencyBadge: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  currencyBadgeText: {
    fontSize: 14,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
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
    gap: 16,
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
    color: '#7C3AED',
  },
  summaryValueReceive: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: Colors.secondary,
  },
  summaryValueLarge: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: Colors.secondary,
  },
  dividerSmall: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
  },
  rateLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rateLoadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
