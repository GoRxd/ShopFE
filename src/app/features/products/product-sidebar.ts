import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CategoryTree, AttributeFilter } from '../../core/services/category.service';
import { LucideAngularModule, ChevronLeft, ChevronRight, Filter } from 'lucide-angular';

@Component({
  selector: 'app-product-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LucideAngularModule],
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
                      <div class="w-5 h-5 border-2 border-slate-200 rounded-lg group-hover:border-indigo-200 transition-colors flex items-center justify-center bg-white">
                        <div class="w-2.5 h-2.5 bg-indigo-600 rounded-sm opacity-0 group-hover:opacity-10 transition-opacity"></div>
                      </div>
                      <span class="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">{{ option }}</span>
                    </label>
                  }
                </div>
              </div>
            }

            <!-- Price Range (Keeping it as it is universal) -->
            <div>
              <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Cena</h3>
              <div class="flex items-center gap-2">
                <input type="number" placeholder="od" class="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-100 transition-all">
                <span class="text-slate-300">-</span>
                <input type="number" placeholder="do" class="w-full bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-100 transition-all">
              </div>
            </div>

            <button class="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-all shadow-md active:scale-[0.98] text-sm">
              Pokaż wyniki
            </button>
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

  readonly ChevronLeftIcon = ChevronLeft;
  readonly ChevronRightIcon = ChevronRight;
  readonly FilterIcon = Filter;
}
