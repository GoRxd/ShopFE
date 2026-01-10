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
import { LucideAngularModule, ChevronRight, Home, SlidersHorizontal, X } from 'lucide-angular';
import { PlnCurrencyPipe } from '../../../core/pipes/pln-currency.pipe';
import { StockService } from '../../../core/services/stock.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, ProductSidebar, LucideAngularModule, RouterLink, PlnCurrencyPipe],
  template: `
    <div class="container-custom py-8 pb-20 md:pb-8">
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
        <!-- Sidebar / Drawer -->
        <aside 
          class="fixed inset-0 z-[60] lg:relative lg:inset-auto lg:z-0 lg:w-72 flex-shrink-0 transition-transform duration-300 lg:translate-x-0"
          [class.translate-x-full]="!isSidebarVisible() && isMobile()"
          [class.translate-x-0]="isSidebarVisible() && isMobile()"
        >
          <!-- Backdrop -->
          @if (isSidebarVisible() && isMobile()) {
            <div class="absolute inset-0 bg-slate-900/50 backdrop-blur-sm lg:hidden" (click)="toggleSidebar()"></div>
          }
          
          <div class="relative h-full w-4/5 ml-auto bg-white dark:bg-slate-900 lg:bg-transparent lg:w-72 lg:ml-0 shadow-2xl lg:shadow-none flex flex-col">
            <div class="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center lg:hidden">
              <span class="font-black text-xl text-slate-900 dark:text-white">Filtry</span>
              <button (click)="toggleSidebar()" class="p-2 text-slate-500 hover:text-red-500 transition-colors">
                <lucide-icon [name]="CloseIcon" class="w-6 h-6"></lucide-icon>
              </button>
            </div>
            
            <div class="p-4 lg:p-0 overflow-y-auto flex-grow h-full">
              <app-product-sidebar 
                [currentCategory]="currentCategory()"
                [categories]="allCategories()"
                [parentCategory]="parentCategory()"
                [subCategories]="subCategories()"
                [applicableAttributes]="applicableAttributes()"
                [activeAttributes]="attributes()"
                [minPrice]="minPrice()"
                [maxPrice]="maxPrice()"
                [hideUnavailable]="hideUnavailable()"
                [unavailableCount]="unavailableCount()"
                (filtersChanged)="onFiltersChange($event); isMobile() && toggleSidebar()"
              />
            </div>
          </div>
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
              <button 
                (click)="toggleSidebar()" 
                class="lg:hidden flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-primary hover:text-white transition-all shadow-sm"
              >
                <lucide-icon [name]="FiltersIcon" class="w-4 h-4"></lucide-icon>
                Filtry
              </button>
              
              <select (change)="onSortChange($event)" class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer shadow-sm">
                <option value="">Sortowanie</option>
                <option value="price_asc">Cena: od najniższej</option>
                <option value="price_desc">Cena: od najwyższej</option>
                <option value="newest">Najnowsze</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
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
            <div 
              [routerLink]="['/product', product.id]" 
              class="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl md:rounded-2xl p-3 md:p-4 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 cursor-pointer flex flex-col relative overflow-hidden"
              [class.opacity-60]="product.stockQuantity <= 0"
            >
              <!-- Unavailable Overlay -->
              @if (product.stockQuantity <= 0) {
                <div class="absolute inset-0 bg-slate-50/40 dark:bg-slate-950/40 backdrop-grayscale-[0.5] pointer-events-none z-[5]"></div>
              }

              <div class="relative w-full h-40 md:h-auto md:aspect-square bg-slate-50 dark:bg-slate-800 rounded-lg md:rounded-xl mb-3 md:mb-4 overflow-hidden flex items-center justify-center">
                <img 
                  [src]="product.imageUrl || 'https://placehold.co/600x600/f8fafc/6366f1?text=' + product.name" 
                  [alt]="product.name"
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 dark:hidden"
                  [class.grayscale]="product.stockQuantity <= 0"
                />
                <img 
                  [src]="product.imageUrl || 'https://placehold.co/600x600/1e293b/94a3b8?text=' + product.name" 
                  [alt]="product.name"
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 hidden dark:block"
                  [class.grayscale]="product.stockQuantity <= 0"
                />
                
                @if (product.stockQuantity > 0) {
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
                } @else {
                  <div class="absolute inset-0 flex items-center justify-center z-10">
                    <span class="bg-slate-900/80 dark:bg-slate-800/80 backdrop-blur-sm text-white text-[10px] md:text-xs font-black px-4 py-2 rounded-full uppercase tracking-widest shadow-xl">Chwilowy brak</span>
                  </div>
                }
              </div>
              
              <div class="flex-grow">
                <h3 class="font-bold text-slate-800 dark:text-white text-base md:text-lg group-hover:text-primary transition-colors mb-1 line-clamp-2 leading-snug">
                  {{ product.name }}
                </h3>
                <p class="text-slate-400 dark:text-slate-500 text-xs md:text-sm mb-3 md:mb-4">{{ product.categoryName }}</p>
              </div>

              <div class="flex items-center justify-between mt-auto pt-3 md:pt-4 border-t border-slate-50 dark:border-slate-800">
                <span class="text-xl md:text-2xl font-black text-slate-900 dark:text-white" [class.!text-slate-400]="product.stockQuantity <= 0" [class.dark:!text-slate-500]="product.stockQuantity <= 0">{{ product.price | plnCurrency }}</span>
                @if (product.stockQuantity <= 0) {
                   <span class="text-[10px] md:text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md uppercase tracking-wider border border-slate-200 dark:border-slate-700">Niedostępny</span>
                } @else if (product.stockQuantity <= 5) {
                   <span class="text-[10px] md:text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded-md uppercase tracking-wider animate-pulse">Ostatnie {{ product.stockQuantity }} szt.</span>
                } @else {
                   <span class="text-[10px] md:text-xs font-bold text-primary bg-primary/10 dark:bg-primary/20 px-2 py-1 rounded-md uppercase tracking-wider">Nowość</span>
                }
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
  private stockService = inject(StockService);

  readonly ChevronRightIcon = ChevronRight;
  readonly HomeIcon = Home;
  readonly FiltersIcon = SlidersHorizontal;
  readonly CloseIcon = X;

  isSidebarVisible = signal(false);
  isMobile = signal(false);

  private params = toSignal(this.route.params);
  private queryParams = toSignal(this.route.queryParams);

  constructor() {
    this.checkMobile();
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', () => this.checkMobile());
    }

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

       this.attributes.set(attrs);
       
       const minP = params['minPrice'] ? Number(params['minPrice']) : undefined;
       const maxP = params['maxPrice'] ? Number(params['maxPrice']) : undefined;
       
       this.minPrice.set(minP);
       this.maxPrice.set(maxP);
       this.hideUnavailable.set(params['hideUnavailable'] === 'true');
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
    if (!slug) return this.allCategories();

    const category = this.findCategoryInTreeRecursive(slug, this.allCategories());
    return category?.subCategories ?? [];
  });

  parentCategory = computed(() => {
    const cur = this.currentCategory();
    if (!cur || !cur.parentId) return null;
    
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
  hideUnavailable = signal<boolean>(false);

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
  
  allProducts = computed(() => {
    const baseProducts = this.productsResource.value() ?? [];
    const updates = this.stockService.stockUpdates();

    return baseProducts.map((p) => {
      if (updates[p.id] !== undefined) {
        return { ...p, stockQuantity: updates[p.id] };
      }
      return p;
    });
  });

  unavailableCount = computed(() => {
    return this.allProducts().filter(p => (p.stockQuantity ?? 0) <= 0).length;
  });

  products = computed(() => {
    let prods = this.allProducts();
    if (this.hideUnavailable()) {
      prods = prods.filter(p => (p.stockQuantity ?? 0) > 0);
    }
    return prods;
  });

  toggleSidebar() {
    this.isSidebarVisible.update(v => !v);
  }

  private checkMobile() {
    if (typeof window !== 'undefined') {
      this.isMobile.set(window.innerWidth < 1024);
    }
  }

  onFiltersChange(filters: { minPrice?: number, maxPrice?: number, hideUnavailable: boolean, attributes: Record<string, string> }) {
    const currentParams = this.queryParams() || {};
    const newParams: any = { ...currentParams };

    Object.keys(newParams).forEach(key => {
      if (key.startsWith('attr_') || key === 'minPrice' || key === 'maxPrice' || key === 'hideUnavailable') {
        delete newParams[key];
      }
    });

    if (filters.minPrice !== undefined) newParams.minPrice = filters.minPrice;
    if (filters.maxPrice !== undefined) newParams.maxPrice = filters.maxPrice;
    if (filters.hideUnavailable) newParams.hideUnavailable = 'true';
    
    Object.entries(filters.attributes).forEach(([key, value]) => {
      if (value) {
        newParams[`attr_${key}`] = value;
      }
    });

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: newParams,
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
    event.preventDefault();
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
