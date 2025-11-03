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
import { fetchMobileRecharges, getRechargePriceForCurrency } from '@/services/mobileRecharge';

export default function MobileRechargeScreen() {
  const router = useRouter();
  const { currency, userCountry, addOrder } = useApp();
  const [loading, setLoading] = useState(false);
  
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [selectedRecharge, setSelectedRecharge] = useState<string | null>(null);
  const [senderName, setSenderName] = useState('');

  const { data: recharges, isLoading: rechargesLoading } = useQuery({
    queryKey: ['mobileRecharges'],
    queryFn: fetchMobileRecharges,
  });

  const currencySymbol = CURRENCY_SYMBOLS[currency];
  const recharge = recharges?.find(r => r.id === selectedRecharge);
  const rechargePrice = recharge ? getRechargePriceForCurrency(recharge, currency) : 0;

  const validate = () => {
    if (!recipient) {
      Alert.alert('Error', 'Selecciona un destinatario');
      return false;
    }
    if (!selectedRecharge) {
      Alert.alert('Error', 'Selecciona una recarga');
      return false;
    }
    if (!senderName.trim()) {
      Alert.alert('Error', 'Ingresa tu nombre');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate() || !recipient || !recharge) return;
    
    setLoading(true);
    try {
      const order = await addOrder({
        type: 'mobile-recharge',
        recipient,
        amount: rechargePrice,
        currency,
        senderName: senderName.trim(),
        senderCountry: userCountry || 'United States',
        details: {
          rechargeName: recharge.name,
          rechargeDescription: recharge.description,
          notes: recharge.notes,
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
      <Stack.Screen options={{ title: 'Recarga Celular' }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Recarga de Celular</Text>
          <Text style={styles.infoText}>
            Mantén conectada a tu familia con recargas rápidas al número de teléfono en Cuba.
          </Text>
        </View>

        <RecipientSelector
          label="Destinatario"
          value={recipient}
          onChange={setRecipient}
        />

        {recipient && (
          <View style={styles.phoneInfo}>
            <Text style={styles.phoneLabel}>Número a recargar:</Text>
            <Text style={styles.phoneNumber}>{recipient.phone}</Text>
          </View>
        )}

        {rechargesLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.success} />
            <Text style={styles.loadingText}>Cargando recargas...</Text>
          </View>
        ) : recharges && recharges.length > 0 ? (
          <>
            <Text style={styles.sectionLabel}>Selecciona una Recarga</Text>
            {recharges.map((item) => {
              const price = getRechargePriceForCurrency(item, currency);
              return (
                <Pressable
                  key={item.id}
                  onPress={() => setSelectedRecharge(item.id)}
                  style={({ pressed }) => [
                    styles.rechargeCard,
                    selectedRecharge === item.id && styles.rechargeCardSelected,
                    pressed && styles.rechargeCardPressed,
                  ]}
                >
                  <View style={styles.rechargeHeader}>
                    <View style={styles.rechargeInfo}>
                      <Text style={styles.rechargeName}>{item.name}</Text>
                      <Text style={styles.rechargeDescription}>{item.description}</Text>
                      {item.notes && (
                        <Text style={styles.rechargeNotes}>{item.notes}</Text>
                      )}
                    </View>
                    <View style={styles.rechargePrice}>
                      <Text style={styles.rechargePriceText}>{currencySymbol}{price.toFixed(2)}</Text>
                    </View>
                    {selectedRecharge === item.id && (
                      <View style={styles.checkIcon}>
                        <Check color={Colors.success} size={24} />
                      </View>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay recargas disponibles</Text>
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

        {recharge && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total:</Text>
              <Text style={styles.summaryValue}>
                {currencySymbol}{rechargePrice.toFixed(2)} {currency}
              </Text>
            </View>
          </View>
        )}

        <Button
          title="Enviar Pedido"
          onPress={handleSubmit}
          loading={loading}
          disabled={!selectedRecharge || rechargesLoading}
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
    backgroundColor: Colors.success + '15',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: Colors.success,
    marginBottom: 6,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  phoneInfo: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  phoneLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  phoneNumber: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  rechargeCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  rechargeCardSelected: {
    borderColor: Colors.success,
    backgroundColor: Colors.success + '10',
  },
  rechargeCardPressed: {
    opacity: 0.7,
  },
  rechargeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    position: 'relative' as const,
  },
  rechargeInfo: {
    flex: 1,
    marginRight: 8,
  },
  rechargeName: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  rechargeDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  rechargeNotes: {
    fontSize: 12,
    color: Colors.warning,
    fontStyle: 'italic' as const,
    marginTop: 4,
  },
  rechargePrice: {
    backgroundColor: Colors.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  rechargePriceText: {
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
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: Colors.success,
  },

});
