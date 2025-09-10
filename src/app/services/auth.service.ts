
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, authState, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User, getIdTokenResult, IdTokenResult } from '@angular/fire/auth';
import { Observable, of, from } from 'rxjs';
import { map, switchMap, shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public readonly user$: Observable<User | null>;
  public readonly isAdmin$: Observable<boolean>;

  constructor(private auth: Auth, private router: Router) {
    this.user$ = authState(this.auth);

    this.isAdmin$ = this.user$.pipe(
      switchMap(user => {
        if (!user) {
          return of(false);
        }
        return from(getIdTokenResult(user, true)).pipe(
          map((tokenResult: IdTokenResult) => (tokenResult.claims['admin'] === true))
        );
      }),
      shareReplay(1)
    );
  }

  isLoggedIn(): Observable<boolean> {
    return this.user$.pipe(map(user => !!user));
  }

  isUser(): Observable<boolean> {
    return this.user$.pipe(map(user => !!user));
  }

  isAdmin(): Observable<boolean> {
    return this.isAdmin$;
  }

  async login(email: string, password: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(this.auth, email, password);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async register(email: string, password: string): Promise<void> {
    try {
      await createUserWithEmailAndPassword(this.auth, email, password);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    await signOut(this.auth);
    this.router.navigate(['/login']);
  }
}
