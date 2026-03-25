import { Bell, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export function Navbar({ onMenuClick }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const loadUser = () => {
    const userStr = localStorage.getItem("budgetiq_user");
    if (userStr) {
      try { setUser(JSON.parse(userStr)); } catch {}
    }
  };

  useEffect(() => {
    loadUser();

    const handleStorage = () => loadUser();
    window.addEventListener('storage', handleStorage);
    window.addEventListener('user-updated', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('user-updated', handleStorage);
    };
  }, []);

  const getInitials = () => {
    if (!user?.full_name) return "U";
    const parts = user.full_name.trim().split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0][0].toUpperCase();
  };

  return (
    <header className="no-print h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/60 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
      {/* Left: hamburger (mobile) + greeting */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick} 
          className="md:hidden p-2 -ml-2 text-slate-400 hover:text-slate-50 hover:bg-slate-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-600"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
        <div className="hidden md:block">
          <p className="text-base font-semibold text-slate-100">
            {user?.full_name ? `Hello, ${user.full_name.split(' ')[0]} 👋` : "Welcome back!"}
          </p>
          <p className="text-xs text-slate-500">Here's your financial overview today.</p>
        </div>
      </div>

      {/* Right: notifications + user */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Notification bell */}
        <div className="relative">
          <button 
            className="p-2 text-slate-400 hover:text-slate-50 transition-colors rounded-full hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-600"
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary-500 ring-2 ring-slate-900" />
          </button>
        </div>

        <div className="h-7 w-px bg-slate-800 hidden md:block" />

        {/* User avatar */}
        <button
          onClick={() => navigate("/profile")}
          className="flex items-center gap-3 pl-1 hover:opacity-90 transition-opacity rounded-lg py-1 pr-1 focus:outline-none focus:ring-2 focus:ring-slate-600 group"
          aria-label="Go to profile"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-primary-600 to-accent-500 flex items-center justify-center text-sm font-semibold text-white shadow-sm ring-2 ring-slate-800 overflow-hidden group-hover:ring-primary-500/50 transition-all">
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              getInitials()
            )}
          </div>
          <div className="hidden md:block text-sm text-left">
            <p className="font-medium text-slate-200 leading-tight">
              {user?.full_name || "User"}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">BudgetAI Pro</p>
          </div>
        </button>
      </div>
    </header>
  );
}
