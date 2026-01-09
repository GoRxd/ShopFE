import { Injectable, signal, computed, effect, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';
import { TranslateService } from './translate.service';
import { Product } from '../models/product.model';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

export interface CartItem {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  imageUrl?: string;
}

export interface Cart {
  items: CartItem[];
  itemsCount: number;
  totalAmount: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = `${environment.apiUrl}/cart`;
  private readonly GUEST_CART_KEY = 'guest_cart';
  
  private cartState = signal<Cart>({ items: [], itemsCount: 0, totalAmount: 0 });
  readonly lastAddedItem = signal<{ product: Product, quantity: number } | null>(null);
  
  readonly cart = computed(() => this.cartState());
  readonly items = computed(() => this.cartState().items);
  readonly itemCount = computed(() => this.cartState().itemsCount);
  readonly totalAmount = computed(() => this.cartState().totalAmount);

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private toastService: ToastService,
    private translateService: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    effect(() => {
        if (this.authService.isLoggedIn()) {
             this.syncCart();
        } else {
             this.loadGuestCart();
      }
    });
  }

  async addToCart(product: Product, quantity: number = 1, options: { openModal?: boolean } = { openModal: true }): Promise<boolean> {
    const currentTotal = this.itemCount();
    
    if (currentTotal + quantity > 100) {
        this.toastService.error('Łączna ilość produktów w koszyku nie może przekraczać 100 sztuk.');
        return false;
    }

    try {
      if (this.authService.isLoggedIn()) {
        await this.addToUserCart(product.id, quantity);
      } else {
        // Guest check if possible
        if (product.stockQuantity !== undefined && product.stockQuantity < quantity) {
           this.toastService.error(`Niewystarczająca ilość produktu w magazynie.`);
           return false;
        }
        this.addToGuestCart(product, quantity);
      }
    } catch (err: any) {
      const msg = err.error?.message || err.message;
      this.toastService.error(this.translateService.translate(msg) || 'Błąd podczas dodawania do koszyka');
      return false;
    }
    
    if (options.openModal) {
        this.lastAddedItem.set({ product, quantity });
    }
    
    return true;
  }

  async updateQuantity(productId: number, delta: number) {
      const item = this.items().find(i => i.productId === productId);
      if (item) {
          await this.setQuantity(productId, item.quantity + delta);
      }
  }

  async removeFromCart(productId: number) {
    if (this.authService.isLoggedIn()) {
      await this.removeFromUserCart(productId);
    } else {
      this.removeFromGuestCart(productId);
    }
  }
  
  /**
   * Sets absolute quantity for an item.
   * Use this for direct input changes (not relative +1/-1).
   */
  async setQuantity(productId: number, quantity: number): Promise<boolean> {
      if (isNaN(quantity)) return false;
      
      const currentItems = this.items();
      const currentItem = currentItems.find(i => i.productId === productId);
      const currentItemQty = currentItem ? currentItem.quantity : 0;
      const otherItemsTotal = this.itemCount() - currentItemQty;

      if (otherItemsTotal + quantity > 100) {
          this.toastService.error('Łączna ilość produktów w koszyku nie może przekraczać 100 sztuk.');
          // Force existing state update to ensure UI can re-sync if strictly binding
          this.cartState.set({ ...this.cartState() }); 
          return false;
      }
      
      if (quantity <= 0) {
          await this.removeFromCart(productId);
          return true;
      }

      if (this.authService.isLoggedIn()) {
          const dto = { productId, quantity };
          await firstValueFrom(this.http.put(`${this.apiUrl}/items`, dto));
          await this.loadUserCart();
      } else {
          const items = this.getGuestCartFromStorage();
          const existing = items.find(i => i.productId === productId);
          if (existing) {
              existing.quantity = quantity;
              this.saveGuestCartToStorage(items);
          }
      }
      return true;
  }

  async syncCart() {
     const localCart = this.getGuestCartFromStorage();
     if (localCart.length > 0) {
        const syncDto = {
            items: localCart.map(i => ({ productId: i.productId, quantity: i.quantity }))
        };

        try {
            await firstValueFrom(this.http.post(`${this.apiUrl}/sync`, syncDto));
            if (isPlatformBrowser(this.platformId)) {
                localStorage.removeItem(this.GUEST_CART_KEY);
            }
        } catch (err) {
            console.error('Failed to sync cart', err);
        }
     }
     
     // Always load user cart after potential sync (or if nothing to sync)
     await this.loadUserCart();
  }

  // --- Guest Logic ---

  private loadGuestCart() {
    const items = this.getGuestCartFromStorage();
    this.updateState({ 
        items, 
        itemsCount: this.calculateCount(items),
        totalAmount: this.calculateTotal(items) 
    });
  }

  private getGuestCartFromStorage(): CartItem[] {
      if (!isPlatformBrowser(this.platformId)) return [];
      const stored = localStorage.getItem(this.GUEST_CART_KEY);
      return stored ? JSON.parse(stored) : [];
  }

  private saveGuestCartToStorage(items: CartItem[]) {
      if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem(this.GUEST_CART_KEY, JSON.stringify(items));
      }
      this.updateState({
          items,
          itemsCount: this.calculateCount(items),
          totalAmount: this.calculateTotal(items)
      });
  }

  private addToGuestCart(product: Product, quantity: number) {
      const items = this.getGuestCartFromStorage();
      const existing = items.find(i => i.productId === product.id);
      
      if (existing) {
          existing.quantity += quantity;
      } else {
          items.push({
              productId: product.id,
              productName: product.name,
              unitPrice: product.price,
              quantity: quantity,
              imageUrl: product.imageUrl
          });
      }
      
      this.saveGuestCartToStorage(items);
  }


  private removeFromGuestCart(productId: number) {
      let items = this.getGuestCartFromStorage();
      items = items.filter(i => i.productId !== productId);
      this.saveGuestCartToStorage(items);
  }

  // --- User Logic ---

  private async loadUserCart() {
      try {
          const cart = await firstValueFrom(this.http.get<any>(this.apiUrl));
          const items: CartItem[] = cart.items.map((i: any) => ({
              productId: i.productId,
              productName: i.productName,
              unitPrice: i.unitPrice,
              quantity: i.quantity
          }));
          
          this.updateState({
              items,
              itemsCount: cart.itemsCount,
              totalAmount: cart.totalAmount
          });
      } catch (err) {
          this.updateState({ items: [], itemsCount: 0, totalAmount: 0 });
      }
  }

  private async addToUserCart(productId: number, quantity: number) {
      const dto = { productId, quantity };
      await firstValueFrom(this.http.post(this.apiUrl, dto));
      await this.loadUserCart();
  }

  private async removeFromUserCart(productId: number) {
      await firstValueFrom(this.http.delete(`${this.apiUrl}/${productId}`));
      await this.loadUserCart();
  }

  // --- Helpers ---
  
  private updateState(newState: Cart) {
      this.cartState.set(newState);
  }
  
  private calculateCount(items: CartItem[]): number {
      return items.reduce((acc, item) => acc + item.quantity, 0);
  }
  
  private calculateTotal(items: CartItem[]): number {
      return items.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
  }

  async clearCart() {
    if (this.authService.isLoggedIn()) {
      await firstValueFrom(this.http.delete(this.apiUrl));
      await this.loadUserCart();
    } else {
      this.saveGuestCartToStorage([]);
    }
  }
}
