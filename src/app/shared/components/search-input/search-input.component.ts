import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Search } from 'lucide-angular';

@Component({
  selector: 'app-search-input',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="relative group w-full" [class]="containerClass">
      <input
        type="text"
        [value]="value"
        (input)="onInput($event)"
        (keyup.enter)="onEnter()"
        (focus)="onFocus()"
        (blur)="onBlur()"
        [placeholder]="placeholder"
        class="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-2.5 pl-12 pr-4 focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-primary/20 text-slate-900 dark:text-white transition-all outline-none shadow-sm placeholder:text-slate-400 text-sm"
        [class]="inputClass"
      />
      <lucide-icon
        [name]="SearchIcon"
        class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors cursor-pointer"
        (click)="onEnter()"
      ></lucide-icon>
      
      <ng-content></ng-content>
    </div>
  `
})
export class SearchInputComponent {
  @Input() value: string = '';
  @Input() placeholder: string = 'Szukaj...';
  @Input() containerClass: string = '';
  @Input() inputClass: string = '';
  
  @Output() valueChange = new EventEmitter<string>();
  @Output() search = new EventEmitter<void>();
  @Output() focus = new EventEmitter<void>();
  @Output() blur = new EventEmitter<void>();

  readonly SearchIcon = Search;

  onInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.value = val;
    this.valueChange.emit(val);
  }

  onEnter() {
    this.search.emit();
  }

  onFocus() {
    this.focus.emit();
  }

  onBlur() {
    // Small delay to allow clicking suggestions before blur hides them
    setTimeout(() => this.blur.emit(), 200);
  }
}
