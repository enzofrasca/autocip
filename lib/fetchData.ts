export interface Person {
  id: string;
  cpf: string;
  name: string;
  margin: number | null;
  city: string;
}

export interface CityData {
  [city: string]: Person[];
}

export async function fetchData(): Promise<CityData> {
  const response = await fetch('https://web.breezway.com.br/webhook/display-table-antecip');
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  const data: Person[] = await response.json();
  
  // Group by city and ensure all properties are valid
  return data.reduce((acc, person) => {
    const city = person.city || 'Unknown';
    if (!acc[city]) {
      acc[city] = [];
    }
    acc[city].push({
      ...person,
      id: person.id || `${Date.now()}-${Math.random()}`,
      cpf: person.cpf || 'N/A',
      name: person.name || 'Unknown',
      margin: person.margin != null ? person.margin : null,
      city: city
    });
    return acc;
  }, {} as CityData);
}

