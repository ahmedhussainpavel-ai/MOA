import React, { useState } from 'react';
import { 
  LayoutDashboard, Coffee, ShoppingBag, Settings, LogOut, 
  Check, X, Clock, BarChart3, QrCode
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useStore } from '../store';
import { Button, Card, Input, Badge } from '../components/ui';
import { formatCurrency } from '../constants';
import { MenuItem, Category } from '../types';

export const AdminPanel: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const { 
    menu, orders, eventConfig, 
    updateOrderStatus, deleteMenuItem, addMenuItem, updateEventConfig, resetData 
  } = useStore();
  
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'menu' | 'event'>('dashboard');
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);

  // Stats Logic
  const totalSales = orders.reduce((acc, o) => acc + o.totalAmount, 0);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const preparingOrders = orders.filter(o => o.status === 'preparing');

  // Chart Data
  const salesData = [
    { name: 'Mon', sales: 400000 },
    { name: 'Tue', sales: 300000 },
    { name: 'Wed', sales: 550000 },
    { name: 'Thu', sales: 450000 },
    { name: 'Fri', sales: 800000 },
    { name: 'Sat', sales: 1200000 },
    { name: 'Sun', sales: totalSales > 0 ? totalSales : 900000 },
  ];

  // Menu Form State
  const [newItem, setNewItem] = useState<Partial<MenuItem>>({
    category: 'Coffee',
    isAvailable: true,
    ingredients: []
  });

  const handleAddMenu = () => {
    if (newItem.name_en && newItem.price) {
      addMenuItem({
        id: Math.random().toString(),
        name_en: newItem.name_en,
        name_id: newItem.name_id || newItem.name_en,
        price: Number(newItem.price),
        category: newItem.category as Category || 'Coffee',
        description: newItem.description || '',
        image: 'https://picsum.photos/400/400',
        healthyScore: 5,
        ingredients: ['House Blend'],
        isAvailable: true
      });
      setIsMenuModalOpen(false);
      setNewItem({ category: 'Coffee' });
    }
  };

  const SidebarItem = ({ id, icon: Icon, label }: any) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        activeTab === id 
          ? 'bg-moa-gold text-moa-dark font-semibold shadow-lg shadow-moa-gold/20' 
          : 'text-moa-cream/60 hover:bg-white/5 hover:text-moa-cream'
      }`}
    >
      <Icon size={20} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="flex min-h-screen bg-moa-dark text-moa-cream font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 p-6 flex flex-col">
        <div className="mb-10">
          <h1 className="text-2xl font-display font-bold text-moa-gold tracking-tight">MOA ADMIN</h1>
          <p className="text-xs text-moa-cream/50">Super Admin Panel</p>
        </div>
        
        <nav className="flex-1 space-y-2">
          <SidebarItem id="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <SidebarItem id="orders" icon={ShoppingBag} label="Orders" />
          <SidebarItem id="menu" icon={Coffee} label="Menu Manager" />
          <SidebarItem id="event" icon={QrCode} label="Event Mode" />
        </nav>

        <div className="pt-6 border-t border-white/5">
           <button onClick={onLogout} className="flex items-center gap-2 text-red-400 text-sm hover:text-red-300 transition-colors">
             <LogOut size={16} /> Logout
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        
        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
             <div className="grid grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-white/5 to-white/0">
                  <p className="text-sm text-moa-cream/50">Total Sales</p>
                  <p className="text-2xl font-bold text-moa-gold mt-1">{formatCurrency(totalSales)}</p>
                </Card>
                <Card>
                  <p className="text-sm text-moa-cream/50">Total Orders</p>
                  <p className="text-2xl font-bold mt-1">{totalOrders}</p>
                </Card>
                <Card>
                  <p className="text-sm text-moa-cream/50">Pending</p>
                  <p className="text-2xl font-bold text-orange-400 mt-1">{pendingOrders.length}</p>
                </Card>
                <Card>
                  <p className="text-sm text-moa-cream/50">Preparing</p>
                  <p className="text-2xl font-bold text-blue-400 mt-1">{preparingOrders.length}</p>
                </Card>
             </div>

             <Card className="h-96">
               <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><BarChart3 size={20} className="text-moa-gold"/> Weekly Sales</h3>
               <ResponsiveContainer width="100%" height="85%">
                 <BarChart data={salesData}>
                    <XAxis dataKey="name" stroke="#F4E9DA" opacity={0.3} />
                    <YAxis stroke="#F4E9DA" opacity={0.3} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1C1C1C', borderColor: '#333', color: '#fff' }}
                      itemStyle={{ color: '#D4A85F' }}
                    />
                    <Bar dataKey="sales" radius={[4, 4, 0, 0]}>
                      {salesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 6 ? '#D4A85F' : '#4A2E2A'} />
                      ))}
                    </Bar>
                 </BarChart>
               </ResponsiveContainer>
             </Card>

             <div className="flex justify-end">
               <Button variant="outline" onClick={resetData} className="text-xs py-2">Reset All Demo Data</Button>
             </div>
          </div>
        )}

        {/* ORDERS */}
        {activeTab === 'orders' && (
          <div className="grid grid-cols-3 gap-6 h-full items-start">
             {['pending', 'preparing', 'delivered'].map(status => (
               <div key={status} className="bg-white/5 rounded-2xl p-4 min-h-[500px]">
                 <h3 className="font-bold capitalize mb-4 text-moa-gold flex items-center justify-between">
                   {status} <span className="text-xs bg-white/10 px-2 py-1 rounded-full text-white">{orders.filter(o => o.status === status).length}</span>
                 </h3>
                 <div className="space-y-3">
                    {orders.filter(o => o.status === status).map(order => (
                      <Card key={order.id} className="bg-moa-dark border-white/5">
                         <div className="flex justify-between items-start mb-2">
                           <span className="font-bold text-lg">Table {order.tableNumber}</span>
                           <span className="text-xs font-mono opacity-50">#{order.id}</span>
                         </div>
                         <div className="space-y-1 mb-4">
                           {order.items.map((item, idx) => (
                             <div key={idx} className="text-sm flex justify-between">
                               <span className="opacity-80">{item.quantity}x {item.name_en}</span>
                               <span className="opacity-40">{item.iceLevel}</span>
                             </div>
                           ))}
                         </div>
                         <div className="flex gap-2 mt-2">
                           {status === 'pending' && (
                             <Button onClick={() => updateOrderStatus(order.id, 'preparing')} className="w-full py-2 text-sm">Accept</Button>
                           )}
                           {status === 'preparing' && (
                             <Button onClick={() => updateOrderStatus(order.id, 'delivered')} variant="secondary" className="w-full py-2 text-sm">Ready</Button>
                           )}
                           {status === 'delivered' && (
                              <div className="text-xs text-center w-full text-green-500 font-medium py-2">Completed</div>
                           )}
                         </div>
                      </Card>
                    ))}
                 </div>
               </div>
             ))}
          </div>
        )}

        {/* MENU */}
        {activeTab === 'menu' && (
           <div className="space-y-6">
             <div className="flex justify-between items-center">
               <h2 className="text-xl font-bold">Menu Items</h2>
               <Button onClick={() => setIsMenuModalOpen(true)}><Coffee size={18} /> Add New Item</Button>
             </div>

             {isMenuModalOpen && (
               <Card className="mb-6 border-moa-gold/30 bg-moa-gold/5">
                 <h3 className="font-bold mb-4">Add New Item</h3>
                 <div className="grid grid-cols-2 gap-4 mb-4">
                   <Input placeholder="Name (EN)" value={newItem.name_en} onChange={e => setNewItem({...newItem, name_en: e.target.value})} />
                   <Input placeholder="Price" type="number" value={newItem.price} onChange={e => setNewItem({...newItem, price: Number(e.target.value)})} />
                   <Input placeholder="Description" className="col-span-2" value={newItem.description} onChange={e => setNewItem({...newItem, description: e.target.value})} />
                   <select 
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-moa-cream"
                    value={newItem.category}
                    onChange={e => setNewItem({...newItem, category: e.target.value as Category})}
                   >
                     <option value="Coffee">Coffee</option>
                     <option value="Non-Coffee">Non-Coffee</option>
                     <option value="Snacks">Snacks</option>
                   </select>
                 </div>
                 <div className="flex gap-2 justify-end">
                   <Button variant="ghost" onClick={() => setIsMenuModalOpen(false)}>Cancel</Button>
                   <Button onClick={handleAddMenu}>Save Item</Button>
                 </div>
               </Card>
             )}

             <div className="grid grid-cols-4 gap-4">
               {menu.map(item => (
                 <div key={item.id} className="bg-white/5 rounded-xl p-4 group relative">
                    <button 
                      onClick={() => deleteMenuItem(item.id)}
                      className="absolute top-2 right-2 bg-red-500/80 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-white"
                    >
                      <X size={14} />
                    </button>
                    <img src={item.image} className="w-full h-32 object-cover rounded-lg mb-3 opacity-80" />
                    <h4 className="font-medium text-moa-cream truncate">{item.name_en}</h4>
                    <p className="text-moa-gold font-bold">{formatCurrency(item.price)}</p>
                    <div className="mt-2 flex gap-2">
                       <Badge variant="info">{item.category}</Badge>
                    </div>
                 </div>
               ))}
             </div>
           </div>
        )}

        {/* EVENT MODE */}
        {activeTab === 'event' && (
          <div className="max-w-2xl">
             <Card>
               <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-moa-gold">Event Mode Configuration</h2>
                    <p className="text-sm opacity-60">Manage temporary events and QR codes.</p>
                  </div>
                  <div className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-colors ${eventConfig.isActive ? 'bg-green-500' : 'bg-white/10'}`} onClick={() => updateEventConfig({...eventConfig, isActive: !eventConfig.isActive})}>
                    <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${eventConfig.isActive ? 'translate-x-6' : ''}`} />
                  </div>
               </div>
               
               <div className="space-y-4">
                 <Input 
                    label="Event Name" 
                    value={eventConfig.eventName} 
                    onChange={e => updateEventConfig({...eventConfig, eventName: e.target.value})} 
                  />
                 <Input 
                    label="Active Table Count" 
                    type="number" 
                    value={eventConfig.tableCount} 
                    onChange={e => updateEventConfig({...eventConfig, tableCount: Number(e.target.value)})} 
                  />
                  <Button fullWidth className="mt-4">Update Event Settings</Button>
               </div>
             </Card>

             <div className="mt-8">
               <h3 className="font-bold mb-4">Generated QR Codes</h3>
               <div className="grid grid-cols-3 gap-4">
                 {Array.from({ length: 6 }).map((_, i) => (
                   <div key={i} className="bg-white p-4 rounded-xl flex flex-col items-center gap-2">
                     <img 
                       src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=MOA_TABLE_${i+1}`} 
                       alt="QR" 
                       className="w-full mix-blend-multiply opacity-90"
                     />
                     <span className="text-black font-bold text-sm">Table {i+1}</span>
                   </div>
                 ))}
               </div>
             </div>
          </div>
        )}

      </main>
    </div>
  );
};
