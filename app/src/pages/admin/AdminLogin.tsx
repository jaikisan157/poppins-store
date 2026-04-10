import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Loader2, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

export default function AdminLogin() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.post('/admin/login', {
        email: formData.email,
        password: formData.password,
      });

      const { token } = response.data;
      localStorage.setItem('token', token);

      window.location.href = '/admin';
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Admin login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-16 px-6 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2.5 justify-center">
            <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <span className="text-primary font-bold text-sm font-mono">S</span>
            </div>
            <span className="text-2xl font-heading font-bold tracking-tight text-foreground">
              source<span className="text-primary">Labs</span>
            </span>
          </Link>
        </div>

        <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-3">
              <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
            </div>
            <h1 className="text-2xl font-heading font-bold text-foreground mb-2">Admin Login</h1>
            <p className="text-sm text-muted-foreground">
              Authorized personnel only
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-medium tracking-wider uppercase text-muted-foreground">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="admin@sourcelabs.dev"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="bg-white/[0.03] border-white/10 text-foreground text-sm h-11 rounded-lg placeholder:text-muted-foreground/40"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium tracking-wider uppercase text-muted-foreground">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="bg-white/[0.03] border-white/10 text-foreground text-sm h-11 rounded-lg pr-10 placeholder:text-muted-foreground/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3.5 text-sm font-semibold rounded-xl hover:bg-primary/90 transition-all duration-300 glow-primary disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4" />
                  Admin Sign In
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-7">
            <Link to="/" className="text-primary hover:underline font-medium">
              ← Back to Site
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
