import * as XLSX from 'xlsx';

export interface OrderData {
  cliente: string;
  tipoOrden: string;
  detalle: string;
  distrito: string;
  servicio: string;
  situacion: string;
  situacionCable: string;
  lugar: string;
  fechaRecep: string;
  fechaEjec: string;
  diasEspera: number;
  estadoOS: string;
}

// services/excelService.ts

export const fetchExcelData = async (url: string) => {
  try {
    const downloadUrl = url.includes('/edit') ? url.split('/edit')[0] + '/export?format=xlsx' : url;
    const response = await fetch(downloadUrl);
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    const sheetName = workbook.SheetNames.find(n => n.toUpperCase().includes("HOJA 2") || n.toUpperCase().includes("ORDENES"));
    const sheet = workbook.Sheets[sheetName || ""];

    // IMPORTANTE: Empezamos a leer desde la fila 2 (range: 1) donde están tus encabezados reales
    const rawData: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "", range: 1 });

    if (rawData.length === 0) return { clients: [], orders: [] };

    // La primera fila de rawData ahora son tus encabezados (Item, Tipo Orden, etc.)
    const orders = rawData.slice(1) // Empezamos justo después de la cabecera
      .filter(row => {
        const tipoVal = String(row[1] || "").toUpperCase();
        // Filtramos filas vacías o que repitan los encabezados
        return tipoVal !== "" && !tipoVal.includes("TIPO ORDEN") && !tipoVal.includes("SECTOR");
      })
      .map(row => {
        const clean = (val: any) => String(val || "").trim().toUpperCase();
        const dir = [row[21], row[22], row[23]].filter(v => v).join(', ');

        return {
          // MAPEOS EXACTOS SEGÚN TU EXCEL
          cliente: clean(row[19] || row[1]), // Nombres (Col T) o Cliente (Col B)
          tipoOrden: clean(row[1]),          // Tipo Orden (Col B)
          servicio: clean(row[5]),           // Servicio (Col F)
          distrito: clean(row[20]),          // Distrito (Col U)
          detalle: clean(row[4]),            // Detalle (Col E)
          situacionCable: clean(row[6]),     // Col G
          situacion: clean(row[7]),          // Col H
          lugar: dir.toUpperCase() || "SIN DIRECCIÓN",

          // FECHAS (AF=31, AG=32)
          fechaRecep: formatExcelDate(row[31]),
          fechaEjec: formatExcelDate(row[32]),

          estadoOS: clean(row[38]),          // Col AM
          diasEspera: Number(row[55]) || 0,  // Col BD
        };
      });

    return { clients: [], orders };
  } catch (error) { throw error; }
};

const formatExcelDate = (excelDate: any): string => {
  if (!excelDate || excelDate === 0 || excelDate === "") return "---";
  if (typeof excelDate === 'string' && excelDate.includes('/')) return excelDate.trim();

  try {
    // Usamos getUTC para evitar que el cambio de zona horaria mueva el día
    const date = new Date(Math.round((Number(excelDate) - 25569) * 86400 * 1000));
    if (isNaN(date.getTime())) return "---";

    const dia = date.getUTCDate().toString().padStart(2, '0');
    const mes = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const anio = date.getUTCFullYear();
    return `${dia}/${mes}/${anio}`;
  } catch { return "---"; }
};