import { Injectable, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class StockService {
  private hubConnection: signalR.HubConnection;

  // Signal to store latest stock for products
  // Map of ProductId -> StockQuantity
  stockUpdates = signal<{ [key: number]: number }>({});

  constructor() {
    const hubUrl = environment.apiUrl.replace('/api', '') + '/hubs/stock';
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl)
      .withAutomaticReconnect()
      .build();

    this.hubConnection.on('ReceiveStockUpdate', (productId: number, stock: number) => {
      this.stockUpdates.update((updates) => ({
        ...updates,
        [productId]: stock,
      }));
    });

    this.startConnection();
  }

  private startConnection() {
    this.hubConnection
      .start()
      .then(() => console.log('SignalR Stock connection started'))
      .catch((err) => console.error('Error while starting SignalR connection: ' + err));
  }
}
