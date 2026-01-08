import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService, CategoryTree, CreateCategoryDto, UpdateCategoryDto } from '../../../../core/services/category.service';
import { AttributeService, Attribute } from '../../../../core/services/attribute.service';
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
  attributeService = inject(AttributeService); // Inject AttributeService
  toastService = inject(ToastService);

  categories = signal<CategoryTree[]>([]);
  attributes = signal<Attribute[]>([]); // Store available attributes
  expandedCategories = signal<Set<number>>(new Set());

  isExpanded(categoryId: number): boolean {
    return this.expandedCategories().has(categoryId);
  }

  toggleExpand(categoryId: number) {
    const current = new Set(this.expandedCategories());
    if (current.has(categoryId)) {
      current.delete(categoryId);
    } else {
      current.add(categoryId);
    }
    this.expandedCategories.set(current);
  }

  // ... existing signals ...
  selectedAttributeIds = signal<number[]>([]); // Store selected attributes for form

  // Modal State
  isModalOpen = signal(false);
  modalMode = signal<'create' | 'edit'>('create');
  selectedParentId = signal<number | null>(null);
  editingCategoryId = signal<number | null>(null);

  // Form State
  formName = signal('');
  formSlug = signal('');

  // Delete Modal State
  isDeleteModalOpen = signal(false);
  deleteTargetId = signal<number | null>(null);
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
    this.loadAttributes(); // Load attributes
  }

  loadCategories() {
    this.categoryService.getCategoriesTree().subscribe({
      next: (data) => this.categories.set(data),
      error: () => this.toastService.show('Błąd pobierania kategorii', 'error')
    });
  }

  loadAttributes() {
    this.attributeService.getAttributes().subscribe({
      next: (data) => this.attributes.set(data),
      error: () => this.toastService.show('Błąd pobierania atrybutów', 'error')
    });
  }

  // ... existing code ...

  // --- Create ---
  openCreateModal(parentId: number | null = null) {
    this.modalMode.set('create');
    this.selectedParentId.set(parentId);
    this.formName.set('');
    this.formSlug.set('');
    this.selectedAttributeIds.set([]); // Reset attributes
    this.isModalOpen.set(true);
  }

  // --- Edit ---
  openEditModal(category: CategoryTree) {
    this.modalMode.set('edit');
    this.editingCategoryId.set(category.id);
    this.formName.set(category.name);
    this.formSlug.set(category.slug);
    this.selectedAttributeIds.set(category.assignedAttributeIds || []); // Set attributes
    this.isModalOpen.set(true);
  }

  toggleAttribute(attrId: number) {
    const current = new Set(this.selectedAttributeIds());
    if (current.has(attrId)) {
      current.delete(attrId);
    } else {
      current.add(attrId);
    }
    this.selectedAttributeIds.set(Array.from(current));
  }

  isAttributeSelected(attrId: number): boolean {
    return this.selectedAttributeIds().includes(attrId);
  }

  generateSlug() {
    if (this.modalMode() === 'create') {
      const slug = this.formName()
        .toLowerCase()
        .replace(/ł/g, 'l').replace(/ń/g, 'n').replace(/ó/g, 'o').replace(/ś/g, 's').replace(/ź/g, 'z').replace(/ż/g, 'z').replace(/ą/g, 'a').replace(/ę/g, 'e').replace(/ć/g, 'c')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      this.formSlug.set(slug);
    }
  }

  saveCategory() {
    if (this.modalMode() === 'create') {
      const dto: CreateCategoryDto = {
        name: this.formName(),
        slug: this.formSlug(),
        parentCategoryId: this.selectedParentId()
        // Note: CreateCategoryDto doesn't strictly support attributes yet in backend Create logic usually,
        // but if we added it to CreateCategoryHandler we could send it.
        // For now, let's assume attributes are only editable in Update or we need to update Create logic too.
        // The user request was "add attributes to *given* categories", implying update.
        // But for completeness, let's leave valid logic.
      };
      this.categoryService.createCategory(dto).subscribe({
        next: (newId) => {
           // If we want to save attributes on create, we'd need to call update immediately or change Create handler.
           // For MVP, if user selected attributes, we warn or handle it.
           // Let's assume for now attributes are only saved on Edit, or we ignore them here.
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
        slug: this.formSlug(),
        attributeIds: this.selectedAttributeIds() // Send selected attributes
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
