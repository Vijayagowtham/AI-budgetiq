import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { api } from "../services/api";

export function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    const email = e.target.email.value;
    const password = e.target.password.value;
    
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.access_token) {
        localStorage.setItem('budgetiq_token', res.access_token);
        localStorage.setItem('budgetiq_user', JSON.stringify(res.user));
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full p-6 md:p-8 border-slate-700/60 bg-slate-900/50 backdrop-blur-xl">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-50 mb-2">Welcome back</h1>
        <p className="text-slate-400 text-sm">Sign in to your BudgetAI account</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        {error && (
          <div className="p-3 text-sm rounded-lg bg-red-500/10 border border-red-500/20 text-red-500">
            {error}
          </div>
        )}
        
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-300">Email Address</label>
          <Input 
            name="email"
            icon={Mail} 
            type="email" 
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="space-y-1.5 relative">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-slate-300">Password</label>
            <Link to="#" className="text-xs text-primary-400 hover:text-primary-300 transition-colors">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Input 
              name="password"
              icon={Lock} 
              type={showPassword ? "text" : "password"} 
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 focus:outline-none"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full mt-2 group py-2.5" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
          {!loading && <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />}
        </Button>
      </form>

      <div className="mt-8 text-center text-sm text-slate-400">
        Don't have an account?{" "}
        <Link to="/signup" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
          Sign up
        </Link>
      </div>
    </Card>
  );
}
