import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReviewService } from '../../../../core/services/review.service';
import { Review } from '../../../../core/models/review.model';
import { ToastService } from '../../../../core/services/toast.service';
import { LucideAngularModule, Star, Trash2, MessageSquare, User, Package, Calendar, ShieldCheck, Filter, Flag } from 'lucide-angular';
import { PlnCurrencyPipe } from '../../../../core/pipes/pln-currency.pipe';
import { RouterModule } from '@angular/router';
import { computed } from '@angular/core';

@Component({
    selector: 'app-review-manager',
    standalone: true,
    imports: [CommonModule, LucideAngularModule, PlnCurrencyPipe, RouterModule],
    templateUrl: './review-manager.html'
})
export class ReviewManager implements OnInit {
    private reviewService = inject(ReviewService);
    private toastService = inject(ToastService);

    reviews = signal<Review[]>([]);
    isLoading = signal(false);
    activeTab = signal<'all' | 'reported'>('all');

    reportedReviews = computed(() => this.reviews().filter(r => r.isReported));

    displayedReviews = computed(() => {
        return this.activeTab() === 'reported' ? this.reportedReviews() : this.reviews();
    });

    // Icons
    readonly StarIcon = Star;
    readonly TrashIcon = Trash2;
    readonly MessageIcon = MessageSquare;
    readonly UserIcon = User;
    readonly PackageIcon = Package;
    readonly CalendarIcon = Calendar;
    readonly ShieldCheckIcon = ShieldCheck;
    readonly FilterIcon = Filter;
    readonly FlagIcon = Flag;

    ngOnInit() {
        this.loadReviews();
    }

    loadReviews() {
        this.isLoading.set(true);
        this.reviewService.getAllReviews().subscribe({
            next: (data) => {
                this.reviews.set(data);
                this.isLoading.set(false);
            },
            error: () => {
                this.toastService.show('Błąd podczas ładowania recenzji', 'error');
                this.isLoading.set(false);
            }
        });
    }

    deleteReview(id: number) {
        if (!confirm('Czy na pewno chcesz trwale usunąć tę opinię? Ta czynność jest nieodwracalna.')) return;

        this.reviewService.deleteReview(id).subscribe({
            next: () => {
                this.toastService.show('Opinia została usunięta', 'success');
                this.reviews.update(prev => prev.filter(r => r.id !== id));
            },
            error: () => {
                this.toastService.show('Błąd podczas usuwania opinii', 'error');
            }
        });
    }

    keepReview(id: number) {
        this.reviewService.dismissReports(id).subscribe({
            next: () => {
                this.toastService.show('Zgłoszenia zostały odrzucone', 'success');
                this.reviews.update(prev => prev.map(r => r.id === id ? { ...r, isReported: false } : r));
            },
            error: () => {
                this.toastService.show('Błąd podczas odrzucania zgłoszeń', 'error');
            }
        });
    }

    getRatingStars(rating: number): number[] {
        return Array(rating).fill(0);
    }

    getEmptyStars(rating: number): number[] {
        return Array(5 - rating).fill(0);
    }
}
