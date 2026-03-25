import { Outlet } from "react-router-dom";
import { Logo } from "../ui/Logo";

export function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration elements for premium feel */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent-500/10 blur-[120px] pointer-events-none" />
      
      <div className="absolute top-8 left-8 md:top-12 md:left-12">
        <Logo />
      </div>

      <div className="w-full max-w-md z-10 animate-in slide-in-from-bottom-4 fade-in duration-500">
        <Outlet />
      </div>
    </div>
  );
}
