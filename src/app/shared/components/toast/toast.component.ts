import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../../core/services/toast.service';
import { LucideAngularModule, CheckCircle, AlertCircle, Info, X } from 'lucide-angular';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="fixed top-4 left-1/2 -translate-x-1/2 z-[200] flex flex-col gap-3 w-full max-w-sm pointer-events-none px-4">
      @for (toast of toastService.toasts(); track toast.id) {
        <div 
          class="pointer-events-auto bg-white rounded-xl shadow-xl border border-slate-100 p-4 flex items-center gap-3 toast-enter"
          [class.border-green-100]="toast.type === 'success'"
          [class.border-red-100]="toast.type === 'error'"
          [class.bg-green-50]="toast.type === 'success'"
          [class.bg-red-50]="toast.type === 'error'"
        >
          <!-- Icon -->
          @if (toast.type === 'success') {
             <div class="bg-green-100 text-green-600 p-1.5 rounded-full shrink-0">
               <lucide-icon [name]="CheckCircleIcon" class="w-5 h-5"></lucide-icon>
             </div>
          } @else if (toast.type === 'error') {
             <div class="bg-red-100 text-red-600 p-1.5 rounded-full shrink-0">
               <lucide-icon [name]="AlertCircleIcon" class="w-5 h-5"></lucide-icon>
             </div>
          } @else {
             <div class="bg-blue-100 text-blue-600 p-1.5 rounded-full shrink-0">
               <lucide-icon [name]="InfoIcon" class="w-5 h-5"></lucide-icon>
             </div>
          }

          <!-- Message -->
          <div class="flex-grow text-sm font-medium text-slate-800">
            {{ toast.message }}
          </div>

          <!-- Close -->
          <button (click)="toastService.remove(toast.id)" class="text-slate-400 hover:text-slate-600 transition-colors">
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
  readonly InfoIcon = Info;
  readonly XIcon = X;
}
