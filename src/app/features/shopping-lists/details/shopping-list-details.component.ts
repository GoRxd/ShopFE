import { Component, inject, computed, Input, numberAttribute, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LucideAngularModule, Trash2, ShoppingCart, ArrowLeft, CheckCircle, Minus, Plus } from 'lucide-angular';
import { ShoppingListService, ShoppingList, ShoppingListItem } from '../../../core/services/shopping-list.service';
import { CartService } from '../../../core/services/cart.service';
import { ToastService } from '../../../core/services/toast.service';
import { PlnCurrencyPipe } from '../../../core/pipes/pln-currency.pipe';

@Component({
  selector: 'app-shopping-list-details',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, PlnCurrencyPipe],
  templateUrl: './shopping-list-details.component.html'
})
export class ShoppingListDetailsComponent implements OnInit {
  listService = inject(ShoppingListService);
  cartService = inject(CartService);
  router = inject(Router);

  // Routable input binding for 'id' parameter
  @Input({ transform: numberAttribute }) 
  set id(value: number) {
      this.listId.set(value);
  }

  listId = signal<number>(0);
  
  // Reactive Selection
  currentList = computed(() => {
      const all = this.listService.myLists();
      const id = this.listId();
      return all.find(l => l.id === id) || null;
  });

  readonly TrashIcon = Trash2;
  readonly CartIcon = ShoppingCart;
  readonly BackIcon = ArrowLeft;
  readonly MinusIcon = Minus;
  readonly PlusIcon = Plus;

  async ngOnInit() {
      await this.listService.loadLists();
  }

  toastService = inject(ToastService);
  isAddingAll = signal(false);

  async removeItem(productId: number) {
     if (confirm('Usunąć produkt z listy?')) {
         await this.listService.removeItemFromList(this.listId(), productId);
         this.toastService.info('Produkt usunięty z listy');
     }
  }

  async increaseQuantity(item: ShoppingListItem) {
      await this.updateQuantity(item, item.quantity + 1);
  }

  async decreaseQuantity(item: ShoppingListItem) {
      if (item.quantity > 1) {
          await this.updateQuantity(item, item.quantity - 1);
      }
  }

  public async updateQuantity(item: ShoppingListItem, newQuantity: number) {
      if (newQuantity < 1) return;
      
      let finalQuantity = newQuantity;
      if (newQuantity > 100) {
          finalQuantity = 100;
          this.toastService.info('Maksymalna ilość to 100 sztuk');
      }
      
      // Update logic
      await this.listService.updateItemQuantity(this.listId(), item.productId, finalQuantity);
  }

  validateInput(event: Event, item: ShoppingListItem) {
    const input = event.target as HTMLInputElement;
    let value = parseInt(input.value);
    
    if (value > 100) {
      input.value = '100';
      this.updateQuantity(item, 100);
    } else if (value < 1 && input.value !== '') {
       // Optional: handle < 1 if desired, though min="1" attribute acts too.
    }
  }

  async addToCart(item: ShoppingListItem) {
      const productMock: any = {
          id: item.productId,
          name: item.productName,
          price: item.unitPrice,
          imageUrl: item.imageUrl
      };
      
      const success = await this.cartService.addToCart(productMock, item.quantity, { openModal: false });
      
      if (success) {
          this.toastService.success(`Dodano do koszyka (${item.quantity} szt.)`);
      }
  }

  async addAllToCart() {
      const list = this.currentList();
      if (!list || list.items.length === 0) return;

      this.isAddingAll.set(true);
      try {
          // Process sequentially to be safe, or Promise.all
          for (const item of list.items) {
              const productMock: any = {
                  id: item.productId,
                  name: item.productName,
                  price: item.unitPrice,
                  imageUrl: item.imageUrl
              };
              await this.cartService.addToCart(productMock, item.quantity, { openModal: false });
          }
          this.toastService.success(`Pomyślnie dodano produkty do koszyka!`);
      } catch (err) {
          this.toastService.error('Wystąpił błąd podczas dodawania produktów.');
      } finally {
          this.isAddingAll.set(false);
      }
  }
}
