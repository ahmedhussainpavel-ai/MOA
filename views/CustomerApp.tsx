import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Search, Plus, Minus, X, ChevronRight, CheckCircle, Clock, Coffee, Heart, AlertCircle, Snowflake, Zap, Wallet, QrCode, WifiOff } from 'lucide-react';
import { useStore } from '../store';
import { MenuItem, CartItem, Category, Order } from '../types';
import { formatCurrency } from '../utils';
import { Button, Card, Badge } from '../components/ui';

interface CustomerAppProps {
  tableNumber: number;
}

type View = 'menu' | 'detail' | 'cart' | 'tracking';
type Lang = 'en' | 'id';

export const CustomerApp: React.FC<CustomerAppProps> = ({ tableNumber }) => {
  const { menu, addOrder, orders, offlineQueue, eventConfig, isOnline } = useStore();
  const [view, setView] = useState<View>('menu');
  
  // Language State: Default to 'id' (Indonesian), but persist user preference
  const [lang, setLang] = useState<Lang>(() => {
    try {
      const saved = localStorage.getItem('moa_customer_lang');
      return (saved === 'en' || saved === 'id') ? saved : 'id';
    } catch { return 'id'; }
  });

  useEffect(() => {
    localStorage.setItem('moa_customer_lang', lang);
  }, [lang]);

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

  // Session Restore Logic
  const hasRestoredSession = useRef(false);
  useEffect(() => {
    if (hasRestoredSession.current) return;
    
    // Check main orders first
    const activeSessionOrder = orders
      .filter(o => o.tableNumber === tableNumber && ['pending', 'accepted', 'preparing'].includes(o.status))
      .sort((a, b) => b.timestamp - a.timestamp)[0];

    // Check offline queue if no main order found
    const activeOfflineOrder = offlineQueue
      .filter(o => o.tableNumber === tableNumber)
      .sort((a, b) => b.timestamp - a.timestamp)[0];

    if (activeSessionOrder) {
      setActiveOrderId(activeSessionOrder.id);
      setView('tracking');
    } else if (activeOfflineOrder) {
      setActiveOrderId(activeOfflineOrder.id);
      setView('tracking');
    }

    hasRestoredSession.current = true;
  }, [tableNumber, orders, offlineQueue]);

  // Derived state
  const activeOrder = orders.find(o => o.id === activeOrderId) || offlineQueue.find(o => o.id === activeOrderId);
  
  const filteredMenu = menu.filter(item => {
    if (selectedCategory === 'Best Seller') return item.category === 'Coffee'; // Mock logic for best seller
    return item.category === selectedCategory;
  });

  const handleItemClick = (item: MenuItem) => {
    setSelectedItem(item);
    setSugarLevel('100%');
    setIceLevel('Normal');
    setExtraShot(false);
    setView('detail');
  };

  const addToCart = (item: MenuItem, options: Partial<CartItem>) => {
    const isDrink = ['Coffee', 'Non-Coffee', 'Best Seller', 'Event'].includes(item.category);
    
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
    <div className="min-h-screen pb-28 bg-moa-dark font-sans text-moa-cream selection:bg-moa-gold selection:text-moa-dark">
      {/* Offline Banner */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-moa-gold text-moa-dark px-4 py-3 text-xs font-bold flex items-center justify-center gap-2 sticky top-0 z-40"
          >
            <WifiOff size={14} />
            {t('You are offline. Orders will sync automatically.', 'Anda offline. Pesanan akan disinkronkan otomatis.')}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="sticky top-0 z-30 bg-moa-dark/95 backdrop-blur-xl border-b border-white/5 p-4 flex justify-between items-center shadow-lg shadow-black/20">
        <div>
          <h1 className="font-display font-bold text-lg md:text-xl text-moa-gold tracking-tight">MOA COFFEE</h1>
          <p className="text-xs text-moa-cream/60 font-medium tracking-wide">Table #{tableNumber}</p>
        </div>
        <div className="flex gap-3 items-center">
           {/* Language Switcher */}
           <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
              <button 
                onClick={() => setLang('id')}
                className={`px-3 py-1.5 text-[10px] md:text-xs font-bold rounded-md transition-all ${lang === 'id' ? 'bg-moa-gold text-moa-dark shadow-sm' : 'text-moa-cream/50 hover:text-moa-cream'}`}
              >
                ID
              </button>
              <button 
                onClick={() => setLang('en')}
                className={`px-3 py-1.5 text-[10px] md:text-xs font-bold rounded-md transition-all ${lang === 'en' ? 'bg-moa-gold text-moa-dark shadow-sm' : 'text-moa-cream/50 hover:text-moa-cream'}`}
              >
                EN
              </button>
           </div>

           {/* Cart Button */}
           {view !== 'cart' && cart.length > 0 && (
             <button onClick={() => setView('cart')} className="relative p-2.5 bg-moa-brown rounded-full text-moa-gold hover:bg-moa-brown/80 transition-all active:scale-95 shadow-lg shadow-black/20">
               <ShoppingBag size={20} />
               <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold border-2 border-moa-dark">
                 {cart.length}
               </span>
             </button>
           )}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4 md:p-6 max-w-md mx-auto">
        <AnimatePresence mode="wait">
          
          {/* MENU VIEW */}
          {view === 'menu' && (
            <motion.div 
              key="menu"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Event Banner */}
              {eventConfig.isActive && (
                <div className="bg-gradient-to-r from-moa-gold to-yellow-600 p-5 rounded-2xl text-moa-dark shadow-lg shadow-moa-gold/10 relative overflow-hidden">
                  <div className="relative z-10">
                    <h3 className="font-bold font-display text-lg md:text-xl">{eventConfig.eventName}</h3>
                    <p className="text-sm opacity-90 font-medium mt-1">{t('Special prices available!', 'Harga spesial tersedia!')}</p>
                  </div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                </div>
              )}

              {/* Categories */}
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
                {(['Best Seller', 'Coffee', 'Non-Coffee', 'Snacks', 'Event'] as Category[]).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2.5 rounded-full text-xs md:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 border ${
                      selectedCategory === cat 
                        ? 'bg-moa-gold border-moa-gold text-moa-dark shadow-lg shadow-moa-gold/20' 
                        : 'bg-white/5 border-white/5 text-moa-cream hover:bg-white/10'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Grid */}
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                {filteredMenu.map(item => (
                  <motion.div 
                    layoutId={item.id}
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className="bg-white/5 rounded-2xl overflow-hidden active:scale-[0.98] transition-all hover:bg-white/10 cursor-pointer group border border-white/5 shadow-sm"
                  >
                    <div className="relative h-36 md:h-40 w-full overflow-hidden">
                       <img src={item.image} alt={item.name_en} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" loading="lazy" />
                       <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] flex items-center gap-1 text-green-400 font-bold border border-white/10">
                         <Heart size={10} fill="currentColor" /> {item.healthyScore}
                       </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-moa-cream text-xs md:text-sm line-clamp-1 group-hover:text-moa-gold transition-colors">
                        {lang === 'en' ? item.name_en : item.name_id}
                      </h3>
                      <p className="text-moa-gold font-bold mt-1.5 text-sm">
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
              <button onClick={() => setView('menu')} className="mb-4 flex items-center text-moa-cream/60 hover:text-moa-gold transition-colors text-sm font-medium p-2 -ml-2">
                <ChevronRight className="rotate-180 mr-1" size={18} /> {t('Back to Menu', 'Kembali ke Menu')}
              </button>
              
              <div className="rounded-2xl overflow-hidden mb-6 relative shadow-2xl border border-white/10 aspect-square sm:aspect-video">
                 <img src={selectedItem.image} className="w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-gradient-to-t from-moa-dark via-transparent to-transparent opacity-90" />
                 <div className="absolute bottom-5 left-5 right-5">
                    <h2 className="text-2xl md:text-3xl font-display font-bold text-white shadow-sm leading-tight">
                      {lang === 'en' ? selectedItem.name_en : selectedItem.name_id}
                    </h2>
                 </div>
              </div>

              <div className="space-y-6 px-1">
                <div>
                  <div className="flex justify-between items-baseline mb-3">
                    <p className="text-2xl md:text-3xl font-bold text-moa-gold tracking-tight">{formatCurrency(selectedItem.price)}</p>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-moa-cream/80 font-medium border border-white/5">{selectedItem.category}</span>
                  </div>
                  <p className="text-moa-cream/80 text-sm leading-relaxed">{selectedItem.description}</p>
                </div>

                <div className="space-y-6 bg-white/5 p-4 md:p-5 rounded-2xl border border-white/5">
                  {/* Ingredients */}
                  <div className="space-y-2.5">
                    <p className="text-xs font-bold text-moa-cream/40 uppercase tracking-widest">{t('Ingredients', 'Komposisi')}</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedItem.ingredients.map(ing => (
                        <span key={ing} className="text-xs bg-black/20 px-3 py-1.5 rounded-lg text-moa-cream/90 border border-white/5">{ing}</span>
                      ))}
                    </div>
                  </div>

                  {/* Options (Only for Drinks) */}
                  {isDrink && (
                    <>
                      {/* Sugar Level */}
                      <div className="space-y-3">
                        <p className="text-xs font-bold text-moa-cream/40 uppercase tracking-widest">{t('Sugar Level', 'Level Gula')}</p>
                        <div className="grid grid-cols-5 gap-2">
                          {['0%', '25%', '50%', '75%', '100%'].map((level) => (
                            <button
                              key={level}
                              onClick={() => setSugarLevel(level as any)}
                              className={`py-2 text-[10px] rounded-lg border transition-all ${sugarLevel === level ? 'bg-moa-gold border-moa-gold text-moa-dark font-bold' : 'border-white/10 text-moa-cream/60 bg-white/5 hover:bg-white/10'}`}
                            >
                              {level}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Ice Level */}
                      <div className="space-y-3">
                        <p className="text-xs font-bold text-moa-cream/40 uppercase tracking-widest">{t('Ice Level', 'Level Es')}</p>
                        <div className="grid grid-cols-4 gap-2">
                          {['No Ice', 'Less', 'Normal', 'Extra'].map((level) => (
                            <button
                              key={level}
                              onClick={() => setIceLevel(level as any)}
                              className={`py-2 text-[10px] rounded-lg border transition-all ${iceLevel === level ? 'bg-moa-gold border-moa-gold text-moa-dark font-bold' : 'border-white/10 text-moa-cream/60 bg-white/5 hover:bg-white/10'}`}
                            >
                              {level}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Extra Shot Toggle */}
                      <div 
                        onClick={() => setExtraShot(!extraShot)}
                        className={`flex items-center justify-between p-3 md:p-4 rounded-xl border cursor-pointer transition-all active:scale-[0.98] ${extraShot ? 'bg-moa-gold/10 border-moa-gold/40' : 'bg-black/20 border-white/5 hover:bg-black/30'}`}
                      >
                        <div>
                          <p className={`font-bold text-sm ${extraShot ? 'text-moa-gold' : 'text-moa-cream'}`}>{t('Extra Espresso Shot', 'Tambah Shot Espresso')}</p>
                          <p className="text-xs text-moa-cream/50 mt-0.5">+ {formatCurrency(5000)}</p>
                        </div>
                        <div className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 ${extraShot ? 'bg-moa-gold' : 'bg-white/10'}`}>
                            <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${extraShot ? 'translate-x-5' : ''}`} />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="fixed bottom-0 left-0 right-0 p-4 bg-moa-dark/90 backdrop-blur-xl border-t border-white/10 z-40 flex items-center justify-center">
                    <Button fullWidth onClick={() => addToCart(selectedItem, { sugarLevel, iceLevel, extraShot })} className="max-w-md shadow-2xl">
                    {t('Add to Order', 'Tambah Pesanan')} — {formatCurrency(selectedItem.price + (isDrink && extraShot ? 5000 : 0))}
                    </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* CART VIEW */}
          {view === 'cart' && (
             <motion.div 
             key="cart"
             initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 50, opacity: 0 }}
             className="space-y-4 pb-20"
           >
             <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold font-display text-white">{t('Your Order', 'Pesanan Anda')}</h2>
                <button onClick={() => setView('menu')} className="p-2 hover:bg-white/10 rounded-full transition-colors"><X className="text-moa-cream/60" /></button>
             </div>

             {cart.length === 0 ? (
               <div className="text-center py-20 text-moa-cream/40 flex flex-col items-center">
                 <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
                   <ShoppingBag className="w-8 h-8 opacity-50" />
                 </div>
                 <p className="font-medium">{t('Your cart is empty', 'Keranjang kosong')}</p>
                 <button onClick={() => setView('menu')} className="mt-4 text-moa-gold text-sm font-bold hover:text-moa-goldHover transition-colors">{t('Browse Menu', 'Lihat Menu')}</button>
               </div>
             ) : (
               <>
                <div className="space-y-4">
                  {cart.map(item => {
                     const isDrinkItem = ['Coffee', 'Non-Coffee', 'Best Seller', 'Event'].includes(item.category);
                     return (
                      <div key={item.cartId} className="flex gap-3 md:gap-4 bg-white/5 p-3 md:p-4 rounded-xl border border-white/5 items-start shadow-sm">
                        {/* Image */}
                        <div className="h-16 w-16 md:h-20 md:w-20 rounded-lg overflow-hidden bg-white/10 flex-shrink-0 border border-white/5">
                          <img src={item.image} className="w-full h-full object-cover" alt={item.name_en} />
                        </div>
                        
                        {/* Details */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
                          <div>
                            <div className="flex justify-between items-start">
                              <h4 className="font-medium text-moa-cream truncate pr-2 text-sm md:text-base">{lang === 'en' ? item.name_en : item.name_id}</h4>
                              <p className="text-sm md:text-base text-moa-gold font-bold whitespace-nowrap">{formatCurrency(item.price)}</p>
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
                                    <span className="font-bold">Extra Shot</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Quantity Controls */}
                            <div className="flex items-center gap-3 bg-moa-dark rounded-lg p-1 border border-white/10 mt-3 w-fit">
                              <button 
                                onClick={() => updateQuantity(item.cartId, -1)}
                                className="w-6 h-6 flex items-center justify-center rounded bg-white/5 hover:bg-white/10 text-moa-cream transition-colors disabled:opacity-30 p-4"
                                disabled={item.quantity <= 1}
                              >
                                <Minus size={12} />
                              </button>
                              <span className="text-sm font-bold w-4 text-center tabular-nums">{item.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(item.cartId, 1)}
                                className="w-6 h-6 flex items-center justify-center rounded bg-moa-gold text-moa-dark hover:bg-moa-goldHover transition-colors p-4"
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        {/* Remove Action */}
                        <div className="flex flex-col h-full justify-center">
                           <button onClick={() => removeFromCart(item.cartId)} className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors opacity-60 hover:opacity-100" aria-label="Remove item">
                             <X size={18} />
                           </button>
                        </div>
                      </div>
                     );
                  })}
                </div>

                <div className="border-t border-white/10 pt-4 mt-6 space-y-4">
                  {/* Payment Method Toggle */}
                  <div className="bg-white/5 p-4 rounded-xl space-y-3 border border-white/5">
                    <p className="text-xs font-bold text-moa-cream/40 uppercase tracking-widest">{t('Payment Method', 'Metode Pembayaran')}</p>
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

                  <div className="space-y-2 px-1">
                    <div className="flex justify-between text-moa-cream/70 text-sm">
                      <span>Subtotal</span>
                      <span>{formatCurrency(cart.reduce((a, b) => a + (b.price * b.quantity), 0))}</span>
                    </div>
                    <div className="flex justify-between text-lg md:text-xl font-bold text-moa-gold pt-2 border-t border-white/5">
                      <span>Total</span>
                      <span>{formatCurrency(cart.reduce((a, b) => a + (b.price * b.quantity), 0))}</span>
                    </div>
                  </div>
                </div>

                <Button fullWidth onClick={checkout} className="mt-8 shadow-xl shadow-moa-gold/10">
                  {!isOnline ? (
                    <div className="flex items-center gap-2"><WifiOff size={16} /> {t('Save Offline Order', 'Simpan Pesanan Offline')}</div>
                  ) : (
                    t('Confirm Order', 'Konfirmasi Pesanan')
                  )}
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
              className="text-center py-6 space-y-8 max-w-sm mx-auto"
            >
              <div className="relative">
                {/* Visual Status Indicator based on Online/Offline/Status */}
                {!isOnline || offlineQueue.find(o => o.id === activeOrder.id) ? (
                  // Offline Indicator
                  <div className="w-24 h-24 rounded-full bg-orange-500/10 mx-auto flex items-center justify-center text-orange-500 border border-orange-500/20">
                     <WifiOff size={40} />
                  </div>
                ) : (
                  // Online Indicator
                  <div className="w-24 h-24 rounded-full bg-moa-gold/10 mx-auto flex items-center justify-center text-moa-gold animate-pulse border border-moa-gold/20">
                    <Coffee size={40} />
                  </div>
                )}
                
                <div className="absolute top-0 right-1/2 translate-x-12 -translate-y-2">
                  {!isOnline || offlineQueue.find(o => o.id === activeOrder.id) ? (
                    <Badge variant="warning">{t('Waiting', 'Menunggu')}</Badge>
                  ) : (
                    <Badge variant="success">Live</Badge>
                  )}
                </div>
              </div>
              
              <div>
                {!isOnline || offlineQueue.find(o => o.id === activeOrder.id) ? (
                  <>
                    <h2 className="text-2xl font-display font-bold text-white mb-2">{t('Order Queued', 'Pesanan Antri')}</h2>
                    <p className="text-moa-cream/60 font-mono text-sm tracking-wide">{t('Will sync when online', 'Akan sinkron saat online')}</p>
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-display font-bold text-white mb-2">{t('Order Sent!', 'Pesanan Terkirim!')}</h2>
                    <p className="text-moa-cream/60 font-mono text-sm tracking-wide">ID: #{activeOrder.id}</p>
                    <div className="mt-2 text-sm text-moa-gold font-bold">Table #{activeOrder.tableNumber}</div>
                  </>
                )}
              </div>

              {/* Status Steps */}
              <div className="bg-white/5 rounded-2xl p-6 text-left space-y-6 border border-white/5 shadow-lg">
                <div className="space-y-6 relative">
                   {/* Vertical Line */}
                   <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-white/10 z-0" />

                   {[
                     { status: 'pending', label_en: 'Order Pending', label_id: 'Menunggu Konfirmasi', icon: Clock },
                     { status: 'preparing', label_en: 'Preparing', label_id: 'Sedang Disiapkan', icon: Coffee },
                     { status: 'delivered', label_en: 'Served', label_id: 'Sudah Diantar', icon: CheckCircle },
                   ].map((step) => {
                     // Logic for step activation
                     let isActive = false;
                     let isCompleted = false;

                     if (activeOrder.status === 'delivered') isActive = true;
                     else if (activeOrder.status === 'preparing' && (step.status === 'pending' || step.status === 'preparing')) isActive = true;
                     else if (activeOrder.status === 'pending' && step.status === 'pending') isActive = true;
                     else if (activeOrder.status === 'accepted' && step.status === 'pending') isActive = true;

                     // Offline override: only first step is "active" but styled differently
                     const isOffline = offlineQueue.find(o => o.id === activeOrder.id);
                     if (isOffline) {
                        isActive = step.status === 'pending';
                     }

                     const isCurrentAnim = activeOrder.status === step.status && !isOffline;

                     return (
                       <div key={step.status} className="flex items-center gap-4 relative z-10">
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 shadow-md flex-shrink-0 ${
                           isActive 
                             ? (isOffline ? 'bg-orange-500/20 border-orange-500 text-orange-500' : 'bg-moa-gold border-moa-gold text-moa-dark') 
                             : 'bg-moa-dark border-white/10 text-white/20'
                         }`}>
                           <step.icon size={18} />
                         </div>
                         <div>
                           <p className={`font-bold transition-colors ${isActive ? 'text-moa-cream' : 'text-moa-cream/30'}`}>{t(step.label_en, step.label_id)}</p>
                           {isCurrentAnim && <p className="text-xs text-moa-gold animate-pulse">{t('In Progress...', 'Sedang Berlangsung...')}</p>}
                           {isOffline && step.status === 'pending' && <p className="text-xs text-orange-400">{t('Paused (Offline)', 'Jeda (Offline)')}</p>}
                         </div>
                       </div>
                     );
                   })}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white/5 rounded-xl p-5 text-left border border-white/5">
                 <p className="text-xs font-bold text-moa-cream/40 uppercase tracking-widest mb-4">Order Summary</p>
                 <div className="space-y-4">
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
                            <div className="mt-1 ml-4 flex flex-wrap gap-2">
                              <span className="text-[10px] text-moa-cream/60 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">Ice: {item.iceLevel}</span>
                              <span className="text-[10px] text-moa-cream/60 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">Sugar: {item.sugarLevel}</span>
                              {item.extraShot && (
                                <span className="text-[10px] text-moa-gold bg-moa-gold/10 px-1.5 py-0.5 rounded border border-moa-gold/20 font-bold">Extra Shot</span>
                              )}
                            </div>
                         )}
                       </div>
                     );
                   })}
                 </div>
                 <div className="border-t border-white/10 mt-4 pt-4 flex justify-between font-bold text-moa-gold text-lg">
                   <span>Total</span>
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