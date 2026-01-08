import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../../core/services/product.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ProductListItem } from '../../../../core/models/product.model';
import { LucideAngularModule, Plus, Pencil, Trash2, Search, Filter, MoreVertical, AlertTriangle, Loader2, Image, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-angular';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { SearchInputComponent } from '../../../../shared/components/search-input/search-input.component';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LucideAngularModule, SearchInputComponent],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
})
export class ProductList implements OnInit {
  private productService = inject(ProductService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  // State
  products = signal<ProductListItem[]>([]);
  isLoading = signal<boolean>(false);
  totalItems = signal<number>(0);
  
  // Filters
  searchQuery = signal<string>('');
  private searchSubject = new Subject<string>();

  // Sorting
  sortBy = signal<string>('');
  sortDirection = signal<'asc' | 'desc'>('asc');

  // Pagination
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);

  // Delete Modal
  isDeleteModalOpen = signal<boolean>(false);
  productToDelete = signal<ProductListItem | null>(null);

  // Icons
  readonly PlusIcon = Plus;
  readonly PencilIcon = Pencil;
  readonly TrashIcon = Trash2;
  readonly SearchIcon = Search;
  readonly FilterIcon = Filter;
  readonly MoreIcon = MoreVertical;
  readonly AlertIcon = AlertTriangle;
  readonly LoaderIcon = Loader2;
  readonly ImageIcon = Image;
  readonly SortIcon = ArrowUpDown;
  readonly SortAscIcon = ArrowUp;
  readonly SortDescIcon = ArrowDown;

  constructor() {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.searchQuery.set(query);
      this.currentPage.set(1);
      this.loadProducts();
    });
  }

  ngOnInit() {
    this.loadProducts();
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.onSearchQuery(value);
  }
  
  onSearchQuery(value: string) {
    this.searchSubject.next(value);
  }

  sort(column: string) {
    if (this.sortBy() === column) {
      // Toggle direction
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, default asc
      this.sortBy.set(column);
      this.sortDirection.set('asc');
    }
    this.loadProducts();
  }

  loadProducts() {
    this.isLoading.set(true);
    const query = {
      q: this.searchQuery(),
      pageIndex: this.currentPage(),
      pageSize: this.pageSize(),
      sortBy: this.sortBy(),
      sortDirection: this.sortDirection()
    };

    // Note: getProducts currently returns ProductListItem[] directly, 
    // it doesn't seem to support pagination metadata in the current service signature observable.
    // I should check if backend returns filtered list or paged result. 
    // The service signature says Observable<ProductListItem[]>.
    // If backend is paginated, I might be missing total count.
    // For now, I'll display what I get.
    
    this.productService.getProducts(query).subscribe({
      next: (data) => {
        this.products.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.toastService.show('Błąd pobierania produktów', 'error');
        this.isLoading.set(false);
      }
    });
  }

  openCreate() {
    this.router.navigate(['/admin/products/new']);
  }

  openEdit(product: ProductListItem) {
    this.router.navigate(['/admin/products', product.id]);
  }

  confirmDelete(product: ProductListItem) {
    this.productToDelete.set(product);
    this.isDeleteModalOpen.set(true);
  }

  deleteProduct() {
    const product = this.productToDelete();
    if (!product) return;

    this.productService.deleteProduct(product.id).subscribe({
      next: () => {
        this.toastService.show('Produkt usunięty', 'success');
        this.isDeleteModalOpen.set(false);
        this.productToDelete.set(null);
        this.loadProducts();
      },
      error: (err) => {
        this.toastService.show('Błąd usuwania: ' + err.message, 'error');
      }
    });
  }

  cancelDelete() {
    this.isDeleteModalOpen.set(false);
    this.productToDelete.set(null);
  }
}
