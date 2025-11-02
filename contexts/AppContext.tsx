import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Currency, Recipient, Order } from '@/types';

const STORAGE_KEYS = {
  RECIPIENTS: '@recipients',
  ORDERS: '@orders',
  CURRENCY: '@currency',
  USER_COUNTRY: '@user_country',
};

export const [AppProvider, useApp] = createContextHook(() => {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [currency, setCurrency] = useState<Currency>('USD');
  const [userCountry, setUserCountry] = useState<string>('United States');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [storedRecipients, storedOrders, storedCurrency, storedCountry] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.RECIPIENTS),
        AsyncStorage.getItem(STORAGE_KEYS.ORDERS),
        AsyncStorage.getItem(STORAGE_KEYS.CURRENCY),
        AsyncStorage.getItem(STORAGE_KEYS.USER_COUNTRY),
      ]);

      if (storedRecipients) setRecipients(JSON.parse(storedRecipients));
      if (storedOrders) setOrders(JSON.parse(storedOrders));
      if (storedCurrency) setCurrency(storedCurrency as Currency);
      if (storedCountry) setUserCountry(storedCountry);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
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

  const addOrder = useCallback(async (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => {
    const newOrder: Order = {
      ...order,
      id: Date.now().toString(),
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    const updated = [newOrder, ...orders];
    setOrders(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));
    return newOrder;
  }, [orders]);

  const updateCurrency = useCallback(async (newCurrency: Currency) => {
    setCurrency(newCurrency);
    await AsyncStorage.setItem(STORAGE_KEYS.CURRENCY, newCurrency);
  }, []);

  const updateUserCountry = useCallback(async (country: string) => {
    setUserCountry(country);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_COUNTRY, country);
    
    const currencyMap: Record<string, Currency> = {
      'United States': 'USD',
      'Mexico': 'MXN',
    };
    const newCurrency = currencyMap[country] || 'EUR';
    await updateCurrency(newCurrency);
  }, [updateCurrency]);

  return useMemo(() => ({
    recipients,
    orders,
    currency,
    userCountry,
    isLoading,
    addRecipient,
    updateRecipient,
    deleteRecipient,
    addOrder,
    updateCurrency,
    updateUserCountry,
  }), [recipients, orders, currency, userCountry, isLoading, addRecipient, updateRecipient, deleteRecipient, addOrder, updateCurrency, updateUserCountry]);
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
