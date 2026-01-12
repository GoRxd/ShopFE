import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService, OrderHistoryItem } from '../../../core/services/order.service';
import { LucideAngularModule, MoreVertical, Package, Search, ChevronDown } from 'lucide-angular';
import { PlnCurrencyPipe } from '../../../core/pipes/pln-currency.pipe';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-orders-history',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, PlnCurrencyPipe, RouterModule],
  template: `
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div>
        <h1 class="text-3xl font-black text-slate-900 dark:text-white mb-6">Zamówienia</h1>
        
        <!-- Filters (Mock) -->
        <div class="flex flex-col sm:flex-row sm:flex-wrap gap-4 items-start sm:items-center mb-8">
          <div class="flex items-center gap-3 w-full sm:w-auto">
            <span class="text-sm font-bold text-slate-500 dark:text-slate-400 min-w-[50px]">Filtruj:</span>
            <button class="flex-grow sm:flex-grow-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-between gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Pokaż wszystkie
              <lucide-icon [name]="ChevronDownIcon" class="w-4 h-4"></lucide-icon>
            </button>
          </div>
          
          <div class="flex items-center gap-3 w-full sm:w-auto">
            <span class="text-sm font-bold text-slate-500 dark:text-slate-400 min-w-[50px]">Typ:</span>
            <button class="flex-grow sm:flex-grow-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-between gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Fizyczne i cyfrowe
              <lucide-icon [name]="ChevronDownIcon" class="w-4 h-4"></lucide-icon>
            </button>
          </div>

          <div class="hidden sm:block flex-grow"></div>
          
          <div class="flex items-center gap-3 w-full sm:w-auto">
            <span class="text-sm font-bold text-slate-500 dark:text-slate-400 min-w-[50px]">Sortuj:</span>
            <button class="flex-grow sm:flex-grow-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-between gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Data zakupu: Od n...
              <lucide-icon [name]="ChevronDownIcon" class="w-4 h-4"></lucide-icon>
            </button>
          </div>
        </div>
      </div>

      <!-- Orders List -->
      @if (orders().length > 0) {
        <div class="space-y-12">
          @for (group of groupedOrders(); track group.month) {
            <section class="space-y-4">
              <h2 class="text-xl font-black text-slate-900 dark:text-white">{{ group.month }}</h2>
              
              <div class="space-y-4">
                @for (order of group.orders; track order.orderId) {
                  @let isExpanded = expandedOrders().includes(order.orderId);
                  
                  <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group/order">
                    <div class="flex flex-col md:flex-row cursor-pointer" (click)="toggleExpand(order.orderId)">
                      <!-- Order Info -->
                      <div class="p-6 md:w-64 border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                        <div 
                          class="inline-flex px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider mb-3"
                          [ngClass]="{
                            'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400': order.status === 'Anulowane',
                            'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400': order.status === 'Zakończone'
                          }"
                        >
                          {{ order.status }}
                        </div>
                        <div class="text-sm font-black text-slate-900 dark:text-white mb-1">{{ order.orderDate | date:'d MMMM yyyy' }}</div>
                        <div class="text-xs text-slate-500 dark:text-slate-400 mb-4">nr {{ order.orderNumber }}</div>
                        <div class="text-lg font-black text-slate-900 dark:text-white">{{ order.total | plnCurrency }}</div>
                      </div>

                      <!-- Order Products Summary -->
                      <div class="flex-grow p-6 flex items-center justify-between">
                        <div class="flex items-center gap-6">
                           <!-- Product Thumbnails -->
                           <div class="flex -space-x-4">
                              @for (item of order.items.slice(0, 3); track item.productId) {
                                <div class="w-16 h-16 rounded-xl bg-white dark:bg-slate-800 border-2 border-white dark:border-slate-900 shadow-sm flex items-center justify-center p-2 relative overflow-hidden">
                                   @if (item.imageUrl) {
                                     <img [src]="item.imageUrl" [alt]="item.productName" class="w-full h-full object-contain">
                                   } @else {
                                     <lucide-icon [name]="PackageIcon" class="w-6 h-6 text-slate-300"></lucide-icon>
                                   }
                                </div>
                              }
                              @if (order.items.length > 3) {
                                <div class="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 shadow-sm flex items-center justify-center text-xs font-bold text-slate-500">
                                  +{{ order.items.length - 3 }}
                                </div>
                              }
                           </div>

                           <div class="max-w-md hidden md:block">
                              <h3 class="font-bold text-slate-700 dark:text-slate-300 line-clamp-2">{{ order.items[0].productName }}</h3>
                              @if (order.items.length > 1) {
                                <p class="text-xs text-slate-400 mt-1">oraz {{ order.items.length - 1 }} innych produktów</p>
                              }
                           </div>
                        </div>

                        <button 
                          class="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-all"
                          [class.rotate-180]="isExpanded"
                        >
                          <lucide-icon [name]="ChevronDownIcon" class="w-5 h-5"></lucide-icon>
                        </button>
                      </div>
                    </div>

                    <!-- Expanded Details -->
                    @if (isExpanded) {
                      <div class="border-t border-slate-100 dark:border-slate-800 animate-in slide-in-from-top-4 duration-300">
                        <div class="p-6 space-y-6">
                          <!-- Products List -->
                          <div class="space-y-4">
                            <h4 class="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Lista produktów</h4>
                            <div class="divide-y divide-slate-100 dark:divide-slate-800">
                              @for (item of order.items; track item.productId) {
                                <div class="py-4 flex items-center justify-between">
                                  <div class="flex items-center gap-4">
                                    <div class="w-12 h-12 rounded-lg bg-slate-50 dark:bg-slate-800 p-2 flex items-center justify-center">
                                      @if (item.imageUrl) {
                                        <img [src]="item.imageUrl" class="w-full h-full object-contain" [alt]="item.productName">
                                      } @else {
                                        <lucide-icon [name]="PackageIcon" class="w-5 h-5 text-slate-300"></lucide-icon>
                                      }
                                    </div>
                                    <div>
                                      <div class="text-sm font-bold text-slate-900 dark:text-white">{{ item.productName }}</div>
                                      <div class="text-xs text-slate-500">{{ item.quantity }} szt. × {{ item.unitPrice | plnCurrency }}</div>
                                    </div>
                                  </div>
                                  <div class="text-sm font-black text-slate-900 dark:text-white">
                                    {{ (item.quantity * item.unitPrice) | plnCurrency }}
                                  </div>
                                </div>
                              }
                            </div>
                          </div>

                          <!-- Actions -->
                          <div class="flex flex-wrap gap-3 pt-4 border-t border-slate-50 dark:border-slate-800">
                            <button class="px-6 py-2.5 rounded-xl text-xs font-black bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors uppercase tracking-wider">
                              Zgłoś reklamację
                            </button>
                            @if (order.canReturn) {
                              <button class="px-6 py-2.5 rounded-xl text-xs font-black bg-primary/10 text-primary hover:bg-primary/20 transition-colors uppercase tracking-wider">
                                Zwróć produkt
                              </button>
                            }
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                }
              </div>
            </section>
          }
        </div>
      } @else {
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-16 text-center animate-in zoom-in-95 duration-500">
          <div class="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-8">
            <lucide-icon [name]="PackageIcon" class="w-10 h-10 text-slate-300"></lucide-icon>
          </div>
          <h2 class="text-2xl font-black text-slate-900 dark:text-white mb-2">Brak zamówień</h2>
          <p class="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto">Twoja lista zamówień jest pusta. Gdy coś zamówisz, pojawi się tutaj.</p>
          <a routerLink="/" class="inline-flex items-center gap-2 bg-primary text-white font-bold px-8 py-3 rounded-xl hover:bg-primary-dark transition-all shadow-lg shadow-primary/20">
            Zacznij zakupy
          </a>
        </div>
      }
    </div>
  `,
  providers: [PlnCurrencyPipe]
})
export class OrdersHistoryComponent implements OnInit {
  private orderService = inject(OrderService);

