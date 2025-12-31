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
}
