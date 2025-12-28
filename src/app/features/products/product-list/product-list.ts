import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService, CategoryTree } from '../../../core/services/category.service';
import { ProductListItem } from '../../../core/models/product.model';
import { ActivatedRoute } from '@angular/router';
import { finalize, switchMap, of, take } from 'rxjs';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-custom py-12">
      <div class="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">
            {{ currentCategoryName() || 'Nasze Produkty' }}
          </h1>
          <p class="text-slate-500 mt-1">Odkryj najlepsze okazje w naszym sklepie</p>
        </div>
        
        <div class="flex items-center gap-2">
          <span class="text-sm text-slate-500 font-medium">{{ products().length }} produktów</span>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        @if (isLoading()) {
          @for (i of [1,2,3,4,5,6,7,8]; track i) {
            <div class="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm animate-pulse">
              <div class="w-full aspect-square bg-slate-100 rounded-xl mb-4"></div>
              <div class="h-5 bg-slate-100 rounded-lg w-3/4 mb-3"></div>
              <div class="h-4 bg-slate-100 rounded-lg w-1/4"></div>
            </div>
          }
        } @else {
          @for (product of products(); track product.id) {
            <div class="group bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300 cursor-pointer flex flex-col">
              <div class="relative w-full aspect-square bg-slate-50 rounded-xl mb-4 overflow-hidden">
                <img 
                  [src]="product.imageUrl || 'https://placehold.co/600x600/f8fafc/6366f1?text=' + product.name" 
                  [alt]="product.name"
                  class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div class="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button class="bg-white/90 backdrop-blur p-2 rounded-full shadow-lg text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div class="flex-grow">
                <h3 class="font-bold text-slate-800 text-lg group-hover:text-indigo-600 transition-colors mb-1">
                  {{ product.name }}
                </h3>
                <p class="text-slate-400 text-sm mb-4">{{ product.categoryName }}</p>
              </div>

              <div class="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                <span class="text-2xl font-black text-slate-900">{{ product.price | number:'1.2-2' }} PLN</span>
                <span class="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md uppercase tracking-wider">Nowość</span>
              </div>
            </div>
          } @empty {
            <div class="col-span-full py-20 text-center">
              <div class="inline-flex items-center justify-center w-20 h-20 bg-slate-50 rounded-full mb-4 text-slate-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-10 h-10">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </div>
              <h3 class="text-xl font-bold text-slate-800">Nie znaleziono produktów</h3>
              <p class="text-slate-500">Spróbuj zmienić filtry wyszukiwania.</p>
            </div>
          }
        }
      </div>
    </div>
  `
})
export class ProductListComponent implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private route = inject(ActivatedRoute);
  
  products = signal<ProductListItem[]>([]);
  isLoading = signal<boolean>(true);
  currentCategoryName = signal<string | null>(null);

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const slug = params['slug'];
      this.loadProducts(slug);
    });
  }

  loadProducts(slug?: string): void {
    this.isLoading.set(true);
    
    // First, we need to ensure we have the category tree if we are filtering by slug
    this.categoryService.getCategoriesTree().pipe(
      take(1),
      switchMap(categories => {
        let categoryIds: number[] | undefined;
        
        if (slug) {
          const categoryId = this.findCategoryInTree(slug, categories);
          if (categoryId) {
            categoryIds = [categoryId.id];
            this.currentCategoryName.set(categoryId.name);
          } else {
            this.currentCategoryName.set(null);
          }
        } else {
          this.currentCategoryName.set(null);
        }

        return this.productService.getProducts({ categoryIds });
      }),
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (products) => this.products.set(products),
      error: (err) => console.error('Error fetching products:', err)
    });
  }

  private findCategoryInTree(slug: string, categories: CategoryTree[]): { id: number, name: string } | null {
    for (const category of categories) {
      if (category.slug === slug) {
        return { id: category.id, name: category.name };
      }
      if (category.subCategories) {
        const found = this.findCategoryInTree(slug, category.subCategories);
        if (found) return found;
      }
    }
    return null;
  }
}
