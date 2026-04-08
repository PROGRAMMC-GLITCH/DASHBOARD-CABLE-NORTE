import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, Users, UserCheck, UserX, Wifi, Tv, Layers,
  Settings, Link as LinkIcon, RefreshCw, X, Search, Info, ChevronDown, Globe, ArrowDownRight, Sun, Moon
} from 'lucide-react';
import { fetchExcelData, OrderData } from './services/excelService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LabelList } from 'recharts';
import { toPng } from 'html-to-image';

// --- COMPONENTE MODAL DETALLE ---
const DetailModal = ({ isOpen, onClose, title, data, showStates = false, isDark }: any) => {
  const [search, setSearch] = useState("");
  const [filtroDistritoModal, setFiltroDistritoModal] = useState("");
  if (!isOpen) return null;


  // Filtro por nombre (aplica para cualquier modo)
  const distritosDisponibles = useMemo(() => {
    const dists = data.map((item: any) => item.distrito?.trim()).filter(Boolean);
    return [...new Set(dists)].sort();
  }, [data]);

  // 2. Aplicar filtro doble: Búsqueda por Nombre + Selector de Distrito
  const filtered = data.filter((item: any) => {
    const cumpleNombre = (item.cliente || item.nombre || "").toLowerCase().includes(search.toLowerCase());
    const cumpleDistrito = filtroDistritoModal === "" || (item.distrito || "").trim() === filtroDistritoModal;
    return cumpleNombre && cumpleDistrito;
  });

  // Detectamos si es el modal de Instalaciones para cambiar la estructura de la tabla
  const isEspecial = title === "INSTALACIONES INTERNET REGISTRADAS" || title === "CORTES REGISTRADOS" ||
    title === "RECONEXIONES INTERNET REGISTRADAS" || title === "SERVICIOS REGISTRADOS" ||
    title === "RECUPERACIÓN DE ONUS" || title === "INSTALACIONES CABLE REGISTRADAS" || title === "CORTES CABLE REGISTRADAS" ||
    title === "RECUPERACIÓN DE MININODOS" || title === "RECONEXIONES CABLE REGISTRADAS";


  const mostrarDetalle = title === "SERVICIOS REGISTRADOS" || title === "RECUPERACIÓN DE EQUIPOS"; // solo para todas las averias y recuperacion de equipos

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`w-full max-w-5xl max-h-[90vh] rounded-[2rem] overflow-hidden flex flex-col shadow-2xl border transition-colors duration-500 ${isDark ? 'bg-[#0a0a0a] border-white/10' : 'bg-white border-zinc-200'
          }`}
      >
        {/* HEADER DEL MODAL */}
        <div className={`p-8 border-b flex justify-between items-center transition-colors ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-zinc-50 border-zinc-100'
          }`}>
          <div>
            <h2 className={`text-2xl font-black uppercase tracking-tighter italic ${isDark ? 'text-emerald-500' : 'text-emerald-600'
              }`}>{title}</h2>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1 italic">
              {filtered.length} Registros encontrados
            </p>
          </div>
          <button onClick={onClose} className={`p-3 rounded-full transition-colors ${isDark ? 'hover:bg-white/10 text-zinc-400' : 'hover:bg-black/5 text-zinc-500'
            }`}><X size={24} /></button>
        </div>

        {/* BARRA DE BÚSQUEDA */}
        <div className={`p-6 border-b transition-colors ${isDark ? 'bg-white/[0.01] border-white/5' : 'bg-white border-zinc-100'
          }`}>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={20} />
            <input
              type="text"
              placeholder="Escribe el nombre para filtrar..."
              className={`w-full border rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none font-bold transition-all italic ${isDark
                ? 'bg-black border-white/10 text-white focus:border-emerald-500/50'
                : 'bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-emerald-500/50'
                }`}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* TABLA DE DATOS */}
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead className={`sticky top-0 z-10 italic transition-colors ${isDark ? 'bg-[#0a0a0a]' : 'bg-zinc-100'
              }`}>
              <tr className={`text-[10px] font-black uppercase tracking-widest border-b ${isDark ? 'text-white-500 border-white/10' : 'text-white-400 border-white-200'
                }`}>
                <th className="p-6">CLIENTE</th>
                <th className="p-6 text-center min-w-[200px]">
                  <div className="flex flex-col items-center justify-center gap-1">
                    {/* Etiqueta superior */}


                    <div className="flex items-center gap-2 h-[35px]">
                      <div className="relative">
                        <select
                          value={filtroDistritoModal}
                          onChange={(e) => setFiltroDistritoModal(e.target.value)}
                          className={`appearance-none font-black italic text-[11px] uppercase outline-none cursor-pointer text-center pl-4 pr-8 py-1.5 rounded-lg border transition-all ${isDark
                            ? 'bg-white/5 border-white/10 text-emerald-500 hover:border-emerald-500/30'
                            : 'bg-zinc-100 border-zinc-200 text-emerald-700 hover:border-emerald-500/30'
                            } ${filtroDistritoModal === "" ? (isDark ? "text-zinc-500" : "text-zinc-400") : ""}`}
                        >
                          <option value="" className={isDark ? "bg-[#0a0a0a] text-zinc-500" : "bg-white text-zinc-400"}>
                            DISTRITO
                          </option>
                          {distritosDisponibles.map(d => (
                            <option key={d} value={d} className={isDark ? "bg-[#0a0a0a] text-white" : "bg-white text-zinc-800"}>
                              {d}
                            </option>
                          ))}
                        </select>
                        <div className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-zinc-600' : 'text-zinc-400'
                          }`}>
                          <ChevronDown size={12} strokeWidth={3} />
                        </div>
                      </div>

                      {/* Botón de Limpieza Cuadrado */}
                      <AnimatePresence>
                        {filtroDistritoModal !== "" && (
                          <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            onClick={() => setFiltroDistritoModal("")}
                            className="w-[30px] h-[30px] flex-shrink-0 flex items-center justify-center bg-red-500/10 border border-red-500/40 text-red-500 rounded-lg hover:bg-red-500 hover:text-black transition-all"
                          >
                            <X size={14} strokeWidth={3} />
                          </motion.button>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Indicador Neón Inferior */}
                    <div className={`h-[2px] transition-all duration-500 rounded-full ${filtroDistritoModal !== ""
                      ? "w-12 bg-emerald-500 shadow-[0_0_10px_#10b981]"
                      : (isDark ? "w-4 bg-zinc-800" : "w-4 bg-zinc-200")
                      }`}></div>
                  </div>
                </th>
                <th className="p-6 text-center">DIRECCIÓN</th>
                <th className="p-6 text-right">TIEMPO REGISTRADO</th>
              </tr>
            </thead>
            <tbody className={`divide-y italic ${isDark ? 'divide-white/5' : 'divide-zinc-100'}`}>
              {filtered.map((item: any, i: number) => (
                <tr key={i} className={`transition-colors ${isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-zinc-50'
                  }`}>
                  <td className={`p-6 text-sm font-black italic ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    {item.cliente}
                  </td>
                  <td className="p-6 text-center text-[10px] font-bold text-white-400 uppercase">
                    {item.distrito}
                  </td>
                  <td className="p-6 text-center text-[10px] font-bold text-zinc-500 uppercase">
                    {item.lugar}
                  </td>
                  <td className="p-6 text-right">
                    <div className="flex flex-col items-end">
                      {/* Usamos item.diasEspera que viene de la columna BD */}
                      <span className={`text-xl font-black ${(item.diasEspera || 0) >= 3 ? 'text-red-500' : (isDark ? 'text-white' : 'text-zinc-800')
                        }`}>
                        {item.diasEspera || 0} DÍAS
                      </span>

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );

};
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
      className="text-[13px] font-black italic"
      style={{ pointerEvents: 'none', filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.8))' }}>
      {value}
    </text>
  );
};
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#050505] border border-white/10 p-4 rounded-2xl shadow-2xl backdrop-blur-md">
        <p className="text-white font-black italic mb-2 border-b border-white/5 pb-1 uppercase text-[10px] tracking-widest">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-3 py-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
            <p className="text-[10px] font-bold italic uppercase" style={{ color: entry.color || entry.fill }}>
              {entry.name}: <span className="text-white text-xs ml-1 font-black">{entry.value}</span>
            </p>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// --- COMPONENTE SERVICIO ORIGINAL ---
const ServiceCard = ({ title, data, icon: Icon }: any) => {
  const stats = useMemo(() => ({
    total: data.length,
    activos: data.filter((c: any) => c.isActivo).length,
    cortados: data.filter((c: any) => c.isCortado).length,
    recuperos: data.filter((c: any) => c.detalle.includes("RECOJO DE EQUIPO")).length
  }), [data]);

  return (
    <div className="bg-[#0f0f0f] border border-white/5 p-6 rounded-[2rem] relative overflow-hidden group hover:border-emerald-500/20 transition-all">
      <div className="flex items-center gap-3 mb-8 relative z-10 italic">
        <div className="p-2 bg-emerald-500/10 rounded-lg"><Icon className="text-emerald-500" size={18} /></div>
        <h3 className="font-black  text-white uppercase tracking-tighter text-sm">{title}</h3>
      </div>
      <div className="grid grid-cols-2 gap-6 relative z-10 italic">
        <div><p className="text-[9px] font-bold  text-zinc-500 uppercase tracking-widest mb-1">Total</p><p className="text-2xl font-black  text-white">{stats.total}</p></div>
        <div><p className="text-[9px] font-bold  text-emerald-500 uppercase tracking-widest mb-1">Activos</p><p className="text-2xl font-black  text-emerald-500">{stats.activos}</p></div>
        <div><p className="text-[9px] font-bold  text-red-500 uppercase tracking-widest mb-1">Cortados</p><p className="text-2xl font-black  text-red-500">{stats.cortados}</p></div>
        <div><p className="text-[9px] font-bold  text-orange-500 uppercase tracking-widest mb-1">Recuperos</p><p className="text-2xl font-black  text-orange-500">{stats.recuperos}</p></div>
      </div>
    </div>
  );
};
const thisColors: any = {
  'Cortes': "url(#colorCortes)",
  'Recuperaciones': "url(#colorRecup)",
  'Servicio Técnico': "url(#colorTecnico)",
  'Reconexiones': "url(#colorRecon)",
  'Instalaciones': "url(#colorInstal)"
};
const ahora = new Date();
const mesActual = ahora.getMonth() + 1;
const anioActual = ahora.getFullYear();
const mesAnioKey = `${mesActual}-${anioActual}`; // Ejemplo: "4-2026"

