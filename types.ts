export type Category = 'Coffee' | 'Non-Coffee' | 'Snacks' | 'Event' | 'Best Seller';

export interface MenuItem {
  id: string;
  name_en: string;
  name_id: string;
  price: number;
  category: Category;
  description: string;
  image: string; // URL or Base64
  healthyScore: number; // 1-10
  ingredients: string[];
  isAvailable: boolean;
}

export interface CartItem extends MenuItem {
  cartId: string;
  quantity: number;
  sugarLevel: '0%' | '25%' | '50%' | '75%' | '100%';
  iceLevel: 'No Ice' | 'Less' | 'Normal' | 'Extra';
  extraShot: boolean;
  notes?: string;
}

export type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  tableNumber: number;
  items: CartItem[];
  totalAmount: number;
  status: OrderStatus;
  timestamp: number;
  paymentMethod: 'cash' | 'qris';
}

export interface EventConfig {
  isActive: boolean;
  eventName: string;
  tableCount: number;
  discountPercentage: number;
}

export interface SalesStat {
  name: string;
  sales: number;
}

export interface AppContextType {
  menu: MenuItem[];
  orders: Order[];
  eventConfig: EventConfig;
  isOnline: boolean;
  dbStatus: 'connected' | 'disconnected' | 'permission-denied';
  offlineQueue: Order[];
  setMenu: (menu: MenuItem[]) => void;
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  updateEventConfig: (config: EventConfig) => void;
  deleteMenuItem: (id: string) => void;
  addMenuItem: (item: MenuItem) => void;
  editMenuItem: (item: MenuItem) => void;
  resetData: () => void;
}