import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-charcoal-900 text-cream-300">
      <div className="container mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <span className="text-2xl font-serif text-cream-100">
                Popp<span className="text-copper-500">ins</span>
              </span>
            </Link>
            <p className="text-sm text-cream-500 font-sans leading-relaxed">
              Your premium shopping destination. Quality products, fast shipping, excellent service.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-sans text-xs font-semibold tracking-[0.15em] uppercase text-cream-400 mb-5">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="text-sm font-sans text-cream-500 hover:text-copper-500 transition-colors duration-300"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="text-sm font-sans text-cream-500 hover:text-copper-500 transition-colors duration-300"
                >
                  Products
                </Link>
              </li>
              <li>
                <Link
                  to="/track-order"
                  className="text-sm font-sans text-cream-500 hover:text-copper-500 transition-colors duration-300"
                >
                  Track Order
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-sans text-xs font-semibold tracking-[0.15em] uppercase text-cream-400 mb-5">
              Customer Service
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/login"
                  className="text-sm font-sans text-cream-500 hover:text-copper-500 transition-colors duration-300"
                >
                  My Account
                </Link>
              </li>
              <li>
                <Link
                  to="/orders"
                  className="text-sm font-sans text-cream-500 hover:text-copper-500 transition-colors duration-300"
                >
                  Order History
                </Link>
              </li>
              <li>
                <span className="text-sm font-sans text-cream-500">
                  Shipping Info
                </span>
              </li>
              <li>
                <span className="text-sm font-sans text-cream-500">
                  Returns &amp; Refunds
                </span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-sans text-xs font-semibold tracking-[0.15em] uppercase text-cream-400 mb-5">
              Contact Us
            </h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-sm font-sans text-cream-500">
                <Mail className="h-4 w-4 text-copper-500 flex-shrink-0" />
                support@poppins.com
              </li>
              <li className="flex items-center gap-3 text-sm font-sans text-cream-500">
                <Phone className="h-4 w-4 text-copper-500 flex-shrink-0" />
                +1 (555) 123-4567
              </li>
              <li className="flex items-start gap-3 text-sm font-sans text-cream-500">
                <MapPin className="h-4 w-4 text-copper-500 flex-shrink-0 mt-0.5" />
                123 Commerce St, New York, NY 10001
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-charcoal-700 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-2xl font-serif text-cream-100">
            Popp<span className="text-copper-500">ins</span>
          </span>
          <p className="text-sm font-sans text-cream-500">
            © {new Date().getFullYear()} Poppins. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/" className="text-sm font-sans text-cream-500 hover:text-copper-500 transition-colors">
              Home
            </Link>
            <Link to="/products" className="text-sm font-sans text-cream-500 hover:text-copper-500 transition-colors">
              Products
            </Link>
            <Link to="/track-order" className="text-sm font-sans text-cream-500 hover:text-copper-500 transition-colors">
              Track Order
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
