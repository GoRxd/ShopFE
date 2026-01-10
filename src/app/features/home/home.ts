import { Component, inject, signal, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ChevronRight, Laptop, Smartphone, Cpu, Gamepad2, Headphones, Watch, MousePointer2, Camera, LayoutGrid } from 'lucide-angular';
import { RouterLink } from '@angular/router';
import { CategoryService, CategoryTree } from '../../core/services/category.service';

import { PlnCurrencyPipe } from '../../core/pipes/pln-currency.pipe';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterLink, PlnCurrencyPipe],
  template: `
    <div class="bg-white dark:bg-slate-950 min-h-screen transition-colors duration-300">
      <div class="container-custom py-6 md:py-12 space-y-12 pb-24 md:pb-12">
        
        <!-- Promotions Section -->
        <section>
          <div class="flex justify-between items-center mb-6 px-1">
            <h2 class="text-xl md:text-2xl font-black text-slate-900 dark:text-white">Promocje</h2>
            <a routerLink="/products" class="text-sm font-bold text-slate-400 hover:text-primary flex items-center gap-1">
              Wszystkie promocje
              <lucide-icon [name]="ChevronRightIcon" class="w-4 h-4"></lucide-icon>
            </a>
          </div>
          
          <div 
            #promoContainer
            class="overflow-x-auto pb-6 custom-scrollbar snap-x md:snap-none -mx-4 px-4 md:mx-0 md:px-0"
            (mousedown)="startDragging($event)"
            (mousemove)="drag($event)"
            (mouseup)="stopDragging()"
            (mouseleave)="stopDragging()"
          >
            <div class="flex gap-4 scroll-grab w-max">
              @for (promo of promos; track promo.id) {
                <div class="w-[85vw] md:w-[450px] aspect-[16/9] md:aspect-[21/9] bg-slate-900 rounded-2xl md:rounded-3xl overflow-hidden snap-center md:snap-align-none relative group cursor-pointer shadow-xl shadow-slate-200/50 dark:shadow-none transition-transform hover:scale-[1.01] select-none">
                  <img [src]="promo.image" class="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" [alt]="promo.title" draggable="false">
                  <div class="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent p-6 flex flex-col justify-end">
                     <div class="bg-primary text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded w-fit mb-2">{{ promo.tag }}</div>
                     <h3 class="text-white text-xl md:text-2xl font-black leading-tight">{{ promo.title }}</h3>
                     <p class="text-slate-300 text-sm mt-1 font-medium">{{ promo.subtitle }}</p>
                  </div>
                </div>
              }
            </div>
          </div>
        </section>

        <!-- Categories Section -->
        <section>
          <div class="flex justify-between items-center mb-6 px-1">
            <h2 class="text-xl md:text-2xl font-black text-slate-900 dark:text-white">Kategorie</h2>
            <a routerLink="/products" class="text-sm font-bold text-slate-400 hover:text-primary flex items-center gap-1">
              Wszystkie kategorie
              <lucide-icon [name]="ChevronRightIcon" class="w-4 h-4"></lucide-icon>
            </a>
          </div>
          
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
            @for (cat of categories(); track cat.id) {
              <a [routerLink]="['/products', cat.slug]" class="bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 p-4 md:p-6 rounded-2xl md:rounded-3xl flex flex-col items-center justify-center gap-3 text-center group hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none hover:border-primary/20 transition-all duration-300">
                <div class="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:scale-110 transition-all duration-300">
                  <lucide-icon [name]="getIconForCategory(cat.name)" class="w-6 h-6 md:w-8 md:h-8"></lucide-icon>
                </div>
                <span class="text-xs md:text-sm font-bold text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors leading-tight">{{ cat.name }}</span>
              </a>
            }
          </div>
        </section>

        <!-- Hot Shot Section -->
        <section class="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] md:rounded-[3rem] p-6 md:p-12 overflow-hidden relative transition-colors duration-300">
          <div class="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full -mr-20 -mt-20"></div>
          
          <div class="flex flex-col md:flex-row items-center gap-8 md:gap-16 relative z-10">
            <div class="flex-grow text-center md:text-left">
              <div class="flex flex-col md:flex-row items-center gap-4 mb-6">
                <h2 class="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">Gorący strzał</h2>
                <div class="flex gap-2">
                  @for (part of ['03', '21', '17']; track $index) {
                    <div class="bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xl md:text-2xl px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm dark:shadow-lg">{{ part }}</div>
                    @if (!$last) { <span class="text-slate-400 dark:text-slate-600 text-2xl self-center">:</span> }
                  }
                </div>
              </div>
              <p class="text-slate-500 dark:text-slate-400 text-lg mb-8 max-w-md mx-auto md:mx-0 font-medium">Złap ostatnie sztuki w niesamowitych cenach. Oferta ograniczona czasowo i ilościowo!</p>
              <button routerLink="/products" class="bg-primary hover:bg-primary-dark text-white font-black px-10 py-4 rounded-2xl shadow-xl shadow-primary/30 transition-all hover:-translate-y-1 active:scale-95">Sprawdź okazję</button>
            </div>
            
            <div class="w-full md:w-96 aspect-square bg-white dark:bg-slate-800/50 backdrop-blur rounded-[2.5rem] p-8 flex items-center justify-center relative group border border-slate-200 dark:border-slate-700/50 shadow-xl dark:shadow-2xl">
               <div class="absolute top-4 right-4 bg-red-500 text-white text-xs font-black px-3 py-1.5 rounded-full z-10 shadow-lg tracking-wider animate-pulse">OSZCZĘDŹ 500 ZŁ</div>
               <lucide-icon [name]="LaptopIcon" class="w-32 h-32 text-slate-300 dark:text-slate-600 group-hover:scale-110 group-hover:text-primary transition-all duration-700"></lucide-icon>
            </div>
          </div>
        </section>

      </div>
    </div>
  `
})
export class HomeComponent implements OnInit {
  @ViewChild('promoContainer') promoContainer!: ElementRef<HTMLDivElement>;
  
