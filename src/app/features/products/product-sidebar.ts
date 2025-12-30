import { Component, input, output, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CategoryTree, AttributeFilter } from '../../core/services/category.service';
import { LucideAngularModule, ChevronLeft, ChevronRight, Filter } from 'lucide-angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule, FormsModule],
  template: `
    <div class="space-y-8">
      <!-- Category Navigation -->
      <section>
        <div class="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <div class="p-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
            <h2 class="font-bold text-slate-900 tracking-tight">Kategorie</h2>
          </div>
          
          <div class="py-2">
            <!-- Parent Category Link (Back) -->
            @if (parentCategory()) {
              <a [routerLink]="['/products', parentCategory()?.slug]" 
                 class="flex items-center gap-3 px-5 py-3 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all group">
                <lucide-icon [name]="ChevronLeftIcon" class="w-4 h-4 group-hover:-translate-x-1 transition-transform"></lucide-icon>
                <span class="text-sm font-medium">{{ parentCategory()?.name }}</span>
              </a>
            } @else if (currentCategory()) {
              <a routerLink="/products" 
                 class="flex items-center gap-3 px-5 py-3 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all group">
                <lucide-icon [name]="ChevronLeftIcon" class="w-4 h-4 group-hover:-translate-x-1 transition-transform"></lucide-icon>
                <span class="text-sm font-medium">Wszystkie produkty</span>
              </a>
            }

            <!-- Current Category (Header style) -->
            @if (currentCategory()) {
              <div class="px-5 py-4 bg-white border-y border-slate-50">
                <span class="text-base font-black text-slate-900 leading-tight block">{{ currentCategory()?.name }}</span>
              </div>
            }

            <!-- Subcategories -->
            <div class="flex flex-col">
              @for (cat of subCategories(); track cat.id) {
                <a [routerLink]="['/products', cat.slug]"
                   routerLinkActive="bg-indigo-50/50 text-indigo-600 font-bold border-r-4 border-indigo-600"
                   [routerLinkActiveOptions]="{exact: true}"
                   class="flex items-center justify-between px-5 py-3 text-sm text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-all group">
                  <span class="truncate">{{ cat.name }}</span>
                  <lucide-icon [name]="ChevronRightIcon" class="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all"></lucide-icon>
                </a>
              }
            </div>
          </div>
        </div>
      </section>

      <!-- Filters Section -->
      @if (applicableAttributes().length > 0) {
        <section class="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <div class="p-5 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
            <h2 class="font-bold text-slate-900 tracking-tight">Filtry</h2>
            <lucide-icon [name]="FilterIcon" class="w-4 h-4 text-slate-400"></lucide-icon>
          </div>

          <div class="p-5 space-y-8">
            @for (attr of applicableAttributes(); track attr.name) {
              <div>
                <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">{{ attr.name }}</h3>
                <div class="space-y-3">
                  @for (option of attr.options; track option) {
                    <label class="flex items-center gap-3 cursor-pointer group">
                      <div class="w-5 h-5 border-2 rounded-lg transition-colors flex items-center justify-center"
                           [class.border-slate-200]="!isAttributeSelected(attr.name, option)"
                           [class.bg-white]="!isAttributeSelected(attr.name, option)"
                           [class.group-hover:border-indigo-200]="!isAttributeSelected(attr.name, option)"
                           [class.border-indigo-600]="isAttributeSelected(attr.name, option)"
                           [class.bg-indigo-600]="isAttributeSelected(attr.name, option)">
                        <input type="checkbox" class="hidden" 
                               [checked]="isAttributeSelected(attr.name, option)"
                               (change)="updateAttribute(attr.name, option)">
                         @if (isAttributeSelected(attr.name, option)) {
                           <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5 text-white" viewBox="0 0 20 20" fill="currentColor">
                             <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                           </svg>
                         }
                      </div>
                      <span class="text-sm transition-colors"
                            [class.text-slate-600]="!isAttributeSelected(attr.name, option)"
                            [class.group-hover:text-slate-900]="!isAttributeSelected(attr.name, option)"
                            [class.font-bold]="isAttributeSelected(attr.name, option)"
                            [class.text-indigo-900]="isAttributeSelected(attr.name, option)">
                        {{ option }}
                      </span>
                    </label>
                  }
                </div>
              </div>
            }

            <!-- Price Range -->
            <div>
              <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Cena</h3>
              <div class="flex items-center gap-2">
                <input type="number" [(ngModel)]="minPrice" (change)="applyFilters()" placeholder="od" class="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-100 transition-all">
                <span class="text-slate-300">-</span>
                <input type="number" [(ngModel)]="maxPrice" (change)="applyFilters()" placeholder="do" class="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-100 transition-all">
              </div>
            </div>
          </div>
        </section>
      }
    </div>
  `,
  styles: ``
})
export class ProductSidebar {
  currentCategory = input<any | null>(null);
  parentCategory = input<CategoryTree | null>(null);
  subCategories = input<CategoryTree[]>([]);
  categories = input<CategoryTree[]>([]);
  applicableAttributes = input<AttributeFilter[]>([]);
  activeAttributes = input<Record<string, string>>({});
  inputMinPrice = input<number | undefined>(undefined, { alias: 'minPrice' });
  inputMaxPrice = input<number | undefined>(undefined, { alias: 'maxPrice' });

  filtersChanged = output<{ minPrice?: number, maxPrice?: number, attributes: Record<string, string> }>();



  selectedAttributes: Record<string, string[]> = {};
  minPrice: number | null = null;
  maxPrice: number | null = null;

  constructor() {
    // Sync activeAttributes input to local state
    effect(() => {
      const active = this.activeAttributes();
      // Reset logic or merge? 
      // Usually, if parent passes new active filters (e.g. from URL), we should reflect them.
      const newSelected: Record<string, string[]> = {};
      
      Object.entries(active).forEach(([key, value]) => {
        if (value) {
          newSelected[key] = value.split(',').filter(v => !!v);
        }
      });
      
      this.selectedAttributes = newSelected;
    });

    // Sync Price inputs
    effect(() => {
      this.minPrice = this.inputMinPrice() ?? null;
      this.maxPrice = this.inputMaxPrice() ?? null;
    });

  }

  readonly ChevronLeftIcon = ChevronLeft;
  readonly ChevronRightIcon = ChevronRight;
  readonly FilterIcon = Filter;

  isAttributeSelected(name: string, value: string): boolean {
    return this.selectedAttributes[name]?.includes(value) ?? false;
  }

  updateAttribute(name: string, value: string) {
    const current = this.selectedAttributes[name] || [];
    
    if (current.includes(value)) {
      this.selectedAttributes = {
        ...this.selectedAttributes,
        [name]: current.filter(v => v !== value)
      };
    } else {
      this.selectedAttributes = {
        ...this.selectedAttributes,
        [name]: [...current, value]
      };
    }
    
    this.applyFilters();
  }

  applyFilters() {
    // Flatten arrays to comma-separated strings for the output
    const flatAttributes: Record<string, string> = {};
    for (const [key, values] of Object.entries(this.selectedAttributes)) {
      if (values && values.length > 0) {
        flatAttributes[key] = values.join(',');
      }
    }

    this.filtersChanged.emit({
      minPrice: this.minPrice ?? undefined,
      maxPrice: this.maxPrice ?? undefined,
      attributes: flatAttributes
    });
  }
}
