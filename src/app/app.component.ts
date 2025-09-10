
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from './services/auth.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Investment Tracker';
  isAdmin$: Observable<boolean>;

  constructor(public authService: AuthService) {
    this.isAdmin$ = this.authService.isAdmin$;
  }

  onLogout(): void {
    this.authService.logout();
  }
}
