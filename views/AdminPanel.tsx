import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, Coffee, ShoppingBag, LogOut, 
  Check, Clock, BarChart3, QrCode, Plus, Trash2, Edit2, AlertCircle,
  Search, Filter, Calendar, List, Columns, Eye, XCircle, ArrowRight, Settings,
  Menu as MenuIcon, X
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, AreaChart, Area, PieChart, Pie } from 'recharts';
import { useStore } from '../store';
import { Button, Card, Input, Badge, Modal, ImageUpload } from '../components/ui';
import { formatCurrency } from '../utils';
import { MenuItem, Category, Order, OrderStatus } from '../types';

export const AdminPanel: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const { 
    menu, orders, eventConfig, dbStatus,
    updateOrderStatus, deleteMenuItem, addMenuItem, editMenuItem, updateEventConfig, resetData
  } = useStore();
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'menu' | 'event' | 'settings'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Persistent Language State
  const [lang, setLang] = useState<'en' | 'id'>(() => {
    const saved = localStorage.getItem('moa_admin_lang');
    return (saved as 'en' | 'id') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('moa_admin_lang', lang);
  }, [lang]);
  
  const t = (en: string, id: string) => lang === 'en' ? en : id;

  // --- ORDER MANAGEMENT STATE ---
  const [orderViewMode, setOrderViewMode] = useState<'board' | 'list'>('board');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [orderDateFilter, setOrderDateFilter] = useState<'today' | 'week' | 'all'>('today');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // --- MENU MANAGEMENT STATE ---
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [menuForm, setMenuForm] = useState<Partial<MenuItem>>({
    category: 'Coffee',
    isAvailable: true,
    ingredients: [],
    image: '',
    name_en: '',
    name_id: '',
    price: 0,
    description: ''
  });

  // --- STATS CALCULATION ---
  const totalSales = orders.reduce((acc, o) => acc + o.totalAmount, 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending');

  // --- CHART DATA PREPARATION ---
  const categorySales = orders.flatMap(o => o.items).reduce((acc: any, item) => {
    acc[item.category] = (acc[item.category] || 0) + (item.price * item.quantity);
    return acc;
  }, {});
  
  const pieData = Object.keys(categorySales).map(key => ({ name: key, value: categorySales[key] }));
  const totalPieValue = pieData.reduce((sum, item) => sum + item.value, 0);
  
  const COLORS = ['#D4A85F', '#4A2E2A', '#8B6B4A', '#F4E9DA', '#FFFFFF'];

  const salesData = [
    { name: 'Mon', sales: 400000 },
    { name: 'Tue', sales: 300000 },
    { name: 'Wed', sales: 550000 },
    { name: 'Thu', sales: 450000 },
    { name: 'Fri', sales: 800000 },
    { name: 'Sat', sales: 1200000 },
    { name: 'Sun', sales: totalSales > 0 ? totalSales : 900000 },
  ];

  // --- FILTERED ORDERS LOGIC ---
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Search
      const matchesSearch = 
        order.id.toLowerCase().includes(orderSearch.toLowerCase()) || 
        order.tableNumber.toString().includes(orderSearch);
      
      // Status
      const matchesStatus = orderStatusFilter === 'all' || order.status === orderStatusFilter;
      
      // Date
      let matchesDate = true;
      const orderDate = new Date(order.timestamp);
      const today = new Date();
      
      if (orderDateFilter === 'today') {
        matchesDate = orderDate.toDateString() === today.toDateString();
      } else if (orderDateFilter === 'week') {
        const lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
        matchesDate = orderDate >= lastWeek;
      }

      return matchesSearch && matchesStatus && matchesDate;
    }).sort((a, b) => b.timestamp - a.timestamp);
  }, [orders, orderSearch, orderStatusFilter, orderDateFilter]);


  // --- HANDLERS ---
  const handleOpenMenuModal = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setMenuForm({ ...item });
    } else {
      setEditingItem(null);
      setMenuForm({
        category: 'Coffee',
        isAvailable: true,
        ingredients: ['House Blend'],
        image: '',
        name_en: '',
        name_id: '',
        price: 0,
        description: ''
      });
    }
    setIsMenuModalOpen(true);
  };

  const handleSaveMenu = () => {
    if (!menuForm.name_en || !menuForm.price) return;

    const itemData: MenuItem = {
      id: editingItem ? editingItem.id : Math.random().toString(36).substr(2, 9),
      name_en: menuForm.name_en!,
      name_id: menuForm.name_id || menuForm.name_en!,
      price: Number(menuForm.price),
      category: menuForm.category as Category,
      description: menuForm.description || '',
      image: menuForm.image || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=400',
      healthyScore: menuForm.healthyScore || 5,
      ingredients: typeof menuForm.ingredients === 'string' ? (menuForm.ingredients as string).split(',') : menuForm.ingredients || [],
      isAvailable: true
    };

    if (editingItem) {
      editMenuItem(itemData);
    } else {
      addMenuItem(itemData);
    }
    setIsMenuModalOpen(false);
  };

  const handleResetData = () => {
    if (confirm(t('Are you sure? This will delete ALL orders and reset the menu to default.', 'Apakah anda yakin? Ini akan menghapus SEMUA pesanan dan mereset menu.'))) {
      resetData();
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#161616] border-r border-white/5">
       <div className="p-6 md:p-8 flex justify-between items-center">
          <div>
            <h1 className="text-xl md:text-2xl font-display font-bold text-white tracking-tight">MOA <span className="text-moa-gold">ADMIN</span></h1>
            <p className="text-[10px] md:text-xs text-moa-cream/40 mt-1 uppercase tracking-wider font-semibold">Dashboard v2.0</p>
          </div>
          {/* Mobile Close Button */}
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-moa-cream/60">
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {[
            { id: 'dashboard', icon: LayoutDashboard, label: t('Overview', 'Ringkasan') },
            { id: 'orders', icon: ShoppingBag, label: t('Orders', 'Pesanan') },
            { id: 'menu', icon: Coffee, label: t('Menu', 'Menu') },
            { id: 'event', icon: QrCode, label: t('Event', 'Acara') },
            { id: 'settings', icon: Settings, label: t('Settings', 'Pengaturan') },
          ].map((item) => (
             <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as any);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                activeTab === item.id 
                  ? 'bg-moa-gold text-moa-dark font-bold shadow-lg shadow-moa-gold/20' 
                  : 'text-moa-cream/60 hover:bg-white/5 hover:text-moa-cream'
              }`}
            >
              <item.icon size={20} className={activeTab === item.id ? 'text-moa-dark' : 'text-moa-cream/40 group-hover:text-moa-gold transition-colors'} />
              <span>{item.label}</span>
              {item.id === 'orders' && pendingOrders.length > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {pendingOrders.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 md:p-6 border-t border-white/5 space-y-4">
           {/* Connection Status Indicator */}
           <div className={`flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-lg border ${
             dbStatus === 'connected' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
             dbStatus === 'permission-denied' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
             'bg-white/5 text-moa-cream/50 border-white/5'
           }`}>
             <div className={`w-2 h-2 rounded-full ${
               dbStatus === 'connected' ? 'bg-green-500 animate-pulse' : 
               dbStatus === 'permission-denied' ? 'bg-red-500' : 
               'bg-gray-500'
             }`} />
             <span className="truncate">
               {dbStatus === 'connected' ? 'Online' : 
                dbStatus === 'permission-denied' ? 'Denied' : 
                'Offline'}
             </span>
           </div>

           {/* Language Switcher */}
           <div className="bg-white/5 p-1 rounded-lg flex border border-white/5">
             <button onClick={() => setLang('en')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${lang === 'en' ? 'bg-moa-gold text-moa-dark' : 'text-moa-cream/50 hover:text-white'}`}>EN</button>
             <button onClick={() => setLang('id')} className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${lang === 'id' ? 'bg-moa-gold text-moa-dark' : 'text-moa-cream/50 hover:text-white'}`}>ID</button>
           </div>

           <button onClick={onLogout} className="flex items-center gap-2 text-red-400 text-sm hover:text-red-300 transition-colors w-full px-4 py-2 rounded-lg hover:bg-red-500/10 font-medium justify-center">
             <LogOut size={16} /> {t('Logout', 'Keluar')}
           </button>
        </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-moa-dark text-moa-cream font-sans overflow-hidden">
      
      {/* Mobile Header / Sidebar Toggle */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-moa-dark/90 backdrop-blur-md border-b border-white/5 p-4 flex justify-between items-center">
         <h1 className="text-lg font-display font-bold text-white">MOA <span className="text-moa-gold">ADMIN</span></h1>
         <button onClick={() => setIsSidebarOpen(true)} className="text-moa-cream">
           <MenuIcon size={24} />
         </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-full">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
          <div className="relative w-[80%] max-w-xs h-full bg-[#161616] shadow-2xl animate-in slide-in-from-left duration-300">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-moa-dark pt-16 md:pt-0">
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 pb-20 md:pb-8">

        {/* Database Warning Banner */}
        {dbStatus === 'permission-denied' && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between animate-pulse gap-3 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <AlertCircle size={24} className="flex-shrink-0" />
              <div>
                <h3 className="font-bold">Database Permission Denied</h3>
                <p className="text-sm opacity-80">Check Firebase Rules.</p>
              </div>
            </div>
            <a href="https://console.firebase.google.com" target="_blank" className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap">Fix Rules</a>
          </div>
        )}
        
        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl md:text-3xl font-bold font-display">{t('Store Overview', 'Ringkasan Toko')}</h2>
                <div className="flex gap-2">
                  <Badge variant="success">{t('Store Open', 'Toko Buka')}</Badge>
                  <span className="text-sm text-moa-cream/50">{new Date().toLocaleDateString()}</span>
                </div>
             </div>

             {/* Stat Cards */}
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <Card className="bg-gradient-to-br from-white/5 to-white/0 border-moa-gold/20">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-moa-cream/50 font-medium">{t('Revenue', 'Pendapatan')}</p>
                      <p className="text-2xl md:text-3xl font-bold text-moa-gold mt-2">{formatCurrency(totalSales)}</p>
                    </div>
                    <div className="p-2 bg-moa-gold/10 rounded-lg text-moa-gold"><BarChart3 size={20} /></div>
                  </div>
                </Card>
                <Card>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-moa-cream/50 font-medium">{t('Orders', 'Pesanan')}</p>
                      <p className="text-2xl md:text-3xl font-bold mt-2">{totalOrders}</p>
                    </div>
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><ShoppingBag size={20} /></div>
                  </div>
                </Card>
                <Card>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-moa-cream/50 font-medium">{t('Pending', 'Menunggu')}</p>
                      <p className="text-2xl md:text-3xl font-bold text-orange-400 mt-2">{pendingOrders.length}</p>
                    </div>
                    <div className="p-2 bg-orange-500/10 rounded-lg text-orange-400"><AlertCircle size={20} /></div>
                  </div>
                </Card>
                <Card>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-moa-cream/50 font-medium">{t('Avg Value', 'Rata-rata')}</p>
                      <p className="text-2xl md:text-3xl font-bold text-green-400 mt-2">{formatCurrency(totalOrders > 0 ? totalSales / totalOrders : 0)}</p>
                    </div>
                    <div className="p-2 bg-green-500/10 rounded-lg text-green-400"><Clock size={20} /></div>
                  </div>
                </Card>
             </div>

             {/* Charts Area */}
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               <Card className="col-span-1 lg:col-span-2 flex flex-col w-full h-[300px] md:h-[400px]">
                 <h3 className="font-bold text-lg mb-6 flex items-center gap-2">{t('Weekly Performance', 'Performa Mingguan')}</h3>
                 <div className="flex-1 w-full min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={salesData}>
                        <defs>
                          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#D4A85F" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#D4A85F" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value/1000}k`} />
                        <Tooltip 
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-[#1C1C1C] border border-white/10 p-3 rounded-xl shadow-2xl">
                                  <p className="text-moa-cream/60 text-xs mb-1 font-medium uppercase tracking-wider">{label}</p>
                                  <p className="text-white font-bold text-lg">{formatCurrency(payload[0].value as number)}</p>
                                  <p className="text-[10px] text-moa-gold mt-0.5 font-bold">{t('Revenue', 'Pendapatan')}</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                          cursor={{ stroke: '#ffffff20', strokeWidth: 1 }}
                        />
                        <Area type="monotone" dataKey="sales" stroke="#D4A85F" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                    </AreaChart>
                  </ResponsiveContainer>
                 </div>
               </Card>
               <Card className="col-span-1 flex flex-col w-full h-[300px] md:h-[400px]">
                  <h3 className="font-bold text-lg mb-6">{t('Categories', 'Kategori')}</h3>
                  <div className="flex-1 w-full min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData.length ? pieData : [{name: 'None', value: 1}]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0)" />
                          ))}
                        </Pie>
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              const percent = totalPieValue > 0 ? ((data.value / totalPieValue) * 100).toFixed(1) : '0';
                              return (
                                <div className="bg-[#1C1C1C] border border-white/10 p-3 rounded-xl shadow-2xl">
                                  <p className="font-bold text-white mb-1 text-sm">{data.name}</p>
                                  <div className="flex items-baseline gap-2">
                                    <span className="text-moa-gold font-bold">{formatCurrency(data.value)}</span>
                                    <span className="text-xs text-moa-cream/50">({percent}%)</span>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
               </Card>
             </div>
          </div>
        )}

        {/* ORDERS MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fade-in flex flex-col h-[calc(100vh-100px)] md:h-[calc(100vh-140px)]">
            
            {/* Header & Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 flex-shrink-0">
              <div>
                <h2 className="text-xl md:text-2xl font-bold font-display">{t('Order Management', 'Manajemen Pesanan')}</h2>
                <p className="text-sm text-moa-cream/50 hidden md:block">{t('Track and manage customer orders in real-time.', 'Lacak dan kelola pesanan pelanggan secara real-time.')}</p>
              </div>
              
              <div className="flex bg-white/5 p-1 rounded-lg border border-white/10 self-start md:self-auto">
                <button 
                  onClick={() => setOrderViewMode('board')}
                  className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-sm font-medium transition-all ${orderViewMode === 'board' ? 'bg-moa-gold text-moa-dark shadow-sm' : 'text-moa-cream/50 hover:text-white'}`}
                >
                  <Columns size={16} /> {t('Board', 'Papan')}
                </button>
                <button 
                  onClick={() => setOrderViewMode('list')}
                  className={`px-3 py-1.5 rounded-md flex items-center gap-2 text-sm font-medium transition-all ${orderViewMode === 'list' ? 'bg-moa-gold text-moa-dark shadow-sm' : 'text-moa-cream/50 hover:text-white'}`}
                >
                  <List size={16} /> {t('List', 'Daftar')}
                </button>
              </div>
            </div>

            {/* List View Toolbar */}
            {orderViewMode === 'list' && (
              <div className="flex flex-col md:flex-row gap-4 bg-white/5 p-4 rounded-xl border border-white/5 flex-shrink-0">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-moa-cream/40" size={18} />
                  <input 
                    type="text" 
                    placeholder={t('Search ID or Table...', 'Cari ID atau Meja...')}
                    className="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-moa-gold text-moa-cream"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                  />
                </div>
                <div className="flex gap-4 overflow-x-auto pb-1 md:pb-0">
                  <div className="relative min-w-[140px]">
                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-moa-cream/40" size={16} />
                    <select 
                      className="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-8 py-2 text-sm appearance-none focus:outline-none focus:border-moa-gold text-moa-cream cursor-pointer"
                      value={orderStatusFilter}
                      onChange={(e) => setOrderStatusFilter(e.target.value as OrderStatus | 'all')}
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="preparing">Preparing</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  <div className="relative min-w-[140px]">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-moa-cream/40" size={16} />
                    <select 
                      className="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-8 py-2 text-sm appearance-none focus:outline-none focus:border-moa-gold text-moa-cream cursor-pointer"
                      value={orderDateFilter}
                      onChange={(e) => setOrderDateFilter(e.target.value as any)}
                    >
                      <option value="today">Today</option>
                      <option value="week">Last 7 Days</option>
                      <option value="all">All Time</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW CONTENT */}
            {orderViewMode === 'board' ? (
              // BOARD VIEW
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1 min-h-0 overflow-y-auto md:overflow-hidden pb-20 md:pb-0">
                {['pending', 'preparing', 'delivered'].map(status => (
                  <div key={status} className="bg-white/5 rounded-2xl p-4 flex flex-col h-[400px] md:h-full border border-white/5 flex-shrink-0">
                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5 flex-shrink-0">
                      <h3 className="font-bold capitalize text-moa-gold flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${status === 'pending' ? 'bg-orange-500' : status === 'preparing' ? 'bg-blue-500' : 'bg-green-500'}`} />
                        {status === 'pending' ? t('Pending', 'Menunggu') : status === 'preparing' ? t('Preparing', 'Diproses') : t('Delivered', 'Selesai')}
                      </h3>
                      <span className="text-xs bg-white/10 px-2 py-1 rounded-md text-white font-mono">{orders.filter(o => o.status === status).length}</span>
                    </div>
                    
                    <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2 pb-2">
                       {orders.filter(o => o.status === status).map(order => (
                         <Card key={order.id} className="bg-moa-dark border-white/5 hover:border-moa-gold/30 transition-colors flex-shrink-0">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <span className="font-bold text-lg text-white">{t('Table', 'Meja')} {order.tableNumber}</span>
                                <div className="text-xs text-moa-cream/40 flex items-center gap-1 mt-1">
                                   <Clock size={10} /> {new Date(order.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </div>
                              </div>
                              <span className="text-xs font-mono opacity-30">#{order.id}</span>
                            </div>
                            <div className="space-y-2 mb-4 bg-white/5 p-2 rounded-lg">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="text-sm flex justify-between items-center">
                                  <span className="opacity-90">{item.quantity}x {lang === 'en' ? item.name_en : item.name_id}</span>
                                </div>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              {status === 'pending' && (
                                <>
                                 <Button onClick={() => updateOrderStatus(order.id, 'cancelled')} variant="danger" className="w-1/3 py-2 text-xs">{t('Reject', 'Tolak')}</Button>
                                 <Button onClick={() => updateOrderStatus(order.id, 'preparing')} className="w-2/3 py-2 text-xs">{t('Accept', 'Terima')}</Button>
                                </>
                              )}
                              {status === 'preparing' && (
                                <Button onClick={() => updateOrderStatus(order.id, 'delivered')} variant="secondary" className="w-full py-2 text-xs">{t('Mark Ready', 'Siap Saji')}</Button>
                              )}
                              {status === 'delivered' && (
                                 <div className="flex items-center justify-center gap-2 text-xs text-green-500 font-bold w-full bg-green-500/10 py-2 rounded-lg border border-green-500/20">
                                   <Check size={14} /> {t('Completed', 'Selesai')}
                                 </div>
                              )}
                            </div>
                         </Card>
                       ))}
                       {orders.filter(o => o.status === status).length === 0 && (
                         <div className="text-center py-10 text-moa-cream/20">
                           <ShoppingBag size={40} className="mx-auto mb-2 opacity-50" />
                           <p className="text-sm">{t('No orders', 'Tidak ada pesanan')}</p>
                         </div>
                       )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // LIST VIEW
              <div className="bg-white/5 rounded-2xl border border-white/5 flex-1 overflow-hidden flex flex-col">
                <div className="overflow-x-auto overflow-y-auto custom-scrollbar flex-1">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead className="bg-white/5 text-moa-cream/60 text-xs uppercase tracking-wider sticky top-0 backdrop-blur-md z-10">
                      <tr>
                        <th className="p-4 font-bold border-b border-white/5">Order ID</th>
                        <th className="p-4 font-bold border-b border-white/5">{t('Table', 'Meja')}</th>
                        <th className="p-4 font-bold border-b border-white/5">{t('Date/Time', 'Waktu')}</th>
                        <th className="p-4 font-bold border-b border-white/5">{t('Status', 'Status')}</th>
                        <th className="p-4 font-bold border-b border-white/5">{t('Total', 'Total')}</th>
                        <th className="p-4 font-bold border-b border-white/5 text-right">{t('Actions', 'Aksi')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredOrders.length > 0 ? (
                        filteredOrders.map(order => (
                          <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                            <td className="p-4 font-mono text-sm text-moa-cream/80">#{order.id}</td>
                            <td className="p-4 text-sm font-bold text-white">{order.tableNumber}</td>
                            <td className="p-4 text-sm text-moa-cream/60">
                              {new Date(order.timestamp).toLocaleString([], {month:'short', day:'numeric', hour: '2-digit', minute:'2-digit'})}
                            </td>
                            <td className="p-4">
                              <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full border ${
                                order.status === 'pending' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                order.status === 'preparing' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                order.status === 'delivered' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                'bg-red-500/10 text-red-400 border-red-500/20'
                              }`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="p-4 text-sm font-bold text-moa-gold">{formatCurrency(order.totalAmount)}</td>
                            <td className="p-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button 
                                  onClick={() => setSelectedOrder(order)}
                                  className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-moa-cream transition-colors"
                                  title="View Details"
                                >
                                  <Eye size={16} />
                                </button>
                                {order.status === 'pending' && (
                                  <>
                                    <button onClick={() => updateOrderStatus(order.id, 'preparing')} className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors border border-blue-500/20"><ArrowRight size={16} /></button>
                                    <button onClick={() => updateOrderStatus(order.id, 'cancelled')} className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors border border-red-500/20"><XCircle size={16} /></button>
                                  </>
                                )}
                                {order.status === 'preparing' && (
                                  <button onClick={() => updateOrderStatus(order.id, 'delivered')} className="p-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg transition-colors border border-green-500/20"><Check size={16} /></button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-moa-cream/40">
                             {t('No orders found matching your filters.', 'Tidak ada pesanan yang cocok.')}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* MENU MANAGER */}
        {activeTab === 'menu' && (
           <div className="space-y-6 animate-fade-in">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
               <div>
                 <h2 className="text-2xl font-bold font-display">{t('Menu Catalog', 'Katalog Menu')}</h2>
                 <p className="text-sm text-moa-cream/50">{t('Manage your items, prices, and availability.', 'Kelola item, harga, dan ketersediaan.')}</p>
               </div>
               <Button onClick={() => handleOpenMenuModal()} className="gap-2 w-full sm:w-auto"><Plus size={18} /> {t('Add New Item', 'Tambah Item')}</Button>
             </div>

             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
               {menu.map(item => (
                 <div key={item.id} className="bg-white/5 rounded-xl overflow-hidden group border border-white/5 hover:border-moa-gold/50 transition-all hover:-translate-y-1 flex flex-col">
                    <div className="relative h-32 md:h-40 overflow-hidden shrink-0">
                      <img src={item.image} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" loading="lazy" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                         <button onClick={() => handleOpenMenuModal(item)} className="p-2 bg-moa-gold text-moa-dark rounded-lg hover:bg-white transition-colors"><Edit2 size={16} /></button>
                         <button onClick={() => deleteMenuItem(item.id)} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"><Trash2 size={16} /></button>
                      </div>
                      <div className="absolute top-2 right-2">
                        <Badge variant="info">{item.category}</Badge>
                      </div>
                    </div>
                    <div className="p-3 md:p-4 flex flex-col flex-1">
                      <h4 className="font-bold text-white truncate text-sm md:text-base">{lang === 'en' ? item.name_en : item.name_id}</h4>
                      <div className="flex justify-between items-center mt-auto pt-2">
                        <p className="text-moa-gold font-bold text-sm md:text-base">{formatCurrency(item.price)}</p>
                        <div className={`w-2 h-2 rounded-full ${item.isAvailable ? 'bg-green-500' : 'bg-red-500'}`} />
                      </div>
                    </div>
                 </div>
               ))}
             </div>
           </div>
        )}

        {/* EVENT MODE */}
        {activeTab === 'event' && (
          <div className="max-w-3xl animate-fade-in">
             <Card>
               <div className="flex justify-between items-center mb-6 md:mb-8 border-b border-white/10 pb-6">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-moa-gold">{t('Event Mode', 'Mode Acara')}</h2>
                    <p className="text-xs md:text-sm opacity-60 mt-1">{t('Manage temporary events.', 'Kelola acara sementara.')}</p>
                  </div>
                  <div className={`w-14 h-8 md:w-16 md:h-9 rounded-full p-1 cursor-pointer transition-colors duration-300 flex-shrink-0 ${eventConfig.isActive ? 'bg-green-500' : 'bg-white/10'}`} onClick={() => updateEventConfig({...eventConfig, isActive: !eventConfig.isActive})}>
                    <div className={`w-6 h-6 md:w-7 md:h-7 bg-white rounded-full shadow-md transform transition-transform duration-300 ${eventConfig.isActive ? 'translate-x-6 md:translate-x-7' : ''}`} />
                  </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8">
                 <Input 
                    label={t('Event Name', 'Nama Acara')} 
                    value={eventConfig.eventName} 
                    onChange={e => updateEventConfig({...eventConfig, eventName: e.target.value})} 
                    placeholder="e.g. Grand Opening"
                  />
                 <Input 
                    label={t('Table Count', 'Jumlah Meja')} 
                    type="number" 
                    value={eventConfig.tableCount} 
                    onChange={e => updateEventConfig({...eventConfig, tableCount: Number(e.target.value)})} 
                  />
               </div>

               <div className="bg-moa-gold/10 border border-moa-gold/20 rounded-xl p-4 flex items-center gap-3 text-moa-gold mb-8">
                 <AlertCircle size={20} className="flex-shrink-0" />
                 <p className="text-sm">{t('Enabling Event Mode will show a special banner on the Customer App.', 'Mengaktifkan Mode Acara akan menampilkan banner khusus di Aplikasi Pelanggan.')}</p>
               </div>
             </Card>

             <div className="mt-8">
               <div className="flex justify-between items-center mb-6">
                 <h3 className="font-bold text-xl">{t('QR Codes', 'Kode QR')}</h3>
                 <Button variant="outline" size="sm" onClick={() => window.print()}>{t('Print', 'Cetak')}</Button>
               </div>
               
               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                 {Array.from({ length: eventConfig.tableCount }).map((_, i) => (
                   <div key={i} className="bg-white p-3 rounded-xl flex flex-col items-center gap-2 shadow-lg">
                     <img 
                       src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=MOA_TABLE_${i+1}`} 
                       alt="QR" 
                       className="w-full mix-blend-multiply opacity-90"
                       loading="lazy"
                     />
                     <span className="text-black font-bold text-xs bg-gray-100 px-2 py-0.5 rounded-full whitespace-nowrap">{t('Table', 'Meja')} {i+1}</span>
                   </div>
                 ))}
               </div>
             </div>
          </div>
        )}

        {/* SETTINGS */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl animate-fade-in space-y-6">
             <div className="mb-6">
                <h2 className="text-2xl font-bold font-display text-white">{t('Settings', 'Pengaturan')}</h2>
                <p className="text-sm text-moa-cream/50">{t('Manage configuration.', 'Kelola konfigurasi.')}</p>
             </div>
             
             <Card>
                <div className="space-y-6">
                   <div>
                      <h3 className="font-bold text-lg mb-4 text-moa-gold">{t('Language', 'Bahasa')}</h3>
                      <div className="flex gap-4">
                        <button 
                          onClick={() => setLang('en')}
                          className={`flex-1 p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                            lang === 'en' ? 'bg-moa-gold/10 border-moa-gold text-moa-gold' : 'bg-white/5 border-white/10 text-moa-cream/50 hover:bg-white/10'
                          }`}
                        >
                          <span className="text-2xl">🇬🇧</span>
                          <span className="font-bold">English</span>
                        </button>
                        <button 
                          onClick={() => setLang('id')}
                          className={`flex-1 p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                            lang === 'id' ? 'bg-moa-gold/10 border-moa-gold text-moa-gold' : 'bg-white/5 border-white/10 text-moa-cream/50 hover:bg-white/10'
                          }`}
                        >
                          <span className="text-2xl">🇮🇩</span>
                          <span className="font-bold">Indonesia</span>
                        </button>
                      </div>
                   </div>

                   <div className="pt-6 border-t border-white/10">
                      <h3 className="font-bold text-lg mb-2 text-red-400">{t('Danger Zone', 'Zona Bahaya')}</h3>
                      <p className="text-sm text-moa-cream/60 mb-4">{t('Resetting the system will delete all order history and revert the menu to the default list.', 'Mereset sistem akan menghapus semua riwayat pesanan dan mengembalikan menu ke default.')}</p>
                      
                      <Button variant="danger" fullWidth onClick={handleResetData} className="gap-2">
                         <Trash2 size={18} />
                         {t('Factory Reset', 'Reset Pabrik')}
                      </Button>
                   </div>
                </div>
             </Card>

             <div className="text-center pt-8 text-xs text-moa-cream/20 pb-8">
               <p>MOA COFFEE App v2.0.1</p>
               <p>Designed & Developed by Ahmed Hossain Pavel</p>
             </div>
          </div>
        )}
        
        </div>
      </main>

      {/* Menu Edit/Add Modal */}
      <Modal 
        isOpen={isMenuModalOpen} 
        onClose={() => setIsMenuModalOpen(false)} 
        title={editingItem ? t('Edit Item', 'Edit Item') : t('Add Item', 'Tambah Item')}
      >
        <div className="space-y-4">
          <ImageUpload 
            image={menuForm.image || ''} 
            onImageChange={(base64) => setMenuForm({...menuForm, image: base64})} 
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label={t("Name (EN)", "Nama (EN)")}
              value={menuForm.name_en} 
              onChange={e => setMenuForm({...menuForm, name_en: e.target.value})} 
              placeholder="Latte"
            />
            <Input 
              label={t("Name (ID)", "Nama (ID)")}
              value={menuForm.name_id} 
              onChange={e => setMenuForm({...menuForm, name_id: e.target.value})} 
              placeholder="Kopi Susu"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label={t("Price", "Harga")}
              type="number" 
              value={menuForm.price} 
              onChange={e => setMenuForm({...menuForm, price: Number(e.target.value)})} 
            />
             <div className="flex flex-col gap-1 w-full">
              <label className="text-sm text-moa-cream/70 ml-1 font-medium">{t("Category", "Kategori")}</label>
              <select 
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-moa-cream focus:border-moa-gold focus:outline-none w-full"
                value={menuForm.category}
                onChange={e => setMenuForm({...menuForm, category: e.target.value as Category})}
              >
                <option value="Coffee" className="bg-moa-dark">Coffee</option>
                <option value="Non-Coffee" className="bg-moa-dark">Non-Coffee</option>
                <option value="Snacks" className="bg-moa-dark">Snacks</option>
                <option value="Best Seller" className="bg-moa-dark">Best Seller</option>
                <option value="Event" className="bg-moa-dark">Event Special</option>
              </select>
            </div>
          </div>

          <Input 
            label={t("Description", "Deskripsi")}
            value={menuForm.description} 
            onChange={e => setMenuForm({...menuForm, description: e.target.value})} 
            placeholder={t("Details...", "Detail...")}
          />

          <div className="flex gap-3 justify-end pt-4 border-t border-white/10">
            <Button variant="ghost" onClick={() => setIsMenuModalOpen(false)}>{t("Cancel", "Batal")}</Button>
            <Button onClick={handleSaveMenu}>{editingItem ? t('Update', 'Perbarui') : t('Create', 'Buat')}</Button>
          </div>
        </div>
      </Modal>

      {/* Order Details Modal */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={t('Order Details', 'Detail Pesanan')}
        >
          <div className="space-y-6">
            <div className="flex justify-between items-start border-b border-white/10 pb-4">
               <div>
                  <h3 className="text-2xl font-bold text-moa-gold">{t('Table', 'Meja')} {selectedOrder.tableNumber}</h3>
                  <p className="text-sm text-moa-cream/50 font-mono">#{selectedOrder.id}</p>
               </div>
               <div className="text-right">
                 <Badge variant={selectedOrder.status === 'delivered' ? 'success' : 'warning'}>{selectedOrder.status}</Badge>
                 <p className="text-xs text-moa-cream/50 mt-1">{new Date(selectedOrder.timestamp).toLocaleString()}</p>
               </div>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4 space-y-3 max-h-[40vh] overflow-y-auto custom-scrollbar">
              {selectedOrder.items.map((item, i) => (
                <div key={i} className="flex justify-between items-start border-b border-white/5 last:border-0 pb-3 last:pb-0">
                  <div>
                    <p className="font-bold text-white text-sm md:text-base">{item.quantity}x {lang === 'en' ? item.name_en : item.name_id}</p>
                    {/* Modifiers */}
                    <div className="flex flex-wrap gap-2 mt-1">
                       {item.sugarLevel && item.sugarLevel !== '100%' && <span className="text-[10px] bg-white/10 px-1.5 rounded text-moa-cream/70">Sugar: {item.sugarLevel}</span>}
                       {item.iceLevel && item.iceLevel !== 'Normal' && <span className="text-[10px] bg-white/10 px-1.5 rounded text-moa-cream/70">Ice: {item.iceLevel}</span>}
                       {item.extraShot && <span className="text-[10px] bg-moa-gold/10 px-1.5 rounded text-moa-gold">Extra Shot</span>}
                    </div>
                  </div>
                  <p className="font-mono text-sm">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2">
               <div className="flex justify-between text-sm">
                 <span className="text-moa-cream/60">Payment</span>
                 <span className="capitalize font-bold">{selectedOrder.paymentMethod}</span>
               </div>
               <div className="flex justify-between text-xl font-bold text-moa-gold pt-2 border-t border-white/10">
                 <span>Total Amount</span>
                 <span>{formatCurrency(selectedOrder.totalAmount)}</span>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
               <Button variant="outline" onClick={() => setSelectedOrder(null)}>{t('Close', 'Tutup')}</Button>
               <Button onClick={() => window.print()}>{t('Receipt', 'Struk')}</Button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};