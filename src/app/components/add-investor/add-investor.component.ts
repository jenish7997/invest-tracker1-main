
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { getAuth, getIdToken } from '@angular/fire/auth'; // Import Firebase auth functions

@Component({
  selector: 'app-add-investor',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './add-investor.component.html',
  styleUrls: ['./add-investor.component.css']
})
export class AddInvestorComponent implements OnInit {
  investorForm: FormGroup;
  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.investorForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      initialDeposit: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {}

  async onSubmit() {
    if (this.investorForm.valid) {
      this.loading = true;
      this.successMessage = '';
      this.errorMessage = '';
      
      const { name, email, initialDeposit, password } = this.investorForm.value;
      
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        this.errorMessage = "You must be logged in to perform this action.";
        this.loading = false;
        return;
      }
      
      try {
        const idToken = await getIdToken(user);
        const functionUrl = 'https://us-central1-invest-tracker-447ff.cloudfunctions.net/createInvestorUser';

        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ data: { name, email, initialDeposit, password } })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Request failed with status ${response.status}`);
        }

        const result = await response.json();
        this.successMessage = result.data.message || 'Investor profile created successfully!';
        this.investorForm.reset();

      } catch (error: any) {
        this.errorMessage = error.message || 'Registration failed. Please try again.';
        console.error('Registration failed:', error);
      } finally {
        this.loading = false;
      }
    }
  }
}
