import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../../core/services/toast.service';
import { LucideAngularModule, CheckCircle, AlertCircle, Info, X, AlertTriangle } from 'lucide-angular';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="fixed top-4 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-3 w-full max-w-sm pointer-events-none px-4">
      @for (toast of toastService.toasts(); track toast.id) {
        <div 
          class="pointer-events-auto bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800 p-4 flex items-center gap-3 toast-enter"
          [class.border-green-100]="toast.type === 'success'"
          [class.dark:border-green-900/30]="toast.type === 'success'"
          [class.border-red-100]="toast.type === 'error'"
          [class.dark:border-red-900/30]="toast.type === 'error'"
          [class.bg-green-50]="toast.type === 'success'"
          [class.dark:bg-green-950/20]="toast.type === 'success'"
          [class.bg-red-50]="toast.type === 'error'"
          [class.dark:bg-red-950/20]="toast.type === 'error'"
          [class.border-amber-100]="toast.type === 'warning'"
          [class.dark:border-amber-900/30]="toast.type === 'warning'"
          [class.bg-amber-50]="toast.type === 'warning'"
          [class.dark:bg-amber-950/20]="toast.type === 'warning'"
        >
          <!-- Icon -->
          @if (toast.type === 'success') {
             <div class="bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 p-1.5 rounded-full shrink-0">
               <lucide-icon [name]="CheckCircleIcon" class="w-5 h-5"></lucide-icon>
             </div>
          } @else if (toast.type === 'error') {
             <div class="bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 p-1.5 rounded-full shrink-0">
               <lucide-icon [name]="AlertCircleIcon" class="w-5 h-5"></lucide-icon>
             </div>
          } @else if (toast.type === 'warning') {
             <div class="bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 p-1.5 rounded-full shrink-0">
               <lucide-icon [name]="AlertTriangleIcon" class="w-5 h-5"></lucide-icon>
             </div>
          } @else {
             <div class="bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 p-1.5 rounded-full shrink-0">
               <lucide-icon [name]="InfoIcon" class="w-5 h-5"></lucide-icon>
             </div>
          }

          <!-- Message -->
          <div class="flex-grow text-sm font-medium text-slate-800 dark:text-slate-200">
            {{ toast.message }}
          </div>

          <!-- Close -->
          <button (click)="toastService.remove(toast.id)" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
            <lucide-icon [name]="XIcon" class="w-4 h-4"></lucide-icon>
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    .toast-enter {
      animation: slideDown 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);

  readonly CheckCircleIcon = CheckCircle;
  readonly AlertCircleIcon = AlertCircle;
  readonly AlertTriangleIcon = AlertTriangle;
  readonly InfoIcon = Info;
  readonly XIcon = X;
}
