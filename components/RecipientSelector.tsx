import { View, Text, Pressable, StyleSheet, FlatList, Modal } from 'react-native';
import { User, Plus, CreditCard, AlertTriangle } from 'lucide-react-native';
import { useState, useMemo } from 'react';
import { Recipient, CardCurrency } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { getColors } from '@/constants/colors';
import { useRouter } from 'expo-router';

interface RecipientSelectorProps {
  value: Recipient | null;
  onChange: (recipient: Recipient) => void;
  label: string;
  cardCurrency?: CardCurrency;
  onAddCardRequest?: (recipient: Recipient, cardType: CardCurrency) => void;
}

export default function RecipientSelector({ value, onChange, label, cardCurrency, onAddCardRequest }: RecipientSelectorProps) {
  const router = useRouter();
  const { recipients, theme } = useApp();
  const Colors = getColors(theme);
  const styles = useMemo(() => createStyles(Colors), [Colors]);
  const [showModal, setShowModal] = useState(false);
  const [showMissingCardModal, setShowMissingCardModal] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);

  const handleSelect = (recipient: Recipient) => {
    if (cardCurrency && (!recipient.cards || !recipient.cards[cardCurrency])) {
      setSelectedRecipient(recipient);
      setShowModal(false);
      setShowMissingCardModal(true);
      return;
    }
    onChange(recipient);
    setShowModal(false);
  };

  const handleAddCard = () => {
    setShowMissingCardModal(false);
    if (selectedRecipient && cardCurrency && onAddCardRequest) {
      onAddCardRequest(selectedRecipient, cardCurrency);
    }
  };

  const handleCancelAddCard = () => {
    setShowMissingCardModal(false);
    setSelectedRecipient(null);
    setShowModal(true);
  };

  const handleAddNew = () => {
    setShowModal(false);
    router.push('/add-recipient' as any);
  };

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <Pressable
          onPress={() => setShowModal(true)}
          style={({ pressed }) => [
            styles.selector,
            pressed && styles.selectorPressed,
          ]}
        >
          {value ? (
            <View style={styles.selectedInfo}>
              <View style={styles.avatar}>
                <User color={Colors.primary} size={20} />
              </View>
              <View style={styles.selectedText}>
                <Text style={styles.selectedName}>{value.name}</Text>
                <Text style={styles.selectedPhone}>{value.phone}</Text>
              </View>
            </View>
          ) : (
            <Text style={styles.placeholder}>Seleccionar destinatario</Text>
          )}
        </Pressable>
      </View>

      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Seleccionar Destinatario</Text>
            <Pressable onPress={() => setShowModal(false)} style={styles.closeButton}>
              <Text style={styles.closeText}>Cerrar</Text>
            </Pressable>
          </View>

          <FlatList
            data={recipients}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const hasCard = cardCurrency && item.cards && item.cards[cardCurrency];
              const cardInfo = hasCard && item.cards ? item.cards[cardCurrency] : null;
              return (
                <Pressable
                  onPress={() => handleSelect(item)}
                  style={({ pressed }) => [
                    styles.recipientItem,
                    pressed && styles.recipientItemPressed,
                    !hasCard && cardCurrency && styles.recipientItemNoCard,
                  ]}
                >
                  <View style={styles.avatar}>
                    <User color={Colors.primary} size={20} />
                  </View>
                  <View style={styles.recipientInfo}>
                    <Text style={styles.recipientName}>{item.name}</Text>
                    <Text style={styles.recipientPhone}>{item.phone}</Text>
                    {cardInfo && (
                      <View style={styles.cardBadge}>
                        <CreditCard color={Colors.textLight} size={12} />
                        <Text style={styles.cardBadgeText}>{cardInfo.number}</Text>
                      </View>
                    )}
                    {!hasCard && cardCurrency && (
                      <View style={styles.warningBadge}>
                        <AlertTriangle color="#F59E0B" size={12} />
                        <Text style={styles.warningBadgeText}>Sin tarjeta {cardCurrency}</Text>
                      </View>
                    )}
                  </View>
                </Pressable>
              );
            }}
            ListFooterComponent={
              <Pressable
                onPress={handleAddNew}
                style={({ pressed }) => [
                  styles.addButton,
                  pressed && styles.addButtonPressed,
                ]}
              >
                <Plus color={Colors.primary} size={24} />
                <Text style={styles.addButtonText}>Agregar Nuevo Destinatario</Text>
              </Pressable>
            }
          />
        </View>
      </Modal>

      <Modal
        visible={showMissingCardModal}
        animationType="fade"
        transparent
        onRequestClose={handleCancelAddCard}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.alertCard}>
            <View style={styles.alertIcon}>
              <AlertTriangle color="#F59E0B" size={48} />
            </View>
            <Text style={styles.alertTitle}>Tarjeta no disponible</Text>
            <Text style={styles.alertMessage}>
              El destinatario <Text style={styles.alertRecipientName}>{selectedRecipient?.name}</Text> no tiene guardada una tarjeta de tipo <Text style={styles.alertCurrency}>{cardCurrency}</Text>.
            </Text>
            <Text style={styles.alertQuestion}>¿Deseas agregarle esta tarjeta ahora?</Text>
            
            <View style={styles.alertButtons}>
              <Pressable
                onPress={handleCancelAddCard}
                style={({ pressed }) => [
                  styles.alertButton,
                  styles.alertButtonSecondary,
                  pressed && styles.alertButtonPressed,
                ]}
              >
                <Text style={styles.alertButtonTextSecondary}>Cancelar</Text>
              </Pressable>
              <Pressable
                onPress={handleAddCard}
                style={({ pressed }) => [
                  styles.alertButton,
                  styles.alertButtonPrimary,
                  pressed && styles.alertButtonPressed,
                ]}
              >
                <Text style={styles.alertButtonTextPrimary}>Agregar Tarjeta</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const createStyles = (Colors: ReturnType<typeof getColors>) => StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  selector: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    minHeight: 60,
    justifyContent: 'center',
  },
  selectorPressed: {
    opacity: 0.7,
  },
  placeholder: {
    fontSize: 16,
    color: Colors.textLight,
  },
  selectedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedText: {
    flex: 1,
  },
  selectedName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  selectedPhone: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  modal: {
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
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600' as const,
  },
  listContent: {
    padding: 16,
  },
  recipientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: 12,
  },
  recipientItemPressed: {
    opacity: 0.7,
  },
  recipientInfo: {
    flex: 1,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  recipientPhone: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  cardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  cardBadgeText: {
    fontSize: 12,
    color: Colors.textLight,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 20,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    marginTop: 8,
  },
  addButtonPressed: {
    opacity: 0.7,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.primary,
  },
  recipientItemNoCard: {
    opacity: 0.7,
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderStyle: 'dashed',
  },
  warningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  warningBadgeText: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '500' as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  alertIcon: {
    marginBottom: 16,
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  alertMessage: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  alertRecipientName: {
    fontWeight: 'bold' as const,
    color: Colors.text,
  },
  alertCurrency: {
    fontWeight: 'bold' as const,
    color: Colors.primary,
  },
  alertQuestion: {
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '600' as const,
  },
  alertButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  alertButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertButtonPrimary: {
    backgroundColor: Colors.primary,
  },
  alertButtonSecondary: {
    backgroundColor: Colors.border,
  },
  alertButtonPressed: {
    opacity: 0.7,
  },
  alertButtonTextPrimary: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  alertButtonTextSecondary: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
  },
});
