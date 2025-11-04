import { View, StyleSheet, ScrollView, Alert, Text, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { getColors } from '@/constants/colors';
import FormInput from '@/components/FormInput';
import Button from '@/components/Button';
import RecipientSelector from '@/components/RecipientSelector';
import { Recipient } from '@/types';
import { sendOrderViaWhatsApp } from '@/utils/whatsapp';
import { CURRENCY_SYMBOLS } from '@/constants/data';
import { useQuery } from '@tanstack/react-query';
import { fetchExchangeRates, getExchangeRate, CardCurrency } from '@/services/exchangeRates';
import { fetchLocations, getDeliveryCost } from '@/services/locations';

export default function RemittanceCashScreen() {
  const router = useRouter();
  const { currency, userCountry, addOrder, theme } = useApp();
  const Colors = getColors(theme);
  const styles = useMemo(() => createStyles(Colors), [Colors]);
  const [loading, setLoading] = useState(false);
  
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [amount, setAmount] = useState('');
  const [receiveCurrency, setReceiveCurrency] = useState<CardCurrency>('USD');
  const [senderName, setSenderName] = useState('');

  const { data: exchangeRates, isLoading: ratesLoading } = useQuery({
    queryKey: ['exchangeRates'],
    queryFn: fetchExchangeRates,
  });

  const { data: locationData, isLoading: locationsLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: fetchLocations,
  });

  const messengingCost = recipient && locationData && recipient.province && recipient.municipality
    ? getDeliveryCost(recipient.province, recipient.municipality, userCountry || '', locationData)
    : 0;

  console.log('[RemittanceCash] recipient:', recipient ? { province: recipient.province, municipality: recipient.municipality } : null);
  console.log('[RemittanceCash] userCountry:', userCountry);

  const amountToReceive = amount ? parseFloat(amount) : 0;
  const exchangeRate = exchangeRates && userCountry
    ? getExchangeRate(userCountry, receiveCurrency, exchangeRates)
    : 0;
  
  console.log('[RemittanceCash] amountToReceive:', amountToReceive);
  console.log('[RemittanceCash] exchangeRate:', exchangeRate);
  console.log('[RemittanceCash] userCountry:', userCountry);
  console.log('[RemittanceCash] receiveCurrency:', receiveCurrency);
  
  const totalToSend = amountToReceive && exchangeRate
    ? amountToReceive * exchangeRate
    : 0;
  const totalAmount = totalToSend + messengingCost;
  
  console.log('[RemittanceCash] totalToSend:', totalToSend);
  console.log('[RemittanceCash] messengingCost:', messengingCost);
  console.log('[RemittanceCash] totalAmount:', totalAmount);

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
        senderCountry: userCountry || 'United States',
        details: {
          receiveCurrency: receiveCurrency,
          amountToReceive: amountToReceive,
          messengingCost: messengingCost,
          totalAmount: totalAmount,
        },
      });

      await sendOrderViaWhatsApp(order);
      
      router.back();
    } catch {
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
          label="Monto a recibir"
          placeholder={`100.00 ${receiveCurrency}`}
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

        <View style={styles.summaryCard}>
          {ratesLoading || locationsLoading ? (
            <View style={styles.rateLoading}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={styles.rateLoadingText}>Cargando tasas...</Text>
            </View>
          ) : (
            <>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Monto a recibir:</Text>
                <Text style={styles.summaryValueReceive}>
                  {amountToReceive.toFixed(2)} {receiveCurrency}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Monto a pagar:</Text>
                <Text style={styles.summaryValue}>
                  {currencySymbol}{totalToSend.toFixed(2)} {currency}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Mensajería:</Text>
                {messengingCost > 0 ? (
                  <Text style={styles.summaryValue}>
                    {currencySymbol}{messengingCost.toFixed(2)} {currency}
                  </Text>
                ) : (
                  <Text style={styles.summaryValueFree}>Gratis</Text>
                )}
              </View>
              <View style={styles.dividerSmall} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total a pagar:</Text>
                <Text style={styles.summaryValueLarge}>
                  {currencySymbol}{totalAmount.toFixed(2)} {currency}
                </Text>
              </View>
            </>
          )}
        </View>

        <Button
          title="Enviar Pedido"
          onPress={handleSubmit}
          loading={loading}
        />
      </ScrollView>
    </>
  );
}

const createStyles = (Colors: ReturnType<typeof getColors>) => StyleSheet.create({
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
  summaryValueLarge: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: Colors.primary,
  },
  summaryValueFree: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: Colors.success || '#22C55E',
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
  exchangeRateText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'center' as const,
  },
});
