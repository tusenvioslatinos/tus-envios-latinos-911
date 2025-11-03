import { Linking } from 'react-native';
import { Order, CardCurrency } from '@/types';
import { CURRENCY_SYMBOLS } from '@/constants/data';

const WHATSAPP_NUMBER = '14023131333';

export async function sendOrderViaWhatsApp(order: Omit<Order, 'id' | 'createdAt' | 'status'>) {
  const message = formatOrderMessage(order);
  const url = `whatsapp://send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}`;
  
  const canOpen = await Linking.canOpenURL(url);
  if (canOpen) {
    await Linking.openURL(url);
    return true;
  } else {
    const webUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    await Linking.openURL(webUrl);
    return true;
  }
}

function generateRandomId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = 'TEL';
  for (let i = 0; i < 3; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

function getCountryFlag(country: string): string {
  const normalizedCountry = country.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  if (normalizedCountry.includes('united states') || normalizedCountry.includes('estados unidos')) {
    return '🇺🇸';
  } else if (normalizedCountry.includes('mexico')) {
    return '🇲🇽';
  } else {
    return '🇪🇺';
  }
}

function formatFoodComboMessage(order: Omit<Order, 'id' | 'createdAt' | 'status'>): string {
  const flag = getCountryFlag(order.senderCountry);
  const orderId = generateRandomId();
  const currencySymbol = CURRENCY_SYMBOLS[order.currency];
  
  let message = `${flag} *RESUMEN DE ENTREGA*\n`;
  message += `📝ID: ${orderId}\n`;
  message += `🍽️ Combo: ${order.details?.comboDescription || order.details?.comboName || ''}\n`;
  message += `🏘️ Dirección: ${order.recipient.address || ''}, ${order.recipient.municipality || ''}, ${order.recipient.province || ''}\n`;
  message += `👤 Recibe: ${order.recipient.name}\n`;
  message += `📱 Contacto: ${order.recipient.phone}\n`;
  message += `👨‍⚕️ Envía: ${order.senderName}\n`;
  message += `💰 Monto a pagar: ${currencySymbol}${order.amount.toFixed(2)} ${order.currency}`;
  
  return message;
}

function formatOrderMessage(order: Omit<Order, 'id' | 'createdAt' | 'status'>): string {
  if (order.type === 'food-combo') {
    return formatFoodComboMessage(order);
  }
  
  const currencySymbol = CURRENCY_SYMBOLS[order.currency];
  const serviceNames: Record<string, string> = {
    'remittance-cash': 'Envío en Efectivo',
    'remittance-card': 'Envío a Tarjeta',
    'food-combo': 'Combo de Comida',
    'mobile-recharge': 'Recarga Celular',
  };

  let message = `🚀 *NUEVA ORDEN - ${serviceNames[order.type]}*\n\n`;
  
  message += `📋 *Información del Remitente*\n`;
  message += `Nombre: ${order.senderName}\n`;
  message += `Teléfono: ${order.senderPhone}\n`;
  if (order.senderEmail) {
    message += `Email: ${order.senderEmail}\n`;
  }
  message += `País: ${order.senderCountry}\n\n`;
  
  message += `👤 *Información del Destinatario*\n`;
  message += `Nombre: ${order.recipient.name}\n`;
  message += `Teléfono: ${order.recipient.phone}\n`;
  
  if (order.type === 'remittance-cash' && order.recipient.address) {
    message += `Dirección: ${order.recipient.address}\n`;
    if (order.recipient.province) {
      message += `Provincia: ${order.recipient.province}\n`;
    }
    if (order.recipient.municipality) {
      message += `Municipio: ${order.recipient.municipality}\n`;
    }
  }
  
  if (order.type === 'remittance-card' && order.details?.cardCurrency) {
    const cardCurrency = order.details.cardCurrency as CardCurrency;
    const card = order.recipient.cards?.[cardCurrency];
    if (card) {
      message += `Tarjeta ${cardCurrency}: ${card.number}\n`;
      if (card.type) {
        message += `Tipo: ${card.type}\n`;
      }
    }
  }
  
  message += `\n💰 *Detalles del Envío*\n`;
  message += `Monto: ${currencySymbol}${order.amount.toFixed(2)} ${order.currency}\n`;
  
  if (order.details) {
    if (order.type === 'mobile-recharge' && order.details.rechargeAmount) {
      message += `Recarga: ${order.details.rechargeAmount}\n`;
      if (order.details.bonus) {
        message += `Bonificación: ${order.details.bonus}\n`;
      }
    }
  }
  
  message += `\n✅ _Pedido generado desde la app Tus Envíos Latinos_\n`;
  message += `⏰ ${new Date().toLocaleString('es-ES')}`;
  
  return message;
}
