import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AttributeService, Attribute } from '../../../../core/services/attribute.service';
import { ToastService } from '../../../../core/services/toast.service';
import { LucideAngularModule, Plus, Pencil, Save, X, Trash2, List, Layers } from 'lucide-angular';

@Component({
  selector: 'app-attribute-manager',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './attribute-manager.html',
})
export class AttributeManager implements OnInit {
  attributeService = inject(AttributeService);
  toastService = inject(ToastService);

  attributes = signal<Attribute[]>([]);
  isLoading = signal(false);

  // Edit Modal State
  isModalOpen = signal(false);
  modalMode = signal<'create' | 'edit'>('create');
  editingAttributeId = signal<number | null>(null);
  
  formName = signal('');
  
  // Options Management in Edit Mode
  editingAttributeOptions = signal<any[]>([]);
  newOptionValue = signal('');

  // Icons
  readonly PlusIcon = Plus;
  readonly PencilIcon = Pencil;
  readonly TrashIcon = Trash2;
  readonly ListIcon = List;
  readonly XIcon = X;
  readonly SaveIcon = Save;

  ngOnInit() {
    this.loadAttributes();
  }

  loadAttributes() {
    this.isLoading.set(true);
    this.attributeService.getAttributes().subscribe({
      next: (data) => {
        this.attributes.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.toastService.show('Błąd atrybutów', 'error');
        this.isLoading.set(false);
      }
    });
  }

  openCreate() {
    this.modalMode.set('create');
    this.formName.set('');
    this.editingAttributeOptions.set([]);
    this.isModalOpen.set(true);
  }

  openEdit(attr: Attribute) {
    this.modalMode.set('edit');
    this.editingAttributeId.set(attr.id);
    this.formName.set(attr.name);
    this.editingAttributeOptions.set(attr.options || []);
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
    this.newOptionValue.set('');
  }

  saveAttribute() {
    const name = this.formName();
    if (!name) return;

    if (this.modalMode() === 'create') {
        this.attributeService.createAttribute(name).subscribe({
            next: () => {
                this.toastService.show('Dodano atrybut', 'success');
                this.closeModal();
                this.loadAttributes();
            },
            error: () => this.toastService.show('Błąd zapisu', 'error')
        });
    } else {
        // Edit name logic if separate endpoint exists (e.g. PUT /attributes/{id}).
        // Currently we only implemented Create and Add Option.
        // Assuming we might not have Update Attribute Name yet?
        // Checking Controller... we don't have Update logic.
        // Let's assume for now user wants to primarily Manage Options or Create New.
        // If we want to rename, we'd need a backend handler.
        // For MVP based on user request "creating new attributes, editing (options)", renaming might be secondary or implicit.
        // I will focus on adding options.
        if (this.editingAttributeId()) {
            // Check if name changed - if so, we'd need an update endpoint. SKIP for now, just closing.
            this.closeModal();
        }
    }
  }

  addOption() {
      const val = this.newOptionValue();
      const id = this.editingAttributeId();
      if (!val || !id) return;

      this.attributeService.addOption(id, val).subscribe({
          next: (newOptId) => {
              this.toastService.show('Opcja dodana', 'success');
              // Optimistic update or reload
               this.editingAttributeOptions.update(opts => [...opts, { id: newOptId, value: val }]);
               this.newOptionValue.set('');
               this.loadAttributes(); // Reload to sync
          },
          error: () => this.toastService.show('Błąd dodawania opcji', 'error')
      });
  }

  deleteOption(id: number) {
      if (!confirm('Czy na pewno chcesz usunąć tę opcję?')) return;

      this.attributeService.deleteOption(id).subscribe({
          next: () => {
              this.toastService.show('Opcja usunięta', 'success');
              this.editingAttributeOptions.update(opts => opts.filter(o => o.id !== id));
              this.loadAttributes();
          },
          error: (err) => {
              if (err.error?.detail) {
                  this.toastService.show(err.error.detail, 'error');
              } else {
                  this.toastService.show('Błąd usuwania opcji', 'error');
              }
          }
      });
  }
}
