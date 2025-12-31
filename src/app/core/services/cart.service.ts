import { Injectable, signal, computed, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Product } from '../models/product.model';
import { environment } from '../../../environments/environment';
import { map, tap, switchMap, catchError, of, Observable, BehaviorSubject, firstValueFrom } from 'rxjs';

export interface CartItem {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  imageUrl?: string; // Optional for now
}

export interface Cart {
  items: CartItem[];
  totalAmount: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = `${environment.apiUrl}/cart`;
  private readonly GUEST_CART_KEY = 'guest_cart';
  
  // State
  private cartState = signal<Cart>({ items: [], totalAmount: 0 });
  
  // Selectors
  readonly cart = computed(() => this.cartState());
  readonly items = computed(() => this.cartState().items);
  readonly itemCount = computed(() => this.cartState().items.reduce((acc, item) => acc + item.quantity, 0));
  readonly totalAmount = computed(() => this.cartState().totalAmount);

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    // Initialize
    effect(() => {
        if (this.authService.isLoggedIn()) {
             this.syncCart();
        } else {
             this.loadGuestCart();
        }
    }, { allowSignalWrites: true });
  }

  // --- Public API ---

  async addToCart(product: Product, quantity: number = 1) {
    if (this.authService.isLoggedIn()) {
      await this.addToUserCart(product.id, quantity);
    } else {
      this.addToGuestCart(product, quantity);
    }
  }

  async updateQuantity(productId: number, quantity: number) {
      if (this.authService.isLoggedIn()) {
          await this.addToUserCart(productId, quantity);
      } else {
          this.updateGuestQuantity(productId, quantity);
      }
  }

  async removeFromCart(productId: number) {
    if (this.authService.isLoggedIn()) {
      await this.removeFromUserCart(productId);
    } else {
      this.removeFromGuestCart(productId);
    }
  }
  
  async syncCart() {
     const localCart = this.getGuestCartFromStorage();
     if (localCart.length > 0) {
        const syncDto = {
            items: localCart.map(i => ({ productId: i.productId, quantity: i.quantity }))
        };

        try {
            await firstValueFrom(this.http.post(`${this.apiUrl}/sync`, syncDto));
            // Clear local storage
            localStorage.removeItem(this.GUEST_CART_KEY);
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
        totalAmount: this.calculateTotal(items) 
    });
  }

  private getGuestCartFromStorage(): CartItem[] {
      const stored = localStorage.getItem(this.GUEST_CART_KEY);
      return stored ? JSON.parse(stored) : [];
  }

  private saveGuestCartToStorage(items: CartItem[]) {
      localStorage.setItem(this.GUEST_CART_KEY, JSON.stringify(items));
      this.updateState({
          items,
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
              imageUrl: product.imageUrl // Ensure Product model has this or handle
          });
      }
      
      this.saveGuestCartToStorage(items);
  }

  private updateGuestQuantity(productId: number, quantity: number) {
      const items = this.getGuestCartFromStorage();
      const existing = items.find(i => i.productId === productId);
      
      if (existing) {
          existing.quantity += quantity;
          if (existing.quantity <= 0) {
              this.removeFromGuestCart(productId);
              return;
          }
           this.saveGuestCartToStorage(items);
      }
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
          // Map Backend DTO to Frontend Model
          const items: CartItem[] = cart.items.map((i: any) => ({
              productId: i.productId,
              productName: i.productName,
              unitPrice: i.unitPrice,
              quantity: i.quantity
          }));
          
          this.updateState({
              items,
              totalAmount: cart.totalAmount
          });
      } catch (err) {
          // 404 means no cart
          this.updateState({ items: [], totalAmount: 0 });
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
  
  private calculateTotal(items: CartItem[]): number {
      return items.reduce((acc, item) => acc + (item.unitPrice * item.quantity), 0);
  }
}
