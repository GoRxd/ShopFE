import { Injectable, signal, PLATFORM_ID, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

export interface ShoppingListItem {
  id: number;
  productId: number;
  productName: string;
  imageUrl?: string;
  unitPrice: number;
  addedAt: string;
  quantity: number;
  stockQuantity: number;
}

export interface ShoppingList {
  id: number;
  name: string;
  createdAt: string;
  items: ShoppingListItem[];
}

@Injectable({
  providedIn: 'root'
})
export class ShoppingListService {
  private apiUrl = `${environment.apiUrl}/shopping-lists`;

  readonly myLists = signal<ShoppingList[]>([]);

  constructor(
      private http: HttpClient,
      @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  async loadLists() {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
        const lists = await firstValueFrom(this.http.get<ShoppingList[]>(this.apiUrl));
        this.myLists.set(lists);
    } catch (err) {
        console.error('Failed to load shopping lists', err);
    }
  }

  async createList(name: string): Promise<number> {
    const id = await firstValueFrom(this.http.post<number>(this.apiUrl, { name }));
    await this.loadLists();
    return id;
  }

  async deleteList(id: number) {
    await firstValueFrom(this.http.delete(`${this.apiUrl}/${id}`));
    await this.loadLists();
  }

  async addItemToList(listId: number, productId: number, quantity: number = 1) {
    await firstValueFrom(this.http.post(`${this.apiUrl}/${listId}/items`, { productId, quantity }));
    await this.loadLists();
  }

  async removeItemFromList(listId: number, productId: number) {
    await firstValueFrom(this.http.delete(`${this.apiUrl}/${listId}/items/${productId}`));
    await this.loadLists();
  }
  
  async updateItemQuantity(listId: number, productId: number, quantity: number) {
    await firstValueFrom(this.http.put(`${this.apiUrl}/${listId}/items/${productId}`, { quantity }));
    await this.loadLists();
  }
}
