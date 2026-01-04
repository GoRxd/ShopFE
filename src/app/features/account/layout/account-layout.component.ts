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
         User,
         Star } from 'lucide-angular';
import { AuthService } from '../../../core/services/auth.service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
              <a routerLink="/account" class="flex items-center gap-4 group/user cursor-pointer no-underline">
                <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover/user:bg-primary group-hover/user:text-white transition-all shadow-sm">
                  <lucide-icon [name]="UserIcon" class="w-6 h-6"></lucide-icon>
                </div>
                <div>
                  <div class="text-xs text-slate-500 dark:text-slate-400">Cześć,</div>
                  <div class="font-black text-slate-900 dark:text-white leading-tight">
                    {{ authService.currentUser()?.firstName || 'Użytkowniku' }}
                  </div>
                </div>
              </a>
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
        <main class="lg:col-span-3" id="account-content">
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
  private router = inject(Router);

  UserIcon = User;
  
  menuItems = [
    { label: 'Zamówienia', icon: Package, route: '/account/orders', exact: true },
    { label: 'Zwroty i reklamacje', icon: RefreshCcw, route: '/account/returns', exact: false },
    { label: 'Listy zakupowe', icon: Heart, route: '/account/shopping-lists', exact: false },
    { label: 'Moje opinie', icon: Star, route: '/account/reviews', exact: false },
    { label: 'Dane do zamówień', icon: MapPin, route: '/account/addresses', exact: false },
    { label: 'Ustawienia konta', icon: Settings, route: '/account/settings', exact: false },
    { label: 'SalesMasters', icon: Zap, route: '/account/sales-masters', exact: false },
  ];

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntilDestroyed()
    ).subscribe((event) => {
      const url = (event as NavigationEnd).urlAfterRedirects || (event as NavigationEnd).url || '';
      if (url === '/account' || url === '/account/') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        this.scrollToContent();
      }
    });
  }

  private scrollToContent() {
    if (window.innerWidth < 1024) {
      setTimeout(() => {
        const element = document.getElementById('account-content');
        if (element) {
          const headerHeight = 130; // Increased offset to prevent clipping by site header
          const elementPosition = element.getBoundingClientRect().top + window.scrollY;
          window.scrollTo({
            top: elementPosition - headerHeight,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  }
}
