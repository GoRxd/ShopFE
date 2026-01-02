import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, 
         Package, 
         RefreshCcw, 
         Heart, 
         MessageSquare, 
         MapPin, 
         Settings, 
         Zap,
         User } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-account-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule],
  template: `
    <div class="container-custom py-8">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <!-- Sidebar -->
        <aside class="lg:col-span-1">
          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
            <!-- User Header -->
            <div class="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <lucide-icon [name]="UserIcon" class="w-6 h-6"></lucide-icon>
                </div>
                <div>
                  <div class="text-xs text-slate-500 dark:text-slate-400">Cześć,</div>
                  <div class="font-black text-slate-900 dark:text-white leading-tight">
                    {{ authService.currentUser()?.firstName || 'Użytkowniku' }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Navigation -->
            <nav class="p-2">
              <ul class="space-y-1">
                @for (item of menuItems; track item.label) {
                  <li>
                    <a 
                      [routerLink]="item.route"
                      routerLinkActive="bg-primary/5 text-primary active-link"
                      [routerLinkActiveOptions]="{ exact: item.exact }"
                      class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all group"
                    >
                      <lucide-icon [name]="item.icon" class="w-5 h-5 opacity-70 group-hover:opacity-100"></lucide-icon>
                      {{ item.label }}
                    </a>
                  </li>
                }
              </ul>
            </nav>
          </div>
        </aside>

        <!-- Content Area -->
        <main class="lg:col-span-3">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .active-link lucide-icon {
      opacity: 1 !important;
    }
  `]
})
export class AccountLayoutComponent {
  authService = inject(AuthService);

  UserIcon = User;
  
  menuItems = [
    { label: 'Zamówienia', icon: Package, route: '/account/orders', exact: true },
    { label: 'Zwroty i reklamacje', icon: RefreshCcw, route: '/account/returns', exact: false },
    { label: 'Listy zakupowe', icon: Heart, route: '/shopping-lists', exact: false },
    { label: 'Opinie', icon: MessageSquare, route: '/account/reviews', exact: false },
    { label: 'Dane do zamówień', icon: MapPin, route: '/account/addresses', exact: false },
    { label: 'Ustawienia konta', icon: Settings, route: '/account/settings', exact: false },
    { label: 'SalesMasters', icon: Zap, route: '/account/sales-masters', exact: false },
  ];
}
