const MOBILE_RECHARGE_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQUIlymoa-EqAC2eBjU7kRI40FeLzMqGJvuuWWBBpffmAlG32c1MXbXS4E29l3v-uk-Us8vRiptb2xp/pub?output=csv';

export interface MobileRechargeFromCSV {
  id: string;
  name: string;
  description: string;
  priceUSD: number;
  priceEUR: number;
  priceMXN: number;
  notes?: string;
}

export async function fetchMobileRecharges(): Promise<MobileRechargeFromCSV[]> {
  try {
    console.log('[MobileRecharge] Fetching mobile recharges from CSV...');
    const response = await fetch(MOBILE_RECHARGE_CSV_URL);
    const csvText = await response.text();
    
    const lines = csvText.split('\n').filter(line => line.trim());
    console.log('[MobileRecharge] Total lines:', lines.length);
    
    const recharges: MobileRechargeFromCSV[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const columns = lines[i].split(',').map(col => col.trim());
      console.log(`[MobileRecharge] Line ${i}:`, columns);
      
      if (columns.length >= 5) {
        const name = columns[0];
        const description = columns[1];
        const priceUSD = parseFloat(columns[2]) || 0;
        const priceEUR = parseFloat(columns[3]) || 0;
        const priceMXN = parseFloat(columns[4]) || 0;
        const notes = columns[5] || undefined;
        
        if (name && description) {
          recharges.push({
            id: `recharge-${i}`,
            name,
            description,
            priceUSD,
            priceEUR,
            priceMXN,
            notes,
          });
        }
      }
    }
    
    console.log('[MobileRecharge] Fetched recharges:', recharges.length);
    return recharges;
  } catch (error) {
    console.error('[MobileRecharge] Error fetching recharges:', error);
    return [];
  }
}

export function getRechargePriceForCurrency(
  recharge: MobileRechargeFromCSV,
  currency: 'USD' | 'EUR' | 'MXN'
): number {
  switch (currency) {
    case 'USD':
      return recharge.priceUSD;
    case 'EUR':
      return recharge.priceEUR;
    case 'MXN':
      return recharge.priceMXN;
    default:
      return recharge.priceUSD;
  }
}
