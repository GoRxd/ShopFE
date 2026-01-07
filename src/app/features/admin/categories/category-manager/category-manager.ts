import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService, CategoryTree, CreateCategoryDto, UpdateCategoryDto } from '../../../../core/services/category.service';
import { LucideAngularModule, Plus, Pencil, Trash2, Folder, FolderOpen, ChevronRight, ChevronDown, Check, X } from 'lucide-angular';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-category-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './category-manager.html',
  styleUrl: './category-manager.scss',
})
export class CategoryManager implements OnInit {
  categoryService = inject(CategoryService);
  toastService = inject(ToastService);

  categories = signal<CategoryTree[]>([]);
  expandedCategories = signal<Set<number>>(new Set());

  // Modal / Form State
  isModalOpen = signal(false);
  modalMode = signal<'create' | 'edit'>('create');
  
  // Form Data
  selectedParentId = signal<number | null>(null);
  editingCategoryId = signal<number | null>(null);
  
  formName = signal('');
  formSlug = signal('');

  // Delete Confirmation
  deleteTargetId = signal<number | null>(null);
  isDeleteModalOpen = signal(false);
  deleteForce = signal(false);

  // Icons
  readonly PlusIcon = Plus;
  readonly PencilIcon = Pencil;
  readonly TrashIcon = Trash2;
  readonly FolderIcon = Folder;
  readonly FolderOpenIcon = FolderOpen;
  readonly ChevronRightIcon = ChevronRight;
  readonly ChevronDownIcon = ChevronDown;
  readonly CheckIcon = Check;
  readonly XIcon = X;

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.categoryService.getCategoriesTree().subscribe({
      next: (data) => this.categories.set(data),
      error: () => this.toastService.show('Błąd pobierania kategorii', 'error')
    });
  }

  toggleExpand(id: number) {
    const current = new Set(this.expandedCategories());
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    this.expandedCategories.set(current);
  }

  isExpanded(id: number): boolean {
    return this.expandedCategories().has(id);
  }

  // --- Create ---
  openCreateModal(parentId: number | null = null) {
    this.modalMode.set('create');
    this.selectedParentId.set(parentId);
    this.formName.set('');
    this.formSlug.set('');
    this.isModalOpen.set(true);
  }

  // --- Edit ---
  openEditModal(category: CategoryTree) {
    this.modalMode.set('edit');
    this.editingCategoryId.set(category.id);
    this.formName.set(category.name);
    this.formSlug.set(category.slug);
    this.isModalOpen.set(true);
  }

  generateSlug() {
    const slug = this.formName().toLowerCase()
      .replace(/ł/g, 'l').replace(/ś/g, 's').replace(/ć/g, 'c')
      .replace(/ą/g, 'a').replace(/ę/g, 'e').replace(/ń/g, 'n')
      .replace(/ó/g, 'o').replace(/ź/g, 'z').replace(/ż/g, 'z')
      .replace(/[^a-z0-9 ]/g, '')
      .replace(/\s+/g, '-');
    this.formSlug.set(slug);
  }

  saveCategory() {
    if (this.modalMode() === 'create') {
      const dto: CreateCategoryDto = {
        name: this.formName(),
        slug: this.formSlug(),
        parentCategoryId: this.selectedParentId()
      };
      this.categoryService.createCategory(dto).subscribe({
        next: () => {
          this.toastService.show('Kategoria dodana', 'success');
          this.closeModal();
          this.loadCategories();
        },
        error: (err) => this.toastService.show('Błąd dodawania: ' + err.message, 'error')
      });
    } else {
      const id = this.editingCategoryId();
      if (!id) return;
      
      const dto: UpdateCategoryDto = {
        id: id,
        name: this.formName(),
        slug: this.formSlug()
      };
      this.categoryService.updateCategory(id, dto).subscribe({
        next: () => {
          this.toastService.show('Kategoria zaktualizowana', 'success');
          this.closeModal();
          this.loadCategories();
        },
        error: (err) => this.toastService.show('Błąd aktualizacji: ' + err.message, 'error')
      });
    }
  }

  closeModal() {
    this.isModalOpen.set(false);
  }

  // --- Delete ---
  openDeleteModal(id: number) {
    this.deleteTargetId.set(id);
    this.deleteForce.set(false);
    this.isDeleteModalOpen.set(true);
  }

  confirmDelete() {
    const id = this.deleteTargetId();
    if (!id) return;

    this.categoryService.deleteCategory(id, this.deleteForce()).subscribe({
      next: () => {
        this.toastService.show('Kategoria usunięta', 'success');
        this.isDeleteModalOpen.set(false);
        this.loadCategories();
      },
      error: (err) => {
        if (err.error?.detail && err.error.detail.includes("force")) {
             // If error suggests using force, we could prompt user.
             // But simpler for MVP: User must tick "Force" if they know it has children.
             this.toastService.show('Nie można usunąć: Ma dzieci lub produkty. Użyj trybu wymuszonego.', 'warning');
        } else {
             this.toastService.show('Błąd usuwania: ' + err.message, 'error');
        }
      }
    });
  }
}
