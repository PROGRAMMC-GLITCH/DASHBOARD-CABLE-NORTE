import * as XLSX from 'xlsx';

export interface OrderData {
  cliente: string;
  tipoOrden: string;
  detalle: string;
  nombreReal: string;
  servicio: string;
  situacion: string;      // Internet (Col J)
  situacionCable: string; // Cable (Col I)
  lugar: string;
  fechaRegistro: string;
  rawDate: number;        // Para sorting preciso
  distrito: string;
}

// Interfaces para la nueva estructura de Clientes derivada de Órdenes
export interface DerivedClient {
  nombre: string;
  isActivo: boolean;
  isCortado: boolean;
  servicio: string;
  lugar: string;
  date: string;
}

const calcularTiempo = (excelDate: any) => {
  if (!excelDate || excelDate === 0 || excelDate === "") return 0;
  try {
    const fechaRecep = new Date(Math.round((Number(excelDate) - 25569) * 86400 * 1000));
    const hoy = new Date();
    fechaRecep.setHours(0, 0, 0, 0);
    hoy.setHours(0, 0, 0, 0);
    const diferenciaMs = hoy.getTime() - fechaRecep.getTime();
    const dias = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24));
    return dias < 0 ? 0 : dias;
  } catch { return 0; }
};

export const fetchExcelData = async (url: string) => {
  try {
    const downloadUrl = url.includes('/edit') ? url.split('/edit')[0] + '/export?format=xlsx' : url;
    const response = await fetch(downloadUrl);
    const arrayBuffer = await response.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });

    const sheet2Name = workbook.SheetNames.find(n => n.toUpperCase().includes("HOJA 2") || n.toUpperCase().includes("ORDENES"));
    if (!sheet2Name) throw new Error("Hoja 2 no encontrada");

    const sheet2 = workbook.Sheets[sheet2Name];
    const rawData2: any[][] = XLSX.utils.sheet_to_json(sheet2, { header: 1, defval: "" });

    const headerRowIndex = rawData2.findIndex(row =>
      row.some(cell => String(cell).toUpperCase() === "CLIENTE")
    );

    const dataRows = rawData2.slice(headerRowIndex + 1);

    const orders = dataRows
      .filter(row => {
        // Extraemos los valores de las columnas críticas para validar
        const clienteVal = String(row[1] || "").trim().toUpperCase();       // Col B
        const tipoOrdenVal = String(row[3] || "").trim().toUpperCase();     // Col D
        const servicioVal = String(row[7] || "").trim().toUpperCase();      // Col H

        // LÓGICA DE FILTRADO PARA EXCLUIR ENCABEZADOS Y FILAS DE SECTOR
        const esFilaBasura =
          clienteVal === "" ||
          clienteVal === "CLIENTE" ||
          clienteVal === "SECTOR" || // <--- EXCLUYE LA FILA QUE MARCASTE
          tipoOrdenVal.includes("MOTIVOS") || // <--- EXCLUYE "MOTIVOS OTROS"
          servicioVal.includes("ESTADO") ||   // <--- EXCLUYE "ESTADO INTERNET"
          clienteVal.includes("NOMBRES");

        return !esFilaBasura; // Solo dejamos pasar lo que NO es basura
      })
      .map(row => {
        // Concatenación de Dirección: V(21), W(22) y X(23)
        const direccionFull = [row[21], row[22], row[23]]
          .filter(v => v && String(v).trim() !== "")
          .join(', ');


        return {
          cliente: String(row[19] || row[1]).trim().toUpperCase(),
          tipoOrden: String(row[1] || '').trim().toUpperCase(),
          detalle: String(row[4] || '').trim().toUpperCase(),
          distrito: String(row[20] || '').trim().toUpperCase(),
          servicio: String(row[5] || '').trim().toUpperCase(),
          situacion: String(row[7] || '').trim().toUpperCase(),
          situacionCable: String(row[6] || '').trim().toUpperCase(),
          lugar: direccionFull.toUpperCase() || "SIN DIRECCIÓN",
          fechaRegistro: formatExcelDate(row[31]),
          tiempo: calcularTiempo(row[31]),
        };
      });

    return { clients: [], orders };
  } catch (error) {
    console.error("Error en Service:", error);
    throw error;
  }
};

const formatExcelDate = (excelDate: any): string => {
  // CORRECCIÓN: Si el dato es vacío o 0, evitamos el 30/12/1899
  if (!excelDate || excelDate === 0 || excelDate === "") return "---";

  if (typeof excelDate === 'string' && excelDate.includes('/')) return excelDate;

  try {
    const date = new Date(Math.round((Number(excelDate) - 25569) * 86400 * 1000));
    if (isNaN(date.getTime()) || date.getFullYear() < 1910) return "---";

    const dia = (date.getDate() + 1).toString().padStart(2, '0');
    const mes = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${dia}/${mes}/${date.getFullYear()}`;
  } catch {
    return "---";
  }
};