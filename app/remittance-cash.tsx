import { View, StyleSheet, ScrollView, Alert, Text, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';
import FormInput from '@/components/FormInput';
import Button from '@/components/Button';
import RecipientSelector from '@/components/RecipientSelector';
import { CardCurrency, Recipient } from '@/types';
import { sendOrderViaWhatsApp } from '@/utils/whatsapp';
import { CURRENCY_SYMBOLS } from '@/constants/data';
import { useQuery } from '@tanstack/react-query';
import { fetchExchangeRates, calculateAmountToReceive } from '@/services/exchangeRates';

export default function RemittanceCashScreen() {
  const router = useRouter();
  const { currency, userCountry, addOrder } = useApp();
  const [loading, setLoading] = useState(false);
  
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [amount, setAmount] = useState('');
  const [receiveCurrency, setReceiveCurrency] = useState<CardCurrency>('CUP');
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [senderEmail, setSenderEmail] = useState('');

  const { data: exchangeRates, isLoading: ratesLoading } = useQuery({
    queryKey: ['exchangeRates'],
    queryFn: fetchExchangeRates,
  });

  const amountToReceive = amount && exchangeRates
    ? calculateAmountToReceive(parseFloat(amount), userCountry, receiveCurrency, exchangeRates)
    : 0;

  const currencySymbol = CURRENCY_SYMBOLS[currency];

  const validate = () => {
    if (!recipient) {
      Alert.alert('Error', 'Selecciona un destinatario');
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
        type: 'remittance-cash',
        recipient,
        amount: parseFloat(amount),
        currency,
        senderName: senderName.trim(),
        senderPhone: senderPhone.trim(),
        senderEmail: senderEmail.trim() || undefined,
        senderCountry: userCountry,
      });

      await sendOrderViaWhatsApp(order);
      
      Alert.alert(
        '¡Orden Enviada!',
        'Tu orden ha sido enviada por WhatsApp. Recibirás las instrucciones de pago.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar la orden. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Envío en Efectivo' }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Envío en Efectivo</Text>
          <Text style={styles.infoText}>
            El dinero será entregado en efectivo directamente a tu familia en Cuba.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Moneda a recibir</Text>
          <View style={styles.currencyButtons}>
            {(['USD', 'CUP'] as CardCurrency[]).map((curr) => (
              <Button
                key={curr}
                title={curr}
                onPress={() => setReceiveCurrency(curr)}
                variant={receiveCurrency === curr ? 'primary' : 'secondary'}
              />
            ))}
          </View>
        </View>

        <RecipientSelector
          label="Destinatario"
          value={recipient}
          onChange={setRecipient}
        />

        <FormInput
          label="Monto a enviar"
          placeholder={`${currencySymbol}100.00`}
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
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total a enviar:</Text>
            <Text style={styles.summaryValue}>
              {currencySymbol}{amount || '0.00'} {currency}
            </Text>
          </View>
          {ratesLoading ? (
            <View style={styles.rateLoading}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.rateLoadingText}>Cargando tasas...</Text>
            </View>
          ) : (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Monto a recibir:</Text>
              <Text style={styles.summaryValueReceive}>
                {amountToReceive.toFixed(2)} {receiveCurrency}
              </Text>
            </View>
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
    backgroundColor: Colors.primaryLight + '15',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: Colors.primary,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  currencyButtons: {
    flexDirection: 'row',
    gap: 12,
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
    color: Colors.primary,
  },
  summaryValueReceive: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: Colors.secondary,
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
