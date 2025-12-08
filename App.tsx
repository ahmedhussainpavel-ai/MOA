import React, { useState } from 'react';
import { AppProvider } from './store';
import { CustomerApp } from './views/CustomerApp';
import { AdminPanel } from './views/AdminPanel';
import { Coffee, ShieldCheck, QrCode } from 'lucide-react';
import { Button, Input, Card } from './components/ui';

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
      <div className="min-h-screen flex items-center justify-center bg-moa-dark p-4">
        <Card className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-moa-gold font-display">Admin Portal</h2>
            <p className="text-moa-cream/50 text-sm">Restricted Access</p>
          </div>
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <Input 
              placeholder="Username" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
            />
            <Input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
            />
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            <Button fullWidth type="submit">Login</Button>
            <button 
              type="button" 
              onClick={() => setIsAdminMode(false)} 
              className="w-full text-center text-sm text-moa-cream/50 hover:text-moa-cream mt-4"
            >
              Cancel
            </button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-moa-dark relative overflow-hidden flex flex-col items-center justify-center p-6 text-center">
      {/* Abstract Background Decoration */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-moa-gold/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-moa-brown/20 rounded-full blur-[120px]" />

      <div className="relative z-10 space-y-8 max-w-md w-full">
        <div className="space-y-2">
          <div className="w-20 h-20 bg-moa-gold rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-moa-gold/20">
            <Coffee size={40} className="text-moa-dark" />
          </div>
          <h1 className="text-4xl font-display font-bold text-white tracking-tight">
            MOA <span className="text-moa-gold">COFFEE</span>
          </h1>
          <p className="text-moa-cream/70 font-light text-lg">Fresh Brew, Anywhere You Are.</p>
        </div>

        <div className="space-y-4 pt-8">
           <Card className="border-moa-gold/20">
             <div className="flex items-center gap-3 mb-4 text-left">
                <QrCode className="text-moa-gold" />
                <div>
                  <h3 className="font-bold text-moa-cream">Customer Entry</h3>
                  <p className="text-xs text-moa-cream/50">Simulate QR Scan</p>
                </div>
             </div>
             <div className="flex gap-2">
               <Input 
                 type="number" 
                 placeholder="Table #" 
                 value={tableInput} 
                 onChange={e => setTableInput(e.target.value)}
                 className="w-20 text-center"
               />
               <Button 
                 fullWidth 
                 onClick={() => onSelect('customer', parseInt(tableInput))}
               >
                 Open Menu
               </Button>
             </div>
           </Card>

           <button 
             onClick={() => setIsAdminMode(true)}
             className="flex items-center justify-center gap-2 text-moa-cream/40 hover:text-moa-gold transition-colors text-sm w-full py-4"
           >
             <ShieldCheck size={16} /> Staff Login
           </button>
        </div>
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  // Simple view state management
  const [view, setView] = useState<'landing' | 'customer' | 'admin'>('landing');
  const [table, setTable] = useState<number>(1);

  if (view === 'customer') {
    return <CustomerApp tableNumber={table} />;
  }

  if (view === 'admin') {
    return <AdminPanel onLogout={() => setView('landing')} />;
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
