export type Currency = 'USD' | 'MXN' | 'EUR';

export type ThemeMode = 'light' | 'dark';

export type CardCurrency = 'CLASICA' | 'MLC' | 'CUP' | 'USD';

export type ServiceType = 'remittance-cash' | 'remittance-card' | 'food-combo' | 'mobile-recharge';

export interface CardInfo {
  number: string;
  type?: string;
}

export interface Recipient {
  id: string;
  name: string;
  phone: string;
  address?: string;
  cards?: {
    CLASICA?: CardInfo;
    MLC?: CardInfo;
    CUP?: CardInfo;
    USD?: CardInfo;
  };
  province?: string;
  municipality?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  type: ServiceType;
  recipient: Recipient;
  amount: number;
  currency: Currency;
  senderName: string;
  senderPhone?: string;
  senderEmail?: string;
  senderCountry: string;
  details?: any;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface FoodCombo {
  id: string;
  name: string;
  description: string;
  price: number;
  items: string[];
  imageUrl?: string;
}

export interface MobileRechargeOption {
  id: string;
  amount: number;
  bonus?: string;
}
