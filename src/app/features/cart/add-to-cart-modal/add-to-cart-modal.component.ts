import { Component, inject, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { LucideAngularModule, X, Check, ArrowRight, ShoppingCart, ChevronLeft } from 'lucide-angular';
import { CartService } from '../../../core/services/cart.service';
import { ProductService } from '../../../core/services/product.service';
import { PlnCurrencyPipe } from '../../../core/pipes/pln-currency.pipe';
import { ProductListItem } from '../../../core/models/product.model';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-add-to-cart-modal',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, PlnCurrencyPipe],
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
        <!-- Backdrop -->
        <div 
          class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
          (click)="close()"
        ></div>

        <!-- Modal Panel -->
        <div class="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          
          <!-- Header -->
          <div class="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 z-10">
            <div class="flex items-center gap-3 text-green-600 dark:text-green-400">
               <div class="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                 <lucide-icon [name]="CheckIcon" class="w-5 h-5"></lucide-icon>
               </div>
               <h2 class="text-xl font-bold">Produkt dodany do koszyka</h2>
            </div>
            <button (click)="close()" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
              <lucide-icon [name]="XIcon" class="w-6 h-6"></lucide-icon>
            </button>
          </div>

          <!-- Content (Scrollable) -->
          <div class="flex-grow overflow-y-auto custom-scrollbar">
            <div class="p-6 space-y-8">
              
              <!-- Added Product Section -->
              @if (addedItem(); as item) {
                <div class="flex flex-col sm:flex-row gap-6">
                   <!-- Product Image -->
                   <div class="w-full sm:w-48 aspect-square bg-slate-50 dark:bg-slate-800 rounded-xl flex-shrink-0 flex items-center justify-center p-4 border border-slate-100 dark:border-slate-800">
                      <img 
                        [src]="item.product.imageUrl || 'https://placehold.co/600x600/f8fafc/6366f1?text=' + item.product.name" 
                        [alt]="item.product.name"
                        class="max-w-full max-h-full object-contain dark:hidden"
                      />
                      <img 
                        [src]="item.product.imageUrl || 'https://placehold.co/600x600/1e293b/94a3b8?text=' + item.product.name" 
                        [alt]="item.product.name"
                        class="max-w-full max-h-full object-contain hidden dark:block"
                      />
                   </div>

                   <!-- Product Details -->
                   <div class="flex-grow space-y-2">
                      <h3 class="text-xl font-bold text-slate-800 dark:text-white leading-snug">{{ item.product.name }}</h3>
                      
                      <div class="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <span>Ilość: <span class="font-bold text-slate-900 dark:text-white">{{ item.quantity }}</span></span>
                      </div>

                      <div class="pt-4">
                        <div class="text-3xl font-black text-slate-900 dark:text-white">
                          {{ item.product.price | plnCurrency }}
                        </div>
                      </div>
                   </div>
                </div>
              }


              <!-- Cross Sells (Accessories) -->
              @if (accessories().length > 0) {
                <div class="pt-4">
                  <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-4">Pasujące akcesoria</h3>
                  <div class="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    @for (acc of accessories(); track acc.id) {
                       <div class="group border border-slate-100 dark:border-slate-800 rounded-xl p-3 hover:border-primary/20 hover:shadow-lg transition-all cursor-pointer bg-white dark:bg-slate-900 relative">
                          <div class="aspect-square bg-slate-50 dark:bg-slate-800 rounded-lg mb-3 overflow-hidden">
                             <img 
                               [src]="acc.imageUrl || 'https://placehold.co/300x300/f8fafc/6366f1?text=' + acc.name"
                               class="w-full h-full object-cover group-hover:scale-105 transition-transform dark:hidden"
                             />
                             <img 
                               [src]="acc.imageUrl || 'https://placehold.co/300x300/1e293b/94a3b8?text=' + acc.name"
                               class="w-full h-full object-cover group-hover:scale-105 transition-transform hidden dark:block"
                             />
                          </div>
                          <div class="space-y-1">
                             <h4 class="font-bold text-slate-800 dark:text-slate-200 text-sm line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                               {{ acc.name }}
                             </h4>
                             <div class="font-bold text-slate-900 dark:text-white text-sm">
                               {{ acc.price | plnCurrency }}
                             </div>
                          </div>
                          <div class="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button 
                              (click)="addAccessory(acc); $event.stopPropagation()" 
                              class="bg-primary text-white p-1.5 rounded-lg hover:bg-primary-dark shadow-md"
                              title="Dodaj do koszyka"
                             >
                               <lucide-icon [name]="ShoppingCartIcon" class="w-4 h-4"></lucide-icon>
                             </button>
                          </div>
                       </div>
                    }
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col-reverse sm:flex-row gap-4 sm:items-center sm:justify-between">
             <button 
               (click)="close()"
               class="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:border-slate-800 dark:hover:border-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
             >
               <lucide-icon [name]="ChevronLeftIcon" class="w-5 h-5"></lucide-icon>
               <span>Wróć do zakupów</span>
             </button>

             <button 
               (click)="goToCart()"
               class="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-success text-white font-bold hover:bg-green-700 shadow-lg shadow-green-200 dark:shadow-green-900/20 transition-all hover:translate-y-[-2px]"
             >
               <span>Przejdź do koszyka</span>
               <lucide-icon [name]="ArrowRightIcon" class="w-5 h-5"></lucide-icon>
             </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .custom-scrollbar::-webkit-scrollbar {
      width: 8px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background-color: #cbd5e1;
      border-radius: 4px;
    }
    .dark .custom-scrollbar::-webkit-scrollbar-thumb {
      background-color: #475569;
    }
  `]
})
export class AddToCartModalComponent {
  cartService = inject(CartService);
  productService = inject(ProductService);
  router = inject(Router);

  isOpen = signal(false);
  addedItem = signal<{ product: any, quantity: number } | null>(null);
  accessories = signal<ProductListItem[]>([]);

  XIcon = X;
  CheckIcon = Check;
  ArrowRightIcon = ArrowRight;
  ShoppingCartIcon = ShoppingCart;
  ChevronLeftIcon = ChevronLeft;

  constructor() {
    effect(() => {
      const item = this.cartService.lastAddedItem();
      if (item) {
        this.addedItem.set(item);
        this.isOpen.set(true);
        this.loadAccessories(item.product.categoryId); // Load relevant accessories
      }
    });
  }

  close() {
    this.isOpen.set(false);
  }

  goToCart() {
    this.close();
    this.router.navigate(['/cart']);
  }

  async loadAccessories(categoryId?: number) {
    if (!categoryId) return;
    try {
      const products = await firstValueFrom(this.productService.getProducts({ 
        categoryIds: [categoryId], 
        limit: 4 
      } as any)); 
      
      const currentId = this.addedItem()?.product.id;
      this.accessories.set(products.filter(p => p.id !== currentId).slice(0, 4));
    } catch (err) {
      console.error('Failed to load accessories', err);
    }
  }

  addAccessory(product: ProductListItem) {
     this.cartService.addToCart(product as any);
  }
}
