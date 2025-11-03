import { View, StyleSheet, ScrollView, Alert, Text, ActivityIndicator, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { X } from 'lucide-react-native';
import Colors from '@/constants/colors';
import FormInput from '@/components/FormInput';
import Button from '@/components/Button';
import RecipientSelector from '@/components/RecipientSelector';
import { Recipient, CardCurrency } from '@/types';
import { sendOrderViaWhatsApp } from '@/utils/whatsapp';
import { CURRENCY_SYMBOLS } from '@/constants/data';
import { useQuery } from '@tanstack/react-query';
import { fetchExchangeRates, getExchangeRate } from '@/services/exchangeRates';
import { fetchLocations, getDeliveryCost } from '@/services/locations';

export default function RemittanceCardScreen() {
  const router = useRouter();
  const { currency, userCountry, addOrder, updateRecipient } = useApp();
  const [loading, setLoading] = useState(false);
  
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [amount, setAmount] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderPhone, setSenderPhone] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<'CLASICA' | 'MLC' | 'CUP'>('MLC');
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [pendingRecipient, setPendingRecipient] = useState<Recipient | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [cardType, setCardType] = useState('');

  const currencySymbol = CURRENCY_SYMBOLS[currency];

  const { data: exchangeRates, isLoading: ratesLoading } = useQuery({
    queryKey: ['exchangeRates'],
    queryFn: fetchExchangeRates,
  });

  const { data: locationData, isLoading: locationsLoading } = useQuery({
    queryKey: ['locations'],
    queryFn: fetchLocations,
  });

  const cardCurrency = selectedCurrency;

  const deliveryCost = recipient && locationData && recipient.province && recipient.municipality
    ? getDeliveryCost(recipient.province, recipient.municipality, userCountry || '', locationData)
    : 0;

  const amountToReceive = amount ? parseFloat(amount) : 0;
  const exchangeRate = exchangeRates && userCountry
    ? getExchangeRate(userCountry, cardCurrency, exchangeRates)
    : 0;
  const totalToSend = amountToReceive && exchangeRate
    ? amountToReceive * exchangeRate
    : 0;
  const totalAmount = totalToSend + deliveryCost;

  const handleAddCardToRecipient = (recipientToUpdate: Recipient, cardCurrency: CardCurrency) => {
    console.log('[RemittanceCard] Request to add card:', cardCurrency, 'to recipient:', recipientToUpdate.name);
    setPendingRecipient(recipientToUpdate);
    setShowAddCardModal(true);
  };

  const handleSaveCard = async () => {
    if (!pendingRecipient) return;
    
    if (!cardNumber.trim()) {
      Alert.alert('Error', 'Ingresa el número de tarjeta');
      return;
    }

    try {
      const updatedCards = {
        ...pendingRecipient.cards,
        [selectedCurrency]: {
          number: cardNumber.trim(),
          type: cardType.trim() || undefined,
        },
      };

      await updateRecipient(pendingRecipient.id, { cards: updatedCards });
      
      const updatedRecipient = {
        ...pendingRecipient,
        cards: updatedCards,
      };
      
      setRecipient(updatedRecipient);
      setShowAddCardModal(false);
      setPendingRecipient(null);
      setCardNumber('');
      setCardType('');
      
      Alert.alert('Éxito', `Tarjeta ${selectedCurrency} agregada correctamente`);
    } catch (error) {
      console.error('[RemittanceCard] Error saving card:', error);
      Alert.alert('Error', 'No se pudo agregar la tarjeta. Intenta nuevamente.');
    }
  };

  const handleCloseAddCardModal = () => {
    setShowAddCardModal(false);
    setPendingRecipient(null);
    setCardNumber('');
    setCardType('');
  };

  const validate = () => {
    if (!recipient) {
      Alert.alert('Error', 'Selecciona un destinatario');
      return false;
    }
    if (!recipient.cards || !recipient.cards[selectedCurrency]) {
      Alert.alert('Error', `El destinatario debe tener una tarjeta de tipo ${selectedCurrency}`);
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
        details: {
          cardCurrency: selectedCurrency,
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
      <Stack.Screen options={{ title: 'Envío a Tarjeta' }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Recarga a Tarjeta</Text>
          <Text style={styles.infoText}>
            El dinero será depositado instantáneamente en la tarjeta bancaria del destinatario.
          </Text>
        </View>

        <View style={styles.currencySelector}>
          <Text style={styles.currencySelectorLabel}>Moneda a recibir:</Text>
          <View style={styles.currencyButtons}>
            {(['CLASICA', 'MLC', 'CUP'] as const).map((curr) => (
              <TouchableOpacity
                key={curr}
                style={[
                  styles.currencyButton,
                  selectedCurrency === curr && styles.currencyButtonActive
                ]}
                onPress={() => {
                  setSelectedCurrency(curr);
                  setRecipient(null);
                }}
              >
                <Text
                  style={[
                    styles.currencyButtonText,
                    selectedCurrency === curr && styles.currencyButtonTextActive
                  ]}
                >
                  {curr}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <RecipientSelector
          label="Destinatario"
          value={recipient}
          onChange={setRecipient}
          cardCurrency={selectedCurrency}
          onAddCardRequest={handleAddCardToRecipient}
        />

        {recipient?.cards?.[selectedCurrency] && (
          <View style={styles.cardInfo}>
            <View style={styles.cardRow}>
              <View>
                <Text style={styles.cardLabel}>Tarjeta {selectedCurrency}:</Text>
                <Text style={styles.cardNumber}>{recipient.cards[selectedCurrency].number}</Text>
                {recipient.cards[selectedCurrency].type && (
                  <Text style={styles.cardType}>{recipient.cards[selectedCurrency].type}</Text>
                )}
              </View>
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
              {deliveryCost > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Costo de mensajería:</Text>
                  <Text style={styles.summaryValue}>
                    {currencySymbol}{deliveryCost.toFixed(2)} {currency}
                  </Text>
                </View>
              )}
              {deliveryCost > 0 && <View style={styles.dividerSmall} />}
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total a pagar:</Text>
                <Text style={styles.summaryValue}>
                  {currencySymbol}{totalAmount.toFixed(2)} {currency}
                </Text>
              </View>
              {exchangeRate > 0 && (
                <Text style={styles.exchangeRateText}>
                  Tasa: 1 {currency} = {exchangeRate.toFixed(2)} {cardCurrency}
                </Text>
              )}
            </>
          )}
        </View>

        <Button
          title="Enviar por WhatsApp"
          onPress={handleSubmit}
          loading={loading}
        />
      </ScrollView>

      <Modal
        visible={showAddCardModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseAddCardModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Agregar Tarjeta {selectedCurrency}</Text>
            <Pressable onPress={handleCloseAddCardModal} style={styles.modalCloseButton}>
              <X color={Colors.text} size={24} />
            </Pressable>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.recipientInfo}>
              <Text style={styles.recipientInfoLabel}>Destinatario:</Text>
              <Text style={styles.recipientInfoValue}>{pendingRecipient?.name}</Text>
            </View>

            <FormInput
              label={`Número de Tarjeta ${selectedCurrency}`}
              placeholder="9225 XXXX XXXX XXXX"
              value={cardNumber}
              onChangeText={setCardNumber}
              keyboardType="numeric"
              required
            />

            <FormInput
              label="Tipo de Tarjeta (opcional)"
              placeholder="Débito, Crédito, etc."
              value={cardType}
              onChangeText={setCardType}
            />

            <View style={styles.modalButtons}>
              <Button
                title="Guardar Tarjeta"
                onPress={handleSaveCard}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
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
  cardType: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
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
  exchangeRateText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  currencySelector: {
    marginBottom: 20,
  },
  currencySelectorLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 12,
  },
  currencyButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  currencyButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  currencyButtonActive: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  currencyButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
  currencyButtonTextActive: {
    color: '#FFFFFF',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: Colors.text,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  recipientInfo: {
    backgroundColor: Colors.primaryLight + '15',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  recipientInfoLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  recipientInfoValue: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: Colors.text,
  },
  modalButtons: {
    marginTop: 20,
  },
});
