import { Linking } from 'react-native';
import { Order, CardCurrency } from '@/types';
import { CURRENCY_SYMBOLS } from '@/constants/data';

const WHATSAPP_NUMBER = '14023131333';

export async function sendOrderViaWhatsApp(order: Order) {
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

function formatFoodComboMessage(order: Order): string {
  const flag = getCountryFlag(order.senderCountry);
  const orderId = order.id;
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

function formatMobileRechargeMessage(order: Order): string {
  const flag = getCountryFlag(order.senderCountry);
  const orderId = order.id;
  const currencySymbol = CURRENCY_SYMBOLS[order.currency];
  
  let message = `${flag} *RESUMEN DE ENTREGA*\n`;
  message += `📝ID: ${orderId}\n`;
  message += `📱 Recarga: ${order.details?.rechargeName || ''}\n`;
  
  if (order.details?.rechargeDescription) {
    message += `📋 Descripción: ${order.details.rechargeDescription}\n`;
  }
  
  message += `☎️ Número: ${order.recipient.phone}\n`;
  message += `👤 Recibe: ${order.recipient.name}\n`;
  message += `👨‍⚕️ Envía: ${order.senderName}\n`;
  
  if (order.details?.notes) {
    message += `📝 Notas: ${order.details.notes}\n`;
  }
  
  message += `💰 Monto a pagar: ${currencySymbol}${order.amount.toFixed(2)} ${order.currency}`;
  
  return message;
}

function formatRemittanceCashMessage(order: Order): string {
  const flag = getCountryFlag(order.senderCountry);
  const orderId = order.id;
  const currencySymbol = CURRENCY_SYMBOLS[order.currency];
  const receiveCurrency = (order.details?.receiveCurrency as string) || 'USD';
  
  const address = order.recipient.address || '';
  const municipality = order.recipient.municipality || '';
  const province = order.recipient.province || '';
  const fullAddress = `${address}, ${municipality}, ${province}`;
  
  const messengingCost = order.details?.messengingCost || 0;
  const totalAmount = order.details?.totalAmount || order.amount;
  
  let message = `${flag} *RESUMEN DE ENTREGA*\n`;
  message += `📝ID: ${orderId}\n`;
  message += `💵Cantidad: ${order.details?.amountToReceive?.toFixed(2) || '0.00'} ${receiveCurrency}\n`;
  message += `🏘️Dirección: ${fullAddress}\n`;
  message += `👤Recibe: ${order.recipient.name}\n`;
  message += `📱Contacto: ${order.recipient.phone}\n`;
  message += `👨‍⚕️Envía: ${order.senderName}\n`;
  
  if (messengingCost > 0) {
    message += `🚚Mensajería: ${currencySymbol}${messengingCost.toFixed(2)} ${order.currency}\n`;
  } else {
    message += `🚚Mensajería: Gratis\n`;
  }
  
  message += `💰Monto a pagar: ${currencySymbol}${totalAmount.toFixed(2)} ${order.currency}`;
  
  return message;
}

function formatRemittanceCardMessage(order: Order): string {
  const flag = getCountryFlag(order.senderCountry);
  const orderId = order.id;
  const currencySymbol = CURRENCY_SYMBOLS[order.currency];
  const cardCurrency = (order.details?.cardCurrency as CardCurrency) || 'MLC';
  const card = order.recipient.cards?.[cardCurrency];
  
  let message = `${flag} *RESUMEN DE ENTREGA*\n`;
  message += `📝ID: ${orderId}\n`;
  message += `💳 Tarjeta ${cardCurrency}: ${card?.number || 'N/A'}\n`;
  
  if (card?.type) {
    message += `🏦 Tipo: ${card.type}\n`;
  }
  
  message += `💵 Cantidad: ${order.amount.toFixed(2)} ${cardCurrency}\n`;
  message += `👤 Recibe: ${order.recipient.name}\n`;
  message += `📱 Contacto: ${order.recipient.phone}\n`;
  message += `👨‍⚕️ Envía: ${order.senderName}\n`;
  message += `💰 Monto a pagar: ${currencySymbol}${order.amount.toFixed(2)} ${order.currency}`;
  
  return message;
}

function formatOrderMessage(order: Order): string {
  if (order.type === 'food-combo') {
    return formatFoodComboMessage(order);
  }
  
  if (order.type === 'remittance-cash') {
    return formatRemittanceCashMessage(order);
  }
  
  if (order.type === 'remittance-card') {
    return formatRemittanceCardMessage(order);
  }
  
  if (order.type === 'mobile-recharge') {
    return formatMobileRechargeMessage(order);
  }
  
  return '';
}

export async function openSupportWhatsApp() {
  const message = 'Necesito soporte para usar la aplicacion';
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
