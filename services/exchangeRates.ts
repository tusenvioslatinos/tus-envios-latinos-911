const EXCHANGE_RATES_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQg6fZQxbXm1c_rKzeZHB69OpzWiBj_cVuQP1Gv0yC5vkjaM2gFCFBw7QZAwh0cfTMf8E2jvsD-ZO99/pub?gid=0&single=true&output=csv';

export type CardCurrency = 'CLASICA' | 'MLC' | 'CUP' | 'USD';

export interface ExchangeRates {
  'United States': {
    CLASICA: number;
    MLC: number;
    CUP: number;
    USD: number;
  };
  'Mexico': {
    CLASICA: number;
    MLC: number;
    CUP: number;
    USD: number;
  };
  'Europa': {
    CLASICA: number;
    MLC: number;
    CUP: number;
    USD: number;
  };
}

export async function fetchExchangeRates(): Promise<ExchangeRates> {
  try {
    console.log('[ExchangeRates] Fetching exchange rates from CSV...');
    const response = await fetch(EXCHANGE_RATES_CSV_URL);
    const csvText = await response.text();
    
    const lines = csvText.split('\n').filter(line => line.trim());
    
    const rates: ExchangeRates = {
      'United States': { CLASICA: 0, MLC: 0, CUP: 0, USD: 1 },
      'Mexico': { CLASICA: 0, MLC: 0, CUP: 0, USD: 1 },
      'Europa': { CLASICA: 0, MLC: 0, CUP: 0, USD: 1 },
    };

    console.log('[ExchangeRates] Total lines:', lines.length);
    
    for (let i = 0; i < lines.length && i < 9; i++) {
      const line = lines[i];
      console.log(`[ExchangeRates] Processing line ${i}:`, line);
      
      const parts = line.split(',');
      if (parts.length >= 3) {
        const country = parts[0].replace(/"/g, '').trim();
        const currencyType = parts[1].replace(/"/g, '').trim();
        
        let value = 0;
        const remainingParts = parts.slice(2).join('.').replace(/"/g, '').trim();
        value = parseFloat(remainingParts) || 0;
        
        console.log(`[ExchangeRates] Line ${i}: country=${country}, currency=${currencyType}, value=${value}`);
        
        if (i === 0) rates['United States'].CLASICA = value;
        else if (i === 1) rates['United States'].MLC = value;
        else if (i === 2) rates['United States'].CUP = value;
        else if (i === 3) rates['Mexico'].CLASICA = value;
        else if (i === 4) rates['Mexico'].MLC = value;
        else if (i === 5) rates['Mexico'].CUP = value;
        else if (i === 6) rates['Europa'].CLASICA = value;
        else if (i === 7) rates['Europa'].MLC = value;
        else if (i === 8) rates['Europa'].CUP = value;
      }
    }
    
    console.log('[ExchangeRates] Fetched rates:', rates);
    return rates;
  } catch (error) {
    console.error('[ExchangeRates] Error fetching rates:', error);
    return {
      'United States': { CLASICA: 1.0, MLC: 1.0, CUP: 120, USD: 1 },
      'Mexico': { CLASICA: 0.95, MLC: 0.95, CUP: 115, USD: 1 },
      'Europa': { CLASICA: 0.90, MLC: 0.90, CUP: 110, USD: 1 },
    };
  }
}

export function getExchangeRate(
  country: string,
  cardCurrency: CardCurrency,
  rates: ExchangeRates
): number {
  let normalizedCountry = country;
  
  const normalizedInput = country.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  if (normalizedInput.includes('europe') || normalizedInput.includes('europa') || normalizedInput.includes('espana') || normalizedInput.includes('spain')) {
    normalizedCountry = 'Europa';
  } else if (normalizedInput.includes('estados unidos') || normalizedInput.includes('united states') || normalizedInput.includes('usa')) {
    normalizedCountry = 'United States';
  } else if (normalizedInput.includes('mexico')) {
    normalizedCountry = 'Mexico';
  }
  
  const countryRates = rates[normalizedCountry as keyof ExchangeRates];
  
  if (!countryRates) {
    console.warn('[ExchangeRates] Unknown country:', country, 'using Europa rates');
    return rates['Europa'][cardCurrency];
  }
  
  console.log(`[ExchangeRates] Country: ${country} → ${normalizedCountry}, Currency: ${cardCurrency}, Rate: ${countryRates[cardCurrency]}`);
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
