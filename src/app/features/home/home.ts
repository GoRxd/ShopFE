import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-custom py-12">
      <div class="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 md:p-20 text-center shadow-sm">
        <h1 class="text-4xl md:text-5xl font-black mb-6 text-slate-900 dark:text-white">Witaj w SHOP<span class="text-primary">X</span></h1>
        <p class="text-slate-500 dark:text-slate-400 max-w-lg mx-auto text-lg leading-relaxed">Trwają prace nad listą produktów. Już niedługo znajdziesz tu najlepszy sprzęt w sieci.</p>
      </div>
    </div>
  `
})
export class HomeComponent {}
