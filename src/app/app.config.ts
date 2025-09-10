
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.route';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getFunctions, provideFunctions } from '@angular/fire/functions'; // Import Functions provider
import { MatSnackBarModule } from '@angular/material/snack-bar'; // Import MatSnackBarModule
import { importProvidersFrom } from '@angular/core'; // Import helper
import { provideAnimations } from '@angular/platform-browser/animations'; // Import animations provider
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideFunctions(() => getFunctions()), // Add Functions provider
    provideAnimations(), // Add animations provider for Material components
    importProvidersFrom(MatSnackBarModule) // Import MatSnackBar providers
  ]
};
