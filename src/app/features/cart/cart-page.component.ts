import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { LucideAngularModule, Trash2, ShoppingCart, Plus, Minus, CreditCard } from 'lucide-angular';
import { PlnCurrencyPipe } from '../../core/pipes/pln-currency.pipe';
import { AuthService } from '../../core/services/auth.service';
import { OrderService } from '../../core/services/order.service';
import { ToastService } from '../../core/services/toast.service';
import { TranslateService } from '../../core/services/translate.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, PlnCurrencyPipe],
  templateUrl: './cart-page.component.html'
})
export class CartPageComponent {
  cartService = inject(CartService);
  authService = inject(AuthService);
  orderService = inject(OrderService);
  toastService = inject(ToastService);
  translateService = inject(TranslateService);
  
  isProcessing = signal(false);
  
  // Icons
  TrashIcon = Trash2;
  CartIcon = ShoppingCart;
  PlusIcon = Plus;
  MinusIcon = Minus;
  PayIcon = CreditCard;
  
  async checkout() {
    if (this.cartService.items().length === 0 || this.isProcessing()) return;

    this.isProcessing.set(true);
    try {
      const isLogged = this.authService.isLoggedIn();
      const testAddress = {
        street: 'Testowa 1',
        city: 'Warszawa',
        zipCode: '00-001'
      };

      if (isLogged) {
        await firstValueFrom(this.orderService.placeOrder(testAddress));
      } else {
        const guestData = {
          email: 'guest@example.com',
          shippingAddress: testAddress,
          items: this.cartService.items().map(i => ({
            productId: i.productId,
            quantity: i.quantity
          }))
        };
        await firstValueFrom(this.orderService.guestPlaceOrder(guestData));
      }

      this.toastService.success('Zamówienie złożone (TEST)!');
      this.cartService.clearCart();
    } catch (err: any) {
      const msg = err.error?.message || err.message;
      this.toastService.error(this.translateService.translate(msg) || 'Błąd podczas składania zamówienia');
    } finally {
      this.isProcessing.set(false);
    }
  }
  
  async updateQuantityInput(event: Event, item: any) {
    const input = event.target as HTMLInputElement;
    const value = input.valueAsNumber;
    
    if (isNaN(value)) {
        input.value = item.quantity.toString();
        return;
    }

    const success = await this.cartService.setQuantity(item.productId, value);
    if (!success) {
        input.value = item.quantity.toString();
    }
  }

  validateInput(event: Event, productId: number) {
    const input = event.target as HTMLInputElement;
    let value = parseInt(input.value);
    
    if (value > 100) {
      input.value = '100';
      this.cartService.setQuantity(productId, 100);
    }
  }
}
