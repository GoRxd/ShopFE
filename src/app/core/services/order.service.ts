import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, of } from 'rxjs';

export interface OrderHistoryItem {
  id: number;
  orderNumber: string;
  orderDate: string;
  totalAmount: number;
  status: string;
  items: {
    productId: number;
    productName: string;
    imageUrl?: string;
    quantity: number;
    unitPrice: number;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/orders`;

  getOrderHistory(): Observable<OrderHistoryItem[]> {
    return this.http.get<OrderHistoryItem[]>(`${this.apiUrl}/history`);
  }

  placeOrder(address: any): Observable<number> {
    return this.http.post<number>(this.apiUrl, { shippingAddress: address });
  }

  guestPlaceOrder(data: any): Observable<number> {
    return this.http.post<number>(`${environment.apiUrl}/guest/orders`, data);
  }
}
