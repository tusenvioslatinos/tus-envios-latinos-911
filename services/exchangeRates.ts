const EXCHANGE_RATES_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQg6fZQxbXm1c_rKzeZHB69OpzWiBj_cVuQP1Gv0yC5vkjaM2gFCFBw7QZAwh0cfTMf8E2jvsD-ZO99/pub?gid=0&single=true&output=csv';

export type CardCurrency = 'CLASICA' | 'MLC' | 'CUP';

export interface ExchangeRates {
  'United States': {
    CLASICA: number;
    MLC: number;
    CUP: number;
  };
  'Mexico': {
    CLASICA: number;
    MLC: number;
    CUP: number;
  };
  'Europa': {
    CLASICA: number;
    MLC: number;
    CUP: number;
  };
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

export async function fetchExchangeRates(): Promise<ExchangeRates> {
  try {
    console.log('[ExchangeRates] Fetching exchange rates from CSV...');
    const response = await fetch(EXCHANGE_RATES_CSV_URL);
    const csvText = await response.text();
    
    const lines = csvText.split('\n').filter(line => line.trim());
    
    const rates: ExchangeRates = {
      'United States': { CLASICA: 0, MLC: 0, CUP: 0 },
      'Mexico': { CLASICA: 0, MLC: 0, CUP: 0 },
      'Europa': { CLASICA: 0, MLC: 0, CUP: 0 },
    };

    console.log('[ExchangeRates] Total lines:', lines.length);
    
    for (let i = 0; i < lines.length && i < 9; i++) {
      const columns = parseCSVLine(lines[i]);
      console.log(`[ExchangeRates] Line ${i}:`, columns);
      
      if (columns.length >= 3) {
        const value = parseFloat(columns[2]) || 0;
        console.log(`[ExchangeRates] Line ${i} value in column C:`, value);
        
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
      'United States': { CLASICA: 1.0, MLC: 1.0, CUP: 120 },
      'Mexico': { CLASICA: 0.95, MLC: 0.95, CUP: 115 },
      'Europa': { CLASICA: 0.90, MLC: 0.90, CUP: 110 },
    };
  }
}

export function getExchangeRate(
  country: string,
  cardCurrency: CardCurrency,
  rates: ExchangeRates
): number {
  let normalizedCountry = country;
  
  if (country.includes('Europe') || country === 'España' || country === 'Spain') {
    normalizedCountry = 'Europa';
  } else if (country === 'Estados Unidos' || country === 'USA') {
    normalizedCountry = 'United States';
  } else if (country === 'México') {
    normalizedCountry = 'Mexico';
  }
  
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
