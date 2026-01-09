import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { StockService } from './core/services/stock.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('ShopFE');
  private stockService = inject(StockService);
}
