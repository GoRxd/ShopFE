import { Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus, Check, X } from 'lucide-angular';
import { ShoppingListService } from '../../../../core/services/shopping-list.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-add-to-shopping-list',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    @if (isOpen()) {
      <div class="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" (click)="close()"></div>
        
        <!-- Modal -->
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          
          <!-- Header -->
          <div class="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
            <h3 class="font-bold text-lg text-slate-800 dark:text-white">Dodaj do listy</h3>
            <button (click)="close()" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
               <lucide-icon [name]="XIcon" class="w-5 h-5 text-slate-400 dark:text-slate-500"></lucide-icon>
            </button>
          </div>

          <!-- Body -->
          <div class="p-6 space-y-6">
            
            <!-- Existing Lists -->
            @if (listService.myLists().length > 0) {
              <div class="space-y-3">
                 <p class="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Wybierz istniejącą listę</p>
                 <div class="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                   @for (list of listService.myLists(); track list.id) {
                     <button 
                      (click)="addToList(list.id)"
                      class="w-full text-left p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary dark:hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 hover:text-primary dark:hover:text-primary transition-all group flex justify-between items-center bg-white dark:bg-slate-900"
                     >
                        <span class="font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary">{{ list.name }}</span>
                        <lucide-icon [name]="PlusIcon" class="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity"></lucide-icon>
                     </button>
                   }
                 </div>
              </div>
            }

            <!-- Create New -->
            <div>
               <label class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Lub utwórz nową listę</label>
               <div class="flex gap-3">
                  <input 
                    type="text" 
                    [(ngModel)]="newListName"
                    name="newListName" 
                    (keyup.enter)="createListAndAdd()"
                    placeholder="Np. Prezenty, Wakacje..."
                    class="flex-grow border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-primary focus:border-primary bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 transition-colors py-3 px-4 outline-none"
                    autofocus
                  >
                  <button 
                    (click)="createListAndAdd()"
                    [disabled]="!newListName.trim()"
                    class="bg-slate-900 dark:bg-primary text-white px-5 py-2.5 rounded-lg font-bold hover:bg-slate-800 dark:hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Dodaj
                  </button>
               </div>
            </div>

          </div>
        </div>
      </div>
    }
  `
})
export class AddToShoppingListComponent {
  productId = input.required<number>();
  isOpen = input<boolean>(false);
  closeModal = output<void>();

  listService = inject(ShoppingListService);
  toastService = inject(ToastService);

  newListName = '';
  
  readonly PlusIcon = Plus;
  readonly CheckIcon = Check;
  readonly XIcon = X;

  close() {
    this.closeModal.emit();
    this.newListName = '';
  }

  async addToList(listId: number) {
      await this.listService.addItemToList(listId, this.productId());
      this.toastService.success('Produkt został dodany do listy!');
      this.close();
  }

  async createListAndAdd() {
      if (!this.newListName.trim()) return;
      
      const newId = await this.listService.createList(this.newListName);
      await this.addToList(newId);
  }
}
