const EXCHANGE_RATES_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQg6fZQxbXm1c_rKzeZHB69OpzWiBj_cVuQP1Gv0yC5vkjaM2gFCFBw7QZAwh0cfTMf8E2jvsD-ZO99/pub?gid=0&single=true&output=csv';

export type CardCurrency = 'USD' | 'MLC' | 'CUP';

export interface ExchangeRates {
  'United States': {
    USD: number;
    MLC: number;
    CUP: number;
  };
  'Mexico': {
    USD: number;
    MLC: number;
    CUP: number;
  };
  'Europa': {
    USD: number;
    MLC: number;
    CUP: number;
  };
}

export async function fetchExchangeRates(): Promise<ExchangeRates> {
  try {
    console.log('[ExchangeRates] Fetching exchange rates from CSV...');
    const response = await fetch(EXCHANGE_RATES_CSV_URL);
    const csvText = await response.text();
    
    const lines = csvText.split('\n').filter(line => line.trim());
    
    const rates: ExchangeRates = {
      'United States': { USD: 0, MLC: 0, CUP: 0 },
      'Mexico': { USD: 0, MLC: 0, CUP: 0 },
      'Europa': { USD: 0, MLC: 0, CUP: 0 },
    };

    for (let i = 1; i < lines.length && i <= 9; i++) {
      const columns = lines[i].split(',');
      if (columns.length > 2) {
        const value = parseFloat(columns[2].trim()) || 0;
        
        if (i === 1) rates['United States'].USD = value;
        else if (i === 2) rates['United States'].MLC = value;
        else if (i === 3) rates['United States'].CUP = value;
        else if (i === 4) rates['Mexico'].USD = value;
        else if (i === 5) rates['Mexico'].MLC = value;
        else if (i === 6) rates['Mexico'].CUP = value;
        else if (i === 7) rates['Europa'].USD = value;
        else if (i === 8) rates['Europa'].MLC = value;
        else if (i === 9) rates['Europa'].CUP = value;
      }
    }
    
    console.log('[ExchangeRates] Fetched rates:', rates);
    return rates;
  } catch (error) {
    console.error('[ExchangeRates] Error fetching rates:', error);
    return {
      'United States': { USD: 1.0, MLC: 1.0, CUP: 120 },
      'Mexico': { USD: 0.95, MLC: 0.95, CUP: 115 },
      'Europa': { USD: 0.90, MLC: 0.90, CUP: 110 },
    };
  }
}

export function getExchangeRate(
  country: string,
  cardCurrency: CardCurrency,
  rates: ExchangeRates
): number {
  const normalizedCountry = country.includes('Europe') || country === 'España' || country === 'Spain' 
    ? 'Europa' 
    : country;
  
  const countryRates = rates[normalizedCountry as keyof ExchangeRates];
  
  if (!countryRates) {
    console.warn('[ExchangeRates] Unknown country:', country, 'using Europa rates');
    return rates['Europa'][cardCurrency];
  }
  
  return countryRates[cardCurrency];
}

export function calculateAmountToReceive(
  amountToSend: number,
  country: string,
  cardCurrency: CardCurrency,
  rates: ExchangeRates
): number {
  const rate = getExchangeRate(country, cardCurrency, rates);
  return amountToSend * rate;
}
