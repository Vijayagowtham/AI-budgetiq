import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Wallet, 
  CreditCard, 
  Sparkles, 
  PieChart, 
  User as UserIcon, 
  LogOut,
  Target
} from "lucide-react";
import { cn } from "../../utils/cn";
import { Logo } from "../ui/Logo";

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Income", path: "/income", icon: Wallet },
  { name: "Expenses", path: "/expenses", icon: CreditCard },
  { name: "AI Insights", path: "/insights", icon: Sparkles },
  { name: "Reports",     path: "/reports",  icon: PieChart },
  { name: "Goals",       path: "/goals",    icon: Target },
  { name: "Profile",     path: "/profile",  icon: UserIcon },
];

export function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const loadUser = () => {
    const userStr = localStorage.getItem("budgetiq_user");
    if (userStr) {
      try { setUser(JSON.parse(userStr)); } catch {}
    }
  };

  useEffect(() => {
    loadUser();
    const handleStorage = () => loadUser();
    window.addEventListener("storage", handleStorage);
    window.addEventListener("user-updated", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("user-updated", handleStorage);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("budgetiq_token");
    localStorage.removeItem("budgetiq_user");
    navigate("/login");
  };

  return (
    <>
      <div className="no-print">
        {/* Mobile Backdrop */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-30 md:hidden transition-opacity"
            onClick={onClose}
          />
        )}
        
        <aside className={cn(
          "w-64 h-screen bg-slate-900/95 backdrop-blur-xl border-r border-slate-800/60 flex flex-col fixed left-0 top-0 z-40 transition-transform duration-300 md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          {/* Logo */}
          <div className="h-16 flex items-center px-6 border-b border-slate-800/60">
            <Logo />
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative",
                    isActive 
                      ? "bg-primary-500/10 text-primary-400" 
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Active indicator bar */}
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-0.5 bg-primary-500 rounded-r-full" />
                    )}
                    <item.icon 
                      size={18} 
                      className={cn(
                        "transition-all shrink-0",
                        isActive ? "text-primary-400" : "group-hover:scale-110"
                      )} 
                    />
                    <span>{item.name}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* User Info + Logout */}
          <div className="p-4 border-t border-slate-800/60 space-y-3">
            {user && (
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-xs font-bold text-white shrink-0 overflow-hidden ring-1 ring-slate-700">
                  {user.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    user.full_name?.charAt(0)?.toUpperCase() || "U"
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">{user.full_name || "User"}</p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
              </div>
            )}
            <button 
              onClick={handleLogout} 
              className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all focus:outline-none focus:ring-2 focus:ring-red-500/30"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </aside>
      </div>
    </>
  );
}
