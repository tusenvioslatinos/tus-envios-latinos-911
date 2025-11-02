import { View, StyleSheet, ScrollView, Alert, Text, Pressable } from 'react-native';
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
import { CURRENCY_SYMBOLS, RECHARGE_OPTIONS } from '@/constants/data';

export default function MobileRechargeScreen() {
  const router = useRouter();
  const { currency, userCountry, addOrder } = useApp();
  const [loading, setLoading] = useState(false);
  
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<string | null>(null);
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [senderEmail, setSenderEmail] = useState('');

  const currencySymbol = CURRENCY_SYMBOLS[currency];
  const rechargeOption = RECHARGE_OPTIONS.find(r => r.id === selectedAmount);

  const validate = () => {
    if (!recipient) {
      Alert.alert('Error', 'Selecciona un destinatario');
      return false;
    }
    if (!selectedAmount) {
      Alert.alert('Error', 'Selecciona un monto de recarga');
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
    if (!validate() || !recipient || !rechargeOption) return;
    
    setLoading(true);
    try {
      const order = await addOrder({
        type: 'mobile-recharge',
        recipient,
        amount: rechargeOption.amount,
        currency,
        senderName: senderName.trim(),
        senderPhone: senderPhone.trim(),
        senderEmail: senderEmail.trim() || undefined,
        senderCountry: userCountry,
        details: {
          rechargeAmount: rechargeOption.amount,
          bonus: rechargeOption.bonus,
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

        <Text style={styles.sectionLabel}>Selecciona el Monto</Text>
        <View style={styles.rechargeGrid}>
          {RECHARGE_OPTIONS.map((option) => (
            <Pressable
              key={option.id}
              onPress={() => setSelectedAmount(option.id)}
              style={({ pressed }) => [
                styles.rechargeCard,
                selectedAmount === option.id && styles.rechargeCardSelected,
                pressed && styles.rechargeCardPressed,
              ]}
            >
              {selectedAmount === option.id && (
                <View style={styles.checkIconSmall}>
                  <Check color="#FFFFFF" size={16} />
                </View>
              )}
              <Text style={[
                styles.rechargeAmount,
                selectedAmount === option.id && styles.rechargeAmountSelected,
              ]}>
                {currencySymbol}{option.amount}
              </Text>
              {option.bonus && (
                <View style={styles.bonusBadge}>
                  <Text style={styles.bonusText}>{option.bonus}</Text>
                </View>
              )}
            </Pressable>
          ))}
        </View>

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

        {rechargeOption && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total:</Text>
              <Text style={styles.summaryValue}>
                {currencySymbol}{rechargeOption.amount.toFixed(2)} {currency}
              </Text>
            </View>
            {rechargeOption.bonus && (
              <Text style={styles.bonusInfo}>+ Bonificación: {rechargeOption.bonus}</Text>
            )}
          </View>
        )}

        <Button
          title="Enviar por WhatsApp"
          onPress={handleSubmit}
          loading={loading}
          disabled={!selectedAmount}
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
  rechargeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  rechargeCard: {
    flex: 1,
    minWidth: '30%',
    aspectRatio: 1.3,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative' as const,
  },
  rechargeCardSelected: {
    borderColor: Colors.success,
    backgroundColor: Colors.success + '10',
  },
  rechargeCardPressed: {
    opacity: 0.7,
  },
  checkIconSmall: {
    position: 'absolute' as const,
    top: 8,
    right: 8,
    backgroundColor: Colors.success,
    borderRadius: 12,
    padding: 4,
  },
  rechargeAmount: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  rechargeAmountSelected: {
    color: Colors.success,
  },
  bonusBadge: {
    backgroundColor: Colors.warning,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 4,
  },
  bonusText: {
    fontSize: 11,
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
  bonusInfo: {
    fontSize: 14,
    color: Colors.warning,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
});
