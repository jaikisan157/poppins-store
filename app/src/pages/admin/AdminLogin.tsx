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
    <div className="min-h-screen flex items-center justify-center py-16 px-6 bg-charcoal-900">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <Link to="/" className="inline-block">
            <span className="text-3xl font-serif text-cream-100">
              Poppi<span className="text-copper-500">ns</span>
            </span>
          </Link>
        </div>

        <div className="bg-charcoal-800 border border-charcoal-700 rounded-sm p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-3">
              <Shield className="h-8 w-8 text-copper-500" />
            </div>
            <h1 className="text-2xl font-serif font-normal text-cream-100 mb-2">Admin Login</h1>
            <p className="text-sm font-sans text-cream-500">
              Authorized personnel only
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-sans font-medium tracking-[0.1em] uppercase text-cream-400">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="admin@poppins.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="bg-charcoal-700 border-charcoal-600 text-cream-100 font-sans text-sm h-11 rounded-sm placeholder:text-cream-500/50"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-sans font-medium tracking-[0.1em] uppercase text-cream-400">
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
                  className="bg-charcoal-700 border-charcoal-600 text-cream-100 font-sans text-sm h-11 rounded-sm pr-10 placeholder:text-cream-500/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cream-500 hover:text-cream-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 bg-copper-500 text-cream-50 px-6 py-3 text-xs font-sans font-semibold tracking-[0.15em] uppercase rounded-sm hover:bg-copper-600 transition-all duration-300 disabled:opacity-50"
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

          <p className="text-center text-sm font-sans text-cream-500 mt-7">
            <Link to="/login" className="text-copper-500 hover:underline font-medium">
              Customer Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
