import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeService, Theme } from '../../../core/services/theme.service';
import { LucideAngularModule, Sun, Moon, Monitor, Shield, Bell, HardDrive } from 'lucide-angular';

@Component({
  selector: 'app-account-settings',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 class="text-3xl font-black text-slate-900 dark:text-white mb-2">Ustawienia konta</h1>
        <p class="text-slate-500 dark:text-slate-400">Zarządzaj swoim profilem i preferencjami aplikacji.</p>
      </div>

      <!-- Theme Selection -->
      <section class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div class="p-6 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-3">
             <div class="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <lucide-icon [name]="SunIcon" class="w-5 h-5"></lucide-icon>
             </div>
             <div>
               <h2 class="font-bold text-slate-900 dark:text-white">Motyw strony</h2>
               <p class="text-sm text-slate-500 dark:text-slate-400">Wybierz preferowany wygląd aplikacji</p>
             </div>
          </div>
        </div>
        
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            @for (option of themeOptions; track option.id) {
              <button 
                (click)="themeService.setTheme(option.id)"
                [class.ring-2]="themeService.theme() === option.id"
                [class.ring-primary]="themeService.theme() === option.id"
                [class.bg-slate-50]="themeService.theme() === option.id"
                [class.dark:bg-slate-800]="themeService.theme() === option.id"
                class="flex flex-col items-center gap-4 p-6 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary/50 dark:hover:border-primary/50 transition-all group"
              >
                <lucide-icon [name]="option.icon" class="w-8 h-8 opacity-50 group-hover:opacity-100 transition-opacity" [class.text-primary]="themeService.theme() === option.id" [class.opacity-100]="themeService.theme() === option.id"></lucide-icon>
                <div class="text-sm font-bold text-slate-900 dark:text-white">{{ option.label }}</div>
              </button>
            }
          </div>
        </div>
      </section>

      <!-- Privacy & Security -->
      <section class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div class="p-6 border-b border-slate-100 dark:border-slate-800">
          <div class="flex items-center gap-3">
             <div class="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <lucide-icon [name]="ShieldIcon" class="w-5 h-5"></lucide-icon>
             </div>
             <div>
               <h2 class="font-bold text-slate-900 dark:text-white">Prywatność i bezpieczeństwo</h2>
               <p class="text-sm text-slate-500 dark:text-slate-400">Chroń swoje dane i kontroluj uprawnienia</p>
             </div>
          </div>
        </div>

        <div class="divide-y divide-slate-100 dark:divide-slate-800">
          @for (setting of privacySettings; track setting.label) {
            <div class="p-6 flex items-center justify-between">
              <div class="flex gap-3">
                <div class="w-10 flex justify-center pt-1.5 flex-shrink-0">
                  <lucide-icon [name]="setting.icon" class="w-5 h-5 text-slate-400"></lucide-icon>
                </div>
                <div>
                  <div class="font-bold text-slate-900 dark:text-white">{{ setting.label }}</div>
                  <div class="text-sm text-slate-500 dark:text-slate-400">{{ setting.description }}</div>
                </div>
              </div>
              <label class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" class="sr-only peer" [checked]="setting.enabled">
                <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
              </label>
            </div>
          }
        </div>
      </section>

      <!-- Danger Zone -->
      <div class="pt-4">
        <button class="text-red-500 font-bold text-sm hover:underline">Usuń moje konto</button>
      </div>
    </div>
  `
})
export class AccountSettingsComponent {
  themeService = inject(ThemeService);

  SunIcon = Sun;
  ShieldIcon = Shield;

  themeOptions: { id: Theme, label: string, icon: any }[] = [
    { id: 'light', label: 'Jasny', icon: Sun },
    { id: 'dark', label: 'Ciemny', icon: Moon },
    { id: 'system', label: 'Systemowy', icon: Monitor }
  ];

  privacySettings = [
    { 
      label: 'Personalizacja reklam', 
      description: 'Zezwalaj na wyświetlanie reklam dopasowanych do Twoich zainteresowań.',
      icon: HardDrive,
      enabled: true 
    },
    { 
      label: 'Powiadomienia email', 
      description: 'Otrzymuj informacje o statusie zamówień i nowych promocjach.',
      icon: Bell,
      enabled: true 
    }
  ];
}
