import { ApplicationConfig, provideBrowserGlobalErrorListeners, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { LucideAngularModule, LogIn, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, UserPlus, User, Phone, LogOut, ChevronRight } from 'lucide-angular';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes), 
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    provideClientHydration(withEventReplay()),
    importProvidersFrom(LucideAngularModule.pick({ 
      LogIn, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, UserPlus, User, Phone, LogOut, ChevronRight 
    }))
  ]
};

