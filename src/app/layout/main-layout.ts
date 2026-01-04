import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, Router, NavigationEnd } from '@angular/router';
import { LucideAngularModule, Search, ShoppingCart, User, Menu, ChevronDown, Facebook, Instagram, Youtube, LogOut, List, Bell, Heart, LayoutGrid, Home, Maximize, Zap } from 'lucide-angular';
import { CategoryService, CategoryTree } from '../core/services/category.service';
import { AuthService } from '../core/services/auth.service';
import { ProductService } from '../core/services/product.service';
import { CartService } from '../core/services/cart.service';
import { SearchSuggestions } from '../core/models/product.model';
import { CategoryMenuItemComponent } from './category-menu-item';
import { AddToCartModalComponent } from '../features/cart/add-to-cart-modal/add-to-cart-modal.component';
import { ToastComponent } from '../shared/components/toast/toast.component';
import { ConfirmModalComponent } from '../shared/components/confirm-modal/confirm-modal.component';
import { ThemeService } from '../core/services/theme.service';
import { debounceTime, distinctUntilChanged, filter, switchMap, tap } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule, RouterOutlet, RouterLink, LucideAngularModule, 
    CategoryMenuItemComponent, AddToCartModalComponent, ToastComponent, ConfirmModalComponent
  ],
  templateUrl: './main-layout.html',
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
  `]
})
export class MainLayoutComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private productService = inject(ProductService);
  private router = inject(Router);
  authService = inject(AuthService);
  cartService = inject(CartService);
  themeService = inject(ThemeService);

  searchQuery = signal('');
  suggestions = signal<SearchSuggestions | null>(null);
  showSuggestions = signal(false);
  private searchSubject = new Subject<string>();

  readonly SearchIcon = Search;
  readonly ShoppingCartIcon = ShoppingCart;
  readonly UserIcon = User;
  readonly LogOutIcon = LogOut;
  readonly MenuIcon = Menu;
  readonly ListIcon = List;
  readonly BellIcon = Bell;
  readonly HeartIcon = Heart;
  readonly LayoutGridIcon = LayoutGrid;
  readonly HomeIcon = Home;
  readonly ScanIcon = Maximize;
  readonly ZapIcon = Zap;

  readonly cartCount = this.cartService.itemCount;
  readonly ChevronIcon = ChevronDown;
  readonly FacebookIcon = Facebook;
  readonly InstagramIcon = Instagram;
  readonly YoutubeIcon = Youtube;

  categories = signal<CategoryTree[]>([]);
  isMenuSuppressed = signal(false);

  greeting = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Dzień dobry';
    if (hour < 18) return 'Cześć';
    return 'Dobry wieczór';
  });

  currentRoute = signal('');

  pageHeaderInfo = computed(() => {
    const route = this.currentRoute();
    if (route === '/cart') {
      return { title: 'Koszyk', isFunctional: true };
    }
    if (route.startsWith('/account/shopping-lists')) {
      return { title: 'Twoje listy', isFunctional: true };
    }
    if (route.startsWith('/account/orders')) {
      return { title: 'Zamówienia', isFunctional: true };
    }
    return { title: '', isFunctional: false };
  });

  ngOnInit() {
    this.categoryService.getCategoriesTree().subscribe(cats => {
      this.categories.set(cats);
    });

    this.currentRoute.set(this.router.url);
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(event => {
      this.currentRoute.set(this.router.url);
      window.scrollTo(0, 0);
    });

    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap(query => {
        if (query.length < 2) {
          this.suggestions.set(null);
          this.showSuggestions.set(false);
        }
      }),
      filter(query => query.length >= 2),
      switchMap(query => this.productService.getSearchSuggestions(query))
    ).subscribe(res => {
      this.suggestions.set(res);
      this.showSuggestions.set(true);
    });
  }

  onSearchInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
    this.searchSubject.next(value);
  }

  onSearchFocus() {
    const query = this.searchQuery();
    if (query.length >= 2) {
      this.showSuggestions.set(true);
      this.searchSubject.next(query);
    }
  }

  onSearch() {
    const query = this.searchQuery().trim();
    if (query) {
      this.router.navigate(['/products'], { queryParams: { q: query } });
      this.hideSuggestions();
      this.searchQuery.set('');
    }
  }

  hideSuggestions() {
    setTimeout(() => {
      this.showSuggestions.set(false);
    }, 200);
  }

  selectSuggestion(term: string) {
    this.searchQuery.set(term);
    this.onSearch();
  }

  selectCategory(slug: string) {
    this.router.navigate(['/products', slug]);
    this.hideSuggestions();
    this.searchQuery.set('');
  }

  suppressMenu() {
    this.isMenuSuppressed.set(true);
  }

  unsuppressMenu() {
    this.isMenuSuppressed.set(false);
  }

  logout() {
    this.authService.logout();
  }
}
