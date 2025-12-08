import React, { useState, Suspense, lazy } from 'react';
import { AppProvider } from './store';
import { Coffee, ShieldCheck, QrCode } from 'lucide-react';
import { Button, Input, Card } from './components/ui';

// Lazy Load Views
const CustomerApp = lazy(() => import('./views/CustomerApp').then(module => ({ default: module.CustomerApp })));
const AdminPanel = lazy(() => import('./views/AdminPanel').then(module => ({ default: module.AdminPanel })));

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-moa-dark text-moa-gold">
    <div className="animate-pulse flex flex-col items-center gap-4">
      <Coffee size={40} />
      <p>Loading...</p>
    </div>
  </div>
);

const LandingPage: React.FC<{ onSelect: (role: 'customer' | 'admin', table?: number) => void }> = ({ onSelect }) => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [tableInput, setTableInput] = useState('1');
  const [error, setError] = useState('');

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'moacoffee' && password === 'MOA0607') {
      onSelect('admin');
    } else {
      setError('Invalid credentials');
    }
  };

  if (isAdminMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-moa-dark p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-moa-brown/20 via-moa-dark to-moa-dark overflow-hidden">
        <Card className="w-full max-w-md space-y-6 border-moa-gold/20 shadow-2xl relative z-10">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-moa-gold font-display">Admin Portal</h2>
            <p className="text-moa-cream/50 text-sm mt-1">Authorized Personnel Only</p>
          </div>
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <Input 
              placeholder="Username" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              className="bg-black/20"
            />
            <Input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="bg-black/20"
            />
            {error && <p className="text-red-400 text-sm text-center bg-red-500/10 py-2 rounded-lg">{error}</p>}
            <Button fullWidth type="submit" className="mt-2">Secure Login</Button>
            <button 
              type="button" 
              onClick={() => setIsAdminMode(false)} 
              className="w-full text-center text-sm text-moa-cream/40 hover:text-white mt-4 transition-colors p-2"
            >
              Back to Entry
            </button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-moa-dark relative overflow-hidden flex flex-col items-center justify-center p-6 text-center">
      {/* Admin Login Button - Top Right */}
      <button 
        onClick={() => setIsAdminMode(true)}
        className="absolute top-6 right-6 z-50 flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-xs font-bold text-moa-cream/60 hover:text-moa-gold hover:bg-white/10 hover:border-moa-gold/30 transition-all shadow-lg active:scale-95"
      >
        <ShieldCheck size={14} />
        <span className="hidden sm:inline">Admin Access</span>
      </button>

      {/* Abstract Background Decoration */}
      <div className="absolute top-0 left-0 w-64 h-64 md:w-96 md:h-96 bg-moa-gold/5 rounded-full blur-[80px] md:blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-moa-brown/10 rounded-full blur-[100px] md:blur-[150px]" />

      <div className="relative z-10 space-y-10 max-w-md w-full">
        <div className="space-y-4">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-moa-gold to-yellow-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-moa-gold/20 rotate-3 border border-white/10">
            <Coffee size={40} className="text-moa-dark drop-shadow-md md:w-12 md:h-12" />
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tighter leading-tight">
            MOA <span className="text-moa-gold">COFFEE</span>
          </h1>
          <p className="text-moa-cream/70 font-light text-base md:text-lg tracking-wide">Fresh Brew, Anywhere You Are.</p>
        </div>

        <div className="space-y-6 pt-4">
           <Card className="border-moa-gold/10 bg-white/5 backdrop-blur-xl">
             <div className="flex items-center gap-4 mb-5 text-left border-b border-white/5 pb-4">
                <div className="p-3 bg-moa-gold/10 rounded-full text-moa-gold">
                  <QrCode size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-moa-cream text-lg">Customer Entry</h3>
                  <p className="text-xs text-moa-cream/50">Simulate QR Code Scan</p>
                </div>
             </div>
             <div className="flex gap-3">
               <Input 
                 type="number" 
                 placeholder="#" 
                 value={tableInput} 
                 onChange={e => setTableInput(e.target.value)}
                 className="w-24 text-center text-lg font-bold"
               />
               <Button 
                 fullWidth 
                 onClick={() => onSelect('customer', parseInt(tableInput))}
               >
                 Open Digital Menu
               </Button>
             </div>
           </Card>
        </div>
      </div>
      
      <p className="absolute bottom-4 text-[10px] text-white/10">v2.0.0 Production Build</p>
    </div>
  );
};

const AppContent: React.FC = () => {
  const [view, setView] = useState<'landing' | 'customer' | 'admin'>('landing');
  const [table, setTable] = useState<number>(1);

  if (view === 'customer') {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <CustomerApp tableNumber={table} />
      </Suspense>
    );
  }

  if (view === 'admin') {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <AdminPanel onLogout={() => setView('landing')} />
      </Suspense>
    );
  }

  return (
    <LandingPage 
      onSelect={(role, tableNum) => {
        if (role === 'customer') {
          setTable(tableNum || 1);
          setView('customer');
        } else {
          setView('admin');
        }
      }} 
    />
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;