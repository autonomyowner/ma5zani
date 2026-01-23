export interface Order {
  id: string
  customerName: string
  wilaya: string
  product: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered'
  amount: number
  date: string
}

export interface Product {
  id: string
  name: string
  sku: string
  stock: number
  price: number
  status: 'active' | 'low_stock' | 'out_of_stock'
}

export interface DashboardStats {
  ordersToday: number
  pendingOrders: number
  monthlyRevenue: number
  totalProducts: number
}

export const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    customerName: 'Fatima Meziane',
    wilaya: 'Algiers',
    product: 'Wireless Headphones Pro',
    status: 'delivered',
    amount: 8500,
    date: '2024-01-15',
  },
  {
    id: 'ORD-002',
    customerName: 'Youcef Boudiaf',
    wilaya: 'Oran',
    product: 'Smart Watch X200',
    status: 'shipped',
    amount: 15000,
    date: '2024-01-15',
  },
  {
    id: 'ORD-003',
    customerName: 'Amina Haddad',
    wilaya: 'Constantine',
    product: 'Leather Wallet Classic',
    status: 'processing',
    amount: 3200,
    date: '2024-01-15',
  },
  {
    id: 'ORD-004',
    customerName: 'Karim Benali',
    wilaya: 'Setif',
    product: 'Portable Speaker Mini',
    status: 'pending',
    amount: 5500,
    date: '2024-01-14',
  },
  {
    id: 'ORD-005',
    customerName: 'Sarah Mokrani',
    wilaya: 'Blida',
    product: 'USB-C Hub 7-in-1',
    status: 'delivered',
    amount: 4200,
    date: '2024-01-14',
  },
  {
    id: 'ORD-006',
    customerName: 'Mohamed Khelif',
    wilaya: 'Annaba',
    product: 'Wireless Mouse Ergonomic',
    status: 'shipped',
    amount: 2800,
    date: '2024-01-14',
  },
  {
    id: 'ORD-007',
    customerName: 'Lila Bensalem',
    wilaya: 'Tizi Ouzou',
    product: 'Laptop Stand Adjustable',
    status: 'processing',
    amount: 3800,
    date: '2024-01-13',
  },
  {
    id: 'ORD-008',
    customerName: 'Rachid Ouali',
    wilaya: 'Bejaia',
    product: 'Wireless Headphones Pro',
    status: 'pending',
    amount: 8500,
    date: '2024-01-13',
  },
]

export const mockProducts: Product[] = [
  {
    id: 'PRD-001',
    name: 'Wireless Headphones Pro',
    sku: 'WHP-001',
    stock: 45,
    price: 8500,
    status: 'active',
  },
  {
    id: 'PRD-002',
    name: 'Smart Watch X200',
    sku: 'SWX-200',
    stock: 12,
    price: 15000,
    status: 'low_stock',
  },
  {
    id: 'PRD-003',
    name: 'Leather Wallet Classic',
    sku: 'LWC-001',
    stock: 78,
    price: 3200,
    status: 'active',
  },
  {
    id: 'PRD-004',
    name: 'Portable Speaker Mini',
    sku: 'PSM-001',
    stock: 0,
    price: 5500,
    status: 'out_of_stock',
  },
  {
    id: 'PRD-005',
    name: 'USB-C Hub 7-in-1',
    sku: 'UCH-701',
    stock: 34,
    price: 4200,
    status: 'active',
  },
  {
    id: 'PRD-006',
    name: 'Wireless Mouse Ergonomic',
    sku: 'WME-001',
    stock: 8,
    price: 2800,
    status: 'low_stock',
  },
  {
    id: 'PRD-007',
    name: 'Laptop Stand Adjustable',
    sku: 'LSA-001',
    stock: 56,
    price: 3800,
    status: 'active',
  },
  {
    id: 'PRD-008',
    name: 'Power Bank 20000mAh',
    sku: 'PB2-001',
    stock: 23,
    price: 6200,
    status: 'active',
  },
]

export const mockStats: DashboardStats = {
  ordersToday: 24,
  pendingOrders: 12,
  monthlyRevenue: 458500,
  totalProducts: 8,
}
