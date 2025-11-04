import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { trpcClient } from '@/lib/trpc';

const STORAGE_KEY = '@admin_token';

interface Admin {
  id: string;
  email: string;
  name: string;
}

export const [AdminProvider, useAdmin] = createContextHook(() => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadToken();
  }, []);

  const loadToken = async () => {
    try {
      console.log('[AdminContext] Loading token from AsyncStorage...');
      const storedToken = await AsyncStorage.getItem(STORAGE_KEY);
      
      if (storedToken) {
        console.log('[AdminContext] Token found, verifying...');
        setToken(storedToken);
        
        try {
          const adminData = await trpcClient.auth.me.query();
          setAdmin(adminData);
          console.log('[AdminContext] Admin verified:', adminData.email);
        } catch (error) {
          console.error('[AdminContext] Token invalid, clearing...', error);
          await AsyncStorage.removeItem(STORAGE_KEY);
          setToken(null);
        }
      } else {
        console.log('[AdminContext] No token found');
      }
    } catch (error) {
      console.error('[AdminContext] Error loading token:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = useCallback(async (email: string, password: string) => {
    console.log('[AdminContext] Logging in:', email);
    
    try {
      const result = await trpcClient.auth.login.mutate({ email, password });
      
      setToken(result.token);
      setAdmin(result.admin);
      await AsyncStorage.setItem(STORAGE_KEY, result.token);
      
      console.log('[AdminContext] Login successful');
      return { success: true as const };
    } catch (error: any) {
      console.error('[AdminContext] Login failed:', error);
      return { 
        success: false as const, 
        error: error.message || 'Login failed' 
      };
    }
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    console.log('[AdminContext] Registering:', email);
    
    try {
      const result = await trpcClient.auth.register.mutate({ email, password, name });
      
      setToken(result.token);
      setAdmin(result.admin);
      await AsyncStorage.setItem(STORAGE_KEY, result.token);
      
      console.log('[AdminContext] Registration successful');
      return { success: true as const };
    } catch (error: any) {
      console.error('[AdminContext] Registration failed:', error);
      return { 
        success: false as const, 
        error: error.message || 'Registration failed' 
      };
    }
  }, []);

  const logout = useCallback(async () => {
    console.log('[AdminContext] Logging out');
    setToken(null);
    setAdmin(null);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  return useMemo(() => ({
    admin,
    token,
    isLoading,
    isAuthenticated: !!admin,
    login,
    register,
    logout,
  }), [admin, token, isLoading, login, register, logout]);
});
