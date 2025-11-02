import { Linking } from 'react-native';
import { Order } from '@/types';
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

function formatOrderMessage(order: Omit<Order, 'id' | 'createdAt' | 'status'>): string {
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
  
  if (order.type === 'remittance-card' && order.recipient.cardNumber) {
    message += `Tarjeta: ${order.recipient.cardNumber}\n`;
    if (order.recipient.cardType) {
      message += `Tipo: ${order.recipient.cardType}\n`;
    }
  }
  
  message += `\n💰 *Detalles del Envío*\n`;
  message += `Monto: ${currencySymbol}${order.amount.toFixed(2)} ${order.currency}\n`;
  
  if (order.details) {
    if (order.type === 'food-combo' && order.details.comboName) {
      message += `Combo: ${order.details.comboName}\n`;
      if (order.details.items && order.details.items.length > 0) {
        message += `Productos: ${order.details.items.join(', ')}\n`;
      }
    }
    
    if (order.type === 'mobile-recharge' && order.details.rechargeAmount) {
      message += `Recarga: $${order.details.rechargeAmount}\n`;
      if (order.details.bonus) {
        message += `Bonificación: ${order.details.bonus}\n`;
      }
    }
  }
  
  message += `\n✅ _Pedido generado desde la app Tus Envíos Latinos_\n`;
  message += `⏰ ${new Date().toLocaleString('es-ES')}`;
  
  return message;
}
