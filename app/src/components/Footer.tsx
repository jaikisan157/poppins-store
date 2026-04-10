import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background">
      <div className="container mx-auto px-6 lg:px-12 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <span className="text-primary font-bold text-sm font-mono">S</span>
              </div>
              <span className="text-lg font-heading font-bold tracking-tight text-foreground">
                source<span className="text-primary">Labs</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Premium digital products, templates & source code built by developers, for developers.
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300"
            >
              Home
            </Link>
            <Link
              to="/projects"
              className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300"
            >
              Projects
            </Link>
          </div>
        </div>

        <div className="border-t border-border/50 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} sourceLabs. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground/60">
            Built with ♥ and a lot of caffeine
          </p>
        </div>
      </div>
    </footer>
  );
}
