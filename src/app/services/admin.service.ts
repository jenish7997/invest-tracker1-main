
import { Injectable } from '@angular/core';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  constructor(private functions: Functions, private snackBar: MatSnackBar) {}

  async setAdminClaim(email: string): Promise<void> {
    try {
      const setAdminClaim = httpsCallable(this.functions, 'setAdminClaim');
      const result = await setAdminClaim({ email });
      this.snackBar.open(result.data['message'], 'Close', { duration: 3000 });
    } catch (error) {
      console.error('Error setting admin claim:', error);
      this.snackBar.open('An error occurred while setting the admin claim.', 'Close', {
        duration: 3000,
      });
    }
  }
}
