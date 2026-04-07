export interface SaleData {
  id: string;
  date: string;
  customer: string;
  product: string;
  amount: number;
  status: 'completed' | 'pending' | 'cancelled';
  category: string;
  district: 'VEGUETA' | 'HUAURA' | 'MEDIO MUNDO';
  serviceStatus: 'ACTIVO' | 'CORTADO' | 'SIN SERVICIO';
}

export interface DashboardStats {
  totalSales: number;
  activeUsers: number;
  totalCustomers: number;
  monthlyGrowth: number;
  totalOrders: number;
}
