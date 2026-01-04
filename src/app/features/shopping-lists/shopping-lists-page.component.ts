import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Plus, Trash2, List } from 'lucide-angular';
import { ShoppingListService } from '../../core/services/shopping-list.service';
import { ConfirmService } from '../../core/services/confirm.service';

@Component({
  selector: 'app-shopping-lists-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LucideAngularModule],
  templateUrl: './shopping-lists-page.component.html'
})
export class ShoppingListsPageComponent implements OnInit {
  listService = inject(ShoppingListService);
  confirmService = inject(ConfirmService);
  
  newListName = '';
  readonly PlusIcon = Plus;
  readonly TrashIcon = Trash2;
  readonly ListIcon = List;

  ngOnInit() {
    this.listService.loadLists();
  }

  async createList() {
    if (!this.newListName.trim()) return;
    await this.listService.createList(this.newListName);
    this.newListName = '';
  }

  async deleteList(event: Event, id: number) {
    event.stopPropagation(); // Prevent navigation
    const confirmed = await this.confirmService.ask('Czy na pewno chcesz usunąć tę listę?', {
      title: 'Usuwanie listy'
    });
    
    if (confirmed) {
       await this.listService.deleteList(id);
    }
  }
}
