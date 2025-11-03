const FOOD_COMBOS_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSM2A6ovvV7e_i7RPiWCcvULpVUzLIIQ8DJMI0EEAcDiOWPGgfDeBtlqYv1kDWox1gnNjL_X-WC0LiB/pub?output=csv';

export interface FoodComboFromCSV {
  id: string;
  name: string;
  description: string;
  priceUSD: number;
  priceEUR: number;
  priceMXN: number;
}

export async function fetchFoodCombos(): Promise<FoodComboFromCSV[]> {
  try {
    console.log('[FoodCombos] Fetching food combos from CSV...');
    const response = await fetch(FOOD_COMBOS_CSV_URL);
    const csvText = await response.text();
    
    const lines = csvText.split('\n').filter(line => line.trim());
    console.log('[FoodCombos] Total lines:', lines.length);
    
    const combos: FoodComboFromCSV[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const columns = lines[i].split(',').map(col => col.trim());
      console.log(`[FoodCombos] Line ${i}:`, columns);
      
      if (columns.length >= 5) {
        const name = columns[0];
        const description = columns[1];
        const priceUSD = parseFloat(columns[2]) || 0;
        const priceEUR = parseFloat(columns[3]) || 0;
        const priceMXN = parseFloat(columns[4]) || 0;
        
        if (name && description) {
          combos.push({
            id: `combo-${i}`,
            name,
            description,
            priceUSD,
            priceEUR,
            priceMXN,
          });
        }
      }
    }
    
    console.log('[FoodCombos] Fetched combos:', combos.length);
    return combos;
  } catch (error) {
    console.error('[FoodCombos] Error fetching combos:', error);
    return [];
  }
}

export function getComboPriceForCurrency(
  combo: FoodComboFromCSV,
  currency: 'USD' | 'EUR' | 'MXN'
): number {
  switch (currency) {
    case 'USD':
      return combo.priceUSD;
    case 'EUR':
      return combo.priceEUR;
    case 'MXN':
      return combo.priceMXN;
    default:
      return combo.priceUSD;
  }
}
