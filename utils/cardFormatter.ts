export const formatCardNumber = (text: string): string => {
  const cleaned = text.replace(/\D/g, '');
  const limited = cleaned.slice(0, 16);
  const formatted = limited.match(/.{1,4}/g)?.join('-') || limited;
  return formatted;
};

export const validateCardNumber = (cardNumber: string): boolean => {
  const cleaned = cardNumber.replace(/\D/g, '');
  return cleaned.length === 16;
};

export const isCardNumberComplete = (cardNumber: string): boolean => {
  const cleaned = cardNumber.replace(/\D/g, '');
  return cleaned.length === 16;
};
