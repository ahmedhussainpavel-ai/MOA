import React, { createContext, useContext, useEffect, useState } from 'react';
import { MenuItem, Order, EventConfig } from './types';
import { INITIAL_MENU } from './constants';

interface AppContextType {
  menu: MenuItem[];
  orders: Order[];
  eventConfig: EventConfig;
  setMenu: (menu: MenuItem[]) => void;
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  updateEventConfig: (config: EventConfig) => void;
  deleteMenuItem: (id: string) => void;
  addMenuItem: (item: MenuItem) => void;
  resetData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial state from local storage or defaults
  const [menu, setMenuState] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('moa_menu');
    return saved ? JSON.parse(saved) : INITIAL_MENU;
  });

  const [orders, setOrdersState] = useState<Order[]>(() => {
    const saved = localStorage.getItem('moa_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [eventConfig, setEventConfigState] = useState<EventConfig>(() => {
    const saved = localStorage.getItem('moa_event');
    return saved ? JSON.parse(saved) : {
      isActive: false,
      eventName: 'Grand Opening',
      tableCount: 10,
      discountPercentage: 0
    };
  });

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('moa_menu', JSON.stringify(menu));
  }, [menu]);

  useEffect(() => {
    localStorage.setItem('moa_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('moa_event', JSON.stringify(eventConfig));
  }, [eventConfig]);

  // Actions
  const setMenu = (newMenu: MenuItem[]) => setMenuState(newMenu);
  
  const addOrder = (order: Order) => {
    setOrdersState(prev => [order, ...prev]);
  };

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrdersState(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  };

  const updateEventConfig = (config: EventConfig) => setEventConfigState(config);

  const deleteMenuItem = (id: string) => {
    setMenuState(prev => prev.filter(item => item.id !== id));
  };

  const addMenuItem = (item: MenuItem) => {
    setMenuState(prev => [...prev, item]);
  };

  const resetData = () => {
    setMenuState(INITIAL_MENU);
    setOrdersState([]);
    localStorage.clear();
    window.location.reload();
  }

  return (
    <AppContext.Provider value={{
      menu,
      orders,
      eventConfig,
      setMenu,
      addOrder,
      updateOrderStatus,
      updateEventConfig,
      deleteMenuItem,
      addMenuItem,
      resetData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useStore must be used within an AppProvider');
  }
  return context;
};
