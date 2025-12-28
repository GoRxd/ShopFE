import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { LucideAngularModule, Search, ShoppingCart, User, Menu, ChevronDown, Facebook, Instagram, Youtube, LogOut } from 'lucide-angular';
import { CategoryService, CategoryTree } from '../core/services/category.service';
import { AuthService } from '../core/services/auth.service';
import { CategoryMenuItemComponent } from './category-menu-item';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, LucideAngularModule, CategoryMenuItemComponent],
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
  authService = inject(AuthService);

  readonly SearchIcon = Search;
  readonly CartIcon = ShoppingCart;
  readonly UserIcon = User;
  readonly LogOutIcon = LogOut;
  readonly MenuIcon = Menu;
  readonly ChevronIcon = ChevronDown;
  readonly FacebookIcon = Facebook;
  readonly InstagramIcon = Instagram;
  readonly YoutubeIcon = Youtube;

  categories = signal<CategoryTree[]>([]);
  isMenuSuppressed = signal(false);

  ngOnInit() {
    this.categoryService.getCategoriesTree().subscribe(cats => {
      this.categories.set(cats);
    });
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
