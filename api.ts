import { MenuItem, Order, EventConfig } from './types';

const DB_URL = "https://moacoffee-9fa33-default-rtdb.asia-southeast1.firebasedatabase.app";

// Helper for requests
// Returns:
// - JSON Data (including null) if successful
// - undefined if Network/Permission error
const apiRequest = async (endpoint: string, method: string, body?: any) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const response = await fetch(`${DB_URL}${endpoint}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      // 401/403 = Rules locked. 404 = DB not created.
      // Silent fail to allow Offline Mode to take over.
      return undefined; 
    }

    return await response.json();
  } catch (error) {
    // Network error or Timeout. Silent fail for Offline Mode.
    return undefined;
  }
};

export const api = {
  // --- MENU ---
  fetchMenu: async (): Promise<MenuItem[] | null | undefined> => {
    const data = await apiRequest('/menu.json', 'GET');
    if (data === undefined) return undefined; // Error
    if (data === null) return null; // Empty DB
    
    // Firebase returns objects or arrays. Convert object map to array if necessary.
    return Array.isArray(data) ? data : Object.values(data);
  },
  
  syncMenu: async (menu: MenuItem[]) => {
    const menuMap = menu.reduce((acc, item) => ({ ...acc, [item.id]: item }), {});
    return apiRequest('/menu.json', 'PUT', menuMap);
  },

  // --- ORDERS ---
  fetchOrders: async (): Promise<Order[] | undefined> => {
    const data = await apiRequest('/orders.json', 'GET');
    if (data === undefined) return undefined; // Error
    if (data === null) return []; // Empty DB is valid for orders
    return Array.isArray(data) ? data : Object.values(data);
  },

  createOrder: async (order: Order) => {
    return apiRequest(`/orders/${order.id}.json`, 'PUT', order);
  },

  updateOrderStatus: async (orderId: string, status: Order['status']) => {
    return apiRequest(`/orders/${orderId}.json`, 'PATCH', { status });
  },

  // --- EVENT CONFIG ---
  fetchEventConfig: async (): Promise<EventConfig | undefined> => {
    const data = await apiRequest('/eventConfig.json', 'GET');
    if (data === undefined) return undefined;
    return data || { isActive: false, eventName: 'Event', tableCount: 10, discountPercentage: 0 };
  },

  updateEventConfig: async (config: EventConfig) => {
    return apiRequest('/eventConfig.json', 'PUT', config);
  }
};