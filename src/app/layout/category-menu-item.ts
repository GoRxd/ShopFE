import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, ChevronRight } from 'lucide-angular';
import { CategoryTree } from '../core/services/category.service'
import { MainLayoutComponent } from './main-layout';

@Component({
  selector: 'app-category-menu-item',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  template: `
    <div class="relative group/sub">
      <a 
        [routerLink]="['/products', category.slug]" 
        (click)="mainLayout.suppressMenu()"
        class="flex items-center justify-between px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary dark:hover:text-primary transition-colors whitespace-nowrap min-w-[200px]"
      >
        <span>{{ category.name }}</span>
        @if (canHaveChildren) {
          <lucide-icon [name]="ChevronIcon" class="w-4 h-4 opacity-50 dark:text-slate-500"></lucide-icon>
        }
      </a>

      <!-- Submenu -->
      @if (canHaveChildren) {
        <div 
          class="absolute top-0 left-full ml-0.5 opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all z-50"
          [class.!invisible]="mainLayout.isMenuSuppressed()"
        >
          <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-2 min-w-[220px]">
            @for (sub of category.subCategories; track sub.id) {
              <app-category-menu-item [category]="sub" [depth]="depth + 1"></app-category-menu-item>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class CategoryMenuItemComponent {
  mainLayout = inject(MainLayoutComponent);
  @Input({ required: true }) category!: CategoryTree;
  @Input() depth: number = 0;
  readonly ChevronIcon = ChevronRight;

  get canHaveChildren(): boolean {
    return this.category.subCategories && this.category.subCategories.length > 0 && this.depth < 1;
  }
}
