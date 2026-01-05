import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule, User, Phone, MapPin, Plus, Trash2, Edit, Save, X, Mail } from 'lucide-angular';
import { UserService } from '../../../core/services/user.service';
import { UserProfile, UpdateProfileDto } from '../../../core/models/user.model';
import { Address, CreateAddressDto } from '../../../core/models/address.model';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmService } from '../../../core/services/confirm.service';

@Component({
  selector: 'app-account-addresses',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  template: `
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 class="text-3xl font-black text-slate-900 dark:text-white mb-2">Moje konto</h1>
        <p class="text-slate-500 dark:text-slate-400">Zarządzaj swoimi danymi i adresami dostawy.</p>
      </div>

      <!-- Personal Data -->
      <section class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div class="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div class="flex items-center gap-3">
             <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <lucide-icon [name]="UserIcon" class="w-5 h-5"></lucide-icon>
             </div>
             <div>
               <h2 class="font-bold text-slate-900 dark:text-white">Dane osobowe</h2>
               <p class="text-sm text-slate-500 dark:text-slate-400">Twoje podstawowe informacje kontaktowe</p>
             </div>
          </div>
          @if (!isEditingProfile()) {
            <button (click)="startEditingProfile()" class="flex items-center gap-2 text-sm font-bold text-primary hover:underline">
              <lucide-icon [name]="EditIcon" class="w-4 h-4"></lucide-icon>
              Edytuj
            </button>
          }
        </div>
        
        <div class="p-6">
          @if (isEditingProfile()) {
            <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="text-sm font-bold text-slate-700 dark:text-slate-300">Imię</label>
                <input formControlName="firstName" type="text" 
                  class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 outline-none transition-all">
              </div>
              <div class="space-y-2">
                <label class="text-sm font-bold text-slate-700 dark:text-slate-300">Nazwisko</label>
                <input formControlName="lastName" type="text"
                  class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 outline-none transition-all">
              </div>
              <div class="space-y-2">
                <label class="text-sm font-bold text-slate-700 dark:text-slate-300">Telefon</label>
                <input formControlName="phone" type="tel"
                  class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 outline-none transition-all">
              </div>
              <div class="col-span-1 md:col-span-2 flex justify-end gap-3 pt-4">
                <button type="button" (click)="cancelEditingProfile()" class="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">Anuluj</button>
                <button type="submit" [disabled]="profileForm.invalid || isSubmitting()" class="px-6 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all disabled:opacity-50">
                  {{ isSubmitting() ? 'Zapisywanie...' : 'Zapisz zmiany' }}
                </button>
              </div>
            </form>
          } @else {
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                   <lucide-icon [name]="UserIcon" class="w-5 h-5"></lucide-icon>
                </div>
                <div>
                  <div class="text-xs text-slate-500 font-bold uppercase tracking-wider">Imię i nazwisko</div>
                  <div class="font-bold text-slate-900 dark:text-white">{{ profile()?.firstName }} {{ profile()?.lastName }}</div>
                </div>
              </div>
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                   <lucide-icon [name]="MailIcon" class="w-5 h-5"></lucide-icon>
                </div>
                <div>
                  <div class="text-xs text-slate-500 font-bold uppercase tracking-wider">Email</div>
                  <div class="font-bold text-slate-900 dark:text-white">{{ profile()?.email }}</div>
                </div>
              </div>
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                   <lucide-icon [name]="PhoneIcon" class="w-5 h-5"></lucide-icon>
                </div>
                <div>
                  <div class="text-xs text-slate-500 font-bold uppercase tracking-wider">Telefon</div>
                  <div class="font-bold text-slate-900 dark:text-white">{{ profile()?.phone || 'Nie podano' }}</div>
                </div>
              </div>
            </div>
          }
        </div>
      </section>

      <!-- Addresses -->
      <section class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div class="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div class="flex items-center gap-3">
             <div class="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <lucide-icon [name]="MapPinIcon" class="w-5 h-5"></lucide-icon>
             </div>
             <div>
               <h2 class="font-bold text-slate-900 dark:text-white">Adresy</h2>
               <p class="text-sm text-slate-500 dark:text-slate-400">Twoje adresy do wysyłki i faktur</p>
             </div>
          </div>
          @if (!isAddingAddress()) {
            <button (click)="showAddAddressForm()" class="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all">
              <lucide-icon [name]="PlusIcon" class="w-4 h-4"></lucide-icon>
              Dodaj nowy adres
            </button>
          }
        </div>

        <div class="p-6">
          @if (isAddingAddress()) {
            <form [formGroup]="addressForm" (ngSubmit)="saveAddress()" class="space-y-6 mb-8 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <!-- Name & Surname -->
                <div class="space-y-2">
                  <label class="text-sm font-bold text-slate-700 dark:text-slate-300">Imię odbiorcy</label>
                  <input formControlName="firstName" type="text" placeholder="Jan"
                    class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-bold text-slate-700 dark:text-slate-300">Nazwisko odbiorcy</label>
                  <input formControlName="lastName" type="text" placeholder="Kowalski"
                    class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                </div>

                <!-- Company Info (Optional) -->
                <div class="space-y-2">
                  <label class="text-sm font-bold text-slate-700 dark:text-slate-300">Firma (opcjonalnie)</label>
                  <input formControlName="companyName" type="text" placeholder="Moja Firma Sp. z o.o."
                    class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-bold text-slate-700 dark:text-slate-300">NIP (opcjonalnie)</label>
                  <input formControlName="nip" type="text" placeholder="1234567890"
                    class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                </div>

                <!-- Address -->
                <div class="space-y-2 col-span-1 md:col-span-2">
                  <label class="text-sm font-bold text-slate-700 dark:text-slate-300">Ulica</label>
                  <input formControlName="street" type="text" placeholder="np. ul. Marszałkowska"
                    class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                </div>
                <div class="grid grid-cols-2 gap-4 col-span-1 md:col-span-2">
                  <div class="space-y-2">
                    <label class="text-sm font-bold text-slate-700 dark:text-slate-300">Nr domu</label>
                    <input formControlName="houseNumber" type="text" placeholder="10"
                      class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                  </div>
                  <div class="space-y-2">
                    <label class="text-sm font-bold text-slate-700 dark:text-slate-300">Nr lokalu (opcj.)</label>
                    <input formControlName="apartmentNumber" type="text" placeholder="2"
                      class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                  </div>
                </div>

                <div class="space-y-2">
                  <label class="text-sm font-bold text-slate-700 dark:text-slate-300">Kod pocztowy</label>
                  <input formControlName="zipCode" type="text" placeholder="00-000"
                    class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-bold text-slate-700 dark:text-slate-300">Miasto</label>
                  <input formControlName="city" type="text" placeholder="Warszawa"
                    class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-bold text-slate-700 dark:text-slate-300">Kraj</label>
                  <input formControlName="country" type="text" placeholder="Polska"
                    class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                </div>
                <div class="space-y-2">
                  <label class="text-sm font-bold text-slate-700 dark:text-slate-300">Telefon kontaktowy</label>
                  <input formControlName="phone" type="text" placeholder="+48 000 000 000"
                    class="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                </div>

                <!-- Defaults -->
                <div class="col-span-1 md:col-span-2 flex gap-6 mt-4">
                  <label class="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" formControlName="isDefaultShipping" class="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary">
                    <span class="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors">Domyślny adres dostawy</span>
                  </label>
                  <label class="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" formControlName="isDefaultBilling" class="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary">
                    <span class="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors">Domyślny adres rozliczeniowy</span>
                  </label>
                </div>
              </div>

              <div class="flex justify-end gap-3 pt-6 border-t border-slate-100 dark:border-slate-700">
                <button type="button" (click)="cancelAddingAddress()" class="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">Anuluj</button>
                <button type="submit" [disabled]="addressForm.invalid || isSubmitting()" class="px-6 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all disabled:opacity-50">
                    {{ isSubmitting() ? 'Zapisywanie...' : 'Zapisz nowy adres' }}
                </button>
              </div>
            </form>
          }

          @if (addresses().length === 0 && !isAddingAddress()) {
            <div class="text-center py-12">
              <div class="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-300">
                <lucide-icon [name]="MapPinIcon" class="w-8 h-8"></lucide-icon>
              </div>
              <p class="text-slate-500 dark:text-slate-400 font-bold">Brak zapisanych adresów</p>
              <p class="text-sm text-slate-400 dark:text-slate-500">Dodaj swój pierwszy adres dostawy, aby szybciej składać zamówienia.</p>
            </div>
          } @else if (!isAddingAddress()) {
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
              @for (address of addresses(); track address.id) {
                <div class="p-6 rounded-2xl border bg-white dark:bg-slate-900 shadow-sm transition-all relative overflow-hidden flex flex-col h-full"
                  [ngClass]="{'border-primary shadow-md': address.isDefaultShipping || address.isDefaultBilling, 'border-slate-100 dark:border-slate-800': !(address.isDefaultShipping || address.isDefaultBilling)}">
                  
                  @if (address.isDefaultShipping || address.isDefaultBilling) {
                    <div class="absolute top-0 right-0 py-1 px-4 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-bl-xl shadow-sm">
                      Domyślny
                    </div>
                  }

                  <div class="flex items-start justify-between mb-4">
                    <div class="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                      <lucide-icon [name]="MapPinIcon" class="w-6 h-6"></lucide-icon>
                    </div>
                    <div class="flex gap-2">
                       <button (click)="deleteAddress(address.id)" class="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all" title="Usuń adres">
                        <lucide-icon [name]="TrashIcon" class="w-5 h-5"></lucide-icon>
                      </button>
                    </div>
                  </div>

                  <div class="flex-grow">
                    <div class="font-black text-slate-900 dark:text-white text-lg mb-1">{{ address.firstName }} {{ address.lastName }}</div>
                    @if (address.companyName) {
                      <div class="text-slate-600 dark:text-slate-400 font-bold">{{ address.companyName }}</div>
                      <div class="text-xs text-slate-400 dark:text-slate-500 mb-2 italic">NIP: {{ address.nip }}</div>
                    }
                    <div class="text-slate-700 dark:text-slate-300 font-medium">
                      {{ address.street }} {{ address.houseNumber }}{{ address.apartmentNumber ? '/' + address.apartmentNumber : '' }}
                    </div>
                    <div class="text-slate-700 dark:text-slate-300 font-medium mb-2">
                      {{ address.zipCode }} {{ address.city }}
                    </div>
                    <div class="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-bold">
                       <lucide-icon [name]="PhoneIcon" class="w-3.5 h-3.5"></lucide-icon>
                       {{ address.phone }}
                    </div>
                  </div>

                  <!-- Action Buttons -->
                  <div class="mt-6 pt-6 border-t border-slate-50 dark:border-slate-800 grid grid-cols-2 gap-3">
                    <button (click)="setDefault(address.id, 'Shipping')" 
                      class="px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border flex items-center justify-center gap-2"
                      [ngClass]="address.isDefaultShipping ? 'bg-primary text-white border-transparent shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-primary hover:text-primary'">
                      Dostawa
                      @if (address.isDefaultShipping) {
                         <div class="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                      }
                    </button>
                    <button (click)="setDefault(address.id, 'Billing')" 
                      class="px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border flex items-center justify-center gap-2"
                      [ngClass]="address.isDefaultBilling ? 'bg-blue-600 text-white border-transparent shadow-[0_0_15px_rgba(37,99,235,0.3)]' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-primary hover:text-primary'">
                      Rozliczenia
                      @if (address.isDefaultBilling) {
                         <div class="w-2 h-2 rounded-full bg-white animate-pulse"></div>
                      }
                    </button>
                  </div>
                </div>
              }
            </div>
          }
        </div>
      </section>
    </div>
  `
})
export class AccountAddressesComponent implements OnInit {
  private userService = inject(UserService);
  private fb = inject(FormBuilder);
  private toastService = inject(ToastService);

