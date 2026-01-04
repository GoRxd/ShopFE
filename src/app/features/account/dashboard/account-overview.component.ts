import { Component } from '@angular/core';

@Component({
  selector: 'app-account-overview',
  standalone: true,
  template: `
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 lg:p-12 text-center shadow-sm">
      <div class="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
      <h2 class="text-2xl font-black text-slate-900 dark:text-white mb-4">Twoje centrum dowodzenia</h2>
      <p class="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8">
        Witaj w swoim profilu! Wybierz jedną z opcji z menu, aby zarządzać swoimi zamówieniami, listami zakupowymi oraz danymi konta.
      </p>
    </div>
  `
})
export class AccountOverviewComponent {}
