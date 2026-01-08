import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductService } from '../../../../core/services/product.service';
import { CategoryService, CategoryTree } from '../../../../core/services/category.service';
import { AttributeService, Attribute } from '../../../../core/services/attribute.service';
import { ToastService } from '../../../../core/services/toast.service';
import { LucideAngularModule, Save, X, ChevronLeft, Loader2 } from 'lucide-angular';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule],
  templateUrl: './product-form.html',
  styleUrl: './product-form.scss'
})
export class ProductForm implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private attributeService = inject(AttributeService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  // State
  mode = signal<'create' | 'edit'>('create');
  productId = signal<number | null>(null);
  isLoading = signal(false);
  isSaving = signal(false);

  // Data
  categories = signal<CategoryTree[]>([]);
  allAttributes = signal<Attribute[]>([]);
  
  // Flattened categories for dropdown
  flatCategories = computed(() => {
    const flatten = (cats: CategoryTree[], level = 0, parentName = ''): { id: number, name: string, level: number, tree: CategoryTree }[] => {
      let result: { id: number, name: string, level: number, tree: CategoryTree }[] = [];
      for (const cat of cats) {
        result.push({ id: cat.id, name: cat.name, level, tree: cat });
        if (cat.subCategories && cat.subCategories.length > 0) {
          result = result.concat(flatten(cat.subCategories, level + 1, cat.name));
        }
      }
      return result;
    };
    return flatten(this.categories());
  });

  name = signal('');
  price = signal<number | null>(null);
  stock = signal<number | null>(null);
  description = signal('');
  categoryId = signal<number | null>(null);
  
  selectedAttributeOptions = signal<Record<number, number>>({}); 

  // Derived: Active Attributes for selected category
  activeAttributes = computed(() => {
    const catId = this.categoryId();
    if (!catId) return [];

    // Find category in tree
    const findCat = (nodes: CategoryTree[]): CategoryTree | null => {
      for (const node of nodes) {
        if (node.id === catId) return node;
        if (node.subCategories) {
          const found = findCat(node.subCategories);
          if (found) return found;
        }
      }
      return null;
    };

    const catNode = findCat(this.categories());
    if (!catNode) return [];

    // Ideally we walk up the tree to find ALL inherited assigned attributes
    // But `CategoryTree` structure is nested children. Parent reference isn't direct in frontend `CategoryTree` usually unless we map it.
    // However, `category.service` has `CategoryTree` which *contains* `assignedAttributeIds`.
    // Valid attributes = assigned to this category OR its parents.
    
    // To implement "inherit from parent", we need to traverse from root to selected node.
    
    const collectAttributes = (nodes: CategoryTree[], targetId: number, accumulatedAttrs: number[]): number[] | null => {
      for (const node of nodes) {
        const currentAttrs = [...accumulatedAttrs, ...(node.assignedAttributeIds || [])];
        if (node.id === targetId) return currentAttrs;
        
        if (node.subCategories) {
          const found = collectAttributes(node.subCategories, targetId, currentAttrs);
          if (found) return found;
        }
      }
      return null;
    };

    const validAttrIds = collectAttributes(this.categories(), catId, []) || [];
    
    // Include attributes that already have a value selected (handles legacy/migrated data)
    const selectedIds = Object.keys(this.selectedAttributeOptions()).map(id => +id);
    const combinedIds = [...validAttrIds, ...selectedIds];

    const uniqueIds = [...new Set(combinedIds)];

    return this.allAttributes().filter(a => uniqueIds.includes(a.id));
  });

  readonly SaveIcon = Save;
  readonly XIcon = X;
  readonly BackIcon = ChevronLeft;
  readonly LoaderIcon = Loader2;

  ngOnInit() {
    this.isLoading.set(true);
    // Load dependencies first
    Promise.all([
      this.loadCategories(),
      this.loadAttributes()
    ]).then(() => {
      // Check router params
      const id = this.route.snapshot.paramMap.get('id');
      if (id && id !== 'new') {
        this.mode.set('edit');
        this.productId.set(+id);
        this.loadProduct(+id);
      } else {
        this.isLoading.set(false);
      }
    });
  }

  loadCategories() {
    return new Promise<void>((resolve) => {
      this.categoryService.getCategoriesTree().subscribe({
        next: (data) => {
          this.categories.set(data);
          resolve();
        },
        error: () => {
          this.toastService.show('Błąd kategorii', 'error');
          resolve();
        }
      });
    });
  }

  loadAttributes() {
     return new Promise<void>((resolve) => {
      this.attributeService.getAttributes().subscribe({
        next: (data) => {
          this.allAttributes.set(data);
          resolve();
        },
        error: () => {
           this.toastService.show('Błąd atrybutów', 'error');
           resolve();
        }
      });
    });
  }

  loadProduct(id: number) {
    this.productService.getProductDetails(id).subscribe({
      next: (product) => {
        this.name.set(product.name);
        this.price.set(product.price);
        this.stock.set(product.stockQuantity);
        this.description.set(product.description || '');
        this.categoryId.set(product.categoryId || null);
        
        // Map existing attributes
        const selections: Record<number, number> = {};
        if (product.attributes && product.attributes.length > 0) {
          product.attributes.forEach(attr => {
            if (attr.attributeId && attr.optionId) {
              selections[attr.attributeId] = Number(attr.optionId);
            }
          });
        }
        this.selectedAttributeOptions.set(selections);
        this.isLoading.set(false);
      },
      error: () => {
        this.toastService.show('Nie znaleziono produktu', 'error');
        this.router.navigate(['/admin/products']);
      }
    });
  }

  updateAttributeOption(attrId: number, optionId: any) {
     const current = { ...this.selectedAttributeOptions() };
     if (optionId && optionId !== 'null') {
       current[attrId] = +optionId;
     } else {
       delete current[attrId];
     }
     this.selectedAttributeOptions.set(current);
  }

  save() {
    if (!this.name() || !this.price() || !this.categoryId()) {
      this.toastService.show('Wypełnij wymagane pola', 'error');
      return;
    }

    this.isSaving.set(true);
    // Convert Record to List
    const attributeOptionIds = Object.values(this.selectedAttributeOptions());

    const payload = {
      name: this.name(),
      price: this.price(),
      stockQuantity: this.stock() || 0,
      description: this.description(),
      categoryId: this.categoryId(),
      attributeOptionIds: attributeOptionIds
    };

    const observer = {
      next: () => {
        this.toastService.show(this.mode() === 'create' ? 'Produkt dodany' : 'Zapisano zmiany', 'success');
        this.router.navigate(['/admin/products']);
      },
      error: (err: any) => {
        this.toastService.show('Błąd: ' + err.message, 'error');
        this.isSaving.set(false);
      }
    };

    if (this.mode() === 'create') {
      this.productService.createProduct(payload).subscribe(observer);
    } else {
      this.productService.updateProduct(this.productId()!, { ...payload, id: this.productId() }).subscribe(observer);
    }
  }
}
