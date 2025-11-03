const COUNTRIES_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTTUEFJowlwOmmJQQj_O6MmHfeeaUtwYVTEL4Q99k9Rogt3dyUz8kCW8qv91Z1JxhXMmWu6WeGUkA1X/pub?output=csv';

export async function fetchCountries(): Promise<string[]> {
  try {
    console.log('[Countries] Fetching countries from CSV...');
    const response = await fetch(COUNTRIES_CSV_URL);
    const csvText = await response.text();
    
    const lines = csvText.split('\n').filter(line => line.trim());
    
    const countries: string[] = [];
    for (let i = 1; i < lines.length; i++) {
      const columns = lines[i].split(',');
      if (columns.length > 5 && columns[5].trim()) {
        countries.push(columns[5].trim());
      }
    }
    
    const uniqueCountries = Array.from(new Set(countries));
    console.log('[Countries] Fetched countries:', uniqueCountries.length);
    return uniqueCountries;
  } catch (error) {
    console.error('[Countries] Error fetching countries:', error);
    return ['United States', 'Mexico', 'España'];
  }
}
