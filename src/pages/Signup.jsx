import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { api } from "../services/api";

export function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    
    const full_name = e.target.full_name.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    const confirm_password = e.target.confirm_password.value;
    
    if (password !== confirm_password) {
      return setError("Passwords do not match");
    }
    
    setLoading(true);
    try {
      await api.post('/auth/register', { email, password, full_name });
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 4000);
    } catch (err) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full p-6 md:p-8 border-slate-700/60 bg-slate-900/50 backdrop-blur-xl">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-slate-50 mb-2">Create an account</h1>
        <p className="text-slate-400 text-sm">Start managing your budget smartly</p>
      </div>

      {success ? (
        <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center animate-in zoom-in-95 duration-300">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <Mail className="h-6 w-6 text-emerald-400" />
          </div>
          <h3 className="text-emerald-400 font-semibold mb-2 text-lg">Account created</h3>
          <p className="text-sm text-emerald-500/80 mb-4">
            You can now log in securely.
          </p>
          <p className="text-xs text-slate-400">Redirecting to login...</p>
        </div>
      ) : (
        <form onSubmit={handleSignup} className="space-y-4">
          {error && (
            <div className="p-3 text-sm rounded-lg bg-red-500/10 border border-red-500/20 text-red-500">
              {error}
            </div>
          )}
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Full Name</label>
            <Input 
              name="full_name"
              icon={User} 
              type="text" 
              placeholder="John Doe"
              required
            />
          </div>

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

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Password</label>
            <div className="relative">
              <Input 
                name="password"
                icon={Lock} 
                type={showPassword ? "text" : "password"} 
                placeholder="Create a password"
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
          
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-300">Confirm Password</label>
            <Input 
              name="confirm_password"
              icon={Lock} 
              type={showPassword ? "text" : "password"} 
              placeholder="Confirm your password"
              required
            />
          </div>

          <Button type="submit" className="w-full mt-2 group py-2.5" disabled={loading}>
            {loading ? 'Creating...' : 'Create Account'}
            {!loading && <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />}
          </Button>
        </form>
      )}

      <div className="mt-8 text-center text-sm text-slate-400">
        Already have an account?{" "}
        <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
          Sign in
        </Link>
      </div>
    </Card>
  );
}
