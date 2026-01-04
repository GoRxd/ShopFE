import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmService } from '../../../core/services/confirm.service';
import { LucideAngularModule, AlertTriangle, Info, HelpCircle } from 'lucide-angular';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    @if (confirmService.isOpen()) {
      <div class="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6">
        <!-- Backdrop -->
        <div 
          class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
          (click)="confirmService.cancel()"
        ></div>
        
        <!-- Modal -->
        <div 
          class="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-scale-up"
          (click)="$event.stopPropagation()"
        >
          <!-- Header/Icon -->
          <div class="p-6 pb-0 flex flex-col items-center text-center">
             <div 
               class="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors"
               [ngClass]="{
                 'bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400': confirmService.options().type === 'danger',
                 'bg-blue-50 text-blue-500 dark:bg-blue-900/20 dark:text-blue-400': confirmService.options().type === 'info',
                 'bg-amber-50 text-amber-500 dark:bg-amber-900/20 dark:text-amber-400': confirmService.options().type === 'warning'
               }"
             >
                @if (confirmService.options().type === 'danger') {
                  <lucide-icon [name]="AlertIcon" class="w-8 h-8"></lucide-icon>
                } @else if (confirmService.options().type === 'info') {
                  <lucide-icon [name]="InfoIcon" class="w-8 h-8"></lucide-icon>
                } @else {
                  <lucide-icon [name]="HelpIcon" class="w-8 h-8"></lucide-icon>
                }
             </div>
             
             <h2 class="text-xl font-black text-slate-900 dark:text-white mb-2">
               {{ confirmService.options().title }}
             </h2>
             <p class="text-slate-500 dark:text-slate-400 font-medium">
               {{ confirmService.options().message }}
             </p>
          </div>

          <!-- Actions -->
          <div class="p-6 flex flex-col sm:flex-row gap-3 mt-4">
             <button 
               (click)="confirmService.cancel()"
               class="flex-1 px-6 py-3.5 rounded-2xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all active:scale-[0.98]"
             >
               {{ confirmService.options().cancelText }}
             </button>
             <button 
               (click)="confirmService.confirm()"
               class="flex-1 px-6 py-3.5 rounded-2xl font-bold text-white transition-all active:scale-[0.98] shadow-lg"
               [ngClass]="{
                 'bg-red-500 hover:bg-red-600 shadow-red-200 dark:shadow-red-900/20': confirmService.options().type === 'danger',
                 'bg-primary hover:bg-primary-dark shadow-primary/20': confirmService.options().type === 'info',
                 'bg-amber-500 hover:bg-amber-600 shadow-amber-200 dark:shadow-amber-900/20': confirmService.options().type === 'warning'
               }"
             >
               {{ confirmService.options().confirmText }}
             </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes scaleUp {
      from { 
        opacity: 0;
        transform: scale(0.95) translateY(10px);
      }
      to { 
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }
    .animate-fade-in {
      animation: fadeIn 0.3s ease-out forwards;
    }
    .animate-scale-up {
      animation: scaleUp 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
    }
  `]
})
export class ConfirmModalComponent {
  confirmService = inject(ConfirmService);

  readonly AlertIcon = AlertTriangle;
  readonly InfoIcon = Info;
  readonly HelpIcon = HelpCircle;

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (!this.confirmService.isOpen()) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      this.confirmService.cancel();
    } else if (event.key === 'Enter') {
      event.preventDefault();
      this.confirmService.confirm();
    }
  }
}
