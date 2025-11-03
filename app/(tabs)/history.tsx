import { View, Text, StyleSheet, FlatList, Pressable, Alert, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { Package, Clock, Trash2 } from 'lucide-react-native';
import { useRecentOrders, useApp } from '@/contexts/AppContext';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';
import { CURRENCY_SYMBOLS } from '@/constants/data';
import { Order } from '@/types';

const SERVICE_NAMES: Record<string, string> = {
  'remittance-cash': 'Envío en Efectivo',
  'remittance-card': 'Envío a Tarjeta',
  'food-combo': 'Combo de Comida',
  'mobile-recharge': 'Recarga Celular',
};

export default function HistoryScreen() {
  const orders = useRecentOrders(50);
  const { deleteOrder } = useApp();

  const handleDelete = async (id: string, recipientName: string) => {
    Alert.alert(
      'Eliminar Orden',
      `¿Estás seguro de eliminar la orden de ${recipientName}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            if (Platform.OS !== 'web') {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
            await deleteOrder(id);
          },
        },
      ]
    );
  };

  const renderOrder = ({ item }: { item: Order }) => {
    const currencySymbol = CURRENCY_SYMBOLS[item.currency];
    const serviceName = SERVICE_NAMES[item.type] || item.type;
    const date = new Date(item.createdAt);
    const dateStr = date.toLocaleDateString('es-ES', { 
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    return (
      <View style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View style={styles.iconContainer}>
            <Package color={Colors.primary} size={20} />
          </View>
          <View style={styles.orderInfo}>
            <Text style={styles.serviceName}>{serviceName}</Text>
            <Text style={styles.recipientName}>{item.recipient.name}</Text>
          </View>
          <View style={styles.orderAmount}>
            <Text style={styles.amountText}>
              {currencySymbol}{item.amount.toFixed(2)}
            </Text>
          </View>
          <Pressable
            onPress={() => handleDelete(item.id, item.recipient.name)}
            style={({ pressed }) => [
              styles.deleteButton,
              pressed && styles.deleteButtonPressed,
            ]}
          >
            <Trash2 color={Colors.error} size={18} />
          </Pressable>
        </View>
        <View style={styles.orderFooter}>
          <View style={styles.dateContainer}>
            <Clock color={Colors.textLight} size={14} />
            <Text style={styles.dateText}>{dateStr}</Text>
          </View>
          <View style={[styles.statusBadge, getStatusStyle(item.status)]}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Historial de Envíos' }} />
      <View style={styles.container}>
        {orders.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Package color={Colors.textLight} size={64} />
            <Text style={styles.emptyTitle}>Sin envíos aún</Text>
            <Text style={styles.emptyText}>
              Tus envíos realizados aparecerán aquí
            </Text>
          </View>
        ) : (
          <FlatList
            data={orders}
            renderItem={renderOrder}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </>
  );
}

function getStatusStyle(status: string) {
  switch (status) {
    case 'completed':
      return { backgroundColor: Colors.success + '20' };
    case 'processing':
      return { backgroundColor: Colors.warning + '20' };
    case 'cancelled':
      return { backgroundColor: Colors.error + '20' };
    default:
      return { backgroundColor: Colors.textLight + '20' };
  }
}

function getStatusText(status: string) {
  switch (status) {
    case 'completed':
      return 'Completado';
    case 'processing':
      return 'Procesando';
    case 'cancelled':
      return 'Cancelado';
    default:
      return 'Pendiente';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  orderInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.text,
    marginBottom: 2,
  },
  recipientName: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  orderAmount: {
    alignItems: 'flex-end',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  deleteButtonPressed: {
    opacity: 0.5,
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: Colors.primary,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 13,
    color: Colors.textLight,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.text,
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
  },
});
