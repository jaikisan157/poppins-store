import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      toast.error('Google login failed. Please try again.');
      navigate('/login', { replace: true });
      return;
    }

    if (token) {
      handleGoogleToken(token);
    } else {
      navigate('/login', { replace: true });
    }
  }, []);

  const handleGoogleToken = async (token: string) => {
    try {
      // Store token
      localStorage.setItem('token', token);

      // Fetch user profile
      const response = await api.get('/auth/me');
      const user = response.data.user;

      // Set user in context by reloading (simplest approach)
      if (user.role === 'admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Auth callback error:', error);
      localStorage.removeItem('token');
      toast.error('Authentication failed');
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream-200">
      <div className="text-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
        <p className="text-lg font-serif text-foreground">Signing you in...</p>
        <p className="text-sm text-muted-foreground mt-1">Please wait while we verify your account</p>
      </div>
    </div>
  );
}
