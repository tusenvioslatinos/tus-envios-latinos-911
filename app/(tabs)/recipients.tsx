import { View, Text, StyleSheet, FlatList, Pressable, Platform, TextInput } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Plus, User, Phone, MapPin, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { useApp, useFilteredRecipients } from '@/contexts/AppContext';
import Colors from '@/constants/colors';
import * as Haptics from 'expo-haptics';
import { Recipient } from '@/types';

export default function RecipientsScreen() {
  const router = useRouter();
  const { deleteRecipient } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const recipients = useFilteredRecipients(searchQuery);

  const handleDelete = async (id: string) => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    await deleteRecipient(id);
  };

  const handleAddRecipient = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/add-recipient' as any);
  };

  const renderRecipient = ({ item }: { item: Recipient }) => (
    <View style={styles.recipientCard}>
      <View style={styles.recipientInfo}>
        <View style={styles.avatarContainer}>
          <User color={Colors.primary} size={24} />
        </View>
        <View style={styles.recipientDetails}>
          <Text style={styles.recipientName}>{item.name}</Text>
          <View style={styles.detailRow}>
            <Phone color={Colors.textSecondary} size={14} />
            <Text style={styles.detailText}>{item.phone}</Text>
          </View>
          {item.province && (
            <View style={styles.detailRow}>
              <MapPin color={Colors.textSecondary} size={14} />
              <Text style={styles.detailText}>{item.province}</Text>
            </View>
          )}
        </View>
      </View>
      <Pressable
        onPress={() => handleDelete(item.id)}
        style={({ pressed }) => [
          styles.deleteButton,
          pressed && styles.deleteButtonPressed,
        ]}
      >
        <Trash2 color={Colors.error} size={20} />
      </Pressable>
    </View>
  );

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Destinatarios',
          headerRight: () => (
            <Pressable onPress={handleAddRecipient} style={styles.headerButton}>
              <Plus color={Colors.primary} size={24} />
            </Pressable>
          ),
        }} 
      />
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar destinatarios..."
            placeholderTextColor={Colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {recipients.length === 0 ? (
          <View style={styles.emptyContainer}>
            <User color={Colors.textLight} size={64} />
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'No hay resultados' : 'Sin destinatarios'}
            </Text>
            <Text style={styles.emptyText}>
              {searchQuery 
                ? 'Intenta con otro término de búsqueda'
                : 'Agrega destinatarios para enviar más rápido'
              }
            </Text>
            {!searchQuery && (
              <Pressable
                onPress={handleAddRecipient}
                style={styles.emptyButton}
              >
                <Plus color="#FFFFFF" size={20} />
                <Text style={styles.emptyButtonText}>Agregar Destinatario</Text>
              </Pressable>
            )}
          </View>
        ) : (
          <FlatList
            data={recipients}
            renderItem={renderRecipient}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerButton: {
    padding: 8,
    marginRight: 8,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchInput: {
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  listContent: {
    padding: 16,
  },
  recipientCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  recipientInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recipientDetails: {
    flex: 1,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  detailText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  deleteButton: {
    padding: 8,
  },
  deleteButtonPressed: {
    opacity: 0.5,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
});
