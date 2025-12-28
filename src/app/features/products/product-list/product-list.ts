import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-custom py-8">
      <h1 class="text-2xl font-bold mb-6">Produkty</h1>
      <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <!-- Placeholder for product cards -->
        @for (i of [1,2,3,4,5,6,7,8]; track i) {
          <div class="bg-white border border-slate-200 rounded-xl p-4 animate-pulse">
            <div class="w-full h-48 bg-slate-100 rounded-lg mb-4"></div>
            <div class="h-4 bg-slate-100 rounded w-3/4 mb-2"></div>
            <div class="h-4 bg-slate-100 rounded w-1/2"></div>
          </div>
        }
      </div>
    </div>
  `
})
export class ProductListComponent {}
