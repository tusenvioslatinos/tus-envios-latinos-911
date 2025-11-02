import { FoodCombo, MobileRechargeOption } from '@/types';

export const FOOD_COMBOS: FoodCombo[] = [
  {
    id: '1',
    name: 'Combo Básico',
    description: 'Lo esencial para tu familia',
    price: 50,
    items: ['Arroz 5 lb', 'Frijoles 2 lb', 'Aceite 1 L', 'Azúcar 3 lb', 'Pollo 3 lb'],
  },
  {
    id: '2',
    name: 'Combo Familiar',
    description: 'Alimentos para toda la semana',
    price: 85,
    items: ['Arroz 10 lb', 'Frijoles 4 lb', 'Aceite 2 L', 'Azúcar 5 lb', 'Pollo 5 lb', 'Pasta 3 lb', 'Salsa de tomate', 'Sal y especias'],
  },
  {
    id: '3',
    name: 'Combo Premium',
    description: 'Lo mejor para los tuyos',
    price: 120,
    items: ['Arroz 15 lb', 'Frijoles 6 lb', 'Aceite 3 L', 'Azúcar 8 lb', 'Pollo 8 lb', 'Carne de res 3 lb', 'Pasta 5 lb', 'Salsa de tomate 2x', 'Café 1 lb', 'Leche en polvo', 'Sal y especias'],
  },
  {
    id: '4',
    name: 'Combo Desayuno',
    description: 'Para empezar el día con energía',
    price: 45,
    items: ['Café 1 lb', 'Leche en polvo 2 lb', 'Azúcar 3 lb', 'Pan dulce', 'Mantequilla', 'Mermelada'],
  },
  {
    id: '5',
    name: 'Combo Higiene',
    description: 'Productos de limpieza esenciales',
    price: 40,
    items: ['Jabón de baño 4x', 'Champú', 'Pasta dental 2x', 'Detergente 2 lb', 'Cloro', 'Papel higiénico 4 rollos'],
  },
];

export const RECHARGE_OPTIONS: MobileRechargeOption[] = [
  { id: '1', amount: 5 },
  { id: '2', amount: 10, bonus: '+5 CUP' },
  { id: '3', amount: 20, bonus: '+10 CUP' },
  { id: '4', amount: 30, bonus: '+20 CUP' },
  { id: '5', amount: 50, bonus: '+35 CUP' },
  { id: '6', amount: 100, bonus: '+80 CUP' },
];

export const CUBAN_PROVINCES = [
  'Pinar del Río',
  'Artemisa',
  'La Habana',
  'Mayabeque',
  'Matanzas',
  'Cienfuegos',
  'Villa Clara',
  'Sancti Spíritus',
  'Ciego de Ávila',
  'Camagüey',
  'Las Tunas',
  'Holguín',
  'Granma',
  'Santiago de Cuba',
  'Guantánamo',
  'Isla de la Juventud',
];

export const COUNTRIES = [
  { name: 'United States', currency: 'USD' as const, flag: '🇺🇸' },
  { name: 'Mexico', currency: 'MXN' as const, flag: '🇲🇽' },
  { name: 'Spain', currency: 'EUR' as const, flag: '🇪🇸' },
  { name: 'Germany', currency: 'EUR' as const, flag: '🇩🇪' },
  { name: 'France', currency: 'EUR' as const, flag: '🇫🇷' },
  { name: 'Italy', currency: 'EUR' as const, flag: '🇮🇹' },
  { name: 'United Kingdom', currency: 'EUR' as const, flag: '🇬🇧' },
];

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  MXN: '$',
  EUR: '€',
};
