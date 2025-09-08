import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from '@angular/fire/auth';
import { from, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private router: Router = inject(Router);
  currentUser$: Observable<User | null>;

  constructor() {
    this.currentUser$ = new Observable(observer => {
      onAuthStateChanged(this.auth, user => {
        observer.next(user);
      });
    });
  }

  login(email: string, password: string) {
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }

  googleLogin() {
    const provider = new GoogleAuthProvider();
    return from(signInWithPopup(this.auth, provider));
  }

  logout(): Promise<void> {
    return signOut(this.auth).then(() => {
      this.router.navigate(['/login']);
    });
  }

  isAuthenticated(): Observable<boolean> {
    return this.currentUser$.pipe(
      switchMap(user => of(!!user))
    );
  }

  // Method to check authentication and redirect if needed
  requireAuth(): void {
    this.isAuthenticated().subscribe(isAuth => {
      if (!isAuth) {
        this.router.navigate(['/login']);
      }
    });
  }
}
