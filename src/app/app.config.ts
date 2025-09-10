
import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.route';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getFunctions, provideFunctions } from '@angular/fire/functions';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

// --- NG-ZORRO Imports for Icons and Localization ---
import { provideNzI18n, en_US } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { NZ_ICONS, NzIconModule } from 'ng-zorro-antd/icon';
import { UserOutline, LockOutline, MailOutline, DollarOutline, UserAddOutline } from '@ant-design/icons-angular/icons';

registerLocaleData(en);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideFunctions(() => getFunctions()),
    provideAnimations(),
    provideHttpClient(),
    provideNzI18n(en_US),
    importProvidersFrom(MatSnackBarModule),
    // --- Provide the specific icons your app needs ---
    importProvidersFrom(NzIconModule),
    { provide: NZ_ICONS, useValue: [UserOutline, LockOutline, MailOutline, DollarOutline, UserAddOutline] }
  ]
};