// 2. Verificar si cambiamos de mes para resetear manuales automáticamente
const mesGuardado = localStorage.getItem('ultimo_mes_registro');

// Si el mes en el que estamos es distinto al que guardamos, reseteamos todo
if (mesGuardado && mesGuardado !== mesAnioKey) {
  localStorage.setItem('adj_int', '0');
  localStorage.setItem('adj_cab', '0');
  localStorage.setItem('ultimo_mes_registro', mesAnioKey);
} else if (!mesGuardado) {
  localStorage.setItem('ultimo_mes_registro', mesAnioKey);
}


export default function App() {
  const [url, setUrl] = useState(localStorage.getItem('isp_url') || '');
  const [data, setData] = useState<{ clients: any[], orders: OrderData[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [showOrdersTable, setShowOrdersTable] = useState(false);
  const [selMesInt, setSelMesInt] = useState("");
  const [selMesCab, setSelMesCab] = useState("");
  const [isDark, setIsDark] = useState(localStorage.getItem('theme') !== 'light');
  const [filtroDistrito, setFiltroDistrito] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroServicio, setFiltroServicio] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);
  const [manualAdjInt, setManualAdjInt] = useState(Number(localStorage.getItem('adj_int')) || 0);
  const [manualAdjCab, setManualAdjCab] = useState(Number(localStorage.getItem('adj_cab')) || 0);
  const [inputValInt, setInputValInt] = useState("");
  const [inputValCab, setInputValCab] = useState("");

  // Cálculo Automático del mes actual desde el Excel
  const statsMesActual = useMemo(() => {
    if (!data?.orders) return { internet: 0, cable: 0, nombreMes: "" };

    const mesActual = 4; // Abril
    const anioActual = 2026;

    const filtradas = data.orders.filter(o => {
      // 1. Debe ser Instalación
      if (!o.tipoOrden.includes("INSTALACION SERVICIO")) return false;

      // 2. Coalescencia: AF o AG
      const fechaRef = o.fechaRecep !== "---" ? o.fechaRecep : o.fechaEjec;
      if (fechaRef === "---") return false;

      const partes = fechaRef.split('/');
      const m = parseInt(partes[1]);
      const a = parseInt(partes[2]);

      return m === mesActual && a === anioActual;
    });

    return {
      internet: filtradas.filter(o => o.servicio.includes("INTERNET")).length, // Debería dar 7
      cable: filtradas.filter(o => o.servicio.includes("TELEVISION")).length,   // Debería dar 1
      nombreMes: "ABRIL"
    };
  }, [data]);

  const handleSumarManual = (tipo: 'int' | 'cab') => {
    const num = tipo === 'int' ? Number(inputValInt) : Number(inputValCab);
    if (isNaN(num) || num <= 0) return;

    if (tipo === 'int') {
      const nuevo = manualAdjInt + num;
      setManualAdjInt(nuevo);
      localStorage.setItem('adj_int', nuevo.toString());
      setInputValInt("");
    } else {
      const nuevo = manualAdjCab + num;
      setManualAdjCab(nuevo);
      localStorage.setItem('adj_cab', nuevo.toString());
      setInputValCab("");
    }
  };

  const chartRef = useRef<HTMLDivElement>(null); // Referencia al contenedor del gráfico

  const handleDownload = async () => {
    if (chartRef.current === null) return;

    const dataUrl = await toPng(chartRef.current, {
      cacheBust: true,
      // CORRECCIÓN: El fondo de la imagen ahora respeta el modo oscuro/claro
      backgroundColor: isDark ? '#0a0a0a' : '#ffffff',
      style: { borderRadius: '3rem' }
    });

    const link = document.createElement('a');
    link.download = `Reporte-Mensual-${new Date().toLocaleDateString()}.png`;
    link.href = dataUrl;
    link.click();
  };

  // Obtenemos los distritos únicos presentes en los datos
  // 1. Lista de distritos sin espacios extra
  const listaDistritos = useMemo(() => {
    if (!data?.orders) return [];
    const dists = data.orders
      .map(o => o.distrito.trim()) // Limpia espacios
      .filter(d => d !== "" && d !== "DISTRITO");
    return [...new Set(dists)].sort(); // Ordenados alfabéticamente
  }, [data?.orders]);

  const listaTipos = useMemo(() => {
    if (!data?.orders) return [];
    const tipos = data.orders
      .map(o => o.tipoOrden.trim())
      .filter(t => t !== "" && t !== "TIPO DE ORDEN");
    return [...new Set(tipos)].sort();
  }, [data?.orders]);

  const listaServicios = useMemo(() => {
    if (!data?.orders) return [];
    const svs = data.orders
      .map(o => o.servicio.trim())
      .filter(s => s !== "" && s !== "SERVICIO");
    return [...new Set(svs)].sort();
  }, [data?.orders]);

  // 3. Lógica de filtrado combinada (Filtrado encadenado)
  const ordenesFiltradas = useMemo(() => {
    if (!data?.orders) return [];
    return data.orders.filter(o => {
      const cumpleDistrito = filtroDistrito === "" || o.distrito.trim() === filtroDistrito.trim();
      const cumpleTipo = filtroTipo === "" || o.tipoOrden.trim() === filtroTipo.trim();
      const cumpleServicio = filtroServicio === "" || o.servicio.trim() === filtroServicio.trim();
      return cumpleDistrito && cumpleTipo && cumpleServicio;
    });
  }, [data?.orders, filtroDistrito, filtroTipo, filtroServicio]);




  const handleConnect = async () => {
    if (!url) return;
    setLoading(true);
    try {
      const res = await fetchExcelData(url);
      setData(res);
      localStorage.setItem('isp_url', url);
    } catch (err: any) {
      // Ahora el alert te dirá el motivo real (CORS, 404, Hoja no encontrada, etc.)
      alert('ERROR DE CONEXIÓN: ' + err.message);
    }
    setLoading(false);
  };

  const metrics = useMemo(() => {
    if (!data) return null;
    const ordenesValidas = data.orders.filter(o => o.estadoOS === "REGISTRADA");

    // FILTRO INSTALACIONES: Col D="INSTALACION SERVICIO" AND Col AO="REGISTRADA"
    const instInternetPorInstalar = ordenesValidas.filter(o =>
      o.tipoOrden === "INSTALACION SERVICIO" && // Col 
      o.servicio === "INTERNET"              // Col 
    );
    const cortesInternetPorCortar = ordenesValidas.filter(o =>
      o.tipoOrden === "CORTE DE SERVICIO" &&
      o.servicio === "INTERNET" &&
      o.situacion === "ACTIVO"
    );
    const reconexionesInternet = ordenesValidas.filter(o =>
      o.tipoOrden === "RECONEXION SERVICIO" &&
      o.servicio === "INTERNET" &&
      o.situacion === "CORTADO"
    );
    const servicioTecnicoInternet = ordenesValidas.filter(o =>
      o.tipoOrden === "SERVICIO TECNICO" &&
      o.servicio === "INTERNET" &&
      o.situacion.trim() === "ACTIVO"

    );
    const recuperacionEquipos = ordenesValidas.filter(o =>
      (o.tipoOrden || "").toUpperCase() === "SERVICIO TECNICO" &&
      (o.servicio || "").toUpperCase() === "INTERNET" &&
      (o.detalle || "").toUpperCase().trim() === "RECOJO DE EQUIPO"
    );
    const instCablePorInstalar = ordenesValidas.filter(o =>
      (o.tipoOrden || "").includes("INSTALACION SERVICIO") &&
      (o.servicio || "").includes("TELEVISION") && // Acepta ambos nombres
      (o.situacionCable || "").includes("POR INSTALAR") // 
    );
    const instCablePorCortar = ordenesValidas.filter(o =>
      (o.tipoOrden || "").includes("CORTE DE SERVICIO") &&
      (o.servicio || "").includes("TELEVISION") && // Acepta ambos nombres
      (o.situacionCable || "").includes("ACTIVO") // 
    );
    const instCablePorReconectar = ordenesValidas.filter(o =>
      (o.tipoOrden || "").includes("RECONEXION SERVICIO") &&
      (o.servicio || "").includes("TELEVISION") && // Acepta ambos nombres
      (o.situacionCable || "").includes("CORTADO") // 
    );
    const instCablePorRecoger = ordenesValidas.filter(o =>
      (o.detalle || "").includes("RECOJO DE EQUIPO") &&
      (o.servicio || "").includes("TELEVISION") && // Acepta ambos nombres
      (o.situacionCable || "").includes("CORTADO") // 
    );
    const servicioTecnicoCable = ordenesValidas.filter(o =>
      o.tipoOrden === "SERVICIO TECNICO" &&
      o.servicio === "TELEVISION"

    );
    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value }: any) => {
      const RADIAN = Math.PI / 180;
      // Posicionamiento exacto en el centro del anillo
      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
      const x = cx + radius * Math.cos(-midAngle * RADIAN);
      const y = cy + radius * Math.sin(-midAngle * RADIAN);

      return (
        <text
          x={x}
          y={y}
          fill="white"
          textAnchor="middle"
          dominantBaseline="central"
          className="text-[15px] font-black italic"
          style={{ filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.8))' }}
        >
          {value} {/* Muestra 31, 24, 7, 55 directamente */}
        </text>
      );
    };

    const generarEstadisticasGlobales = (servicioFiltro: string) => {
      const mesesMap: any = {};
      if (!data?.orders) return { barData: [], listaMeses: [] };

      data.orders.forEach(o => {
        if (!o.servicio.includes(servicioFiltro)) return;

        // LÓGICA DE COALESCENCIA: AF o AG (Igual que en los contadores)
        const fechaRef = o.fechaRecep !== "---" ? o.fechaRecep : o.fechaEjec;
        if (fechaRef === "---") return;

        const partes = fechaRef.split('/');
        if (partes.length === 3) {
          // Creamos la fecha en UTC para evitar desfases
          const d = new Date(Date.UTC(parseInt(partes[2]), parseInt(partes[1]) - 1, 1));
          const mesKey = d.toLocaleString('es-ES', { month: 'short', timeZone: 'UTC' }).toUpperCase() + " " + partes[2];
          const sortVal = d.getTime();

          if (!mesesMap[mesKey]) {
            mesesMap[mesKey] = {
              name: mesKey,
              sortVal,
              Cortes: 0,
              Recuperaciones: 0,
              "Servicio Técnico": 0,
              Reconexiones: 0,
              Instalaciones: 0
            };
          }

          const tipo = (o.tipoOrden || "").toUpperCase();
          const detalle = (o.detalle || "").toUpperCase();

          if (detalle.includes("RECOJO")) mesesMap[mesKey].Recuperaciones++;
          else if (tipo.includes("CORTE")) mesesMap[mesKey].Cortes++;
          else if (tipo.includes("RECONEXION")) mesesMap[mesKey].Reconexiones++;
          else if (tipo.includes("INSTALACION")) mesesMap[mesKey].Instalaciones++;
          else if (tipo.includes("SERVICIO TECNICO")) mesesMap[mesKey]["Servicio Técnico"]++;
        }
      });

      const sortedData = Object.values(mesesMap).sort((a: any, b: any) => a.sortVal - b.sortVal);
      return {
        barData: sortedData,
        listaMeses: sortedData.map((m: any) => m.name)
      };
    };

    const statsInternetGlobal = generarEstadisticasGlobales("INTERNET");
    const statsCableGlobal = generarEstadisticasGlobales("TELEVISION");


    return {
      total: data.clients,
      activos: data.clients.filter(c => c.isActivo),
      cortados: data.clients.filter(c => c.isCortado),
      internet: data.clients.filter(c => c.servicio === 'INTERNET'),
      cable: data.clients.filter(c => c.servicio === 'TELEVISION'),
      duo: data.clients.filter(c => c.servicio === 'DUO'),

      // Actualizamos con el nuevo filtro
      osInstalaciones: instInternetPorInstalar.length,
      datosInstalaciones: instInternetPorInstalar,

      osCortados: cortesInternetPorCortar.length,
      datosCortes: cortesInternetPorCortar,

      osReconexiones: reconexionesInternet.length,
      datosReconexiones: reconexionesInternet,

      osTecnicoCount: servicioTecnicoInternet.length,
      datosTecnico: servicioTecnicoInternet,

      osRecuperacionCount: recuperacionEquipos.length,
      datosRecuperacion: recuperacionEquipos,

      osCableInstCount: instCablePorInstalar.length,
      datosCableInst: instCablePorInstalar,

      osCableCortesCount: instCablePorCortar.length,
      datosCableCortes: instCablePorCortar,

      osCableReconectarCount: instCablePorReconectar.length,
      datosCableReconectar: instCablePorReconectar,

      osCableRecogerCount: instCablePorRecoger.length,
      datosCableRecoger: instCablePorRecoger,

      osCableCount: servicioTecnicoCable.length,
      datosOSCable: servicioTecnicoCable,

      statsInternetGlobal,
      statsCableGlobal,


    };

  }, [data]);
  const currentPieDataInt = useMemo(() => {
    // 1. Verificamos que existan datos en el histórico
    const historicalData = metrics?.statsInternetGlobal?.barData;
    if (!historicalData || historicalData.length === 0) return [];

    // 2. Filtramos por mes o usamos todo el histórico
    const sourceData = selMesInt
      ? historicalData.filter((d: any) => d.name === selMesInt)
      : historicalData;

    // 3. Sumarizamos con valores iniciales en 0 para evitar undefined
    const totals = sourceData.reduce((acc: any, curr: any) => ({
      Cortes: (acc.Cortes || 0) + (curr.Cortes || 0),
      Instalaciones: (acc.Instalaciones || 0) + (curr.Instalaciones || 0),
      Reconexiones: (acc.Reconexiones || 0) + (curr.Reconexiones || 0),
      Recuperaciones: (acc.Recuperaciones || 0) + (curr.Recuperaciones || 0),
      "Servicio Técnico": (acc["Servicio Técnico"] || 0) + (curr["Servicio Técnico"] || 0),
    }), { Cortes: 0, Instalaciones: 0, Reconexiones: 0, Recuperaciones: 0, "Servicio Técnico": 0 });

    // 4. Creamos el array para el PieChart
    const result = [
      { name: 'CORTES', value: totals.Cortes, color: '#ff4d4d' },
      { name: 'INSTALACIONES', value: totals.Instalaciones, color: '#2eb872' },
      { name: 'RECONEXIONES', value: totals.Reconexiones, color: '#cc66ff' },
      { name: 'RECUPERACIONES', value: totals.Recuperaciones, color: '#3399ff' },
      { name: 'TÉCNICO', value: totals["Servicio Técnico"], color: '#ff9933' }
    ].filter(d => d.value > 0); // Solo incluimos categorías con datos

    return result;
  }, [selMesInt, metrics]);


  const currentPieDataCab = useMemo(() => {
    // 1. Verificamos que existan datos en el histórico
    const historicalData = metrics?.statsCableGlobal?.barData;
    if (!historicalData || historicalData.length === 0) return [];

    // 2. Filtramos por mes o usamos todo el histórico
    const sourceData = selMesCab
      ? historicalData.filter((d: any) => d.name === selMesCab)
      : historicalData;

    // 3. Sumarizamos con valores iniciales en 0 para evitar undefined
    const totals = sourceData.reduce((acc: any, curr: any) => ({
      Cortes: (acc.Cortes || 0) + (curr.Cortes || 0),
      Instalaciones: (acc.Instalaciones || 0) + (curr.Instalaciones || 0),
      Reconexiones: (acc.Reconexiones || 0) + (curr.Reconexiones || 0),
      Recuperaciones: (acc.Recuperaciones || 0) + (curr.Recuperaciones || 0),
      "Servicio Técnico": (acc["Servicio Técnico"] || 0) + (curr["Servicio Técnico"] || 0),
    }), { Cortes: 0, Instalaciones: 0, Reconexiones: 0, Recuperaciones: 0, "Servicio Técnico": 0 });

    // 4. Creamos el array para el PieChart
    const result = [
      { name: 'CORTES', value: totals.Cortes, color: '#ff4d4d' },
      { name: 'INSTALACIONES', value: totals.Instalaciones, color: '#2eb872' },
      { name: 'RECONEXIONES', value: totals.Reconexiones, color: '#cc66ff' },
      { name: 'RECUPERACIONES', value: totals.Recuperaciones, color: '#3399ff' },
      { name: 'TÉCNICO', value: totals["Servicio Técnico"], color: '#ff9933' }
    ].filter(d => d.value > 0); // Solo incluimos categorías con datos

    return result;
  }, [selMesCab, metrics]);

  React.useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);


  return (
    <div className={`min-h-screen transition-colors duration-700 font-sans ${isDark ? 'bg-[#050505] text-zinc-400' : 'bg-[#f1f5f9] text-zinc-600'
      }`}>

      {/* HEADER */}
      <header className="max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-4 mb-6 italic font-black pt-4 px-6">

        {/* IZQUIERDA: IMAGEN DE MARCA GIGANTE (Sin espacios extra arriba/abajo) */}
        <div className="flex-shrink-0 flex items-center transition-transform hover:scale-[1.02] duration-500">
          <img
            src="/logo2.png"
            alt="Finex"
            /* Cambiamos 20->28, 28->36, 32->44 */
            className="h-28 md:h-36 lg:h-50 w-auto object-contain drop-shadow-[0_0_20px_rgba(16,185,129,0.4)]"
          />
        </div>

        {/* DERECHA: CONTROLES (Más compactos y cercanos) */}
        <div className="flex items-center gap-3">

          {/* CÁPSULA DE CONECTIVIDAD */}
          <div className={`flex items-center p-1 rounded-[2rem] border transition-all duration-500 shadow-xl ${isDark ? 'bg-white/[0.03] border-white/10' : 'bg-zinc-100 border-zinc-200'
            }`}>
            <input
              value={url}
              onChange={e => setUrl(e.target.value)}
              type="text"
              placeholder="URL de Sheets..."
              className={`w-[200px] md:w-[350px] bg-transparent pl-5 pr-2 py-2 text-xs font-bold outline-none ${isDark ? 'text-white placeholder-zinc-600' : 'text-zinc-900 placeholder-zinc-400'
                }`}
            />
            <button
              onClick={handleConnect}
              disabled={loading}
              className="bg-emerald-500 text-black px-5 py-2.5 rounded-[1.5rem] font-black text-[10px] hover:bg-emerald-400 flex items-center gap-2 transition-all active:scale-95 shadow-lg whitespace-nowrap"
            >
              {loading ? <RefreshCw className="animate-spin" size={14} /> : <LinkIcon size={14} />}
              {loading ? '...' : 'CONECTAR'}
            </button>
          </div>

          {/* BOTÓN TEMA MÁS PEQUEÑO PARA NO GENERAR ESPACIO VERTICAL */}
          <button
            onClick={() => setIsDark(!isDark)}
            className={`p-3.5 rounded-2xl transition-all duration-500 shadow-md active:scale-90 border ${isDark
              ? 'bg-white/5 text-yellow-400 border-white/5'
              : 'bg-white text-indigo-600 border-zinc-200'
              }`}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

      </header>

      {data && metrics ? (
        <main className="max-w-7xl mx-auto space-y-10 px-4 md:px-0 pb-20">


          {/* TABLA DE ÓRDENES */}
          <div className={`transition-all duration-500 rounded-[2.5rem] overflow-hidden shadow-2xl border ${isDark
            ? 'bg-[#0f0f0f] border-white/5'
            : 'bg-white border-zinc-200 shadow-sm'
            }`}>
            <button
              onClick={() => setShowOrdersTable(!showOrdersTable)}
              className={`w-full p-8 border-b flex items-center justify-between transition-colors focus:outline-none italic ${isDark
                ? 'bg-white/[0.01] hover:bg-white/[0.03] border-white/5'
                : 'bg-zinc-50 hover:bg-zinc-100 border-zinc-200'
                }`}
            >
              <div className="flex items-center gap-3">
                <Settings className="text-emerald-500" size={20} />
                <h2 className={`text-xl font-black italic uppercase tracking-tighter ${isDark ? 'text-white' : 'text-zinc-800'
                  }`}>
                  ORDENES DE SERVICIOS
                </h2>
              </div>

              <div className="flex items-center gap-4">
                <div className={`text-[10px] font-black italic px-4 py-2 rounded-full border uppercase ${isDark
                  ? 'text-zinc-500 bg-white/5 border-white/5'
                  : 'text-zinc-400 bg-zinc-100 border-zinc-200'
                  }`}>
                  {data.orders.length} Registros
                </div>
                <motion.div
                  animate={{ rotate: showOrdersTable ? 180 : 0 }}
                  className={isDark ? "text-zinc-500" : "text-zinc-400"}
                >
                  <ChevronDown size={24} />
                </motion.div>
              </div>
            </button>
            <AnimatePresence initial={false}>
              {showOrdersTable && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="overflow-x-auto">
                    <table className="w-full text-left italic">
                      <thead className={`text-[10px] font-black uppercase ${isDark ? 'text-zinc-600 bg-black' : 'text-zinc-500 bg-zinc-100'
                        }`}> <tr>
                          <th className="p-4 text-center text-emerald-500/50">CLIENTE</th><th className="p-4 text-center min-w-[220px] align-middle">
                            <div className="flex flex-col items-center justify-center gap-1">

                              {/* Contenedor de control con altura fija (h-[40px]) para evitar saltos */}
                              <div className="flex items-center justify-center gap-2 h-[40px]">
                                <div className="relative">
                                  <select
                                    value={filtroTipo}
                                    onChange={(e) => setFiltroTipo(e.target.value)}
                                    className={`appearance-none bg-white/5 border border-white/10 font-black italic text-[11px] uppercase outline-none cursor-pointer text-center pl-6 pr-10 py-2.5 rounded-xl transition-all ${filtroTipo === "" ? "text-zinc-500" : "text-emerald-500 border-emerald-500/30"
                                      }`}
                                  >
                                    <option value="" className="bg-[#0a0a0a]">TIPO DE ORDEN</option>
                                    {listaTipos.map(t => <option key={t} value={t} className="bg-[#0a0a0a] text-white">{t}</option>)}
                                  </select>
                                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600">
                                    <ChevronDown size={14} />
                                  </div>
                                </div>

                                <AnimatePresence mode="popLayout">
                                  {filtroTipo !== "" && (
                                    <motion.button
                                      initial={{ opacity: 0, scale: 0.5 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      exit={{ opacity: 0, scale: 0.5 }}
                                      onClick={() => setFiltroTipo("")}
                                      className="w-[38px] h-[38px] flex-shrink-0 flex items-center justify-center bg-red-500/10 border border-red-500/40 text-red-500 rounded-xl hover:bg-red-500 hover:text-black transition-all"
                                    >
                                      <X size={18} strokeWidth={3} />
                                    </motion.button>
                                  )}
                                </AnimatePresence>
                              </div>
                              <div className={`h-[2px] transition-all duration-500 rounded-full ${filtroTipo !== "" ? "w-20 bg-emerald-500 shadow-[0_0_10px_#10b981]" : "w-4 bg-zinc-800"}`}></div>
                            </div>
                          </th>
                          <th className="p-4 text-center min-w-[220px]">
                            <div className="flex flex-col items-center justify-center gap-1">
                              {/* Etiqueta superior sutil */}

                              <div className="flex items-center gap-2">
                                {/* Selector con "DISTRITO" como valor por defecto */}
                                <div className="relative">
                                  <select
                                    value={filtroDistrito}
                                    onChange={(e) => setFiltroDistrito(e.target.value)}
                                    className={`appearance-none bg-white/5 border border-white/10 font-black italic text-[11px] uppercase outline-none cursor-pointer text-center pl-6 pr-10 py-2.5 rounded-xl transition-all ${filtroDistrito === "" ? "text-zinc-500" : "text-emerald-500 border-emerald-500/30"
                                      }`}
                                  >
                                    <option value="" className="bg-[#0a0a0a] text-zinc-500">DISTRITO</option>
                                    {listaDistritos.map(d => (
                                      <option key={d} value={d} className="bg-[#0a0a0a] text-white">{d}</option>
                                    ))}
                                  </select>
                                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600">
                                    <ChevronDown size={14} />
                                  </div>
                                </div>

                                {/* Botón LIMPIAR estilo Cuadradito (Imagen Blue Square) */}
                                <AnimatePresence>
                                  {filtroDistrito !== "" && (
                                    <motion.button
                                      initial={{ opacity: 0, scale: 0.8, x: -10 }}
                                      animate={{ opacity: 1, scale: 1, x: 0 }}
                                      exit={{ opacity: 0, scale: 0.8, x: -10 }}
                                      onClick={() => setFiltroDistrito("")}
                                      title="Limpiar Filtro"
                                      className="w-[38px] h-[38px] flex items-center justify-center bg-red-500/10 border border-red-500/40 text-red-500 rounded-xl hover:bg-red-500 hover:text-black transition-all shadow-lg shadow-red-500/10 active:scale-90"
                                    >
                                      <X size={18} strokeWidth={3} />
                                    </motion.button>
                                  )}
                                </AnimatePresence>
                              </div>

                              {/* Barra neón de estado */}
                              <div className={`h-[2px] transition-all duration-500 rounded-full mt-1 ${filtroDistrito !== "" ? "w-20 bg-emerald-500 shadow-[0_0_10px_#10b981]" : "w-4 bg-zinc-800"
                                }`}></div>
                            </div>
                          </th>
                          <th className="p-4 text-center text-emerald-500/50">LUGAR</th>
                          <th className="p-4 text-center min-w-[220px] align-middle">
                            <div className="flex flex-col items-center justify-center gap-1">
                              <div className="flex items-center justify-center gap-2 h-[40px]">
                                <div className="relative">
                                  <select
                                    value={filtroServicio}
                                    onChange={(e) => setFiltroServicio(e.target.value)}
                                    className={`appearance-none bg-white/5 border border-white/10 font-black italic text-[11px] uppercase outline-none cursor-pointer text-center pl-6 pr-10 py-2.5 rounded-xl transition-all ${filtroServicio === "" ? "text-zinc-500" : "text-emerald-500 border-emerald-500/30"
                                      }`}
                                  >
                                    <option value="" className="bg-[#0a0a0a]">SERVICIO</option>
                                    {listaServicios.map(s => (
                                      <option key={s} value={s} className="bg-[#0a0a0a] text-white">{s}</option>
                                    ))}
                                  </select>
                                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600">
                                    <ChevronDown size={14} />
                                  </div>
                                </div>

                                <AnimatePresence mode="popLayout">
                                  {filtroServicio !== "" && (
                                    <motion.button
                                      initial={{ opacity: 0, scale: 0.5 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      exit={{ opacity: 0, scale: 0.5 }}
                                      onClick={() => setFiltroServicio("")}
                                      className="w-[38px] h-[38px] flex-shrink-0 flex items-center justify-center bg-red-500/10 border border-red-500/40 text-red-500 rounded-xl hover:bg-red-500 hover:text-black transition-all shadow-lg active:scale-90"
                                    >
                                      <X size={18} strokeWidth={3} />
                                    </motion.button>
                                  )}
                                </AnimatePresence>
                              </div>

                              {/* Barra neón de estado para Servicio */}
                              <div className={`h-[2px] transition-all duration-500 rounded-full ${filtroServicio !== "" ? "w-20 bg-emerald-500 shadow-[0_0_10px_#10b981]" : "w-4 bg-zinc-800"
                                }`}></div>
                            </div>
                          </th>
                          <th className="p-4 text-center text-emerald-500/50">FECHA</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {ordenesFiltradas.length > 0 ? (
                          ordenesFiltradas.map((o, i) => (
                            <tr key={i} className={`transition-colors ${isDark ? 'hover:bg-white/[0.02] border-white/5' : 'hover:bg-zinc-50 border-zinc-100'
                              } border-b`}>
                              <td className="p-6 text-center font-black italic uppercase tracking-tighter ${isDark ? 'text-white' : 'text-zinc-800'">{o.cliente}</td>
                              <td className="p-6 text-center text-[11px] font-black text-emerald-500/80 uppercase">{o.tipoOrden}</td>
                              <td className="p-6 text-center font-black italic uppercase tracking-tighter ${isDark ? 'text-white' : 'text-zinc-800'">{o.distrito}</td>
                              <td className="p-6 text-center font-black italic uppercase tracking-tighter ${isDark ? 'text-white' : 'text-zinc-800'">{o.lugar}</td>
                              <td className="p-6 text-center">
                                <span className={`text-[10px] font-black px-4 py-1.5 rounded-lg uppercase border transition-all duration-300 shadow-lg ${o.servicio.includes("TELEVISION")
                                  ? "bg-[#32CD32] text-black border-[#28a428] shadow-lime-500/20" // Verde Lima
                                  : o.servicio.includes("INTERNET")
                                    ? "bg-[#008542] text-white border-[#006b35] shadow-emerald-900/20" // Verde Trébol
                                    : "bg-zinc-500 text-white border-zinc-400" // Fallback
                                  }`}>
                                  {o.servicio}
                                </span>
                              </td>
                              <td className="p-6 text-center font-black italic uppercase tracking-tighter ${isDark ? 'text-white' : 'text-zinc-800'">{o.fechaRecep}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={6} className="p-20 text-center text-zinc-600 font-black italic uppercase tracking-widest">
                              No hay registros para este distrito
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* --- SECCIÓN: O.S INTERNET - REGISTRADAS --- */}
          <div className="mt-16 mb-10">
            <div className="flex items-center gap-4 mb-8 px-2">
              <div className="w-1.5 h-10 bg-emerald-500 rounded-full"></div>
              <div className="relative p-3 rounded-xl bg-emerald-500/10 text-emerald-500 shadow-[0_0_15px_rgba(0,255,0,0.4)]">
                <Globe size={26} />
                <ArrowDownRight size={14} className="absolute bottom-0 right-0" />
              </div>
              <h2 className="text-3xl font-black italic uppercase tracking-tighter leading-none text-[#10b981] drop-[0_0_15px_rgba(16,185,129,0.7)]">
                O.S INTERNET - REGISTRADAS
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">

              {/* 1. INSTALACIONES (Verde) */}
              <div
                onClick={() => setActiveModal('instalaciones')}
                className={`p-8 rounded-[2.5rem] transition-all group cursor-pointer active:scale-95 flex flex-col items-center justify-center text-center border ${isDark
                  ? 'bg-[#0f0f0f] border-emerald-500/20 shadow-none'
                  : 'bg-white border-zinc-200 shadow-sm'
                  }`}>
                <p className="text-[11px] font-black italic text-emerald-500/50 uppercase tracking-[0.2em] mb-4">INSTALACIONES</p>
                <p className="text-6xl font-black italic text-emerald-500 tracking-tighter">
                  {metrics?.osInstalaciones || 0}
                </p>
              </div>

              {/* 2. CORTES (Rojo) */}
              <div
                onClick={() => setActiveModal('os_cortados')}
                className={`p-8 rounded-[2.5rem] transition-all group cursor-pointer active:scale-95 flex flex-col items-center justify-center text-center border ${isDark
                  ? 'bg-[#0f0f0f] border-emerald-500/20 shadow-none'
                  : 'bg-white border-zinc-200 shadow-sm'
                  }`}>
                <p className="text-[11px] font-black italic text-red-500/50 uppercase tracking-[0.2em] mb-4">CORTES</p>
                <p className="text-6xl font-black italic text-red-500 tracking-tighter">
                  {metrics?.osCortados || 0}
                </p>
              </div>

              {/* 3. RECONEXIONES (Morado) */}
              <div
                onClick={() => setActiveModal('os_reconexiones')}
                className={`p-8 rounded-[2.5rem] transition-all group cursor-pointer active:scale-95 flex flex-col items-center justify-center text-center border ${isDark
                  ? 'bg-[#0f0f0f] border-emerald-500/20 shadow-none'
                  : 'bg-white border-zinc-200 shadow-sm'
                  }`}>
                <p className="text-[11px] font-black italic text-purple-500/50 uppercase tracking-[0.2em] mb-4">RECONEXIONES</p>
                <p className="text-6xl font-black italic text-purple-500 tracking-tighter">
                  {metrics?.osReconexiones || 0}
                </p>
              </div>

              {/* 4. RECUPERAR EQUIPOS (Azul) */}
              <div
                onClick={() => setActiveModal('os_recuperacion')}
                className={`p-8 rounded-[2.5rem] transition-all group cursor-pointer active:scale-95 flex flex-col items-center justify-center text-center border ${isDark
                  ? 'bg-[#0f0f0f] border-emerald-500/20 shadow-none'
                  : 'bg-white border-zinc-200 shadow-sm'
                  }`}>
                <p className="text-[11px] font-black italic text-blue-500/50 uppercase tracking-[0.1em] mb-4">RECUPERAR EQUIPOS</p>
                <p className="text-6xl font-black italic text-blue-500 tracking-tighter">
                  {metrics?.osRecuperacionCount || 0}
                </p>
              </div>

              {/* 5. SERVICIOS TÉCNICOS (Naranja) */}
              <div
                onClick={() => setActiveModal('os_tecnico')}
                className={`p-8 rounded-[2.5rem] transition-all group cursor-pointer active:scale-95 flex flex-col items-center justify-center text-center border ${isDark
                  ? 'bg-[#0f0f0f] border-emerald-500/20 shadow-none'
                  : 'bg-white border-zinc-200 shadow-sm'
                  }`}>
                <p className="text-[11px] font-black italic text-orange-500/50 uppercase tracking-[0.2em] mb-4">SERVICIOS TÉCNICOS</p>
                <p className="text-6xl font-black italic text-orange-500 tracking-tighter">
                  {metrics?.osTecnicoCount || 0}
                </p>
              </div>

            </div>
          </div>
          <div className="mt-16 mb-10">
            <div className="flex items-center gap-4 mb-8 px-2">
              <div className="w-1.5 h-10 bg-emerald-500 rounded-full"></div>
              <div className="relative p-3 rounded-2xl bg-lime-500/10 text-lime-500 shadow-[0_0_15px_rgba(0,255,0,0.4)]">
                <Tv size={28} />
                <ArrowDownRight size={16} className="absolute -bottom-1 -right-1" />
              </div>
              <h2 className="text-3xl font-black italic uppercase tracking-tighter leading-none text-[#32CD32] drop-[0_0_15px_rgba(16,185,129,0.7)]">
                O.S CABLE - REGISTRADAS
              </h2>
            </div>

            <div className="mt-16 mb-10">


              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">

                {/* 1. INSTALACIONES (Verde) */}
                <div
                  onClick={() => setActiveModal('os_cable_instalaciones')}
                  className={`p-8 rounded-[2.5rem] transition-all group cursor-pointer active:scale-95 flex flex-col items-center justify-center text-center border ${isDark
                    ? 'bg-[#0f0f0f] border-emerald-500/20 shadow-none'
                    : 'bg-white border-zinc-200 shadow-sm'
                    }`}>
                  <p className="text-[11px] font-black italic text-emerald-500/50 uppercase tracking-[0.2em] mb-4">INSTALACIONES</p>
                  <p className="text-6xl font-black italic text-emerald-500 tracking-tighter">
                    {metrics?.osCableInstCount || 0}
                  </p>
                </div>

                {/* 2. CORTES (Rojo) */}
                <div
                  onClick={() => setActiveModal('os_cable_cortes')}
                  className={`p-8 rounded-[2.5rem] transition-all group cursor-pointer active:scale-95 flex flex-col items-center justify-center text-center border ${isDark
                    ? 'bg-[#0f0f0f] border-emerald-500/20 shadow-none'
                    : 'bg-white border-zinc-200 shadow-sm'
                    }`} >
                  <p className="text-[11px] font-black italic text-red-500/50 uppercase tracking-[0.2em] mb-4">CORTES</p>
                  <p className="text-6xl font-black italic text-red-500 tracking-tighter">
                    {metrics?.osCableCortesCount || 0}
                  </p>
                </div>

                {/* 3. RECONEXIONES (Morado) */}
                <div
                  onClick={() => setActiveModal('os_cable_reconexiones')}
                  className={`p-8 rounded-[2.5rem] transition-all group cursor-pointer active:scale-95 flex flex-col items-center justify-center text-center border ${isDark
                    ? 'bg-[#0f0f0f] border-emerald-500/20 shadow-none'
                    : 'bg-white border-zinc-200 shadow-sm'
                    }`}>
                  <p className="text-[11px] font-black italic text-purple-500/50 uppercase tracking-[0.2em] mb-4">RECONEXIONES</p>
                  <p className="text-6xl font-black italic text-purple-500 tracking-tighter">
                    {metrics?.osCableReconectarCount || 0}
                  </p>
                </div>

                {/* 4. RECUPERAR EQUIPOS (Azul) */}
                <div
                  onClick={() => setActiveModal('os_recoger_mininodo')}
                  className={`p-8 rounded-[2.5rem] transition-all group cursor-pointer active:scale-95 flex flex-col items-center justify-center text-center border ${isDark
                    ? 'bg-[#0f0f0f] border-emerald-500/20 shadow-none'
                    : 'bg-white border-zinc-200 shadow-sm'
                    }`} >
                  <p className="text-[11px] font-black italic text-blue-500/50 uppercase tracking-[0.1em] mb-4">RECUPERAR EQUIPOS</p>
                  <p className="text-6xl font-black italic text-blue-500 tracking-tighter">
                    {metrics?.osCableRecogerCount || 0}
                  </p>
                </div>

                {/* 5. SERVICIOS TÉCNICOS (Naranja) */}
                <div
                  onClick={() => setActiveModal('os_cable_tecnico')}
                  className={`p-8 rounded-[2.5rem] transition-all group cursor-pointer active:scale-95 flex flex-col items-center justify-center text-center border ${isDark
                    ? 'bg-[#0f0f0f] border-emerald-500/20 shadow-none'
                    : 'bg-white border-zinc-200 shadow-sm'
                    }`} >
                  <p className="text-[11px] font-black italic text-orange-500/50 uppercase tracking-[0.2em] mb-4">SERVICIOS TÉCNICOS</p>
                  <p className="text-6xl font-black italic text-orange-500 tracking-tighter">
                    {metrics?.osCableCount || 0}
                  </p>
                </div>

              </div>
            </div>
          </div>
          {/* --- SECCIÓN ESTADÍSTICAS FINALES --- */}
          <div className="space-y-20 mt-20 pb-20">

            {/* ESTADÍSTICAS INTERNET */}
            <section>
              <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10 px-2">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-10 bg-emerald-500 rounded-full shadow-[0_0_15px_#10b981]"></div>
                  <h2 className={`text-3xl font-black italic uppercase tracking-tighter leading-none text-[#10b981] drop-[0_0_15px_rgba(16,185,129,0.7)]`}>
                    HISTÓRICO INTERNET
                  </h2>
                </div>

                <select
                  value={selMesInt}
                  onChange={(e) => setSelMesInt(e.target.value)}
                  className={`font-black italic text-xs rounded-xl px-6 py-3 outline-none transition-all cursor-pointer shadow-lg
    ${isDark
                      ? 'bg-[#0f0f0f] border border-white/10 text-emerald-500 focus:border-emerald-500/50'
                      : 'bg-white border border-zinc-200 text-emerald-700 focus:border-emerald-500/50'
                    }`}>
                  <option value="">TODOS LOS MESES</option>
                  {metrics.statsInternetGlobal.listaMeses.map(m => <option key={m} value={m}
                    className={`${isDark ? 'bg-black text-white' : 'bg-white text-zinc-800'}`}>{m}
                  </option>)}
                </select>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <motion.div
                  ref={chartRef}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`lg:col-span-3 p-10 rounded-[3rem] h-[650px] shadow-2xl relative overflow-hidden transition-colors ${isDark ? 'bg-[#0a0a0a] border border-white/5' : 'bg-white border border-zinc-200'
                    }`}
                >
                  <div className="flex justify-between items-start mb-10">
                    <div>
                      <h3 className={`text-2xl font-black italic uppercase tracking-tighter ${isDark ? 'text-white' : 'text-zinc-800'}`}>
                        Movimiento Mensual
                      </h3>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Análisis de Operaciones</p>
                    </div>

                    <button
                      onClick={handleDownload}
                      className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-zinc-400 hover:text-emerald-500 transition-all active:scale-90"
                      title="Descargar como PNG"
                    >
                      <ArrowDownRight size={20} />
                    </button>
                  </div>

                  <div className={`h-[600px] w-full p-4 rounded-2xl transition-colors duration-500 ${isDark ? 'bg-[#050505]' : 'bg-zinc-50'
                    }`}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={selMesInt ? metrics.statsInternetGlobal.barData.filter((d: any) => d.name === selMesInt) : metrics.statsInternetGlobal.barData}
                        margin={{ top: 50, right: 20, left: -25, bottom: 40 }}
                        barGap={1}
                        barCategoryGap="15%"
                      >
                        <defs>
                          <linearGradient id="colorCortes" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ff4d4d" /><stop offset="95%" stopColor="#7f1d1d" /></linearGradient>
                          <linearGradient id="colorInstal" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2eb872" /><stop offset="95%" stopColor="#064e3b" /></linearGradient>
                          <linearGradient id="colorRecon" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#cc66ff" /><stop offset="95%" stopColor="#581c87" /></linearGradient>
                          <linearGradient id="colorRecup" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3399ff" /><stop offset="95%" stopColor="#1e3a8a" /></linearGradient>
                          <linearGradient id="colorTecnico" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ff9933" /><stop offset="95%" stopColor="#7c2d12" /></linearGradient>
                        </defs>

                        <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />

                        <XAxis
                          dataKey="name"
                          stroke={isDark ? "#fff" : "#666"} // <-- Cambia según el tema
                          fontSize={12}
                          fontWeight="900"
                          axisLine={{ stroke: isDark ? '#333' : '#ddd' }} // <-- Línea base dinámica
                          tickLine={false}
                          height={60}
                          dy={10}
                        />

                        <YAxis
                          stroke={isDark ? "#444" : "#999"} // <-- Números laterales dinámicos
                          fontSize={10}
                          fontWeight="bold"
                          axisLine={false}
                          tickLine={false}
                        />

                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />

                        <Legend layout="horizontal" verticalAlign="top" align="center" wrapperStyle={{ paddingBottom: '60px' }} />

                        {/* RENDERIZADO DE BARRAS: minPointSize={2} asegura que el 1 se vea como una línea base */}
                        {/* El contenido personalizado del Label oculta los ceros */}

                        <Bar dataKey="Instalaciones" fill="url(#colorInstal)" barSize={35} minPointSize={2} radius={[4, 4, 0, 0]}>
                          <LabelList
                            dataKey="Instalaciones"
                            position="top"
                            offset={10}
                            formatter={(val: number) => val > 0 ? val : ""}
                            style={{ fill: '#2eb872', fontSize: '12px', fontWeight: '900', fontStyle: 'italic' }}
                          />
                        </Bar>

                        <Bar dataKey="Cortes" fill="url(#colorCortes)" barSize={35} minPointSize={2} radius={[4, 4, 0, 0]}>
                          <LabelList
                            dataKey="Cortes"
                            position="top"
                            offset={12}

                            formatter={(val: number) => val > 0 ? val : ""}
                            style={{ fill: '#ff4d4d', fontSize: '12px', fontWeight: '900', fontStyle: 'italic' }}
                          />
                        </Bar>



                        <Bar dataKey="Reconexiones" fill="url(#colorRecon)" barSize={35} minPointSize={2} radius={[4, 4, 0, 0]}>
                          <LabelList
                            dataKey="Reconexiones"
                            position="top"
                            offset={10}
                            formatter={(val: number) => val > 0 ? val : ""}
                            style={{ fill: '#cc66ff', fontSize: '12px', fontWeight: '900', fontStyle: 'italic' }}
                          />
                        </Bar>

                        <Bar dataKey="Recuperaciones" fill="url(#colorRecup)" barSize={35} minPointSize={2} radius={[4, 4, 0, 0]}>
                          <LabelList
                            dataKey="Recuperaciones"
                            position="top"
                            offset={10}
                            formatter={(val: number) => val > 0 ? val : ""}
                            style={{ fill: '#3399ff', fontSize: '12px', fontWeight: '900', fontStyle: 'italic' }}
                          />
                        </Bar>

                        <Bar dataKey="Servicio Técnico" fill="url(#colorTecnico)" barSize={35} minPointSize={2} radius={[4, 4, 0, 0]}>
                          <LabelList
                            dataKey="Servicio Técnico"
                            position="top"
                            offset={10}
                            formatter={(val: number) => val > 0 ? val : ""}
                            style={{ fill: '#ff9933', fontSize: '12px', fontWeight: '900', fontStyle: 'italic' }}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                {/* GRÁFICO DE DISTRIBUCIÓN (PieChart) */}
                <div className={`rounded-[3rem] shadow-2xl flex flex-col items-center justify-center relative p-10 h-[650px] transition-all duration-500 ${isDark ? 'bg-[#0a0a0a] border border-white/5' : 'bg-white border border-zinc-200'
                  }`}>

                  <h3 className={`text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-center italic ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    DISTRIBUCIÓN DE {selMesInt || 'HISTÓRICO'}
                  </h3>

                  <div className="relative w-full flex-1 flex items-center justify-center">
                    {/* TEXTO CENTRAL DINÁMICO (LAS LETRITAS) */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeIndex}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="flex flex-col items-center"
                        >
                          <span className={`text-6xl font-black italic tracking-tighter transition-colors duration-500 ${isDark ? 'text-white' : 'text-zinc-900' // <-- Color dinámico para el número
                            }`}>
                            {activeIndex === -1
                              ? currentPieDataInt.reduce((a, b) => a + b.value, 0)
                              : currentPieDataInt[activeIndex].value}
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mt-1">
                            {activeIndex === -1 ? 'TOTAL ÓRDENES' : currentPieDataInt[activeIndex].name}
                          </span>
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={currentPieDataInt}
                          innerRadius="68%"
                          outerRadius="88%"
                          paddingAngle={8}
                          dataKey="value"
                          stroke="none"
                          labelLine={false}
                          label={renderCustomizedLabel}
                          onMouseEnter={(_, index) => setActiveIndex(index)}
                          onMouseLeave={() => setActiveIndex(-1)}
                          animationDuration={1000}
                        >
                          {currentPieDataInt.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.color}
                              opacity={activeIndex === -1 ? 1 : (activeIndex === index ? 1 : 0.3)}
                              style={{
                                filter: activeIndex === index ? `drop-shadow(0 0 15px ${entry.color})` : 'none',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer',
                                outline: 'none'
                              }}
                            />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* LEYENDA TOTALMENTE CENTRADA Y ALINEADA */}
                  <div className="flex flex-wrap justify-center gap-x-10 gap-y-6 mt-6 w-full max-w-md">
                    {currentPieDataInt.map((entry, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-3 transition-all duration-300 ${activeIndex === index ? 'scale-110' : 'opacity-80'}`}
                      >
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color, boxShadow: `0 0 10px ${entry.color}44` }} />
                        <div className="flex items-baseline gap-2">
                          <span className="text-[13px] font-black text-zinc-400 uppercase italic tracking-tight">
                            {entry.name}
                          </span>
                          <span className="text-[15px] font-black text-white italic">
                            {entry.value}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
            {/* ESTADÍSTICAS CABLE */}
            <section>
              <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10 px-2">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-10 bg-emerald-500 rounded-full shadow-[0_0_15px_#10b981]"></div>
                  <h2 className={`text-3xl font-black italic uppercase tracking-tighter leading-none text-[#32CD32] drop-[0_0_15px_rgba(16,185,129,0.7)]`}>
                    HISTÓRICO CABLE
                  </h2>
                </div>

                <select
                  value={selMesCab}
                  onChange={(e) => setSelMesCab(e.target.value)}
                  className={`font-black italic text-xs rounded-xl px-6 py-3 outline-none transition-all cursor-pointer shadow-lg
    ${isDark
                      ? 'bg-[#0f0f0f] border border-white/10 text-emerald-500 focus:border-emerald-500/50'
                      : 'bg-white border border-zinc-200 text-emerald-700 focus:border-emerald-500/50'
                    }`}>
                  <option value="">TODOS LOS MESES</option>
                  {metrics.statsCableGlobal.listaMeses.map(m => <option key={m} value={m} className={`${isDark ? 'bg-black text-white' : 'bg-white text-zinc-800'}`}>{m}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <motion.div
                  ref={chartRef}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`lg:col-span-3 p-10 rounded-[3rem] h-[650px] shadow-2xl relative overflow-hidden transition-colors ${isDark ? 'bg-[#0a0a0a] border border-white/5' : 'bg-white border border-zinc-200'
                    }`}
                >
                  <div className="flex justify-between items-start mb-10">
                    <div>
                      <h3 className={`text-2xl font-black italic uppercase tracking-tighter ${isDark ? 'text-white' : 'text-zinc-800'}`}>
                        Movimiento Mensual
                      </h3>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Análisis de Operaciones</p>
                    </div>

                    <button
                      onClick={handleDownload}
                      className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-zinc-400 hover:text-emerald-500 transition-all active:scale-90"
                      title="Descargar como PNG"
                    >
                      <ArrowDownRight size={20} />
                    </button>
                  </div>

                  <div className={`h-[600px] w-full p-4 rounded-2xl transition-colors duration-500 ${isDark ? 'bg-[#050505]' : 'bg-zinc-50'
                    }`}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={selMesCab ? metrics.statsCableGlobal.barData.filter((d: any) => d.name === selMesCab) : metrics.statsCableGlobal.barData}
                        margin={{ top: 70, right: 30, left: 0, bottom: 100 }}
                        barGap={2}
                        barCategoryGap="15%"
                      >
                        <defs>
                          <linearGradient id="colorCortes" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ff4d4d" /><stop offset="95%" stopColor="#7f1d1d" /></linearGradient>
                          <linearGradient id="colorInstal" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#2eb872" /><stop offset="95%" stopColor="#064e3b" /></linearGradient>
                          <linearGradient id="colorRecon" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#cc66ff" /><stop offset="95%" stopColor="#581c87" /></linearGradient>
                          <linearGradient id="colorRecup" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3399ff" /><stop offset="95%" stopColor="#1e3a8a" /></linearGradient>
                          <linearGradient id="colorTecnico" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ff9933" /><stop offset="95%" stopColor="#7c2d12" /></linearGradient>
                        </defs>

                        <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />

                        <XAxis
                          dataKey="name"
                          stroke={isDark ? "#fff" : "#666"} // <-- Cambia según el tema
                          fontSize={12}
                          fontWeight="900"
                          axisLine={{ stroke: isDark ? '#333' : '#ddd' }} // <-- Línea base dinámica
                          tickLine={false}
                          height={60}
                          dy={10}
                        />

                        <YAxis
                          stroke={isDark ? "#444" : "#999"} // <-- Números laterales dinámicos
                          fontSize={12}
                          fontWeight="bold"
                          axisLine={false}
                          tickLine={false}
                        />

                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />

                        <Legend layout="horizontal" verticalAlign="top" align="center" wrapperStyle={{ paddingBottom: '60px' }} />

                        {/* RENDERIZADO DE BARRAS: minPointSize={2} asegura que el 1 se vea como una línea base */}
                        {/* El contenido personalizado del Label oculta los ceros */}

                        <Bar dataKey="Instalaciones" fill="url(#colorInstal)" barSize={35} minPointSize={2} radius={[4, 4, 0, 0]}>
                          <LabelList
                            dataKey="Instalaciones"
                            position="top"
                            offset={12}
                            formatter={(val: number) => val > 0 ? val : ""}
                            style={{ fill: '#2eb872', fontSize: '12px', fontWeight: '900', fontStyle: 'italic' }}
                          />
                        </Bar>

                        <Bar dataKey="Cortes" fill="url(#colorCortes)" barSize={35} minPointSize={2} radius={[4, 4, 0, 0]}>
                          <LabelList
                            dataKey="Cortes"
                            position="top"
                            offset={12}

                            formatter={(val: number) => val > 0 ? val : ""}
                            style={{ fill: '#ff4d4d', fontSize: '12px', fontWeight: '900', fontStyle: 'italic' }}
                          />
                        </Bar>



                        <Bar dataKey="Reconexiones" fill="url(#colorRecon)" barSize={35} minPointSize={2} radius={[4, 4, 0, 0]}>
                          <LabelList
                            dataKey="Reconexiones"
                            position="top"
                            offset={12}
                            formatter={(val: number) => val > 0 ? val : ""}
                            style={{ fill: '#cc66ff', fontSize: '12px', fontWeight: '900', fontStyle: 'italic' }}
                          />
                        </Bar>

                        <Bar dataKey="Recuperaciones" fill="url(#colorRecup)" barSize={35} minPointSize={2} radius={[4, 4, 0, 0]}>
                          <LabelList
                            dataKey="Recuperaciones"
                            position="top"
                            offset={12}
                            formatter={(val: number) => val > 0 ? val : ""}
                            style={{ fill: '#3399ff', fontSize: '12px', fontWeight: '900', fontStyle: 'italic' }}
                          />
                        </Bar>

                        <Bar dataKey="Servicio Técnico" fill="url(#colorTecnico)" barSize={35} minPointSize={2} radius={[4, 4, 0, 0]}>
                          <LabelList
                            dataKey="Servicio Técnico"
                            position="top"
                            offset={12}
                            formatter={(val: number) => val > 0 ? val : ""}
                            style={{ fill: '#ff9933', fontSize: '12px', fontWeight: '900', fontStyle: 'italic' }}
                          />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                {/* GRÁFICO DE DISTRIBUCIÓN (PieChart) */}
                <div className={`rounded-[3rem] shadow-2xl flex flex-col items-center justify-center relative p-10 h-[650px] transition-all duration-500 ${isDark ? 'bg-[#0a0a0a] border border-white/5' : 'bg-white border border-zinc-200'
                  }`}>

                  <h3 className={`text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-center italic ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    DISTRIBUCIÓN DE {selMesCab || 'HISTÓRICO'}
                  </h3>

                  <div className="relative w-full flex-1 flex items-center justify-center">
                    {/* TEXTO CENTRAL DINÁMICO (LAS LETRITAS) */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeIndex}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="flex flex-col items-center"
                        >
                          <span className={`text-6xl font-black italic tracking-tighter transition-colors duration-500 ${isDark ? 'text-white' : 'text-zinc-900' // <-- Color dinámico para el número
                            }`}>
                            {activeIndex === -1
                              ? currentPieDataCab.reduce((a, b) => a + b.value, 0)
                              : currentPieDataCab[activeIndex].value}
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mt-1">
                            {activeIndex === -1 ? 'TOTAL ÓRDENES' : currentPieDataCab[activeIndex].name}
                          </span>
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={currentPieDataCab}
                          innerRadius="68%"
                          outerRadius="88%"
                          paddingAngle={8}
                          dataKey="value"
                          stroke="none"
                          labelLine={false}
                          label={renderCustomizedLabel}
                          onMouseEnter={(_, index) => setActiveIndex(index)}
                          onMouseLeave={() => setActiveIndex(-1)}
                          animationDuration={1000}
                        >
                          {currentPieDataCab.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={entry.color}
                              opacity={activeIndex === -1 ? 1 : (activeIndex === index ? 1 : 0.3)}
                              style={{
                                filter: activeIndex === index ? `drop-shadow(0 0 15px ${entry.color})` : 'none',
                                transition: 'all 0.3s ease',
                                cursor: 'pointer',
                                outline: 'none'
                              }}
                            />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* LEYENDA TOTALMENTE CENTRADA Y ALINEADA */}
                  <div className="flex flex-wrap justify-center gap-x-10 gap-y-6 mt-6 w-full max-w-md">
                    {currentPieDataCab.map((entry, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-3 transition-all duration-300 ${activeIndex === index ? 'scale-110' : 'opacity-80'}`}
                      >
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color, boxShadow: `0 0 10px ${entry.color}44` }} />
                        <div className="flex items-baseline gap-2">
                          <span className="text-[13px] font-black text-zinc-400 uppercase italic tracking-tight">
                            {entry.name}
                          </span>
                          <span className="text-[15px] font-black text-white italic">
                            {entry.value}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
            <section className={`mt-16 border rounded-[3rem] p-10 shadow-2xl relative overflow-hidden transition-colors duration-500 ${isDark ? 'bg-[#0a0a0a] border-white/5' : 'bg-white border-zinc-200 shadow-xl'
              }`}>
              <div className="flex justify-between items-end mb-12 relative z-10">
                <div>
                  <h2 className={`text-4xl font-black italic uppercase tracking-tighter leading-none transition-colors duration-500 ${isDark
                    ? 'text-[#10b981] drop-shadow-[0_0_15px_rgba(16,185,129,0.7)]'
                    : 'text-emerald-600'
                    }`}>
                    PRODUCCIÓN {statsMesActual.nombreMes}
                  </h2>
                  <p className={`text-[10px] font-bold uppercase tracking-[0.3em] mt-2 ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    Consolidado de Instalaciones
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (confirm("¿Reiniciar el contador manual? (El conteo de Excel no se borrará)")) {
                      setManualAdjInt(0); setManualAdjCab(0);
                      localStorage.removeItem('adj_int'); localStorage.removeItem('adj_cab');
                    }
                  }}
                  className={`p-4 rounded-2xl transition-all shadow-lg ${isDark
                    ? 'bg-white/5 hover:bg-red-500 text-zinc-500 hover:text-white border border-white/5'
                    : 'bg-zinc-100 hover:bg-red-500 text-zinc-400 hover:text-white border border-zinc-200'
                    }`}
                >
                  <RefreshCw size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">

                {/* CAJA INTERNET */}
                <div className={`border p-8 rounded-[2.5rem] transition-colors duration-500 ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-zinc-50 border-zinc-100'
                  }`}>
                  <div className="flex justify-between items-start mb-6 italic">
                    <Wifi className="text-emerald-500" size={28} />
                    <div className="text-right leading-tight">
                      <p className={`text-[9px] font-black uppercase ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                        Sistema: {statsMesActual.internet}
                      </p>
                      <p className="text-[9px] font-black text-emerald-500 uppercase">
                        Ajuste: {manualAdjInt}
                      </p>
                    </div>
                  </div>
                  <p className={`text-[11px] font-black uppercase tracking-widest mb-1 text-center ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    Total Internet
                  </p>
                  <h4 className={`text-6xl font-black italic text-center mb-8 tracking-tighter transition-colors duration-500 ${isDark ? 'text-white' : 'text-zinc-900'
                    }`}>
                    {statsMesActual.internet + manualAdjInt}
                  </h4>
                  <div className="flex gap-2">
                    <input
                      type="number" value={inputValInt} onChange={e => setInputValInt(e.target.value)}
                      placeholder="Sumar..."
                      className={`w-full border rounded-xl px-4 py-3 font-black outline-none transition-all ${isDark
                        ? 'bg-black border-white/10 text-white focus:border-emerald-500/50'
                        : 'bg-white border-zinc-200 text-zinc-900 focus:border-emerald-500/50 shadow-inner'
                        }`}
                    />
                    <button onClick={() => handleSumarManual('int')} className="bg-emerald-500 text-black px-6 rounded-xl font-black hover:bg-emerald-400 transition-all active:scale-90 shadow-lg shadow-emerald-500/20">+</button>
                  </div>
                </div>

                {/* CAJA CABLE */}
                <div className={`border p-8 rounded-[2.5rem] transition-colors duration-500 ${isDark ? 'bg-white/[0.02] border-white/5' : 'bg-zinc-50 border-zinc-100'
                  }`}>
                  <div className="flex justify-between items-start mb-6 italic">
                    <Tv className="text-lime-500" size={28} />
                    <div className="text-right leading-tight">
                      <p className={`text-[9px] font-black uppercase ${isDark ? 'text-zinc-500' : 'text-zinc-400'}`}>
                        Sistema: {statsMesActual.cable}
                      </p>
                      <p className="text-[9px] font-black text-lime-500 uppercase">
                        Ajuste: {manualAdjCab}
                      </p>
                    </div>
                  </div>
                  <p className={`text-[11px] font-black uppercase tracking-widest mb-1 text-center ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
                    Total Cable
                  </p>
                  <h4 className={`text-6xl font-black italic text-center mb-8 tracking-tighter transition-colors duration-500 ${isDark ? 'text-white' : 'text-zinc-900'
                    }`}>
                    {statsMesActual.cable + manualAdjCab}
                  </h4>
                  <div className="flex gap-2">
                    <input
                      type="number" value={inputValCab} onChange={e => setInputValCab(e.target.value)}
                      placeholder="Sumar..."
                      className={`w-full border rounded-xl px-4 py-3 font-black outline-none transition-all ${isDark
                        ? 'bg-black border-white/10 text-white focus:border-lime-500/50'
                        : 'bg-white border-zinc-200 text-zinc-900 focus:border-lime-500/50 shadow-inner'
                        }`}
                    />
                    <button onClick={() => handleSumarManual('cab')} className="bg-lime-500 text-black px-6 rounded-xl font-black hover:bg-lime-400 transition-all active:scale-90 shadow-lg shadow-lime-500/20">+</button>
                  </div>
                </div>

                {/* TOTAL GENERAL (Siempre destaca) */}
                <div className={`p-8 rounded-[2.5rem] flex flex-col items-center justify-center group transition-all duration-500 ${isDark
                  ? 'bg-emerald-500 text-black shadow-[0_0_50px_rgba(16,185,129,0.2)]'
                  : 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/30'
                  }`}>
                  <Layers size={40} className="mb-4 opacity-40" />
                  <p className={`text-[13px] font-black uppercase tracking-[0.3em] mb-2 ${isDark ? 'text-emerald-900' : 'text-emerald-100'}`}>Total General</p>
                  <h4 className="text-8xl font-black italic tracking-tighter group-hover:scale-110 transition-transform duration-500">
                    {(statsMesActual.internet + manualAdjInt) + (statsMesActual.cable + manualAdjCab)}
                  </h4>
                  <div className={`mt-4 flex gap-4 ${isDark ? 'opacity-60' : 'opacity-80'}`}>
                    <div className="flex items-center gap-1"><Wifi size={12} /> <span className="text-[10px] font-bold uppercase">{statsMesActual.internet + manualAdjInt}</span></div>
                    <div className="flex items-center gap-1"><Tv size={12} /> <span className="text-[10px] font-bold uppercase">{statsMesActual.cable + manualAdjCab}</span></div>
                  </div>
                </div>

              </div>
            </section>
          </div>

        </main>
      ) : (
        /* 1. Eliminamos h-[75vh] y justify-center. Usamos un margen superior negativo mt-[-40px] para subirlo */
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-start mt-[-20px] md:mt-[-40px] relative">

          {/* Efecto de luz ambiental más sutil y centrado */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center relative z-10"
          >
            {/* 2. Reducimos el tamaño del contenedor del logo central para que no ocupe tanto espacio vertical */}
            <div className="relative mb-6">
              <motion.div
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
                className={`w-32 h-32 md:w-40 md:h-40 mx-auto rounded-[2rem] flex items-center justify-center transition-all duration-500 ${isDark
                    ? 'bg-transparent shadow-[0_0_40px_rgba(16,185,129,0.1)]'
                    : 'bg-white border-zinc-200 shadow-xl'
                  }`}
              >
                <img
                  src="/logo.png"
                  alt="Finex Welcome"
                  className="w-24 h-24 md:w-32 md:h-32 object-contain drop-shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                />
              </motion.div>

              <div className="absolute bottom-1 right-1/4 w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg rotate-12">
                <Activity className="text-black w-4 h-4" strokeWidth={3} />
              </div>
            </div>

            {/* 3. Ajustamos el interlineado y margen de los textos */}
            <h1 className={`text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-[0.85] mb-4 transition-colors duration-500 ${isDark ? 'text-white' : 'text-zinc-900'
              }`}>
              Bienvenido al <br />
              <span className="text-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.3)] text-5xl md:text-7xl">Sistema Finex</span>
            </h1>

            <p className={`text-[10px] md:text-[12px] font-black uppercase tracking-[0.4em] mb-8 italic ${isDark ? 'text-zinc-500' : 'text-zinc-400'
              }`}>
              Core System • Gestión de Servicios
            </p>

            {/* 4. Botón de estado más compacto */}
            <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-xl border transition-all duration-500 ${isDark
                ? 'bg-white/[0.02] border-white/5 text-zinc-500'
                : 'bg-zinc-100 border-zinc-200 text-zinc-400 shadow-sm'
              }`}>
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
              <span className="text-[9px] font-black uppercase tracking-widest">
                Esperando vinculación de Google Sheets...
              </span>
            </div>
          </motion.div>

          {/* 5. Marca de agua: la subimos un poco para que no estire el scroll hacia abajo */}
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[120px] md:text-[200px] font-black italic uppercase pointer-events-none opacity-[0.015] select-none z-0 ${isDark ? 'text-white' : 'text-black'
            }`}>
            FINEX
          </div>
        </div>
      )}

      {/* MODALES DINÁMICOS */}
      <AnimatePresence>
        {activeModal === 'total' && (
          <DetailModal
            isOpen={true}
            title="Relación Total de Clientes"
            data={metrics?.total}
            isDark={isDark}
            onClose={() => setActiveModal(null)}
          />
        )}
        {activeModal === 'activos' && (
          <DetailModal
            isOpen={true}
            title="Detalle Clientes Activos"
            data={metrics?.activos}
            isDark={isDark}
            showStates={true}
            onClose={() => setActiveModal(null)}
          />
        )}
        {activeModal === 'cortados' && (
          <DetailModal
            isOpen={true}
            title="Detalle Clientes Cortados"
            data={metrics?.cortados}
            isDark={isDark}
            showStates={true}
            onClose={() => setActiveModal(null)}
          />
        )}
        {activeModal === 'instalaciones' && (
          <DetailModal
            isOpen={true}
            title="INSTALACIONES INTERNET REGISTRADAS"
            onClose={() => setActiveModal(null)}
            data={metrics?.datosInstalaciones} // Pasamos la data ya filtrada
            isDark={isDark}
          />
        )}
        {activeModal === 'os_cortados' && (
          <DetailModal
            isOpen={true}
            title="CORTES REGISTRADOS"
            onClose={() => setActiveModal(null)}
            data={metrics?.datosCortes}
            isDark={isDark}
          />
        )}
        {activeModal === 'os_reconexiones' && (
          <DetailModal
            isOpen={true}
            title="RECONEXIONES INTERNET REGISTRADAS"
            onClose={() => setActiveModal(null)}
            data={metrics?.datosReconexiones}
            isDark={isDark}
          />
        )}
        {activeModal === 'os_tecnico' && (
          <DetailModal
            isOpen={true}
            title="SERVICIOS REGISTRADOS"
            onClose={() => setActiveModal(null)}
            data={metrics?.datosTecnico}
            isDark={isDark}
          />
        )}
        {activeModal === 'os_recuperacion' && (
          <DetailModal
            isOpen={true}
            title="RECUPERACIÓN DE ONUS"
            onClose={() => setActiveModal(null)}
            data={metrics?.datosRecuperacion}
            isDark={isDark}
          />
        )}

        {activeModal === 'os_cable_instalaciones' && (
          <DetailModal
            isOpen={true}
            title="INSTALACIONES CABLE REGISTRADAS"
            onClose={() => setActiveModal(null)}
            data={metrics?.datosCableInst}
            isDark={isDark}
          />
        )}
        {activeModal === 'os_cable_cortes' && (
          <DetailModal
            isOpen={true}
            title="CORTES CABLE REGISTRADAS"
            onClose={() => setActiveModal(null)}
            data={metrics?.datosCableCortes}
            isDark={isDark}
          />
        )}
        {activeModal === 'os_cable_reconexiones' && (
          <DetailModal
            isOpen={true}
            title="RECONEXIONES CABLE REGISTRADAS"
            onClose={() => setActiveModal(null)}
            data={metrics?.datosCableReconectar}
            isDark={isDark}
          />
        )}
        {activeModal === 'os_recoger_mininodo' && (
          <DetailModal
            isOpen={true}
            title="RECUPERACIÓN DE MININODOS"
            onClose={() => setActiveModal(null)}
            data={metrics?.datosCableRecoger}
            isDark={isDark}
          />
        )}
        {activeModal === 'os_cable_tecnico' && (
          <DetailModal
            isOpen={true}
            title="SERVICIOS REGISTRADOS" // Usamos el título especial para heredar estilo!
            onClose={() => setActiveModal(null)}
            data={metrics?.datosOSCable}
            isDark={isDark}
          />
        )}
      </AnimatePresence>
    </div>
  );
}