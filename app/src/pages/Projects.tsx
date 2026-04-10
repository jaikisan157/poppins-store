import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { productsApi, getImageUrl } from '@/lib/api';
import type { Product } from '@/types';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, ArrowUpRight, Eye, Zap, ArrowRight } from 'lucide-react';
import { debounce } from '@/lib/utils';

const categories = [
  'All',
  'SaaS',
  'Template',
  'Full-Stack App',
  'Landing Page',
  'Dashboard',
  'Mobile App',
  'API / Backend',
  'Other',
];

const sortOptions = [
  { value: 'createdAt', label: 'Newest' },
  { value: 'name', label: 'Name: A-Z' },
  { value: '-viewCount', label: 'Most Viewed' },
  { value: '-clickCount', label: 'Most Popular' },
];

export default function Projects() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState({
    page: parseInt(searchParams.get('page') || '1'),
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || 'All',
    sort: searchParams.get('sort') || 'createdAt',
    order: searchParams.get('order') || 'desc',
  });

  useEffect(() => {
    fetchProjects();
  }, [filters]);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const params: any = {
        page: filters.page,
        limit: 12,
        sort: filters.sort,
        order: filters.order,
      };

      if (filters.search) params.search = filters.search;
      if (filters.category && filters.category !== 'All') params.category = filters.category;

      const response = await productsApi.getAll(params);
      setProjects(response.data.products);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      updateFilters({ search: value, page: 1 });
    }, 500),
    []
  );

  const updateFilters = (newFilters: Partial<typeof filters>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);

    const params = new URLSearchParams();
    if (updated.page > 1) params.set('page', updated.page.toString());
    if (updated.search) params.set('search', updated.search);
    if (updated.category !== 'All') params.set('category', updated.category);
    if (updated.sort !== 'createdAt') params.set('sort', updated.sort);
    if (updated.order !== 'desc') params.set('order', updated.order);

    setSearchParams(params);
  };

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <section className="relative py-16 lg:py-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-72 h-72 bg-primary/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-60 h-60 bg-neon-purple/5 rounded-full blur-[80px]" />
        </div>
        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <p className="text-xs font-mono font-medium tracking-wider uppercase text-primary mb-3">
            All Projects
          </p>
          <h1 className="text-4xl lg:text-5xl font-heading font-bold text-foreground">
            Production-ready{' '}
            <br className="hidden sm:block" />
            <span className="source-accent">source code</span>
          </h1>
          <p className="text-base text-muted-foreground mt-4 max-w-lg">
            Browse our collection of premium projects. Each comes with full source code, documentation, and support.
          </p>
        </div>
      </section>

      <section className="pb-20">
        <div className="container mx-auto px-6 lg:px-12">
          {/* Search & Filter */}
          <div className="flex flex-wrap gap-4 items-center mb-10">
            <div className="relative flex-1 min-w-[280px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                defaultValue={filters.search}
                onChange={(e) => debouncedSearch(e.target.value)}
                className="pl-11 bg-white/[0.03] border-white/10 text-foreground text-sm h-11 rounded-lg focus:border-primary/50 focus:ring-primary/20 placeholder:text-muted-foreground/50"
              />
            </div>
            <Select
              value={filters.category}
              onValueChange={(value) => updateFilters({ category: value, page: 1 })}
            >
              <SelectTrigger className="w-[180px] bg-white/[0.03] border-white/10 text-foreground text-sm h-11 rounded-lg">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-card border-white/10">
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat} className="text-sm">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.sort}
              onValueChange={(value) => updateFilters({ sort: value })}
            >
              <SelectTrigger className="w-[180px] bg-white/[0.03] border-white/10 text-foreground text-sm h-11 rounded-lg">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-card border-white/10">
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-sm">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Projects Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-xl overflow-hidden">
                  <div className="aspect-video shimmer" />
                  <div className="p-5 space-y-3 bg-white/[0.02]">
                    <div className="h-3 shimmer rounded w-1/4" />
                    <div className="h-5 shimmer rounded w-3/4" />
                    <div className="h-4 shimmer rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-lg font-heading text-muted-foreground mb-4">No projects found.</p>
              <button
                onClick={() => {
                  setFilters({
                    page: 1,
                    search: '',
                    category: 'All',
                    sort: 'createdAt',
                    order: 'desc',
                  });
                  setSearchParams(new URLSearchParams());
                }}
                className="inline-flex items-center gap-2 px-6 py-2.5 border border-white/10 rounded-lg text-sm font-medium text-foreground hover:bg-white/[0.03] transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project, index) => (
                  <Link key={project._id} to={`/project/${project._id}`}>
                    <div
                      className="group relative overflow-hidden rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-primary/30 transition-all duration-500 hover:shadow-glow animate-fade-in-up"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      {/* Image */}
                      <div className="aspect-video overflow-hidden relative">
                        <img
                          src={getImageUrl(project.images[0]?.url)}
                          alt={project.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />

                        {project.isFeatured && (
                          <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-primary/90 text-primary-foreground text-[10px] font-semibold font-mono tracking-wider uppercase px-2.5 py-1 rounded-md backdrop-blur">
                            <Zap className="h-3 w-3" />
                            Featured
                          </div>
                        )}

                        <div className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <ArrowUpRight className="h-3.5 w-3.5 text-white" />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-5 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-mono font-medium tracking-wider uppercase text-primary/80 mb-1">
                              {project.category}
                            </p>
                            <h3 className="font-heading text-base font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors duration-300">
                              {project.name}
                            </h3>
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground/50 shrink-0">
                            <Eye className="h-3.5 w-3.5" />
                            <span className="text-xs font-mono">{project.viewCount || 0}</span>
                          </div>
                        </div>

                        {project.shortDescription && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {project.shortDescription}
                          </p>
                        )}

                        {/* Tech Stack */}
                        {project.techStack && project.techStack.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {project.techStack.slice(0, 3).map((tech) => (
                              <span key={tech} className="tech-tag text-[10px]">
                                {tech}
                              </span>
                            ))}
                            {project.techStack.length > 3 && (
                              <span className="tech-tag text-[10px]">+{project.techStack.length - 3}</span>
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
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-12">
                  <button
                    disabled={filters.page === 1}
                    onClick={() => updateFilters({ page: filters.page - 1 })}
                    className="px-5 py-2.5 border border-white/10 rounded-lg text-sm font-medium text-foreground hover:bg-white/[0.03] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-muted-foreground font-mono">
                    {filters.page} / {totalPages}
                  </span>
                  <button
                    disabled={filters.page === totalPages}
                    onClick={() => updateFilters({ page: filters.page + 1 })}
                    className="px-5 py-2.5 border border-white/10 rounded-lg text-sm font-medium text-foreground hover:bg-white/[0.03] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
