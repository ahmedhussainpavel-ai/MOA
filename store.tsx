import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { MenuItem, Order, EventConfig, AppContextType } from './types';
import { INITIAL_MENU } from './constants';
import { api } from './api';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // --- Network State ---
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [dbStatus, setDbStatus] = useState<'connected' | 'disconnected' | 'permission-denied'>('disconnected');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => {
      setIsOnline(false);
      setDbStatus('disconnected');
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // --- Data Loading (Initialize from LocalStorage first for speed) ---
  const [menu, setMenuState] = useState<MenuItem[]>(() => {
    try {
      const saved = localStorage.getItem('moa_menu');
      return saved ? JSON.parse(saved) : INITIAL_MENU;
    } catch { return INITIAL_MENU; }
  });

  const [orders, setOrdersState] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('moa_orders');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [offlineQueue, setOfflineQueue] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('moa_offline_queue');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const [eventConfig, setEventConfigState] = useState<EventConfig>(() => {
    try {
      const saved = localStorage.getItem('moa_event');
      return saved ? JSON.parse(saved) : { isActive: false, eventName: 'Event', tableCount: 10, discountPercentage: 0 };
    } catch { return { isActive: false, eventName: 'Event', tableCount: 10, discountPercentage: 0 }; }
  });

  // --- Firebase Integration & Sync ---

  // 1. Initial Load from Firebase
  useEffect(() => {
    const initData = async () => {
      if (!isOnline) {
        setDbStatus('disconnected');
        return;
      }

      try {
        // Load Menu to check connection
        const remoteMenu = await api.fetchMenu();
        
        if (remoteMenu === undefined) {
          // If undefined while online, it's likely a 401/403 Permission Error
          setDbStatus('permission-denied');
        } else {
          setDbStatus('connected');
          
          if (remoteMenu === null) {
            // DB is empty, sync initial data
            await api.syncMenu(INITIAL_MENU);
          } else {
            setMenuState(remoteMenu);
            localStorage.setItem('moa_menu', JSON.stringify(remoteMenu));
          }

          // Load Orders
          const remoteOrders = await api.fetchOrders();
          if (remoteOrders !== undefined) {
            const sorted = remoteOrders.sort((a, b) => b.timestamp - a.timestamp);
            setOrdersState(sorted);
            localStorage.setItem('moa_orders', JSON.stringify(sorted));
          }

          // Load Event Config
          const remoteConfig = await api.fetchEventConfig();
          if (remoteConfig !== undefined) {
            setEventConfigState(remoteConfig);
            localStorage.setItem('moa_event', JSON.stringify(remoteConfig));
          }
        }
      } catch (e) {
        setDbStatus('permission-denied');
      }
    };

    initData();
  }, [isOnline]);

  // 2. Real-time Polling (Only if connected)
  useEffect(() => {
    if (!isOnline || dbStatus !== 'connected') return;

    const interval = setInterval(async () => {
      try {
        const remoteOrders = await api.fetchOrders();
        if (remoteOrders !== undefined && Array.isArray(remoteOrders)) {
          const sorted = remoteOrders.sort((a, b) => b.timestamp - a.timestamp);
          setOrdersState(prev => {
             if (JSON.stringify(prev) !== JSON.stringify(sorted)) {
               localStorage.setItem('moa_orders', JSON.stringify(sorted));
               return sorted;
             }
             return prev;
          });
        }
        
        const remoteConfig = await api.fetchEventConfig();
        if (remoteConfig !== undefined) {
           setEventConfigState(prev => {
              if (JSON.stringify(prev) !== JSON.stringify(remoteConfig)) {
                 localStorage.setItem('moa_event', JSON.stringify(remoteConfig));
                 return remoteConfig;
              }
              return prev;
           });
        }
      } catch (e) {
        // Silent fail
      }
    }, 5000); 

    return () => clearInterval(interval);
  }, [isOnline, dbStatus]);


  // 3. Process Offline Queue
  useEffect(() => {
    const processQueue = async () => {
      if (isOnline && dbStatus === 'connected' && offlineQueue.length > 0) {
        const queueCopy = [...offlineQueue];
        
        // Try creating first order to check connection
        const firstOrder = await api.createOrder(queueCopy[0]);
        if (firstOrder === undefined) return;

        setOfflineQueue([]); // Optimistically clear
        localStorage.setItem('moa_offline_queue', JSON.stringify([]));

        // Sync rest
        for (let i = 1; i < queueCopy.length; i++) {
          await api.createOrder(queueCopy[i]);
        }
        
        // Refresh orders after sync
        const remoteOrders = await api.fetchOrders();
        if (remoteOrders !== undefined) {
           setOrdersState(remoteOrders.sort((a, b) => b.timestamp - a.timestamp));
        }
      }
    };
    processQueue();
  }, [isOnline, dbStatus, offlineQueue]);


  // --- Actions ---

  const addOrder = useCallback(async (order: Order) => {
    // 1. Optimistic Update
    setOrdersState(prev => [order, ...prev]);
    
    if (isOnline && dbStatus === 'connected') {
      // 2. Send to Cloud
      const result = await api.createOrder(order);
      // If API fails (result undefined), queue it locally
      if (result === undefined) {
         setOfflineQueue(prev => {
          const updated = [...prev, order];
          localStorage.setItem('moa_offline_queue', JSON.stringify(updated));
          return updated;
        });
      }
    } else {
      // 2. Queue for later
      setOfflineQueue(prev => {
        const updated = [...prev, order];
        localStorage.setItem('moa_offline_queue', JSON.stringify(updated));
        return updated;
      });
    }
  }, [isOnline, dbStatus]);

  const updateOrderStatus = useCallback(async (orderId: string, status: Order['status']) => {
    setOrdersState(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    if (isOnline && dbStatus === 'connected') {
      await api.updateOrderStatus(orderId, status);
    }
  }, [isOnline, dbStatus]);

  const updateEventConfig = useCallback(async (config: EventConfig) => {
    setEventConfigState(config);
    if (isOnline && dbStatus === 'connected') {
      await api.updateEventConfig(config);
    }
  }, [isOnline, dbStatus]);

  const syncMenuChanges = async (newMenu: MenuItem[]) => {
    setMenuState(newMenu);
    localStorage.setItem('moa_menu', JSON.stringify(newMenu));
    if (isOnline && dbStatus === 'connected') await api.syncMenu(newMenu);
  };

  const setMenu = useCallback((newMenu: MenuItem[]) => syncMenuChanges(newMenu), [isOnline, dbStatus]);

  const deleteMenuItem = useCallback((id: string) => {
    setMenuState(prev => {
      const newMenu = prev.filter(item => item.id !== id);
      syncMenuChanges(newMenu);
      return newMenu;
    });
  }, [isOnline, dbStatus]);

  const addMenuItem = useCallback((item: MenuItem) => {
    setMenuState(prev => {
      const newMenu = [...prev, item];
      syncMenuChanges(newMenu);
      return newMenu;
    });
  }, [isOnline, dbStatus]);

  const editMenuItem = useCallback((updatedItem: MenuItem) => {
    setMenuState(prev => {
      const newMenu = prev.map(item => item.id === updatedItem.id ? updatedItem : item);
      syncMenuChanges(newMenu);
      return newMenu;
    });
  }, [isOnline, dbStatus]);

  const resetData = useCallback(async () => {
    setMenuState(INITIAL_MENU);
    setOrdersState([]);
    setOfflineQueue([]);
    localStorage.clear();
    if (isOnline && dbStatus === 'connected') {
       await api.syncMenu(INITIAL_MENU);
    }
    window.location.reload();
  }, [isOnline, dbStatus]);

  const contextValue = useMemo(() => ({
    menu,
    orders,
    offlineQueue,
    eventConfig,
    isOnline,
    dbStatus,
    setMenu,
    addOrder,
    updateOrderStatus,
    updateEventConfig,
    deleteMenuItem,
    addMenuItem,
    editMenuItem,
    resetData
  }), [menu, orders, offlineQueue, eventConfig, isOnline, dbStatus, setMenu, addOrder, updateOrderStatus, updateEventConfig, deleteMenuItem, addMenuItem, editMenuItem, resetData]);

  return (
    <AppContext.Provider value={contextValue}>
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