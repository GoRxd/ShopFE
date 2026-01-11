import { Component, inject, input, signal, computed, effect, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { CategoryService, CategoryTree } from '../../../core/services/category.service';
import { CartService } from '../../../core/services/cart.service';
import { ReviewService } from '../../../core/services/review.service';
import { AuthService } from '../../../core/services/auth.service';
import { Product } from '../../../core/models/product.model';
import { Review } from '../../../core/models/review.model';
import { LucideAngularModule, Home, ChevronRight, ChevronLeft, X, ShoppingCart, Check, ShieldCheck, Truck, Clock, Heart, Plus, Minus, Star, MessageSquare } from 'lucide-angular';
import { PlnCurrencyPipe } from '../../../core/pipes/pln-currency.pipe';
import { toSignal } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import { AddToShoppingListComponent } from '../../shopping-lists/components/add-to-shopping-list/add-to-shopping-list.component';
import { StockService } from '../../../core/services/stock.service';
import { TranslateService } from '../../../core/services/translate.service';
import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, PlnCurrencyPipe, FormsModule, AddToShoppingListComponent, TranslatePipe],
  templateUrl: './product-details.component.html'
})
export class ProductDetailsComponent {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private cartService = inject(CartService);
  private reviewService = inject(ReviewService);
  private authService = inject(AuthService);
  private stockService = inject(StockService);
  private translateService = inject(TranslateService);

  readonly HomeIcon = Home;
  readonly ChevronRightIcon = ChevronRight;
  readonly ChevronLeftIcon = ChevronLeft;
  readonly XIcon = X;
  readonly ShoppingCartIcon = ShoppingCart;
  readonly CheckIcon = Check;
  readonly ShieldCheckIcon = ShieldCheck;
  readonly TruckIcon = Truck;
  readonly ClockIcon = Clock;
  readonly HeartIcon = Heart;
  readonly PlusIcon = Plus;
  readonly MinusIcon = Minus;
  readonly StarIcon = Star;
  readonly MessageSquareIcon = MessageSquare;

  isLoggedIn = this.authService.isLoggedIn;
  product = signal<Product | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  
  reviews = signal<Review[]>([]);
  newReviewRating = signal(5);
  newReviewComment = signal('');
  submittingReview = signal(false);
  submitError = signal<string | null>(null);

  hasAlreadyReviewed = computed(() => {
    const user = this.authService.currentUser();
    const currentReviews = this.reviews();
    if (!user || !currentReviews.length) return false;
    return currentReviews.some(r => r.userId === user.id);
  });
  
  isListModalOpen = signal(false);
  quantity = signal(1);
  selectedImageIndex = signal(0);
  isLightboxOpen = signal(false);
  isZoomed = signal(false);
  
  currentImageUrl = computed(() => {
    const p = this.product();
    if (!p) return '';
    
    if (p.images && p.images.length > 0) {
      return p.images[this.selectedImageIndex()].url;
    }
    
    return p.imageUrl || '';
  });

  selectImage(index: number) {
    this.selectedImageIndex.set(index);
    this.isZoomed.set(false);
  }

  nextImage() {
    const p = this.product();
    if (p && p.images && p.images.length > 0) {
      this.selectedImageIndex.update(i => (i + 1) % p.images!.length);
      this.isZoomed.set(false);
    }
  }

  prevImage() {
    const p = this.product();
    if (p && p.images && p.images.length > 0) {
      this.selectedImageIndex.update(i => i === 0 ? p.images!.length - 1 : i - 1);
      this.isZoomed.set(false);
    }
  }

