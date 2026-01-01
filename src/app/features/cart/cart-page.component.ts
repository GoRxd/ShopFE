import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { LucideAngularModule, Trash2, ShoppingCart, Plus, Minus } from 'lucide-angular';
import { PlnCurrencyPipe } from '../../core/pipes/pln-currency.pipe';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, PlnCurrencyPipe],
  templateUrl: './cart-page.component.html'
})
export class CartPageComponent {
  cartService = inject(CartService);
  
  // Icons
  TrashIcon = Trash2;
  CartIcon = ShoppingCart;
  PlusIcon = Plus;
  MinusIcon = Minus;
  
  checkout() {
      // Navigate to checkout or login
      // implementation TBD
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
