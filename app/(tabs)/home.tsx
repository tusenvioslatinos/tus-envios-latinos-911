import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { DollarSign, ShoppingBag, Smartphone, ArrowRight } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '@/contexts/AppContext';
import Colors from '@/constants/colors';
import { openSupportWhatsApp } from '@/utils/whatsapp';

import * as Haptics from 'expo-haptics';
import React from "react";

interface ServiceCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: [string, string];
  onPress: () => void;
}

function ServiceCard({ title, description, icon, gradient, onPress }: ServiceCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.serviceCard,
        pressed && styles.cardPressed,
      ]}
    >
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradient}
      >
        <View style={styles.cardContent}>
          <View style={styles.iconContainer}>
            {icon}
          </View>
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>{title}</Text>
            <Text style={styles.cardDescription}>{description}</Text>
          </View>
          <View style={styles.arrowContainer}>
            <ArrowRight color="rgba(255,255,255,0.9)" size={24} />
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { currency, userCountry } = useApp();

  const handleNavigation = (path: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(path as any);
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Servicios' }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.welcomeContainer}>
            <Text style={styles.welcomeText}>Bienvenido</Text>
            <Text style={styles.countryText}>{userCountry}</Text>
          </View>
          <View style={styles.currencyBadge}>
            <Text style={styles.currencyText}>{currency}</Text>
          </View>
        </View>

        <View style={styles.logoContainer}>
          <Image
            source={{ uri: 'https://pub-e001eb4506b145aa938b5d3badbff6a5.r2.dev/attachments/y4v9rui8pzmqgrrt8jo08' }}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.servicesContainer}>
          <Text style={styles.sectionTitle}>Nuestros Servicios</Text>
          
          <ServiceCard
            title="Envío en Efectivo"
            description="Dinero directo a manos de tu familia"
            icon={<DollarSign color="#FFFFFF" size={32} />}
            gradient={['#0066CC', '#004999']}
            onPress={() => handleNavigation('/remittance-cash')}
          />

          <ServiceCard
            title="Envío a Tarjeta"
            description="Recarga instantánea a tarjeta bancaria"
            icon={<DollarSign color="#FFFFFF" size={32} />}
            gradient={['#7C3AED', '#5B21B6']}
            onPress={() => handleNavigation('/remittance-card')}
          />

          <ServiceCard
            title="Combos de Comida"
            description="Alimentos de calidad para tus seres queridos"
            icon={<ShoppingBag color="#FFFFFF" size={32} />}
            gradient={['#FF6B35', '#E8491B']}
            onPress={() => handleNavigation('/food-combo')}
          />

          <ServiceCard
            title="Recarga Celular"
            description="Mantén conectada a tu familia"
            icon={<Smartphone color="#FFFFFF" size={32} />}
            gradient={['#10B981', '#059669']}
            onPress={() => handleNavigation('/mobile-recharge')}
          />
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>¿Necesitas ayuda?</Text>
          <Text style={styles.infoText}>
            Nuestro equipo está disponible para asistirte en todo momento
          </Text>
          <Pressable
            style={styles.infoButton}
            onPress={async () => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }
              await openSupportWhatsApp();
            }}
          >
            <Text style={styles.infoButtonText}>Contactar Soporte</Text>
          </Pressable>
        </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  welcomeContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  countryText: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: Colors.text,
  },
  currencyBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  currencyText: {
    fontSize: 14,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 20,
  },
  logo: {
    width: 200,
    height: 120,
  },
  servicesContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  serviceCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  cardPressed: {
    opacity: 0.95,
    transform: [{ scale: 0.98 }],
  },
  cardGradient: {
    padding: 20,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 18,
  },
  arrowContainer: {
    marginLeft: 8,
  },
  infoCard: {
    backgroundColor: Colors.surfaceAlt,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  infoButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  infoButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
});
