const LOCATIONS_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTTUEFJowlwOmmJQQj_O6MmHfeeaUtwYVTEL4Q99k9Rogt3dyUz8kCW8qv91Z1JxhXMmWu6WeGUkA1X/pub?output=csv';

export interface Location {
  province: string;
  municipality: string;
  deliveryCost: {
    'United States': number;
    'Europa': number;
    'Mexico': number;
  };
}

export interface LocationData {
  provinces: string[];
  municipalities: Record<string, string[]>;
  locations: Location[];
}

export async function fetchLocations(): Promise<LocationData> {
  try {
    console.log('[Locations] Fetching locations from CSV...');
    const response = await fetch(LOCATIONS_CSV_URL);
    const csvText = await response.text();
    
    const lines = csvText.split('\n').filter(line => line.trim());
    
    const locations: Location[] = [];
    const provinces = new Set<string>();
    const municipalities: Record<string, string[]> = {};
    
    for (let i = 1; i < lines.length; i++) {
      const columns = lines[i].split(',').map(col => col.trim());
      
      if (columns.length >= 5) {
        const province = columns[0];
        const municipality = columns[1];
        const costUS = parseFloat(columns[2]) || 0;
        const costEuropa = parseFloat(columns[3]) || 0;
        const costMexico = parseFloat(columns[4]) || 0;
        
        if (province && municipality) {
          provinces.add(province);
          
          if (!municipalities[province]) {
            municipalities[province] = [];
          }
          municipalities[province].push(municipality);
          
          locations.push({
            province,
            municipality,
            deliveryCost: {
              'United States': costUS,
              'Europa': costEuropa,
              'Mexico': costMexico,
            },
          });
        }
      }
    }
    
    console.log('[Locations] Fetched:', {
      provinces: provinces.size,
      locations: locations.length
    });
    
    return {
      provinces: Array.from(provinces),
      municipalities,
      locations,
    };
  } catch (error) {
    console.error('[Locations] Error fetching locations:', error);
    return {
      provinces: ['La Habana', 'Santiago de Cuba'],
      municipalities: {
        'La Habana': ['Plaza de la Revolución', 'Centro Habana'],
        'Santiago de Cuba': ['Santiago de Cuba'],
      },
      locations: [],
    };
  }
}

export function getDeliveryCost(
  province: string,
  municipality: string,
  country: string,
  locationData: LocationData
): number {
  console.log('[Locations] getDeliveryCost called with:', { province, municipality, country });
  console.log('[Locations] Total locations available:', locationData.locations.length);
  
  const location = locationData.locations.find(
    loc => loc.province === province && loc.municipality === municipality
  );
  
  if (!location) {
    console.warn('[Locations] Location not found:', { province, municipality });
    console.log('[Locations] Available locations:', locationData.locations.slice(0, 5));
    return 0;
  }
  
  console.log('[Locations] Location found:', location);
  
  let normalizedCountry: keyof Location['deliveryCost'];
  
  if (country.includes('Europe') || country === 'España' || country === 'Spain' || country === 'Europa') {
    normalizedCountry = 'Europa';
  } else if (country === 'Estados Unidos' || country === 'United States' || country === 'USA') {
    normalizedCountry = 'United States';
  } else if (country === 'México' || country === 'Mexico') {
    normalizedCountry = 'Mexico';
  } else {
    normalizedCountry = country as keyof Location['deliveryCost'];
  }
  
  console.log('[Locations] Normalized country:', normalizedCountry);
  
  const cost = location.deliveryCost[normalizedCountry] || 0;
  console.log('[Locations] Delivery cost:', cost);
  
  return cost;
}