  private categoryService = inject(CategoryService);
  
  categories = signal<CategoryTree[]>([]);
  readonly ChevronRightIcon = ChevronRight;
  readonly LaptopIcon = Laptop;
  readonly SmartphoneIcon = Smartphone;
  readonly CpuIcon = Cpu;
  readonly Gamepad2Icon = Gamepad2;
  readonly HeadphonesIcon = Headphones;
  readonly WatchIcon = Watch;
  readonly MousePointer2Icon = MousePointer2;
  readonly CameraIcon = Camera;
  readonly LayoutGridIcon = LayoutGrid;

  private isDragging = false;
  private startX = 0;
  private scrollLeft = 0;

  promos = [
    { id: 1, title: 'Wielka noworoczna wyprzedaż', subtitle: 'Rabaty do -45% na laptopy i peryferia', tag: 'Wyprzedaż', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=1000' },
    { id: 2, title: 'Smartfony Apple w super cenach', subtitle: 'Sprawdź najnowszą ofertę na iPhone', tag: 'Super Cena', image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&q=80&w=1000' },
    { id: 3, title: 'Graj na najwyższym poziomie', subtitle: 'Karty graficzne RTX serii 4000', tag: 'Dla Graczy', image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1000' }
  ];

  ngOnInit() {
    this.categoryService.getCategoriesTree().subscribe(cats => {
      this.categories.set(cats.slice(0, 8));
    });
  }

  startDragging(e: MouseEvent) {
    const el = this.promoContainer.nativeElement;
    // Don't start dragging if clicking on the scrollbar (check if click is below content area)
    if (e.offsetY > el.clientHeight) return;

    this.isDragging = true;
    el.classList.add('dragging');
    this.startX = e.pageX - el.offsetLeft;
    this.scrollLeft = el.scrollLeft;
  }

  stopDragging() {
    this.isDragging = false;
    this.promoContainer.nativeElement.classList.remove('dragging');
  }

  drag(e: MouseEvent) {
    if (!this.isDragging) return;
    e.preventDefault();
    const el = this.promoContainer.nativeElement;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - this.startX) * 2; // scroll speed multiplier
    el.scrollLeft = this.scrollLeft - walk;
  }

  getIconForCategory(name: string): any {
    const n = name.toLowerCase();
    if (n.includes('laptop')) return Laptop;
    if (n.includes('smartfony') || n.includes('telefon')) return Smartphone;
    if (n.includes('podzespoy')) return Cpu;
    if (n.includes('gaming')) return Gamepad2;
    if (n.includes('audio')) return Headphones;
    if (n.includes('peryferia')) return MousePointer2;
    if (n.includes('foto')) return Camera;
    if (n.includes('watch')) return Watch;
    return LayoutGrid;
  }
}
