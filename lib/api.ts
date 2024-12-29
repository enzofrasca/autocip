import * as XLSX from 'xlsx';

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

export interface City {
  city: string;
}

export async function fetchData(): Promise<CityData> {
  const response = await fetch('https://web.breezway.com.br/webhook/display-table-antecip');
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  const data = await response.json();
  
  if (data.table === "empty") {
    return {};
  }
  
  return data.reduce((acc: CityData, person: Person) => {
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
  }, {});
}

export async function fetchCities(): Promise<City[]> {
  const response = await fetch('https://web.breezway.com.br/webhook/cities-table-antecip');
  if (!response.ok) {
    throw new Error('Failed to fetch cities');
  }
  return response.json();
}

export async function uploadData(data: { name: string; cpf: string; city: string }[]): Promise<void> {
  const response = await fetch('https://web.breezway.com.br/webhook/add-table-antecip', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to upload data');
  }
}

export async function addCity(cityName: string): Promise<void> {
  const response = await fetch('https://web.breezway.com.br/webhook/cities-add-antecip', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ city: cityName }),
  });

  if (!response.ok) {
    throw new Error('Failed to add city');
  }
}

export async function deleteCity(cityName: string): Promise<void> {
  const response = await fetch('https://web.breezway.com.br/webhook/cities-delete-antecip', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ city: cityName }),
  });

  if (!response.ok) {
    throw new Error('Failed to delete city');
  }
}

export async function clearCityTable(cityName: string): Promise<void> {
  const response = await fetch('https://web.breezway.com.br/webhook/delete-table-antecip', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ city: cityName }),
  });

  if (!response.ok) {
    throw new Error('Failed to clear city table');
  }
}

export function parseExcel(file: File): Promise<{ name: string; cpf: string }[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as { Name: string; CPF: string }[];

      if (!jsonData.every(row => 'Name' in row && 'CPF' in row)) {
        reject(new Error('Invalid file format. The Excel file must contain "Name" and "CPF" columns.'));
      }

      resolve(jsonData.map(row => ({ name: row.Name, cpf: row.CPF })));
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
}

