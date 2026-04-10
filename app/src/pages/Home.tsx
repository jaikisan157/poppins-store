import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { productsApi, getImageUrl } from '@/lib/api';
import type { Product } from '@/types';
import { ArrowRight, ArrowUpRight, Eye, Zap, Code2, Layers } from 'lucide-react';

function ProjectCard({ project, index }: { project: Product; index: number }) {
  const mainImage = getImageUrl(project.images?.[0]?.url);

  return (
    <Link
      to={`/project/${project._id}`}
      className={`group block animate-fade-in-up`}
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <div className="relative overflow-hidden rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-primary/30 transition-all duration-500 hover:shadow-glow">
        {/* Image */}
        <div className="aspect-video overflow-hidden relative">
          <img
            src={mainImage}
            alt={project.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />

          {/* Featured badge */}
          {project.isFeatured && (
            <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-primary/90 text-primary-foreground text-[10px] font-semibold font-mono tracking-wider uppercase px-2.5 py-1 rounded-md backdrop-blur">
              <Zap className="h-3 w-3" />
              Featured
            </div>
          )}

          {/* View arrow */}
          <div className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0 translate-x-2">
            <ArrowUpRight className="h-4 w-4 text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-mono font-medium tracking-wider uppercase text-primary/80 mb-1">
                {project.category}
              </p>
              <h3 className="font-heading text-lg font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors duration-300">
                {project.name}
              </h3>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground/50 shrink-0">
              <Eye className="h-3.5 w-3.5" />
              <span className="text-xs font-mono">{project.viewCount || 0}</span>
            </div>
          </div>

          {project.shortDescription && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {project.shortDescription}
            </p>
          )}

          {/* Tech Stack */}
          {project.techStack && project.techStack.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {project.techStack.slice(0, 4).map((tech) => (
                <span key={tech} className="tech-tag text-[10px]">
                  {tech}
                </span>
              ))}
              {project.techStack.length > 4 && (
                <span className="tech-tag text-[10px]">+{project.techStack.length - 4}</span>
              )}
            </div>
          )}

          {/* CTA hint */}
          <div className="pt-2 border-t border-white/[0.06]">
            <span className="text-xs font-medium text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              View Details
              <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const [allProjects, setAllProjects] = useState<Product[]>([]);
  const [featuredProjects, setFeaturedProjects] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const [allResp, featuredResp] = await Promise.allSettled([
        productsApi.getAll({ limit: 8 }),
        productsApi.getFeatured(),
      ]);

      if (allResp.status === 'fulfilled') {
        setAllProjects(allResp.value.data.products || []);
      }
      if (featuredResp.status === 'fulfilled') {
        setFeaturedProjects(featuredResp.value.data.products || []);
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const displayProjects = featuredProjects.length > 0 ? featuredProjects : allProjects;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 lg:py-36 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-neon-purple/5 rounded-full blur-[100px]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        </div>

        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="max-w-3xl mx-auto text-center animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 mb-8">
              <span className="h-2 w-2 rounded-full bg-primary pulse-dot" />
              <span className="text-xs font-mono font-medium text-primary tracking-wider uppercase">
                Premium Source Code
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-heading font-bold leading-[1.05] mb-6 text-foreground tracking-tight">
              Digital products{' '}
              <span className="source-accent">built to ship</span>
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-xl mx-auto">
              Production-ready templates, full-stack apps & developer tools.
              Skip months of building from scratch.
            </p>

            <div className="flex items-center justify-center">
              <Link
                to="/projects"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 text-sm font-semibold rounded-xl hover:bg-primary/90 transition-all duration-300 glow-primary hover:glow-primary-strong hover:-translate-y-0.5"
              >
                Browse Projects
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-6 border-y border-border/30">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-3 gap-6">
            {[
              { icon: Code2, value: `${displayProjects.length}+`, label: 'Projects' },
              { icon: Layers, value: 'Full-Stack', label: 'Ready to deploy' },
              { icon: Zap, value: '100%', label: 'Source Code' },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-3 justify-center group">
                <div className="h-10 w-10 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors duration-300">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-heading text-sm font-bold text-foreground">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-20">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-xs font-mono font-medium tracking-wider uppercase text-primary mb-3">
                Our Collection
              </p>
              <h2 className="text-3xl lg:text-4xl font-heading font-bold text-foreground">
                {featuredProjects.length > 0 ? 'Featured Projects' : 'Latest Projects'}
              </h2>
            </div>
            <Link
              to="/projects"
              className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors group"
            >
              View All
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-xl overflow-hidden">
                  <div className="aspect-video shimmer" />
                  <div className="p-5 space-y-3 bg-white/[0.02]">
                    <div className="h-3 shimmer rounded w-1/4" />
                    <div className="h-5 shimmer rounded w-3/4" />
                    <div className="h-4 shimmer rounded w-full" />
                    <div className="flex gap-2 pt-2">
                      <div className="h-6 shimmer rounded w-16" />
                      <div className="h-6 shimmer rounded w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : displayProjects.length === 0 ? (
            <div className="text-center py-24">
              <div className="h-20 w-20 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center mx-auto mb-6">
                <Code2 className="h-8 w-8 text-primary/40" />
              </div>
              <h3 className="text-xl font-heading font-semibold text-foreground mb-2">No projects yet</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Projects will appear here once they're added.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayProjects.map((project, index) => (
                <ProjectCard key={project._id} project={project} index={index} />
              ))}
            </div>
          )}

          <div className="sm:hidden mt-10 text-center">
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary"
            >
              View All Projects
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/[0.03] rounded-full blur-[100px]" />
        </div>
        <div className="container mx-auto px-6 lg:px-12 text-center relative z-10">
          <p className="text-xs font-mono font-medium tracking-wider uppercase text-primary mb-4">
            Stop building from scratch
          </p>
          <h2 className="text-3xl lg:text-4xl font-heading font-bold text-foreground mb-5">
            Ship <span className="source-accent">faster</span> with production-ready code
          </h2>
          <p className="text-base text-muted-foreground mb-10 max-w-md mx-auto">
            Every project comes with full source code, documentation, and lifetime access to updates.
          </p>
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-10 py-4 text-sm font-semibold rounded-xl hover:bg-primary/90 transition-all duration-300 glow-primary hover:glow-primary-strong hover:-translate-y-0.5"
          >
            Explore All Projects
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
