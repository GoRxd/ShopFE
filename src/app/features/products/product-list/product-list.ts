import { Component, inject, signal, computed, resource, input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService, CategoryTree, AttributeFilter } from '../../../core/services/category.service';
import { CartService } from '../../../core/services/cart.service';
import { ProductListItem } from '../../../core/models/product.model';
import { ActivatedRoute, RouterLink, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { firstValueFrom, map, take } from 'rxjs';
import { ProductSidebar } from '../product-sidebar';
import { LucideAngularModule, ChevronRight, Home } from 'lucide-angular';
import { PlnCurrencyPipe } from '../../../core/pipes/pln-currency.pipe';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, ProductSidebar, LucideAngularModule, RouterLink, PlnCurrencyPipe],
  template: `
    <div class="container-custom py-8">
      <!-- Breadcrumbs -->
      <nav class="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-8 overflow-x-auto whitespace-nowrap pb-2">
        <a routerLink="/" class="hover:text-primary transition-colors flex items-center gap-1">
          <lucide-icon [name]="HomeIcon" class="w-4 h-4"></lucide-icon>
          <span>Sklep</span>
        </a>
        <lucide-icon [name]="ChevronRightIcon" class="w-3 h-3 text-slate-300 dark:text-slate-700"></lucide-icon>
        @for (crumb of breadcrumbs(); track crumb.slug; let last = $last) {
          @if (!last) {
            <a [routerLink]="['/products', crumb.slug]" class="hover:text-primary transition-colors">
              {{ crumb.name }}
            </a>
            <lucide-icon [name]="ChevronRightIcon" class="w-3 h-3 text-slate-300 dark:text-slate-700"></lucide-icon>
          } @else {
            <span class="font-semibold text-slate-900 dark:text-white truncate">{{ crumb.name }}</span>
          }
        }
      </nav>

      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Sidebar -->
        <aside class="w-full lg:w-72 flex-shrink-0">
          <app-product-sidebar 
            [currentCategory]="currentCategory()"
            [categories]="allCategories()"
            [parentCategory]="parentCategory()"
            [subCategories]="subCategories()"
            [applicableAttributes]="applicableAttributes()"
            [activeAttributes]="attributes()"
            [minPrice]="minPrice()"
            [maxPrice]="maxPrice()"
            (filtersChanged)="onFiltersChange($event)"
          />
        </aside>

        <!-- Main Content -->
        <div class="flex-grow">
          <div class="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 class="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                {{ headerTitle() }}
              </h1>
              <p class="text-slate-500 dark:text-slate-400 mt-1">
                {{ productsResource.isLoading() ? 'Szukanie produktów...' : 'Znaleźliśmy ' + products().length + ' produktów dla Ciebie' }}
              </p>
            </div>
            
            <div class="flex items-center gap-3">
              <select (change)="onSortChange($event)" class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer">
                <option value="">Od najtrafniejszych</option>
                <option value="price_asc">Cena: od najniższej</option>
                <option value="price_desc">Cena: od najwyższej</option>
                <option value="newest">Najnowsze</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        @if (productsResource.isLoading()) {
          @for (i of [1,2,3,4,5,6,7,8]; track i) {
            <div class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm animate-pulse">
              <div class="w-full aspect-square bg-slate-100 dark:bg-slate-800 rounded-xl mb-4"></div>
              <div class="h-5 bg-slate-100 dark:bg-slate-800 rounded-lg w-3/4 mb-3"></div>
              <div class="h-4 bg-slate-100 dark:bg-slate-800 rounded-lg w-1/4"></div>
            </div>
          }
        } @else {
          @for (product of products(); track product.id) {
            <div [routerLink]="['/product', product.id]" class="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 cursor-pointer flex flex-col">
              <div class="relative w-full aspect-square bg-slate-50 dark:bg-slate-800 rounded-xl mb-4 overflow-hidden">
                <img 
                  [src]="product.imageUrl || 'https://placehold.co/600x600/f8fafc/6366f1?text=' + product.name" 
                  [alt]="product.name"
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 dark:hidden"
                />
                <img 
                  [src]="product.imageUrl || 'https://placehold.co/600x600/1e293b/94a3b8?text=' + product.name" 
                  [alt]="product.name"
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 hidden dark:block"
                />
                <div class="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <button 
                    (click)="addToCart($event, product)"
                    class="bg-white/90 dark:bg-slate-900/90 backdrop-blur p-2 rounded-full shadow-lg text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div class="flex-grow">
                <h3 class="font-bold text-slate-800 dark:text-white text-lg group-hover:text-primary transition-colors mb-1">
                  {{ product.name }}
                </h3>
                <p class="text-slate-400 dark:text-slate-500 text-sm mb-4">{{ product.categoryName }}</p>
              </div>

              <div class="flex items-center justify-between mt-auto pt-4 border-t border-slate-50 dark:border-slate-800">
                <span class="text-2xl font-black text-slate-900 dark:text-white">{{ product.price | plnCurrency }}</span>
                <span class="text-xs font-bold text-primary bg-primary/10 dark:bg-primary/20 px-2 py-1 rounded-md uppercase tracking-wider">Nowość</span>
              </div>
            </div>
          } @empty {
            <div class="col-span-full py-20 text-center">
              <div class="inline-flex items-center justify-center w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full mb-4 text-slate-300 dark:text-slate-700">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </div>
              <h3 class="text-xl font-bold text-slate-800 dark:text-white">Nie znaleziono produktów</h3>
              @if (headerTitle().includes('Wyniki dla')) {
                <p class="text-slate-500 dark:text-slate-400">Nie znaleźliśmy produktów pasujących do Twojego wyszukiwania.</p>
              } @else {
                <p class="text-slate-500 dark:text-slate-400">Brak produktów w tej kategorii.</p>
              }
            </div>
          }
        }
    </div>
  `
})
export class ProductListComponent {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private cartService = inject(CartService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  readonly ChevronRightIcon = ChevronRight;
  readonly HomeIcon = Home;

  private params = toSignal(this.route.params);
  private queryParams = toSignal(this.route.queryParams);

  constructor() {
    effect(() => {
      const params = this.queryParams();
      if (!params) return;

      const attrs: Record<string, string> = {};
      let hasAttrs = false;

      Object.keys(params).forEach(key => {
        if (key.startsWith('attr_')) {
          attrs[key.replace('attr_', '')] = params[key];
          hasAttrs = true;
        }
      });

      // Update signal only if we found attributes (or to clear if none? tricky with manual filters)
      // For now, assume URL is source of truth if specific attrs are present.
      // Or we can just set it. 
      // If user navigates to clean URL, attrs should receive empty object? 
       // If no attr_ params, we might want to clear existing attributes IF they came from URL previously. 
       // But if manual filters added them... 
       // Simple approach: Always sync signal to URL content for attributes.
       this.attributes.set(attrs);
       
       // Also sync Price
       const minP = params['minPrice'] ? Number(params['minPrice']) : undefined;
       const maxP = params['maxPrice'] ? Number(params['maxPrice']) : undefined;
       
       this.minPrice.set(minP);
       this.maxPrice.set(maxP);
    }, { allowSignalWrites: true });
  }

  allCategories = signal<CategoryTree[]>([]);

  currentCategory = signal<{ id: number, name: string, slug: string, parentId?: number } | null>(null);

  breadcrumbs = computed(() => {
    const slug = this.params()?.['slug'];
    if (!slug) return [];
    
    const path: { name: string, slug: string }[] = [];
    this.findPathInTree(slug, this.allCategories(), path);
    return path;
  });

  subCategories = computed(() => {
    const slug = this.params()?.['slug'];
    if (!slug) return this.allCategories(); // Return root categories if no slug

    const category = this.findCategoryInTreeRecursive(slug, this.allCategories());
    return category?.subCategories ?? [];
  });

  parentCategory = computed(() => {
    const cur = this.currentCategory();
    if (!cur || !cur.parentId) return null;
    
    // Find parent name
    return this.findCategoryByIdRecursive(cur.parentId, this.allCategories());
  });

  applicableAttributes = computed(() => {
    const slug = this.params()?.['slug'];
    if (!slug) return [];

    const category = this.findCategoryInTreeRecursive(slug, this.allCategories());
    return category?.applicableAttributes ?? [];
  });

  minPrice = signal<number | undefined>(undefined);
  maxPrice = signal<number | undefined>(undefined);
  attributes = signal<Record<string, string>>({});
  sortBy = signal<string | undefined>(undefined);
  sortDirection = signal<string | undefined>(undefined);

  productsResource = resource<ProductListItem[], { slug?: string, q?: string, minPrice?: number, maxPrice?: number, attributes?: Record<string, string>, sortBy?: string, sortDirection?: string }>({
    params: () => ({
      slug: this.params()?.['slug'],
      q: this.queryParams()?.['q'],
      minPrice: this.minPrice(),
      maxPrice: this.maxPrice(),
      attributes: this.attributes(),
      sortBy: this.sortBy(),
      sortDirection: this.sortDirection()
    }),
    loader: async ({ params }) => {
      const { slug, q, minPrice, maxPrice, attributes, sortBy, sortDirection } = params;
      
      const categories = await firstValueFrom(this.categoryService.getCategoriesTree().pipe(take(1)));
      this.allCategories.set(categories);
      
      let categoryIds: number[] | undefined;
      
      if (slug) {
        const category = this.findCategoryInTreeRecursive(slug, categories);
        if (category) {
          categoryIds = [category.id];
          this.currentCategory.set({ 
            id: category.id, 
            name: category.name, 
            slug: category.slug, // Fix: Changed from parentId logic which might be buggy if parentId is not populated correctly in findCategory
            parentId: this.findParentIdInTree(category.id, categories)
          });
        } else {
          this.currentCategory.set(null);
        }
      } else {
        this.currentCategory.set(null);
      }

      // Convert attributes record to matching query params (e.g. attr_Color: 'Red')
      const queryParams: any = { 
        categoryIds, 
        q,
        minPrice,
        maxPrice,
        sortBy,
        sortDirection
      };

      if (attributes) {
        Object.entries(attributes).forEach(([key, value]) => {
          queryParams[`attr_${key}`] = value;
        });
      }

      return firstValueFrom(this.productService.getProducts(queryParams));
    }
  });
  products = computed(() => this.productsResource.value() ?? []);

  onFiltersChange(filters: { minPrice?: number, maxPrice?: number, attributes: Record<string, string> }) {
    // 1. Get current query params to preserve non-filter ones (like 'q')
    const currentParams = this.queryParams() || {};
    const newParams: any = { ...currentParams };

    // 2. Remove all existing attr_ params and min/max price to start clean for filters
    Object.keys(newParams).forEach(key => {
      if (key.startsWith('attr_') || key === 'minPrice' || key === 'maxPrice') {
        delete newParams[key];
      }
    });

    // 3. Add new filter params
    if (filters.minPrice !== undefined) newParams.minPrice = filters.minPrice;
    if (filters.maxPrice !== undefined) newParams.maxPrice = filters.maxPrice;
    
    Object.entries(filters.attributes).forEach(([key, value]) => {
      if (value) {
        newParams[`attr_${key}`] = value;
      }
    });

    // 4. Navigate (this will trigger the effect to update signals)
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: newParams,
      queryParamsHandling: 'replace' // We manually constructed the full set
    });
  }

  onSortChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    switch (value) {
      case 'price_asc':
        this.sortBy.set('price');
        this.sortDirection.set('asc');
        break;
      case 'price_desc':
        this.sortBy.set('price');
        this.sortDirection.set('desc');
        break;
      case 'newest':
        this.sortBy.set('newest');
        this.sortDirection.set('desc');
        break;
      default:
        this.sortBy.set(undefined);
        this.sortDirection.set(undefined);
    }
  }
  
  headerTitle = computed(() => {
    const categoryName = this.currentCategory()?.name;
    const searchTerm = this.queryParams()?.['q'];
    
    if (searchTerm && categoryName) return `Wyniki dla "${searchTerm}" w ${categoryName}`;
    if (searchTerm) return `Wyniki dla "${searchTerm}"`;
    return categoryName || 'Nasze Produkty';
  });

  addToCart(event: Event, product: ProductListItem) {
    event.stopPropagation();
    event.preventDefault(); // Prevent navigation
    // Cast to any to bypass strict structure if model has extra fields, 
    // but ProductListItem has all we need (id, name, price, imageUrl)
    this.cartService.addToCart(product as any);
  }

  private findCategoryInTreeRecursive(slug: string, categories: CategoryTree[]): CategoryTree | null {
    for (const category of categories) {
      if (category.slug === slug) return category;
      if (category.subCategories) {
        const found = this.findCategoryInTreeRecursive(slug, category.subCategories);
        if (found) return found;
      }
    }
    return null;
  }

  private findCategoryByIdRecursive(id: number, categories: CategoryTree[]): CategoryTree | null {
    for (const category of categories) {
      if (category.id === id) return category;
      if (category.subCategories) {
        const found = this.findCategoryByIdRecursive(id, category.subCategories);
        if (found) return found;
      }
    }
    return null;
  }

  private findPathInTree(slug: string, categories: CategoryTree[], path: { name: string, slug: string }[]): boolean {
    for (const category of categories) {
      path.push({ name: category.name, slug: category.slug });
      if (category.slug === slug) return true;
      
      if (category.subCategories && this.findPathInTree(slug, category.subCategories, path)) {
        return true;
      }
      path.pop();
    }
    return false;
  }

  private findParentIdInTree(targetId: number, categories: CategoryTree[], parentId?: number): number | undefined {
    for (const category of categories) {
      if (category.id === targetId) return parentId;
      if (category.subCategories) {
        const found = this.findParentIdInTree(targetId, category.subCategories, category.id);
        if (found) return found;
      }
    }
    return undefined;
  }
}
