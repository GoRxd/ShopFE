import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { LucideAngularModule, UserPlus, Mail, Lock, User, Phone, Eye, EyeOff, Loader2, ChevronRight } from 'lucide-angular';

import { TranslatePipe } from '../../../core/pipes/translate.pipe';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule, TranslatePipe],
  templateUrl: './register.html',
  styleUrls: []
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Icons
  readonly UserPlusIcon = UserPlus;
  readonly MailIcon = Mail;
  readonly LockIcon = Lock;
  readonly UserIcon = User;
  readonly PhoneIcon = Phone;
  readonly EyeIcon = Eye;
  readonly EyeOffIcon = EyeOff;
  readonly LoaderIcon = Loader2;
  readonly ArrowIcon = ChevronRight;

  // Form State
  dto = {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: ''
  };
  
  showPassword = signal(false);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  async onRegister() {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.register(this.dto).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Wystąpił błąd podczas rejestracji. Spróbuj ponownie.');
      }
    });
  }
}
