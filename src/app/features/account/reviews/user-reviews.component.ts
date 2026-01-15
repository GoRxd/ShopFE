import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReviewService } from '../../../core/services/review.service';
import { Review } from '../../../core/models/review.model';
import { LucideAngularModule, Star, MessageSquare, ChevronRight, Package } from 'lucide-angular';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-user-reviews',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule],
  template: `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-black text-slate-900 dark:text-white mb-2">Moje opinie</h1>
          <p class="text-slate-500 dark:text-slate-400">Historia wszystkich wystawionych przez Ciebie ocen i komentarzy.</p>
        </div>
        <div class="bg-primary/10 text-primary px-4 py-2 rounded-xl text-sm font-bold">
          Suma: {{ reviews().length }}
        </div>
      </div>

      @if (loading()) {
        <div class="space-y-4">
          @for (i of [1,2,3]; track i) {
            <div class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 animate-pulse">
              <div class="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/4 mb-4"></div>
              <div class="h-10 bg-slate-100 dark:bg-slate-800 rounded w-full mb-4"></div>
              <div class="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/2"></div>
            </div>
          }
        </div>
      } @else if (reviews().length > 0) {
        <div class="grid grid-cols-1 gap-4">
          @for (review of reviews(); track review.id) {
            <div class="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 hover:shadow-lg transition-all group">
              <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <lucide-icon [name]="PackageIcon" class="w-6 h-6"></lucide-icon>
                  </div>
                  <div>
                    <a [routerLink]="['/product', review.productId]" class="font-bold text-slate-900 dark:text-white hover:text-primary transition-colors block leading-tight">
                      {{ review.productName || 'Produkt #' + review.productId }}
                    </a>
                    <span class="text-xs text-slate-400 font-medium uppercase tracking-wider">{{ review.createdAt | date:'longDate' }}</span>
                  </div>
                </div>
                
                <div class="flex gap-0.5">
                  @for (star of [1,2,3,4,5]; track star) {
                    <lucide-icon 
                      [name]="StarIcon" 
                      class="w-5 h-5" 
                      [class.text-yellow-400]="star <= review.rating"
                      [class.text-slate-200]="star > review.rating"
                      [attr.fill]="star <= review.rating ? 'currentColor' : 'none'"
                    ></lucide-icon>
                  }
                </div>
              </div>

              <div class="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 min-w-0">
                <p class="text-slate-600 dark:text-slate-300 break-words">{{ review.comment }}</p>
              </div>

              <div class="mt-6 flex justify-end">
                <a [routerLink]="['/product', review.productId]" class="flex items-center gap-1 text-sm font-bold text-primary hover:gap-2 transition-all">
                  <span>Przejdź do produktu</span>
                  <lucide-icon [name]="ChevronRightIcon" class="w-4 h-4"></lucide-icon>
                </a>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="text-center py-20 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl">
           <div class="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
              <lucide-icon [name]="MessageSquareIcon" class="w-10 h-10"></lucide-icon>
           </div>
           <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Brak wystawionych opinii</h3>
           <p class="text-slate-500 dark:text-slate-400 mb-8">Nie oceniłeś jeszcze żadnego produktu w naszym sklepie.</p>
           <a routerLink="/" class="inline-block bg-primary text-white font-bold px-8 py-3 rounded-xl hover:bg-primary-dark transition-all">
             Zacznij zakupy
           </a>
        </div>
      }
    </div>
  `
})
export class UserReviewsComponent implements OnInit {
  private reviewService = inject(ReviewService);

  reviews = signal<Review[]>([]);
  loading = signal(true);

  readonly StarIcon = Star;
  readonly MessageSquareIcon = MessageSquare;
  readonly ChevronRightIcon = ChevronRight;
  readonly PackageIcon = Package;

  async ngOnInit() {
    try {
      const data: Review[] = await firstValueFrom(this.reviewService.getMyReviews());
      this.reviews.set(data);
    } catch (err) {
      console.error('Failed to load user reviews', err);
    } finally {
      this.loading.set(false);
    }
  }
}
