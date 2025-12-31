import { Component, inject, input, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService, CategoryTree } from '../../../core/services/category.service';
import { CartService } from '../../../core/services/cart.service';
import { Product } from '../../../core/models/product.model';
import { LucideAngularModule, Home, ChevronRight, ShoppingCart, Check, ShieldCheck, Truck, Clock } from 'lucide-angular';
import { PlnCurrencyPipe } from '../../../core/pipes/pln-currency.pipe';
import { toSignal } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, PlnCurrencyPipe],
  templateUrl: './product-details.component.html'
})
export class ProductDetailsComponent {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private cartService = inject(CartService);

  // Icons
  readonly HomeIcon = Home;
  readonly ChevronRightIcon = ChevronRight;
  readonly ShoppingCartIcon = ShoppingCart;
  readonly CheckIcon = Check;
  readonly ShieldCheckIcon = ShieldCheck;
  readonly TruckIcon = Truck;
  readonly ClockIcon = Clock;

  // State
  product = signal<Product | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  
  // Categories for breadcrumbs
  categories = signal<CategoryTree[]>([]);

  // Route Params
  private params = toSignal(this.route.params);
  
  // Computed Breadcrumbs
  breadcrumbs = computed(() => {
    const product = this.product();
    const allCats = this.categories();
    
    if (!product || !product.categoryId || allCats.length === 0) return [];

    const path: { name: string, slug: string }[] = [];
    this.findPathInTreeById(product.categoryId, allCats, path);
    return path;
    
    // Add product name as last crumb? Or keep it separate? 
    // Usually x-kom shows category path in breadcrumbs, 
    // and product name is the H1 below.
  });

  constructor() {
    effect(() => {
      const id = this.params()?.['id'];
      if (id) {
        this.loadProduct(Number(id));
      }
    });

    this.loadCategories();
  }

  async loadCategories() {
    try {
      const tree = await firstValueFrom(this.categoryService.getCategoriesTree());
      this.categories.set(tree);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  }

  async loadProduct(id: number) {
    this.loading.set(true);
    this.error.set(null);
    try {
      const product = await firstValueFrom(this.productService.getProductDetails(id));
      this.product.set(product);
    } catch (err) {
      this.error.set('Nie udało się pobrać szczegółów produktu.');
      console.error(err);
    } finally {
      this.loading.set(false);
    }
  }

  addToCart() {
      const product = this.product();
      if (product) {
          this.cartService.addToCart(product);
          // Optional: Show notification or visual feedback
      }
  }

  getAttributeLinkParams(name: string, value: string) {
    const product = this.product();
    if (!product || !product.categoryId) return null;

    const allCats = this.categories();
    const categoryNode = this.findNodeById(product.categoryId, allCats);

    if (!categoryNode) return null;

    // Check if there is a subcategory executing this attribute logic
    // e.g. "Smartphones" -> "Smartphones Xiaomi" for value "Xiaomi"
    if (categoryNode.subCategories && categoryNode.subCategories.length > 0) {
      const normalizedValue = value.toLowerCase();
      const matchingSub = categoryNode.subCategories.find(sub => 
        sub.name.toLowerCase().includes(normalizedValue)
      );

      if (matchingSub) {
        return {
          path: ['/products', matchingSub.slug],
          queryParams: {}
        };
      }
    }

    // Default: Link to current category with query param
    return {
      path: ['/products', categoryNode.slug],
      queryParams: { [`attr_${name}`]: value }
    };
  }

  // Helper for breadcrumbs traversal by ID
  private findPathInTreeById(targetId: number, categories: CategoryTree[], path: { name: string, slug: string }[]): boolean {
    for (const category of categories) {
      path.push({ name: category.name, slug: category.slug });
      
      if (category.id === targetId) return true;
      
      if (category.subCategories && this.findPathInTreeById(targetId, category.subCategories, path)) {
        return true;
      }
      
      path.pop();
    }
    return false;
  }

  private findNodeById(id: number, categories: CategoryTree[]): CategoryTree | null {
    for (const cat of categories) {
      if (cat.id === id) return cat;
      if (cat.subCategories) {
        const found = this.findNodeById(id, cat.subCategories);
        if (found) return found;
      }
    }
    return null;
  }
}
