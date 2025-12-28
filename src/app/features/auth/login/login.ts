import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { LucideAngularModule, LogIn, Mail, Lock, Eye, EyeOff, Loader2, ChevronRight } from 'lucide-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule],
  templateUrl: './login.html',
  styleUrls: []
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Icons
  readonly LogInIcon = LogIn;
  readonly MailIcon = Mail;
  readonly LockIcon = Lock;
  readonly EyeIcon = Eye;
  readonly EyeOffIcon = EyeOff;
  readonly LoaderIcon = Loader2;
  readonly ArrowIcon = ChevronRight;

  // Form State
  email = '';
  password = '';
  showPassword = signal(false);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  togglePassword() {
    this.showPassword.update(v => !v);
  }

  async onLogin() {
    if (!this.email || !this.password) return;
    
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Wystąpił błąd podczas logowania. Sprawdź dane i spróbuj ponownie.');
      }
    });
  }
}