  openLightbox() {
    this.isLightboxOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  closeLightbox() {
    this.isLightboxOpen.set(false);
    this.isZoomed.set(false);
    document.body.style.overflow = '';
  }

  toggleZoom() {
    this.isZoomed.update(z => !z);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (!this.isLightboxOpen()) return;

    if (event.key === 'Escape') {
      this.closeLightbox();
    } else if (event.key === 'ArrowRight') {
      this.nextImage();
    } else if (event.key === 'ArrowLeft') {
      this.prevImage();
    }
  }

  increaseQuantity() {
    if (this.quantity() < 100) {
      this.quantity.update(q => q + 1);
    }
  }

  decreaseQuantity() {
    if (this.quantity() > 1) {
      this.quantity.update(q => q - 1);
    }
  }
  
  updateQuantity(value: string) {
      const q = parseInt(value);
      if (!isNaN(q) && q >= 1 && q <= 100) {
          this.quantity.set(q);
      } else {
          // Reset to current valid value if invalid
          this.quantity.set(this.quantity()); 
      }
  }

  categories = signal<CategoryTree[]>([]);

  private params = toSignal(this.route.params);
  
  breadcrumbs = computed(() => {
    const product = this.product();
    const allCats = this.categories();
    
    if (!product || !product.categoryId || allCats.length === 0) return [];

    const path: { name: string, slug: string }[] = [];
    this.findPathInTreeById(product.categoryId, allCats, path);
    return path;
  });

  constructor() {
    effect(() => {
      const id = this.params()?.['id'];
      if (id) {
        this.loadProduct(Number(id));
      }
    });

    this.loadCategories();

    effect(() => {
      const updates = this.stockService.stockUpdates();
      const currentProduct = this.product();
      if (currentProduct && updates[currentProduct.id] !== undefined) {
        const newStock = updates[currentProduct.id];
        if (currentProduct.stockQuantity !== newStock) {
          this.product.update(p => p ? { ...p, stockQuantity: newStock } : null);
        }
      }
    }, { allowSignalWrites: true });
  }

  async loadCategories() {
    try {
      const tree = await firstValueFrom(this.categoryService.getCategoriesTree());
      this.categories.set(tree);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  }

  async loadProduct(id: number) {
    this.loading.set(true);
    this.error.set(null);
    try {
      const product = await firstValueFrom(this.productService.getProductDetails(id));
      this.product.set(product);
      this.selectedImageIndex.set(0); 
      this.loadReviews(id);
    } catch (err) {
      this.error.set('Nie udało się pobrać szczegółów produktu.');
      console.error(err);
    } finally {
      this.loading.set(false);
    }
  }

  async loadReviews(productId: number) {
    try {
      const reviews = await firstValueFrom(this.reviewService.getProductReviews(productId));
      this.reviews.set(reviews);
    } catch (err) {
      console.error('Failed to load reviews', err);
    }
  }

  async submitReview() {
    const product = this.product();
    if (!product || !this.newReviewComment().trim() || this.submittingReview()) return;

    this.submittingReview.set(true);
    this.submitError.set(null);
    try {
      await firstValueFrom(this.reviewService.addReview({
        productId: product.id,
        rating: this.newReviewRating(),
        comment: this.newReviewComment()
      }));
      
      this.newReviewComment.set('');
      this.newReviewRating.set(5);
      this.loadReviews(product.id);
    } catch (err: any) {
      const msg = err.error?.message || err.message;
      this.submitError.set(msg || 'error submitting review');
      console.error('Failed to submit review', err);
    } finally {
      this.submittingReview.set(false);
    }
  }

  addToCart() {
      const product = this.product();
      if (product) {
          this.cartService.addToCart(product, this.quantity());
      }
  }

  openListModal() {
     this.isListModalOpen.set(true);
  }

  closeListModal() {
    this.isListModalOpen.set(false);
  }

  getAttributeLinkParams(name: string, value: string) {
    const product = this.product();
    if (!product || !product.categoryId) return null;

    const allCats = this.categories();
    const categoryNode = this.findNodeById(product.categoryId, allCats);

    if (!categoryNode) return null;

    if (categoryNode.subCategories && categoryNode.subCategories.length > 0) {
      const normalizedValue = value.toLowerCase();
      const matchingSub = categoryNode.subCategories.find(sub => 
        sub.name.toLowerCase().includes(normalizedValue)
      );

      if (matchingSub) {
        return {
          path: ['/products', matchingSub.slug],
          queryParams: {}
        };
      }
    }

    return {
      path: ['/products', categoryNode.slug],
      queryParams: { [`attr_${name}`]: value }
    };
  }

  private findPathInTreeById(targetId: number, categories: CategoryTree[], path: { name: string, slug: string }[]): boolean {
    for (const category of categories) {
      path.push({ name: category.name, slug: category.slug });
      
      if (category.id === targetId) return true;
      
      if (category.subCategories && this.findPathInTreeById(targetId, category.subCategories, path)) {
        return true;
      }
      
      path.pop();
    }
    return false;
  }

  private findNodeById(id: number, categories: CategoryTree[]): CategoryTree | null {
    for (const cat of categories) {
      if (cat.id === id) return cat;
      if (cat.subCategories) {
        const found = this.findNodeById(id, cat.subCategories);
        if (found) return found;
      }
    }
    return null;
  }
}
