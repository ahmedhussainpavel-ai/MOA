import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Search, Plus, Minus, X, ChevronRight, CheckCircle, Clock, Coffee, Heart, AlertCircle, Snowflake, Zap, Wallet, QrCode } from 'lucide-react';
import { useStore } from '../store';
import { MenuItem, CartItem, Category, Order } from '../types';
import { formatCurrency } from '../constants';
import { Button, Card, Badge } from '../components/ui';

interface CustomerAppProps {
  tableNumber: number;
}

type View = 'menu' | 'detail' | 'cart' | 'tracking';
type Lang = 'en' | 'id';

export const CustomerApp: React.FC<CustomerAppProps> = ({ tableNumber }) => {
  const { menu, addOrder, orders, eventConfig } = useStore();
  const [view, setView] = useState<View>('menu');
  const [lang, setLang] = useState<Lang>('en');
  const [selectedCategory, setSelectedCategory] = useState<Category>('Coffee');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  // Option States
  const [sugarLevel, setSugarLevel] = useState<CartItem['sugarLevel']>('100%');
  const [iceLevel, setIceLevel] = useState<CartItem['iceLevel']>('Normal');
  const [extraShot, setExtraShot] = useState(false);
  
  // Checkout State
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qris'>('cash');

  // Derived state
  const activeOrder = orders.find(o => o.id === activeOrderId);
  
  // Filter menu
  const filteredMenu = menu.filter(item => {
    if (selectedCategory === 'Best Seller') return item.category === 'Coffee'; // Mock logic
    return item.category === selectedCategory;
  });

  const handleItemClick = (item: MenuItem) => {
    setSelectedItem(item);
    // Reset options
    setSugarLevel('100%');
    setIceLevel('Normal');
    setExtraShot(false);
    setView('detail');
  };

  const addToCart = (item: MenuItem, options: Partial<CartItem>) => {
    const isDrink = ['Coffee', 'Non-Coffee', 'Best Seller', 'Event'].includes(item.category);
    
    // Only charge for extra shot if it's a drink and selected
    const additionalCost = (isDrink && options.extraShot) ? 5000 : 0;
    const finalPrice = item.price + additionalCost;

    const newItem: CartItem = {
      ...item,
      price: finalPrice, 
      cartId: Math.random().toString(36).substr(2, 9),
      quantity: 1,
      sugarLevel: isDrink ? options.sugarLevel || '100%' : '100%',
      iceLevel: isDrink ? options.iceLevel || 'Normal' : 'Normal',
      extraShot: isDrink ? !!options.extraShot : false,
    };
    
    setCart([...cart, newItem]);
    setView('menu');
    setSelectedItem(null);
  };

  const removeFromCart = (cartId: string) => {
    setCart(cart.filter(item => item.cartId !== cartId));
  };

  const updateQuantity = (cartId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.cartId === cartId) {
        const newQuantity = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQuantity };
      }
      return item;
    }));
  };

  const checkout = () => {
    const totalAmount = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      tableNumber,
      items: cart,
      totalAmount,
      status: 'pending',
      timestamp: Date.now(),
      paymentMethod: paymentMethod
    };
    addOrder(newOrder);
    setActiveOrderId(newOrder.id);
    setCart([]);
    setView('tracking');
  };

  const t = (en: string, id: string) => lang === 'en' ? en : id;
  
  const isDrink = selectedItem ? ['Coffee', 'Non-Coffee', 'Best Seller', 'Event'].includes(selectedItem.category) : false;

  return (
    <div className="min-h-screen pb-24 bg-moa-dark font-sans text-moa-cream">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-moa-dark/80 backdrop-blur-xl border-b border-white/5 p-4 flex justify-between items-center">
        <div>
          <h1 className="font-display font-bold text-xl text-moa-gold">MOA COFFEE</h1>
          <p className="text-xs text-moa-cream/60">Table #{tableNumber}</p>
        </div>
        <div className="flex gap-2">
           <button onClick={() => setLang(lang === 'en' ? 'id' : 'en')} className="px-2 py-1 text-xs border border-white/20 rounded text-moa-cream hover:bg-white/5 transition-colors">
             {lang.toUpperCase()}
           </button>
           {view !== 'cart' && cart.length > 0 && (
             <button onClick={() => setView('cart')} className="relative p-2 bg-moa-brown rounded-full text-moa-gold hover:bg-moa-brown/80 transition-colors">
               <ShoppingBag size={20} />
               <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold shadow-sm">
                 {cart.length}
               </span>
             </button>
           )}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        <AnimatePresence mode="wait">
          
          {/* MENU VIEW */}
          {view === 'menu' && (
            <motion.div 
              key="menu"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Event Banner */}
              {eventConfig.isActive && (
                <div className="bg-gradient-to-r from-moa-gold to-yellow-600 p-4 rounded-xl text-moa-dark shadow-lg shadow-moa-gold/10">
                  <h3 className="font-bold font-display text-lg">{eventConfig.eventName}</h3>
                  <p className="text-sm opacity-90 font-medium">{t('Special prices available!', 'Harga spesial tersedia!')}</p>
                </div>
              )}

              {/* Categories */}
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
                {(['Best Seller', 'Coffee', 'Non-Coffee', 'Snacks', 'Event'] as Category[]).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                      selectedCategory === cat 
                        ? 'bg-moa-gold text-moa-dark shadow-md shadow-moa-gold/20' 
                        : 'bg-white/5 text-moa-cream hover:bg-white/10'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Grid */}
              <div className="grid grid-cols-2 gap-4">
                {filteredMenu.map(item => (
                  <motion.div 
                    layoutId={item.id}
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className="bg-white/5 rounded-2xl overflow-hidden active:scale-95 transition-all hover:bg-white/10 cursor-pointer group"
                  >
                    <div className="relative h-36 w-full overflow-hidden">
                       <img src={item.image} alt={item.name_en} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                       <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur px-2 py-1 rounded-lg text-xs flex items-center gap-1 text-green-400 font-bold border border-white/5">
                         <Heart size={10} fill="currentColor" /> {item.healthyScore}
                       </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-moa-cream text-sm line-clamp-1">
                        {lang === 'en' ? item.name_en : item.name_id}
                      </h3>
                      <p className="text-moa-gold font-bold mt-1 text-sm">
                        {formatCurrency(item.price)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* DETAIL VIEW */}
          {view === 'detail' && selectedItem && (
            <motion.div 
              key="detail"
              initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
              className="pb-20"
            >
              <button onClick={() => setView('menu')} className="mb-4 flex items-center text-moa-cream/60 hover:text-moa-gold transition-colors">
                <ChevronRight className="rotate-180 mr-1" size={20} /> {t('Back', 'Kembali')}
              </button>
              
              <div className="rounded-2xl overflow-hidden mb-6 relative shadow-2xl">
                 <img src={selectedItem.image} className="w-full h-64 object-cover" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                 <div className="absolute bottom-4 left-4 right-4">
                    <h2 className="text-2xl font-display font-bold text-white shadow-sm">
                      {lang === 'en' ? selectedItem.name_en : selectedItem.name_id}
                    </h2>
                 </div>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-baseline">
                    <p className="text-2xl font-bold text-moa-gold">{formatCurrency(selectedItem.price)}</p>
                    <span className="text-xs px-2 py-1 rounded bg-white/10 text-moa-cream/60">{selectedItem.category}</span>
                  </div>
                  <p className="text-moa-cream/70 mt-4 text-sm leading-relaxed">{selectedItem.description}</p>
                </div>

                <div className="space-y-6">
                  {/* Ingredients */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-moa-cream/50 uppercase tracking-wider">{t('Ingredients', 'Komposisi')}</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.ingredients.map(ing => (
                        <span key={ing} className="text-xs bg-white/10 px-3 py-1 rounded-full text-moa-cream/80 border border-white/5">{ing}</span>
                      ))}
                    </div>
                  </div>

                  {/* Options (Only for Drinks) */}
                  {isDrink && (
                    <>
                      {/* Sugar Level */}
                      <div className="space-y-3">
                        <p className="text-xs font-bold text-moa-cream/50 uppercase tracking-wider">{t('Sugar Level', 'Level Gula')}</p>
                        <div className="flex flex-wrap gap-2">
                          {['0%', '25%', '50%', '75%', '100%'].map((level) => (
                            <button
                              key={level}
                              onClick={() => setSugarLevel(level as any)}
                              className={`px-4 py-2 text-sm rounded-xl border transition-all ${sugarLevel === level ? 'bg-moa-gold border-moa-gold text-moa-dark font-bold shadow-lg shadow-moa-gold/20' : 'border-white/10 text-moa-cream/60 bg-white/5 hover:bg-white/10'}`}
                            >
                              {level}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Ice Level */}
                      <div className="space-y-3">
                        <p className="text-xs font-bold text-moa-cream/50 uppercase tracking-wider">{t('Ice Level', 'Level Es')}</p>
                        <div className="flex flex-wrap gap-2">
                          {['No Ice', 'Less', 'Normal', 'Extra'].map((level) => (
                            <button
                              key={level}
                              onClick={() => setIceLevel(level as any)}
                              className={`px-4 py-2 text-sm rounded-xl border transition-all ${iceLevel === level ? 'bg-moa-gold border-moa-gold text-moa-dark font-bold shadow-lg shadow-moa-gold/20' : 'border-white/10 text-moa-cream/60 bg-white/5 hover:bg-white/10'}`}
                            >
                              {level}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Extra Shot Toggle */}
                      <div 
                        onClick={() => setExtraShot(!extraShot)}
                        className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all active:scale-95 ${extraShot ? 'bg-moa-gold/10 border-moa-gold/40' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                      >
                        <div>
                          <p className={`font-bold ${extraShot ? 'text-moa-gold' : 'text-moa-cream'}`}>{t('Extra Shot', 'Tambah Espresso Shot')}</p>
                          <p className="text-xs text-moa-cream/50">+ {formatCurrency(5000)}</p>
                        </div>
                        <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ${extraShot ? 'bg-moa-gold' : 'bg-white/20'}`}>
                            <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${extraShot ? 'translate-x-6' : ''}`} />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <Button fullWidth onClick={() => addToCart(selectedItem, { sugarLevel, iceLevel, extraShot })}>
                  {t('Add to Order', 'Tambah Pesanan')} — {formatCurrency(selectedItem.price + (isDrink && extraShot ? 5000 : 0))}
                </Button>
              </div>
            </motion.div>
          )}

          {/* CART VIEW */}
          {view === 'cart' && (
             <motion.div 
             key="cart"
             initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
             className="space-y-4"
           >
             <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold font-display">{t('Your Order', 'Pesanan Anda')}</h2>
                <button onClick={() => setView('menu')} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="text-moa-cream/60" /></button>
             </div>

             {cart.length === 0 ? (
               <div className="text-center py-20 text-moa-cream/40">
                 <ShoppingBag className="mx-auto mb-4 w-12 h-12 opacity-50" />
                 <p>{t('Cart is empty', 'Keranjang kosong')}</p>
                 <button onClick={() => setView('menu')} className="mt-4 text-moa-gold underline hover:text-moa-goldHover transition-colors">{t('Browse Menu', 'Lihat Menu')}</button>
               </div>
             ) : (
               <>
                <div className="space-y-4">
                  {cart.map(item => {
                     const isDrinkItem = ['Coffee', 'Non-Coffee', 'Best Seller', 'Event'].includes(item.category);
                     return (
                      <div key={item.cartId} className="flex gap-4 bg-white/5 p-4 rounded-xl border border-white/5 items-start">
                        {/* Image */}
                        <div className="h-20 w-20 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
                          <img src={item.image} className="w-full h-full object-cover" alt={item.name_en} />
                        </div>
                        
                        {/* Details */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
                          <div>
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium text-moa-cream truncate pr-2">{lang === 'en' ? item.name_en : item.name_id}</h4>
                              <p className="text-sm text-moa-gold font-bold whitespace-nowrap">{formatCurrency(item.price)}</p>
                            </div>
                            
                            {/* Variants Display - Receipt Style */}
                            {isDrinkItem && (
                              <div className="mt-2 space-y-1 bg-black/20 p-2 rounded-lg border border-white/5">
                                <div className="flex items-center gap-2 text-[10px] text-moa-cream/70">
                                  <Snowflake size={10} className="text-blue-300" />
                                  <span>Ice: <span className="text-moa-cream font-medium">{item.iceLevel}</span></span>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-moa-cream/70">
                                  <div className="w-2.5 h-2.5 rounded-full border border-moa-cream/40 flex items-center justify-center">
                                    <div className="w-1 h-1 bg-moa-cream/60 rounded-full" />
                                  </div>
                                  <span>Sugar: <span className="text-moa-cream font-medium">{item.sugarLevel}</span></span>
                                </div>
                                {item.extraShot && (
                                  <div className="flex items-center gap-2 text-[10px] text-moa-gold">
                                    <Zap size={10} />
                                    <span className="font-bold">Extra Shot (+{formatCurrency(5000)})</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-3 bg-moa-dark rounded-lg p-1 border border-white/10 mt-3 w-fit">
                              <button 
                                onClick={() => updateQuantity(item.cartId, -1)}
                                className="w-6 h-6 flex items-center justify-center rounded bg-white/5 hover:bg-white/10 text-moa-cream transition-colors disabled:opacity-30"
                                disabled={item.quantity <= 1}
                              >
                                <Minus size={14} />
                              </button>
                              <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.cartId, 1)}
                                className="w-6 h-6 flex items-center justify-center rounded bg-moa-gold text-moa-dark hover:bg-moa-goldHover transition-colors"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        {/* Remove Action */}
                        <div className="flex flex-col h-full justify-center">
                           <button onClick={() => removeFromCart(item.cartId)} className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors" aria-label="Remove item">
                             <X size={18} />
                           </button>
                        </div>
                      </div>
                     );
                  })}
                </div>

                <div className="border-t border-white/10 pt-4 mt-8 space-y-4">
                  {/* Payment Method Toggle */}
                  <div className="bg-white/5 p-4 rounded-xl space-y-3">
                    <p className="text-xs font-bold text-moa-cream/50 uppercase tracking-wider">{t('Payment Method', 'Metode Pembayaran')}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setPaymentMethod('cash')}
                        className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                          paymentMethod === 'cash' 
                            ? 'bg-moa-gold border-moa-gold text-moa-dark shadow-lg shadow-moa-gold/20' 
                            : 'bg-white/5 border-white/5 text-moa-cream/60 hover:bg-white/10'
                        }`}
                      >
                        <Wallet size={18} />
                        <span className="font-bold text-sm">Cash</span>
                      </button>
                      <button
                        onClick={() => setPaymentMethod('qris')}
                        className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${
                          paymentMethod === 'qris' 
                            ? 'bg-moa-gold border-moa-gold text-moa-dark shadow-lg shadow-moa-gold/20' 
                            : 'bg-white/5 border-white/5 text-moa-cream/60 hover:bg-white/10'
                        }`}
                      >
                        <QrCode size={18} />
                        <span className="font-bold text-sm">QRIS</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-moa-cream/70">
                      <span>Subtotal</span>
                      <span>{formatCurrency(cart.reduce((a, b) => a + (b.price * b.quantity), 0))}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-moa-gold pt-2">
                      <span>Total</span>
                      <span>{formatCurrency(cart.reduce((a, b) => a + (b.price * b.quantity), 0))}</span>
                    </div>
                  </div>
                </div>

                <Button fullWidth onClick={checkout} className="mt-8 shadow-xl shadow-moa-gold/10">
                  {t('Confirm Order', 'Konfirmasi Pesanan')}
                </Button>
               </>
             )}
           </motion.div>
          )}

          {/* TRACKING VIEW */}
          {view === 'tracking' && activeOrder && (
             <motion.div 
              key="tracking"
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="text-center py-6 space-y-8"
            >
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-moa-gold/10 mx-auto flex items-center justify-center text-moa-gold animate-pulse">
                  <Coffee size={40} />
                </div>
                <div className="absolute top-0 right-1/2 translate-x-12 -translate-y-2">
                  <Badge variant="success">Live</Badge>
                </div>
              </div>
              
              <div>
                <h2 className="text-2xl font-display font-bold text-white mb-2">{t('Order Sent!', 'Pesanan Terkirim!')}</h2>
                <p className="text-moa-cream/60">ID: #{activeOrder.id}</p>
                <div className="mt-2 text-sm text-moa-gold">Table #{activeOrder.tableNumber}</div>
              </div>

              {/* Status Steps */}
              <div className="bg-white/5 rounded-2xl p-6 text-left space-y-6 border border-white/5">
                <div className="space-y-6 relative">
                   {/* Vertical Line */}
                   <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-white/10 z-0" />

                   {[
                     { status: 'pending', label_en: 'Order Pending', label_id: 'Menunggu Konfirmasi', icon: Clock },
                     { status: 'preparing', label_en: 'Preparing', label_id: 'Sedang Disiapkan', icon: Coffee },
                     { status: 'delivered', label_en: 'Served', label_id: 'Sudah Diantar', icon: CheckCircle },
                   ].map((step, idx) => {
                     const isCompleted = 
                       (activeOrder.status === 'delivered') ||
                       (activeOrder.status === 'preparing' && step.status !== 'delivered') ||
                       (activeOrder.status === 'pending' && step.status === 'pending') ||
                       (activeOrder.status === 'accepted' && step.status === 'pending'); // accepted maps to pending visually or handled better

                     const isCurrent = activeOrder.status === step.status;

                     // Mapping logical status to visual steps
                     let isActive = false;
                     if (activeOrder.status === 'pending' && step.status === 'pending') isActive = true;
                     if (activeOrder.status === 'preparing' && (step.status === 'pending' || step.status === 'preparing')) isActive = true;
                     if (activeOrder.status === 'delivered') isActive = true;

                     return (
                       <div key={step.status} className="flex items-center gap-4 relative z-10">
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-500 ${isActive ? 'bg-moa-gold border-moa-gold text-moa-dark' : 'bg-moa-dark border-white/10 text-white/20'}`}>
                           <step.icon size={18} />
                         </div>
                         <div>
                           <p className={`font-bold transition-colors ${isActive ? 'text-moa-cream' : 'text-moa-cream/30'}`}>{t(step.label_en, step.label_id)}</p>
                           {isCurrent && <p className="text-xs text-moa-gold animate-pulse">{t('In Progress...', 'Sedang Berlangsung...')}</p>}
                         </div>
                       </div>
                     );
                   })}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white/5 rounded-xl p-4 text-left">
                 <p className="text-xs font-bold text-moa-cream/50 uppercase tracking-wider mb-3">Order Summary</p>
                 <div className="space-y-3">
                   {activeOrder.items.map((item, idx) => {
                     const isDrinkItem = ['Coffee', 'Non-Coffee', 'Best Seller', 'Event'].includes(item.category);
                     return (
                       <div key={idx}>
                         <div className="flex justify-between text-sm font-medium">
                           <span className="text-moa-cream">{item.quantity}x {lang === 'en' ? item.name_en : item.name_id}</span>
                           <span className="text-moa-cream/60">{formatCurrency(item.price)}</span>
                         </div>
                         {/* Details in Tracking Summary */}
                         {isDrinkItem && (
                            <div className="mt-1 ml-4 space-y-0.5">
                              <div className="flex items-center gap-1.5 text-[10px] text-moa-cream/60">
                                <Snowflake size={8} className="text-blue-300/70" /> 
                                <span>Ice: {item.iceLevel}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] text-moa-cream/60">
                                <div className="w-1.5 h-1.5 rounded-full border border-moa-cream/30" />
                                <span>Sugar: {item.sugarLevel}</span>
                              </div>
                              {item.extraShot && (
                                <div className="flex items-center gap-1.5 text-[10px] text-moa-gold/70">
                                  <Zap size={8} /> Extra Shot
                                </div>
                              )}
                            </div>
                         )}
                       </div>
                     );
                   })}
                 </div>
                 <div className="border-t border-white/10 mt-3 pt-3 flex justify-between font-bold text-moa-gold">
                   <span>Total ({activeOrder.paymentMethod === 'qris' ? 'QRIS' : 'Cash'})</span>
                   <span>{formatCurrency(activeOrder.totalAmount)}</span>
                 </div>
              </div>

              <Button variant="outline" fullWidth onClick={() => {
                setView('menu');
                setActiveOrderId(null);
              }}>
                {t('Make Another Order', 'Pesan Lagi')}
              </Button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};