import { View, Text, Pressable, StyleSheet, FlatList, Modal } from 'react-native';
import { User, Plus, CreditCard } from 'lucide-react-native';
import { useState, useMemo } from 'react';
import { Recipient, CardCurrency } from '@/types';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';
import { useRouter } from 'expo-router';

interface RecipientSelectorProps {
  value: Recipient | null;
  onChange: (recipient: Recipient) => void;
  label: string;
  cardCurrency?: CardCurrency;
}

export default function RecipientSelector({ value, onChange, label, cardCurrency }: RecipientSelectorProps) {
  const router = useRouter();
  const { recipients } = useApp();
  const [showModal, setShowModal] = useState(false);

  const filteredRecipients = useMemo(() => {
    if (!cardCurrency) return recipients;
    return recipients.filter(r => r.cards && r.cards[cardCurrency]);
  }, [recipients, cardCurrency]);

  const handleSelect = (recipient: Recipient) => {
    onChange(recipient);
    setShowModal(false);
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
            data={filteredRecipients}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const cardInfo = cardCurrency && item.cards ? item.cards[cardCurrency] : null;
              return (
                <Pressable
                  onPress={() => handleSelect(item)}
                  style={({ pressed }) => [
                    styles.recipientItem,
                    pressed && styles.recipientItemPressed,
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
    </>
  );
}

const styles = StyleSheet.create({
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
});
