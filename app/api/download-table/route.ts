import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function POST(req: NextRequest) {
  try {
    const { city, people } = await req.json();

    // Create a new workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(people.map((person: any) => ({
      Name: person.name,
      CPF: person.cpf,
      Margin: person.margin != null ? person.margin.toFixed(2) : 'N/A'
    })));

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

    // Generate buffer
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });

    // Set headers for file download
    const headers = new Headers();
    headers.append('Content-Disposition', `attachment; filename="${city}_Table.xlsx"`);
    headers.append('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    // Return the Excel file as a downloadable response
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: headers,
    });
  } catch (error) {
    console.error('Error generating Excel file:', error);
    return NextResponse.json({ error: 'Failed to generate Excel file' }, { status: 500 });
  }
}

