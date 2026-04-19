import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Calculator, Package, BarChart3, User, Scan, LogOut, History } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const Layout = () => {
  const { profile, logout } = useAuth();
  
  const navItems = [
    { to: '/', icon: Calculator, label: 'Billing Dashboard' },
    { to: '/products', icon: Package, label: 'Inventory Management' },
    { to: '/analytics', icon: BarChart3, label: 'Sales Analytics' },
    { to: '/history', icon: History, label: 'Activity Log' },
    { to: '/profile', icon: User, label: 'Shop Profile' }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50/50">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-gray-100 flex-col sticky top-0 h-screen">
        <div className="p-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Scan className="text-white w-6 h-6" />
          </div>
          <span className="text-2xl font-bold text-gray-800 tracking-tight">LekkaFlow</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 font-medium",
                isActive 
                  ? "bg-primary/5 text-primary shadow-sm ring-1 ring-primary/10" 
                  : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-6 border-t border-gray-50 mt-auto">
          <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3 mb-4">
             <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center font-bold">
                {profile?.shopName?.charAt(0).toUpperCase()}
             </div>
             <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-gray-800 truncate">{profile?.shopName}</div>
                <div className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Premium Store</div>
             </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-50 hover:text-red-500 transition-colors text-sm font-bold"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header for Mobile & Desktop Status */}
        <header className="sticky top-0 z-40 w-full glass-effect border-b border-gray-100 px-6 py-4 flex justify-between items-center h-20">
          <div className="flex items-center gap-4 lg:hidden">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Scan className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">LekkaFlow</h1>
          </div>
          
          <div className="hidden lg:block">
             <div className="bg-emerald-50 text-primary px-4 py-2 rounded-full text-xs font-bold border border-emerald-100">
                Cloud Terminal Active
             </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">GST Ready</div>
                <div className="text-sm font-bold text-gray-800">{profile?.gstNumber || 'Unregistered'}</div>
             </div>
             <div className="w-10 h-10 rounded-full border-2 border-primary/20 p-0.5">
                <div className="w-full h-full bg-gray-200 rounded-full overflow-hidden">
                   <img src={`https://ui-avatars.com/api/?name=${profile?.shopName}&background=10B981&color=fff`} />
                </div>
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto w-full max-w-7xl mx-auto px-6 py-8">
          <Outlet />
        </main>

        {/* Bottom Nav for Mobile */}
        <nav className="fixed bottom-0 left-0 right-0 glass-effect border-t border-gray-100 h-16 flex lg:hidden items-center justify-around px-2 safe-area-inset z-50">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => cn(
                "flex flex-col items-center justify-center w-full h-full gap-1 transition-all duration-200",
                isActive ? "text-primary scale-110" : "text-gray-400"
              )}
            >
              <Icon className="w-6 h-6" />
              <span className="text-[10px] font-medium">{label.split(' ')[0]}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Layout;
export { cn };
