import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Currency, Recipient, Order, ThemeMode } from '@/types';
import { trpcClient } from '@/lib/trpc';

const STORAGE_KEYS = {
  RECIPIENTS: '@recipients',
  ORDERS: '@orders',
  CURRENCY: '@currency',
  USER_COUNTRY: '@user_country',
  THEME: '@theme',
};

export const [AppProvider, useApp] = createContextHook(() => {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [currency, setCurrency] = useState<Currency>('USD');
  const [userCountry, setUserCountry] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('[AppContext] Loading data from AsyncStorage...');
      const [storedRecipients, storedOrders, storedCurrency, storedCountry, storedTheme] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.RECIPIENTS),
        AsyncStorage.getItem(STORAGE_KEYS.ORDERS),
        AsyncStorage.getItem(STORAGE_KEYS.CURRENCY),
        AsyncStorage.getItem(STORAGE_KEYS.USER_COUNTRY),
        AsyncStorage.getItem(STORAGE_KEYS.THEME),
      ]);

      if (storedRecipients) {
        try {
          setRecipients(JSON.parse(storedRecipients));
          console.log('[AppContext] Recipients loaded:', JSON.parse(storedRecipients).length);
        } catch (e) {
          console.error('[AppContext] Error parsing recipients:', e);
        }
      }
      if (storedOrders) {
        try {
          setOrders(JSON.parse(storedOrders));
          console.log('[AppContext] Orders loaded:', JSON.parse(storedOrders).length);
        } catch (e) {
          console.error('[AppContext] Error parsing orders:', e);
        }
      }
      if (storedCurrency) {
        setCurrency(storedCurrency as Currency);
        console.log('[AppContext] Currency loaded:', storedCurrency);
      }
      if (storedCountry) {
        setUserCountry(storedCountry);
        console.log('[AppContext] Country loaded:', storedCountry);
      } else {
        console.log('[AppContext] No country stored, needs selection');
      }
      if (storedTheme) {
        setTheme(storedTheme as ThemeMode);
        console.log('[AppContext] Theme loaded:', storedTheme);
      }
      console.log('[AppContext] Data loaded successfully');
    } catch (error) {
      console.error('[AppContext] Error loading data:', error);
    } finally {
      setIsLoading(false);
      console.log('[AppContext] Loading complete');
    }
  };

  const addRecipient = useCallback(async (recipient: Omit<Recipient, 'id' | 'createdAt'>) => {
    const newRecipient: Recipient = {
      ...recipient,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...recipients, newRecipient];
    setRecipients(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.RECIPIENTS, JSON.stringify(updated));
    return newRecipient;
  }, [recipients]);

  const updateRecipient = useCallback(async (id: string, updates: Partial<Recipient>) => {
    const updated = recipients.map(r => r.id === id ? { ...r, ...updates } : r);
    setRecipients(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.RECIPIENTS, JSON.stringify(updated));
  }, [recipients]);

  const deleteRecipient = useCallback(async (id: string) => {
    const updated = recipients.filter(r => r.id !== id);
    setRecipients(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.RECIPIENTS, JSON.stringify(updated));
  }, [recipients]);

  const deleteOrder = useCallback(async (id: string) => {
    const updated = orders.filter(o => o.id !== id);
    setOrders(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));
  }, [orders]);

  const generateOrderId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = 'TEL';
    for (let i = 0; i < 6; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  };

  const addOrder = useCallback(async (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => {
    console.log('[AppContext] Creating order:', order.type);
    
    try {
      const createdOrder = await trpcClient.orders.create.mutate({
        type: order.type,
        recipientData: JSON.stringify(order.recipient),
        amount: order.amount,
        currency: order.currency,
        senderName: order.senderName,
        senderPhone: order.senderPhone,
        senderEmail: order.senderEmail,
        senderCountry: order.senderCountry,
        details: order.details ? JSON.stringify(order.details) : undefined,
      });

      console.log('[AppContext] Order created on backend:', createdOrder.id);

      const newOrder: Order = {
        ...order,
        id: createdOrder.id,
        status: createdOrder.status as 'pending' | 'processing' | 'completed' | 'cancelled',
        createdAt: createdOrder.createdAt,
      };

      const updated = [newOrder, ...orders];
      setOrders(updated);
      await AsyncStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));
      
      console.log('[AppContext] Order saved locally');
      return newOrder;
    } catch (error) {
      console.error('[AppContext] Error creating order:', error);
      
      const fallbackOrder: Order = {
        ...order,
        id: generateOrderId(),
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      const updated = [fallbackOrder, ...orders];
      setOrders(updated);
      await AsyncStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));
      
      console.log('[AppContext] Order saved locally (fallback)');
      return fallbackOrder;
    }
  }, [orders]);

  const updateCurrency = useCallback(async (newCurrency: Currency) => {
    setCurrency(newCurrency);
    await AsyncStorage.setItem(STORAGE_KEYS.CURRENCY, newCurrency);
  }, []);

  const updateUserCountry = useCallback(async (country: string) => {
    setUserCountry(country);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_COUNTRY, country);
    
    let newCurrency: Currency = 'EUR';
    
    const normalizedCountry = country.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    if (normalizedCountry.includes('united states') || normalizedCountry.includes('estados unidos')) {
      newCurrency = 'USD';
    } else if (normalizedCountry.includes('mexico')) {
      newCurrency = 'MXN';
    } else {
      newCurrency = 'EUR';
    }
    
    console.log('[AppContext] Country:', country, '→ Normalized:', normalizedCountry, '→ Currency:', newCurrency);
    await updateCurrency(newCurrency);
  }, [updateCurrency]);

  const updateTheme = useCallback(async (newTheme: ThemeMode) => {
    setTheme(newTheme);
    await AsyncStorage.setItem(STORAGE_KEYS.THEME, newTheme);
    console.log('[AppContext] Theme updated:', newTheme);
  }, []);

  return useMemo(() => ({
    recipients,
    orders,
    currency,
    userCountry,
    theme,
    isLoading,
    hasSelectedCountry: userCountry !== null,
    addRecipient,
    updateRecipient,
    deleteRecipient,
    addOrder,
    deleteOrder,
    updateCurrency,
    updateUserCountry,
    updateTheme,
  }), [recipients, orders, currency, userCountry, theme, isLoading, addRecipient, updateRecipient, deleteRecipient, addOrder, deleteOrder, updateCurrency, updateUserCountry, updateTheme]);
});

export const useFilteredRecipients = (searchQuery: string) => {
  const { recipients } = useApp();
  return useMemo(() => {
    if (!searchQuery) return recipients;
    const query = searchQuery.toLowerCase();
    return recipients.filter(r => 
      r.name.toLowerCase().includes(query) ||
      r.phone.includes(query)
    );
  }, [recipients, searchQuery]);
};

export const useRecentOrders = (limit: number = 10) => {
  const { orders } = useApp();
  return useMemo(() => orders.slice(0, limit), [orders, limit]);
};
