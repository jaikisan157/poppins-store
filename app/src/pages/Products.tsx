import { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { productsApi } from '@/lib/api';
import type { Product } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Search, Filter, X } from 'lucide-react';
import { debounce } from '@/lib/utils';

const categories = [
  'All',
  'Electronics',
  'Fashion',
  'Home & Garden',
  'Sports',
  'Beauty',
  'Toys',
  'Automotive',
];

const sortOptions = [
  { value: 'createdAt', label: 'Newest' },
  { value: 'price', label: 'Price: Low to High' },
  { value: '-price', label: 'Price: High to Low' },
  { value: 'name', label: 'Name: A-Z' },
];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    page: parseInt(searchParams.get('page') || '1'),
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || 'All',
    minPrice: parseInt(searchParams.get('minPrice') || '0'),
    maxPrice: parseInt(searchParams.get('maxPrice') || '1000'),
    sort: searchParams.get('sort') || 'createdAt',
    order: searchParams.get('order') || 'desc',
  });

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
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
      if (filters.minPrice > 0) params.minPrice = filters.minPrice;
      if (filters.maxPrice < 1000) params.maxPrice = filters.maxPrice;

      const response = await productsApi.getAll(params);
      setProducts(response.data.products);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Failed to fetch products:', error);
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
    if (updated.minPrice > 0) params.set('minPrice', updated.minPrice.toString());
    if (updated.maxPrice < 1000) params.set('maxPrice', updated.maxPrice.toString());
    if (updated.sort !== 'createdAt') params.set('sort', updated.sort);
    if (updated.order !== 'desc') params.set('order', updated.order);

    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      search: '',
      category: 'All',
      minPrice: 0,
      maxPrice: 1000,
      sort: 'createdAt',
      order: 'desc',
    });
    setSearchParams(new URLSearchParams());
  };

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <section className="bg-cream-200 py-16 lg:py-20">
        <div className="container mx-auto px-6 lg:px-12">
          <p className="text-xs font-sans font-semibold tracking-[0.2em] uppercase text-primary mb-3">
            What We Offer
          </p>
          <h1 className="text-4xl lg:text-5xl font-serif font-normal text-foreground">
            Products built{' '}
            <br className="hidden sm:block" />
            for <span className="lumina-accent">real results</span>
          </h1>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-6 lg:px-12">
          {/* Search & Filter Bar */}
          <div className="flex flex-wrap gap-4 items-center mb-10">
            <div className="relative flex-1 min-w-[280px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                defaultValue={filters.search}
                onChange={(e) => debouncedSearch(e.target.value)}
                className="pl-11 bg-cream-100 border-border font-sans text-sm h-11 rounded-sm focus:ring-primary"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-border rounded-sm text-sm font-sans font-medium text-foreground hover:bg-cream-200 transition-colors"
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>
            <Select
              value={filters.sort}
              onValueChange={(value) => updateFilters({ sort: value })}
            >
              <SelectTrigger className="w-[180px] bg-cream-100 border-border font-sans text-sm h-11 rounded-sm">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-white border-border">
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="font-sans text-sm">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-cream-100 border border-border p-6 rounded-sm mb-10 animate-fade-in-up">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-serif text-lg font-medium">Filters</h3>
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1 text-sm font-sans text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                  Clear
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="text-xs font-sans font-medium tracking-[0.1em] uppercase text-muted-foreground mb-2 block">
                    Category
                  </label>
                  <Select
                    value={filters.category}
                    onValueChange={(value) => updateFilters({ category: value, page: 1 })}
                  >
                    <SelectTrigger className="bg-white border-border font-sans text-sm rounded-sm">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-border">
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat} className="font-sans text-sm">
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-sans font-medium tracking-[0.1em] uppercase text-muted-foreground mb-2 block">
                    Price Range: ${filters.minPrice} - ${filters.maxPrice}
                  </label>
                  <Slider
                    value={[filters.minPrice, filters.maxPrice]}
                    onValueChange={([min, max]) =>
                      updateFilters({ minPrice: min, maxPrice: max, page: 1 })
                    }
                    max={1000}
                    step={10}
                    className="mt-4"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Products Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-cream-300 rounded-sm" />
                  <div className="mt-4 space-y-2">
                    <div className="h-4 bg-cream-300 rounded w-3/4" />
                    <div className="h-4 bg-cream-300 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg font-serif text-muted-foreground mb-4">No products found.</p>
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-2 px-6 py-2.5 border border-border rounded-sm text-sm font-sans font-medium text-foreground hover:bg-cream-200 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {products.map((product, index) => (
                  <Link key={product._id} to={`/product/${product._id}`}>
                    <div className="group border-t border-border pt-6">
                      {/* Number */}
                      <span className="text-xs font-sans text-muted-foreground mb-3 block">
                        {String(index + 1 + (filters.page - 1) * 12).padStart(2, '0')}
                      </span>
                      <div className="aspect-square overflow-hidden bg-cream-200 rounded-sm relative">
                        <img
                          src={product.images[0]?.url || '/placeholder-product.jpg'}
                          alt={product.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {product.discountPercentage && product.discountPercentage > 0 && (
                          <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-[10px] font-sans font-semibold tracking-wider uppercase px-3 py-1 rounded-sm">
                            -{product.discountPercentage}%
                          </span>
                        )}
                      </div>
                      <div className="mt-4">
                        <h3 className="font-serif text-lg font-medium line-clamp-1 group-hover:text-primary transition-colors duration-300">
                          {product.name}
                        </h3>
                        <p className="text-sm font-sans text-muted-foreground line-clamp-2 mt-1 mb-2">
                          {product.shortDescription}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="font-sans font-semibold text-lg text-foreground">
                            ₹{product.price.current.toFixed(0)}
                          </span>
                          {product.price.compareAt && (
                            <span className="text-sm font-sans text-muted-foreground line-through">
                              ₹{product.price.compareAt.toFixed(0)}
                            </span>
                          )}
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
                    className="px-5 py-2.5 border border-border rounded-sm text-sm font-sans font-medium text-foreground hover:bg-cream-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-sm font-sans text-muted-foreground">
                    Page {filters.page} of {totalPages}
                  </span>
                  <button
                    disabled={filters.page === totalPages}
                    onClick={() => updateFilters({ page: filters.page + 1 })}
                    className="px-5 py-2.5 border border-border rounded-sm text-sm font-sans font-medium text-foreground hover:bg-cream-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