  profile = signal<UserProfile | null>(null);
  addresses = signal<Address[]>([]);
  
  isEditingProfile = signal(false);
  isAddingAddress = signal(false);
  isSubmitting = signal(false);

  profileForm: FormGroup;
  addressForm: FormGroup;

  UserIcon = User;
  PhoneIcon = Phone;
  MapPinIcon = MapPin;
  PlusIcon = Plus;
  TrashIcon = Trash2;
  EditIcon = Edit;
  SaveIcon = Save;
  XIcon = X;
  MailIcon = Mail;

  constructor() {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9+ ]{9,15}$/)]]
    });

    this.addressForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      companyName: [''],
      nip: [''],
      street: ['', [Validators.required]],
      houseNumber: ['', [Validators.required]],
      apartmentNumber: [''],
      city: ['', [Validators.required]],
      zipCode: ['', [Validators.required, Validators.pattern(/^[0-9]{2}-[0-9]{3}$/)]],
      country: ['Polska', [Validators.required]],
      phone: ['', [Validators.required]],
      addressType: ['Shipping'],
      isDefaultShipping: [false],
      isDefaultBilling: [false]
    });
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.userService.getProfile().subscribe(profile => {
      this.profile.set(profile);
    });
    this.userService.getAddresses().subscribe(addresses => {
      this.addresses.set(addresses);
    });
  }

  startEditingProfile() {
    const current = this.profile();
    if (current) {
      this.profileForm.patchValue({
        firstName: current.firstName,
        lastName: current.lastName,
        phone: current.phone
      });
      this.isEditingProfile.set(true);
    }
  }

  cancelEditingProfile() {
    this.isEditingProfile.set(false);
  }

  saveProfile() {
    if (this.profileForm.invalid) return;

    this.isSubmitting.set(true);
    this.userService.updateProfile(this.profileForm.value).subscribe({
      next: () => {
        this.toastService.success('Dane zostały zaktualizowane');
        this.isEditingProfile.set(false);
        this.isSubmitting.set(false);
        this.loadData();
      },
      error: () => {
        this.toastService.error('Wystąpił błąd podczas zapisywania');
        this.isSubmitting.set(false);
      }
    });
  }

  showAddAddressForm() {
    const p = this.profile();
    this.addressForm.reset({ 
      firstName: p?.firstName || '',
      lastName: p?.lastName || '',
      country: 'Polska',
      addressType: 'Shipping',
      isDefaultShipping: false,
      isDefaultBilling: false
    });
    this.isAddingAddress.set(true);
  }

  cancelAddingAddress() {
    this.isAddingAddress.set(false);
  }

  saveAddress() {
    if (this.addressForm.invalid) return;

    this.isSubmitting.set(true);
    this.userService.addAddress(this.addressForm.value).subscribe({
      next: () => {
        this.toastService.success('Adres został dodany');
        this.isAddingAddress.set(false);
        this.isSubmitting.set(false);
        this.loadData();
      },
      error: () => {
        this.toastService.error('Wystąpił błąd podczas dodawania adresu');
        this.isSubmitting.set(false);
      }
    });
  }

  setDefault(id: number, type: 'Shipping' | 'Billing') {
    const isShipping = type === 'Shipping';
    
    // Optimistic update
    this.addresses.update(items => {
      const target = items.find(a => a.id === id);
      if (!target) return items;

      const wasAlreadyDefault = isShipping ? target.isDefaultShipping : target.isDefaultBilling;
      
      return items.map(a => {
        // Toggle the clicked address
        if (a.id === id) {
          return { 
            ...a, 
            [isShipping ? 'isDefaultShipping' : 'isDefaultBilling']: !wasAlreadyDefault 
          };
        }
        
        // If we were SETTING a new default (wasAlreadyDefault was false), 
        // we must unset other defaults of the same type.
        // If we were UNSETTING (wasAlreadyDefault was true), we don't touch others.
        if (!wasAlreadyDefault) {
          return { 
            ...a, 
            [isShipping ? 'isDefaultShipping' : 'isDefaultBilling']: false 
          };
        }
        
        return a;
      });
    });

    this.userService.setDefaultAddress(id, type).subscribe({
      next: () => {
        this.toastService.success('Zaktualizowano preferencje adresowe');
        this.loadData();
      },
      error: () => {
        this.toastService.error('Nie udało się zapisać zmian');
        this.loadData(); // Revert to server state
      }
    });
  }

  private confirmService = inject(ConfirmService);

  async deleteAddress(id: number) {
    if (await this.confirmService.ask('Czy na pewno chcesz usunąć ten adres? Operacji nie można cofnąć.', {
      title: 'Usuwanie adresu',
      confirmText: 'Tak, usuń',
      type: 'danger'
    })) {
      this.userService.removeAddress(id).subscribe({
        next: () => {
          this.toastService.success('Adres został usunięty');
          this.loadData();
        },
        error: () => {
          this.toastService.error('Wystąpił błąd podczas usuwania adresu');
        }
      });
    }
  }
}
