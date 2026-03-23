import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ShoppingCart, User, Menu, X, Package, LogOut, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const navLinkClass = (path: string) =>
    `text-xs font-sans font-medium tracking-[0.15em] uppercase transition-colors duration-300 pb-1 ${isActive(path)
      ? 'text-foreground border-b border-foreground'
      : 'text-muted-foreground hover:text-foreground'
    }`;

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 border-b border-border/50">
      <div className="container mx-auto px-6 lg:px-12 h-[72px] flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-2xl font-serif font-normal tracking-wide text-foreground transition-colors group-hover:text-primary">
            Popp<span className="text-copper-500">ins</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-10">
          <Link to="/" className={navLinkClass('/')}>
            Home
          </Link>
          <Link to="/products" className={navLinkClass('/products')}>
            Products
          </Link>
          <Link to="/track-order" className={navLinkClass('/track-order')}>
            Track Order
          </Link>
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-5">
          <Link to="/cart" className="relative group">
            <div className="p-2 rounded-full transition-colors hover:bg-secondary">
              <ShoppingCart className="h-5 w-5 text-foreground/70 group-hover:text-foreground transition-colors" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-primary text-primary-foreground text-[10px] font-sans font-semibold flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </div>
          </Link>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 rounded-full transition-colors hover:bg-secondary">
                  <User className="h-5 w-5 text-foreground/70" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white border-border">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium font-sans">{user?.fullName}</p>
                  <p className="text-xs text-muted-foreground font-sans">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                {isAdmin && (
                  <DropdownMenuItem onClick={() => navigate('/admin')} className="font-sans text-sm text-primary font-medium">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Admin Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => navigate('/profile')} className="font-sans text-sm">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/orders')} className="font-sans text-sm">
                  <Package className="mr-2 h-4 w-4" />
                  My Orders
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="font-sans text-sm text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/login')}
                className="text-xs font-sans font-medium tracking-[0.1em] uppercase text-muted-foreground hover:text-foreground transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="text-xs font-sans font-medium tracking-[0.1em] uppercase bg-primary text-primary-foreground px-5 py-2.5 rounded hover:bg-primary/90 transition-colors"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-full hover:bg-secondary transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border/50 bg-white">
          <div className="container mx-auto px-6 py-6 space-y-1">
            <Link
              to="/"
              className="block py-3 text-sm font-sans font-medium tracking-wide text-foreground hover:text-primary transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/products"
              className="block py-3 text-sm font-sans font-medium tracking-wide text-foreground hover:text-primary transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Products
            </Link>
            <Link
              to="/track-order"
              className="block py-3 text-sm font-sans font-medium tracking-wide text-foreground hover:text-primary transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Track Order
            </Link>
            <Link
              to="/cart"
              className="block py-3 text-sm font-sans font-medium tracking-wide text-foreground hover:text-primary transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Cart ({itemCount})
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="block py-3 text-sm font-sans font-medium tracking-wide text-foreground hover:text-primary transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  to="/orders"
                  className="block py-3 text-sm font-sans font-medium tracking-wide text-foreground hover:text-primary transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  My Orders
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block py-3 text-sm font-sans font-medium text-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="pt-4 flex gap-3">
                <Link
                  to="/login"
                  className="flex-1 text-center py-2.5 text-sm font-sans font-medium border border-border rounded hover:bg-secondary transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="flex-1 text-center py-2.5 text-sm font-sans font-medium bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