  orders = signal<OrderHistoryItem[]>([]);
  expandedOrders = signal<number[]>([]);
  
  ChevronDownIcon = ChevronDown;
  PackageIcon = Package;

  ngOnInit() {
    this.orderService.getOrderHistory().subscribe({
      next: (data) => {
        this.orders.set(data);
      },
      error: (err) => {
        console.error('Error fetching order history', err);
        this.orders.set([]);
      }
    });
  }

  toggleExpand(orderId: number) {
    this.expandedOrders.update(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId) 
        : [...prev, orderId]
    );
  }

  groupedOrders() {
    const groups: { month: string, orders: OrderHistoryItem[] }[] = [];
    const months = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];

    this.orders().forEach(order => {
      const date = new Date(order.orderDate);
      const monthLabel = `${months[date.getMonth()]} ${date.getFullYear()}`;
      
      let group = groups.find(g => g.month === monthLabel);
      if (!group) {
        group = { month: monthLabel, orders: [] };
        groups.push(group);
      }
      group.orders.push(order);
    });

    return groups.sort((a, b) => {
        const [mA, yA] = a.month.split(' ');
        const [mB, yB] = b.month.split(' ');
        if (yA !== yB) return parseInt(yB) - parseInt(yA);
        return months.indexOf(mB) - months.indexOf(mA);
    });
  }
}
